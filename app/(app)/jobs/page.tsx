'use client';

import { useState, useEffect } from 'react';
import { Briefcase, MapPin, Clock, DollarSign, Search, X, Lock, ChevronRight } from 'lucide-react';
import type { Job } from '@/lib/jobs';
import { usePremium } from '@/hooks/usePremium';
import PaywallModal from '@/components/PaywallModal';

const API_BASE = 'https://www.sonobuddy.com';
const SEARCH_DEBOUNCE_MS = 500;

function formatRelative(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return 'Today';
  if (days === 1) return '1 day ago';
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return months === 1 ? '1 month ago' : `${months} months ago`;
}

function formatSalary(min: number | null, max: number | null, estimated: boolean): string | null {
  // Adzuna sometimes sends a 0 for one side of the range rather than
  // omitting it — treat that the same as missing, not a real $0 salary.
  const lo = min || null;
  const hi = max || null;
  if (!lo && !hi) return null;
  const fmt = (n: number) => `$${Math.round(n / 1000)}k`;
  const prefix = estimated ? 'Est. ' : '';
  if (lo && hi && lo !== hi) return `${prefix}${fmt(lo)}–${fmt(hi)}/yr`;
  return `${prefix}${fmt(lo ?? hi!)}/yr`;
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[] | null>(null);
  const [error, setError] = useState(false);
  const [locationInput, setLocationInput] = useState('');
  const [location, setLocation] = useState('');
  const {
    isPremium, paywallOpen, openPaywall, closePaywall, requestPurchase, requestRestore,
    shareUnlocked, requestShare, requestDiscountPurchase, purchaseError, clearPurchaseError,
  } = usePremium();

  // Debounce so we're not firing a request on every keystroke.
  useEffect(() => {
    const id = setTimeout(() => setLocation(locationInput.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [locationInput]);

  useEffect(() => {
    setJobs(null);
    setError(false);
    const url = `${API_BASE}/api/jobs/${location ? `?location=${encodeURIComponent(location)}` : ''}`;
    fetch(url)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => setJobs(Array.isArray(data) ? data : []))
      .catch(() => setError(true));
  }, [location]);

  return (
    <div className="min-h-screen bg-white pb-nav">
      {paywallOpen && <PaywallModal
        onClose={closePaywall}
        onPurchase={requestPurchase}
        onRestore={requestRestore}
        shareUnlocked={shareUnlocked}
        onShare={requestShare}
        onDiscountPurchase={requestDiscountPurchase}
        purchaseError={purchaseError}
        onClearError={clearPurchaseError}
      />}

      <div className="bg-white border-b border-slate-100 px-5 pt-14 pb-4 sticky top-0 z-10">
        <div className="flex items-center gap-2.5">
          <Briefcase size={20} className="text-sky-500" strokeWidth={2} />
          <h1 className="text-[22px] font-black tracking-tight text-slate-900">Jobs</h1>
        </div>
        <p className="text-[13px] text-slate-400 mt-0.5">
          Sonographer openings, updated regularly
        </p>

        <div className="relative mt-3">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" />
          <input
            type="text"
            value={locationInput}
            onChange={(e) => setLocationInput(e.target.value)}
            placeholder="Filter by city, state, or country"
            className="w-full bg-slate-50 rounded-xl pl-10 pr-9 py-2.5 text-[14px] text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-sky-200"
          />
          {locationInput && (
            <button
              onClick={() => setLocationInput('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 active:text-slate-500"
              aria-label="Clear location filter"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      <div className="px-4 pt-4 space-y-3">
        {error && (
          <p className="text-slate-400 text-sm text-center py-12">
            Couldn&apos;t load jobs right now. Connect to the internet and try again.
          </p>
        )}

        {!error && jobs === null && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border border-slate-100 rounded-2xl px-4 py-4 space-y-2">
                <div className="h-4 w-2/3 bg-slate-100 rounded animate-pulse" />
                <div className="h-3 w-1/2 bg-slate-100 rounded animate-pulse" />
                <div className="h-3 w-full bg-slate-100 rounded animate-pulse" />
              </div>
            ))}
          </div>
        )}

        {!error && jobs?.length === 0 && (
          <p className="text-slate-400 text-sm text-center py-12">
            {location
              ? `No openings found for "${location}" — try a broader search.`
              : 'No openings found right now — check back soon.'}
          </p>
        )}

        {jobs?.map((job) => {
          const salary = formatSalary(job.salaryMin, job.salaryMax, job.salaryEstimated);
          return (
            <button
              key={job.id}
              onClick={() =>
                isPremium
                  ? window.open(job.redirectUrl, '_blank', 'noopener,noreferrer')
                  : openPaywall('jobs')
              }
              className="w-full flex items-start justify-between gap-3 bg-white border border-slate-100 rounded-2xl px-4 py-4 shadow-sm active:bg-slate-50 transition-colors text-left"
            >
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-bold text-slate-900 leading-snug mb-1">
                  {job.title}
                </p>
                <p
                  className={`text-[13px] text-slate-500 mb-2 w-fit ${
                    isPremium ? '' : 'blur-[4px] select-none'
                  }`}
                >
                  {job.company}
                </p>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2">
                  {job.location && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                      <MapPin size={11} /> {job.location}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                    <Clock size={11} /> {formatRelative(job.created)}
                  </span>
                  {salary && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                      <DollarSign size={11} /> {salary}
                    </span>
                  )}
                </div>

                <p className="text-[13px] text-slate-500 leading-relaxed line-clamp-2">
                  {job.description}
                </p>
              </div>
              {isPremium ? (
                <ChevronRight size={16} className="text-slate-300 shrink-0 mt-1" />
              ) : (
                <Lock size={14} className="text-slate-300 shrink-0 mt-1" />
              )}
            </button>
          );
        })}

        {jobs && jobs.length > 0 && (
          <p className="text-slate-300 text-[11px] text-center pt-2 pb-4">
            {isPremium
              ? 'Listings via Adzuna · Opens in your browser to apply'
              : 'Unlock SonoBuddy Premium to apply to any listing'}
          </p>
        )}
      </div>
    </div>
  );
}
