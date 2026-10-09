'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Briefcase, MapPin, Clock, DollarSign, Search, X, Lock, ChevronRight, ChevronLeft } from 'lucide-react';
import type { Job } from '@/lib/jobs';
import { usePremium } from '@/hooks/usePremium';
import PaywallModal from '@/components/PaywallModal';
import { isJobDay } from '@/lib/tips';

const API_BASE = 'https://www.sonobuddy.com';

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

/* ── Route shell — reads ?id= to decide list vs detail ────────────────────── */
function JobsRouter() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  if (id) return <JobDetail id={id} />;
  return <JobList />;
}

export default function JobsPage() {
  return (
    <Suspense fallback={<ListSkeleton />}>
      <JobsRouter />
    </Suspense>
  );
}

/* ── Job list — every listing requires premium to open; title, location,
   salary, and a description teaser stay visible to everyone as the preview.
   Tapping always opens the detail view first — applying externally is a
   separate, explicit action from there, not an immediate redirect. One job
   a day (whichever the home screen features) is free for everyone. ────────── */
function JobList() {
  const searchParams = useSearchParams();
  const [jobs, setJobs] = useState<Job[] | null>(null);
  const [error, setError] = useState(false);
  // Initialized from the URL so the search survives navigating into a job's
  // detail view and back — otherwise every "back" tap silently cleared it.
  const [query, setQuery] = useState(() => searchParams.get('q') ?? '');
  const [debouncedQuery, setDebouncedQuery] = useState(query.trim());
  // Extra results from a location-scoped Adzuna search for the current
  // query (see the fetch effect below for why this exists alongside the
  // plain client-side filter).
  const [locationJobs, setLocationJobs] = useState<Job[] | null>(null);
  const router = useRouter();
  const {
    isPremium, paywallOpen, openPaywall, closePaywall, requestPurchase, requestRestore,
    shareUnlocked, requestShare, requestDiscountPurchase, purchaseError, clearPurchaseError,
  } = usePremium();

  // Which job is free today — only meaningful on a job day, since that's the
  // only day the home screen actually features one. Kept out of the static
  // HTML (set after mount) for the same reason as every other date-dependent
  // value in this app: the build-time date and the viewer's date differ.
  const [freeJobId, setFreeJobId] = useState<string | null>(null);
  useEffect(() => {
    setFreeJobId(isJobDay() ? 'pending' : null);
  }, []);

  // One fetch of the nationwide list — the instant part of search (title,
  // description, location text) runs client-side against it below.
  useEffect(() => {
    fetch(`${API_BASE}/api/jobs/`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setJobs(list);
        setFreeJobId((prev) => (prev === 'pending' && list[0] ? list[0].id : prev === 'pending' ? null : prev));
      })
      .catch(() => setError(true));
  }, []);

  // Debounce before hitting the network or touching the URL, and persist
  // the settled query in ?q= so it's still there if the user taps into a
  // job and comes back.
  useEffect(() => {
    const id = setTimeout(() => {
      const trimmed = query.trim();
      setDebouncedQuery(trimmed);
      router.replace(`/jobs${trimmed ? `?q=${encodeURIComponent(trimmed)}` : ''}`, { scroll: false });
    }, 500);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  // High-volume metros (NYC, Florida, etc.) have more sonographer postings
  // than fit in the nationwide list's top-25-per-phrase cap, so a city/state
  // search needs its own Adzuna query to actually find them — the client
  // filter below only catches whatever happened to already be in that
  // capped sample. Returns an empty list (not an error) for non-place text
  // like "bonus", which is expected — the keyword filter covers that case.
  useEffect(() => {
    if (!debouncedQuery) {
      setLocationJobs(null);
      return;
    }
    let cancelled = false;
    fetch(`${API_BASE}/api/jobs/?location=${encodeURIComponent(debouncedQuery)}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => { if (!cancelled) setLocationJobs(Array.isArray(data) ? data : []); })
      .catch(() => { if (!cancelled) setLocationJobs([]); });
    return () => { cancelled = true; };
  }, [debouncedQuery]);

  const trimmedQuery = query.trim().toLowerCase();
  const visibleJobs = !trimmedQuery
    ? jobs
    : (() => {
        const byId = new Map<string, Job>();
        for (const j of jobs ?? []) {
          if (
            j.title.toLowerCase().includes(trimmedQuery) ||
            j.description.toLowerCase().includes(trimmedQuery) ||
            j.location.toLowerCase().includes(trimmedQuery)
          ) {
            byId.set(j.id, j);
          }
        }
        for (const j of locationJobs ?? []) byId.set(j.id, j);
        return Array.from(byId.values()).sort((a, b) => (a.created < b.created ? 1 : -1));
      })();

  return (
    <div className="min-h-screen bg-white pb-nav">
      {paywallOpen && (
        <PaywallModal
          onClose={closePaywall}
          onPurchase={requestPurchase}
          onRestore={requestRestore}
          shareUnlocked={shareUnlocked}
          onShare={requestShare}
          onDiscountPurchase={requestDiscountPurchase}
          purchaseError={purchaseError}
          onClearError={clearPurchaseError}
        />
      )}

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
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search city, title, or keyword — e.g. Dallas, bonus"
            className="w-full bg-slate-50 rounded-xl pl-10 pr-9 py-2.5 text-[14px] text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-sky-200"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 active:text-slate-500"
              aria-label="Clear search"
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
            No openings found right now — check back soon.
          </p>
        )}

        {!error && jobs && jobs.length > 0 && visibleJobs?.length === 0 && (
          <p className="text-slate-400 text-sm text-center py-12">
            No openings match &quot;{query.trim()}&quot; — try a different word.
          </p>
        )}

        {visibleJobs?.map((job) => {
          const salary = formatSalary(job.salaryMin, job.salaryMax, job.salaryEstimated);
          const isFreeToday = job.id === freeJobId;
          const unlocked = isPremium || isFreeToday;
          return (
            <button
              key={job.id}
              onClick={() =>
                unlocked
                  ? router.push(
                      `/jobs?id=${encodeURIComponent(job.id)}${trimmedQuery ? `&q=${encodeURIComponent(query.trim())}` : ''}`
                    )
                  : openPaywall('jobs')
              }
              className="w-full flex items-start justify-between gap-3 bg-white border border-slate-100 rounded-2xl px-4 py-4 shadow-sm active:bg-slate-50 transition-colors text-left"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <p className="text-[15px] font-bold text-slate-900 leading-snug">
                    {job.title}
                  </p>
                  {isFreeToday && !isPremium && (
                    <span className="shrink-0 bg-emerald-50 text-emerald-600 text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full">
                      Free today
                    </span>
                  )}
                </div>
                <p className={`text-[13px] text-slate-500 mb-2 w-fit ${unlocked ? '' : 'blur-[4px] select-none'}`}>
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
              {unlocked ? (
                <ChevronRight size={16} className="text-slate-300 shrink-0 mt-1" />
              ) : (
                <Lock size={14} className="text-slate-300 shrink-0 mt-1" />
              )}
            </button>
          );
        })}

        {visibleJobs && visibleJobs.length > 0 && (
          <p className="text-slate-300 text-[11px] text-center pt-2 pb-4">
            Tap a listing to see full details
          </p>
        )}
      </div>
    </div>
  );
}

/* ── Job detail — reached by tapping a card. Title, location, salary, and a
   description teaser stay visible to everyone (same preview as the list);
   the full description and the Apply action are gated, unless this is
   today's free job. ─────────────────────────────────────────────────────── */
function JobDetail({ id }: { id: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const q = searchParams.get('q');
  const [jobs, setJobs] = useState<Job[] | null>(null);
  const [error, setError] = useState(false);
  const { isPremium, openPaywall, ...paywall } = usePremium();

  const [freeJobId, setFreeJobId] = useState<string | null>(null);
  useEffect(() => {
    setFreeJobId(isJobDay() ? 'pending' : null);
  }, []);

  useEffect(() => {
    fetch(`${API_BASE}/api/jobs/`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        const list: Job[] = Array.isArray(data) ? data : [];
        setJobs(list);
        setFreeJobId((prev) => (prev === 'pending' && list[0] ? list[0].id : prev === 'pending' ? null : prev));
      })
      .catch(() => setError(true));
  }, []);

  const job = jobs?.find((j) => j.id === id) ?? null;
  const isFreeToday = job?.id === freeJobId;
  const unlocked = isPremium || isFreeToday;
  const salary = job ? formatSalary(job.salaryMin, job.salaryMax, job.salaryEstimated) : null;

  return (
    <div className="min-h-screen bg-white pb-nav">
      {paywall.paywallOpen && (
        <PaywallModal
          onClose={paywall.closePaywall}
          onPurchase={paywall.requestPurchase}
          onRestore={paywall.requestRestore}
          shareUnlocked={paywall.shareUnlocked}
          onShare={paywall.requestShare}
          onDiscountPurchase={paywall.requestDiscountPurchase}
          purchaseError={paywall.purchaseError}
          onClearError={paywall.clearPurchaseError}
        />
      )}

      <div className="bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 pt-14 pb-3 sticky top-0 z-10">
        <button
          onClick={() => router.push(`/jobs${q ? `?q=${encodeURIComponent(q)}` : ''}`)}
          className="inline-flex items-center gap-1 text-sky-500 text-sm font-semibold"
        >
          <ChevronLeft size={16} strokeWidth={2.5} />
          Jobs
        </button>
      </div>

      {error ? (
        <div className="px-5 pt-10 text-center">
          <p className="text-slate-400 text-sm">Couldn&apos;t load this listing. Connect to the internet and try again.</p>
        </div>
      ) : jobs === null ? (
        <div className="px-5 pt-6 space-y-3 animate-pulse">
          <div className="h-3 w-24 bg-slate-100 rounded" />
          <div className="h-6 w-full bg-slate-100 rounded" />
          <div className="h-4 w-2/3 bg-slate-100 rounded" />
        </div>
      ) : !job ? (
        <div className="px-5 pt-10 text-center">
          <p className="text-slate-900 font-bold text-[15px] mb-1">This listing is no longer available</p>
          <p className="text-slate-400 text-[13px]">It may have rotated out as new postings came in.</p>
        </div>
      ) : (
        <div className="px-5 pt-6 pb-8">
          <div className="flex items-center gap-1.5 mb-3">
            <Clock size={12} className="text-slate-400" />
            <span className="text-[12px] text-slate-400">{formatRelative(job.created)}</span>
            {isFreeToday && !isPremium && (
              <span className="bg-emerald-50 text-emerald-600 text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full">
                Free today
              </span>
            )}
          </div>

          <h1 className="text-[22px] font-black tracking-tight text-slate-900 leading-tight mb-3">
            {job.title}
          </h1>

          <p className={`text-[15px] font-semibold text-slate-700 mb-3 w-fit ${unlocked ? '' : 'blur-[5px] select-none'}`}>
            {job.company}
          </p>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mb-5 pb-5 border-b border-slate-100">
            {job.location && (
              <span className="inline-flex items-center gap-1.5 text-[13px] text-slate-500">
                <MapPin size={13} /> {job.location}
              </span>
            )}
            {salary && (
              <span className="inline-flex items-center gap-1.5 text-[13px] text-emerald-600 font-semibold">
                <DollarSign size={13} /> {salary}
              </span>
            )}
          </div>

          {unlocked ? (
            <>
              <p className="text-[14px] text-slate-600 leading-relaxed whitespace-pre-line mb-8">
                {job.description || 'No further details provided for this listing.'}
              </p>
              <button
                onClick={() => window.open(job.redirectUrl, '_blank', 'noopener,noreferrer')}
                className="w-full bg-[#0EA5E9] hover:bg-sky-400 active:scale-[0.98] text-white font-bold py-4 rounded-2xl text-base transition-all shadow-lg shadow-sky-200/60"
              >
                Apply Now
              </button>
              <p className="text-center text-slate-300 text-[11px] mt-3">
                Listing via Adzuna · Opens in your browser to apply
              </p>
            </>
          ) : (
            <>
              <p className="text-[14px] text-slate-500 leading-relaxed line-clamp-3 mb-6">
                {job.description}
              </p>
              <button
                onClick={() => openPaywall('jobs')}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-6 text-center active:bg-slate-100 transition-colors"
              >
                <img src="/icons/icon-192.png" alt="" className="w-12 h-12 rounded-2xl mx-auto mb-3" />
                <p className="text-slate-900 font-bold text-[15px] mb-1">Unlock to view &amp; apply</p>
                <p className="text-slate-500 text-[13px] leading-relaxed mb-4">
                  Full job details and the company name are part of SonoBuddy premium, along with every measurement, protocol, calculator, and pathology.
                </p>
                <span className="inline-block bg-sky-500 text-white font-bold text-[14px] px-6 py-3 rounded-xl">
                  Unlock Full Access
                </span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="min-h-screen bg-white pb-nav">
      <div className="bg-white border-b border-slate-100 px-5 pt-14 pb-4">
        <div className="h-6 w-24 bg-slate-100 rounded animate-pulse" />
      </div>
      <div className="px-4 pt-4 space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white border border-slate-100 rounded-2xl px-4 py-4 space-y-2">
            <div className="h-4 w-2/3 bg-slate-100 rounded animate-pulse" />
            <div className="h-3 w-1/2 bg-slate-100 rounded animate-pulse" />
            <div className="h-3 w-full bg-slate-100 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
