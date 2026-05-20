'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { Home, Ruler, ClipboardList, Calculator, Microscope } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/home', label: 'Home', Icon: Home },
  { href: '/measurements', label: 'Measures', Icon: Ruler },
  { href: '/protocols', label: 'Protocols', Icon: ClipboardList },
  { href: '/calculators', label: 'Calc', Icon: Calculator },
  { href: '/pathologies', label: 'Pathology', Icon: Microscope },
];

export default function Navigation() {
  const pathname = usePathname();

  // Hide nav on the marketing landing page
  if (pathname === '/') return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-black border-t border-white/10 safe-area-bottom shadow-lg lg:hidden">
      <div className="max-w-lg mx-auto flex items-stretch">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex-1 flex flex-col items-center justify-center py-2 px-1 text-center min-h-[60px]"
            >
              <item.Icon
                size={20}
                strokeWidth={isActive ? 2.5 : 1.8}
                className={clsx(
                  'transition-colors duration-200',
                  isActive ? 'text-sono-blue' : 'text-[#f1f4f9]'
                )}
              />
              <span
                className={clsx(
                  'text-[10px] mt-1 font-medium leading-none transition-colors duration-200',
                  isActive ? 'text-sono-blue font-semibold' : 'text-[#f1f4f9]'
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
