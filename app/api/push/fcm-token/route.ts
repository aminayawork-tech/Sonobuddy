import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Stores an Android app's Firebase Cloud Messaging token for the daily push.
// Mirrors /api/push/apns-token (iOS). Not under push:*, which holds web-push
// subscriptions.
export async function POST(req: NextRequest) {
  let token: unknown;
  try {
    ({ token } = await req.json());
  } catch {
    return NextResponse.json({ error: 'bad request' }, { status: 400 });
  }
  if (typeof token !== 'string' || token.length < 20 || token.length > 4096) {
    return NextResponse.json({ error: 'missing token' }, { status: 400 });
  }
  await redis.set(`fcm:${token}`, token);
  return NextResponse.json({ ok: true });
}
