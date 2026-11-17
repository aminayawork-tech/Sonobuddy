'use client';

import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';

/**
 * Daily-tip push notifications for the Android app (Firebase Cloud
 * Messaging). iOS registers natively in SonoBuddyApp.swift, so this only runs
 * inside the Android app — and only on builds that include the native push
 * plugin (10.2+); older installs just skip it.
 *
 * Permission is requested after onboarding, not over it, matching how a
 * first launch should feel. Tapping a notification opens its article.
 */
const ONBOARDED_KEY = 'sonobuddy_onboarded';

function onboarded(): boolean {
  try { return !!localStorage.getItem(ONBOARDED_KEY); } catch { return false; }
}

async function saveToken(token: string) {
  try {
    await fetch('/api/push/fcm-token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
  } catch {
    // Offline: the token is re-sent on the next launch.
  }
}

export default function AndroidPushRegistrar() {
  useEffect(() => {
    if (Capacitor.getPlatform() !== 'android' || !Capacitor.isPluginAvailable('PushNotifications')) return;

    let cancelled = false;
    let timer: ReturnType<typeof setInterval> | null = null;

    // Listeners first, so a tap that launched the app is delivered.
    const subs = [
      PushNotifications.addListener('registration', ({ value }) => { void saveToken(value); }),
      PushNotifications.addListener('pushNotificationActionPerformed', ({ notification }) => {
        const url = (notification.data as { url?: string } | undefined)?.url;
        // In-app paths, or SonoBuddy's own Play Store page (e.g. a review
        // request); Capacitor hands play.google.com off to the Play Store app.
        if (url && (url.startsWith('/') || url.startsWith('https://play.google.com/store/apps/details?id=com.sonobuddy.app'))) {
          window.location.href = url;
        }
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
        if (perm.receive === 'granted' && !cancelled) await PushNotifications.register();
      } catch {
        // Firebase not configured in this build, or the user declined.
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

  return null;
}
