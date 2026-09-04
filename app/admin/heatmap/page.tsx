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
interface Journey { session: string; path: string[] }
interface Summary {
  day: string;
  surface: string;
  route: string | null;
  days: string[];
  routes: Pair[];
  views: Pair[];
  named: Pair[];
  searchMisses: Pair[];
  deadRoutes: Pair[];
  deadCells: Pair[];
  scroll: Pair[];
  viewports: string[];
  vw: string;
  sessionCount: number;
  journeys: Journey[];
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
  const [vw, setVw] = useState<string | null>(null);
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
      if (vw) params.set('vw', vw);
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
  }, [token, day, surface, route, vw]);

  useEffect(() => { if (token) void load(); }, [load, token]);

  const [resetting, setResetting] = useState(false);

  /** Wipe a day so test traffic can't be mistaken for real usage. */
  const reset = useCallback(async () => {
    if (!token) return;
    if (!window.confirm(`Delete all ${surface} analytics for ${day}? This cannot be undone.`)) return;
    setResetting(true);
    setError(null);
    try {
      const res = await fetch(`/api/events/reset/?day=${day}&surface=${surface}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        referrerPolicy: 'no-referrer',
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || `Reset failed (${res.status})`);
      setRoute(null);
      setVw(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Reset failed');
    } finally {
      setResetting(false);
    }
  }, [token, day, surface, load]);

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
  const totalViews = data?.views.reduce((s, r) => s + r.count, 0) ?? 0;

  // Paywall steps in funnel order, each as a share of how many saw it.
  const funnel = (() => {
    if (!data) return [] as { label: string; count: number; pct: number | null }[];
    const get = (n: string) => data.named.find((x) => x.name === n)?.count ?? 0;
    const shown = get('paywall:shown');
    const step = (label: string, count: number, isBase = false) => ({
      label,
      count,
      pct: isBase || shown === 0 ? null : Math.round((count / shown) * 100),
    });
    if (shown === 0 && data.named.length === 0) return [];
    return [
      step('Saw paywall', shown, true),
      step('Tapped purchase', get('paywall:purchase')),
      step('Tapped restore', get('paywall:restore')),
      step('Dismissed', get('paywall:dismissed')),
    ];
  })();

  // Merge views and taps into one list so a screen that was opened but never
  // touched still appears — that gap is exactly what taps alone hide.
  const screenRows = (() => {
    if (!data) return [];
    const byRoute = new Map<string, { name: string; views: number; taps: number }>();
    for (const v of data.views) byRoute.set(v.name, { name: v.name, views: v.count, taps: 0 });
    for (const t of data.routes) {
      const row = byRoute.get(t.name) ?? { name: t.name, views: 0, taps: 0 };
      row.taps = t.count;
      byRoute.set(t.name, row);
    }
    return Array.from(byRoute.values()).sort((a, b) => (b.views - a.views) || (b.taps - a.taps));
  })();

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
          <input
            type="date"
            value={day}
            max={new Date().toISOString().slice(0, 10)}
            onChange={(e) => { if (e.target.value) { setDay(e.target.value); setRoute(null); setVw(null); } }}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm [color-scheme:dark]"
          />
          <button
            onClick={() => void load()}
            className="bg-sky-500 text-white font-semibold rounded-lg px-4 py-2 text-sm"
          >
            {loading ? 'Loading…' : 'Refresh'}
          </button>
        </div>

        {data && data.days.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-6 -mt-4">
            <span className="text-[11px] uppercase tracking-wide text-slate-500">Days with data</span>
            {data.days.slice(0, 14).map((d) => (
              <button
                key={d}
                onClick={() => { setDay(d); setRoute(null); setVw(null); }}
                className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                  d === day
                    ? 'bg-sky-500/20 border-sky-600 text-sky-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {d}
              </button>
            ))}
            <button
              onClick={reset}
              disabled={resetting}
              className="ml-auto text-xs px-3 py-1 rounded-full border border-red-900 text-red-400 hover:bg-red-950 disabled:opacity-50 transition-colors"
              title="Delete all recorded data for this day and surface"
            >
              {resetting ? 'Clearing…' : `Clear ${day} (${surface})`}
            </button>
          </div>
        )}

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
              <h2 className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-1">
                Screens
              </h2>
              <p className="text-xs text-slate-500 mb-3">
                {data.sessionCount} sessions · {totalViews} views · {totalTaps} taps
              </p>
              {screenRows.length === 0 ? (
                <p className="text-slate-500 text-sm">Nothing recorded for this day.</p>
              ) : (
                <ul className="space-y-1">
                  {screenRows.map((r) => (
                    <li key={r.name}>
                      <button
                        onClick={() => { setRoute(r.name); setVw(null); }}
                        className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-sm text-left transition-colors ${
                          route === r.name ? 'bg-sky-500/20 text-sky-300' : 'bg-slate-900 hover:bg-slate-800'
                        }`}
                      >
                        <span className="font-mono truncate text-xs">{r.name}</span>
                        <span className="tabular-nums text-xs shrink-0">
                          <span className="text-slate-200">{r.views}</span>
                          <span className="text-slate-600"> / </span>
                          <span className="text-slate-500">{r.taps}</span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <p className="text-[11px] text-slate-600 mt-2">views / taps</p>
            </section>

            {/* The screen, with heat on top */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  {route ? `Screen · ${route}` : 'Screen'}
                </h2>
                {route && (
                  <div className="flex items-center gap-3">
                    {data.viewports.length > 0 && (
                      <select
                        value={data.vw}
                        onChange={(e) => setVw(e.target.value)}
                        title="Screen width the taps came from"
                        className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs"
                      >
                        {data.viewports.map((v) => (
                          <option key={v} value={v}>
                            {v === '480' ? 'Phone' : v === '768' ? 'Tablet' : `Desktop ${v}`}
                          </option>
                        ))}
                      </select>
                    )}
                    <label className="flex items-center gap-2 text-xs text-slate-400">
                      <input
                        type="checkbox"
                        checked={showHeat}
                        onChange={(e) => setShowHeat(e.target.checked)}
                      />
                      Show heat
                    </label>
                  </div>
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
                      {data.deadCells.map((c) => {
                        const [colStr, bandStr] = c.name.split(',');
                        const col = Number(colStr);
                        const band = Number(bandStr);
                        if (!isFinite(col) || !isFinite(band)) return null;
                        const x = ((col + 0.5) / GRID_COLS) * PHONE_W;
                        const y = (band + 0.5) * BAND_PX;
                        return (
                          <div
                            key={`dead-${c.name}`}
                            title={`${c.count} taps on nothing`}
                            style={{
                              position: 'absolute',
                              left: x - 7,
                              top: y - 7,
                              width: 14,
                              height: 14,
                              borderRadius: '50%',
                              border: '2px solid rgba(148,163,184,0.9)',
                              background: 'rgba(15,23,42,0.35)',
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
                  No tap positions recorded at this screen width. Taps are grouped by the
                  width they happened at — if you tested on a desktop browser, narrow the
                  window below 480px (or use device emulation) so they land in the phone
                  bucket that matches this preview.
                </p>
              )}
            </section>

            {/* Paywall funnel, reading depth, dead taps */}
            <section className="lg:col-span-3 grid md:grid-cols-3 gap-6">
              <div>
                <h2 className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-3">
                  Paywall funnel
                </h2>
                {funnel.length === 0 ? (
                  <p className="text-slate-500 text-sm">No paywall activity this day.</p>
                ) : (
                  <ul className="space-y-1">
                    {funnel.map((f) => (
                      <li
                        key={f.label}
                        className="flex items-center justify-between gap-3 bg-slate-900 px-3 py-2 rounded-lg text-sm"
                      >
                        <span>{f.label}</span>
                        <span className="tabular-nums text-slate-300">
                          {f.count}
                          {f.pct !== null && (
                            <span className="text-slate-500 text-xs"> · {f.pct}%</span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <h2 className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-3">
                  Reading depth {route ? `· ${route}` : ''}
                </h2>
                {!route ? (
                  <p className="text-slate-500 text-sm">Select a screen.</p>
                ) : data.scroll.length === 0 ? (
                  <p className="text-slate-500 text-sm">No depth data for this screen.</p>
                ) : (
                  <ul className="space-y-1">
                    {['10', '25', '50', '75', '100'].map((b) => {
                      const hit = data.scroll.find((x) => x.name === b);
                      const count = hit?.count ?? 0;
                      const total = data.scroll.reduce((s2, x) => s2 + x.count, 0) || 1;
                      return (
                        <li key={b} className="bg-slate-900 px-3 py-2 rounded-lg text-sm">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-slate-300">{b === '10' ? '<25' : b}% read</span>
                            <span className="tabular-nums text-slate-400">{count}</span>
                          </div>
                          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-sky-500"
                              style={{ width: `${Math.round((count / total) * 100)}%` }}
                            />
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              <div>
                <h2 className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-1">
                  Dead taps
                </h2>
                <p className="text-xs text-slate-500 mb-3">
                  Taps that hit nothing interactive — often something that looks tappable
                  but isn&apos;t. Shown as grey rings on the screen.
                </p>
                {data.deadRoutes.length === 0 ? (
                  <p className="text-slate-500 text-sm">None recorded.</p>
                ) : (
                  <ul className="space-y-1">
                    {data.deadRoutes.map((d) => (
                      <li key={d.name}>
                        <button
                          onClick={() => setRoute(d.name)}
                          className="w-full flex items-center justify-between gap-3 bg-slate-900 hover:bg-slate-800 px-3 py-2 rounded-lg text-sm"
                        >
                          <span className="font-mono text-xs truncate">{d.name}</span>
                          <span className="tabular-nums text-slate-400">{d.count}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>

            {/* Searches that found nothing */}
            <section className="lg:col-span-3">
              <h2 className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-1">
                Searches with no results
              </h2>
              <p className="text-xs text-slate-500 mb-3">
                What people looked for and didn&apos;t find — a direct list of content worth
                adding. Successful searches are not recorded.
              </p>
              {data.searchMisses.length === 0 ? (
                <p className="text-slate-500 text-sm">None recorded.</p>
              ) : (
                <ul className="flex flex-wrap gap-2">
                  {data.searchMisses.slice(0, 40).map((q) => (
                    <li
                      key={q.name}
                      className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-full text-sm"
                    >
                      <span>{q.name}</span>
                      <span className="tabular-nums text-slate-500 text-xs">{q.count}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Journeys */}
            <section className="lg:col-span-3">
              <h2 className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-1">
                Journeys
              </h2>
              <p className="text-xs text-slate-500 mb-3">
                The path each session took through the app, longest first.
              </p>
              {data.journeys.length === 0 ? (
                <p className="text-slate-500 text-sm">
                  No journeys yet. These are recorded from this deploy onward.
                </p>
              ) : (
                <ul className="space-y-2">
                  {data.journeys.slice(0, 20).map((j) => (
                    <li
                      key={j.session}
                      className="bg-slate-900 rounded-lg px-3 py-2.5 flex items-start gap-3"
                    >
                      <span className="text-[10px] font-mono text-slate-600 shrink-0 mt-1 w-14 truncate">
                        {j.session}
                      </span>
                      <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 min-w-0">
                        {j.path.map((step, i) => (
                          <span key={i} className="flex items-center gap-1.5">
                            {i > 0 && <span className="text-slate-700">&rarr;</span>}
                            <button
                              onClick={() => setRoute(step)}
                              className="font-mono text-[11px] text-sky-300/80 hover:text-sky-300"
                            >
                              {step}
                            </button>
                          </span>
                        ))}
                      </div>
                      <span className="ml-auto text-[11px] text-slate-500 tabular-nums shrink-0">
                        {j.path.length}
                      </span>
                    </li>
                  ))}
                </ul>
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
