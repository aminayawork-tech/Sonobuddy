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
// Page-relative vertical resolution: one band per 20 CSS pixels, capped so a
// pathological scroll height can't produce unbounded keys.
export const BAND_PX = 20;
const MAX_BAND = 600;

export interface TapEvent {
  /**
   * 'tap' a click on a control, 'view' arriving on a screen, 'dead' a tap on
   * something non-interactive, 'scroll' how far down a screen was read,
   * 'event' a named milestone such as a paywall step.
   */
  type: 'tap' | 'view' | 'dead' | 'scroll' | 'event';
  /** 'ios' for the native app shell, 'web' for the site */
  surface: string;
  /** Route with dynamic segments collapsed, e.g. /articles/[slug] */
  route: string;
  /** Human-readable identifier for the tapped control */
  label: string;
  /** Grid cell as "col,row" — viewport-relative, for thumb-reach heatmaps */
  cell: string;
  /**
   * Page-relative position as "col,band", where band is a 20px slice down the
   * document. Viewport coordinates move with scroll, so only this can be
   * overlaid on a rendering of the actual page.
   */
  pcell: string;
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

function enqueue(event: TapEvent): void {
  const queue = readQueue();
  queue.push(event);
  writeQueue(queue);
  if (queue.length >= FLUSH_AT) void flush();
}

/**
 * Record arriving on a screen. Taps alone leave a blind spot: a screen people
 * open, read and leave without touching anything registers as unused. Views
 * also give the ordering needed to reconstruct a session's path.
 */
export function recordView(path: string): void {
  if (typeof window === 'undefined' || !trackingActive) return;
  enqueue({
    type: 'view',
    surface: surface(),
    route: normalizeRoute(path),
    label: '',
    cell: '',
    pcell: '',
    vw: window.innerWidth < 480 ? 480 : window.innerWidth < 768 ? 768 : 1024,
    ts: Date.now(),
    session: sessionId(),
  });
}

/**
 * Record a named milestone — paywall steps, and anything else worth counting
 * that isn't a tap. The name is a fixed string chosen in code, never derived
 * from anything the user typed.
 */
export function recordEvent(name: string): void {
  if (typeof window === 'undefined' || !trackingActive) return;
  enqueue({
    type: 'event',
    surface: surface(),
    route: normalizeRoute(window.location.pathname),
    label: name.slice(0, 60),
    cell: '',
    pcell: '',
    vw: window.innerWidth,
    ts: Date.now(),
    session: sessionId(),
  });
}

// Deepest point reached on the current screen, reported when leaving it.
let maxDepth = 0;
let depthRoute = '';

function currentDepth(): number {
  const doc = document.documentElement;
  const scrollable = doc.scrollHeight - window.innerHeight;
  if (scrollable <= 40) return 100; // Screen fits; treat as fully seen.
  return Math.round(((window.scrollY + window.innerHeight) / doc.scrollHeight) * 100);
}

function trackDepth(): void {
  const d = currentDepth();
  if (d > maxDepth) maxDepth = Math.min(100, d);
}

/** Flush the depth reached on the screen being left, bucketed to 25s. */
function reportDepth(): void {
  if (!trackingActive || !depthRoute || maxDepth <= 0) return;
  const bucket = maxDepth >= 90 ? 100 : maxDepth >= 75 ? 75 : maxDepth >= 50 ? 50 : maxDepth >= 25 ? 25 : 10;
  enqueue({
    type: 'scroll',
    surface: surface(),
    route: depthRoute,
    label: String(bucket),
    cell: '',
    pcell: '',
    vw: window.innerWidth,
    ts: Date.now(),
    session: sessionId(),
  });
  maxDepth = 0;
}

/** Called on navigation: bank the previous screen's depth, then reset. */
export function resetDepth(route: string): void {
  if (typeof window === 'undefined') return;
  if (depthRoute && depthRoute !== normalizeRoute(route)) reportDepth();
  depthRoute = normalizeRoute(route);
  maxDepth = 0;
  trackDepth();
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

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  if (!vw || !vh) return;

  const col = Math.min(GRID_COLS - 1, Math.floor((e.clientX / vw) * GRID_COLS));
  const row = Math.min(GRID_ROWS - 1, Math.floor((e.clientY / vh) * GRID_ROWS));
  const band = Math.min(MAX_BAND, Math.floor((e.clientY + window.scrollY) / BAND_PX));

  const event: TapEvent = {
    // A tap that hits nothing interactive is a frustration signal worth
    // seeing, not noise to discard.
    type: label ? 'tap' : 'dead',
    surface: surface(),
    route: normalizeRoute(window.location.pathname),
    label: label ?? '',
    cell: `${col},${row}`,
    pcell: `${col},${band}`,
    // Bucket the viewport so phone and tablet layouts stay separable.
    vw: vw < 480 ? 480 : vw < 768 ? 768 : vw < 1024 ? 1024 : 1440,
    ts: Date.now(),
    session: sessionId(),
  };

  enqueue(event);
}

let started = false;
let trackingActive = false;

export function startTapTracking(): () => void {
  if (started || typeof window === 'undefined') return () => {};
  started = true;

  // The admin viewer would otherwise pollute its own data — both directly,
  // and via the page previews it renders in an iframe.
  const embedded = (() => {
    try { return window.self !== window.top; } catch { return true; }
  })();
  if (window.location.pathname.startsWith('/admin') || embedded) {
    started = false;
    return () => {};
  }
  trackingActive = true;

  document.addEventListener('click', record, { capture: true, passive: true });
  window.addEventListener('scroll', trackDepth, { passive: true });

  // Send whatever is pending when the app is backgrounded — on iOS this is
  // frequently the last chance before the webview is suspended.
  const onHide = () => {
    if (document.visibilityState === 'hidden') { reportDepth(); void flush(); }
  };
  document.addEventListener('visibilitychange', onHide);
  window.addEventListener('pagehide', onHide);
  // Drain anything left over from a previous offline session.
  window.addEventListener('online', () => void flush());
  setTimeout(() => void flush(), 3000);

  return () => {
    trackingActive = false;
    document.removeEventListener('click', record, { capture: true });
    window.removeEventListener('scroll', trackDepth);
    document.removeEventListener('visibilitychange', onHide);
    window.removeEventListener('pagehide', onHide);
    started = false;
  };
}
