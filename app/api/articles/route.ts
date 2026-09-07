import { NextResponse } from 'next/server';
import { getAllArticles } from '@/lib/articles-data';

// This handler reads nothing request-specific, so Next.js would pre-render it
// at build time and freeze the result. That matters here because the list is
// filtered by today's date: future-dated articles would stay hidden past their
// publish date until the next deploy, rather than appearing on schedule.
export const dynamic = 'force-dynamic';

export async function GET() {
  const today = new Date().toISOString().slice(0, 10);
  const articles = getAllArticles()
    .filter((a) => a.date <= today)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
  return NextResponse.json(articles, {
    headers: {
      'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
