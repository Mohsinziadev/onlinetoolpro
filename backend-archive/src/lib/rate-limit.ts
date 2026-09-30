import "server-only";

/**
 * Fixed-window in-memory rate limiter keyed by client IP + bucket.
 *
 * On serverless platforms each instance keeps its own counters, so limits are
 * per-instance best effort. For strict global limits, swap this module for a
 * shared store (e.g. Redis/Upstash) — the call sites don't need to change.
 */
type Entry = { count: number; resetAt: number };
const g = globalThis as unknown as { __rateLimit?: Map<string, Entry> };
const store: Map<string, Entry> = (g.__rateLimit ??= new Map());

export type RateLimitResult = { ok: boolean; remaining: number; resetAt: number };

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key);
  if (!entry || entry.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    if (store.size > 10_000) {
      for (const [k, v] of store) if (v.resetAt <= now) store.delete(k);
    }
    return { ok: true, remaining: limit - 1, resetAt: now + windowMs };
  }
  entry.count++;
  return { ok: entry.count <= limit, remaining: Math.max(0, limit - entry.count), resetAt: entry.resetAt };
}

export function clientIp(headers: Headers): string {
  return headers.get("x-forwarded-for")?.split(",")[0]?.trim() || headers.get("x-real-ip") || "unknown";
}
