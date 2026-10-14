'use client';

import { useState, useEffect, useCallback } from 'react';
import { Capacitor, registerPlugin } from '@capacitor/core';
import { recordEvent } from '@/lib/tap-tracking';

// Android counterpart to the iOS window.webkit.messageHandlers.sonobuddy
// bridge — see android/app/src/main/java/com/sonobuddy/app/SonoBuddyBillingPlugin.java.
// Both platforms end up driving the same window.__onPremiumUnlocked /
// window.__onPurchaseError callbacks below, so nothing else in the app needs
// to know which platform it's running on.
interface SonoBuddyBillingPlugin {
  purchase(): Promise<{ success?: boolean; cancelled?: boolean }>;
  purchaseDiscount(): Promise<{ success?: boolean; cancelled?: boolean }>;
  restore(): Promise<{ success: boolean }>;
  checkStatus(): Promise<{ success: boolean }>;
  share(): Promise<{ completed?: boolean }>;
}
const SonoBuddyBilling = registerPlugin<SonoBuddyBillingPlugin>('SonoBuddyBilling');
const isAndroid = () => Capacitor.getPlatform() === 'android';

// Shared by PaywallModal and the onboarding offer screen so a price test
// only needs flipping in one place instead of drifting between two
// hardcoded copies. Ran a 2-week test at $9.99 (vs the usual $6.99
// flash-sale price); resuming the $6.99 sale to compare conversion.
export const FLASH_SALE_ACTIVE = true;

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
  'dvt-lower',         // vascular — has a real reference image, unlike carotid-duplex
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
    __onPremiumUnlocked?: (action?: string) => void;
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

    // Called by native after a successful purchase or restore. `action` is
    // the request that succeeded — 'purchase' | 'purchaseDiscount' |
    // 'restore' — passed only from a live tap, never from the silent
    // checkStatus() sync on launch, so a real completed sale can finally be
    // told apart from someone merely tapping the button. Recording the
    // completion here, not in PaywallModal, since the modal is already
    // closed by the time this fires.
    window.__onPremiumUnlocked = (action?: string) => {
      localStorage.setItem('sb_premium', '1');
      setIsPremium(true);
      setPaywallOpen(false);
      if (action) recordEvent(`paywall:completed:${action}`);
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

    // Android has no WKWebView-style "inject a global before the page
    // parses" hook, so premium status is confirmed asynchronously here
    // instead of synchronously like iOS's window.__isPremium.
    if (isAndroid() && !alreadyPremium) {
      SonoBuddyBilling.checkStatus()
        .then((result) => { if (result.success) window.__onPremiumUnlocked?.(); })
        .catch(() => { /* billing not connected yet — user can still try to buy */ });
    }
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

  // Called by paywall buttons to trigger StoreKit (iOS) or Play Billing
  // (Android) in native. Android resolves/rejects this plugin call directly
  // instead of native calling back into evaluated JS, but drives the exact
  // same window.__onPremiumUnlocked / window.__onPurchaseError callbacks so
  // the rest of this hook doesn't need a platform branch anywhere else.
  const requestPurchase = useCallback(() => {
    if (isAndroid()) {
      SonoBuddyBilling.purchase()
        .then((result) => { if (result.success) window.__onPremiumUnlocked?.('purchase'); })
        .catch((err) => window.__onPurchaseError?.(err?.message || 'Something went wrong — please try again.'));
      return;
    }
    window.webkit?.messageHandlers?.sonobuddy?.postMessage({ action: 'purchase' });
  }, []);

  const requestDiscountPurchase = useCallback(() => {
    if (isAndroid()) {
      SonoBuddyBilling.purchaseDiscount()
        .then((result) => { if (result.success) window.__onPremiumUnlocked?.('purchaseDiscount'); })
        .catch((err) => window.__onPurchaseError?.(err?.message || 'Something went wrong — please try again.'));
      return;
    }
    window.webkit?.messageHandlers?.sonobuddy?.postMessage({ action: 'purchaseDiscount' });
  }, []);

  const requestRestore = useCallback(() => {
    if (isAndroid()) {
      SonoBuddyBilling.restore()
        .then((result) => {
          if (result.success) window.__onPremiumUnlocked?.('restore');
          else window.__onPurchaseError?.('No previous purchase found for this account.');
        })
        .catch((err) => window.__onPurchaseError?.(err?.message || 'Something went wrong — please try again.'));
      return;
    }
    window.webkit?.messageHandlers?.sonobuddy?.postMessage({ action: 'restore' });
  }, []);

  const requestShare = useCallback(() => {
    if (isAndroid()) {
      SonoBuddyBilling.share()
        .then((result) => { if (result.completed) window.__onShareCompleted?.(); })
        .catch(() => { /* cancelled or failed — leave the share offer untouched, same as iOS */ });
      return;
    }
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
