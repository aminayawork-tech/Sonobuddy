import Link from 'next/link';
import {
  Ruler, ClipboardList, Calculator, Microscope,
  Star, Zap, ShieldCheck, Stethoscope,
} from 'lucide-react';

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

function PhoneMockup() {
  return (
    <div className="relative mx-auto w-[240px] sm:w-[280px]">
      <div className="absolute inset-0 -m-8 bg-sky-400/15 rounded-full blur-3xl" />
      <div className="relative rounded-[36px] bg-white border-2 border-gray-200 shadow-2xl overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 bg-gray-100 rounded-b-2xl z-10" />
        <div className="pt-8 pb-4 px-4 bg-gray-50 min-h-[480px]">
          <div className="mb-4">
            <Logo size="lg" />
            <p className="text-gray-400 text-[10px]">Your pocket sonographer reference</p>
          </div>
          <div className="bg-white rounded-xl px-3 py-2 mb-4 flex items-center gap-2 border border-gray-200">
            <div className="w-3 h-3 rounded-full border border-gray-300" />
            <span className="text-gray-400 text-[10px]">Search protocols, measurements…</span>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {[
              { label: 'Measurements', color: 'from-sky-50 to-blue-50 border-blue-100', dot: 'bg-sky-400' },
              { label: 'Protocols', color: 'from-emerald-50 to-green-50 border-green-100', dot: 'bg-emerald-400' },
              { label: 'Calculators', color: 'from-violet-50 to-purple-50 border-purple-100', dot: 'bg-violet-400' },
              { label: 'Pathologies', color: 'from-rose-50 to-red-50 border-red-100', dot: 'bg-rose-400' },
            ].map((t) => (
              <div key={t.label} className={`bg-gradient-to-br ${t.color} border rounded-xl p-2.5`}>
                <div className={`w-4 h-4 rounded-md ${t.dot} mb-1.5 opacity-90`} />
                <div className="text-gray-700 text-[10px] font-semibold">{t.label}</div>
              </div>
            ))}
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-[10px]">💡</span>
              <span className="text-sky-500 text-[9px] font-bold uppercase tracking-widest">Tip of the Day</span>
            </div>
            <p className="text-gray-500 text-[9px] leading-relaxed">
              Always angle-correct to 60° or less for spectral Doppler measurements…
            </p>
          </div>
        </div>
        <div className="bg-white border-t border-gray-100 flex justify-around py-2">
          {['🔍', '📏', '📋', '🧮', '🔬'].map((icon, i) => (
            <div key={i} className="flex flex-col items-center gap-0.5">
              <span className="text-[12px]">{icon}</span>
              <div className={`w-1 h-1 rounded-full ${i === 0 ? 'bg-sky-400' : 'bg-transparent'}`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">

      {/* ── NAV ── */}
      <header className="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-3">
            <Link
              href="/home"
              className="text-sm text-gray-500 hover:text-gray-900 transition-colors hidden sm:block"
            >
              Open App
            </Link>
            <Link
              href="/home"
              className="bg-sky-500 hover:bg-sky-400 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
            >
              Try Free
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="pt-28 pb-20 px-5 bg-gradient-to-b from-sky-50/60 to-white">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-sky-50 border border-sky-200 rounded-full px-4 py-1.5 mb-6">
                <Zap size={13} className="text-sky-500" />
                <span className="text-sky-600 text-xs font-semibold">Built for working sonographers</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] mb-5 text-gray-900">
                The reference tool<br />
                <span className="text-sky-500">sonographers</span><br />
                actually use.
              </h1>
              <p className="text-gray-500 text-lg leading-relaxed mb-8 max-w-md mx-auto lg:mx-0">
                Instant access to measurement tables, exam protocols, calculators, and pathology guides — right in your pocket, mid-scan.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
                <Link
                  href="/home"
                  className="w-full sm:w-auto bg-sky-500 hover:bg-sky-400 text-white font-bold text-base px-8 py-3.5 rounded-2xl transition-colors shadow-lg shadow-sky-500/20"
                >
                  Open SonoBuddy Free →
                </Link>
                <p className="text-gray-400 text-sm">No account needed. Installs on your phone.</p>
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
            Install SonoBuddy as a PWA on your iPhone or Android — works offline, loads instantly, no app store needed.
          </p>
          <Link
            href="/home"
            className="inline-block bg-white hover:bg-sky-50 text-sky-600 font-bold text-base px-10 py-4 rounded-2xl transition-colors shadow-lg"
          >
            Open SonoBuddy — It&apos;s Free
          </Link>
          <p className="text-sky-200 text-xs mt-4">No account required · Works on iOS & Android · Offline capable</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-gray-100 py-8 px-5 bg-white">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo />
          <div className="flex items-center gap-5">
            <Link href="/home" className="text-gray-400 hover:text-gray-900 text-sm transition-colors">App</Link>
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
