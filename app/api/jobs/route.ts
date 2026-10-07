import { NextResponse } from 'next/server';
import { getJobs } from '@/lib/jobs';

// Reads from Redis cache / calls a live third-party API depending on cache
// age — must never be frozen at build time.
export const dynamic = 'force-dynamic';

export async function GET() {
  const jobs = await getJobs();
  return NextResponse.json(jobs, {
    headers: {
      'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
