'use client';

import { useState, useEffect, useCallback } from 'react';
import { recordEvent } from '@/lib/tap-tracking';

// Free items per tab — anything not in these sets requires premium
// 1 free item per modality so every sonographer gets a taste
export const FREE_MEASUREMENT_IDS = new Set([
  'aorta-diameter',    // vascular
  'liver-span',        // abdomen
  'uterus-length',     // ob/gyn
  'thyroid-lobe-volume', // thyroid
  'pericardial-effusion-size', // cardiac
  'lymph-node-size',   // superficial
]);
export const FREE_PROTOCOL_IDS = new Set([
  'carotid-duplex',    // vascular
  'ruo',              // abdomen
  'ob-first-trimester', // ob
  // thyroid, cardiac, msk each have only 1 protocol — keep fully gated
]);
export const FREE_CALCULATOR_IDS = new Set([
  'abi',               // vascular
  'gestational-age-crl', // ob
  'volume-ellipsoid',  // general
]);
export const FREE_PATHOLOGY_IDS = new Set([
  'dvt-acute',         // vascular
  'cholecystitis-acute', // abdomen
  'ovarian-cyst',      // ob
  'thyroid-cancer-papillary', // thyroid
  'pericardial-effusion', // cardiac
  'rotator-cuff-tear', // msk
  'lymph-node-reactive-vs-malignant', // superficial
]);

declare global {
  interface Window {
    __isPremium?: boolean;
    __onPremiumUnlocked?: () => void;
    webkit?: {
      messageHandlers?: {
        sonobuddy?: { postMessage: (msg: unknown) => void };
      };
    };
  }
}

export function usePremium() {
  const [isPremium, setIsPremium] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);

  useEffect(() => {
    // Native injects window.__isPremium = true before the page loads.
    // localStorage fallback covers web-PWA and dev environments.
    const alreadyPremium =
      window.__isPremium === true ||
      localStorage.getItem('sb_premium') === '1';

    setIsPremium(alreadyPremium);

    // Called by native after a successful purchase or restore
    window.__onPremiumUnlocked = () => {
      localStorage.setItem('sb_premium', '1');
      setIsPremium(true);
      setPaywallOpen(false);
    };
  }, []);

  // `source` says which locked feature drove the tap — the paywall itself is
  // identical from every screen, so without this every trigger looked the
  // same and there was no way to tell which limit actually pushes people
  // toward buying.
  const openPaywall = useCallback((source: string = 'unknown') => {
    recordEvent(`paywall:trigger:${source}`);
    setPaywallOpen(true);
  }, []);
  const closePaywall = useCallback(() => setPaywallOpen(false), []);

  // Called by paywall buttons to trigger StoreKit in native
  const requestPurchase = useCallback(() => {
    window.webkit?.messageHandlers?.sonobuddy?.postMessage({ action: 'purchase' });
  }, []);

  const requestRestore = useCallback(() => {
    window.webkit?.messageHandlers?.sonobuddy?.postMessage({ action: 'restore' });
  }, []);

  return { isPremium, paywallOpen, openPaywall, closePaywall, requestPurchase, requestRestore };
}
