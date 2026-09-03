'use client';

import { useEffect } from 'react';
import { startTapTracking } from '@/lib/tap-tracking';

export default function TapTracker() {
  useEffect(() => startTapTracking(), []);
  return null;
}
