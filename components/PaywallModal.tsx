'use client';

import { useEffect, useState } from 'react';
import { recordEvent } from '@/lib/tap-tracking';
import { FLASH_SALE_ACTIVE } from '@/hooks/usePremium';

import {
  X, Share2, PartyPopper, Ruler, ClipboardList, Calculator, Microscope, Newspaper, Briefcase,
} from 'lucide-react';
import { TILE, TILE_BASE } from '@/lib/tiles';

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
  { label: 'All measurement reference tables', sub: '20+ vascular, OB, thyroid, cardiac, abdominal', value: 49, Icon: Ruler, tile: TILE.measurements },
  { label: 'All exam protocols',               sub: 'Step-by-step guides with key images & checklists', value: 39, Icon: ClipboardList, tile: TILE.protocols },
  { label: 'All clinical calculators',         sub: 'ABI, RI, gestational age, EDD, thyroid volume & more', value: 29, Icon: Calculator, tile: TILE.calculators },
  { label: 'Full pathology library',           sub: '50+ conditions with red flags & reporting tips', value: 39, Icon: Microscope, tile: TILE.pathologies },
  { label: 'Every article in the library',     sub: '170+ clinical guides and career articles', value: 29, Icon: Newspaper, tile: TILE.articles },
  { label: 'Full sonography job board',        sub: 'Apply to openings updated regularly, any location', value: 19, Icon: Briefcase, tile: TILE.jobs },
];

const TOTAL_VALUE = FEATURES.reduce((sum, f) => sum + f.value, 0);

// The X button interrupts the first time someone ever tries to leave the
// main pricing screen — 'offer' asks them to share for a discount. Every
// paywall visit after that closes normally on X, on any device where the
// offer has already been shown once. 'discount' is the exception: once
// someone has actually shared, they see it every time — that's not a nag,
// it's a discount they already earned.
type Screen = 'main' | 'offer' | 'discount';

const OFFER_SEEN_KEY = 'sb_paywall_offer_seen';

// Turned off because purchases dropped after this launched — conversion data
// suggested the share-to-save interstitial was adding friction rather than
// recovering it. Left fully in place (UI, native purchaseDiscount(), funnel
// events) so it's a one-line flip back on for a Black Friday — or similar —
// promotion rather than a rebuild.
const SHARE_DISCOUNT_ENABLED = false;

