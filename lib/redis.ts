/**
 * Resolve Upstash Redis REST credentials.
 *
 * Vercel provisions these under two different naming conventions depending on
 * how the store was added: the Upstash marketplace integration sets
 * UPSTASH_REDIS_REST_*, while stores created as "Vercel KV" set KV_REST_API_*.
 * Accept either so the setup path taken in the dashboard doesn't matter.
 */
export function redisConfig(): { url: string; token: string } | null {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return { url, token };
}

/** Issue a single Redis command over the Upstash REST API. */
export async function redisCommand(
  cfg: { url: string; token: string },
  cmd: string[]
): Promise<unknown> {
  const res = await fetch(cfg.url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${cfg.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(cmd),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Redis ${res.status}`);
  return (await res.json())?.result;
}
