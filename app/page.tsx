'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import SearchBar from '@/components/SearchBar';
import { type SearchResult } from '@/lib/search';
import {
  Activity, Heart, Stethoscope, Calculator, Gauge, BarChart2, Workflow,
  Ruler, ClipboardList, Microscope, Scan, Plus, X, Pencil, Check,
  type LucideIcon,
} from 'lucide-react';
import { protocols } from '@/data/protocols';
import { calculators } from '@/data/calculators';

const SONO_TIPS = [
  // Vascular
  `The "superficial" femoral vein is part of the <b>deep</b> venous system — DVT here still requires anticoagulation. Never let the name mislead you or your provider.`,
  `Always angle-correct to <b>60° or less</b> for spectral Doppler velocity measurements. Angles above 60° introduce significant error and can falsely elevate or lower your PSV.`,
  `A monophasic waveform in a lower extremity artery suggests proximal obstruction. Always scan proximally — the problem is upstream.`,
  `When you see reversed flow in the <b>vertebral artery</b>, think subclavian steal. Ask if the patient has arm claudication or dizziness with arm exercise.`,
  `Color Doppler aliasing isn't always bad — it can help you quickly locate the jet of a stenosis. Use it to your advantage before switching to spectral.`,
  `The <b>ICA has no branches</b> in the neck. If you see branches, you're looking at the ECA. Tap the superficial temporal artery to confirm — ECA waveform will bounce.`,
  `For DVT compression, if the vein doesn't fully collapse with gentle pressure, that's abnormal. You shouldn't need to press hard — excessive force compresses the artery too and gives a false sense of security.`,
  `Waveform morphology tells a story: <b>triphasic = normal</b>, biphasic = mild disease, monophasic = significant proximal obstruction or high-resistance state.`,
  `When mapping veins for fistula creation, always document diameter, depth, and compressibility. A vein <b>≥ 2.5 mm</b> at rest (≥ 3.5 mm with tourniquet) is the general threshold for maturation potential.`,
  `An ABI > <b>1.3</b> is non-compressible and unreliable — calcified vessels in diabetics and renal disease patients won't compress. Consider toe pressures instead.`,
  `For AVF surveillance, a PSV ratio > <b>3.0</b> across a stenosis or brachial artery flow < 500 mL/min suggests significant stenosis needing referral.`,
  `When evaluating carotid stenosis, PSV alone isn't enough. Always use the <b>ICA/CCA PSV ratio</b> — a ratio > 4 suggests ≥ 70% stenosis even if PSV seems borderline.`,
  // Abdominal / General
  `The <b>right renal artery</b> passes behind the IVC — use the IVC as a window. Angle slightly posterior and you'll find it without needing a flank approach.`,
  `A RI > <b>0.70</b> in the renal arteries suggests increased parenchymal resistance. Think hydronephrosis, rejection (transplant), or medical renal disease.`,
  `Bowel gas is your enemy. Have patients fast for abdominal aorta and mesenteric scans, and try gentle graded compression to displace gas. Patience and position changes work.`,
  `The <b>celiac axis</b> has a classic "seagull" appearance in transverse — two wings spreading left (splenic) and right (hepatic). Once you see it, you'll never forget it.`,
  `SMA waveform is normally <b>high resistance</b> fasting and low resistance postprandial. A fasting SMA that looks low resistance may indicate bowel ischemia or AVM.`,
  `Doppler of the <b>portal vein</b> should show hepatopetal (toward liver) flow. Hepatofugal (away) flow is a red flag for portal hypertension — document and alert the reading physician immediately.`,
  `A normal aorta tapers gradually. Any segment that looks <b>larger than the one above it</b> should raise suspicion. Measure outer wall to outer wall in the true AP diameter.`,
  `When measuring the AAA, always get both AP and transverse. AP is the hemodynamically important diameter — transverse alone can underestimate due to tortuous vessels.`,
  // OB / GYN
  `Crown-rump length (CRL) is the <b>most accurate</b> dating measurement — use it before 14 weeks whenever possible. After 22 weeks, biometry dating windows widen significantly.`,
  `When you can't find the fetal heartbeat, don't panic the patient. Try the <b>TV probe</b> or wait a few minutes and recheck. Document what you see, not what you assume.`,
  `A CRL of <b>7 mm or more</b> without a visible heartbeat on transvaginal ultrasound is suspicious for failed pregnancy. A second scan 7–10 days later confirms — never diagnose on one scan alone.`,
  `The <b>yolk sac</b> appears before the embryo and should be visible by 5.5 weeks TV. A yolk sac without an embryo may mean you're early — correlate with hCG and rescan.`,
  `Placenta previa diagnosis should always be confirmed with <b>transvaginal ultrasound</b>. Transabdominal images are unreliable for the lower uterine segment — bladder filling causes false positives.`,
  `The four-chamber view isn't enough for cardiac screening — add the <b>LVOT and RVOT views</b>. Most conotruncal defects (TOF, TGA) won't be caught on four-chamber alone.`,
  `Umbilical cord should have <b>2 arteries and 1 vein</b>. A single umbilical artery (SUA) is associated with structural and chromosomal anomalies — always document and flag it.`,
  `AFI and single deepest pocket both have roles. <b>SDP ≥ 2 cm</b> is the threshold for normal. If it's borderline, note it and correlate clinically — fluid levels fluctuate.`,
  // Thyroid
  `TI-RADS isn't just about size — it's about <b>composition, echogenicity, shape, margin, and echogenic foci</b>. A 5 mm nodule can be TR5 if it has all the right features.`,
  `Taller-than-wide orientation (anteroposterior > transverse on transverse image) is the single <b>most suspicious</b> TI-RADS feature. Don't skip measuring both axes.`,
  `Comet-tail artifacts in thyroid nodules suggest benign colloid — they're different from microcalcifications. <b>True microcalcs are punctate and non-shadowing.</b>`,
  `Document the parathyroid region whenever you're doing a thyroid scan. An enlarged hypoechoic oval structure posterior to the thyroid lobe on spectral may represent a parathyroid adenoma.`,
  // Cardiac / Echo
  `In echo, <b>subcostal views</b> are your friend when parasternal and apical windows are poor — common in COPD, obesity, and post-op patients. Always try it before giving up on windows.`,
  `A pericardial effusion can look dramatic but be hemodynamically insignificant. Look for <b>RA/RV diastolic collapse</b> and IVC plethora to suggest tamponade physiology.`,
  `Doppler of the <b>mitral inflow</b>: E/A ratio < 1 in a patient > 50 suggests diastolic dysfunction. But don't over-diagnose — always integrate with tissue Doppler and clinical context.`,
  `When measuring EF by eye (visual estimation), studies show experienced sonographers are within 5–10% of quantitative methods. Trust your eye but always document biplane if the clinical question matters.`,
  // Clinical pearls
  `Always compare <b>bilateral findings</b> on vascular exams — a unilaterally elevated PSV or RI is far more meaningful than bilateral elevation, which may reflect a normal variant or technique issue.`,
  `Document your probe position and patient position when findings are subtle. The next sonographer re-scanning the patient needs to reproduce your view, not guess how you got there.`,
  `If your image quality is poor, <b>change something</b> before giving up: patient position, probe position, frequency, harmonic imaging, gain. Never submit a non-diagnostic study without documentation of attempts.`,
  `Write what you <b>see</b>, not what you think it is. "Heterogeneous hypoechoic mass with irregular margins" is your job. "Malignancy" is the radiologist's call.`,
  `When a finding surprises you, <b>scan longer</b>. Artifacts disappear, real findings persist. Real structures have consistent anatomy — artifacts change with probe angle.`,
];

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

