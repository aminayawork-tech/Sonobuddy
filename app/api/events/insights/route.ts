import { NextRequest, NextResponse } from 'next/server';
import { redisConfig, redisPipeline } from '@/lib/redis';
import { authorize } from '@/lib/analytics-auth';

export const runtime = 'edge';

/**
 * Cross-day overview: top pages, top articles, and this-month-vs-last-month
 * totals. The day-by-day dashboard answers "what happened on this day" —
 * this answers "what's true overall," which needs every day's counters
 * summed rather than one day's.
 *
 * All of it comes from one Upstash pipeline call. Up to ~180 days exist at
 * once (the retention window on daily counters), and batching them into a
 * single round trip keeps this fast regardless of how many of those days
 * have data.
 */

interface Pair { name: string; count: number }

function toPairs(flat: unknown): Pair[] {
  if (!Array.isArray(flat)) return [];
  const out: Pair[] = [];
  for (let i = 0; i + 1 < flat.length; i += 2) {
    out.push({ name: String(flat[i]), count: Number(flat[i + 1]) || 0 });
  }
  return out;
}

function mergeCounts(target: Map<string, number>, pairs: Pair[]): void {
  for (const p of pairs) target.set(p.name, (target.get(p.name) ?? 0) + p.count);
}

function topN(map: Map<string, number>, n: number): Pair[] {
  return Array.from(map, ([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, n);
}

/** "2026-09" for a "2026-09-13"-shaped day string. */
function monthOf(day: string): string {
  return day.slice(0, 7);
}

function monthLabel(ym: string): string {
  const [y, m] = ym.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? null : 0; // null = "new", not a % of zero
  return Math.round(((current - previous) / previous) * 100);
}

export async function GET(req: NextRequest) {
  const expected = process.env.ANALYTICS_TOKEN;
  const cfg = redisConfig();
  if (!expected || !cfg) {
    return NextResponse.json({ error: 'Analytics not configured' }, { status: 503 });
  }

  const auth = await authorize(req, cfg, expected);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const surface = req.nextUrl.searchParams.get('surface') || 'ios';

  try {
    const daysRaw = await redisPipeline(cfg, [['SMEMBERS', 'days']]);
    const allDays = (Array.isArray(daysRaw[0]) ? (daysRaw[0] as unknown[]).map(String) : []).sort();

    if (allDays.length === 0) {
      return NextResponse.json(
        { surface, days: [], totals: { views: 0, taps: 0, sessions: 0 }, topPages: [], topArticles: [], months: [] },
        { headers: { 'Cache-Control': 'no-store' } }
      );
    }

    // One command per day per counter type, all in a single round trip.
    const routesCmds = allDays.map((d) => ['HGETALL', `routes:${d}:${surface}`]);
    const viewsCmds = allDays.map((d) => ['HGETALL', `views:${d}:${surface}`]);
    const sessionKeysCmds = allDays.map((d) => ['SCARD', `sessions:${d}:${surface}`]);

    const [routesResults, viewsResults, sessionCounts] = await Promise.all([
      redisPipeline(cfg, routesCmds),
      redisPipeline(cfg, viewsCmds),
      redisPipeline(cfg, sessionKeysCmds),
    ]);

    // Per-day breakdown, so month buckets can be built without re-fetching.
    const perDay = allDays.map((day, i) => ({
      day,
      routes: toPairs(routesResults[i]),
      views: toPairs(viewsResults[i]),
      sessions: Number(sessionCounts[i]) || 0,
    }));

    // All-time totals and top lists.
    const allTaps = new Map<string, number>();
    const allViews = new Map<string, number>();
    let totalTaps = 0;
    let totalViews = 0;
    let totalSessions = 0;
    for (const d of perDay) {
      mergeCounts(allTaps, d.routes);
      mergeCounts(allViews, d.views);
      totalTaps += d.routes.reduce((s, p) => s + p.count, 0);
      totalViews += d.views.reduce((s, p) => s + p.count, 0);
      totalSessions += d.sessions;
    }

    // Articles are keyed by their real path (see the events route), so
    // filtering to /blog/ and /articles/ out of the same view counts gives
    // per-article rankings for free — no separate storage needed.
    const articleViews = new Map<string, number>();
    Array.from(allViews.entries()).forEach(([name, count]) => {
      if (name.startsWith('/blog/') || name.startsWith('/articles/')) {
        articleViews.set(name, (articleViews.get(name) ?? 0) + count);
      }
    });

    // Bucket by calendar month for month-over-month. Uses whichever months
    // actually have data rather than assuming "this month" and "last month"
    // both do — a young dataset may only have one.
    const monthMap = new Map<string, { views: number; taps: number; sessions: number }>();
    for (const d of perDay) {
      const ym = monthOf(d.day);
      const bucket = monthMap.get(ym) ?? { views: 0, taps: 0, sessions: 0 };
      bucket.views += d.views.reduce((s, p) => s + p.count, 0);
      bucket.taps += d.routes.reduce((s, p) => s + p.count, 0);
      bucket.sessions += d.sessions; // approximate: sums daily uniques, does not dedupe across days
      monthMap.set(ym, bucket);
    }
    const months = Array.from(monthMap, ([ym, totals]) => ({
      month: ym,
      label: monthLabel(ym),
      ...totals,
    })).sort((a, b) => (a.month < b.month ? 1 : -1)); // most recent first

    const [current, previous] = months;
    const monthOverMonth = current
      ? {
          current,
          previous: previous ?? null,
          deltaPct: previous
            ? {
                views: pctChange(current.views, previous.views),
                taps: pctChange(current.taps, previous.taps),
                sessions: pctChange(current.sessions, previous.sessions),
              }
            : null,
        }
      : null;

    return NextResponse.json(
      {
        surface,
        dayCount: allDays.length,
        range: { from: allDays[0], to: allDays[allDays.length - 1] },
        totals: { views: totalViews, taps: totalTaps, sessions: totalSessions },
        topPages: topN(allTaps, 15),
        topArticles: topN(articleViews, 15),
        months,
        monthOverMonth,
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (err) {
    console.error('Insights route error:', err);
    return NextResponse.json({ error: 'Read failed' }, { status: 502 });
  }
}
