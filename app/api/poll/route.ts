import { NextRequest, NextResponse } from 'next/server';
import { redisConfig, redisCommand, redisPipeline } from '@/lib/redis';
import { POLLS, type Poll } from '@/data/polls';
import { getDailyIndex } from '@/lib/tips';

// Poll of the Day. The server picks today's poll so every app (including the
// bundled iOS app) shows the same question, and new polls ship without builds.
export const dynamic = 'force-dynamic';

// The iOS app's origin is sono-web://, so these calls are always cross-origin.
// Votes are posted as text/plain to stay a "simple" request (no preflight).
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};
const RETENTION = 60 * 60 * 24 * 400; // keep results ~13 months

function todaysPoll(): Poll {
  return POLLS[((getDailyIndex() % POLLS.length) + POLLS.length) % POLLS.length];
}

async function counts(id: string, options: number): Promise<number[]> {
  const cfg = redisConfig();
  const out = new Array(options).fill(0);
  if (!cfg) return out;
  const flat = await redisCommand(cfg, ['HGETALL', `poll:${id}`]).catch(() => null);
  if (Array.isArray(flat)) {
    for (let i = 0; i + 1 < flat.length; i += 2) {
      const idx = Number(flat[i]);
      if (Number.isInteger(idx) && idx >= 0 && idx < options) out[idx] = Number(flat[i + 1]) || 0;
    }
  }
  return out;
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

// GET            → today's poll and its results
// GET ?all=1     → every poll's results (for picking TikTok/blog topics)
export async function GET(req: NextRequest) {
  if (req.nextUrl.searchParams.get('all') === '1') {
    const all = await Promise.all(POLLS.map(async (p) => {
      const c = await counts(p.id, p.options.length);
      return { id: p.id, question: p.question, total: c.reduce((a, b) => a + b, 0), results: p.options.map((o, i) => ({ option: o, votes: c[i] })) };
    }));
    return NextResponse.json(all, { headers: { ...CORS, 'Cache-Control': 'no-store' } });
  }
  // Switched off (POLL_ENABLED=1 turns it back on). The iOS 11.3 build has
  // the card built in; it hides itself when no poll is returned.
  if (process.env.POLL_ENABLED !== '1') {
    return NextResponse.json({ poll: null }, { headers: { ...CORS, 'Cache-Control': 'no-store' } });
  }
  const poll = todaysPoll();
  const c = await counts(poll.id, poll.options.length);
  return NextResponse.json({ poll, counts: c }, { headers: { ...CORS, 'Cache-Control': 'no-store' } });
}

// POST { id, option, voter } → records one vote per device per poll
export async function POST(req: NextRequest) {
  let body: { id?: unknown; option?: unknown; voter?: unknown };
  try {
    body = JSON.parse(await req.text());
  } catch {
    return NextResponse.json({ error: 'bad request' }, { status: 400, headers: CORS });
  }
  const poll = POLLS.find((p) => p.id === body.id);
  const option = Number(body.option);
  const voter = typeof body.voter === 'string' ? body.voter.slice(0, 64) : '';
  if (!poll || !Number.isInteger(option) || option < 0 || option >= poll.options.length || voter.length < 8) {
    return NextResponse.json({ error: 'invalid vote' }, { status: 400, headers: CORS });
  }
  // Only today's poll accepts votes, so old cards can't be stuffed later.
  if (poll.id !== todaysPoll().id) {
    return NextResponse.json({ error: 'poll closed', counts: await counts(poll.id, poll.options.length) }, { status: 409, headers: CORS });
  }

  const cfg = redisConfig();
  if (cfg) {
    // SADD returns 1 only for a first-time voter on this poll.
    const added = Number(await redisCommand(cfg, ['SADD', `poll:${poll.id}:voters`, voter]).catch(() => 0));
    if (added === 1) {
      await redisPipeline(cfg, [
        ['HINCRBY', `poll:${poll.id}`, String(option), '1'],
        ['EXPIRE', `poll:${poll.id}`, String(RETENTION)],
        ['EXPIRE', `poll:${poll.id}:voters`, String(RETENTION)],
      ]).catch(() => {});
    }
  }
  return NextResponse.json({ ok: true, counts: await counts(poll.id, poll.options.length) }, { headers: CORS });
}
