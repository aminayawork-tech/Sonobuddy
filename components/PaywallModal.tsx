'use client';

import { useEffect, useState } from 'react';
import { recordEvent } from '@/lib/tap-tracking';

import { Lock, X, CheckCircle2, Share2, PartyPopper } from 'lucide-react';

interface Props {
  onClose: () => void;
  onPurchase: () => void;
  onRestore: () => void;
  shareUnlocked: boolean;
  onShare: () => void;
  onDiscountPurchase: () => void;
  purchaseError: string | null;
  onClearError: () => void;
}

const FEATURES = [
  { label: 'All measurement reference tables', sub: '20+ vascular, OB, thyroid, cardiac, abdominal' },
  { label: 'All exam protocols',               sub: 'Step-by-step guides with key images & checklists' },
  { label: 'All clinical calculators',         sub: 'ABI, RI, gestational age, EDD, thyroid volume & more' },
  { label: 'Full pathology library',           sub: '50+ conditions with red flags & reporting tips' },
];

// The X button interrupts the FIRST time someone tries to leave the main
// pricing screen — 'offer' asks them to share for a discount, or if they've
// already shared before, 'discount' goes straight to the cheaper purchase.
// Any exit from either of those actually closes the modal.
type Screen = 'main' | 'offer' | 'discount';

export default function PaywallModal({
  onClose, onPurchase, onRestore,
  shareUnlocked, onShare, onDiscountPurchase,
  purchaseError, onClearError,
}: Props) {
  const [screen, setScreen] = useState<Screen>('main');

  // Instrumented here rather than at each call site — the modal is rendered
  // from six screens and they should all report the funnel identically.
  useEffect(() => { recordEvent('paywall:shown'); }, []);

  // The share sheet completing is reported async from native. If that lands
  // while the offer screen is still up, move straight to the discounted
  // purchase rather than making them tap anything else.
  useEffect(() => {
    if (shareUnlocked && screen === 'offer') setScreen('discount');
  }, [shareUnlocked, screen]);

  const handlePurchase = () => { onClearError(); recordEvent('paywall:purchase'); onPurchase(); };
  const handleDiscountPurchase = () => { onClearError(); recordEvent('paywall:discount-purchase'); onDiscountPurchase(); };
  const handleRestore = () => { onClearError(); recordEvent('paywall:restore'); onRestore(); };

  const handleShare = () => { recordEvent('paywall:share-tapped'); onShare(); };

  function reallyClose() {
    recordEvent('paywall:dismissed');
    onClose();
  }

  function handleXTap() {
    if (screen !== 'main') { reallyClose(); return; }
    if (shareUnlocked) {
      recordEvent('paywall:discount-shown');
      setScreen('discount');
    } else {
      recordEvent('paywall:discount-offer-shown');
      setScreen('offer');
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      {/* Close */}
      <button
        onClick={handleXTap}
        className="absolute top-12 right-4 text-slate-400 hover:text-slate-700 p-2 z-10"
        aria-label="Close"
      >
        <X className="w-6 h-6" />
      </button>

      {screen === 'main' && (
        <>
          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-6 pt-14 pb-8">
            {/* Icon + heading */}
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-sky-100 flex items-center justify-center mb-4">
                <Lock className="w-8 h-8 text-[#0EA5E9]" />
              </div>
              <h2 className="text-[28px] font-black tracking-tight leading-tight mb-1">
                <span className="text-slate-900">Unlock </span><span className="text-slate-900">Sono</span><span className="text-[#0EA5E9]">Buddy</span>
              </h2>
              <p className="text-[13px] font-semibold text-slate-400 uppercase tracking-widest mb-3">Ultrasound Reference</p>
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
            {purchaseError && (
              <p className="text-center text-red-500 text-xs mb-3">{purchaseError}</p>
            )}
            <button
              onClick={handlePurchase}
              className="w-full bg-[#0EA5E9] hover:bg-sky-400 active:scale-[0.98] text-white font-bold py-4 rounded-2xl text-base transition-all shadow-lg shadow-sky-200/60"
            >
              Unlock Full Access — $9.99
            </button>
            <p className="text-center text-slate-400 text-[11px] mt-2 mb-1">
              One-time purchase · No subscription · Offline access
            </p>
            <button
              onClick={handleRestore}
              className="w-full text-slate-400 text-xs py-2 hover:text-slate-700 transition-colors"
            >
              Restore Purchase
            </button>
          </div>
        </>
      )}

      {screen === 'offer' && (
        <div className="flex-1 flex flex-col px-6 pt-20 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-sky-100 flex items-center justify-center mb-5">
              <Share2 className="w-8 h-8 text-[#0EA5E9]" />
            </div>
            <h2 className="text-[26px] font-black tracking-tight leading-tight text-slate-900 mb-2">
              Wait — save $3
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed max-w-xs mb-1">
              Share SonoBuddy with a friend or colleague and unlock full access
              for <span className="font-semibold text-slate-700">$6.99</span> instead of $9.99.
            </p>
            <p className="text-slate-400 text-xs max-w-xs">
              Just open the share sheet — no confirmation needed from them.
            </p>
          </div>

          <div>
            <button
              onClick={handleShare}
              className="w-full bg-[#0EA5E9] hover:bg-sky-400 active:scale-[0.98] text-white font-bold py-4 rounded-2xl text-base transition-all shadow-lg shadow-sky-200/60 flex items-center justify-center gap-2"
            >
              <Share2 className="w-5 h-5" />
              Share &amp; Save $3
            </button>
            <button
              onClick={reallyClose}
              className="w-full text-slate-400 text-xs py-3 hover:text-slate-700 transition-colors"
            >
              No thanks, maybe later
            </button>
          </div>
        </div>
      )}

      {screen === 'discount' && (
        <div className="flex-1 flex flex-col px-6 pt-20 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mb-5">
              <PartyPopper className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-[26px] font-black tracking-tight leading-tight text-slate-900 mb-2">
              Discount unlocked
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
              Thanks for sharing SonoBuddy. Full access is <span className="font-semibold text-slate-700">$6.99</span> for
              you, one time.
            </p>
          </div>

          <div>
            {purchaseError && (
              <p className="text-center text-red-500 text-xs mb-3">{purchaseError}</p>
            )}
            <button
              onClick={handleDiscountPurchase}
              className="w-full bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-white font-bold py-4 rounded-2xl text-base transition-all shadow-lg shadow-emerald-200/60"
            >
              Unlock Full Access — $6.99
            </button>
            <p className="text-center text-slate-400 text-[11px] mt-2 mb-1">
              One-time purchase · No subscription · Offline access
            </p>
            <button
              onClick={reallyClose}
              className="w-full text-slate-400 text-xs py-2 hover:text-slate-700 transition-colors"
            >
              No thanks
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
