import { NextResponse } from 'next/server';
import { getDailyHook } from '@/lib/tips';

export const runtime = 'nodejs';

export async function GET() {
  const hook = getDailyHook();
  return NextResponse.json(hook, {
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}
