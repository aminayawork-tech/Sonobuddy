import Link from 'next/link';
import { getAllArticles } from '@/lib/articles-data';
import { Calendar, ChevronRight, Newspaper } from 'lucide-react';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

export default function ArticlesPage() {
  const articles = getAllArticles();

  return (
    <div className="min-h-screen bg-white pb-nav">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-5 pt-14 pb-4 sticky top-0 z-10">
        <div className="flex items-center gap-2.5">
          <Newspaper size={20} className="text-sky-500" strokeWidth={2} />
          <h1 className="text-[22px] font-black tracking-tight text-slate-900">Articles</h1>
        </div>
        <p className="text-[13px] text-slate-400 mt-0.5">Tips, protocols &amp; career guides</p>
      </div>

      {/* Post list */}
      <div className="px-4 pt-4 space-y-3">
        {articles.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-12">No articles yet — check back soon.</p>
        ) : (
          articles.map((article) => (
            <Link
              key={article.slug}
              href={`/articles/${article.slug}`}
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
          ))
        )}
      </div>
    </div>
  );
}
