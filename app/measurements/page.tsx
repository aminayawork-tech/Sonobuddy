'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { Ruler } from 'lucide-react';
import { measurements, searchMeasurements, CATEGORY_LABELS, CATEGORY_COLORS, type MeasurementCategory } from '@/data/measurements';
import RangeBar from '@/components/RangeBar';
import clsx from 'clsx';

const CATEGORIES = Object.entries(CATEGORY_LABELS) as [MeasurementCategory, string][];

export default function MeasurementsPage() {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<MeasurementCategory | 'all'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const filtered = useMemo(() => {
    let results = query ? searchMeasurements(query) : measurements;
    if (activeCategory !== 'all') {
      results = results.filter((m) => m.category === activeCategory);
    }
    return results;
  }, [query, activeCategory]);

  // Smooth-scroll the opened card into view below the sticky header
  useEffect(() => {
    if (!expandedId) return;
    const el = cardRefs.current.get(expandedId);
    if (!el) return;
    const timer = setTimeout(() => {
      const stickyHeight = 145;
      const rect = el.getBoundingClientRect();
      if (rect.top < stickyHeight || rect.bottom > window.innerHeight) {
        const targetY = window.scrollY + rect.top - stickyHeight - 8;
        window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [expandedId]);

  return (
    <div className="min-h-screen pb-nav">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-sono-dark/95 backdrop-blur-sm border-b border-sono-border">
        <div className="px-4 pt-12 pb-3">
          <h1 className="text-xl font-black tracking-tight text-slate-900 mb-3 flex items-center gap-2"><Ruler className="w-5 h-5 text-sono-blue" /> Measurements</h1>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Search "aorta", "BPD", "endometrium"…'
            className="w-full bg-sono-card border border-sono-border rounded-xl px-4 py-2.5 text-slate-900 placeholder-sono-muted focus:outline-none focus:border-sono-blue text-sm shadow-sm"
          />
        </div>
        {/* Category filter */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setActiveCategory('all')}
            className={clsx(
              'shrink-0 text-xs px-3 py-1.5 rounded-full border font-medium transition-colors',
              activeCategory === 'all'
                ? 'bg-sono-blue text-white border-sono-blue'
                : 'bg-transparent text-sono-muted border-sono-border hover:border-slate-400'
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
                  : 'bg-transparent text-sono-muted border-sono-border hover:border-slate-400'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <div className="px-4 py-2">
        <p className="text-xs text-sono-muted">{filtered.length} measurement{filtered.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Measurement list */}
      <div className="px-4 space-y-3 pb-4">
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sono-muted text-sm">No measurements found for &ldquo;{query}&rdquo;</p>
          </div>
        )}
        {filtered.map((m) => {
          const isExpanded = expandedId === m.id;
          return (
            <div
              key={m.id}
              ref={(el) => { if (el) cardRefs.current.set(m.id, el); else cardRefs.current.delete(m.id); }}
              className="bg-sono-card border border-sono-border rounded-2xl overflow-hidden shadow-sm"
            >
              <button
                className="w-full px-4 py-4 text-left flex items-start justify-between gap-3"
                onClick={() => setExpandedId(isExpanded ? null : m.id)}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-[15px] font-semibold text-slate-900">{m.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={clsx('text-[11px] px-2 py-0.5 rounded-full border font-medium', CATEGORY_COLORS[m.category])}>
                      {CATEGORY_LABELS[m.category]}
                    </span>
                    {m.subcategory && (
                      <span className="text-[11px] text-sono-muted">{m.subcategory}</span>
                    )}
                  </div>
                </div>
                <span className="text-sono-muted text-lg mt-0.5 shrink-0 transition-transform" style={{ transform: isExpanded ? 'rotate(180deg)' : 'none' }}>
                  ⌄
                </span>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 border-t border-sono-border pt-3 space-y-3">
                  <RangeBar ranges={m.ranges} />
                  {m.clinicalNote && (
                    <div className="bg-slate-50 rounded-xl p-3">
                      <p className="text-[10px] font-bold text-sono-blue uppercase tracking-[0.1em] mb-1.5">Clinical Note</p>
                      <p className="text-[13px] text-slate-700 leading-relaxed">{m.clinicalNote}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
