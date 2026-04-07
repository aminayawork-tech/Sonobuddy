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

  // Scan all push:* keys
  let cursor = 0;
  let sent = 0;
  let failed = 0;

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
        sent++;
      } catch (err: unknown) {
        // 410 Gone = subscription expired, clean it up
        if (err && typeof err === 'object' && 'statusCode' in err && (err as { statusCode: number }).statusCode === 410) {
          await redis.del(key);
        }
        failed++;
      }
    }
  } while (cursor !== 0);

  return NextResponse.json({ sent, failed });
}
