'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import Onboarding from '@/components/Onboarding';
import PaywallModal from '@/components/PaywallModal';
import SearchBar from '@/components/SearchBar';
import { type SearchResult } from '@/lib/search';
import { usePremium, FREE_PROTOCOL_IDS, FREE_CALCULATOR_IDS } from '@/hooks/usePremium';
import {
  Activity, Heart, Stethoscope, Calculator, Gauge, BarChart2,
  Ruler, ClipboardList, Microscope, Scan, Plus, X, Pencil, Check, Lock,
  Menu, Share2, MessageSquare, ShieldCheck, Newspaper,
  type LucideIcon,
} from 'lucide-react';
import { protocols } from '@/data/protocols';
import { calculators } from '@/data/calculators';
import { SONO_TIPS } from '@/lib/tips';
import NotificationPrompt from '@/components/NotificationPrompt';

// ── Quick Access types & defaults ────────────────────────────────────────────

type QuickAccessItem = {
  id: string;
  label: string;
  href: string;
  type: 'protocol' | 'calculator';
  category: string;
};

const CATEGORY_STYLE: Record<string, { iconBg: string; iconColor: string; Icon: LucideIcon }> = {
  vascular:       { iconBg: 'bg-sky-100',    iconColor: 'text-sky-600',    Icon: Activity     },
  abdomen:        { iconBg: 'bg-amber-100',  iconColor: 'text-amber-600',  Icon: Stethoscope  },
  ob:             { iconBg: 'bg-pink-100',   iconColor: 'text-pink-600',   Icon: Heart        },
  thyroid:        { iconBg: 'bg-violet-100', iconColor: 'text-violet-600', Icon: Scan         },
  cardiac:        { iconBg: 'bg-rose-100',   iconColor: 'text-rose-600',   Icon: Heart        },
  msk:            { iconBg: 'bg-green-100',  iconColor: 'text-green-600',  Icon: Ruler        },
  'calc-vascular':{ iconBg: 'bg-purple-100', iconColor: 'text-purple-600', Icon: BarChart2    },
  'calc-abdomen': { iconBg: 'bg-amber-100',  iconColor: 'text-amber-600',  Icon: Calculator   },
  'calc-ob':      { iconBg: 'bg-pink-100',   iconColor: 'text-pink-600',   Icon: Calculator   },
  'calc-general': { iconBg: 'bg-teal-100',   iconColor: 'text-teal-600',   Icon: Gauge        },
};

function getStyle(item: QuickAccessItem) {
  const key = item.type === 'calculator' ? `calc-${item.category}` : item.category;
  return CATEGORY_STYLE[key] ?? { iconBg: 'bg-slate-100', iconColor: 'text-slate-500', Icon: ClipboardList };
}

const DEFAULT_QUICK_ITEMS: QuickAccessItem[] = [
  { id: 'carotid-duplex',        label: 'Carotid Duplex',    href: '/protocols/carotid-duplex',        type: 'protocol',   category: 'vascular' },
  { id: 'dvt-lower',             label: 'DVT Lower',         href: '/protocols/dvt-lower',             type: 'protocol',   category: 'vascular' },
  { id: 'ue-arterial',           label: 'UE Arterial',       href: '/protocols/ue-arterial',           type: 'protocol',   category: 'vascular' },
  { id: 'echo-tte',              label: 'Echo / TTE',        href: '/protocols/echo-tte',              type: 'protocol',   category: 'cardiac'  },
  { id: 'pelvic-us',             label: 'Pelvic US',         href: '/protocols/pelvic-us',             type: 'protocol',   category: 'ob'       },
  { id: 'thyroid-ultrasound',    label: 'Thyroid US',        href: '/protocols/thyroid-ultrasound',    type: 'protocol',   category: 'thyroid'  },
  { id: 'calc-abi',              label: 'ABI Calc',          href: '/calculators?id=abi',              type: 'calculator', category: 'vascular' },
  { id: 'calc-carotid-stenosis', label: 'Carotid Stenosis',  href: '/calculators?id=carotid-stenosis', type: 'calculator', category: 'vascular' },
];

