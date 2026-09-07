import { NextResponse } from 'next/server';
import { getDailyHook } from '@/lib/tips';

export const runtime = 'nodejs';

// Without this, Next.js sees a GET handler that reads nothing request-specific
// and pre-renders it at build time — getDailyHook() runs once during the build
// and the result is frozen into a static file served from the CDN. The tip then
// only changes when the site is redeployed, which is exactly the bug this
// endpoint existed to avoid. Cache-Control alone does not prevent it, because
// the response is a static asset rather than a function invocation.
export const dynamic = 'force-dynamic';

// The iOS app's origin is the sono-web:// custom scheme, so this is always a
// cross-origin fetch from there. Without these headers the browser blocks the
// app from reading the response — the request still succeeds, but .then()
// never fires, which silently defeats the whole point of this endpoint (the
// app is meant to match whatever the push notification says).
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function GET() {
  const hook = getDailyHook();
  return NextResponse.json(hook, {
    headers: {
      'Cache-Control': 'no-store',
      ...CORS,
    },
  });
}
