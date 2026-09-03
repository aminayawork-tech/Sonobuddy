/**
 * First-party tap tracking.
 *
 * Built rather than bought because SonoBuddy is offline-first: hosted
 * analytics need a live connection at the moment of the tap, so every session
 * in a basement scan room would be invisible. This queues taps in
 * localStorage and flushes them whenever a connection is available, so
 * offline usage is captured rather than lost.
 *
 * Privacy: records *what* was tapped and *where* on screen — never what the
 * user typed. Form fields are skipped entirely, and label text is length-
 * capped and stripped of digits so no free text or measurement value can
 * leak into an event.
 */

const ENDPOINT = 'https://www.sonobuddy.com/api/events/';
const QUEUE_KEY = 'sb_tap_queue_v1';
const SESSION_KEY = 'sb_tap_session_v1';

// Flush once the queue reaches this size, so a busy session reports promptly.
const FLUSH_AT = 15;
// Hard cap so a long offline stretch can never fill the storage quota.
const MAX_QUEUE = 400;
// Grid resolution for the heatmap. Coarse enough that cells accumulate
// meaningful counts rather than scattering one tap each.
const GRID_COLS = 20;
const GRID_ROWS = 40;

export interface TapEvent {
  /** 'ios' for the native app shell, 'web' for the site */
  surface: string;
  /** Route with dynamic segments collapsed, e.g. /articles/[slug] */
  route: string;
  /** Human-readable identifier for the tapped control */
  label: string;
  /** Grid cell as "col,row" — viewport-relative, for thumb-reach heatmaps */
  cell: string;
  /** Viewport bucket, so phone and tablet taps aren't averaged together */
  vw: number;
  ts: number;
  session: string;
}

function surface(): string {
  if (typeof navigator === 'undefined') return 'unknown';
  return navigator.userAgent.includes('SonoBuddyApp/iOS') ? 'ios' : 'web';
}

/** Collapse dynamic segments so all article taps aggregate onto one route. */
export function normalizeRoute(path: string): string {
  return path
    .replace(/\/articles\/[^/?#]+/, '/articles/[slug]')
    .replace(/\/blog\/[^/?#]+/, '/blog/[slug]')
    .replace(/\/protocols\/[^/?#]+/, '/protocols/[id]')
    .replace(/[?#].*$/, '')
    .replace(/\/$/, '') || '/';
}

/**
 * Derive a label for the tapped control, preferring explicit annotation over
 * scraped text. Digits are stripped because visible text in this app can
 * include measurement values the user entered.
 */
function labelFor(el: Element): string | null {
  const target = el.closest<HTMLElement>(
    '[data-track], a, button, [role="button"], [role="tab"], summary'
  );
  if (!target) return null;

  const explicit = target.getAttribute('data-track');
  if (explicit) return explicit.slice(0, 60);

  const aria = target.getAttribute('aria-label');
  if (aria) return aria.replace(/\d+/g, '#').trim().slice(0, 60);

  const text = (target.textContent || '').replace(/\s+/g, ' ').trim();
  if (text) return text.replace(/\d+/g, '#').slice(0, 60);

  const href = target.getAttribute('href');
  if (href) return `link:${normalizeRoute(href)}`;

  return target.tagName.toLowerCase();
}

/** Never record interactions with anything the user types into. */
function isSensitive(el: Element): boolean {
  return !!el.closest('input, textarea, select, [contenteditable="true"], [data-track-ignore]');
}

function sessionId(): string {
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = Math.random().toString(36).slice(2, 10);
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    // Private mode or blocked storage — a per-load id still groups one session.
    return 'nostore';
  }
}

function readQueue(): TapEvent[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeQueue(events: TapEvent[]): void {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(events.slice(-MAX_QUEUE)));
  } catch {
    // Quota exceeded or storage unavailable — drop silently. Analytics must
    // never break the app.
  }
}

let flushing = false;

export async function flush(): Promise<void> {
  if (flushing) return;
  const events = readQueue();
  if (events.length === 0) return;
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return;

  flushing = true;
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      // text/plain keeps this a CORS "simple request", so no preflight —
      // which matters because the app's origin is the sono-web:// scheme.
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ events }),
      keepalive: true,
    });

    if (res.ok) {
      // Only drop what we sent; taps recorded during the request survive.
      const remaining = readQueue().slice(events.length);
      writeQueue(remaining);
    }
    // On failure the queue is left intact and retried on the next flush.
  } catch {
    // Offline or blocked — keep the queue for later.
  } finally {
    flushing = false;
  }
}

function record(e: MouseEvent): void {
  const el = e.target as Element | null;
  if (!el || !(el instanceof Element)) return;
  if (isSensitive(el)) return;

  const label = labelFor(el);
  if (!label) return;

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  if (!vw || !vh) return;

  const col = Math.min(GRID_COLS - 1, Math.floor((e.clientX / vw) * GRID_COLS));
  const row = Math.min(GRID_ROWS - 1, Math.floor((e.clientY / vh) * GRID_ROWS));

  const event: TapEvent = {
    surface: surface(),
    route: normalizeRoute(window.location.pathname),
    label,
    cell: `${col},${row}`,
    // Bucket the viewport so phone and tablet layouts stay separable.
    vw: vw < 480 ? 480 : vw < 768 ? 768 : vw < 1024 ? 1024 : 1440,
    ts: Date.now(),
    session: sessionId(),
  };

  const queue = readQueue();
  queue.push(event);
  writeQueue(queue);

  if (queue.length >= FLUSH_AT) void flush();
}

let started = false;

export function startTapTracking(): () => void {
  if (started || typeof window === 'undefined') return () => {};
  started = true;

  // The admin viewer would otherwise pollute its own data.
  if (window.location.pathname.startsWith('/admin')) {
    started = false;
    return () => {};
  }

  document.addEventListener('click', record, { capture: true, passive: true });

  // Send whatever is pending when the app is backgrounded — on iOS this is
  // frequently the last chance before the webview is suspended.
  const onHide = () => { if (document.visibilityState === 'hidden') void flush(); };
  document.addEventListener('visibilitychange', onHide);
  window.addEventListener('pagehide', onHide);
  // Drain anything left over from a previous offline session.
  window.addEventListener('online', () => void flush());
  setTimeout(() => void flush(), 3000);

  return () => {
    document.removeEventListener('click', record, { capture: true });
    document.removeEventListener('visibilitychange', onHide);
    window.removeEventListener('pagehide', onHide);
    started = false;
  };
}
