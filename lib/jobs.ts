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
  /** True when the apply link goes straight to the employer (not a job board or agency). JSearch only. */
  direct?: boolean;
}

export type JobSource = 'adzuna' | 'jsearch' | 'mix';

/**
 * Which feed the app uses. The mixed feed (hospital-direct jobs from JSearch
 * plus Adzuna) whenever RAPIDAPI_KEY is set; JOBS_SOURCE=adzuna or =jsearch
 * forces one source. Without a RapidAPI key it's Adzuna alone.
 */
export function defaultJobSource(): JobSource {
  const s = process.env.JOBS_SOURCE;
  if (s === 'adzuna') return 'adzuna';
  if (!process.env.RAPIDAPI_KEY) return 'adzuna';
  return s === 'jsearch' ? 'jsearch' : 'mix';
}

const CACHE_TTL_SECONDS = 6 * 60 * 60; // 6h — keeps Adzuna calls well under trial quota

// Bump this when the search query logic changes (e.g. switching match
// fields) so stale cached results from the old logic aren't served to
// users for up to CACHE_TTL_SECONDS * 4 after a fix ships.
const CACHE_VERSION = 'v9';

function cacheKey(location?: string, source: JobSource = 'adzuna'): string {
  const prefix = source === 'adzuna' ? 'jobs:sonography' : `jobs:${source}`;
  return `${prefix}:${CACHE_VERSION}:us:${location?.toLowerCase().trim() || 'all'}`;
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

  // Floor, same idea in the other direction — Adzuna's model occasionally
  // guesses a part-time-shift rate (e.g. one day's pay) and annualizes it as
  // if it were full-time, producing $12k–$30k "salaries" no real US
  // sonographer role pays. Below this is treated as a bad guess rather than
  // a real figure.
  const MIN_PLAUSIBLE_SALARY = 50_000;

  const jobs = Array.from(byId.values())
    .sort((a, b) => (a.created < b.created ? 1 : -1))
    .map((j) => {
      // Adzuna model-guesses a salary for postings that don't state one and
      // flags it with salary_is_predicted. Most estimates are reasonable
      // and showing a figure drives more clicks than hiding it, so these
      // are kept (labeled as estimates in the UI) rather than dropped —
      // the sanity bounds above are what catch the occasional bad guess.
      const estimated = j.salary_is_predicted === '1';
      const plausible = (n: number | null) =>
        n !== null && n >= MIN_PLAUSIBLE_SALARY && n <= MAX_PLAUSIBLE_SALARY ? n : null;
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
    })
    // A listing with no salary at all, or one whose only figure got nulled
    // out as implausible above, reads as half-finished rather than just
    // "no stated salary" — drop it instead of showing a card with a blank
    // where the pay would be.
    .filter((j) => j.salaryMin !== null || j.salaryMax !== null);

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
export async function getJobs(location?: string, source: JobSource = defaultJobSource()): Promise<Job[]> {
  if (source === 'mix') return getMixedJobs(location);
  const cfg = redisConfig();
  const key = cacheKey(location, source);
  // JSearch's plans are metered per request, so its results are kept longer.
  const ttl = source === 'jsearch' ? JSEARCH_CACHE_TTL_SECONDS : CACHE_TTL_SECONDS;

  if (cfg) {
    try {
      const cached = await redisCommand(cfg, ['GET', key]);
      if (typeof cached === 'string') {
        const parsed = JSON.parse(cached) as { jobs: Job[]; fetchedAt: number };
        const age = Date.now() - parsed.fetchedAt;
        if (age < ttl * 1000) return parsed.jobs;
      }
    } catch {
      // Corrupt cache entry or Redis hiccup — fall through to a fresh fetch.
    }
  }

  try {
    const jobs = source === 'jsearch' ? await fetchFromJSearch(location) : await fetchFromAdzuna(location);
    if (cfg && jobs.length > 0) {
      await redisCommand(cfg, [
        'SET', key, JSON.stringify({ jobs, fetchedAt: Date.now() }),
        'EX', String(ttl * 4), // keep a stale copy around longer than the TTL, for the error-fallback path below
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

// ── JSearch (RapidAPI) ─────────────────────────────────────────────────────
// Google for Jobs results, which include employers' own career sites as well
// as LinkedIn, Indeed and job boards, so far more direct hospital postings
// than Adzuna. Needs RAPIDAPI_KEY.

const JSEARCH_CACHE_TTL_SECONDS = 12 * 60 * 60;

// JSearch renamed its search endpoint (/search → /search-v2); try the current
// name first and fall back, so a rename on their side doesn't empty the board.
const JSEARCH_PATHS = ['/search-v2', '/search'];

/** Job list from either response shape: v1 { data: [...] } or v2 { data: { jobs: [...] } }. */
function jsearchJobs(body: unknown): JSearchJob[] {
  const b = body as { data?: unknown; jobs?: unknown } | null;
  if (Array.isArray(b?.data)) return b!.data as JSearchJob[];
  const d = b?.data as { jobs?: unknown; data?: unknown } | undefined;
  if (Array.isArray(d?.jobs)) return d!.jobs as JSearchJob[];
  if (Array.isArray(d?.data)) return d!.data as JSearchJob[];
  if (Array.isArray(b?.jobs)) return b!.jobs as JSearchJob[];
  return [];
}

async function jsearchRequest(key: string, params: URLSearchParams): Promise<{ res: Response; path: string }> {
  let last: { res: Response; path: string } | null = null;
  for (const path of JSEARCH_PATHS) {
    const res = await fetch(`https://jsearch.p.rapidapi.com${path}?${params}`, {
      headers: { 'X-RapidAPI-Key': key, 'X-RapidAPI-Host': 'jsearch.p.rapidapi.com' },
      cache: 'no-store',
    });
    last = { res, path };
    if (res.status !== 404) break;
  }
  return last!;
}

// Titles that are actually sonography roles. JSearch's matching is looser
// than Adzuna's title_only, so this keeps unrelated jobs out.
const SONO_TITLE = /sonograph|ultrasound|\becho\b|echocardiograph|vascular tech|\brdms\b|\brvt\b|\brdcs\b|\brcs\b/i;

// Staffing/travel agencies: kept, but listed after direct employers.
const STAFFING = /staffing|travel|locum|agency|recruit|\baya\b|amn\b|cross country|medical solutions|vivian|trusted|fusion|host healthcare|totalmed|ventura|prime|aureus|core medical|nomad|jackson|soliant|cariant|lrs|krucial|bluepipes|tailored/i;

interface JSearchJob {
  job_id: string;
  job_title: string;
  employer_name?: string;
  job_publisher?: string;
  job_city?: string | null;
  job_state?: string | null;
  job_location?: string | null;
  job_posted_at_datetime_utc?: string | null;
  job_description?: string;
  job_apply_link?: string;
  job_apply_is_direct?: boolean;
  job_min_salary?: number | null;
  job_max_salary?: number | null;
  job_salary_period?: string | null;
}

function annualize(n: number | null | undefined, period?: string | null): number | null {
  if (typeof n !== 'number' || !isFinite(n) || n <= 0) return null;
  switch ((period ?? '').toUpperCase()) {
    case 'HOUR': return Math.round(n * 2080);
    case 'WEEK': return Math.round(n * 52);
    case 'MONTH': return Math.round(n * 12);
    case 'YEAR': return Math.round(n);
    default: return null;
  }
}

async function fetchFromJSearch(location?: string): Promise<Job[]> {
  const key = process.env.RAPIDAPI_KEY;
  if (!key) return [];
  const params = new URLSearchParams({
    query: `sonographer ultrasound technologist jobs in ${location || 'USA'}`,
    page: '1',
    num_pages: '2',
    country: 'us',
    date_posted: 'month',
  });
  const { res } = await jsearchRequest(key, params);
  if (!res.ok) throw new Error(`JSearch ${res.status}`);
  const body = await res.json();
  const raw = jsearchJobs(body);

  const MIN = 50_000, MAX = 300_000;
  const ok = (n: number | null) => (n !== null && n >= MIN && n <= MAX ? n : null);

  const seen = new Set<string>();
  const jobs: Job[] = [];
  for (const j of raw) {
    if (!j.job_title || !SONO_TITLE.test(j.job_title) || !j.job_apply_link) continue;
    const company = j.employer_name?.trim() || 'Confidential';
    const dedupe = `${company.toLowerCase()}|${j.job_title.toLowerCase().replace(/\s+/g, ' ').trim()}`;
    if (seen.has(dedupe)) continue;
    seen.add(dedupe);
    const loc = j.job_city && j.job_state ? `${j.job_city}, ${j.job_state}` : (j.job_location ?? j.job_state ?? '');
    jobs.push({
      id: `js_${j.job_id}`,
      title: j.job_title.trim(),
      company,
      location: loc ?? '',
      created: j.job_posted_at_datetime_utc ?? new Date().toISOString(),
      description: (j.job_description ?? '').trim().slice(0, 4000),
      redirectUrl: j.job_apply_link,
      salaryMin: ok(annualize(j.job_min_salary, j.job_salary_period)),
      salaryMax: ok(annualize(j.job_max_salary, j.job_salary_period)),
      salaryEstimated: false,
      direct: !!j.job_apply_is_direct && !STAFFING.test(company),
    });
  }

  // Direct employers first (hospitals, clinics), then agencies; newest first within each.
  const agency = (j: Job) => (STAFFING.test(j.company) ? 1 : 0);
  return jobs.sort((a, b) => agency(a) - agency(b) || (a.created < b.created ? 1 : -1));
}

/** Diagnostic for the JSearch preview: whether a key is set and what RapidAPI says. Never returns the key. */
export async function probeJSearch(): Promise<{ configured: boolean; path?: string; status?: number; message?: string; results?: number; shape?: unknown }> {
  const key = process.env.RAPIDAPI_KEY;
  if (!key) return { configured: false };
  const params = new URLSearchParams({ query: 'sonographer jobs in USA', page: '1', num_pages: '1', country: 'us', date_posted: 'month' });
  try {
    const { res, path } = await jsearchRequest(key, params);
    const body = await res.json().catch(() => ({}));
    return {
      configured: true,
      path,
      status: res.status,
      message: typeof body?.message === 'string' ? body.message.slice(0, 200) : body?.status,
      results: jsearchJobs(body).length,
      // Structure only (key names), to adapt to format changes; no values.
      shape: {
        top: body && typeof body === 'object' ? Object.keys(body) : [],
        data: body?.data && typeof body.data === 'object' && !Array.isArray(body.data) ? Object.keys(body.data) : (Array.isArray(body?.data) ? 'array' : typeof body?.data),
        firstJobKeys: Object.keys(jsearchJobs(body)[0] ?? {}).slice(0, 40),
      },
    };
  } catch (err) {
    return { configured: true, message: err instanceof Error ? err.message : 'request failed' };
  }
}

// ── Mixed feed ─────────────────────────────────────────────────────────────
// Hospital jobs from JSearch that apply on the employer's own site come first
// (labeled in the app), then Adzuna's list. Staffing/travel agency posts are
// dropped from both, and a job listed by both sources appears once. Each
// source keeps its own cache, so this adds no extra API calls.

const AGGREGATOR_HOSTS = /linkedin\.|indeed\.|ziprecruiter\.|glassdoor\.|jobleads\.|monster\.|simplyhired\.|talent\.com|jooble\.|adzuna\.|careerbuilder\.|dice\.|lensa\.|jobright\.|snagajob\.|vitalhiremed\.|americantraveler\./i;

function isAgencyJob(j: Job): boolean {
  return STAFFING.test(j.company) || /\btravel\b|per week|\bcontract\b|locum/i.test(j.title);
}

function hostOf(url: string): string {
  try { return new URL(url).hostname; } catch { return ''; }
}

async function getMixedJobs(location?: string): Promise<Job[]> {
  const [adzuna, jsearch] = await Promise.all([
    getJobs(location, 'adzuna').catch(() => [] as Job[]),
    process.env.RAPIDAPI_KEY ? getJobs(location, 'jsearch').catch(() => [] as Job[]) : Promise.resolve([] as Job[]),
  ]);

  const direct = jsearch
    .filter((j) => !isAgencyJob(j) && !AGGREGATOR_HOSTS.test(hostOf(j.redirectUrl)))
    .map((j) => ({ ...j, direct: true }));

  const key = (j: Job) => `${j.company.toLowerCase().trim()}|${j.title.toLowerCase().replace(/[^a-z ]/g, '').replace(/\s+/g, ' ').trim()}`;
  const seen = new Set(direct.map(key));
  const rest = adzuna.filter((j) => !isAgencyJob(j) && !seen.has(key(j)));

  return [...direct, ...rest];
}