export default function PaywallModal({
  onClose, onPurchase, onRestore,
  shareUnlocked, onShare, onDiscountPurchase,
  purchaseError, onClearError,
}: Props) {
  const [screen, setScreen] = useState<Screen>('main');
  // Whether THIS visit is allowed to show the offer — decided once at mount
  // from localStorage, then immediately marked seen for every future visit.
  const [offerEligible, setOfferEligible] = useState(false);

  // Instrumented here rather than at each call site — the modal is rendered
  // from six screens and they should all report the funnel identically.
  useEffect(() => {
    recordEvent('paywall:shown');
    try {
      const alreadySeen = localStorage.getItem(OFFER_SEEN_KEY) === '1';
      setOfferEligible(!alreadySeen);
      localStorage.setItem(OFFER_SEEN_KEY, '1');
    } catch {
      // Storage blocked (private mode, etc.) — default to allowing it once
      // rather than never showing the offer at all.
      setOfferEligible(true);
    }
  }, []);

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

  // `abandonedFrom` names which interstitial someone left from, if either —
  // 'offer' means they wouldn't share, 'discount' means they shared but still
  // wouldn't buy at $6.99. Both matter separately from the generic dismiss
  // count: they're the two distinct places this specific flow loses someone.
  function reallyClose(abandonedFrom?: 'offer' | 'discount') {
    if (abandonedFrom === 'offer') recordEvent('paywall:offer-declined');
    if (abandonedFrom === 'discount') recordEvent('paywall:discount-declined');
    recordEvent('paywall:dismissed');
    onClose();
  }

  function handleXTap() {
    if (screen === 'offer' || screen === 'discount') { reallyClose(screen); return; }
    if (screen !== 'main') { reallyClose(); return; }
    if (!SHARE_DISCOUNT_ENABLED) { reallyClose(); return; }
    if (shareUnlocked) {
      recordEvent('paywall:discount-shown');
      setScreen('discount');
    } else if (offerEligible) {
      recordEvent('paywall:discount-offer-shown');
      setScreen('offer');
    } else {
      reallyClose();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-sono-dark overflow-hidden">
      {/* Soft brand glow, matching onboarding */}
      <div aria-hidden className="pointer-events-none absolute -top-48 left-1/2 -translate-x-1/2 w-[620px] h-[620px] rounded-full bg-sky-400/20 blur-3xl" />

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
          <div className="relative flex-1 overflow-y-auto px-6 pt-14 pb-8">
            {/* Icon + heading */}
            <div className="flex flex-col items-center text-center mb-8">
              {FLASH_SALE_ACTIVE && (
                <span className="inline-flex items-center gap-1.5 bg-amber-100 ring-1 ring-amber-300/60 text-amber-700 text-[11px] font-bold uppercase tracking-wide px-3 py-1.5 rounded-full mb-4 shadow-[0_4px_12px_-4px_rgba(245,158,11,0.45)]">
                  🔥 Limited-time sale, ends soon
                </span>
              )}
              <img src="/icons/icon-192.png" alt="" className="w-16 h-16 rounded-2xl mb-4 ring-1 ring-slate-900/[0.06] shadow-[0_14px_30px_-12px_rgba(14,165,233,0.65)]" />
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
              {FEATURES.map(({ label, sub, Icon, tile }) => (
                <div key={label} className="card flex items-center gap-3.5 p-4">
                  <div className={`w-9 h-9 rounded-xl ${TILE_BASE} ${tile}`}>
                    <Icon size={17} className="text-white" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 leading-snug">{label}</p>
                    <p className="text-xs text-slate-500 mt-0.5 leading-snug">{sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Social proof */}
            <p className="text-center text-slate-400 text-xs mb-6">
              Used by sonographers at hospitals worldwide
            </p>
          </div>

          {/* Sticky purchase footer */}
          <div className="relative px-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-4 border-t border-slate-900/[0.06] bg-white/90 backdrop-blur-xl">
            {purchaseError && (
              <p className="text-center text-red-500 text-xs mb-3">{purchaseError}</p>
            )}
            {/* Value-stack price anchor — total feature value crossed out
                justifies today's price as a discount, without a second,
                redundant list-price anchor. The button below doesn't repeat
                the price since it's already shown here. */}
            <button
              onClick={FLASH_SALE_ACTIVE ? handleDiscountPurchase : handlePurchase}
              className="w-full bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 ring-1 ring-amber-300/30 shadow-[0_18px_36px_-18px_rgba(245,158,11,0.5),inset_0_1px_0_rgba(255,255,255,0.1)] active:scale-[0.98] rounded-2xl px-5 py-4 mb-3 flex items-center justify-between transition-transform text-left"
            >
              <div>
                <p className="text-[12px] text-slate-400 mb-0.5">
                  Total value <span className="line-through">${TOTAL_VALUE}</span>
                </p>
                <p className="text-[22px] font-black text-white">
                  {FLASH_SALE_ACTIVE ? (
                    <>Today: <span className="line-through text-slate-500 font-normal text-[16px]">$9.99</span> $6.99</>
                  ) : (
                    'Today: $9.99'
                  )}
                </p>
              </div>
              <span className="rounded-full bg-gradient-to-br from-amber-200 via-amber-400 to-amber-500 text-amber-950 shadow-[0_2px_8px_-2px_rgba(245,158,11,0.55),inset_0_1px_0_rgba(255,255,255,0.6)] text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 shrink-0">
                One-time
              </span>
            </button>
            <button
              onClick={FLASH_SALE_ACTIVE ? handleDiscountPurchase : handlePurchase}
              className="w-full bg-gradient-to-b from-sky-400 to-sono-blue shadow-[0_12px_26px_-10px_rgba(14,165,233,0.75),inset_0_1px_0_rgba(255,255,255,0.3)] active:scale-[0.98] text-white font-bold py-4 rounded-2xl text-base transition-transform"
            >
              Unlock Full Access
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
        <div className="relative flex-1 flex flex-col px-6 pt-20 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-sky-100 flex items-center justify-center mb-5">
              <Share2 className="w-8 h-8 text-[#0EA5E9]" />
            </div>
            <h2 className="text-[26px] font-black tracking-tight leading-tight text-slate-900 mb-2">
              Hold up, save $3
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed max-w-xs mb-1">
              Share SonoBuddy with a friend or colleague and unlock full access
              for <span className="font-semibold text-slate-700">$6.99</span> instead of $9.99.
            </p>
            <p className="text-slate-400 text-xs max-w-xs">
              Just open the share sheet, no confirmation needed from them.
              This offer is shown once, so grab it now.
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
              onClick={() => reallyClose('offer')}
              className="w-full text-slate-400 text-xs py-3 hover:text-slate-700 transition-colors"
            >
              No thanks, maybe later
            </button>
          </div>
        </div>
      )}

      {screen === 'discount' && (
        <div className="relative flex-1 flex flex-col px-6 pt-20 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
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
              Unlock Full Access · $6.99
            </button>
            <p className="text-center text-slate-400 text-[11px] mt-2 mb-1">
              One-time purchase · No subscription · Offline access
            </p>
            <button
              onClick={() => reallyClose('discount')}
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
