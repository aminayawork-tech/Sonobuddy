'use client';

import { useState, useEffect } from 'react';
import { Bell, BellOff, X } from 'lucide-react';

const LS_DISMISSED = 'sonobuddy-notif-dismissed';
const LS_SUBSCRIBED = 'sonobuddy-notif-subscribed';

export default function NotificationPrompt() {
  const [show, setShow] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return;
    if (localStorage.getItem(LS_DISMISSED)) return;
    if (localStorage.getItem(LS_SUBSCRIBED)) {
      setSubscribed(true);
      return;
    }
    if (Notification.permission === 'granted') {
      setSubscribed(true);
      localStorage.setItem(LS_SUBSCRIBED, '1');
      return;
    }
    if (Notification.permission === 'denied') return;

    // Show prompt after a short delay so it doesn't flash on first load
    const t = setTimeout(() => setShow(true), 2500);
    return () => clearTimeout(t);
  }, []);

  async function subscribe() {
    setLoading(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        dismiss();
        return;
      }

      const reg = await navigator.serviceWorker.ready;
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) throw new Error('VAPID public key not configured');

      const key = urlBase64ToUint8Array(vapidKey);
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: key as unknown as ArrayBuffer,
      });

      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription.toJSON()),
      });

      localStorage.setItem(LS_SUBSCRIBED, '1');
      setSubscribed(true);
      setShow(false);
    } catch (err) {
      console.error('[NotificationPrompt]', err);
    } finally {
      setLoading(false);
    }
  }

  function dismiss() {
    localStorage.setItem(LS_DISMISSED, '1');
    setShow(false);
  }

  if (!show && !subscribed) return null;

  if (subscribed) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-sono-card border border-sono-border rounded-xl text-xs text-sono-muted">
        <Bell size={13} className="text-sono-blue shrink-0" />
        <span>Daily tip notifications <span className="text-sono-green font-semibold">on</span></span>
        <button
          className="ml-auto"
          onClick={async () => {
            const reg = await navigator.serviceWorker.ready;
            const sub = await reg.pushManager.getSubscription();
            if (sub) {
              await fetch('/api/push/subscribe', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ endpoint: sub.endpoint }),
              });
              await sub.unsubscribe();
            }
            localStorage.removeItem(LS_SUBSCRIBED);
            setSubscribed(false);
          }}
        >
          <BellOff size={13} className="text-sono-muted hover:text-sono-red" />
        </button>
      </div>
    );
  }

  return (
    <div className="bg-sono-card border border-sono-blue/40 rounded-2xl p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="bg-sky-100 w-9 h-9 rounded-xl flex items-center justify-center shrink-0">
          <Bell size={18} className="text-sono-blue" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-slate-900 leading-snug">Get daily sonography tips</p>
          <p className="text-[12px] text-sono-muted mt-0.5 leading-snug">
            One tip every morning — straight to your phone.
          </p>
        </div>
        <button onClick={dismiss} className="shrink-0 text-sono-muted">
          <X size={16} />
        </button>
      </div>
      <div className="flex gap-2 mt-3">
        <button
          onClick={subscribe}
          disabled={loading}
          className="flex-1 bg-sono-blue text-white rounded-xl py-2 text-[13px] font-semibold active:scale-[0.98] transition-all disabled:opacity-60"
        >
          {loading ? 'Enabling…' : 'Enable notifications'}
        </button>
        <button
          onClick={dismiss}
          className="px-4 bg-sono-border/30 text-sono-muted rounded-xl py-2 text-[13px] font-semibold"
        >
          Not now
        </button>
      </div>
    </div>
  );
}

/** Converts a VAPID base64 public key to Uint8Array for pushManager.subscribe */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
