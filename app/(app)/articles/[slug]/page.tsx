import { notFound } from 'next/navigation';
import { ARTICLES, getArticleBySlug } from '@/lib/articles-data';
import ArticleDetailClient from '@/components/ArticleDetailClient';

interface Props {
  params: { slug: string };
}

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export default function ArticleDetailPage({ params }: Props) {
  const article = getArticleBySlug(params.slug);
  if (!article) notFound();

  return <ArticleDetailClient article={article} />;
}
