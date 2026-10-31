'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Ruler, ClipboardList, Calculator, Microscope, Briefcase, Newspaper,
  ChevronRight, WifiOff,
} from 'lucide-react';
import { recordEvent } from '@/lib/tap-tracking';
import { FLASH_SALE_ACTIVE } from '@/hooks/usePremium';
import ProBadge from '@/components/ProBadge';

// Same gradient icon tiles as the Home screen's Browse cards.
const TILE = {
  measurements: 'from-sky-400 to-blue-600 shadow-blue-500/30',
  protocols: 'from-emerald-400 to-green-600 shadow-green-500/30',
  calculators: 'from-violet-400 to-purple-600 shadow-purple-500/30',
  pathologies: 'from-rose-400 to-red-600 shadow-red-500/30',
  articles: 'from-amber-400 to-orange-500 shadow-orange-500/30',
  jobs: 'from-indigo-400 to-indigo-600 shadow-indigo-500/30',
};
const TILE_BASE = 'bg-gradient-to-br shadow-md ring-1 ring-inset ring-white/20 flex items-center justify-center shrink-0';

interface OnboardingProps {
  onComplete: () => void;
  isPremium: boolean;
  requestPurchase: () => void;
  requestDiscountPurchase: () => void;
  purchaseError: string | null;
  clearPurchaseError: () => void;
}

const TOTAL = 5;

export default function Onboarding({
  onComplete, isPremium, requestPurchase, requestDiscountPurchase,
  purchaseError, clearPurchaseError,
}: OnboardingProps) {
  const [screen, setScreen] = useState(0);
  const [exiting, setExiting] = useState(false);
  const touchStartX = useRef<number | null>(null);

  // The route never changes during onboarding — it's an overlay on /home —
  // so without this every screen and every skip/complete looked identical to
  // an ordinary /home tap. Named events give each step a distinct row.
  useEffect(() => { recordEvent(`onboarding:screen-${screen + 1}`); }, [screen]);

  // The offer screen's purchase buttons go through the same native bridge as
  // the main paywall — isPremium flips true asynchronously once native
  // confirms the purchase, so this is what actually advances onboarding
  // rather than any local click handler guessing at success.
  useEffect(() => {
    if (isPremium && screen === TOTAL - 1) finish('completed');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPremium]);

  function finish(reason: 'completed' | 'skipped') {
    recordEvent(`onboarding:${reason}`);
    setExiting(true);
    setTimeout(onComplete, 350);
  }

  function next() {
    if (screen < TOTAL - 1) setScreen(screen + 1);
    else finish('completed');
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (dx < -40 && screen < TOTAL - 1) setScreen(s => s + 1);
    if (dx > 40 && screen > 0) setScreen(s => s - 1);
    touchStartX.current = null;
  }

  return (
    <div
      className={`fixed inset-0 z-50 bg-sono-dark flex flex-col overflow-hidden transition-opacity duration-350 ${exiting ? 'opacity-0' : 'opacity-100'}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Soft brand glow behind the content */}
      <div aria-hidden className="pointer-events-none absolute -top-48 left-1/2 -translate-x-1/2 w-[620px] h-[620px] rounded-full bg-sky-400/20 blur-3xl" />

      {/* Shared header */}
      <div className="relative shrink-0 px-6 pt-[calc(env(safe-area-inset-top)+18px)] pb-4">
        <div className="flex items-center gap-4">
          <p className="text-[20px] font-black tracking-tight shrink-0">
            <span className="text-slate-900">Sono</span><span className="text-sky-500">Buddy</span>
          </p>
          <div className="flex-1 flex gap-1" aria-hidden>
            {Array.from({ length: TOTAL }, (_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors duration-300 ${i <= screen ? 'bg-sono-blue' : 'bg-slate-900/[0.08]'}`}
              />
            ))}
          </div>
          <p className="text-[12px] font-semibold text-slate-400 tabular-nums shrink-0">
            {String(screen + 1).padStart(2, '0')} / {String(TOTAL).padStart(2, '0')}
          </p>
        </div>
      </div>

      {/* Screen content — keyed so each step eases in */}
      <div key={screen} className="onb-enter relative flex-1 flex flex-col overflow-hidden">
        {screen === 0 && <Screen1 onNext={next} onSkip={() => finish('skipped')} />}
        {screen === 1 && <Screen2 onNext={next} onSkip={() => finish('skipped')} />}
        {screen === 2 && <Screen3 onNext={next} />}
        {screen === 3 && <Screen4 onNext={next} />}
        {screen === 4 && (
          <Screen5
            onPurchase={requestPurchase}
            onDiscountPurchase={requestDiscountPurchase}
            purchaseError={purchaseError}
            onClearError={clearPurchaseError}
            onSkip={() => finish('completed')}
          />
        )}
      </div>
    </div>
  );
}

