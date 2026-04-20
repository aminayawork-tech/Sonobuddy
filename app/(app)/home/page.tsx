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
      {/* Hero Header */}
      <div className="px-5 pt-14 pb-7">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-3xl font-black tracking-tight">
            <span className="text-slate-900">Sono</span><span className="text-sono-blue">Buddy</span>
          </h1>
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
        <div className="bg-sono-card border border-sono-border rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="bg-sky-100 rounded-lg w-7 h-7 flex items-center justify-center text-sm">💡</div>
              <span className="text-xs font-bold text-sono-blue uppercase tracking-widest">Tip of the Day</span>
            </div>
            <span className="text-[11px] text-sono-muted font-medium">{tipDate}</span>
          </div>
          <p className="text-[14px] text-slate-700 leading-relaxed font-normal"
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
