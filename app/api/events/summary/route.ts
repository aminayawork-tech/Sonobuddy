import { NextRequest, NextResponse } from 'next/server';
import { redisConfig, redisCommand, redisPipeline } from '@/lib/redis';
import { authorize } from '@/lib/analytics-auth';

export const runtime = 'edge';

/**
 * Read side of tap tracking — private to the site owner.
 *
 * The token travels in an Authorization header rather than the query string,
 * because query strings end up in server logs, browser history, and referrer
 * headers. Comparison is constant-time over SHA-256 digests, and repeated
 * failures from one address are locked out via Redis, so the token can't be
 * brute-forced against a public endpoint.
 */

export async function GET(req: NextRequest) {
  const expected = process.env.ANALYTICS_TOKEN;
  const cfg = redisConfig();

  if (!expected || !cfg) {
    // Name which half is missing — without it a 503 is indistinguishable
    // between "no token" and "no store", which costs a deploy cycle to
    // narrow down. Neither value is revealed, only whether it resolved.
    const missing: string[] = [];
    if (!expected) missing.push('ANALYTICS_TOKEN');
    if (!cfg) missing.push('redis credentials (UPSTASH_REDIS_REST_* or KV_REST_API_*)');
    return NextResponse.json(
      { error: 'Analytics not configured', missing },
      { status: 503 }
    );
  }

  const auth = await authorize(req, cfg, expected);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const redis = (cmd: string[]) => redisCommand(cfg, cmd);

  const day = req.nextUrl.searchParams.get('day') || new Date().toISOString().slice(0, 10);
  const surface = req.nextUrl.searchParams.get('surface') || 'ios';
  const route = req.nextUrl.searchParams.get('route');
  const requestedVw = req.nextUrl.searchParams.get('vw');

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
    const views = toPairs(await redis(['HGETALL', `views:${day}:${surface}`]));
    const named = toPairs(await redis(['HGETALL', `named:${day}:${surface}`]));
    const searchMisses = toPairs(await redis(['HGETALL', `searchmiss:${day}:${surface}`]));
    const deadRoutes = toPairs(await redis(['HGETALL', `deadroutes:${day}:${surface}`]));

    // Session paths. Capped: this is for reading patterns at a glance, not
    // for auditing individuals, and unbounded reads would be slow and costly.
    const allSessions = await redis(['SMEMBERS', `sessions:${day}:${surface}`]);
    const sessionIds = Array.isArray(allSessions) ? allSessions.map(String) : [];
    const sampled = sessionIds.slice(0, 40);
    const trailLists = await redisPipeline(
      cfg,
      sampled.map((sid) => ['LRANGE', `trail:${day}:${surface}:${sid}`, '0', '-1'])
    );
    const journeys = sampled
      .map((sid, i) => ({
        session: sid,
        path: Array.isArray(trailLists[i]) ? (trailLists[i] as unknown[]).map(String) : [],
      }))
      .filter((j) => j.path.length > 0)
      .sort((a, b) => b.path.length - a.path.length);

    let elements: { name: string; count: number }[] = [];
    let cells: { name: string; count: number }[] = [];
    let pageCells: { name: string; count: number }[] = [];
    let deadCells: { name: string; count: number }[] = [];
    let scroll: { name: string; count: number }[] = [];

    let viewports: string[] = [];
    let vw = requestedVw || '480';

    if (route) {
      const vwsRaw = await redis(['SMEMBERS', `vws:${day}:${surface}:${route}`]);
      viewports = (Array.isArray(vwsRaw) ? vwsRaw.map(String) : []).sort(
        (a, b) => Number(a) - Number(b)
      );
      // Default to a width that actually has data rather than an empty overlay.
      if (!requestedVw || !viewports.includes(vw)) {
        vw = viewports[0] ?? '480';
      }

      elements = toPairs(await redis(['HGETALL', `elem:${day}:${surface}:${route}`]));
      cells = toPairs(await redis(['HGETALL', `heat:${day}:${surface}:${vw}:${route}`]));
      pageCells = toPairs(await redis(['HGETALL', `page:${day}:${surface}:${vw}:${route}`]));
      deadCells = toPairs(await redis(['HGETALL', `dead:${day}:${surface}:${vw}:${route}`]));
      scroll = toPairs(await redis(['HGETALL', `scroll:${day}:${surface}:${route}`]));
    }

    return NextResponse.json(
      {
        day,
        surface,
        route,
        days: Array.isArray(days) ? days.sort().reverse() : [],
        routes,
        views,
        named,
        searchMisses,
        deadRoutes,
        deadCells,
        scroll,
        viewports,
        vw,
        sessionCount: sessionIds.length,
        journeys,
        elements,
        cells,
        pageCells,
      },
      {
        headers: {
          'Cache-Control': 'no-store, private',
          // Never let this response be shared or referrer-leaked.
          'Referrer-Policy': 'no-referrer',
        },
      }
    );
  } catch (err) {
    console.error('Summary route error:', err);
    return NextResponse.json({ error: 'Read failed' }, { status: 502 });
  }
}
