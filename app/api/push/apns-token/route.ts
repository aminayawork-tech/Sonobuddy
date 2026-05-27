import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function POST(req: NextRequest) {
  const { token } = await req.json() as { token?: string };
  if (!token || typeof token !== 'string') {
    return NextResponse.json({ error: 'missing token' }, { status: 400 });
  }
  await redis.set(`apns:${token}`, token);
  return NextResponse.json({ ok: true });
}
