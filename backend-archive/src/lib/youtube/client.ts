import "server-only";
import { YouTubeError, messages } from "@/lib/youtube/errors";

const BASE = "https://www.googleapis.com/youtube/v3";

/**
 * Mock mode is a development aid only: it requires an explicit opt-in, is
 * ignored in production, and every response is flagged `source: "mock"` so
 * the UI can label it. It never activates when a real key is present.
 */
export function isMockMode(): boolean {
  return !process.env.YOUTUBE_API_KEY && process.env.YOUTUBE_MOCK === "true" && process.env.NODE_ENV !== "production";
}

export function assertConfigured(): void {
  if (!process.env.YOUTUBE_API_KEY) throw new YouTubeError("NOT_CONFIGURED", messages.notConfigured);
}

type YouTubeErrorBody = { error?: { code?: number; message?: string; errors?: { reason?: string }[] } };

/**
 * GET a YouTube Data API v3 resource. Responses are cached by Next's data
 * cache for `revalidate` seconds, keyed on the full URL — identical requests
 * within the window cost no quota.
 */
export async function ytGet<T>(resource: string, params: Record<string, string | number | undefined>, revalidate = 900): Promise<T> {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) throw new YouTubeError("NOT_CONFIGURED", messages.notConfigured);

  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== "") search.set(k, String(v));
  search.set("key", key);

  let res: Response;
  try {
    res = await fetch(`${BASE}/${resource}?${search.toString()}`, {
      next: { revalidate, tags: [`yt:${resource}`] },
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    throw new YouTubeError("UPSTREAM", messages.upstream);
  }

  if (res.ok) return (await res.json()) as T;

  let body: YouTubeErrorBody = {};
  try {
    body = (await res.json()) as YouTubeErrorBody;
  } catch {
    // non-JSON error body
  }
  const reason = body.error?.errors?.[0]?.reason ?? "";
  const upstreamMessage = body.error?.message ?? "";

  if (reason === "quotaExceeded" || reason === "dailyLimitExceeded") throw new YouTubeError("QUOTA_EXCEEDED", messages.quota);
  if (reason === "rateLimitExceeded" || reason === "userRateLimitExceeded" || res.status === 429) {
    throw new YouTubeError("RATE_LIMITED", messages.rateLimited);
  }
  if (reason === "commentsDisabled") throw new YouTubeError("COMMENTS_DISABLED", "Comments are disabled for this video.");
  if (reason === "keyInvalid" || /API key not valid/i.test(upstreamMessage)) {
    // Log for operators; never surface key details to users.
    console.error("[youtube] API key rejected by YouTube");
    throw new YouTubeError("NOT_CONFIGURED", messages.notConfigured);
  }
  if (res.status === 404 || /NotFound$/.test(reason)) throw new YouTubeError("NOT_FOUND", "That resource wasn't found on YouTube.");
  if (res.status === 403) throw new YouTubeError("FORBIDDEN", "YouTube doesn't allow access to this resource.");

  console.error(`[youtube] ${resource} failed: ${res.status} ${reason}`);
  throw new YouTubeError("UPSTREAM", messages.upstream);
}

export function toNumber(v: string | undefined | null): number | null {
  if (v === undefined || v === null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function bestThumbnail(thumbs: Record<string, { url?: string } | undefined> | undefined): string | null {
  if (!thumbs) return null;
  for (const k of ["maxres", "standard", "high", "medium", "default"]) {
    const u = thumbs[k]?.url;
    if (u) return u;
  }
  return null;
}

export function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}
