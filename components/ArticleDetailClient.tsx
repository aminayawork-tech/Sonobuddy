'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ArticleImage from '@/components/ArticleImage';
import { Calendar, ChevronLeft } from 'lucide-react';
import ProUpsellCard from '@/components/ProUpsellCard';
import { usePremium } from '@/hooks/usePremium';
import PaywallModal from '@/components/PaywallModal';
import { parseLocalDate } from '@/lib/date';
import { getDailyHook, isJobDay } from '@/lib/tips';
import type { Article } from '@/lib/articles-data';

const PROSE_CLASSES = `
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
`;

function ArticleBody({ content }: { content: string }) {
  return (
    <div className={PROSE_CLASSES}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Wide tables get their own horizontal scroll so they
          // never force the whole page to scroll sideways.
          table: ({ ...props }) => (
            <div className="overflow-x-auto">
              <table {...props} />
            </div>
          ),
          img: ({ src, alt, title }) => (
            <ArticleImage src={typeof src === 'string' ? src : undefined} alt={alt} title={title} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

const PREVIEW_MAX_CHARS = 1600;

/**
 * The free preview for locked articles: the intro plus the first section,
 * capped so a long opening section can't give the whole article away. Cuts
 * only on blank-line block boundaries so a table or list is never split.
 */
function previewOf(content: string): string {
  const headings = Array.from(content.matchAll(/^## /gm), (m) => m.index ?? 0);
  let cut = headings.length >= 2 ? headings[1] : content.length;
  if (cut > PREVIEW_MAX_CHARS) {
    const block = content.lastIndexOf('\n\n', PREVIEW_MAX_CHARS);
    cut = block > 300 ? block : PREVIEW_MAX_CHARS;
  }
  // Never end the preview on a dangling heading.
  return content.slice(0, cut).trim().replace(/(\n+#{1,6} [^\n]*)+$/, '').trim();
}


function formatDateLong(dateStr: string) {
  return parseLocalDate(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

export default function ArticleDetailClient({ article }: { article: Article }) {
  const {
    isPremium, paywallOpen, openPaywall, closePaywall, requestPurchase, requestRestore,
    shareUnlocked, requestShare, requestDiscountPurchase, purchaseError, clearPurchaseError,
  } = usePremium();

  // Reached directly (deep link, bookmark, or the home screen's "Read full
  // article" button, which navigates here unconditionally) rather than only
  // through the list's own gate, so this needs its own independent check —
  // set after mount, same as the home page's hook, to avoid a hydration
  // mismatch against the build-time date.
  const [freeToday, setFreeToday] = useState(false);
  useEffect(() => {
    setFreeToday(!isJobDay() && getDailyHook().articleSlug === article.slug);
  }, [article.slug]);

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
          {freeToday && !isPremium && (
            <span className="bg-emerald-50 text-emerald-600 text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full">
              Free today
            </span>
          )}
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

        {isPremium || freeToday ? (
          <>
            <ArticleBody content={article.content} />

            <div className="mt-10 bg-sky-50 border border-sky-100 rounded-2xl p-5 text-center">
              <p className="text-xl font-black tracking-tight mb-1">
                <span className="text-slate-900">Sono</span><span className="text-sky-500">Buddy</span>
              </p>
              <p className="text-slate-500 text-[13px] mb-4 leading-relaxed">
                All reference tools in one app, measurements, protocols, calculators, pathologies. Works offline.
              </p>
              <Link
                href="/home"
                className="inline-flex items-center gap-2 bg-sky-500 text-white font-bold text-[14px] px-6 py-3 rounded-xl active:bg-sky-600 transition-colors"
              >
                Open App
              </Link>
            </div>
          </>
        ) : (
          <>
            {/* Preview fades out rather than stopping dead, so it reads as
                "there's more" — the opening is shown in full to earn the tap. */}
            <div className="relative max-h-[880px] overflow-hidden">
              <ArticleBody content={previewOf(article.content)} />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-white/0 via-white/85 to-white" />
            </div>

            <ProUpsellCard
              className="relative -mt-2"
              title="Keep reading with SonoBuddy Pro"
              subtitle="Finish this article and unlock the full library."
              onUnlock={() => openPaywall('article-preview')}
            />
          </>
        )}
      </div>
    </div>
  );
}
