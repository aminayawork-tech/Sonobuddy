'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Ruler, ClipboardList, Calculator, Microscope,
  Star, Zap, ShieldCheck, Stethoscope,
} from 'lucide-react';

// ── Store URLs — swap in real links when published ─────────────────────────
const APP_STORE_URL = '#app-store';      // TODO: replace with App Store URL
const PLAY_STORE_URL = '#google-play';   // TODO: replace with Google Play URL

// ── Data ──────────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    Icon: Ruler,
    color: 'bg-sky-50 text-sky-500',
    title: 'Measurement Tables',
    desc: 'Instant normal/abnormal values for vascular, OB, thyroid, cardiac, and abdominal exams — with clinical context.',
  },
  {
    Icon: ClipboardList,
    color: 'bg-emerald-50 text-emerald-500',
    title: 'Exam Protocols',
    desc: 'Step-by-step scanning guides with key images, probe tips, and full report checklists. Never miss a view again.',
  },
  {
    Icon: Calculator,
    color: 'bg-violet-50 text-violet-500',
    title: 'Clinical Calculators',
    desc: 'ABI, Resistive Index, carotid stenosis grading, gestational age, EDD, organ volumes — built-in and instant.',
  },
  {
    Icon: Microscope,
    color: 'bg-rose-50 text-rose-500',
    title: 'Pathology Library',
    desc: "Ultrasound findings, red flags, differentials, and reporting tips for the most common pathologies you'll encounter.",
  },
];

const STEPS = [
  { number: '01', title: 'Open SonoBuddy', desc: 'No login. No loading screen. Opens instantly like a native app from your home screen.' },
  { number: '02', title: 'Search or Browse', desc: 'Search across everything — measurements, protocols, calculators, and pathologies in one tap.' },
  { number: '03', title: 'Scan with Confidence', desc: 'Reference normal values mid-exam, follow step-by-step protocols, and generate accurate reports.' },
];

const TESTIMONIALS = [
  {
    name: 'Sarah M.',
    role: 'Vascular Sonographer, 2 yrs',
    stars: 5,
    text: 'I used to keep a stack of papers in my pocket. SonoBuddy replaced all of it. The carotid stenosis calculator alone is worth it.',
  },
  {
    name: 'James R.',
    role: 'New Grad Sonographer',
    stars: 5,
    text: 'As a new grad, I was terrified of getting measurements wrong. Having instant reference to normal ranges mid-scan is a game changer.',
  },
  {
    name: 'Priya K.',
    role: 'OB/GYN Sonographer',
    stars: 5,
    text: 'The OB protocols and gestational age calculator are spot on. I recommend this to every student I mentor.',
  },
];

// ── Store Badges ──────────────────────────────────────────────────────────────

function AppStoreBadge({ className = '' }: { className?: string }) {
  return (
    <a
      href={APP_STORE_URL}
      className={`inline-flex items-center gap-2.5 bg-black hover:bg-gray-800 text-white px-5 py-3 rounded-xl transition-colors ${className}`}
    >
      {/* Apple logo */}
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white shrink-0" xmlns="http://www.w3.org/2000/svg">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98l-.09.06c-.22.14-2.19 1.28-2.17 3.81.03 3.02 2.65 4.03 2.68 4.04l-.06.17zM13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
      </svg>
      <div className="text-left">
        <div className="text-[10px] text-gray-300 leading-none mb-0.5">Download on the</div>
        <div className="text-[15px] font-semibold leading-none">App Store</div>
      </div>
    </a>
  );
}

function PlayStoreBadge({ className = '' }: { className?: string }) {
  return (
    <a
      href={PLAY_STORE_URL}
      className={`inline-flex items-center gap-2.5 bg-black hover:bg-gray-800 text-white px-5 py-3 rounded-xl transition-colors opacity-50 cursor-not-allowed pointer-events-none ${className}`}
      aria-label="Google Play — coming soon"
    >
      {/* Google Play icon */}
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white shrink-0" xmlns="http://www.w3.org/2000/svg">
        <path d="M3.18 23.76c.37.2.8.2 1.18 0l11.58-6.68-2.45-2.45-10.31 9.13zM.5 1.4C.19 1.74 0 2.23 0 2.88v18.24c0 .65.19 1.14.5 1.48l.08.07 10.21-10.2v-.24L.58 1.33.5 1.4zm19.1 10.01l-2.63-1.52-2.73 2.73 2.73 2.73 2.65-1.53c.76-.44.76-1.97-.02-2.41zM4.36.24L15.94 6.92l-2.45 2.45L3.18.24C3.56.04 3.98.04 4.36.24z" />
      </svg>
      <div className="text-left">
        <div className="text-[10px] text-gray-300 leading-none mb-0.5">Coming soon on</div>
        <div className="text-[15px] font-semibold leading-none">Google Play</div>
      </div>
    </a>
  );
}

// ── Logo ──────────────────────────────────────────────────────────────────────

function Logo({ size = 'base' }: { size?: 'base' | 'lg' }) {
  const cls = size === 'lg'
    ? 'text-2xl font-black tracking-tight'
    : 'text-xl font-black tracking-tight';
  return (
    <span className={cls}>
      <span className="text-gray-900">Sono</span><span className="text-sky-500">Buddy</span>
    </span>
  );
}

// ── Phone Mockup ──────────────────────────────────────────────────────────────

