'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SearchBar from '@/components/SearchBar';
import { type SearchResult } from '@/lib/search';

const QUICK_LINKS = [
  { label: 'Carotid Duplex', href: '/protocols/carotid-duplex', icon: '🫀' },
  { label: 'DVT Lower', href: '/protocols/dvt-lower', icon: '🦵' },
  { label: 'UE Arterial', href: '/protocols/ue-arterial', icon: '💪' },
  { label: 'Echo / TTE', href: '/protocols/echo-tte', icon: '❤️' },
  { label: 'Pelvic US', href: '/protocols/pelvic-us', icon: '🩻' },
  { label: 'Thyroid US', href: '/protocols/thyroid-ultrasound', icon: '🦋' },
  { label: 'ABI Calc', href: '/calculators?id=abi', icon: '🧮' },
  { label: 'Carotid Stenosis', href: '/calculators?id=carotid-stenosis', icon: '📊' },
  { label: 'AVF Surveillance', href: '/protocols/av-fistula-graft', icon: '🔗' },
];

const CATEGORY_TILES = [
  { label: 'Measurements', href: '/measurements', icon: '📏', desc: 'Normal values + ranges', color: 'from-sky-50 to-blue-100 border-blue-200', iconBg: 'bg-blue-100' },
  { label: 'Protocols', href: '/protocols', icon: '📋', desc: 'Step-by-step exam guides', color: 'from-emerald-50 to-green-100 border-green-200', iconBg: 'bg-green-100' },
  { label: 'Calculators', href: '/calculators', icon: '🧮', desc: 'ABI, RI, stenosis, OB…', color: 'from-violet-50 to-purple-100 border-purple-200', iconBg: 'bg-purple-100' },
  { label: 'Pathologies', href: '/pathologies', icon: '🔬', desc: 'US findings + red flags', color: 'from-rose-50 to-red-100 border-red-200', iconBg: 'bg-red-100' },
];

export default function HomePage() {
  const router = useRouter();

  function handleSearchSelect(result: SearchResult) {
    router.push(result.href);
  }

  return (
    <div className="min-h-screen pb-nav bg-sono-dark">
      {/* Gradient Hero Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-sky-100 via-blue-50 to-transparent pointer-events-none" />
        <div className="relative px-5 pt-14 pb-7">
          <div className="flex items-center gap-2.5 mb-1">
            <span className="text-3xl">🩺</span>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">SonoBuddy</h1>
          </div>
          <p className="text-sono-muted text-sm font-medium">Your pocket sonographer reference</p>
        </div>
      </div>

      {/* Search */}
      <div className="px-5 mb-7">
        <SearchBar
          placeholder='Search protocols, measurements, calcs…'
          onSelect={handleSearchSelect}
        />
      </div>

      {/* Category Tiles */}
      <div className="px-5 mb-7">
        <p className="text-[11px] font-bold text-sono-muted uppercase tracking-widest mb-3">Browse</p>
        <div className="grid grid-cols-2 gap-3">
          {CATEGORY_TILES.map((tile) => (
            <button
              key={tile.href}
              onClick={() => router.push(tile.href)}
              className={`bg-gradient-to-br ${tile.color} border rounded-2xl p-4 text-left active:scale-95 transition-all shadow-sm`}
            >
              <div className={`${tile.iconBg} w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3`}>
                {tile.icon}
              </div>
              <div className="font-bold text-slate-800 text-sm">{tile.label}</div>
              <div className="text-[11px] text-slate-500 mt-0.5 font-medium">{tile.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div className="px-5 mb-7">
        <p className="text-[11px] font-bold text-sono-muted uppercase tracking-widest mb-3">Quick Access</p>
        <div className="grid grid-cols-3 gap-2">
          {QUICK_LINKS.map((link) => (
            <button
              key={link.href}
              onClick={() => router.push(link.href)}
              className="bg-sono-card border border-sono-border rounded-2xl py-3 px-2 text-center active:scale-95 transition-all shadow-sm"
            >
              <div className="text-2xl mb-1.5">{link.icon}</div>
              <div className="text-[10px] text-slate-600 font-semibold leading-tight">{link.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Tip Card */}
      <div className="px-5 mb-6">
        <div className="bg-sono-card border border-sono-border rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-sky-100 rounded-lg w-7 h-7 flex items-center justify-center text-sm">💡</div>
            <span className="text-xs font-bold text-sono-blue uppercase tracking-widest">Sono Tip</span>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed font-medium">
            The &ldquo;superficial&rdquo; femoral vein is part of the <span className="text-slate-900 font-bold">deep</span> venous system — DVT here still requires anticoagulation. Never let the name mislead you or your provider.
          </p>
        </div>
      </div>

      <div className="px-5 pb-4 text-center">
        <p className="text-[11px] text-sono-muted">SonoBuddy · Made for sonographers</p>
      </div>
    </div>
  );
}