export default function HomePage() {
  const router = useRouter();

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
  const showAddButton = quickItems.length < MAX_ITEMS;

  function handleSearchSelect(result: SearchResult) {
    router.push(result.href);
  }

  return (
    <div className="min-h-screen pb-nav bg-sono-dark">
      {/* Gradient Hero Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-sky-100 via-blue-50 to-transparent pointer-events-none" />
        <div className="relative px-5 pt-14 pb-7">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-black tracking-tight">
              <span className="text-slate-900">Sono</span><span className="text-sono-blue">Buddy</span>
            </h1>
          </div>
          <p className="text-sono-muted text-sm font-medium">Your pocket sonographer reference</p>
        </div>
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
        <div className="grid grid-cols-2 gap-3">
          {CATEGORY_TILES.map((tile) => (
            <button
              key={tile.href}
              onClick={() => router.push(tile.href)}
              className={`bg-gradient-to-br ${tile.color} border rounded-2xl p-4 text-left active:scale-95 transition-all shadow-sm`}
            >
              <div className={`${tile.iconBg} w-10 h-10 rounded-xl flex items-center justify-center mb-3`}>
                <tile.Icon size={20} className={tile.iconColor} strokeWidth={2} />
              </div>
              <div className="font-bold text-slate-800 text-sm">{tile.label}</div>
              <div className="text-[11px] text-slate-500 mt-0.5 font-medium">{tile.desc}</div>
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

        <div className="grid grid-cols-3 gap-2">
          {quickItems.map((item) => {
            const { Icon, iconBg, iconColor } = getStyle(item);
            return (
              <div key={item.id} className="relative">
                <button
                  onClick={() => { if (!editMode) router.push(item.href); }}
                  className="w-full bg-sono-card border border-sono-border rounded-2xl py-3 px-2 text-center active:scale-95 transition-all shadow-sm"
                >
                  <div className={`${iconBg} w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-1.5`}>
                    <Icon size={18} className={iconColor} strokeWidth={2} />
                  </div>
                  <div className="text-[10px] text-slate-700 font-semibold leading-tight">{item.label}</div>
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

          {showAddButton && (
            <button
              onClick={() => { setShowPicker(true); setEditMode(false); }}
              className="bg-sono-card border-2 border-dashed border-sono-border rounded-2xl py-3 px-2 text-center active:scale-95 transition-all flex flex-col items-center justify-center gap-1"
            >
              <div className="bg-slate-100 w-9 h-9 rounded-xl flex items-center justify-center">
                <Plus size={18} className="text-slate-400" strokeWidth={2} />
              </div>
              <div className="text-[10px] text-slate-400 font-semibold leading-tight">Add</div>
            </button>
          )}
        </div>
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
          <p className="text-sm text-slate-700 leading-relaxed font-medium"
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
              <h2 className="text-base font-bold text-slate-900">Add to Quick Access</h2>
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
                      <div className="text-sm font-semibold text-slate-900 truncate">{entry.label}</div>
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
