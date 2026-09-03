import { NextRequest, NextResponse } from 'next/server';
import { redisConfig, redisCommand, redisPipeline } from '@/lib/redis';
import { authorize } from '@/lib/analytics-auth';

export const runtime = 'edge';

/**
 * Wipe one day's analytics for one surface.
 *
 * Exists so test traffic can be cleared before trusting the numbers — a
 * dashboard seeded with synthetic events is worse than an empty one, because
 * it looks like evidence.
 *
 * Keys are reconstructed from the day's own indexes rather than scanned, so
 * this deletes exactly what that day wrote and nothing else.
 */
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

  const day = req.nextUrl.searchParams.get('day');
  const surface = req.nextUrl.searchParams.get('surface');
  if (!day || !/^\d{4}-\d{2}-\d{2}$/.test(day) || !surface || !/^[a-z]{2,12}$/.test(surface)) {
    return NextResponse.json({ error: 'day and surface are required' }, { status: 400 });
  }

  try {
    const redis = (cmd: string[]) => redisCommand(cfg, cmd);
    const flat = (v: unknown): string[] => {
      if (!Array.isArray(v)) return [];
      // HGETALL returns [field, value, ...]; take the fields only.
      return v.filter((_, i) => i % 2 === 0).map(String);
    };

    const [routesRaw, viewsRaw, deadRaw, sessionsRaw] = await Promise.all([
      redis(['HGETALL', `routes:${day}:${surface}`]),
      redis(['HGETALL', `views:${day}:${surface}`]),
      redis(['HGETALL', `deadroutes:${day}:${surface}`]),
      redis(['SMEMBERS', `sessions:${day}:${surface}`]),
    ]);

    const routes = Array.from(
      new Set([...flat(routesRaw), ...flat(viewsRaw), ...flat(deadRaw)])
    );
    const sessions = Array.isArray(sessionsRaw) ? sessionsRaw.map(String) : [];

    // Widths are per route, and heat keys are namespaced by width.
    const vwLists = await redisPipeline(
      cfg,
      routes.map((r) => ['SMEMBERS', `vws:${day}:${surface}:${r}`])
    );

    const keys: string[] = [
      `routes:${day}:${surface}`,
      `views:${day}:${surface}`,
      `named:${day}:${surface}`,
      `searchmiss:${day}:${surface}`,
      `deadroutes:${day}:${surface}`,
      `sessions:${day}:${surface}`,
    ];

    routes.forEach((r, i) => {
      keys.push(`elem:${day}:${surface}:${r}`);
      keys.push(`scroll:${day}:${surface}:${r}`);
      keys.push(`vws:${day}:${surface}:${r}`);
      const vws = Array.isArray(vwLists[i]) ? (vwLists[i] as unknown[]).map(String) : [];
      // Include the default bucket so heat written before widths were indexed
      // is cleared too.
      Array.from(new Set([...vws, '480'])).forEach((vw) => {
        keys.push(`heat:${day}:${surface}:${vw}:${r}`);
        keys.push(`page:${day}:${surface}:${vw}:${r}`);
        keys.push(`dead:${day}:${surface}:${vw}:${r}`);
      });
    });

    sessions.forEach((sid) => keys.push(`trail:${day}:${surface}:${sid}`));

    // DEL in chunks so a busy day can't produce an oversized request.
    let deleted = 0;
    for (let i = 0; i < keys.length; i += 100) {
      const chunk = keys.slice(i, i + 100);
      const n = await redis(['DEL', ...chunk]);
      deleted += Number(n) || 0;
    }

    return NextResponse.json({ ok: true, day, surface, keysDeleted: deleted });
  } catch (err) {
    console.error('Analytics reset failed:', err);
    return NextResponse.json({ error: 'Reset failed' }, { status: 502 });
  }
}
