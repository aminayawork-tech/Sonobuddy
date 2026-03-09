'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { Search, Ruler, ClipboardList, Calculator, Microscope } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', label: 'Search', Icon: Search },
  { href: '/measurements', label: 'Measures', Icon: Ruler },
  { href: '/protocols', label: 'Protocols', Icon: ClipboardList },
  { href: '/calculators', label: 'Calc', Icon: Calculator },
  { href: '/pathologies', label: 'Pathology', Icon: Microscope },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-sono-card border-t border-sono-border safe-area-bottom shadow-lg">
      <div className="max-w-lg mx-auto flex items-stretch">
        {NAV_ITEMS.map((item) => {
          const isActive = item.href === '/'
            ? pathname === '/'
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex-1 flex flex-col items-center justify-center py-2 px-1 text-center transition-colors min-h-[60px]',
                isActive
                  ? 'text-sono-blue'
                  : 'text-sono-muted hover:text-slate-600'
              )}
            >
              <item.Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
              <span className={clsx(
                'text-[10px] mt-1 font-medium leading-none',
                isActive ? 'text-sono-blue' : 'text-sono-muted'
              )}>
                {item.label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 h-0.5 w-8 bg-sono-blue rounded-t-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
