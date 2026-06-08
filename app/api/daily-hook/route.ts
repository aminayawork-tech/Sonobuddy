import { NextResponse } from 'next/server';
import { getDailyHook } from '@/lib/tips';

export const runtime = 'nodejs';

export async function GET() {
  const hook = getDailyHook();
  return NextResponse.json(hook, {
    headers: {
      // Cache for 1 hour — hook won't change mid-day
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
}