const LS_KEY = 'sonobuddy-quick-access';
const MAX_ITEMS = 8;

// ── Picker data ───────────────────────────────────────────────────────────────

type PickerEntry = QuickAccessItem & { subtitle: string };

const ALL_PICKER_ENTRIES: PickerEntry[] = [
  ...protocols.map((p) => ({
    id: p.id,
    label: p.name,
    subtitle: `Protocol · ${p.category}`,
    href: `/protocols/${p.id}`,
    type: 'protocol' as const,
    category: p.category,
  })),
  ...calculators.map((c) => ({
    id: `calc-${c.id}`,
    label: c.name,
    subtitle: `Calculator · ${c.category}`,
    href: `/calculators?id=${c.id}`,
    type: 'calculator' as const,
    category: c.category,
  })),
];

// ── Category tiles ────────────────────────────────────────────────────────────

type CategoryTile = { label: string; href: string; Icon: LucideIcon; desc: string; color: string; iconBg: string; iconColor: string };

const CATEGORY_TILES: CategoryTile[] = [
  { label: 'Measurements', href: '/measurements', Icon: Ruler,        desc: 'Normal values + ranges',   color: 'from-sky-50 to-blue-100 border-blue-200',      iconBg: 'bg-blue-100',   iconColor: 'text-blue-600'   },
  { label: 'Protocols',    href: '/protocols',    Icon: ClipboardList, desc: 'Step-by-step exam guides', color: 'from-emerald-50 to-green-100 border-green-200', iconBg: 'bg-green-100',  iconColor: 'text-green-600'  },
  { label: 'Calculators',  href: '/calculators',  Icon: Calculator,   desc: 'ABI, RI, stenosis, OB…',   color: 'from-violet-50 to-purple-100 border-purple-200',iconBg: 'bg-purple-100', iconColor: 'text-purple-600' },
  { label: 'Pathologies',  href: '/pathologies',  Icon: Microscope,   desc: 'US findings + red flags',  color: 'from-rose-50 to-red-100 border-red-200',        iconBg: 'bg-red-100',    iconColor: 'text-red-600'    },
];

// ── Page ──────────────────────────────────────────────────────────────────────

function isItemFree(item: QuickAccessItem): boolean {
  if (item.type === 'protocol') return FREE_PROTOCOL_IDS.has(item.id);
  // Quick access calculator ids are prefixed 'calc-'
  return FREE_CALCULATOR_IDS.has(item.id.replace(/^calc-/, ''));
}