/* ── Shared dark pill CTA ──────────────────────────────────────────────────── */
function CtaButton({
  label,
  stepLabel,
  onClick,
}: {
  label: string;
  stepLabel?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-gradient-to-b from-slate-800 to-slate-950 ring-1 ring-white/5 shadow-[0_14px_30px_-12px_rgba(2,6,23,0.6),inset_0_1px_0_rgba(255,255,255,0.12)] rounded-full py-[15px] flex items-center justify-between px-6 transition-transform active:scale-[0.98]"
    >
      <span className="text-white font-bold text-[16px]">{label}</span>
      <div className="flex items-center gap-2">
        {stepLabel && (
          <span className="text-slate-500 text-[13px] font-medium">{stepLabel}</span>
        )}
        <ChevronRight size={16} className="text-white" strokeWidth={2.5} />
      </div>
    </button>
  );
}

/* ── Screen 1 — Why SonoBuddy ──────────────────────────────────────────────── */
function Screen1({ onNext, onSkip }: { onNext: () => void; onSkip: () => void }) {
  const stats = [
    { value: '800M+', label: 'ultrasound exams performed worldwide every year' },
    { value: '200+', label: 'measurement values a sonographer must recall from memory' },
    { value: '100+', label: 'real sonography images to recognize pathology at a glance' },
  ];

  return (
    <div className="flex-1 flex flex-col px-6 pb-[calc(env(safe-area-inset-bottom)+28px)] overflow-auto">
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.14em] mb-5">
        Why SonoBuddy
      </p>

      <h1 className="text-[40px] font-black leading-[1.02] tracking-tight text-slate-900 mb-8">
        The scan room<br /><span className="text-sky-500">doesn&apos;t wait.</span>
      </h1>

      <div className="card px-5 py-5 self-start w-full">
        {stats.map(({ value, label }, i) => (
          <div key={value}>
            {i > 0 && <div className="h-px bg-slate-100 my-5" />}
            <div>
              <p className="text-[52px] font-black leading-none text-slate-900 tracking-tight mb-1.5">
                {value.replace('+', '')}<span className="text-sky-500">+</span>
              </p>
              <p className="text-[14px] text-slate-500 leading-snug">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex-1" />

      <div className="mt-8 space-y-2">
        <CtaButton label="See how we help" stepLabel="01 →" onClick={onNext} />
        <button
          onClick={onSkip}
          className="w-full py-2.5 text-[13px] font-medium text-slate-400 text-center"
        >
          Skip intro
        </button>
      </div>
    </div>
  );
}

/* ── Screen 2 — Field-Ready / Offline ─────────────────────────────────────── */
function Screen2({ onNext, onSkip }: { onNext: () => void; onSkip: () => void }) {
  const checks = [
    'All measurements & normal value tables',
    'Full exam protocols with key images',
    'Calculators that need zero connectivity',
    'No login required, just open and go',
  ];

  return (
    <div className="flex-1 flex flex-col px-6 pb-[calc(env(safe-area-inset-bottom)+28px)] overflow-auto">
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.14em] mb-5">
        Field-ready
      </p>

      <h1 className="text-[40px] font-black leading-[1.02] tracking-tight text-slate-900 mb-6">
        Works <span className="text-sky-500">without</span><br />WiFi.
      </h1>

      {/* Signal widget card */}
      <div className="card p-4 mb-6 flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl ${TILE_BASE} ${TILE.measurements}`}>
          <WifiOff size={18} className="text-white" strokeWidth={2} />
        </div>
        <div className="flex-1">
          <p className="text-[13px] font-bold text-slate-800">No signal?</p>
          <p className="text-[12px] text-slate-400">SonoBuddy still works.</p>
        </div>
        <div className="flex items-end gap-[3px]">
          {[8, 12, 16, 20].map((h, i) => (
            <div
              key={i}
              style={{ height: h }}
              className={`w-[4px] rounded-sm ${i === 0 ? 'bg-slate-300' : 'bg-slate-200'}`}
            />
          ))}
        </div>
      </div>

      {/* Numbered checklist */}
      <div className="flex-1 space-y-4">
        {checks.map((text, i) => (
          <div key={text} className="flex items-start gap-3.5">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 shadow-[0_4px_10px_-3px_rgba(37,99,235,0.6)] flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-[11px] font-bold text-white">{i + 1}</span>
            </div>
            <span className="text-[15px] font-medium text-slate-700 leading-snug">{text}</span>
          </div>
        ))}
      </div>

      <div className="mt-8 space-y-2">
        <CtaButton label="Next" stepLabel="02 →" onClick={onNext} />
        <button
          onClick={onSkip}
          className="w-full py-2.5 text-[13px] font-medium text-slate-400 text-center"
        >
          Skip intro
        </button>
      </div>
    </div>
  );
}

/* ── Screen 3 — Everything in One Place ───────────────────────────────────── */
function Screen3({ onNext }: { onNext: () => void }) {
  const features = [
    { Icon: Ruler,         title: 'Measurements',  desc: '20+ normal value tables covering vascular, OB, thyroid, cardiac', tile: TILE.measurements },
    { Icon: ClipboardList, title: 'Protocols',     desc: 'Step-by-step exam guides with key images & checklists',          tile: TILE.protocols },
    { Icon: Calculator,    title: 'Calculators',   desc: 'ABI, RI, gestational age, EDD, thyroid volume & more',            tile: TILE.calculators },
    { Icon: Microscope,    title: 'Pathologies',   desc: '50+ conditions with red flags & reporting tips',                  tile: TILE.pathologies },
    { Icon: Newspaper,     title: 'Blog & Articles', desc: '170+ clinical guides and career articles',                      tile: TILE.articles },
    { Icon: Briefcase,     title: 'Jobs',          desc: 'Sonographer openings, updated regularly',                         tile: TILE.jobs },
  ];

  return (
    <div className="flex-1 flex flex-col px-6 pb-[calc(env(safe-area-inset-bottom)+28px)] overflow-auto">
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.14em] mb-5">
        Everything in one place
      </p>

      <h1 className="text-[40px] font-black leading-[1.02] tracking-tight text-slate-900 mb-7">
        Your pocket<br /><span className="text-sky-500">sonography</span><br />reference.
      </h1>

      {/* Feature rows */}
      <div className="flex-1 space-y-2.5">
        {features.map(({ Icon, title, desc, tile }) => (
          <div key={title} className="card flex items-center gap-4 px-4 py-3.5">
            <div className={`w-9 h-9 rounded-xl ${TILE_BASE} ${tile}`}>
              <Icon size={17} className="text-white" strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-bold text-slate-900">{title}</p>
              <p className="text-[11px] text-slate-400 leading-snug">{desc}</p>
            </div>
            <ChevronRight size={14} className="text-slate-300 shrink-0" />
          </div>
        ))}
      </div>

      <div className="mt-7">
        <CtaButton label="One more thing" stepLabel="03 →" onClick={onNext} />
      </div>
    </div>
  );
}

