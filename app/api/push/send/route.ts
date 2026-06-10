export const runtime = 'nodejs';
export const maxDuration = 30;

import { NextRequest, NextResponse } from 'next/server';
import http2 from 'http2';
import crypto from 'crypto';
import { Redis } from '@upstash/redis';
import { webpush, stripHtml, type PushSubscriptionData } from '@/lib/webpush';
import { getDailyHook } from '@/lib/tips';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

async function buildApnsJwt(keyPem: string, keyId: string, teamId: string): Promise<string> {
  const pemStripped = keyPem
    .replace(/-----BEGIN.*?-----/g, '')
    .replace(/-----END.*?-----/g, '')
    .replace(/\s/g, '');
  const keyDer = Buffer.from(pemStripped, 'base64');

  const key = await crypto.subtle.importKey(
    'pkcs8',
    keyDer,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign']
  );

  const header = Buffer.from(JSON.stringify({ alg: 'ES256', kid: keyId })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({ iss: teamId, iat: Math.floor(Date.now() / 1000) })).toString('base64url');
  const signingInput = `${header}.${payload}`;

  const sig = await crypto.subtle.sign(
    { name: 'ECDSA', hash: { name: 'SHA-256' } },
    key,
    new TextEncoder().encode(signingInput)
  );

  return `${signingInput}.${Buffer.from(sig).toString('base64url')}`;
}

function sendOneApns(
  deviceToken: string,
  body: string,
  jwt: string,
  bundleId: string,
  production: boolean
): Promise<{ status: number; reason: string | null }> {
  const host = production ? 'api.push.apple.com' : 'api.sandbox.push.apple.com';

  return new Promise((resolve) => {
    const client = http2.connect(`https://${host}`);
    client.on('error', (err) => resolve({ status: 0, reason: `connect:${err.message}` }));

    const req = client.request({
      ':method': 'POST',
      ':path': `/3/device/${deviceToken}`,
      'authorization': `bearer ${jwt}`,
      'apns-push-type': 'alert',
      'apns-topic': bundleId,
      'apns-priority': '10',
      'content-type': 'application/json',
      'content-length': Buffer.byteLength(body).toString(),
    });

    req.write(body);
    req.end();

    let status = 0;
    req.on('response', (headers) => { status = Number(headers[':status']); });

    let data = '';
    req.on('data', (chunk: Buffer) => { data += chunk; });
    req.on('end', () => {
      try { client.close(); } catch { /* ignore */ }
      if (status === 200) {
        resolve({ status: 200, reason: null });
      } else {
        try {
          resolve({ status, reason: JSON.parse(data).reason ?? `HTTP_${status}` });
        } catch {
          resolve({ status, reason: `HTTP_${status}` });
        }
      }
    });

    req.on('error', (err) => {
      try { client.close(); } catch { /* ignore */ }
      resolve({ status: 0, reason: `req:${err.message}` });
    });
  });
}

// Called by Vercel Cron (see vercel.json). Protected by CRON_SECRET.
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const hook = getDailyHook();
    const notifTitle = hook.title;
    const notifBody = hook.preview;
    const notifUrl = hook.articleSlug ? `/articles/${hook.articleSlug}` : '/home';

    // ── 1. Web Push (browser subscribers) ───────────────────────────────────
    let webSent = 0;
    let webFailed = 0;

    let cursor = 0;
    do {
      const [nextCursor, keys] = await redis.scan(cursor, { match: 'push:*', count: 100 });
      cursor = Number(nextCursor);

      for (const key of keys) {
        const raw = await redis.get<string>(key);
        if (!raw) continue;
        let subscription: PushSubscriptionData;
        try {
          subscription = typeof raw === 'string' ? JSON.parse(raw) : raw;
        } catch { continue; }

        try {
          await webpush.sendNotification(
            subscription as unknown as Parameters<typeof webpush.sendNotification>[0],
            JSON.stringify({ title: notifTitle, body: notifBody, url: notifUrl })
          );
          webSent++;
        } catch (err: unknown) {
          if (err && typeof err === 'object' && 'statusCode' in err && (err as { statusCode: number }).statusCode === 410) {
            await redis.del(key);
          }
          webFailed++;
        }
      }
    } while (cursor !== 0);

    // ── 2. APNs (iOS native app) ─────────────────────────────────────────────
    let apnsSent = 0;
    let apnsFailed = 0;

    const apnsKey = process.env.APNS_KEY;
    const apnsKeyId = process.env.APNS_KEY_ID;
    const apnsTeamId = process.env.APNS_TEAM_ID;

    if (apnsKey && apnsKeyId && apnsTeamId) {
      // Restore real newlines if Vercel stored them escaped
      let apnsKeyPem = apnsKey.replace(/\\n/g, '\n');
      if (!apnsKeyPem.includes('-----BEGIN')) {
        apnsKeyPem = `-----BEGIN PRIVATE KEY-----\n${apnsKeyPem.trim()}\n-----END PRIVATE KEY-----`;
      }

      const jwt = await buildApnsJwt(apnsKeyPem, apnsKeyId, apnsTeamId);
      const apnsPayload = JSON.stringify({
        aps: {
          alert: { title: notifTitle, body: notifBody },
          sound: 'default',
        },
        url: notifUrl,
      });

      let apnsCursor = 0;
      do {
        const [nextCursor, keys] = await redis.scan(apnsCursor, { match: 'apns:*', count: 100 });
        apnsCursor = Number(nextCursor);

        for (const key of keys) {
          const token = await redis.get<string>(key);
          if (!token) continue;

          const res = await sendOneApns(token, apnsPayload, jwt, 'app.sonobuddy', true);
          console.log(`APNs token ${token.slice(0, 8)}… → status=${res.status} reason=${res.reason}`);

          if (res.status === 200) {
            apnsSent++;
          } else {
            if (res.reason === 'BadDeviceToken' || res.reason === 'Unregistered') {
              await redis.del(key);
            }
            apnsFailed++;
          }
        }
      } while (apnsCursor !== 0);
    }

    return NextResponse.json({
      webPush: { sent: webSent, failed: webFailed },
      apns: { sent: apnsSent, failed: apnsFailed },
      debug: { hook: hook.title },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
