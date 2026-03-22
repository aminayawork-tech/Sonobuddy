'use client';

import { useState, useRef } from 'react';
import {
  Ruler, ClipboardList, Calculator, AlertTriangle,
  ChevronRight, X, Activity, Heart, Gauge,
  Microscope, Scan, BarChart2, Stethoscope,
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
    setTimeout(onComplete, 400);
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
      className={`fixed inset-0 z-50 bg-white transition-opacity duration-400 ${exiting ? 'opacity-0' : 'opacity-100'}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Screens */}
      <div className="h-full flex flex-col">
        {screen === 0 && <Screen1 onNext={next} />}
        {screen === 1 && <Screen2 onNext={next} />}
        {screen === 2 && <Screen3 onNext={finish} />}
      </div>

      {/* Dot Pagination */}
      <div className="absolute bottom-[calc(env(safe-area-inset-bottom)+68px)] left-0 right-0 flex justify-center gap-2">
        {[0, 1, 2].map(i => (
          <button
            key={i}
            onClick={() => setScreen(i)}
            className={`rounded-full transition-all duration-300 ${
              i === screen
                ? 'w-6 h-2 bg-[#0EA5E9]'
                : 'w-2 h-2 bg-slate-200'
            }`}
          />
        ))}
      </div>

      {/* Skip — bottom center, above dots */}
      <div className="absolute bottom-[calc(env(safe-area-inset-bottom)+90px)] left-0 right-0 flex justify-center">
        <button
          onClick={finish}
          className="flex items-center gap-1 text-sm font-medium text-slate-400 hover:text-slate-600 transition-colors px-4 py-2"
        >
          Skip <X size={14} />
        </button>
      </div>
    </div>
  );
}

/* ─── Screen 1: Welcome ─────────────────────────────────────────────────── */
function Screen1({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex flex-col h-full px-6 pt-20 pb-[calc(env(safe-area-inset-bottom)+160px)]">
      {/* Headline */}
      <h1 className="text-[28px] font-black text-center leading-tight mb-3">
        <span className="text-slate-900">Welcome to</span><br />
        <span className="text-slate-900">Sono</span><span className="text-[#0EA5E9]">Buddy</span>
      </h1>
      <p className="text-[15px] text-slate-500 text-center leading-relaxed mb-10 font-medium">
        Your pocket sonographer reference — quick access to measurements, protocols, calculators & pathologies
      </p>

      {/* Feature tiles */}
      <div className="grid grid-cols-2 gap-3 mb-10">
        {[
          { Icon: Ruler,         label: 'Normal Values',       bg: 'bg-sky-50',    icon: 'text-sky-500',    border: 'border-sky-100' },
          { Icon: ClipboardList, label: 'Exam Protocols',      bg: 'bg-emerald-50', icon: 'text-emerald-600', border: 'border-emerald-100' },
          { Icon: Calculator,    label: 'Built-in Tools',      bg: 'bg-violet-50', icon: 'text-violet-600', border: 'border-violet-100' },
          { Icon: AlertTriangle, label: 'Pathology Red Flags', bg: 'bg-rose-50',   icon: 'text-rose-500',   border: 'border-rose-100' },
        ].map(({ Icon, label, bg, icon, border }) => (
          <div key={label} className={`${bg} border ${border} rounded-2xl p-4 flex flex-col items-center gap-2`}>
            <Icon size={24} className={icon} strokeWidth={2} />
            <span className="text-[12px] font-semibold text-slate-700 text-center leading-tight">{label}</span>
          </div>
        ))}
      </div>

      {/* Tip bubble */}
      <div className="flex-1 flex items-end">
        <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-base">💡</span>
            <span className="text-[10px] font-bold text-[#0EA5E9] uppercase tracking-widest">Clinical Tip</span>
          </div>
          <p className="text-[12px] text-slate-600 leading-relaxed font-medium">
            E/A ratio &lt;1 in patients &gt;50 may suggest diastolic dysfunction — always correlate clinically with tissue Doppler.
          </p>
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={onNext}
        className="mt-6 w-full bg-[#0EA5E9] active:bg-sky-600 rounded-2xl py-4 flex items-center justify-center gap-2 shadow-lg shadow-sky-200 transition-all active:scale-[0.98]"
      >
        <span className="text-white font-bold text-[16px]">Get Started</span>
        <ChevronRight size={18} className="text-white" />
      </button>
    </div>
  );
}

/* ─── Screen 2: Navigation Highlight ────────────────────────────────────── */
function Screen2({ onNext }: { onNext: () => void }) {
  const browseItems = [
    { label: 'Measurements', bg: 'bg-sky-100',     border: 'border-sky-200',    iconBg: 'bg-sky-500',     Icon: Ruler,         iconColor: 'text-white', text: 'text-sky-700' },
    { label: 'Protocols',    bg: 'bg-emerald-100', border: 'border-emerald-200', iconBg: 'bg-emerald-500', Icon: ClipboardList, iconColor: 'text-white', text: 'text-emerald-700' },
    { label: 'Calculators', bg: 'bg-violet-100',  border: 'border-violet-200', iconBg: 'bg-violet-500',  Icon: Calculator,    iconColor: 'text-white', text: 'text-violet-700' },
    { label: 'Pathologies', bg: 'bg-rose-100',    border: 'border-rose-200',   iconBg: 'bg-rose-500',    Icon: Microscope,    iconColor: 'text-white', text: 'text-rose-700' },
  ];

  const quickItems = [
    { label: 'Carotid', Icon: Activity,     iconBg: 'bg-sky-100',    iconColor: 'text-sky-600' },
    { label: 'DVT',     Icon: Activity,     iconBg: 'bg-blue-100',   iconColor: 'text-blue-600' },
    { label: 'Echo',    Icon: Heart,        iconBg: 'bg-rose-100',   iconColor: 'text-rose-500' },
    { label: 'ABI',     Icon: BarChart2,    iconBg: 'bg-violet-100', iconColor: 'text-violet-600' },
    { label: 'Pelvic',  Icon: Stethoscope,  iconBg: 'bg-pink-100',   iconColor: 'text-pink-600' },
    { label: 'Thyroid', Icon: Scan,         iconBg: 'bg-amber-100',  iconColor: 'text-amber-600' },
  ];

  return (
    <div className="flex flex-col h-full pt-16 pb-[calc(env(safe-area-inset-bottom)+160px)]">
      {/* Headline */}
      <div className="px-6 mb-5 text-center">
        <h2 className="text-[26px] font-black text-slate-900 leading-tight mb-2">
          Everything you need,<br />one tap away
        </h2>
        <p className="text-[14px] text-slate-500 font-medium leading-relaxed">
          Tailored for busy sonographers — offline, fast, no fluff
        </p>
      </div>

      {/* Mini app mockup — light mode */}
      <div className="flex-1 px-6 flex flex-col min-h-0">
        <div className="flex-1 bg-slate-50 rounded-[24px] border border-slate-200 overflow-hidden shadow-xl flex flex-col min-h-0">
          {/* Mock header */}
          <div className="px-4 pt-4 pb-3 bg-gradient-to-b from-sky-50 to-transparent border-b border-slate-100">
            <div className="flex items-baseline gap-0.5 mb-2">
              <span className="text-xl font-black text-slate-900">Sono</span>
              <span className="text-xl font-black text-[#0EA5E9]">Buddy</span>
            </div>
            {/* Mock search bar */}
            <div className="bg-white border border-slate-200 rounded-xl px-3 py-2 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full border border-slate-300" />
              <span className="text-[11px] text-slate-400 font-medium">Search protocols, measurements…</span>
            </div>
          </div>

          {/* Mock browse grid */}
          <div className="px-3 pb-2 flex-1 overflow-hidden">
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 mt-2">Browse</p>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {browseItems.map(({ label, bg, border, iconBg, Icon, iconColor, text }) => (
                <div key={label} className={`${bg} border ${border} rounded-xl p-2.5`}>
                  <div className={`w-6 h-6 rounded-md ${iconBg} flex items-center justify-center mb-1.5`}>
                    <Icon size={13} className={iconColor} strokeWidth={2.5} />
                  </div>
                  <div className={`text-[9px] font-bold ${text}`}>{label}</div>
                </div>
              ))}
            </div>

            {/* Mock quick access */}
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Quick Access</p>
            <div className="grid grid-cols-3 gap-1.5">
              {quickItems.map(({ label, Icon, iconBg, iconColor }) => (
                <div key={label} className="bg-white border border-slate-200 rounded-xl py-2 px-1 text-center">
                  <div className={`w-7 h-7 rounded-lg ${iconBg} mx-auto mb-1 flex items-center justify-center`}>
                    <Icon size={13} className={iconColor} strokeWidth={2} />
                  </div>
                  <span className="text-[8px] text-slate-600 font-semibold">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Mock tab bar */}
          <div className="bg-white border-t border-slate-200 px-4 py-2 flex justify-around items-center">
            {['Home', 'Measure', 'Protocols', 'Calc', 'Path'].map((t, i) => (
              <div key={t} className="flex flex-col items-center gap-0.5">
                <div className={`w-4 h-1 rounded-full ${i === 0 ? 'bg-[#0EA5E9]' : 'bg-slate-200'}`} />
                <span className={`text-[7px] font-semibold ${i === 0 ? 'text-[#0EA5E9]' : 'text-slate-400'}`}>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Callout cards */}
      <div className="px-6 mt-4 space-y-2">
        {[
          { icon: Gauge,        color: 'text-[#0EA5E9]', bg: 'bg-sky-50', border: 'border-sky-100', text: 'Instant tools — ABI, Carotid Stenosis, OB Gestations' },
          { icon: ClipboardList, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'Browse Measurements, Protocols, Calculators, Pathologies' },
        ].map(({ icon: Icon, color, bg, border, text }, i) => (
          <div key={i} className={`${bg} border ${border} rounded-xl px-3 py-2 flex items-center gap-3`}>
            <Icon size={16} className={color} strokeWidth={2} />
            <span className="text-[12px] font-semibold text-slate-700">{text}</span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="px-6 mt-4">
        <button
          onClick={onNext}
          className="w-full bg-[#0EA5E9] active:bg-sky-600 rounded-2xl py-4 flex items-center justify-center gap-2 shadow-lg shadow-sky-200 transition-all active:scale-[0.98]"
        >
          <span className="text-white font-bold text-[16px]">Continue</span>
          <ChevronRight size={18} className="text-white" />
        </button>
      </div>
    </div>
  );
}

/* ─── Screen 3: Quick Start ──────────────────────────────────────────────── */
function Screen3({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex flex-col h-full px-6 pt-16 pb-[calc(env(safe-area-inset-bottom)+160px)]">
      {/* Mock result card — light mode */}
      <div className="bg-white rounded-[20px] border border-slate-200 overflow-hidden shadow-md mb-6">
        {/* Mock protocol header */}
        <div className="px-4 pt-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 mb-1">
            <div className="bg-sky-100 rounded-lg w-8 h-8 flex items-center justify-center">
              <Activity size={16} className="text-[#0EA5E9]" strokeWidth={2} />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-medium">Protocol</p>
              <p className="text-[13px] font-bold text-slate-900">Carotid Duplex</p>
            </div>
            <div className="ml-auto bg-emerald-100 rounded-lg px-2 py-1">
              <span className="text-[9px] font-bold text-emerald-600">Beginner</span>
            </div>
          </div>
        </div>
        {/* Mock ABI result */}
        <div className="px-4 py-3">
          <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold mb-2">ABI Calculator</p>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex-1 bg-slate-50 border border-slate-100 rounded-xl p-2.5">
              <p className="text-[8px] text-slate-400 mb-0.5">Left ABI</p>
              <p className="text-[18px] font-black text-emerald-600">1.12</p>
              <p className="text-[8px] text-emerald-600 font-semibold">Normal</p>
            </div>
            <div className="flex-1 bg-slate-50 border border-slate-100 rounded-xl p-2.5">
              <p className="text-[8px] text-slate-400 mb-0.5">Right ABI</p>
              <p className="text-[18px] font-black text-amber-500">0.68</p>
              <p className="text-[8px] text-amber-500 font-semibold">Mild Disease</p>
            </div>
          </div>
          <div className="bg-sky-50 border border-sky-100 rounded-xl px-3 py-2">
            <p className="text-[10px] text-[#0EA5E9] font-medium">ICA PSV: 245 cm/s · ICA/CCA ratio: 3.8 → 60–69% stenosis</p>
          </div>
        </div>
      </div>

      {/* Headline */}
      <h2 className="text-[26px] font-black text-slate-900 leading-tight mb-4 text-center">
        Jump in and start scanning smarter
      </h2>

      {/* Bullet features */}
      <div className="space-y-3 mb-6">
        {[
          { Icon: Ruler,         color: 'text-[#0EA5E9]',   bg: 'bg-sky-50',     text: 'Normal measurement ranges at a glance' },
          { Icon: ClipboardList, color: 'text-emerald-600', bg: 'bg-emerald-50', text: 'Step-by-step vascular & echo protocols' },
          { Icon: Calculator,    color: 'text-violet-600',  bg: 'bg-violet-50',  text: 'Instant calculators for stenosis, RI, ABI' },
          { Icon: Microscope,    color: 'text-rose-500',    bg: 'bg-rose-50',    text: 'Pathology findings & red flags' },
        ].map(({ Icon, color, bg, text }) => (
          <div key={text} className="flex items-center gap-3">
            <div className={`${bg} w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0`}>
              <Icon size={18} className={color} strokeWidth={2} />
            </div>
            <span className="text-[14px] text-slate-700 font-semibold">{text}</span>
          </div>
        ))}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Trust line */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <Heart size={12} className="text-rose-400" strokeWidth={2} fill="currentColor" />
        <span className="text-[12px] text-slate-500 font-semibold">
          Made for sonographers · No subscription
        </span>
        <Heart size={12} className="text-rose-400" strokeWidth={2} fill="currentColor" />
      </div>

      {/* CTA */}
      <button
        onClick={onNext}
        className="w-full bg-[#0EA5E9] active:bg-sky-600 rounded-2xl py-4 flex items-center justify-center gap-2 shadow-lg shadow-sky-200 transition-all active:scale-[0.98]"
      >
        <span className="text-white font-bold text-[16px]">Open SonoBuddy</span>
        <ChevronRight size={18} className="text-white" />
      </button>
    </div>
  );
}
