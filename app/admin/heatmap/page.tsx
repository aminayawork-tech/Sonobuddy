'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Tap analytics viewer. Client-only so it survives the static export, and
 * token-gated at the API rather than here — the page itself is just a shell.
 *
 * The heat is overlaid on the live page rendered in an iframe at phone width.
 * That works because the iOS app is these same pages inside a webview, so a
 * 390px rendering is a faithful stand-in for the app screen.
 */

const GRID_COLS = 20;
const BAND_PX = 20;
const PHONE_W = 390;
const API = '/api/events/summary/';
const TOKEN_KEY = 'sb_analytics_token';

interface Pair { name: string; count: number }
interface Summary {
  day: string;
  surface: string;
  route: string | null;
  days: string[];
  routes: Pair[];
  elements: Pair[];
  cells: Pair[];
  pageCells: Pair[];
}

/**
 * Routes with a real page behind them. Anything else — a dynamic route, or a
 * stale entry for a page that no longer exists — would render a 404 inside
 * the frame, which reads as a broken dashboard rather than missing data.
 */
const PREVIEWABLE = new Set([
  '/home',
  '/measurements',
  '/protocols',
  '/calculators',
  '/pathologies',
  '/articles',
  '/app',
  '/',
  '/blog',
  '/privacy',
]);

function previewUrl(route: string): string | null {
  if (!PREVIEWABLE.has(route)) return null;
  return route === '/' ? '/' : `${route}/`;
}

