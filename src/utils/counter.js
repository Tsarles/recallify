/**
 * counter.js — Shared counters via CounterAPI (free, no signup)
 * Docs: https://api.counterapi.dev
 *
 * Namespace: recallify-tsarles2026 (unique to this app)
 * Keys: 'hearts', 'visitors'
 *
 * Each counter auto-creates on first hit.
 * CORS-enabled, works from browser.
 */

const NS   = 'recallify-tsarles2026';
const BASE = 'https://api.counterapi.dev/v1';

/**
 * Get current count for a key (read-only, no increment).
 * Returns 0 on network error.
 */
export async function getCount(key) {
  try {
    const res = await fetch(`${BASE}/${NS}/${key}`);
    if (!res.ok) return 0;
    const data = await res.json();
    return data.count ?? 0;
  } catch {
    return 0;
  }
}

/**
 * Increment a counter by 1 and return the new value.
 * Returns null on network error (caller should ignore silently).
 */
export async function incrementCount(key) {
  try {
    const res = await fetch(`${BASE}/${NS}/${key}/up`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.count ?? null;
  } catch {
    return null;
  }
}
