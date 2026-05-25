'use client';

import { useState, useRef } from 'react';
import {
  Ruler, ClipboardList, Calculator, Microscope,
  ChevronRight, WifiOff,
} from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

const TOTAL = 4;

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [screen, setScreen] = useState(0);
  const [exiting, setExiting] = useState(false);
  const touchStartX = useRef<number | null>(null);

  function finish() {
    setExiting(true);
    setTimeout(onComplete, 350);
  }

  function next() {
    if (screen < TOTAL - 1) setScreen(screen + 1);
    else finish();
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
      className={`fixed inset-0 z-50 bg-[#F5F4F0] flex flex-col transition-opacity duration-350 ${exiting ? 'opacity-0' : 'opacity-100'}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Shared header */}
      <div className="shrink-0 flex items-center justify-between px-6 pt-[calc(env(safe-area-inset-top)+18px)] pb-4">
        <p className="text-[20px] font-black tracking-tight">
          <span className="text-slate-900">Sono</span><span className="text-sky-500">Buddy</span>
        </p>
        <p className="text-[12px] font-semibold text-slate-400 tabular-nums">
          {String(screen + 1).padStart(2, '0')} / {String(TOTAL).padStart(2, '0')}
        </p>
      </div>

      {/* Screen content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {screen === 0 && <Screen1 onNext={next} onSkip={finish} />}
        {screen === 1 && <Screen2 onNext={next} onSkip={finish} />}
        {screen === 2 && <Screen3 onNext={next} />}
        {screen === 3 && <Screen4 onNext={finish} />}
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
      className="w-full bg-slate-900 active:bg-slate-800 rounded-full py-[15px] flex items-center justify-between px-6 transition-all active:scale-[0.98]"
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

      <div className="flex-1">
        {stats.map(({ value, label }, i) => (
          <div key={value}>
            {i > 0 && <div className="h-px bg-slate-200 my-5" />}
            <div>
              <p className="text-[52px] font-black leading-none text-slate-900 tracking-tight mb-1.5">
                {value}
              </p>
              <p className="text-[14px] text-slate-500 leading-snug">{label}</p>
            </div>
          </div>
        ))}
      </div>

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
    'Calculators — zero connectivity needed',
    'No login required — open and go',
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
      <div className="bg-white rounded-2xl p-4 mb-6 flex items-center gap-3 shadow-sm">
        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shrink-0">
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
            <div className="w-6 h-6 rounded-full bg-slate-900 flex items-center justify-center shrink-0 mt-0.5">
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
    { Icon: Ruler,         title: 'Measurements',  desc: '20+ normal value tables — vascular, OB, thyroid, cardiac' },
    { Icon: ClipboardList, title: 'Protocols',     desc: 'Step-by-step exam guides with key images & checklists' },
    { Icon: Calculator,    title: 'Calculators',   desc: 'ABI, RI, gestational age, EDD, thyroid volume & more' },
    { Icon: Microscope,    title: 'Pathologies',   desc: '50+ conditions with red flags & reporting tips' },
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
        {features.map(({ Icon, title, desc }) => (
          <div key={title} className="flex items-center gap-4 bg-white rounded-2xl px-4 py-3.5 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
              <Icon size={17} className="text-slate-700" strokeWidth={1.75} />
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

/* ── Screen 4 — Configure Specialty ──────────────────────────────────────── */
const SPECIALTIES = [
  { id: 'ob-gyn',   label: 'OB/Gyn' },
  { id: 'cardiac',  label: 'Cardiac' },
  { id: 'vascular', label: 'Vascular' },
  { id: 'thyroid',  label: 'Thyroid' },
  { id: 'abdomen',  label: 'Abdomen' },
  { id: 'msk',      label: 'MSK' },
];

function Screen4({ onNext }: { onNext: () => void }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleDone() {
    if (selected.size > 0) {
      try {
        localStorage.setItem('sonobuddy_specialties', JSON.stringify(Array.from(selected)));
      } catch {}
    }
    onNext();
  }

  return (
    <div className="flex-1 flex flex-col px-6 pb-[calc(env(safe-area-inset-bottom)+28px)] overflow-auto">
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.14em] mb-5">
        Configure
      </p>

      <h1 className="text-[40px] font-black leading-[1.02] tracking-tight text-slate-900 mb-2">
        What do you<br /><span className="text-sky-500">scan</span> most?
      </h1>
      <p className="text-[14px] text-slate-400 leading-relaxed mb-7">
        Select all that apply.
      </p>

      {/* 2×3 specialty grid */}
      <div className="grid grid-cols-2 gap-3 flex-1">
        {SPECIALTIES.map(({ id, label }) => {
          const active = selected.has(id);
          return (
            <button
              key={id}
              onClick={() => toggle(id)}
              className={`rounded-2xl py-6 flex items-center justify-center font-bold text-[15px] transition-all active:scale-[0.97] ${
                active ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 shadow-sm'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        <CtaButton
          label={selected.size > 0 ? "Let's go" : 'Skip for now'}
          onClick={handleDone}
        />
      </div>
    </div>
  );
}
