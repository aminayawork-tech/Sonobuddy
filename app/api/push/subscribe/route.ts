import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { type PushSubscriptionData } from '@/lib/webpush';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function POST(req: NextRequest) {
  try {
    const subscription: PushSubscriptionData = await req.json();

    if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 });
    }

    // Use endpoint as key — stores one entry per unique browser subscription
    const key = `push:${Buffer.from(subscription.endpoint).toString('base64').slice(0, 64)}`;
    await redis.set(key, JSON.stringify(subscription));

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[push/subscribe]', err);
    return NextResponse.json({ error: 'Failed to save subscription' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { endpoint } = await req.json();
    if (!endpoint) return NextResponse.json({ error: 'Missing endpoint' }, { status: 400 });

    const key = `push:${Buffer.from(endpoint).toString('base64').slice(0, 64)}`;
    await redis.del(key);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[push/subscribe DELETE]', err);
    return NextResponse.json({ error: 'Failed to remove subscription' }, { status: 500 });
  }
}
