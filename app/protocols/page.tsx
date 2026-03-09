'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ClipboardList, Clock, Zap } from 'lucide-react';
import { protocols, searchProtocols, PROTOCOL_CATEGORY_LABELS, DIFFICULTY_COLORS, type ProtocolCategory } from '@/data/protocols';
import clsx from 'clsx';

const CATEGORIES = Object.entries(PROTOCOL_CATEGORY_LABELS) as [ProtocolCategory, string][];

export default function ProtocolsPage() {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<ProtocolCategory | 'all'>('all');
  const router = useRouter();

  const filtered = useMemo(() => {
    let results = query ? searchProtocols(query) : protocols;
    if (activeCategory !== 'all') {
      results = results.filter((p) => p.category === activeCategory);
    }
    return results;
  }, [query, activeCategory]);

  return (
    <div className="min-h-screen pb-nav">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-sono-dark/95 backdrop-blur-sm border-b border-sono-border">
        <div className="px-4 pt-12 pb-3">
          <h1 className="text-xl font-bold text-slate-100 mb-3 flex items-center gap-2"><ClipboardList className="w-5 h-5 text-sono-blue" /> Protocols</h1>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Search "carotid", "DVT", "thyroid"…'
            className="w-full bg-sono-card border border-sono-border rounded-xl px-4 py-2.5 text-slate-100 placeholder-sono-muted focus:outline-none focus:border-sono-blue text-sm shadow-sm"
          />
        </div>
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setActiveCategory('all')}
            className={clsx(
              'shrink-0 text-xs px-3 py-1.5 rounded-full border font-medium transition-colors',
              activeCategory === 'all'
                ? 'bg-sono-blue text-white border-sono-blue'
                : 'bg-transparent text-sono-muted border-sono-border'
            )}
          >
            All
          </button>
          {CATEGORIES.map(([cat, label]) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={clsx(
                'shrink-0 text-xs px-3 py-1.5 rounded-full border font-medium transition-colors',
                activeCategory === cat
                  ? 'bg-sono-blue text-white border-sono-blue'
                  : 'bg-transparent text-sono-muted border-sono-border'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-2">
        <p className="text-xs text-sono-muted">{filtered.length} protocol{filtered.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="px-4 space-y-3 pb-4">
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sono-muted text-sm">No protocols found for &ldquo;{query}&rdquo;</p>
          </div>
        )}
        {filtered.map((p) => (
          <button
            key={p.id}
            onClick={() => router.push(`/protocols/${p.id}`)}
            className="w-full bg-sono-card border border-sono-border rounded-2xl p-4 text-left hover:border-sono-blue/50 transition-all active:scale-[0.98] shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-slate-100 text-sm mb-1">{p.name}</h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={clsx('text-[11px] px-2 py-0.5 rounded border font-medium', DIFFICULTY_COLORS[p.difficulty])}>
                    {p.difficulty}
                  </span>
                  <span className="text-[11px] text-sono-muted flex items-center gap-0.5"><Clock className="w-3 h-3" /> {p.duration}</span>
                  <span className="text-[11px] text-sono-muted flex items-center gap-0.5"><Zap className="w-3 h-3" /> {p.probe.split(' ')[0]}</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-2 line-clamp-2">{p.indication}</p>
              </div>
              <span className="text-sono-muted shrink-0 mt-1">›</span>
            </div>
            <div className="flex items-center gap-1 mt-3 text-[11px] text-sono-muted">
              <span>{p.steps.length} steps</span>
              <span>·</span>
              <span>{p.keyImages.length} key images</span>
              <span>·</span>
              <span>{p.reportChecklist.length} report items</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