function Phone({ src, alt, className = '' }: { src: string; alt: string; className?: string }) {
  return (
    // Shadow is on the rounded element itself so it follows the round shape — no rect grey corners
    <div className={`rounded-[38px] bg-white shadow-2xl overflow-hidden border-[3px] border-gray-800 ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="w-full block" />
    </div>
  );
}

function PhoneMockup() {
  return (
    <div className="relative w-[315px] sm:w-[370px] lg:w-[420px] h-[475px] sm:h-[535px] lg:h-[600px]">
      {/* Glow */}
      <div className="absolute inset-0 bg-sky-400/10 rounded-full blur-3xl scale-110" />
      {/* Back phone — largely behind front, sticks out right for depth */}
      <div className="absolute right-0 top-[30px] w-[185px] sm:w-[210px] lg:w-[235px]">
        <Phone src="/screenshots/IMG_9590.PNG" alt="SonoBuddy protocols screen" />
      </div>
      {/* Front phone — z-10, larger */}
      <div className="absolute left-0 top-0 w-[210px] sm:w-[235px] lg:w-[265px] z-10">
        <Phone src="/screenshots/IMG_9588.PNG" alt="SonoBuddy home screen" />
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const router = useRouter();
  const [isStandalone, setIsStandalone] = useState<boolean | null>(null);

  useEffect(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as { standalone?: boolean }).standalone === true;
    setIsStandalone(standalone);
    if (standalone) {
      router.replace('/home');
    }
  }, [router]);

  // Don't render the marketing page while detecting mode, or if we're in-app
  if (isStandalone === null || isStandalone) {
    return <div className="min-h-screen bg-sono-dark" />;
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">

      {/* ── NAV ── */}
      <header className="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-3">
            <Link
              href="/blog"
              className="text-sm text-gray-500 hover:text-gray-900 transition-colors hidden sm:block"
            >
              Blog
            </Link>
            <a
              href={APP_STORE_URL}
              className="inline-flex items-center gap-2 bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-xl transition-colors text-sm font-semibold"
            >
              Download on App Store
            </a>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="pt-28 pb-24 px-5 bg-gradient-to-b from-sky-50/60 to-white overflow-visible">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-12">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-sky-50 border border-sky-200 rounded-full px-4 py-1.5 mb-6">
                <Zap size={13} className="text-sky-500" />
                <span className="text-sky-600 text-xs font-semibold">Built for working sonographers</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-black tracking-tight leading-[1.1] mb-5 text-gray-900">
                The reference tool<br />
                <span className="text-sky-500">sonographers</span> use.
              </h1>
              <p className="text-gray-500 text-lg leading-relaxed mb-8 max-w-md mx-auto lg:mx-0">
                Instant access to measurement tables, exam protocols, calculators, and pathology guides — right in your pocket, mid-scan.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
                <AppStoreBadge />
                <PlayStoreBadge />
              </div>
              <div className="flex items-center justify-center lg:justify-start gap-5 mt-8">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <span className="text-gray-400 text-sm">Loved by new grads</span>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-emerald-500" />
                  <span className="text-gray-400 text-sm">Clinically sourced</span>
                </div>
              </div>
            </div>
            <div className="flex-1 flex justify-center lg:justify-end">
              <PhoneMockup />
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-20 px-5 border-t border-gray-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sky-500 text-sm font-semibold uppercase tracking-widest mb-3">Everything in one app</p>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900">
              Stop Googling mid-scan.
            </h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">
              SonoBuddy puts every reference you need in one fast, phone-friendly app — no login, no loading.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-gray-300 transition-all"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>
                  <f.Icon size={20} />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-20 px-5 bg-gray-50">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-sky-500 text-sm font-semibold uppercase tracking-widest mb-3">Simple by design</p>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900 mb-12">
            Ready in seconds, not minutes.
          </h2>
          <div className="flex flex-col sm:flex-row gap-8 justify-center">
            {STEPS.map((s, i) => (
              <div key={s.number} className="flex-1 relative">
                {i < STEPS.length - 1 && (
                  <div className="hidden sm:block absolute top-5 left-[calc(50%+2rem)] w-full h-px bg-gray-200" />
                )}
                <div className="bg-sky-500 rounded-2xl w-12 h-12 flex items-center justify-center mx-auto mb-4 shadow-md shadow-sky-500/20">
                  <span className="text-white font-black text-sm">{s.number}</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-20 px-5 border-t border-gray-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sky-500 text-sm font-semibold uppercase tracking-widest mb-3">Real feedback</p>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900">
              Sonographers love it.
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm"
              >
                <div className="flex items-center gap-0.5 mb-3">
                  {[...Array(t.stars)].map((_, i) => (
                    <Star key={i} size={13} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>
                <div>
                  <div className="text-gray-900 font-semibold text-sm">{t.name}</div>
                  <div className="text-gray-400 text-xs">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section className="py-20 px-5 bg-sky-500">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Stethoscope size={28} className="text-white" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-4 text-white">
            Your pocket reference.<br />Always ready.
          </h2>
          <p className="text-sky-100 mb-8 leading-relaxed">
            Download SonoBuddy on the App Store — works offline, loads instantly, built for the scan room.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <AppStoreBadge />
            <PlayStoreBadge />
          </div>
          <p className="text-sky-200 text-xs mt-4">No account required · Works on iOS & Android · Offline capable</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-gray-100 py-8 px-5 bg-white">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo />
          <div className="flex items-center gap-5">
            <Link href="/blog" className="text-gray-400 hover:text-gray-900 text-sm transition-colors">Blog</Link>
            <Link href="/privacy" className="text-gray-400 hover:text-gray-900 text-sm transition-colors">Privacy</Link>
          </div>
          <p className="text-gray-400 text-xs">
            © {new Date().getFullYear()} SonoBuddy · For reference only. Not a diagnostic tool.
          </p>
        </div>
      </footer>

    </div>
  );
}
