import { NextResponse } from 'next/server';
import { getJobs } from '@/lib/jobs';

// Reads from Redis cache / calls a live third-party API depending on cache
// age — must never be frozen at build time.
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const location = searchParams.get('location')?.trim() || undefined;
  // ?source=jsearch previews the JSearch feed without switching the app over.
  const sourceParam = searchParams.get('source');
  const source = sourceParam === 'jsearch' || sourceParam === 'adzuna' ? sourceParam : undefined;
  const jobs = await getJobs(location, source);
  return NextResponse.json(jobs, {
    headers: {
      'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
