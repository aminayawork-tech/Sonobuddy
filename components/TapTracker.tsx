'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { startTapTracking, recordView } from '@/lib/tap-tracking';

export default function TapTracker() {
  const pathname = usePathname();

  useEffect(() => startTapTracking(), []);

  // Client-side navigation doesn't reload the page, so the pathname hook is
  // what tells us a new screen was opened.
  useEffect(() => {
    if (pathname) recordView(pathname);
  }, [pathname]);

  return null;
}