export default function HomePage() {
  const router = useRouter();
  const { isPremium, paywallOpen, openPaywall, closePaywall, requestPurchase, requestRestore } = usePremium();
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Daily tip — same all day, changes at midnight
  const [tip] = useState(() => {
    const dayIndex = Math.floor(Date.now() / 86_400_000);
    return SONO_TIPS[dayIndex % SONO_TIPS.length];
  });
  const [tipDate] = useState(() =>
    new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  );

  // Quick Access state
  const [quickItems, setQuickItems] = useState<QuickAccessItem[]>(DEFAULT_QUICK_ITEMS);
  const [editMode, setEditMode] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerQuery, setPickerQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('sonobuddy_onboarded')) {
      setShowOnboarding(true);
    }
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) setQuickItems(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(quickItems));
    } catch {}
  }, [quickItems]);

  const removeItem = useCallback((id: string) => {
    setQuickItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const addItem = useCallback((entry: PickerEntry) => {
    setQuickItems((prev) => {
      if (prev.find((i) => i.id === entry.id)) return prev;
      if (prev.length >= MAX_ITEMS) return prev;
      const { subtitle: _s, ...item } = entry;
      return [...prev, item];
    });
    setShowPicker(false);
    setPickerQuery('');
  }, []);

  const pickerEntries = pickerQuery.trim()
    ? ALL_PICKER_ENTRIES.filter((e) =>
        e.label.toLowerCase().includes(pickerQuery.toLowerCase()) ||
        e.subtitle.toLowerCase().includes(pickerQuery.toLowerCase())
      )
    : ALL_PICKER_ENTRIES;

  const addedIds = new Set(quickItems.map((i) => i.id));
  const isFull = quickItems.length >= MAX_ITEMS;

  function completeOnboarding() {
    localStorage.setItem('sonobuddy_onboarded', '1');
    setShowOnboarding(false);
  }

  if (showOnboarding) {
    return <Onboarding onComplete={completeOnboarding} />;
  }

  function handleSearchSelect(result: SearchResult) {
    router.push(result.href);
  }

  return (
    <div className="min-h-screen pb-nav bg-sono-dark">
      {paywallOpen && <PaywallModal onClose={closePaywall} onPurchase={requestPurchase} onRestore={requestRestore} />}

      {/* Hamburger menu bottom sheet */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex flex-col">
          <div className="flex-1 bg-black/60" onClick={() => { setMenuOpen(false); setPrivacyOpen(false); }} />
          {/* Outer wrapper bg fills the rounded-corner notches so no white bleeds through */}
          <div className="bg-black">
            {!privacyOpen ? (
              /* ── Main menu ── */
              <div className="bg-black rounded-t-3xl px-5 pt-4 pb-6" style={{ paddingBottom: 'max(24px, env(safe-area-inset-bottom))' }}>
                <div className="flex justify-center mb-5">
                  <div className="w-10 h-1 bg-white/20 rounded-full" />
                </div>

                {/* Blog / Articles */}
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    router.push('/articles');
                  }}
                  className="w-full flex items-center justify-center gap-3 bg-white/[0.09] rounded-2xl px-5 py-4 mb-3 active:bg-white/[0.15] transition-colors"
                >
                  <Newspaper size={18} style={{ color: "#39a5e9" }} strokeWidth={1.75} />
                  <span className="text-white text-[16px] font-semibold">Blog & Articles</span>
                </button>

                {/* Share */}
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    if (navigator.share) {
                      const isNativeApp = navigator.userAgent.includes('SonoBuddyApp/iOS') || navigator.userAgent.includes('SonoBuddyApp/Android');
                      const shareUrl = isNativeApp
                        ? 'https://apps.apple.com/us/app/sonobuddy-pro/id6761020726'
                        : 'https://sonobuddy.app';
                      navigator.share({
                        title: 'SonoBuddy — Ultrasound Reference',
                        text: 'Check out SonoBuddy — the pocket reference app for sonographers!',
                        url: shareUrl,
                      }).catch(() => {});
                    }
                  }}
                  className="w-full flex items-center justify-center gap-3 bg-white/[0.09] rounded-2xl px-5 py-4 mb-3 active:bg-white/[0.15] transition-colors"
                >
                  <Share2 size={18} style={{ color: "#39a5e9" }} strokeWidth={1.75} />
                  <span className="text-white text-[16px] font-semibold">Share SonoBuddy</span>
                </button>

                {/* Feedback */}
                <a
                  href="mailto:anthony_minaya@ymail.com?subject=SonoBuddy%20Feedback"
                  onClick={() => setMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-3 bg-white/[0.09] rounded-2xl px-5 py-4 mb-3 active:bg-white/[0.15] transition-colors"
                >
                  <MessageSquare size={18} style={{ color: "#39a5e9" }} strokeWidth={1.75} />
                  <span className="text-white text-[16px] font-semibold">Send Feedback</span>
                </a>

                {/* Privacy Policy — opens inline */}
                <button
                  onClick={() => setPrivacyOpen(true)}
                  className="w-full flex items-center justify-center gap-3 bg-white/[0.09] rounded-2xl px-5 py-4 active:bg-white/[0.15] transition-colors"
                >
                  <ShieldCheck size={18} style={{ color: "#39a5e9" }} strokeWidth={1.75} />
                  <span className="text-white text-[16px] font-semibold">Privacy Policy</span>
                </button>
              </div>
            ) : (
              /* ── Privacy Policy inline view ── */
              <div className="bg-black rounded-t-3xl flex flex-col" style={{ maxHeight: '85vh' }}>
                {/* Handle */}
                <div className="flex justify-center pt-4 pb-2 shrink-0">
                  <div className="w-10 h-1 bg-white/20 rounded-full" />
                </div>
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 shrink-0">
                  <button onClick={() => setPrivacyOpen(false)} className="text-[#0EA5E9] text-sm font-medium">← Back</button>
                  <span className="font-bold text-[15px]"><span className="text-white">Sono</span><span className="text-[#39a5e9]">Buddy</span> <span className="text-white/60 font-normal">Privacy</span></span>
                  <button onClick={() => { setMenuOpen(false); setPrivacyOpen(false); }}>
                    <X size={18} className="text-white/50" />
                  </button>
                </div>
                {/* Scrollable content */}
                <div className="overflow-y-auto px-5 py-4 space-y-4" style={{ paddingBottom: 'max(32px, env(safe-area-inset-bottom))' }}>
                  <p className="text-white/50 text-xs">Last updated: March 24, 2026</p>
                  <p className="text-white/80 text-[13px] leading-relaxed">SonoBuddy — Ultrasound Reference is a clinical reference tool. We do not require an account, we do not sell your data, and we do not share your personal information with third parties for advertising. We may collect anonymous usage analytics to improve the app.</p>

                  {[
                    { heading: '1. Who We Are', body: 'SonoBuddy — Ultrasound Reference is operated by SonoBuddy. We provide a mobile reference application for sonographers and ultrasound technologists. Questions? Contact us via the Feedback button.', jsx: null },
                    { heading: '2. Information We Collect', body: 'No account required. You can use all core features without providing any personal information.\n\nSupport contact: If you email us, we receive your name and email address solely to respond to your inquiry.\n\nUsage analytics: We use Google Analytics to collect anonymous, aggregated data about which features are used and session duration. This does not identify you personally.\n\nWe do not collect: your medical records, patient data, precise location, financial information, or any clinical queries you perform within the app. All clinical reference content is stored locally on your device.', jsx: null },
                    { heading: '3. What We Don\'t Collect', body: '• Patient data of any kind\n• Real patient information entered into calculators\n• Location data\n• Advertising identifiers\n• Financial or payment information\n• Health records' },
                    { heading: '4. How We Use Your Information', body: 'To operate and improve SonoBuddy — Ultrasound Reference, respond to support requests, understand aggregate usage patterns, and ensure security. We do not use your information for targeted advertising.' },
                    { heading: '5. How the App Works', body: 'All clinical content — measurements, protocols, calculators, and pathologies — is bundled statically with the app. No clinical data is sent to any server when you use the reference features or calculators. The app functions fully offline once installed.' },
                    { heading: '6. Sharing of Information', body: 'We do not sell, rent, or trade your personal information. Limited sharing occurs with service providers (Google Analytics, Vercel) under their privacy terms, or if required by law.' },
                    { heading: '7. Local Storage', body: 'The app may use your device\'s local storage solely to enable offline functionality. This data never leaves your device and contains only app code and content — never personal or patient information.' },
                    { heading: '8. Children\'s Privacy', body: 'SonoBuddy — Ultrasound Reference is intended for licensed healthcare professionals and students 17 years of age and older. We do not knowingly collect personal information from children under 13.' },
                    { heading: '9. Your Rights', body: 'You may request access to, correction of, or deletion of any personal data we hold by emailing contact us via the Feedback button. You may opt out of Google Analytics via Google\'s opt-out tool.' },
                    { heading: '10. Clinical Disclaimer', body: 'SonoBuddy — Ultrasound Reference is a reference tool only and is not a medical device, diagnostic tool, or substitute for clinical judgment. All clinical decisions must involve the ordering provider and interpreting physician. Do not enter real patient data into any calculator field.' },
                    { heading: '11. Changes to This Policy', body: 'If we change our data practices, we will update this page. Continued use of the app after changes constitutes acceptance of the updated policy.' },
                    { heading: '12. Contact', body: 'Questions about this privacy policy? Email us at contact us via the Feedback button' },
                  ].map(({ heading, body, jsx }) => (
                    <div key={heading}>
                      <p className="text-white font-bold text-[13px] mb-1">{heading}</p>
                      <p className="text-white/70 text-[13px] leading-relaxed whitespace-pre-line">{jsx ?? body}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hero Header */}
      <div className="px-5 pt-14 pb-7">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-3xl font-black tracking-tight">
            <span className="text-slate-900">Sono</span><span className="text-sono-blue">Buddy</span>
          </h1>
          <button
            onClick={() => setMenuOpen(true)}
            className="w-10 h-10 flex items-center justify-center rounded-xl active:bg-slate-100 transition-colors"
            aria-label="Open menu"
          >
            <Menu size={22} className="text-slate-700" strokeWidth={2} />
          </button>
        </div>
        <p className="text-sono-muted text-[14px] font-normal">Your pocket sonographer reference</p>
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {CATEGORY_TILES.map((tile) => (
            <button
              key={tile.href}
              onClick={() => router.push(tile.href)}
              className={`bg-gradient-to-br ${tile.color} border rounded-2xl p-4 text-left active:scale-95 transition-all shadow-sm`}
            >
              <div className={`${tile.iconBg} w-10 h-10 rounded-xl flex items-center justify-center mb-3`}>
                <tile.Icon size={20} className={tile.iconColor} strokeWidth={2} />
              </div>
              <div className="font-bold text-slate-900 text-[14px] tracking-tight">{tile.label}</div>
              <div className="text-[12px] text-slate-500 mt-1">{tile.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Access */}
      <div className="px-5 mb-7">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] font-bold text-sono-muted uppercase tracking-widest">Quick Access</p>
          <button
            onClick={() => setEditMode((v) => !v)}
            className="flex items-center gap-1 text-[11px] font-semibold text-sono-blue"
          >
            {editMode ? (
              <><Check size={13} /><span>Done</span></>
            ) : (
              <><Pencil size={13} /><span>Edit</span></>
            )}
          </button>
        </div>

        <div className="grid grid-cols-3 lg:grid-cols-5 gap-2">
          {quickItems.map((item) => {
            const { Icon, iconBg, iconColor } = getStyle(item);
            const locked = !isPremium && !isItemFree(item);
            return (
              <div key={item.id} className="relative">
                <button
                  onClick={() => {
                    if (editMode) return;
                    if (locked) { openPaywall(); return; }
                    router.push(item.href);
                  }}
                  className={`w-full bg-sono-card border border-sono-border rounded-2xl py-3 px-2 text-center active:scale-95 transition-all shadow-sm ${locked ? 'opacity-60' : ''}`}
                >
                  <div className={`${iconBg} w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-1.5`}>
                    {locked
                      ? <Lock size={15} className="text-slate-400" strokeWidth={2} />
                      : <Icon size={18} className={iconColor} strokeWidth={2} />
                    }
                  </div>
                  <div className="text-[11px] text-slate-700 font-semibold leading-tight">{item.label}</div>
                </button>
                {editMode && (
                  <button
                    onClick={() => removeItem(item.id)}
                    className="absolute -top-1.5 -right-1.5 bg-red-500 rounded-full w-5 h-5 flex items-center justify-center shadow-md z-10"
                  >
                    <X size={11} className="text-white" strokeWidth={3} />
                  </button>
                )}
              </div>
            );
          })}

          <button
            onClick={() => {
              if (!isPremium) { openPaywall(); return; }
              if (!isFull) setShowPicker(true);
              setEditMode(true);
            }}
            className="bg-sono-card border-2 border-dashed border-sono-border rounded-2xl py-3 px-2 text-center active:scale-95 transition-all flex flex-col items-center justify-center gap-1"
          >
            <div className="bg-slate-100 w-9 h-9 rounded-xl flex items-center justify-center">
              {isPremium
                ? <Plus size={18} className="text-slate-400" strokeWidth={2} />
                : <Lock size={16} className="text-slate-400" strokeWidth={2} />
              }
            </div>
            <div className="text-[10px] text-slate-400 font-semibold leading-tight">{isFull ? 'Edit' : 'Add'}</div>
          </button>
        </div>
      </div>

      {/* Notification opt-in */}
      <div className="px-5 mb-4">
        <NotificationPrompt />
      </div>

      {/* Tip Card */}
      <div className="px-5 mb-6">
        <div className="bg-slate-900 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-[#0EA5E9] uppercase tracking-widest">Tip of the Day</span>
            <span className="text-[11px] text-slate-400 font-medium">{tipDate}</span>
          </div>
          <p className="text-[15px] text-[#f1f5f9] leading-relaxed font-normal [&_strong]:text-[#ea4743] [&_b]:text-[#ea4743]"
            dangerouslySetInnerHTML={{ __html: tip }}
          />
        </div>
      </div>

      <div className="px-5 pb-4 text-center">
        <p className="text-[11px] text-sono-muted">SonoBuddy · Made for sonographers</p>
      </div>

      {/* Picker modal */}
      {showPicker && (
        <div className="fixed inset-0 z-50 flex flex-col">
          <div className="flex-1 bg-black/40" onClick={() => { setShowPicker(false); setPickerQuery(''); }} />
          <div className="bg-sono-dark rounded-t-3xl border-t border-sono-border max-h-[80vh] flex flex-col">
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-slate-300 rounded-full" />
            </div>
            <div className="px-5 pt-2 pb-3 flex items-center justify-between">
              <h2 className="text-base font-black text-slate-900 tracking-tight">Add to Quick Access</h2>
              <button onClick={() => { setShowPicker(false); setPickerQuery(''); }}>
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            <div className="px-5 pb-3">
              <input
                autoFocus
                type="text"
                value={pickerQuery}
                onChange={(e) => setPickerQuery(e.target.value)}
                placeholder='Search protocols & calculators…'
                className="w-full bg-sono-card border border-sono-border rounded-xl px-4 py-2.5 text-slate-900 placeholder-sono-muted focus:outline-none focus:border-sono-blue text-sm"
              />
            </div>
            <div className="overflow-y-auto px-5 pb-8 space-y-2">
              {pickerEntries.map((entry) => {
                const { Icon, iconBg, iconColor } = getStyle(entry);
                const already = addedIds.has(entry.id);
                return (
                  <button
                    key={entry.id}
                    disabled={already}
                    onClick={() => addItem(entry)}
                    className={`w-full flex items-center gap-3 bg-sono-card border rounded-2xl px-4 py-3 text-left transition-all ${
                      already
                        ? 'border-sono-border opacity-40'
                        : 'border-sono-border active:scale-[0.98] hover:border-sono-blue/50'
                    }`}
                  >
                    <div className={`${iconBg} w-9 h-9 rounded-xl flex items-center justify-center shrink-0`}>
                      <Icon size={18} className={iconColor} strokeWidth={2} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[14px] font-semibold text-slate-900 truncate">{entry.label}</div>
                      <div className="text-[11px] text-sono-muted">{entry.subtitle}</div>
                    </div>
                    {already && <span className="text-[11px] text-sono-muted shrink-0">Added</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
