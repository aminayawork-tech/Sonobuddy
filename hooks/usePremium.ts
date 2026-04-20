'use client';

import { useState, useEffect, useCallback } from 'react';

// Free items per tab — anything not in these sets requires premium
export const FREE_MEASUREMENT_IDS = new Set(['aorta-diameter', 'carotid-imt']);
export const FREE_PROTOCOL_IDS    = new Set(['carotid-duplex', 'dvt-lower']);
export const FREE_CALCULATOR_IDS  = new Set(['abi', 'resistive-index']);
export const FREE_PATHOLOGY_IDS   = new Set(['cholecystitis-acute', 'dvt-acute']);

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

  const openPaywall = useCallback(() => setPaywallOpen(true), []);
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
