import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Android app push registration (Firebase Cloud Messaging). Mirrors
// /api/push/apns-token (iOS). Keys stay out of push:*, which holds web-push
// subscriptions.
//   { token }            → stores fcm:<token>, plus when it last checked in
//   { status, detail }   → logs a registration problem for the daily run log
export async function POST(req: NextRequest) {
  let body: { token?: unknown; status?: unknown; detail?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'bad request' }, { status: 400 });
  }

  if (typeof body.status === 'string') {
    const entry = JSON.stringify({
      at: new Date().toISOString(),
      status: body.status.slice(0, 40),
      detail: typeof body.detail === 'string' ? body.detail.slice(0, 200) : '',
    });
    await redis.lpush('fcmdiag', entry);
    await redis.ltrim('fcmdiag', 0, 49);
    return NextResponse.json({ ok: true });
  }

  const token = body.token;
  if (typeof token !== 'string' || token.length < 20 || token.length > 4096) {
    return NextResponse.json({ error: 'missing token' }, { status: 400 });
  }
  await redis.set(`fcm:${token}`, token);
  // Not under fcm:* (the send loop's scan pattern), so it's never mistaken for a token.
  await redis.set(`fcmseen:${token}`, new Date().toISOString());
  return NextResponse.json({ ok: true });
}
