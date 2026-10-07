'use client';

import { useState, useEffect } from 'react';
import { Briefcase, MapPin, Clock, DollarSign } from 'lucide-react';
import type { Job } from '@/lib/jobs';

const API_BASE = 'https://www.sonobuddy.com';

function formatRelative(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return 'Today';
  if (days === 1) return '1 day ago';
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return months === 1 ? '1 month ago' : `${months} months ago`;
}

function formatSalary(min: number | null, max: number | null): string | null {
  if (!min && !max) return null;
  const fmt = (n: number) => `$${Math.round(n / 1000)}k`;
  if (min && max && min !== max) return `${fmt(min)}–${fmt(max)}/yr`;
  return `${fmt(min ?? max!)}/yr`;
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/api/jobs/`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => setJobs(Array.isArray(data) ? data : []))
      .catch(() => setError(true));
  }, []);

  return (
    <div className="min-h-screen bg-white pb-nav">
      <div className="bg-white border-b border-slate-100 px-5 pt-14 pb-4 sticky top-0 z-10">
        <div className="flex items-center gap-2.5">
          <Briefcase size={20} className="text-sky-500" strokeWidth={2} />
          <h1 className="text-[22px] font-black tracking-tight text-slate-900">Jobs</h1>
        </div>
        <p className="text-[13px] text-slate-400 mt-0.5">
          Sonographer openings across the US, updated regularly
        </p>
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

        {jobs?.map((job) => {
          const salary = formatSalary(job.salaryMin, job.salaryMax);
          return (
            <a
              key={job.id}
              href={job.redirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-white border border-slate-100 rounded-2xl px-4 py-4 shadow-sm active:bg-slate-50 transition-colors"
            >
              <p className="text-[15px] font-bold text-slate-900 leading-snug mb-1">
                {job.title}
              </p>
              <p className="text-[13px] text-slate-500 mb-2">{job.company}</p>

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
            </a>
          );
        })}

        {jobs && jobs.length > 0 && (
          <p className="text-slate-300 text-[11px] text-center pt-2 pb-4">
            Listings via Adzuna · Opens in your browser to apply
          </p>
        )}
      </div>
    </div>
  );
}
