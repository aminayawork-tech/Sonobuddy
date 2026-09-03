import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

/**
 * Read side of tap tracking. Token-gated: this is your usage data, and the
 * endpoint sits on a public domain.
 */
export async function GET(req: NextRequest) {
  const expected = process.env.ANALYTICS_TOKEN;
  if (!expected) {
    return NextResponse.json({ error: 'Analytics not configured' }, { status: 503 });
  }

  const token = req.nextUrl.searchParams.get('token');
  if (token !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !redisToken) {
    return NextResponse.json({ error: 'Store not configured' }, { status: 503 });
  }

  const day = req.nextUrl.searchParams.get('day') || new Date().toISOString().slice(0, 10);
  const surface = req.nextUrl.searchParams.get('surface') || 'ios';
  const route = req.nextUrl.searchParams.get('route');
  const vw = req.nextUrl.searchParams.get('vw') || '480';

  async function redis(cmd: string[]): Promise<unknown> {
    const res = await fetch(url!, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${redisToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cmd),
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`Redis ${res.status}`);
    return (await res.json())?.result;
  }

  /** Upstash returns hashes as a flat [field, value, ...] array. */
  function toPairs(flat: unknown): { name: string; count: number }[] {
    if (!Array.isArray(flat)) return [];
    const out: { name: string; count: number }[] = [];
    for (let i = 0; i + 1 < flat.length; i += 2) {
      out.push({ name: String(flat[i]), count: Number(flat[i + 1]) || 0 });
    }
    return out.sort((a, b) => b.count - a.count);
  }

  try {
    const days = await redis(['SMEMBERS', 'days']);
    const routes = toPairs(await redis(['HGETALL', `routes:${day}:${surface}`]));

    let elements: { name: string; count: number }[] = [];
    let cells: { name: string; count: number }[] = [];

    if (route) {
      elements = toPairs(await redis(['HGETALL', `elem:${day}:${surface}:${route}`]));
      cells = toPairs(await redis(['HGETALL', `heat:${day}:${surface}:${vw}:${route}`]));
    }

    return NextResponse.json(
      {
        day,
        surface,
        route,
        days: Array.isArray(days) ? days.sort().reverse() : [],
        routes,
        elements,
        cells,
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (err) {
    console.error('Summary route error:', err);
    return NextResponse.json({ error: 'Read failed' }, { status: 502 });
  }
}
