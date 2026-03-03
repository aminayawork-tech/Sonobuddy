'use client';

import { useState, useMemo } from 'react';
import { pathologies, searchPathologies, type PathologyCategory } from '@/data/pathologies';
import clsx from 'clsx';

const CATEGORY_LABELS: Record<PathologyCategory, string> = {
  vascular: 'Vascular',
  abdomen: 'Abdomen',
  ob: 'OB/GYN',
  thyroid: 'Thyroid',
  cardiac: 'Cardiac',
};

const CATEGORY_COLORS: Record<PathologyCategory, string> = {
  vascular: 'bg-red-900/40 text-red-300 border-red-700',
  abdomen: 'bg-amber-900/40 text-amber-300 border-amber-700',
  ob: 'bg-pink-900/40 text-pink-300 border-pink-700',
  thyroid: 'bg-purple-900/40 text-purple-300 border-purple-700',
  cardiac: 'bg-blue-900/40 text-blue-300 border-blue-700',
};

type Category = PathologyCategory | 'all';

export default function PathologiesPage() {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let results = query ? searchPathologies(query) : pathologies;
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
          <h1 className="text-xl font-bold text-white mb-3">🔬 Pathologies</h1>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Search "DVT", "cholecystitis", "fatty liver"…'
            className="w-full bg-sono-card border border-sono-border rounded-xl px-4 py-2.5 text-white placeholder-sono-muted focus:outline-none focus:border-sono-blue text-sm"
          />
        </div>
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto">
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
          {(Object.entries(CATEGORY_LABELS) as [PathologyCategory, string][]).map(([cat, label]) => (
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
        <p className="text-xs text-sono-muted">{filtered.length} patholog{filtered.length !== 1 ? 'ies' : 'y'}</p>
      </div>

      <div className="px-4 space-y-3 pb-4">
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sono-muted text-sm">No pathologies found for &ldquo;{query}&rdquo;</p>
          </div>
        )}

        {filtered.map((p) => {
          const isExpanded = expandedId === p.id;
          return (
            <div key={p.id} className="bg-sono-card border border-sono-border rounded-2xl overflow-hidden">
              <button
                className="w-full px-4 py-4 text-left flex items-start justify-between gap-3"
                onClick={() => setExpandedId(isExpanded ? null : p.id)}
              >
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-white text-sm mb-1">{p.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className={clsx('text-[11px] px-2 py-0.5 rounded-full border font-medium', CATEGORY_COLORS[p.category])}>
                      {CATEGORY_LABELS[p.category]}
                    </span>
                    <span className="text-[11px] text-red-400">⚠ {p.redFlags.length} red flags</span>
                  </div>
                </div>
                <span className="text-sono-muted text-lg shrink-0 mt-0.5 transition-transform" style={{ transform: isExpanded ? 'rotate(180deg)' : 'none' }}>
                  ⌄
                </span>
              </button>

              {isExpanded && (
                <div className="border-t border-sono-border/50 divide-y divide-sono-border/30">
                  {/* Clinical context */}
                  <div className="px-4 py-3">
                    <p className="text-[11px] font-semibold text-sono-blue uppercase tracking-wide mb-1">Clinical Context</p>
                    <p className="text-xs text-slate-300 leading-relaxed">{p.clinicalContext}</p>
                  </div>

                  {/* US Findings */}
                  <div className="px-4 py-3">
                    <p className="text-[11px] font-semibold text-sono-blue uppercase tracking-wide mb-2">Ultrasound Findings</p>
                    <ul className="space-y-1">
                      {p.ultrasoundFindings.map((f, i) => (
                        <li key={i} className="flex gap-2 text-xs text-slate-300">
                          <span className="text-sono-blue shrink-0">•</span>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Red Flags */}
                  <div className="px-4 py-3 bg-red-950/20">
                    <p className="text-[11px] font-semibold text-red-400 uppercase tracking-wide mb-2">⚠ Red Flags</p>
                    <ul className="space-y-1">
                      {p.redFlags.map((f, i) => (
                        <li key={i} className="flex gap-2 text-xs text-red-300">
                          <span className="shrink-0">!</span>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Differentials */}
                  <div className="px-4 py-3">
                    <p className="text-[11px] font-semibold text-sono-blue uppercase tracking-wide mb-2">Differentials</p>
                    <ul className="space-y-1">
                      {p.differentials.map((d, i) => (
                        <li key={i} className="text-xs text-slate-400 flex gap-2">
                          <span className="text-slate-600 shrink-0">vs</span>
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Reporting Tips */}
                  <div className="px-4 py-3 bg-amber-950/20">
                    <p className="text-[11px] font-semibold text-amber-400 uppercase tracking-wide mb-1">Reporting Tips</p>
                    <p className="text-xs text-amber-200/80 leading-relaxed">{p.reportingTips}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
