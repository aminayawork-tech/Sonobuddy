'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

const NAV_ITEMS = [
  { href: '/', label: 'Search', icon: '🔍' },
  { href: '/measurements', label: 'Measures', icon: '📏' },
  { href: '/protocols', label: 'Protocols', icon: '📋' },
  { href: '/calculators', label: 'Calc', icon: '🧮' },
  { href: '/pathologies', label: 'Pathology', icon: '🔬' },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-sono-card border-t border-sono-border safe-area-bottom">
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
                  : 'text-sono-muted hover:text-slate-300'
              )}
            >
              <span className="text-xl leading-none">{item.icon}</span>
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
