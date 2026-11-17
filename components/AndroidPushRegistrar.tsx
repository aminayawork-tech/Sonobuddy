'use client';

import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';

/**
 * Daily-tip push notifications for the Android app (Firebase Cloud
 * Messaging). iOS registers natively in SonoBuddyApp.swift, so this only runs
 * inside the Android app — and only on builds that include the native push
 * plugin (10.2+); older installs just skip it.
 *
 * Permission is requested after onboarding, not over it, matching how a
 * first launch should feel. Tapping a notification opens its link. Android
 * shows no system banner while the app is open, so a notification that
 * arrives then is shown as an in-app banner instead.
 */
const ONBOARDED_KEY = 'sonobuddy_onboarded';
const PLAY_URL = 'https://play.google.com/store/apps/details?id=com.sonobuddy.app';

function onboarded(): boolean {
  try { return !!localStorage.getItem(ONBOARDED_KEY); } catch { return false; }
}

function post(body: object) {
  return fetch('/api/push/fcm-token/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).catch(() => { /* offline: retried next launch */ });
}

// Registration problems are reported so the daily run log can show why a
// phone never registered (e.g. Firebase missing from the build).
const report = (status: string, detail = '') => post({ status, detail: detail.slice(0, 200) });

function open(url: string | undefined) {
  if (url && (url.startsWith('/') || url.startsWith(PLAY_URL))) window.location.href = url;
}

interface Banner { title: string; body: string; url?: string }

export default function AndroidPushRegistrar() {
  const [banner, setBanner] = useState<Banner | null>(null);

  useEffect(() => {
    if (Capacitor.getPlatform() !== 'android' || !Capacitor.isPluginAvailable('PushNotifications')) return;

    let cancelled = false;
    let timer: ReturnType<typeof setInterval> | null = null;

    // Listeners first, so a tap that launched the app is delivered.
    const subs = [
      PushNotifications.addListener('registration', ({ value }) => { void post({ token: value }); }),
      PushNotifications.addListener('registrationError', ({ error }) => { void report('register-error', String(error)); }),
      PushNotifications.addListener('pushNotificationActionPerformed', ({ notification }) => {
        open((notification.data as { url?: string } | undefined)?.url);
      }),
      PushNotifications.addListener('pushNotificationReceived', (n) => {
        setBanner({
          title: n.title ?? 'SonoBuddy',
          body: n.body ?? '',
          url: (n.data as { url?: string } | undefined)?.url,
        });
      }),
    ];

    async function register() {
      try {
        await PushNotifications.createChannel({
          id: 'daily',
          name: 'Daily tips',
          description: 'One sonography tip or new job each day',
          importance: 4,
        });
        let perm = await PushNotifications.checkPermissions();
        if (perm.receive === 'prompt' || perm.receive === 'prompt-with-rationale') {
          perm = await PushNotifications.requestPermissions();
        }
        if (perm.receive !== 'granted') { void report('permission', perm.receive); return; }
        if (!cancelled) await PushNotifications.register();
      } catch (err) {
        void report('error', err instanceof Error ? err.message : String(err));
      }
    }

    if (onboarded()) {
      void register();
    } else {
      // Wait for onboarding to finish rather than prompting over it.
      timer = setInterval(() => {
        if (onboarded()) {
          if (timer) clearInterval(timer);
          timer = null;
          void register();
        }
      }, 3000);
    }

    return () => {
      cancelled = true;
      if (timer) clearInterval(timer);
      subs.forEach((s) => { void s.then((h) => h.remove()); });
    };
  }, []);

  // Auto-hide the in-app banner
  useEffect(() => {
    if (!banner) return;
    const t = setTimeout(() => setBanner(null), 7000);
    return () => clearTimeout(t);
  }, [banner]);

  if (!banner) return null;
  return (
    <div className="fixed inset-x-0 top-0 z-[70] px-3 pt-[calc(env(safe-area-inset-top)+10px)] pointer-events-none">
      <button
        type="button"
        onClick={() => { setBanner(null); open(banner.url); }}
        className="pointer-events-auto w-full max-w-lg mx-auto flex items-start gap-3 text-left bg-white/95 backdrop-blur-xl rounded-2xl ring-1 ring-slate-900/[0.08] shadow-[0_16px_40px_-16px_rgba(15,23,42,0.45)] px-4 py-3"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icons/icon-192.png" alt="" className="w-9 h-9 rounded-xl shrink-0" />
        <span className="min-w-0">
          <span className="block text-[13px] font-bold text-slate-900 truncate">{banner.title}</span>
          <span className="block text-[13px] text-slate-600 leading-snug line-clamp-2">{banner.body}</span>
        </span>
      </button>
    </div>
  );
}
