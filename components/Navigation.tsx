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
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-sono-card/95 backdrop-blur-md border-t border-sono-border safe-area-bottom shadow-lg">
      <div className="max-w-lg mx-auto flex items-stretch">
        {NAV_ITEMS.map((item) => {
          const isActive = item.href === '/'
            ? pathname === '/'
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex-1 flex flex-col items-center justify-center py-2 px-1 text-center min-h-[60px] relative"
            >
              {/* Sliding pill background */}
              <span
                className={clsx(
                  'absolute inset-x-1.5 top-1.5 bottom-3 rounded-xl transition-all duration-200',
                  isActive ? 'bg-sono-blue/15 scale-100 opacity-100' : 'scale-90 opacity-0'
                )}
              />

              <item.Icon
                size={20}
                strokeWidth={isActive ? 2.5 : 1.8}
                className={clsx(
                  'relative z-10 transition-all duration-200',
                  isActive ? 'text-sono-blue scale-110' : 'text-sono-muted scale-100'
                )}
              />
              <span
                className={clsx(
                  'relative z-10 text-[10px] mt-1 font-medium leading-none transition-all duration-200',
                  isActive ? 'text-sono-blue font-semibold' : 'text-sono-muted'
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
