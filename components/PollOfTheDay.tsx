'use client';

import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { recordEvent } from '@/lib/tap-tracking';

/**
 * Poll of the Day card for the Home screen. One tap to vote, then results.
 * Anonymous: a random device id (kept in localStorage) prevents double votes;
 * no account, nothing to moderate.
 */
const API = 'https://www.sonobuddy.com/api/poll/';
const VOTER_KEY = 'sb_poll_voter';
const VOTES_KEY = 'sb_poll_votes';
// Below this, totals are hidden so an early poll doesn't read as "3 votes".
const SHOW_TOTAL_FROM = 25;

interface PollData { poll: { id: string; question: string; options: string[] }; counts: number[] }

function voterId(): string {
  try {
    let id = localStorage.getItem(VOTER_KEY);
    if (!id) {
      id = (crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`).replace(/-/g, '');
      localStorage.setItem(VOTER_KEY, id);
    }
    return id;
  } catch {
    return `anon${Math.random().toString(36).slice(2, 12)}`;
  }
}

function savedVote(pollId: string): number | null {
  try {
    const v = JSON.parse(localStorage.getItem(VOTES_KEY) ?? '{}')[pollId];
    return Number.isInteger(v) ? v : null;
  } catch {
    return null;
  }
}

function saveVote(pollId: string, option: number) {
  try {
    const all = JSON.parse(localStorage.getItem(VOTES_KEY) ?? '{}');
    all[pollId] = option;
    localStorage.setItem(VOTES_KEY, JSON.stringify(all));
  } catch {
    // Private mode: the vote still counts on the server.
  }
}

export default function PollOfTheDay() {
  const [data, setData] = useState<PollData | null>(null);
  const [choice, setChoice] = useState<number | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    // Hidden in the Android app while a launch delay there is investigated.
    if (Capacitor.getPlatform() === 'android') return;
    let cancelled = false;
    fetch(API, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: PollData | null) => {
        if (cancelled || !d?.poll) return;
        setData(d);
        setChoice(savedVote(d.poll.id));
      })
      .catch(() => { /* offline: the card just doesn't show */ });
    return () => { cancelled = true; };
  }, []);

  if (!data) return null;
  const { poll } = data;
  const voted = choice !== null;
  const counts = data.counts;
  const total = counts.reduce((a, b) => a + b, 0);

  async function vote(i: number) {
    if (voted || sending) return;
    setSending(true);
    setChoice(i);
    saveVote(poll.id, i);
    // Show the vote immediately; the server's numbers replace it when they arrive.
    setData((d) => d && { ...d, counts: d.counts.map((c, j) => (j === i ? c + 1 : c)) });
    recordEvent(`poll:vote:${poll.id}`);
    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ id: poll.id, option: i, voter: voterId() }),
      });
      const body = await res.json().catch(() => null);
      if (Array.isArray(body?.counts)) setData((d) => d && { ...d, counts: body.counts });
    } catch {
      // Offline: keep the optimistic result.
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-bold text-sky-500 uppercase tracking-widest">Poll of the day</span>
        {voted && <span className="text-[11px] font-semibold text-slate-400">New poll tomorrow</span>}
      </div>
      <p className="text-[17px] font-black tracking-tight text-slate-900 leading-snug mb-4">{poll.question}</p>

      <div className="space-y-2">
        {poll.options.map((opt, i) => {
          const pct = total > 0 ? Math.round((counts[i] / total) * 100) : 0;
          const mine = choice === i;
          return voted ? (
            <div key={opt} className={`relative overflow-hidden rounded-xl border px-3.5 py-2.5 ${mine ? 'border-sky-300' : 'border-slate-200'}`}>
              <div
                className={`absolute inset-y-0 left-0 ${mine ? 'bg-sky-100' : 'bg-slate-100'} transition-[width] duration-700 ease-out`}
                style={{ width: `${pct}%` }}
                aria-hidden
              />
              <div className="relative flex items-center justify-between gap-3">
                <span className={`text-[14px] ${mine ? 'font-bold text-slate-900' : 'font-medium text-slate-700'} flex items-center gap-1.5`}>
                  {mine && <Check size={14} className="text-sky-500 shrink-0" strokeWidth={3} />}
                  {opt}
                </span>
                <span className={`text-[13px] tabular-nums ${mine ? 'font-bold text-sky-600' : 'font-semibold text-slate-500'}`}>{pct}%</span>
              </div>
            </div>
          ) : (
            <button
              key={opt}
              onClick={() => void vote(i)}
              className="w-full text-left rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-[14px] font-semibold text-slate-800 active:scale-[0.99] active:bg-sky-50 hover:border-sky-300 transition"
            >
              {opt}
            </button>
          );
        })}
      </div>

      <p className="text-[11px] text-slate-400 mt-3">
        {voted
          ? total >= SHOW_TOTAL_FROM ? `${total.toLocaleString()} sonographers voted · anonymous` : 'You’re one of the first to vote · anonymous'
          : 'Tap to vote · anonymous'}
      </p>
    </div>
  );
}
