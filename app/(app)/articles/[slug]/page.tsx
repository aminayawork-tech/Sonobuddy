import { notFound } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ARTICLES, getArticleBySlug } from '@/lib/articles-data';
import { Calendar, ChevronLeft } from 'lucide-react';

interface Props {
  params: { slug: string };
}

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

export default function ArticleDetailPage({ params }: Props) {
  const article = getArticleBySlug(params.slug);
  if (!article) notFound();

  return (
    <div className="min-h-screen bg-white pb-nav">
      {/* Sticky header */}
      <div className="bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 pt-14 pb-3 sticky top-0 z-10">
        <Link
          href="/articles"
          className="inline-flex items-center gap-1 text-sky-500 text-sm font-semibold"
        >
          <ChevronLeft size={16} strokeWidth={2.5} />
          Articles
        </Link>
      </div>

      {/* Article content */}
      <div className="px-5 pt-6 pb-8">
        {/* Meta */}
        <div className="flex items-center gap-1.5 mb-3">
          <Calendar size={12} className="text-slate-400" />
          <span className="text-[12px] text-slate-400">{formatDate(article.date)}</span>
        </div>

        <h1 className="text-[24px] font-black tracking-tight text-slate-900 leading-tight mb-3">
          {article.title}
        </h1>
        <p className="text-[15px] text-slate-500 leading-relaxed mb-5 border-b border-slate-100 pb-5">
          {article.excerpt}
        </p>

        {/* Tags */}
        {article.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-6">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="bg-sky-50 text-sky-600 text-[10px] font-semibold px-2.5 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Body */}
        <div className="
          prose prose-slate max-w-none
          prose-headings:font-black prose-headings:tracking-tight prose-headings:text-slate-900
          prose-h2:text-[20px] prose-h2:mt-8 prose-h2:mb-3 prose-h2:pb-2 prose-h2:border-b prose-h2:border-slate-100
          prose-h3:text-[17px] prose-h3:mt-6 prose-h3:mb-2
          prose-p:text-slate-600 prose-p:leading-relaxed prose-p:text-[15px]
          prose-a:text-sky-500 prose-a:no-underline
          prose-strong:text-slate-900 prose-strong:font-semibold
          prose-ul:text-slate-600 prose-ul:my-3 prose-ul:space-y-1
          prose-ol:text-slate-600 prose-ol:my-3 prose-ol:space-y-1
          prose-li:text-[14px] prose-li:leading-relaxed
          prose-table:text-[13px] prose-table:w-full
          prose-thead:bg-slate-50
          prose-th:text-slate-900 prose-th:font-semibold prose-th:px-3 prose-th:py-2
          prose-td:text-slate-600 prose-td:px-3 prose-td:py-2
          prose-blockquote:border-l-4 prose-blockquote:border-sky-400 prose-blockquote:bg-sky-50 prose-blockquote:rounded-r-xl prose-blockquote:px-4 prose-blockquote:py-3 prose-blockquote:not-italic
          prose-hr:border-slate-100 prose-hr:my-6
        ">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {article.content}
          </ReactMarkdown>
        </div>

        {/* CTA */}
        <div className="mt-10 bg-sky-50 border border-sky-100 rounded-2xl p-5 text-center">
          <p className="text-xl font-black tracking-tight mb-1">
            <span className="text-slate-900">Sono</span><span className="text-sky-500">Buddy</span>
          </p>
          <p className="text-slate-500 text-[13px] mb-4 leading-relaxed">
            All reference tools in one app — measurements, protocols, calculators, pathologies. Works offline.
          </p>
          <Link
            href="/home"
            className="inline-flex items-center gap-2 bg-sky-500 text-white font-bold text-[14px] px-6 py-3 rounded-xl active:bg-sky-600 transition-colors"
          >
            Open App
          </Link>
        </div>
      </div>
    </div>
  );
}
