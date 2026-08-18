'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getAllArticles, ARTICLES, getArticleBySlug } from '@/lib/articles-data';
import type { Article } from '@/lib/articles-data';
import { parseLocalDate, todayLocalStr } from '@/lib/date';
import { Calendar, ChevronRight, ChevronLeft, Newspaper } from 'lucide-react';

const API_BASE = 'https://www.sonobuddy.com';
type ArticleMeta = Omit<Article, 'content'>;

// Slugs pre-rendered in the iOS bundle — these work offline via static route
const BUNDLED_SLUGS = new Set(ARTICLES.map((a) => a.slug));

function formatDate(dateStr: string) {
  return parseLocalDate(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

function formatDateLong(dateStr: string) {
  return parseLocalDate(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

/* ── Route shell — reads ?slug= to decide list vs detail ──────────────────── */
function ArticlesRouter() {
  const searchParams = useSearchParams();
  const slug = searchParams.get('slug');
  if (slug) return <ArticleView slug={slug} />;
  return <ArticleList />;
}

export default function ArticlesPage() {
  return (
    <Suspense fallback={<ListSkeleton />}>
      <ArticlesRouter />
    </Suspense>
  );
}

/* ── Article list ─────────────────────────────────────────────────────────── */
function filterAndSort(list: ArticleMeta[]): ArticleMeta[] {
  const today = todayLocalStr();
  return list
    .filter((a) => a.date <= today)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

function ArticleList() {
  const [articles, setArticles] = useState<ArticleMeta[]>(() => filterAndSort(getAllArticles()));

  useEffect(() => {
    fetch(`${API_BASE}/api/articles/`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (Array.isArray(data)) setArticles(filterAndSort(data)); })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-white pb-nav">
      <div className="bg-white border-b border-slate-100 px-5 pt-14 pb-4 sticky top-0 z-10">
        <div className="flex items-center gap-2.5">
          <Newspaper size={20} className="text-sky-500" strokeWidth={2} />
          <h1 className="text-[22px] font-black tracking-tight text-slate-900">Articles</h1>
        </div>
        <p className="text-[13px] text-slate-400 mt-0.5">Tips, protocols &amp; career guides</p>
      </div>

      <div className="px-4 pt-4 space-y-3">
        {articles.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-12">No articles yet — check back soon.</p>
        ) : (
          articles.map((article) => {
            // Bundled articles → pre-rendered static page (works offline)
            // New API-only articles → ?slug= query on this same page (fetches live)
            const href = BUNDLED_SLUGS.has(article.slug)
              ? `/articles/${article.slug}`
              : `/articles?slug=${article.slug}`;

            return (
              <Link
                key={article.slug}
                href={href}
                className="flex items-start justify-between gap-3 bg-white border border-slate-100 rounded-2xl px-4 py-4 shadow-sm active:bg-slate-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Calendar size={11} className="text-slate-400 shrink-0" />
                    <span className="text-[11px] text-slate-400">{formatDate(article.date)}</span>
                  </div>
                  <p className="text-[15px] font-bold text-slate-900 leading-snug mb-1.5 line-clamp-2">
                    {article.title}
                  </p>
                  <p className="text-[13px] text-slate-500 leading-relaxed line-clamp-2">
                    {article.excerpt}
                  </p>
                  {article.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {article.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="bg-sky-50 text-sky-600 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <ChevronRight size={16} className="text-slate-300 shrink-0 mt-1" />
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}

/* ── Article detail (for API-only articles via ?slug=) ────────────────────── */
function ArticleView({ slug }: { slug: string }) {
  const [article, setArticle] = useState<Article | null>(() => getArticleBySlug(slug));
  const [loading, setLoading] = useState(!getArticleBySlug(slug));

  useEffect(() => {
    if (article) return;
    fetch(`${API_BASE}/api/articles-by-slug/${slug}/`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (data) setArticle(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug, article]);

  if (loading) return <ArticleSkeleton />;

  if (!article) {
    return (
      <div className="min-h-screen bg-white pb-nav flex flex-col">
        <div className="bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 pt-14 pb-3 sticky top-0 z-10">
          <Link href="/articles" className="inline-flex items-center gap-1 text-sky-500 text-sm font-semibold">
            <ChevronLeft size={16} strokeWidth={2.5} />
            Articles
          </Link>
        </div>
        <div className="flex-1 flex items-center justify-center px-6">
          <p className="text-slate-400 text-sm text-center">
            Article not available offline. Connect to the internet and try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-nav">
      <div className="bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 pt-14 pb-3 sticky top-0 z-10">
        <Link href="/articles" className="inline-flex items-center gap-1 text-sky-500 text-sm font-semibold">
          <ChevronLeft size={16} strokeWidth={2.5} />
          Articles
        </Link>
      </div>

      <div className="px-5 pt-6 pb-8">
        <div className="flex items-center gap-1.5 mb-3">
          <Calendar size={12} className="text-slate-400" />
          <span className="text-[12px] text-slate-400">{formatDateLong(article.date)}</span>
        </div>

        <h1 className="text-[24px] font-black tracking-tight text-slate-900 leading-tight mb-3">
          {article.title}
        </h1>
        <p className="text-[15px] text-slate-500 leading-relaxed mb-5 border-b border-slate-100 pb-5">
          {article.excerpt}
        </p>

        {article.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-6">
            {article.tags.map((tag) => (
              <span key={tag} className="bg-sky-50 text-sky-600 text-[10px] font-semibold px-2.5 py-1 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}

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
          prose-blockquote:border-l-4 prose-blockquote:border-sky-400 prose-blockquote:bg-sky-50 prose-blockquote:rounded-r-xl prose-blockquote:px-4 prose-blockquote:py-3 prose-blockquote:not-italic
          prose-hr:border-slate-100 prose-hr:my-6
        ">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{article.content}</ReactMarkdown>
        </div>

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

/* ── Loading skeletons ────────────────────────────────────────────────────── */
function ListSkeleton() {
  return (
    <div className="min-h-screen bg-white pb-nav">
      <div className="bg-white border-b border-slate-100 px-5 pt-14 pb-4">
        <div className="h-6 w-24 bg-slate-100 rounded animate-pulse" />
      </div>
      <div className="px-4 pt-4 space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white border border-slate-100 rounded-2xl px-4 py-4 space-y-2">
            <div className="h-3 w-20 bg-slate-100 rounded animate-pulse" />
            <div className="h-4 w-full bg-slate-100 rounded animate-pulse" />
            <div className="h-4 w-3/4 bg-slate-100 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ArticleSkeleton() {
  return (
    <div className="min-h-screen bg-white pb-nav">
      <div className="bg-white border-b border-slate-100 px-4 pt-14 pb-3">
        <div className="h-4 w-20 bg-slate-100 rounded animate-pulse" />
      </div>
      <div className="px-5 pt-6 space-y-3">
        <div className="h-3 w-24 bg-slate-100 rounded animate-pulse" />
        <div className="h-7 w-full bg-slate-100 rounded animate-pulse" />
        <div className="h-7 w-2/3 bg-slate-100 rounded animate-pulse" />
        <div className="h-4 w-full bg-slate-100 rounded animate-pulse mt-4" />
        <div className="h-4 w-5/6 bg-slate-100 rounded animate-pulse" />
      </div>
    </div>
  );
}
