'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { startTapTracking, recordView, resetDepth } from '@/lib/tap-tracking';

export default function TapTracker() {
  const pathname = usePathname();

  useEffect(() => startTapTracking(), []);

  // Client-side navigation doesn't reload the page, so the pathname hook is
  // what tells us a new screen was opened.
  useEffect(() => {
    if (!pathname) return;
    recordView(pathname);
    // Banks the previous screen's scroll depth before starting the new one.
    resetDepth(pathname);
  }, [pathname]);

  return null;
}
