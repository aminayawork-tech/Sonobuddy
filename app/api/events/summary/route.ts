import { NextRequest, NextResponse } from 'next/server';
import { redisConfig, redisCommand } from '@/lib/redis';

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

const MAX_FAILURES = 10;
const LOCKOUT_SECONDS = 900; // 15 minutes

/** Constant-time compare. Hashing first keeps length out of the timing. */
async function tokensMatch(provided: string, expected: string): Promise<boolean> {
  const enc = new TextEncoder();
  const [a, b] = await Promise.all([
    crypto.subtle.digest('SHA-256', enc.encode(provided)),
    crypto.subtle.digest('SHA-256', enc.encode(expected)),
  ]);
  const x = new Uint8Array(a);
  const y = new Uint8Array(b);
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get('x-forwarded-for');
  return (fwd ? fwd.split(',')[0] : '').trim() || 'unknown';
}

export async function GET(req: NextRequest) {
  const expected = process.env.ANALYTICS_TOKEN;
  const cfg = redisConfig();

  if (!expected || !cfg) {
    return NextResponse.json({ error: 'Analytics not configured' }, { status: 503 });
  }

  const redis = (cmd: string[]) => redisCommand(cfg, cmd);

  const ip = clientIp(req);
  const failKey = `authfail:${ip}`;

  try {
    const failures = Number(await redis(['GET', failKey])) || 0;
    if (failures >= MAX_FAILURES) {
      return NextResponse.json(
        { error: 'Too many attempts. Try again later.' },
        { status: 429 }
      );
    }
  } catch {
    // If the rate-limit read fails, fall through to the token check rather
    // than locking the owner out of their own dashboard.
  }

  // Accept "Authorization: Bearer <token>"; the query string is deliberately
  // not supported so the token never lands in a log or history entry.
  const auth = req.headers.get('authorization') || '';
  const provided = auth.startsWith('Bearer ') ? auth.slice(7) : '';

  if (!provided || !(await tokensMatch(provided, expected))) {
    try {
      await redis(['INCR', failKey]);
      await redis(['EXPIRE', failKey, String(LOCKOUT_SECONDS)]);
    } catch {
      // Rate-limit bookkeeping is best-effort.
    }
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Successful auth clears the failure counter for this address.
  try { await redis(['DEL', failKey]); } catch { /* best effort */ }

  const day = req.nextUrl.searchParams.get('day') || new Date().toISOString().slice(0, 10);
  const surface = req.nextUrl.searchParams.get('surface') || 'ios';
  const route = req.nextUrl.searchParams.get('route');
  const vw = req.nextUrl.searchParams.get('vw') || '480';

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
