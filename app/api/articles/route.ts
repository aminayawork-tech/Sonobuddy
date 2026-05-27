import { NextResponse } from 'next/server';
import { getAllArticles } from '@/lib/articles-data';

export async function GET() {
  return NextResponse.json(getAllArticles());
}
