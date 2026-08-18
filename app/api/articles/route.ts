import { NextResponse } from 'next/server';
import { getAllArticles } from '@/lib/articles-data';

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
