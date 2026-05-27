import { NextResponse } from 'next/server';
import { getArticleBySlug } from '@/lib/articles-data';

export function GET(_: Request, { params }: { params: { slug: string } }) {
  const article = getArticleBySlug(params.slug);
  if (!article) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json(article);
}