/* ── Screen 4 — From the Founder ───────────────────────────────────────────── */
function Screen4({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex-1 flex flex-col px-6 pb-[calc(env(safe-area-inset-bottom)+28px)] overflow-auto">
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.14em] mb-5">
        From the founder
      </p>

      <h1 className="text-[40px] font-black leading-[1.02] tracking-tight text-slate-900 mb-6">
        I wish I&apos;d had<br />this on <span className="text-sky-500">day one.</span>
      </h1>

      <div className="card p-5 space-y-4 self-start">
        <p className="text-[15px] text-slate-600 leading-relaxed">
          When I started scanning, nobody expected me to carry two hundred normal values and a dozen exam protocols in my head. I still needed them, though, usually mid-scan, with a patient on the table and no time to dig.
        </p>
        <p className="text-[15px] text-slate-600 leading-relaxed">
          The references that existed were scattered everywhere: a textbook here, a forum thread there, a PDF a classmate sent you two semesters ago. Each one was slightly different from the last, and none of it was built for the moment you actually needed it.
        </p>
        <p className="text-[15px] text-slate-600 leading-relaxed">
          So I built the tool I wished existed back then: the real numbers and the real steps, in your pocket, right when you need them.
        </p>
      </div>

      <p className="text-[14px] font-semibold text-slate-400 mt-4">
        Sonographer &amp; founder of SonoBuddy
      </p>

      <div className="flex-1 min-h-7" />

      <CtaButton label="One last thing" stepLabel="04 →" onClick={onNext} />
    </div>
  );
}

