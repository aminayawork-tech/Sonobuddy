'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { globalSearch, type SearchResult, TYPE_LABELS, TYPE_COLORS, TYPE_ICONS } from '@/lib/search';
import clsx from 'clsx';

type Props = {
  placeholder?: string;
  autoFocus?: boolean;
  onSelect?: (result: SearchResult) => void;
};

export default function SearchBar({ placeholder = 'Search measurements, protocols, calculators…', autoFocus, onSelect }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }
    const found = globalSearch(query);
    setResults(found.slice(0, 12));
    setOpen(found.length > 0);
  }, [query]);

  function handleSelect(result: SearchResult) {
    setQuery('');
    setOpen(false);
    if (onSelect) {
      onSelect(result);
    } else {
      router.push(result.href);
    }
  }

  return (
    <div className="relative w-full">
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sono-muted text-lg">🔍</span>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="w-full bg-sono-card border border-sono-border rounded-xl pl-10 pr-4 py-3.5 text-white placeholder-sono-muted focus:outline-none focus:border-sono-blue text-sm transition-colors"
          onKeyDown={(e) => {
            if (e.key === 'Escape') { setOpen(false); setQuery(''); }
            if (e.key === 'Enter' && results.length > 0) handleSelect(results[0]);
          }}
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setOpen(false); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-sono-muted hover:text-white transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-sono-card border border-sono-border rounded-xl shadow-2xl z-50 max-h-80 overflow-y-auto">
          {results.map((result) => (
            <button
              key={`${result.type}-${result.id}`}
              onClick={() => handleSelect(result)}
              className="w-full flex items-start gap-3 px-4 py-3 hover:bg-slate-700/50 transition-colors text-left border-b border-sono-border/50 last:border-0"
            >
              <span className="text-lg mt-0.5 shrink-0">{TYPE_ICONS[result.type]}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-medium text-white truncate">{result.name}</span>
                  <span className={clsx('text-[10px] px-1.5 py-0.5 rounded border font-medium shrink-0', TYPE_COLORS[result.type])}>
                    {TYPE_LABELS[result.type]}
                  </span>
                </div>
                <p className="text-xs text-sono-muted truncate">{result.subtitle}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
