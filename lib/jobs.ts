import { redisConfig, redisCommand } from '@/lib/redis';

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  created: string; // ISO date
  description: string;
  redirectUrl: string;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryEstimated: boolean;
}

const CACHE_TTL_SECONDS = 6 * 60 * 60; // 6h — keeps Adzuna calls well under trial quota

// Bump this when the search query logic changes (e.g. switching match
// fields) so stale cached results from the old logic aren't served to
// users for up to CACHE_TTL_SECONDS * 4 after a fix ships.
const CACHE_VERSION = 'v7';

function cacheKey(location?: string): string {
  return `jobs:sonography:${CACHE_VERSION}:us:${location?.toLowerCase().trim() || 'all'}`;
}

// `what_or` ORs individual words, not phrases — a query built from these
// phrases that way matched on generic words like "medical" and pulled in
// completely unrelated jobs (home caregivers, dispatchers). `what_phrase`
// is an exact-phrase match but still searches the full description, which
// let staffing-agency postings (travel RN roles whose boilerplate mentions
// "sonographer" among dozens of other specialties they recruit for) leak
// in. `title_only` restricts the match to the job title itself, which is
// what actually keeps results exclusively sonography jobs; each term still
// needs its own request, kept to two calls to stay within a trial-tier
// daily quota.
const SEARCH_PHRASES = ['sonographer', 'ultrasound technologist'];

interface AdzunaJob {
  id: string;
  title: string;
  company?: { display_name?: string };
  location?: { display_name?: string };
  created: string;
  description?: string;
  redirect_url: string;
  salary_min?: number;
  salary_max?: number;
  salary_is_predicted?: string;
}

async function searchPhrase(
  appId: string, appKey: string, phrase: string, location?: string
): Promise<AdzunaJob[]> {
  const params = new URLSearchParams({
    app_id: appId,
    app_key: appKey,
    results_per_page: '25',
    title_only: phrase,
    sort_by: 'date',
    max_days_old: '30',
    'content-type': 'application/json',
  });
  if (location) params.set('where', location);

  const res = await fetch(`https://api.adzuna.com/v1/api/jobs/us/search/1?${params}`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Adzuna ${res.status}`);
  const data = await res.json();
  return Array.isArray(data?.results) ? data.results : [];
}

async function fetchFromAdzuna(location?: string): Promise<Job[]> {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;
  if (!appId || !appKey) return [];

  const batches = await Promise.all(
    SEARCH_PHRASES.map((phrase) => searchPhrase(appId, appKey, phrase, location))
  );

  // Merge and dedupe — the same posting often appears for more than one
  // phrase (e.g. a title containing both "Sonographer" and "Ultrasound").
  const byId = new Map<string, AdzunaJob>();
  for (const batch of batches) {
    for (const j of batch) byId.set(j.id, j);
  }

  // No sonography role realistically clears this, stated or estimated — a
  // few staffing-agency feeds have sent clearly-wrong annualized figures
  // (e.g. a weekly rate annualized twice, producing $500k+/yr), so this is
  // the backstop that keeps Adzuna's model-guessed salaries (see below)
  // usable instead of excluding them outright.
  const MAX_PLAUSIBLE_SALARY = 300_000;

  const jobs = Array.from(byId.values())
    .sort((a, b) => (a.created < b.created ? 1 : -1))
    .map((j) => {
      // Adzuna model-guesses a salary for postings that don't state one and
      // flags it with salary_is_predicted. Most estimates are reasonable
      // and showing a figure drives more clicks than hiding it, so these
      // are kept (labeled as estimates in the UI) rather than dropped —
      // the sanity ceiling above is what catches the occasional bad guess.
      const estimated = j.salary_is_predicted === '1';
      const plausible = (n: number | null) =>
        n !== null && n <= MAX_PLAUSIBLE_SALARY ? n : null;
      return {
        id: j.id,
        title: j.title,
        company: j.company?.display_name ?? 'Confidential',
        location: j.location?.display_name ?? '',
        created: j.created,
        description: (j.description ?? '').trim(),
        redirectUrl: j.redirect_url,
        salaryMin: plausible(j.salary_min ?? null),
        salaryMax: plausible(j.salary_max ?? null),
        salaryEstimated: estimated,
      };
    });

  // Staffing agencies post the identical listing under a distinct job id for
  // every city they're hiring in — same title, same company, different id —
  // which reads as spam when a dozen of them show up back to back. Collapse
  // to one (the most recent, since jobs are already sorted newest-first) per
  // company+title pair. Scoped to the exact pair rather than title alone, so
  // different real employers posting a similarly-named role stay distinct.
  // The title itself is normalized first — the same template often bakes a
  // different pay rate into each repost ("...- $2,267 per week" vs "...-
  // $2,953 per week"), which would otherwise dodge an exact-title match.
  const normalizeTitle = (title: string) =>
    title
      .toLowerCase()
      .replace(/\$[\d,]+(\.\d+)?\s*(per\s*(week|hour|hr|day|yr|year)|\/\s*(week|hour|hr|day|yr|year))?/g, '')
      .replace(/[-–—]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  const seenCompanyTitle = new Set<string>();
  return jobs.filter((j) => {
    const key = `${j.company.toLowerCase().trim()}|${normalizeTitle(j.title)}`;
    if (seenCompanyTitle.has(key)) return false;
    seenCompanyTitle.add(key);
    return true;
  });
}

/**
 * Cached in Redis rather than fetched fresh per request — a trial Adzuna
 * plan has a modest daily call quota, and job listings don't change
 * minute-to-minute. Each location filter gets its own cache entry (plus one
 * for the unfiltered nationwide list), so repeat searches for the same
 * location within the TTL cost nothing extra. Falls back to a stale cache
 * entry when Adzuna errors or the quota is exhausted, rather than showing
 * nothing.
 */
export async function getJobs(location?: string): Promise<Job[]> {
  const cfg = redisConfig();
  const key = cacheKey(location);

  if (cfg) {
    try {
      const cached = await redisCommand(cfg, ['GET', key]);
      if (typeof cached === 'string') {
        const parsed = JSON.parse(cached) as { jobs: Job[]; fetchedAt: number };
        const age = Date.now() - parsed.fetchedAt;
        if (age < CACHE_TTL_SECONDS * 1000) return parsed.jobs;
      }
    } catch {
      // Corrupt cache entry or Redis hiccup — fall through to a fresh fetch.
    }
  }

  try {
    const jobs = await fetchFromAdzuna(location);
    if (cfg && jobs.length > 0) {
      await redisCommand(cfg, [
        'SET', key, JSON.stringify({ jobs, fetchedAt: Date.now() }),
        'EX', String(CACHE_TTL_SECONDS * 4), // keep a stale copy around longer than the TTL, for the error-fallback path below
      ]);
    }
    return jobs;
  } catch {
    // Adzuna errored or quota's exhausted — serve whatever's cached, even if
    // past its normal TTL, rather than an empty list.
    if (cfg) {
      try {
        const cached = await redisCommand(cfg, ['GET', key]);
        if (typeof cached === 'string') {
          return (JSON.parse(cached) as { jobs: Job[] }).jobs;
        }
      } catch {
        // Nothing usable cached either.
      }
    }
    return [];
  }
}
