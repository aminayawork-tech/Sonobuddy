import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { webpush, stripHtml, type PushSubscriptionData } from '@/lib/webpush';
import { getDailyTip } from '@/lib/tips';
import apn from 'apn';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Called by Vercel Cron (see vercel.json). Protected by CRON_SECRET.
export async function GET(req: NextRequest) {
  try {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const tipHtml = getDailyTip();
  const tipText = stripHtml(tipHtml);

  // ── 1. Web Push (browser subscribers) ─────────────────────────────────────
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
          JSON.stringify({ title: 'SonoBuddy Tip of the Day 💡', body: tipText, url: '/home' })
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

  // ── 2. APNs (iOS native app) ───────────────────────────────────────────────
  let apnsSent = 0;
  let apnsFailed = 0;

  const apnsKey = process.env.APNS_KEY;
  const apnsKeyId = process.env.APNS_KEY_ID;
  const apnsTeamId = process.env.APNS_TEAM_ID;

  if (apnsKey && apnsKeyId && apnsTeamId) {
    // Vercel stores multiline env vars with literal \n — restore real newlines
    let apnsKeyPem = apnsKey.replace(/\\n/g, '\n');
    // Add PEM headers if the raw base64 was stored without them
    if (!apnsKeyPem.includes('-----BEGIN')) {
      apnsKeyPem = `-----BEGIN PRIVATE KEY-----\n${apnsKeyPem.trim()}\n-----END PRIVATE KEY-----`;
    }
    const provider = new apn.Provider({
      token: { key: apnsKeyPem, keyId: apnsKeyId, teamId: apnsTeamId },
      production: true,
    });

    let apnsCursor = 0;
    do {
      const [nextCursor, keys] = await redis.scan(apnsCursor, { match: 'apns:*', count: 100 });
      apnsCursor = Number(nextCursor);

      for (const key of keys) {
        const token = await redis.get<string>(key);
        if (!token) continue;

        const note = new apn.Notification();
        note.alert = { title: 'SonoBuddy Tip of the Day 💡', body: tipText };
        note.sound = 'default';
        note.topic = 'com.sonobuddy.app';

        const result = await provider.send(note, token);
        if (result.failed.length > 0) {
          const reason = result.failed[0]?.response?.reason;
          const failDetail = result.failed[0]?.error?.message ?? reason ?? 'unknown';
          if (reason === 'BadDeviceToken' || reason === 'Unregistered') {
            await redis.del(key);
          }
          apnsFailed++;
          return NextResponse.json({ debug: { failReason: failDetail, token: (token as string).slice(0,8)+'…', key } });
        } else {
          apnsSent++;
        }
      }
    } while (apnsCursor !== 0);

    provider.shutdown();
  }

  return NextResponse.json({
    webPush: { sent: webSent, failed: webFailed },
    apns: { sent: apnsSent, failed: apnsFailed },
  });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
