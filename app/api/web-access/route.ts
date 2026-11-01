import { NextRequest, NextResponse } from 'next/server';
import { createHash, timingSafeEqual } from 'crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Password gate for the browser version of the app (the native apps skip it).
// The password lives only in the WEB_APP_PASSWORD env var; the browser gets
// an httpOnly cookie holding a hash of it, so changing the env var signs
// everyone out.
const COOKIE = 'sb_web_access';
const ONE_YEAR = 60 * 60 * 24 * 365;

function digest(value: string): Buffer {
  return createHash('sha256').update(`sonobuddy-web-access:${value}`).digest();
}

function expectedToken(): string | null {
  const password = process.env.WEB_APP_PASSWORD;
  return password ? digest(password).toString('hex') : null;
}

export async function GET(req: NextRequest) {
  const expected = expectedToken();
  const cookie = req.cookies.get(COOKIE)?.value;
  const ok = !!expected && !!cookie && cookie.length === expected.length
    && timingSafeEqual(Buffer.from(cookie), Buffer.from(expected));
  return NextResponse.json({ ok }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(req: NextRequest) {
  const password = process.env.WEB_APP_PASSWORD;
  if (!password) {
    return NextResponse.json({ ok: false, error: 'Web access is not available.' }, { status: 503 });
  }

  let attempt = '';
  try {
    const body = await req.json();
    if (typeof body?.password === 'string') attempt = body.password;
  } catch {
    // Malformed body is just a wrong password.
  }

  if (!timingSafeEqual(digest(attempt), digest(password))) {
    // Slow down guessing a little.
    await new Promise((r) => setTimeout(r, 600));
    return NextResponse.json({ ok: false, error: 'That password isn’t right.' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, digest(password).toString('hex'), {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: ONE_YEAR,
  });
  return res;
}
