import { NextRequest } from 'next/server';
import { redisCommand } from '@/lib/redis';

/**
 * Shared gate for the analytics endpoints. Kept in one place so the read and
 * reset routes can't drift apart on how they check the token.
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

export type AuthResult = { ok: true } | { ok: false; status: number; error: string };

export async function authorize(
  req: NextRequest,
  cfg: { url: string; token: string },
  expected: string
): Promise<AuthResult> {
  const failKey = `authfail:${clientIp(req)}`;

  try {
    const failures = Number(await redisCommand(cfg, ['GET', failKey])) || 0;
    if (failures >= MAX_FAILURES) {
      return { ok: false, status: 429, error: 'Too many attempts. Try again later.' };
    }
  } catch {
    // If the rate-limit read fails, fall through to the token check rather
    // than locking the owner out of their own dashboard.
  }

  // Header only — query strings end up in logs, history and referrers.
  const auth = req.headers.get('authorization') || '';
  const provided = auth.startsWith('Bearer ') ? auth.slice(7) : '';

  if (!provided || !(await tokensMatch(provided, expected))) {
    try {
      await redisCommand(cfg, ['INCR', failKey]);
      await redisCommand(cfg, ['EXPIRE', failKey, String(LOCKOUT_SECONDS)]);
    } catch {
      // Rate-limit bookkeeping is best-effort.
    }
    return { ok: false, status: 401, error: 'Unauthorized' };
  }

  try { await redisCommand(cfg, ['DEL', failKey]); } catch { /* best effort */ }
  return { ok: true };
}
