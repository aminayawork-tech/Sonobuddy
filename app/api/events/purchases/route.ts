import { NextRequest, NextResponse } from 'next/server';
import { redisConfig, redisCommand, redisPipeline } from '@/lib/redis';
import { authorize } from '@/lib/analytics-auth';

export const runtime = 'edge';

/**
 * Move a recorded purchase out of a surface's real numbers into its test
 * bucket (ios → iostest, android → androidtest).
 *
 * Purchases made before TestFlight builds tagged themselves as test traffic
 * were counted as real iOS sales, and nothing in the stored counters can
 * tell them apart. This lets the owner reconcile the dashboard with App
 * Store Connect / Play Console by hand. The count is moved, not deleted, so
 * a mistake can be undone by moving it back (pass `undo: true`).
 */
const FIELDS = {
  full: 'paywall:completed:purchase',
  sale: 'paywall:completed:purchaseDiscount',
} as const;

export async function POST(req: NextRequest) {
  const expected = process.env.ANALYTICS_TOKEN;
  const cfg = redisConfig();
  if (!expected || !cfg) {
    return NextResponse.json({ error: 'Analytics not configured' }, { status: 503 });
  }

  const auth = await authorize(req, cfg, expected);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let body: { day?: unknown; surface?: unknown; kind?: unknown; undo?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }

  const day = typeof body.day === 'string' ? body.day : '';
  const surface = body.surface === 'ios' || body.surface === 'android' ? body.surface : null;
  const kind = body.kind === 'full' || body.kind === 'sale' ? body.kind : null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || !surface || !kind) {
    return NextResponse.json({ error: 'day, surface (ios/android) and kind (full/sale) are required' }, { status: 400 });
  }

  const field = FIELDS[kind];
  const real = `named:${day}:${surface}`;
  const test = `named:${day}:${surface}test`;
  const [from, to] = body.undo === true ? [test, real] : [real, test];

  try {
    const current = Number(await redisCommand(cfg, ['HGET', from, field])) || 0;
    if (current < 1) {
      return NextResponse.json({ error: 'No purchase left to move for that day' }, { status: 409 });
    }
    await redisPipeline(cfg, [
      ['HINCRBY', from, field, '-1'],
      ['HINCRBY', to, field, '1'],
      // Keep the same retention as counters written by the events route.
      ['EXPIRE', to, String(60 * 60 * 24 * 180), 'NX'],
      ['SADD', 'days', day],
    ]);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Purchase adjust failed:', err);
    return NextResponse.json({ error: 'Update failed' }, { status: 502 });
  }
}
