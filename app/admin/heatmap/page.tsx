'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * Tap analytics viewer. Client-only so it survives the static export, and
 * token-gated at the API rather than here — the page itself is just a shell.
 */

const GRID_COLS = 20;
const GRID_ROWS = 40;
const API = 'https://www.sonobuddy.com/api/events/summary/';
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
}

export default function HeatmapAdminPage() {
  const [token, setToken] = useState('');
  const [surface, setSurface] = useState('ios');
  const [day, setDay] = useState(() => new Date().toISOString().slice(0, 10));
  const [route, setRoute] = useState<string | null>(null);
  const [data, setData] = useState<Summary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
      const params = new URLSearchParams({ token, day, surface });
      if (route) params.set('route', route);
      const res = await fetch(`${API}?${params}`);
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

  const maxCell = data?.cells.reduce((m, c) => Math.max(m, c.count), 0) ?? 0;
  const cellMap = new Map(data?.cells.map((c) => [c.name, c.count]) ?? []);
  const totalTaps = data?.routes.reduce((s, r) => s + r.count, 0) ?? 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 px-5 py-10">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-black tracking-tight text-white mb-1">Tap Analytics</h1>
        <p className="text-slate-400 text-sm mb-8">
          Where people tap in the app. Offline taps are queued on device and appear once
          the app regains a connection, so recent numbers may lag.
        </p>

        {/* Controls */}
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
            <option value="ios">iOS app</option>
            <option value="web">Website</option>
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

        {!token && (
          <p className="text-slate-500 text-sm">Enter your access token to load data.</p>
        )}

        {data && (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Routes */}
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400 mb-3">
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
                        <span className="font-mono truncate">{r.name}</span>
                        <span className="tabular-nums text-slate-400 shrink-0">{r.count}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Elements */}
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400 mb-3">
                {route ? `Controls on ${route}` : 'Controls'}
              </h2>
              {!route ? (
                <p className="text-slate-500 text-sm">Select a screen to see which controls are tapped.</p>
              ) : data.elements.length === 0 ? (
                <p className="text-slate-500 text-sm">No control-level data for this screen.</p>
              ) : (
                <ul className="space-y-1">
                  {data.elements.slice(0, 25).map((el) => (
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

            {/* Heatmap */}
            {route && (
              <section className="md:col-span-2">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400 mb-3">
                  Tap positions · {route}
                </h2>
                {maxCell === 0 ? (
                  <p className="text-slate-500 text-sm">No positional data for this screen.</p>
                ) : (
                  <div className="flex items-start gap-6">
                    <div
                      className="grid gap-px bg-slate-800 rounded-lg overflow-hidden"
                      style={{
                        gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
                        width: 280,
                        aspectRatio: `${GRID_COLS} / ${GRID_ROWS}`,
                      }}
                    >
                      {Array.from({ length: GRID_COLS * GRID_ROWS }, (_, i) => {
                        const col = i % GRID_COLS;
                        const row = Math.floor(i / GRID_COLS);
                        const count = cellMap.get(`${col},${row}`) ?? 0;
                        const intensity = count / maxCell;
                        return (
                          <div
                            key={i}
                            title={count ? `${count} taps` : undefined}
                            style={{
                              backgroundColor: count
                                ? `rgba(14, 165, 233, ${0.15 + intensity * 0.85})`
                                : '#0f172a',
                            }}
                          />
                        );
                      })}
                    </div>
                    <div className="text-sm text-slate-400 space-y-2">
                      <p>Phone-width taps, positioned as a share of the screen.</p>
                      <p>Brightest cell = {maxCell} taps.</p>
                      <p className="text-slate-500">
                        Useful for thumb reach — controls low and centre are easiest to hit
                        one-handed while scanning.
                      </p>
                    </div>
                  </div>
                )}
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