/* ── Screen 5 — The Offer ──────────────────────────────────────────────────── */
function Screen5({
  onPurchase, onDiscountPurchase, purchaseError, onClearError, onSkip,
}: {
  onPurchase: () => void;
  onDiscountPurchase: () => void;
  purchaseError: string | null;
  onClearError: () => void;
  onSkip: () => void;
}) {
  const stack = [
    { Icon: Ruler,         label: 'Full Measurement Library',      value: 49, tile: TILE.measurements },
    { Icon: ClipboardList, label: 'Every Exam Protocol',           value: 39, tile: TILE.protocols },
    { Icon: Calculator,    label: 'All Clinical Calculators',      value: 29, tile: TILE.calculators },
    { Icon: Microscope,    label: 'Complete Pathology Library',    value: 39, tile: TILE.pathologies },
    { Icon: Newspaper,     label: '170+ Articles & Career Guides', value: 29, tile: TILE.articles },
    { Icon: Briefcase,     label: 'Full Sonography Job Board',     value: 19, tile: TILE.jobs },
  ];
  const totalValue = stack.reduce((sum, item) => sum + item.value, 0);

  function handlePurchase() {
    onClearError();
    recordEvent('onboarding:offer-purchase');
    if (FLASH_SALE_ACTIVE) onDiscountPurchase(); else onPurchase();
  }

  return (
    <div className="flex-1 flex flex-col px-6 pb-[calc(env(safe-area-inset-bottom)+28px)] overflow-auto">
      <div className="flex items-center gap-2.5 mb-5">
        <ProBadge />
        <p className="text-[11px] font-bold text-amber-600 uppercase tracking-[0.14em]">
          Before you go — launch pricing
        </p>
      </div>

      <h1 className="text-[34px] font-black leading-[1.05] tracking-tight text-slate-900 mb-2">
        Never blank<br />on a scan <span className="text-sky-500">again.</span>
      </h1>
      <p className="text-[14px] text-slate-500 leading-relaxed mb-6">
        Unlock everything right now — no subscription, no login, works offline, forever.
      </p>

      <div className="flex-1">
        {/* Value stack */}
        <div className="card divide-y divide-slate-100">
          {stack.map(({ Icon, label, value, tile }) => (
            <div key={label} className="flex items-center gap-3 px-4 py-3">
              <div className={`w-8 h-8 rounded-lg ${TILE_BASE} ${tile}`}>
                <Icon size={15} className="text-white" strokeWidth={2} />
              </div>
              <span className="flex-1 text-[13px] font-semibold text-slate-800">{label}</span>
              <span className="text-[12px] text-slate-400 line-through">${value}</span>
            </div>
          ))}
        </div>
      </div>

      {purchaseError && (
        <p className="text-center text-red-500 text-xs mt-4">{purchaseError}</p>
      )}

      {/* Same value-stack anchor + button pattern as the main paywall:
          total feature value crossed out justifies today's price, and the
          button doesn't repeat the price since it's already shown above.
          Both elements trigger the same purchase action. */}
      <div className="mt-6 space-y-2">
        <button
          onClick={handlePurchase}
          className="w-full bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 ring-1 ring-amber-300/30 shadow-[0_18px_36px_-18px_rgba(245,158,11,0.5),inset_0_1px_0_rgba(255,255,255,0.1)] active:scale-[0.98] rounded-2xl px-5 py-4 transition-transform text-left"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[12px] text-slate-400 mb-0.5">
                Total value <span className="line-through">${totalValue}</span>
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
          </div>
        </button>
        <button
          onClick={handlePurchase}
          className="w-full bg-gradient-to-b from-sky-400 to-sono-blue shadow-[0_12px_26px_-10px_rgba(14,165,233,0.75),inset_0_1px_0_rgba(255,255,255,0.3)] active:scale-[0.98] text-white font-bold py-4 rounded-2xl text-base transition-transform"
        >
          Unlock Full Access
        </button>
        <button
          onClick={onSkip}
          className="w-full py-2.5 text-[13px] font-medium text-slate-400 text-center"
        >
          Try limited features today
        </button>
        <p className="text-center text-slate-300 text-[11px] pt-1">
          One-time purchase · No subscription · Offline access
        </p>
      </div>
    </div>
  );
}
