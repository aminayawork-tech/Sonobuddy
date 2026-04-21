'use client';

import { Lock, X, CheckCircle2 } from 'lucide-react';

interface Props {
  onClose: () => void;
  onPurchase: () => void;
  onRestore: () => void;
}

const FEATURES = [
  { label: 'All measurement reference tables', sub: '20+ vascular, OB, thyroid, cardiac, abdominal' },
  { label: 'All exam protocols',               sub: 'Step-by-step guides with key images & checklists' },
  { label: 'All clinical calculators',         sub: 'ABI, RI, gestational age, EDD, thyroid volume & more' },
  { label: 'Full pathology library',           sub: '50+ conditions with red flags & reporting tips' },
];

export default function PaywallModal({ onClose, onPurchase, onRestore }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-12 right-4 text-slate-400 hover:text-slate-700 p-2"
        aria-label="Close"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-6 pt-14 pb-8">
        {/* Icon + heading */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-sky-100 flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-[#0EA5E9]" />
          </div>
          <h2 className="text-2xl font-black tracking-tight mb-2">
            <span className="text-slate-900">Unlock Sono</span><span className="text-[#0EA5E9]">Buddy</span><span className="text-slate-900"> Pro</span>
          </h2>
          <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
            You&apos;ve tried the free preview. Get instant access to every
            measurement, protocol, calculator, and pathology.
          </p>
        </div>

        {/* Feature list */}
        <div className="space-y-3 mb-8">
          {FEATURES.map(({ label, sub }) => (
            <div key={label} className="flex items-start gap-3 bg-slate-50 border border-slate-100 rounded-xl p-4">
              <CheckCircle2 className="w-5 h-5 text-[#0EA5E9] shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-slate-900 leading-snug">{label}</p>
                <p className="text-xs text-slate-500 mt-0.5 leading-snug">{sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Social proof */}
        <p className="text-center text-slate-400 text-xs mb-6">
          Used by sonographers at hospitals across the US
        </p>
      </div>

      {/* Sticky purchase footer */}
      <div className="px-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-4 border-t border-slate-100 bg-white">
        <button
          onClick={onPurchase}
          className="w-full bg-[#0EA5E9] hover:bg-sky-400 active:scale-[0.98] text-white font-bold py-4 rounded-2xl text-base transition-all shadow-lg shadow-sky-200/60"
        >
          Unlock Full Access — $9.99
        </button>
        <p className="text-center text-slate-400 text-[11px] mt-2 mb-1">
          One-time purchase · No subscription · Offline access
        </p>
        <button
          onClick={onRestore}
          className="w-full text-slate-400 text-xs py-2 hover:text-slate-700 transition-colors"
        >
          Restore Purchase
        </button>
      </div>
    </div>
  );
}