export default function HeatmapAdminPage() {
  const [token, setToken] = useState('');
  const [surface, setSurface] = useState('web');
  const [day, setDay] = useState(() => new Date().toISOString().slice(0, 10));
  const [route, setRoute] = useState<string | null>(null);
  const [data, setData] = useState<Summary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showHeat, setShowHeat] = useState(true);
  const [frameH, setFrameH] = useState(844);
  const frameRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(TOKEN_KEY);
      if (saved) setToken(saved);
    } catch { /* storage blocked */ }
  }, []);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ day, surface });
      if (route) params.set('route', route);
      // Token goes in a header, never the query string — query strings leak
      // into server logs, browser history, and referrer headers.
      const res = await fetch(`${API}?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
        referrerPolicy: 'no-referrer',
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Request failed (${res.status})`);
      }
      setData(await res.json());
      try { localStorage.setItem(TOKEN_KEY, token); } catch { /* ignore */ }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [token, day, surface, route]);

  useEffect(() => { if (token) void load(); }, [load, token]);

  /** Grow the iframe to the full document height so nothing needs scrolling. */
  const onFrameLoad = useCallback(() => {
    try {
      const doc = frameRef.current?.contentDocument;
      const h = doc?.body?.scrollHeight;
      if (h && h > 200) setFrameH(Math.min(h, 12000));
    } catch {
      // Cross-origin would throw; same-origin here, so this is just defensive.
    }
  }, []);

  const url = route ? previewUrl(route) : null;
  const maxPage = data?.pageCells.reduce((m, c) => Math.max(m, c.count), 0) ?? 0;
  const totalTaps = data?.routes.reduce((s, r) => s + r.count, 0) ?? 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 px-5 py-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-black tracking-tight text-white mb-1">Tap Analytics</h1>
        <p className="text-slate-400 text-sm mb-8">
          Where people tap, shown on the real screen. Offline taps queue on device and
          appear once the app reconnects, so recent numbers may lag.
        </p>

        <div className="flex flex-wrap gap-3 mb-8">
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Access token"
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm min-w-[200px]"
          />
          <select
            value={surface}
            onChange={(e) => { setSurface(e.target.value); setRoute(null); }}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm"
          >
            <option value="web">Website</option>
            <option value="ios">iOS app</option>
          </select>
          <select
            value={day}
            onChange={(e) => { setDay(e.target.value); setRoute(null); }}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm"
          >
            <option value={day}>{day}</option>
            {data?.days.filter((d) => d !== day).map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <button
            onClick={() => void load()}
            className="bg-sky-500 text-white font-semibold rounded-lg px-4 py-2 text-sm"
          >
            {loading ? 'Loading…' : 'Refresh'}
          </button>
        </div>

        {error && (
          <div className="bg-red-950 border border-red-800 text-red-300 rounded-lg px-4 py-3 text-sm mb-6">
            {error}
          </div>
        )}

        {!token && <p className="text-slate-500 text-sm">Enter your access token to load data.</p>}

        {data && (
          <div className="grid lg:grid-cols-[280px_1fr_260px] gap-8 items-start">
            {/* Screens */}
            <section>
              <h2 className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-3">
                Screens · {totalTaps} taps
              </h2>
              {data.routes.length === 0 ? (
                <p className="text-slate-500 text-sm">No taps recorded for this day.</p>
              ) : (
                <ul className="space-y-1">
                  {data.routes.map((r) => (
                    <li key={r.name}>
                      <button
                        onClick={() => setRoute(r.name)}
                        className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-sm text-left transition-colors ${
                          route === r.name ? 'bg-sky-500/20 text-sky-300' : 'bg-slate-900 hover:bg-slate-800'
                        }`}
                      >
                        <span className="font-mono truncate text-xs">{r.name}</span>
                        <span className="tabular-nums text-slate-400 shrink-0">{r.count}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* The screen, with heat on top */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  {route ? `Screen · ${route}` : 'Screen'}
                </h2>
                {route && (
                  <label className="flex items-center gap-2 text-xs text-slate-400">
                    <input
                      type="checkbox"
                      checked={showHeat}
                      onChange={(e) => setShowHeat(e.target.checked)}
                    />
                    Show heat
                  </label>
                )}
              </div>

              {!route ? (
                <p className="text-slate-500 text-sm">Select a screen on the left.</p>
              ) : !url ? (
                <p className="text-slate-500 text-sm">
                  No single page to render for <span className="font-mono">{route}</span> —
                  it is either a dynamic route covering many pages, or not a real screen.
                  Control counts are still shown on the right.
                </p>
              ) : (
                <div
                  className="relative rounded-2xl overflow-hidden border border-slate-700 bg-white"
                  style={{ width: PHONE_W }}
                >
                  <iframe
                    ref={frameRef}
                    src={url}
                    onLoad={onFrameLoad}
                    title={`Preview of ${route}`}
                    width={PHONE_W}
                    height={frameH}
                    style={{ border: 0, display: 'block' }}
                    // Rendered for reference only — clicks belong to the overlay.
                    scrolling="no"
                  />
                  {showHeat && (
                    <div
                      className="absolute inset-0"
                      style={{ pointerEvents: 'none' }}
                      aria-hidden
                    >
                      {data.pageCells.map((c) => {
                        const [colStr, bandStr] = c.name.split(',');
                        const col = Number(colStr);
                        const band = Number(bandStr);
                        if (!isFinite(col) || !isFinite(band)) return null;
                        const intensity = maxPage ? c.count / maxPage : 0;
                        const size = 44 + intensity * 46;
                        const x = ((col + 0.5) / GRID_COLS) * PHONE_W;
                        const y = (band + 0.5) * BAND_PX;
                        return (
                          <div
                            key={c.name}
                            title={`${c.count} taps`}
                            style={{
                              position: 'absolute',
                              left: x - size / 2,
                              top: y - size / 2,
                              width: size,
                              height: size,
                              borderRadius: '50%',
                              background: `radial-gradient(circle, rgba(239,68,68,${0.25 + intensity * 0.55}) 0%, rgba(245,158,11,${0.18 + intensity * 0.35}) 45%, rgba(14,165,233,0) 75%)`,
                            }}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
              {route && url && maxPage === 0 && (
                <p className="text-slate-500 text-sm mt-3">
                  No positional data yet for this screen. Positions are recorded from the
                  next build onward.
                </p>
              )}
            </section>

            {/* Controls */}
            <section>
              <h2 className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-3">
                Controls tapped
              </h2>
              {!route ? (
                <p className="text-slate-500 text-sm">Select a screen.</p>
              ) : data.elements.length === 0 ? (
                <p className="text-slate-500 text-sm">No control data for this screen.</p>
              ) : (
                <ul className="space-y-1">
                  {data.elements.slice(0, 30).map((el) => (
                    <li
                      key={el.name}
                      className="flex items-center justify-between gap-3 bg-slate-900 px-3 py-2 rounded-lg text-sm"
                    >
                      <span className="truncate">{el.name}</span>
                      <span className="tabular-nums text-slate-400 shrink-0">{el.count}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
