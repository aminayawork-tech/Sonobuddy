'use client';

import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import AppStoreBadge from '@/components/AppStoreBadge';
import GooglePlayBadge from '@/components/GooglePlayBadge';

type State = 'checking' | 'allowed' | 'locked';

/**
 * The app screens are meant to be used inside the iOS/Android apps. In a
 * plain browser they sit behind a password (checked server-side by
 * /api/web-access) so sonobuddy.com isn't a free web version of the app.
 * Native apps, and local development, are never gated.
 */
function isExempt(): boolean {
  if (location.protocol === 'sono-web:') return true; // iOS bundled app
  if (/SonoBuddyApp\//.test(navigator.userAgent)) return true;
  if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') return true;
  // Capacitor's Android app attaches this before any page script runs, so it
  // can't race the way the custom user agent (set in onStart) can.
  if ('androidBridge' in window) return true;
  if (window.webkit?.messageHandlers?.sonobuddy) return true; // iOS purchase bridge
  try {
    return Capacitor.isNativePlatform(); // Android app loading the live site
  } catch {
    return false;
  }
}

export default function WebAccessGate({ children }: { children: React.ReactNode }) {
  // Starts as 'checking' on the server and client alike, so app content is
  // never in the prebuilt HTML for a browser to read past the gate.
  const [state, setState] = useState<State>('checking');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isExempt()) { setState('allowed'); return; }
    fetch('/api/web-access/', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : { ok: false }))
      .then((d) => setState(d.ok ? 'allowed' : 'locked'))
      .catch(() => setState('locked'));
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/web-access/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const body = await res.json().catch(() => ({}));
      if (res.ok && body.ok) setState('allowed');
      else setError(body.error || 'Something went wrong — please try again.');
    } catch {
      setError('Couldn’t reach the server — check your connection.');
    } finally {
      setSubmitting(false);
    }
  }

  if (state === 'allowed') return <>{children}</>;
  if (state === 'checking') return <div className="min-h-screen bg-sono-dark" />;

  return (
    <div className="fixed inset-0 z-[60] bg-sono-dark overflow-y-auto">
      <div aria-hidden className="pointer-events-none absolute -top-48 left-1/2 -translate-x-1/2 w-[620px] h-[620px] rounded-full bg-sky-400/20 blur-3xl" />
      <div className="relative max-w-sm mx-auto px-6 pt-24 pb-12 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/icons/icon-192.png"
          alt=""
          className="w-16 h-16 rounded-2xl mx-auto mb-5 ring-1 ring-slate-900/[0.06] shadow-[0_14px_30px_-12px_rgba(14,165,233,0.65)]"
        />
        <h1 className="text-[28px] font-black tracking-tight leading-tight mb-2">
          <span className="text-slate-900">Sono</span><span className="text-sky-500">Buddy</span>
          <span className="text-slate-900"> lives in the app</span>
        </h1>
        <p className="text-slate-500 text-sm leading-relaxed mb-7">
          Get every measurement, protocol, calculator, and pathology on your phone — works offline in the scan room.
        </p>
        <div className="flex flex-col items-center gap-3 mb-10">
          <AppStoreBadge />
          <GooglePlayBadge />
        </div>

        <form onSubmit={submit} className="card p-5 text-left">
          <label htmlFor="web-access-password" className="block text-[11px] font-bold text-sono-muted uppercase tracking-widest mb-2">
            Have web access?
          </label>
          <input
            id="web-access-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="search-field px-4 py-3 text-sm"
          />
          {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
          <button
            type="submit"
            disabled={submitting || !password}
            className="mt-3 w-full bg-gradient-to-b from-sky-400 to-sono-blue disabled:opacity-50 text-white font-bold text-[15px] py-3 rounded-2xl shadow-[0_10px_24px_-10px_rgba(14,165,233,0.75),inset_0_1px_0_rgba(255,255,255,0.3)] transition-transform active:scale-[0.98]"
          >
            {submitting ? 'Checking…' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}
