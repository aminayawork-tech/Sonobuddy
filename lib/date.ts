// Blog dates are plain "YYYY-MM-DD" strings. `new Date("2026-08-18")` parses
// them as UTC midnight, which renders as the *previous* day everywhere west of
// Greenwich — so an Aug 18 post showed up as "Aug 17" for US readers. Build the
// Date from its parts instead so it lands on local midnight.
export function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  if (!y || !m || !d) return new Date(dateStr);
  return new Date(y, m - 1, d);
}

// Local-timezone "today" as YYYY-MM-DD, for comparing against post dates.
// `toISOString()` would return the UTC date, which flips over early for US users.
export function todayLocalStr(): string {
  const n = new Date();
  const p = (v: number) => String(v).padStart(2, '0');
  return `${n.getFullYear()}-${p(n.getMonth() + 1)}-${p(n.getDate())}`;
}

// Day bucket for analytics, fixed to US Eastern rather than UTC. Analytics
// runs on Vercel's edge (always UTC, no "local" time of its own) and the
// admin dashboard's day picker defaults to the viewer's own browser-local
// date — for a US-based viewer that's Eastern. Bucketing writes by raw UTC
// meant anything after ~8pm Eastern landed in the *next* day's counters, so
// a real sale or paywall step could look "missing" from the day it actually
// happened on. en-CA formats as YYYY-MM-DD directly.
const dayFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/New_York',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});
export function analyticsDayKey(ts: number): string {
  return dayFormatter.format(new Date(ts));
}
