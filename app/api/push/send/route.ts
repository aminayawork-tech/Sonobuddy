import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { webpush, stripHtml, type PushSubscriptionData } from '@/lib/webpush';
import { getDailyTip } from '@/lib/tips';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Called by Vercel Cron (see vercel.json). Protected by CRON_SECRET.
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const tipHtml = getDailyTip();
  const tipText = stripHtml(tipHtml);

  // ── 1. Web Push (browser subscribers stored in Upstash Redis) ─────────────
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
      } catch {
        continue;
      }

      try {
        await webpush.sendNotification(
          subscription as unknown as Parameters<typeof webpush.sendNotification>[0],
          JSON.stringify({
            title: 'SonoBuddy Tip of the Day 💡',
            body: tipText,
            url: '/home',
          })
        );
        webSent++;
      } catch (err: unknown) {
        // 410 Gone = subscription expired, remove it
        if (err && typeof err === 'object' && 'statusCode' in err && (err as { statusCode: number }).statusCode === 410) {
          await redis.del(key);
        }
        webFailed++;
      }
    }
  } while (cursor !== 0);

  // ── 2. OneSignal Push (iOS native app subscribers) ────────────────────────
  let oneSignalResult: { sent?: number; error?: string } = {};

  const oneSignalAppId = process.env.ONESIGNAL_APP_ID;
  const oneSignalApiKey = process.env.ONESIGNAL_API_KEY;

  if (oneSignalAppId && oneSignalApiKey) {
    try {
      const res = await fetch('https://onesignal.com/api/v1/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${oneSignalApiKey}`,
        },
        body: JSON.stringify({
          app_id: oneSignalAppId,
          included_segments: ['All'],
          headings: { en: 'SonoBuddy Tip of the Day 💡' },
          contents: { en: tipText },
          url: 'sono-web:///home/',
        }),
      });

      const json = await res.json() as { recipients?: number; errors?: unknown };
      oneSignalResult = { sent: json.recipients ?? 0 };
    } catch (err) {
      oneSignalResult = { error: String(err) };
    }
  } else {
    oneSignalResult = { error: 'ONESIGNAL_APP_ID or ONESIGNAL_API_KEY not set' };
  }

  return NextResponse.json({
    webPush: { sent: webSent, failed: webFailed },
    oneSignal: oneSignalResult,
  });
}
