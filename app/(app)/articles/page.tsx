'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getAllArticles, ARTICLES, getArticleBySlug } from '@/lib/articles-data';
import type { Article } from '@/lib/articles-data';
import { parseLocalDate, todayLocalStr } from '@/lib/date';
import { Calendar, ChevronRight, ChevronLeft, Newspaper, Search, Lock } from 'lucide-react';
import { usePremium } from '@/hooks/usePremium';
import PaywallModal from '@/components/PaywallModal';
import ArticleDetailClient from '@/components/ArticleDetailClient';
import { getDailyHook, isJobDay } from '@/lib/tips';

const API_BASE = 'https://www.sonobuddy.com';
type ArticleMeta = Omit<Article, 'content'>;

// Slugs pre-rendered in the iOS bundle — these work offline via static route
const BUNDLED_SLUGS = new Set(ARTICLES.map((a) => a.slug));

function formatDate(dateStr: string) {
  return parseLocalDate(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
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

/* ── Article list — every article requires premium to open; title, excerpt,
   date, and tags stay visible to everyone as the preview. ─────────────────── */
function filterAndSort(list: ArticleMeta[]): ArticleMeta[] {
  const today = todayLocalStr();
  return list
    .filter((a) => a.date <= today)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

function ArticleList() {
  const [articles, setArticles] = useState<ArticleMeta[]>(() => filterAndSort(getAllArticles()));
  const [query, setQuery] = useState('');
  const router = useRouter();
  const {
    isPremium, paywallOpen, openPaywall, closePaywall, requestPurchase, requestRestore,
    shareUnlocked, requestShare, requestDiscountPurchase, purchaseError, clearPurchaseError,
  } = usePremium();

  // Whichever article today's home-screen hook points to is free to read —
  // same mechanism ArticleDetailClient uses, kept out of the static HTML (see
  // its comment) by only setting this after mount so there's no hydration
  // mismatch between the build-time date and the viewer's actual date.
  const [freeSlug, setFreeSlug] = useState<string | null>(null);
  useEffect(() => {
    setFreeSlug(!isJobDay() ? getDailyHook().articleSlug ?? null : null);
  }, []);

  useEffect(() => {
    fetch(`${API_BASE}/api/articles/`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (Array.isArray(data)) setArticles(filterAndSort(data)); })
      .catch(() => {});
  }, []);

  const q = query.trim().toLowerCase();
  const visibleArticles = q
    ? articles.filter((a) =>
        a.title.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q) ||
        a.tags.some((tag) => tag.toLowerCase().includes(q))
      )
    : articles;

  return (
    <div className="min-h-screen bg-white pb-nav">
      {paywallOpen && <PaywallModal
        onClose={closePaywall}
        onPurchase={requestPurchase}
        onRestore={requestRestore}
        shareUnlocked={shareUnlocked}
        onShare={requestShare}
        onDiscountPurchase={requestDiscountPurchase}
        purchaseError={purchaseError}
        onClearError={clearPurchaseError}
      />}

      <div className="bg-white border-b border-slate-100 px-5 pt-14 pb-4 sticky top-0 z-10">
        <div className="flex items-center gap-2.5">
          <Newspaper size={20} className="text-sky-500" strokeWidth={2} />
          <h1 className="text-[22px] font-black tracking-tight text-slate-900">Articles</h1>
        </div>
        <p className="text-[13px] text-slate-400 mt-0.5 mb-3">Tips, protocols &amp; career guides</p>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles…"
            className="w-full bg-slate-50 text-slate-700 placeholder-slate-400 text-[13px] rounded-xl pl-9 pr-3 py-2.5 outline-none focus:ring-1 focus:ring-sky-200"
          />
        </div>
      </div>

      <div className="px-4 pt-4 space-y-3">
        {visibleArticles.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-12">
            {q ? 'No articles match your search.' : 'No articles yet — check back soon.'}
          </p>
        ) : (
          visibleArticles.map((article) => {
            // Bundled articles → pre-rendered static page (works offline)
            // New API-only articles → ?slug= query on this same page (fetches live)
            const href = BUNDLED_SLUGS.has(article.slug)
              ? `/articles/${article.slug}`
              : `/articles?slug=${article.slug}`;
            const isFreeToday = article.slug === freeSlug;

            return (
              <button
                key={article.slug}
                onClick={() => (isPremium || isFreeToday) ? router.push(href) : openPaywall('articles')}
                className="w-full flex items-start justify-between gap-3 bg-white border border-slate-100 rounded-2xl px-4 py-4 shadow-sm active:bg-slate-50 transition-colors text-left"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Calendar size={11} className="text-slate-400 shrink-0" />
                    <span className="text-[11px] text-slate-400">{formatDate(article.date)}</span>
                    {isFreeToday && !isPremium && (
                      <span className="bg-emerald-50 text-emerald-600 text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full">
                        Free today
                      </span>
                    )}
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
                {isPremium || isFreeToday ? (
                  <ChevronRight size={16} className="text-slate-300 shrink-0 mt-1" />
                ) : (
                  <Lock size={14} className="text-slate-300 shrink-0 mt-1" />
                )}
              </button>
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

  return <ArticleDetailClient article={article} />;
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
