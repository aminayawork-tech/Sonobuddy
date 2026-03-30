'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Ruler, ClipboardList, Calculator, Microscope } from 'lucide-react';
import Image from 'next/image';

const NAV_ITEMS = [
  { href: '/home', label: 'Search', Icon: Search },
  { href: '/measurements', label: 'Measurements', Icon: Ruler },
  { href: '/protocols', label: 'Protocols', Icon: ClipboardList },
  { href: '/calculators', label: 'Calculators', Icon: Calculator },
  { href: '/pathologies', label: 'Pathology', Icon: Microscope },
];

export default function DesktopSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-full w-60 bg-white border-r border-slate-200 z-40 shadow-sm">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <Image
            src="/icons/Sonobuddy_icon.png"
            alt="SonoBuddy"
            width={38}
            height={38}
            className="rounded-xl shadow-sm"
          />
          <span className="text-xl font-black tracking-tight">
            <span className="text-slate-900">Sono</span>
            <span className="text-sky-500">Buddy</span>
          </span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1.5 pl-0.5">Ultrasound reference</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const isActive =
            href === '/home' ? pathname === '/home' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-sky-50 text-sky-600'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon size={18} strokeWidth={isActive ? 2.5 : 1.8} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-slate-100">
        <p className="text-[11px] text-slate-400 leading-relaxed">
          SonoBuddy · For reference only.
          <br />Not a diagnostic tool.
        </p>
      </div>
    </aside>
  );
}
