'use client';

import { useState, useRef } from 'react';
import {
  Ruler, ClipboardList, Calculator, Microscope,
  WifiOff, ChevronRight, CheckCircle2, Globe, BookOpen, Brain,
} from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [screen, setScreen] = useState(0);
  const [exiting, setExiting] = useState(false);
  const touchStartX = useRef<number | null>(null);

  function finish() {
    setExiting(true);
    setTimeout(onComplete, 350);
  }

  function next() {
    if (screen < 2) setScreen(screen + 1);
    else finish();
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (dx < -40 && screen < 2) setScreen(s => s + 1);
    if (dx > 40 && screen > 0) setScreen(s => s - 1);
    touchStartX.current = null;
  }

  return (
    <div
      className={`fixed inset-0 z-50 bg-white transition-opacity duration-350 ${exiting ? 'opacity-0' : 'opacity-100'}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="h-full flex flex-col">
        {screen === 0 && <Screen1 onNext={next} onSkip={finish} />}
        {screen === 1 && <Screen2 onNext={next} onSkip={finish} />}
        {screen === 2 && <Screen3 onNext={finish} />}
      </div>

      {/* Dot pagination */}
      <div className="absolute bottom-[calc(env(safe-area-inset-bottom)+14px)] left-0 right-0 flex justify-center gap-2 pointer-events-none">
        {[0, 1, 2].map(i => (
          <button
            key={i}
            onClick={() => setScreen(i)}
            className={`rounded-full transition-all duration-300 pointer-events-auto ${
              i === screen ? 'w-6 h-2 bg-[#0EA5E9]' : 'w-2 h-2 bg-slate-200'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

/* ── Shared footer ─────────────────────────────────────────────────────────── */
function Footer({
  cta,
  onNext,
  onSkip,
  skipLabel = 'Skip',
}: {
  cta: string;
  onNext: () => void;
  onSkip?: () => void;
  skipLabel?: string;
}) {
  return (
    <div className="px-6 pb-[calc(env(safe-area-inset-bottom)+44px)]">
      <button
        onClick={onNext}
        className="w-full bg-[#0EA5E9] active:bg-sky-600 rounded-2xl py-[15px] flex items-center justify-center gap-2 shadow-lg shadow-sky-200/60 transition-all active:scale-[0.98]"
      >
        <span className="text-white font-bold text-[17px] tracking-[-0.01em]">{cta}</span>
        <ChevronRight size={18} className="text-white" strokeWidth={2.5} />
      </button>
      {onSkip && (
        <button
          onClick={onSkip}
          className="w-full mt-3 py-2 text-[14px] font-medium text-slate-400 hover:text-slate-600 transition-colors text-center"
        >
          {skipLabel}
        </button>
      )}
    </div>
  );
}

/* ── Screen 1 — The Problem ────────────────────────────────────────────────── */
function Screen1({ onNext, onSkip }: { onNext: () => void; onSkip: () => void }) {
  const stats = [
    {
      icon: Globe,
      color: 'text-[#0EA5E9]',
      bg: 'bg-sky-50',
      border: 'border-sky-100',
      value: '800M+',
      label: 'ultrasound exams performed worldwide every year',
    },
    {
      icon: Brain,
      color: 'text-violet-500',
      bg: 'bg-violet-50',
      border: 'border-violet-100',
      value: '200+',
      label: 'measurement values a sonographer must recall from memory',
    },
    {
      icon: BookOpen,
      color: 'text-amber-500',
      bg: 'bg-amber-50',
      border: 'border-amber-100',
      value: '12+',
      label: 'textbooks and PDFs where references are scattered',
    },
  ];

  return (
    <div className="flex flex-col h-full px-6 pt-16">
      {/* Eyebrow */}
      <p className="text-[11px] font-bold text-[#0EA5E9] uppercase tracking-[0.14em] text-center mb-3">
        Why SonoBuddy exists
      </p>

      {/* Headline */}
      <h1 className="text-[32px] font-black leading-[1.05] tracking-tight text-slate-900 text-center mb-2">
        The scan room doesn&apos;t wait.
      </h1>
      <p className="text-[15px] text-slate-400 leading-relaxed text-center mb-8 max-w-[300px] mx-auto">
        Textbooks are in the break room. Your patient is on the table. Sonographers need answers <em>now</em>.
      </p>

      {/* Stat cards */}
      <div className="space-y-3 flex-1">
        {stats.map(({ icon: Icon, color, bg, border, value, label }) => (
          <div key={value} className={`${bg} border ${border} rounded-2xl p-4 flex items-center gap-4`}>
            <div className="shrink-0 w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
              <Icon size={20} className={color} strokeWidth={1.75} />
            </div>
            <div>
              <p className={`text-[26px] font-black leading-none ${color} mb-0.5`}>{value}</p>
              <p className="text-[13px] text-slate-500 leading-snug">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex-1" />
      <Footer cta="See how we help" onNext={onNext} onSkip={onSkip} />
    </div>
  );
}

/* ── Screen 2 — Works Offline ──────────────────────────────────────────────── */
function Screen2({ onNext, onSkip }: { onNext: () => void; onSkip: () => void }) {
  const benefits = [
    'All measurements & ranges cached locally',
    'Full protocols available without internet',
    'Calculators work with zero signal',
    'No login — open and go',
  ];

  return (
    <div className="flex flex-col h-full px-6 pt-16">
      {/* Icon */}
      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 rounded-3xl bg-slate-900 flex items-center justify-center shadow-xl shadow-slate-300">
          <WifiOff size={36} className="text-white" strokeWidth={1.75} />
        </div>
      </div>

      {/* Headline */}
      <h1 className="text-[32px] font-black leading-[1.05] tracking-tight text-slate-900 text-center mb-3">
        Works without WiFi.
      </h1>
      <p className="text-[15px] text-slate-400 leading-relaxed text-center mb-4 max-w-[300px] mx-auto">
        Scan rooms have dead zones. Hospitals have spotty signal. SonoBuddy has your back.
      </p>

      {/* Signal bar visual */}
      <div className="mb-6 flex items-center justify-center gap-2">
        <div className="flex items-end gap-[3px]">
          {[10, 14, 18, 22].map((h, i) => (
            <div
              key={i}
              style={{ height: h }}
              className={`w-[5px] rounded-sm ${i === 0 ? 'bg-slate-300' : 'bg-slate-200'}`}
            />
          ))}
        </div>
        <span className="text-[13px] text-slate-400 font-medium">No signal?</span>
        <span className="text-[13px] font-bold text-[#0EA5E9]">No problem.</span>
      </div>

      {/* Benefit list */}
      <div className="space-y-3">
        {benefits.map(text => (
          <div key={text} className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3.5">
            <CheckCircle2 size={18} className="text-[#0EA5E9] shrink-0" strokeWidth={2} />
            <span className="text-[14px] font-medium text-slate-700">{text}</span>
          </div>
        ))}
      </div>

      <div className="flex-1" />
      <Footer cta="Almost there" onNext={onNext} onSkip={onSkip} />
    </div>
  );
}

/* ── Screen 3 — Get Started ────────────────────────────────────────────────── */
function Screen3({ onNext }: { onNext: () => void }) {
  const features = [
    { Icon: Ruler,         color: 'text-[#0EA5E9]',   bg: 'bg-sky-50',     border: 'border-sky-100',     title: 'Measurements',  desc: '20+ normal value tables — vascular, OB, thyroid, cardiac' },
    { Icon: ClipboardList, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100', title: 'Protocols',     desc: 'Step-by-step exam guides with key images & checklists' },
    { Icon: Calculator,    color: 'text-violet-500',  bg: 'bg-violet-50',  border: 'border-violet-100',  title: 'Calculators',   desc: 'ABI, RI, gestational age, EDD, thyroid volume & more' },
    { Icon: Microscope,    color: 'text-rose-500',    bg: 'bg-rose-50',    border: 'border-rose-100',    title: 'Pathologies',   desc: '50+ conditions with red flags & reporting tips' },
  ];

  return (
    <div className="flex flex-col h-full px-6 pt-14">
      {/* Headline */}
      <p className="text-[11px] font-bold text-[#0EA5E9] uppercase tracking-[0.14em] text-center mb-3">
        Everything in one place
      </p>
      <h1 className="text-[32px] font-black leading-[1.05] tracking-tight text-slate-900 text-center mb-2">
        Your pocket<br />sonography reference.
      </h1>
      <p className="text-[15px] text-slate-400 leading-relaxed text-center mb-6 max-w-[290px] mx-auto">
        Try it free — explore a selection of every section before deciding to unlock the full library.
      </p>

      {/* Feature cards */}
      <div className="space-y-2.5">
        {features.map(({ Icon, color, bg, border, title, desc }) => (
          <div key={title} className={`${bg} border ${border} rounded-2xl px-4 py-3 flex items-center gap-3.5`}>
            <div className="shrink-0 w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm">
              <Icon size={17} className={color} strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-[13px] font-bold text-slate-800">{title}</p>
              <p className="text-[11px] text-slate-400 leading-snug">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex-1" />

      {/* Trust line */}
      <p className="text-center text-[12px] text-slate-400 mb-4">
        Free to start · No account needed · Offline
      </p>

      <Footer cta="Start Exploring" onNext={onNext} />
    </div>
  );
}
