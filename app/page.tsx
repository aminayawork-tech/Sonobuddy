'use client';

import { useRouter } from 'next/navigation';
import SearchBar from '@/components/SearchBar';
import { type SearchResult } from '@/lib/search';
import {
  Activity, Heart, Stethoscope, Calculator, Gauge, BarChart2, Workflow,
  Ruler, ClipboardList, Microscope, Scan, type LucideIcon,
} from 'lucide-react';

type QuickLink = { label: string; href: string; Icon: LucideIcon; iconBg: string; iconColor: string };
type CategoryTile = { label: string; href: string; Icon: LucideIcon; desc: string; color: string; iconBg: string; iconColor: string };

const QUICK_LINKS: QuickLink[] = [
  { label: 'Carotid Duplex',    href: '/protocols/carotid-duplex',        Icon: Activity,     iconBg: 'bg-sky-100',    iconColor: 'text-sky-600'    },
  { label: 'DVT Lower',         href: '/protocols/dvt-lower',             Icon: Activity,     iconBg: 'bg-blue-100',   iconColor: 'text-blue-600'   },
  { label: 'UE Arterial',       href: '/protocols/ue-arterial',           Icon: Activity,     iconBg: 'bg-cyan-100',   iconColor: 'text-cyan-600'   },
  { label: 'Echo / TTE',        href: '/protocols/echo-tte',              Icon: Heart,        iconBg: 'bg-rose-100',   iconColor: 'text-rose-600'   },
  { label: 'Pelvic US',         href: '/protocols/pelvic-us',             Icon: Stethoscope,  iconBg: 'bg-violet-100', iconColor: 'text-violet-600' },
  { label: 'Thyroid US',        href: '/protocols/thyroid-ultrasound',    Icon: Scan,         iconBg: 'bg-amber-100',  iconColor: 'text-amber-600'  },
  { label: 'ABI Calc',          href: '/calculators?id=abi',              Icon: Gauge,        iconBg: 'bg-purple-100', iconColor: 'text-purple-600' },
  { label: 'Carotid Stenosis',  href: '/calculators?id=carotid-stenosis', Icon: BarChart2,    iconBg: 'bg-purple-100', iconColor: 'text-purple-600' },
  { label: 'AVF Surveillance',  href: '/protocols/av-fistula-graft',      Icon: Workflow,     iconBg: 'bg-teal-100',   iconColor: 'text-teal-600'   },
];

const CATEGORY_TILES: CategoryTile[] = [
  { label: 'Measurements', href: '/measurements', Icon: Ruler,        desc: 'Normal values + ranges',    color: 'from-sky-50 to-blue-100 border-blue-200',     iconBg: 'bg-blue-100',   iconColor: 'text-blue-600'   },
  { label: 'Protocols',    href: '/protocols',    Icon: ClipboardList, desc: 'Step-by-step exam guides',  color: 'from-emerald-50 to-green-100 border-green-200', iconBg: 'bg-green-100',  iconColor: 'text-green-600'  },
  { label: 'Calculators',  href: '/calculators',  Icon: Calculator,   desc: 'ABI, RI, stenosis, OB…',    color: 'from-violet-50 to-purple-100 border-purple-200', iconBg: 'bg-purple-100', iconColor: 'text-purple-600' },
  { label: 'Pathologies',  href: '/pathologies',  Icon: Microscope,   desc: 'US findings + red flags',   color: 'from-rose-50 to-red-100 border-red-200',        iconBg: 'bg-red-100',    iconColor: 'text-red-600'    },
];

export default function HomePage() {
  const router = useRouter();

  function handleSearchSelect(result: SearchResult) {
    router.push(result.href);
  }

  return (
    <div className="min-h-screen pb-nav bg-sono-dark">
      {/* Gradient Hero Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-sky-100 via-blue-50 to-transparent pointer-events-none" />
        <div className="relative px-5 pt-14 pb-7">
          <div className="flex items-center gap-2.5 mb-1">
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

      {/* Quick Links */}
      <div className="px-5 mb-7">
        <p className="text-[11px] font-bold text-sono-muted uppercase tracking-widest mb-3">Quick Access</p>
        <div className="grid grid-cols-3 gap-2">
          {QUICK_LINKS.map((link) => (
            <button
              key={link.href}
              onClick={() => router.push(link.href)}
              className="bg-sono-card border border-sono-border rounded-2xl py-3 px-2 text-center active:scale-95 transition-all shadow-sm"
            >
              <div className={`${link.iconBg} w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-1.5`}>
                <link.Icon size={18} className={link.iconColor} strokeWidth={2} />
              </div>
              <div className="text-[10px] text-slate-600 font-semibold leading-tight">{link.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Tip Card */}
      <div className="px-5 mb-6">
        <div className="bg-sono-card border border-sono-border rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-sky-100 rounded-lg w-7 h-7 flex items-center justify-center text-sm">💡</div>
            <span className="text-xs font-bold text-sono-blue uppercase tracking-widest">Sono Tip</span>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed font-medium">
            The &ldquo;superficial&rdquo; femoral vein is part of the <span className="text-slate-900 font-bold">deep</span> venous system — DVT here still requires anticoagulation. Never let the name mislead you or your provider.
          </p>
        </div>
      </div>

      <div className="px-5 pb-4 text-center">
        <p className="text-[11px] text-sono-muted">SonoBuddy · Made for sonographers</p>
      </div>
    </div>
  );
}
