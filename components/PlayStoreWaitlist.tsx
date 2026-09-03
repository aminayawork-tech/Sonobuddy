'use client';

import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

/**
 * Play Store badge that opens a waitlist capture instead of a store link.
 * Styled to match the App Store badge so the pair reads as two real options —
 * the point is to measure Android demand, so it has to look worth clicking.
 */

const API = 'https://www.sonobuddy.com/api/waitlist/';
type Status = 'idle' | 'sending' | 'done' | 'error';

export default function PlayStoreWaitlist({ className = '' }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  function close() {
    setOpen(false);
    // Reset only after a failure, so a returning visitor still sees the
    // confirmation rather than an empty form they might refill.
    if (status === 'error') { setStatus('idle'); setMessage(''); }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (status === 'sending') return;
    setStatus('sending');
    setMessage('');
    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || 'Something went wrong.');
      setStatus('done');
      setMessage(body.already ? "You're already on the list." : '');
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'Something went wrong.');
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex items-center gap-2.5 bg-black hover:bg-gray-800 text-white px-5 py-3 rounded-xl transition-colors ${className}`}
      >
        {/* Google Play mark */}
        <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" xmlns="http://www.w3.org/2000/svg">
          <path fill="#00D2FF" d="M3.6 1.8a1.5 1.5 0 0 0-.5 1.15v18.1c0 .46.18.87.5 1.15l.06.06 10.14-10.14v-.24L3.66 1.74l-.06.06z" />
          <path fill="#FFCE00" d="M17.2 15.5l-3.4-3.4v-.24l3.4-3.4.08.05 4.02 2.29c1.15.65 1.15 1.72 0 2.37l-4.02 2.28-.08.05z" />
          <path fill="#FF3A44" d="M17.28 15.45L13.8 11.98 3.6 22.2c.38.4 1 .45 1.71.05l11.97-6.8z" />
          <path fill="#00C853" d="M17.28 8.51L5.31 1.72C4.6 1.31 3.98 1.36 3.6 1.76l10.2 10.22 3.48-3.47z" />
        </svg>
        <div className="text-left">
          <div className="text-[10px] text-gray-300 leading-none mb-0.5">Coming soon to</div>
          <div className="text-[15px] font-semibold leading-none">Google Play</div>
        </div>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label="Join the Android waitlist"
        >
          <div
            className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={close}
              aria-label="Close"
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>

            {status === 'done' ? (
              <div className="text-center py-4">
                <div className="w-12 h-12 rounded-full bg-sky-50 text-sky-500 flex items-center justify-center mx-auto mb-4 text-2xl">
                  ✓
                </div>
                <h2 className="text-xl font-black tracking-tight text-gray-900 mb-2">
                  {message || "You're on the list"}
                </h2>
                <p className="text-gray-500 text-sm leading-relaxed mb-5">
                  We&apos;ll email you the moment SonoBuddy lands on Google Play. No other mail,
                  and you can unsubscribe any time.
                </p>
                <button
                  onClick={close}
                  className="bg-sky-500 hover:bg-sky-600 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-colors"
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-black tracking-tight text-gray-900 mb-2 pr-8">
                  SonoBuddy for Android
                </h2>
                <p className="text-gray-500 text-sm leading-relaxed mb-5">
                  Not out yet. Join the waitlist and we&apos;ll email you the day it launches —
                  the more sonographers who sign up, the sooner it gets built.
                </p>

                <form onSubmit={submit}>
                  <input
                    ref={inputRef}
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[15px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-sky-400 mb-3"
                  />

                  {status === 'error' && (
                    <p className="text-red-500 text-sm mb-3">{message}</p>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="w-full bg-sky-500 hover:bg-sky-600 disabled:opacity-60 text-white font-semibold text-[15px] py-3.5 rounded-xl transition-colors"
                  >
                    {status === 'sending' ? 'Joining…' : 'Join the waitlist'}
                  </button>
                </form>

                <p className="text-gray-400 text-[11px] text-center mt-3">
                  We only use your email to tell you about the Android launch.
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
