import { NextRequest, NextResponse } from 'next/server';
import { redisConfig } from '@/lib/redis';

export const runtime = 'edge';

// The iOS app's origin is the sono-web:// custom scheme, so every call here
// is cross-origin. The client posts text/plain to stay a CORS "simple
// request" and avoid a preflight, but the response still needs these headers.
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};

const MAX_EVENTS = 500;
// Keep six months of daily counters; older days expire automatically.
const RETENTION_SECONDS = 60 * 60 * 24 * 180;

interface TapEvent {
  surface?: unknown;
  route?: unknown;
  label?: unknown;
  cell?: unknown;
  pcell?: unknown;
  vw?: unknown;
  ts?: unknown;
  session?: unknown;
}

function clean(v: unknown, max: number): string | null {
  if (typeof v !== 'string') return null;
  const s = v.trim().slice(0, max);
  return s.length > 0 ? s : null;
}

/** UTC day bucket, so counts can be trended and expired per day. */
function dayKey(ts: number): string {
  return new Date(ts).toISOString().slice(0, 10);
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function POST(req: NextRequest) {
  try {
    // Sent as text/plain to dodge the preflight, so parse it ourselves.
    const body = JSON.parse(await req.text());
    const events: TapEvent[] = Array.isArray(body?.events) ? body.events : [];

    if (events.length === 0 || events.length > MAX_EVENTS) {
      return NextResponse.json({ error: 'Invalid batch' }, { status: 400, headers: CORS });
    }

    const cfg = redisConfig();

    // Not configured yet: accept and discard. Returning ok is deliberate —
    // a client that never gets a success response would retry the same batch
    // forever and grow its offline queue until the cap.
    if (!cfg) {
      return NextResponse.json({ ok: true, stored: false }, { headers: CORS });
    }

    // Build one pipelined batch of counter increments. A heatmap only needs
    // counts per cell and per control, so storing raw events would cost far
    // more and buy nothing.
    const cmds: string[][] = [];
    const days = new Set<string>();

    for (const e of events) {
      const surface = clean(e.surface, 12);
      const route = clean(e.route, 120);
      const label = clean(e.label, 60);
      const cell = clean(e.cell, 8);
      const pcell = clean(e.pcell, 10);
      const ts = typeof e.ts === 'number' && isFinite(e.ts) ? e.ts : Date.now();
      const vw = typeof e.vw === 'number' && isFinite(e.vw) ? Math.round(e.vw) : 0;
      if (!surface || !route) continue;

      const day = dayKey(ts);
      days.add(day);

      if (cell && /^\d{1,2},\d{1,2}$/.test(cell)) {
        cmds.push(['HINCRBY', `heat:${day}:${surface}:${vw}:${route}`, cell, '1']);
      }
      // Page-relative heat, keyed separately from the viewport grid — this is
      // what gets overlaid on a rendering of the real page.
      if (pcell && /^\d{1,2},\d{1,3}$/.test(pcell)) {
        cmds.push(['HINCRBY', `page:${day}:${surface}:${vw}:${route}`, pcell, '1']);
      }
      if (label) {
        cmds.push(['HINCRBY', `elem:${day}:${surface}:${route}`, label, '1']);
      }
      cmds.push(['HINCRBY', `routes:${day}:${surface}`, route, '1']);
    }

    if (cmds.length === 0) {
      return NextResponse.json({ ok: true, stored: false }, { headers: CORS });
    }

    // Track which days have data so the viewer can enumerate them without
    // a SCAN across the keyspace.
    Array.from(days).forEach((day) => cmds.push(['SADD', 'days', day]));

    // Expire the day's counters so storage stays bounded — without this the
    // keyspace grows forever and eventually runs into the plan's size cap.
    // NX sets the TTL only if the key has none, so repeated writes through
    // the day don't keep pushing expiry forward.
    Array.from(new Set(cmds.filter((c) => c[0] === 'HINCRBY').map((c) => c[1])))
      .forEach((key) => cmds.push(['EXPIRE', key, String(RETENTION_SECONDS), 'NX']));
    // The day index is small; give it a rolling window rather than NX so it
    // outlives the counters it points at.
    cmds.push(['EXPIRE', 'days', String(RETENTION_SECONDS)]);

    const res = await fetch(`${cfg.url}/pipeline`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${cfg.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cmds),
    });

    if (!res.ok) {
      console.error('Upstash pipeline failed:', res.status, await res.text());
      // 502 so the client keeps the batch queued and retries later.
      return NextResponse.json({ error: 'Store unavailable' }, { status: 502, headers: CORS });
    }

    return NextResponse.json({ ok: true, stored: true, count: events.length }, { headers: CORS });
  } catch (err) {
    console.error('Events route error:', err);
    return NextResponse.json({ error: 'Bad request' }, { status: 400, headers: CORS });
  }
}
