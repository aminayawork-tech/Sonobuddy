'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SearchBar from '@/components/SearchBar';
import { type SearchResult } from '@/lib/search';

const QUICK_LINKS = [
  { label: 'Carotid Duplex', href: '/protocols/carotid-duplex', icon: '🫀' },
  { label: 'DVT Protocol', href: '/protocols/dvt-lower', icon: '🦵' },
  { label: 'RUQ Abdomen', href: '/protocols/ruo', icon: '🫁' },
  { label: 'Thyroid US', href: '/protocols/thyroid-ultrasound', icon: '🦋' },
  { label: 'ABI Calc', href: '/calculators?id=abi', icon: '🧮' },
  { label: 'AFI Calc', href: '/calculators?id=afi', icon: '🤰' },
];

const CATEGORY_TILES = [
  { label: 'Measurements', href: '/measurements', icon: '📏', desc: 'Normal values + ranges', color: 'from-blue-50 to-sky-100 border-blue-200' },
  { label: 'Protocols', href: '/protocols', icon: '📋', desc: 'Step-by-step exam guides', color: 'from-green-50 to-emerald-100 border-green-200' },
  { label: 'Calculators', href: '/calculators', icon: '🧮', desc: 'ABI, RI, volume, OB…', color: 'from-purple-50 to-violet-100 border-purple-200' },
  { label: 'Pathologies', href: '/pathologies', icon: '🔬', desc: 'US findings + red flags', color: 'from-red-50 to-rose-100 border-red-200' },
];

export default function HomePage() {
  const router = useRouter();

  function handleSearchSelect(result: SearchResult) {
    router.push(result.href);
  }

  return (
    <div className="min-h-screen pb-nav">
      {/* Header */}
      <div className="px-4 pt-12 pb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">🩺</span>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">SonoBuddy</h1>
        </div>
        <p className="text-sono-muted text-sm">Your pocket sono reference</p>
      </div>

      {/* Search */}
      <div className="px-4 mb-6">
        <SearchBar
          placeholder='Try "aorta" or "carotid protocol"…'
          onSelect={handleSearchSelect}
        />
      </div>

      {/* Quick Links */}
      <div className="px-4 mb-6">
        <h2 className="text-xs font-semibold text-sono-muted uppercase tracking-wider mb-3">Quick Access</h2>
        <div className="grid grid-cols-3 gap-2">
          {QUICK_LINKS.map((link) => (
            <button
              key={link.href}
              onClick={() => router.push(link.href)}
              className="bg-sono-card border border-sono-border rounded-xl p-3 text-center hover:border-sono-blue/50 hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
            >
              <div className="text-2xl mb-1">{link.icon}</div>
              <div className="text-[11px] text-slate-700 font-medium leading-tight">{link.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Category Tiles */}
      <div className="px-4 mb-6">
        <h2 className="text-xs font-semibold text-sono-muted uppercase tracking-wider mb-3">Browse</h2>
        <div className="grid grid-cols-2 gap-3">
          {CATEGORY_TILES.map((tile) => (
            <button
              key={tile.href}
              onClick={() => router.push(tile.href)}
              className={`bg-gradient-to-br ${tile.color} border rounded-2xl p-4 text-left hover:opacity-90 transition-all active:scale-95 shadow-sm`}
            >
              <div className="text-3xl mb-2">{tile.icon}</div>
              <div className="font-semibold text-slate-800 text-sm">{tile.label}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">{tile.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Tip of the Day */}
      <div className="px-4 mb-6">
        <div className="bg-sono-card border border-sono-blue/30 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-base">💡</span>
            <span className="text-xs font-semibold text-sono-blue uppercase tracking-wider">Tip</span>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed">
            The &ldquo;superficial&rdquo; femoral vein is part of the <span className="text-slate-900 font-medium">deep</span> venous system.
            DVT here still requires anticoagulation — never let the name confuse you or your ordering provider.
          </p>
        </div>
      </div>

      {/* Version */}
      <div className="px-4 pb-4 text-center">
        <p className="text-[11px] text-sono-muted">SonoBuddy v0.1 · MVP · Made for sonographers</p>
      </div>
    </div>
  );
}
