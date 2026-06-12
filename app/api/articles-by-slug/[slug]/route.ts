import { NextResponse } from 'next/server';
import { getArticleBySlug, ARTICLES } from '@/lib/articles-data';

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export function GET(_: Request, { params }: { params: { slug: string } }) {
  const article = getArticleBySlug(params.slug);
  if (!article) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json(article);
}
