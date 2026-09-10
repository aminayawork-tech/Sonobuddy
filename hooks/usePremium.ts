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

const SHARE_UNLOCKED_KEY = 'sb_share_unlocked';

declare global {
  interface Window {
    __isPremium?: boolean;
    __onPremiumUnlocked?: () => void;
    __onShareCompleted?: () => void;
    __onPurchaseError?: (message: string) => void;
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
  // Persisted once someone completes a share, so the discounted price stays
  // available on future paywall visits without asking them to share again.
  const [shareUnlocked, setShareUnlocked] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);

  useEffect(() => {
    // Native injects window.__isPremium = true before the page loads.
    // localStorage fallback covers web-PWA and dev environments.
    const alreadyPremium =
      window.__isPremium === true ||
      localStorage.getItem('sb_premium') === '1';

    setIsPremium(alreadyPremium);
    setShareUnlocked(localStorage.getItem(SHARE_UNLOCKED_KEY) === '1');

    // Called by native after a successful purchase or restore
    window.__onPremiumUnlocked = () => {
      localStorage.setItem('sb_premium', '1');
      setIsPremium(true);
      setPaywallOpen(false);
    };

    // Called by native only when the share sheet completes (a target was
    // picked) — cancelling it does not call this, so backing out of the
    // share sheet never unlocks the discount.
    window.__onShareCompleted = () => {
      localStorage.setItem(SHARE_UNLOCKED_KEY, '1');
      setShareUnlocked(true);
      recordEvent('paywall:share-completed');
    };

    // Called by native when a purchase/restore/discount attempt throws.
    // Without this the button looked broken on failure, which is what was
    // driving people to tap Restore Purchase repeatedly.
    window.__onPurchaseError = (message: string) => {
      setPurchaseError(message);
    };
  }, []);

  // `source` says which locked feature drove the tap — the paywall itself is
  // identical from every screen, so without this every trigger looked the
  // same and there was no way to tell which limit actually pushes people
  // toward buying.
  const openPaywall = useCallback((source: string = 'unknown') => {
    recordEvent(`paywall:trigger:${source}`);
    setPurchaseError(null);
    setPaywallOpen(true);
  }, []);
  const closePaywall = useCallback(() => setPaywallOpen(false), []);
  const clearPurchaseError = useCallback(() => setPurchaseError(null), []);

  // Called by paywall buttons to trigger StoreKit in native
  const requestPurchase = useCallback(() => {
    window.webkit?.messageHandlers?.sonobuddy?.postMessage({ action: 'purchase' });
  }, []);

  const requestDiscountPurchase = useCallback(() => {
    window.webkit?.messageHandlers?.sonobuddy?.postMessage({ action: 'purchaseDiscount' });
  }, []);

  const requestRestore = useCallback(() => {
    window.webkit?.messageHandlers?.sonobuddy?.postMessage({ action: 'restore' });
  }, []);

  const requestShare = useCallback(() => {
    window.webkit?.messageHandlers?.sonobuddy?.postMessage({ action: 'share' });
  }, []);

  return {
    isPremium,
    paywallOpen,
    openPaywall,
    closePaywall,
    requestPurchase,
    requestRestore,
    shareUnlocked,
    requestShare,
    requestDiscountPurchase,
    purchaseError,
    clearPurchaseError,
  };
}
