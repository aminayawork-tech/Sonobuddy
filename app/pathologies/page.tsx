'use client';

import { useState, useMemo } from 'react';
import { Microscope, X } from 'lucide-react';
import Image from 'next/image';
import { pathologies, searchPathologies, type PathologyCategory, type PathologyImage } from '@/data/pathologies';
import clsx from 'clsx';

const CATEGORY_LABELS: Record<PathologyCategory, string> = {
  vascular: 'Vascular',
  abdomen: 'Abdomen',
  ob: 'OB/GYN',
  thyroid: 'Thyroid',
  cardiac: 'Cardiac',
  msk: 'MSK',
  superficial: 'Superficial',
};

const CATEGORY_COLORS: Record<PathologyCategory, string> = {
  vascular: 'bg-red-100 text-red-700 border-red-200',
  abdomen: 'bg-amber-100 text-amber-700 border-amber-200',
  ob: 'bg-pink-100 text-pink-700 border-pink-200',
  thyroid: 'bg-purple-100 text-purple-700 border-purple-200',
  cardiac: 'bg-blue-100 text-blue-700 border-blue-200',
  msk: 'bg-green-100 text-green-700 border-green-200',
  superficial: 'bg-teal-100 text-teal-700 border-teal-200',
};

type Category = PathologyCategory | 'all';

export default function PathologiesPage() {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<PathologyImage | null>(null);

  const filtered = useMemo(() => {
    let results = query ? searchPathologies(query) : pathologies;
    if (activeCategory !== 'all') {
      results = results.filter((p) => p.category === activeCategory);
    }
    return results;
  }, [query, activeCategory]);

  return (
    <div className="min-h-screen pb-nav">
      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white"
            onClick={() => setLightbox(null)}
          >
            <X className="w-7 h-7" />
          </button>
          <div className="relative w-full max-w-lg max-h-[75vh]" onClick={(e) => e.stopPropagation()}>
            <Image
              src={lightbox.src}
              alt={lightbox.caption}
              width={800}
              height={600}
              className="rounded-xl object-contain w-full max-h-[75vh]"
            />
          </div>
          <p className="text-white/80 text-sm mt-3 text-center max-w-sm">{lightbox.caption}</p>
          {lightbox.credit && (
            <p className="text-white/40 text-[11px] mt-1 text-center max-w-sm">{lightbox.credit}</p>
          )}
        </div>
      )}

      {/* Header */}
      <div className="sticky top-0 z-40 bg-sono-dark/95 backdrop-blur-sm border-b border-sono-border">
        <div className="px-4 pt-12 pb-3">
          <h1 className="text-xl font-black tracking-tight text-slate-900 mb-3 flex items-center gap-2"><Microscope className="w-5 h-5 text-sono-blue" /> Pathologies</h1>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Search "DVT", "cholecystitis", "fatty liver"…'
            className="w-full bg-sono-card border border-sono-border rounded-xl px-4 py-2.5 text-slate-900 placeholder-sono-muted focus:outline-none focus:border-sono-blue text-sm shadow-sm"
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
                  <h3 className="font-semibold text-slate-900 text-[15px] mb-1">{p.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className={clsx('text-[11px] px-2 py-0.5 rounded-full border font-medium', CATEGORY_COLORS[p.category])}>
                      {CATEGORY_LABELS[p.category]}
                    </span>
                    <span className="text-[11px] text-red-600">⚠ {p.redFlags.length} red flags</span>
                  </div>
                </div>
                <span className="text-sono-muted text-lg shrink-0 mt-0.5 transition-transform" style={{ transform: isExpanded ? 'rotate(180deg)' : 'none' }}>
                  ⌄
                </span>
              </button>

              {isExpanded && (
                <div className="border-t border-sono-border divide-y divide-sono-border">
                  {/* Clinical context */}
                  <div className="px-4 py-3">
                    <p className="text-[10px] font-bold text-sono-blue uppercase tracking-[0.1em] mb-1.5">Clinical Context</p>
                    <p className="text-[13px] text-slate-700 leading-relaxed">{p.clinicalContext}</p>
                  </div>

                  {/* US Findings */}
                  <div className="px-4 py-3">
                    <p className="text-[10px] font-bold text-sono-blue uppercase tracking-[0.1em] mb-2">Ultrasound Findings</p>
                    <ul className="space-y-1.5">
                      {p.ultrasoundFindings.map((f, i) => (
                        <li key={i} className="flex gap-2 text-[13px] text-slate-700">
                          <span className="text-sono-blue shrink-0">•</span>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Red Flags */}
                  <div className="px-4 py-3 bg-red-50">
                    <p className="text-[10px] font-bold text-red-700 uppercase tracking-[0.1em] mb-2">⚠ Red Flags</p>
                    <ul className="space-y-1.5">
                      {p.redFlags.map((f, i) => (
                        <li key={i} className="flex gap-2 text-[13px] text-red-800">
                          <span className="shrink-0">!</span>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Differentials */}
                  <div className="px-4 py-3">
                    <p className="text-[10px] font-bold text-sono-blue uppercase tracking-[0.1em] mb-2">Differentials</p>
                    <ul className="space-y-1.5">
                      {p.differentials.map((d, i) => (
                        <li key={i} className="text-[13px] text-slate-700 flex gap-2">
                          <span className="text-slate-500 shrink-0">vs</span>
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Reporting Tips */}
                  <div className="px-4 py-3 bg-amber-50">
                    <p className="text-[10px] font-bold text-amber-700 uppercase tracking-[0.1em] mb-1.5">Reporting Tips</p>
                    <p className="text-[13px] text-amber-800 leading-relaxed">{p.reportingTips}</p>
                  </div>

                  {/* Images */}
                  {p.images && p.images.length > 0 && (
                    <div className="px-4 py-3">
                      <p className="text-[10px] font-bold text-sono-blue uppercase tracking-[0.1em] mb-2">Ultrasound Images</p>
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {p.images.map((img, i) => (
                          <button
                            key={i}
                            onClick={() => setLightbox(img)}
                            className="shrink-0 rounded-xl overflow-hidden border border-sono-border active:scale-95 transition-transform"
                          >
                            <Image
                              src={img.src}
                              alt={img.caption}
                              width={120}
                              height={90}
                              className="object-cover w-[120px] h-[90px]"
                            />
                            <p className="text-[10px] text-sono-muted px-2 py-1 max-w-[120px] truncate">{img.caption}</p>
                          </button>
                        ))}
                      </div>
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
