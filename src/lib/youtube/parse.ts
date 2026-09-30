/**
 * Client-safe parsing of YouTube URLs, handles and IDs. No network access.
 */

const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;
const CHANNEL_ID = /^UC[A-Za-z0-9_-]{22}$/;
const HANDLE = /^[A-Za-z0-9._-]{3,30}$/;

const YT_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
  "youtu.be",
  "www.youtu.be",
]);

function toUrl(input: string): URL | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  try {
    return new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
  } catch {
    return null;
  }
}

export type ParsedVideo = { id: string; canonicalUrl: string; embedUrl: string; kind: "watch" | "short" | "embed" | "live" | "id" };

/**
 * Extract an 11-character video ID from any common YouTube URL format, or a bare ID.
 * Supports watch?v=, youtu.be/, /shorts/, /embed/, /live/, /v/, and m./music. hosts.
 */
export function parseVideoInput(input: string): ParsedVideo | null {
  const raw = input.trim();
  if (VIDEO_ID.test(raw)) return build(raw, "id");

  const url = toUrl(raw);
  if (!url || !YT_HOSTS.has(url.hostname.toLowerCase())) return null;
  const host = url.hostname.toLowerCase().replace(/^www\./, "");
  const parts = url.pathname.split("/").filter(Boolean);

  if (host === "youtu.be") return parts[0] && VIDEO_ID.test(parts[0]) ? build(parts[0], "watch") : null;

  const v = url.searchParams.get("v");
  if (parts[0] === "watch" && v && VIDEO_ID.test(v)) return build(v, "watch");

  const kinds: Record<string, ParsedVideo["kind"]> = { shorts: "short", embed: "embed", live: "live", v: "embed", e: "embed" };
  if (parts[0] && kinds[parts[0]] && parts[1] && VIDEO_ID.test(parts[1])) return build(parts[1], kinds[parts[0]]);

  // e.g. /attribution_link?u=/watch?v=ID
  const u = url.searchParams.get("u");
  if (u) {
    const inner = new URLSearchParams(u.split("?")[1] ?? "").get("v");
    if (inner && VIDEO_ID.test(inner)) return build(inner, "watch");
  }
  return null;
}

function build(id: string, kind: ParsedVideo["kind"]): ParsedVideo {
  return {
    id,
    kind,
    canonicalUrl: `https://www.youtube.com/watch?v=${id}`,
    embedUrl: `https://www.youtube.com/embed/${id}`,
  };
}

export type ParsedChannel =
  | { type: "id"; value: string }
  | { type: "handle"; value: string }
  | { type: "username"; value: string }
  | { type: "custom"; value: string };

/**
 * Accepts a channel URL (/channel/UC…, /@handle, /user/name, /c/name),
 * an @handle, or a channel ID.
 */
export function parseChannelInput(input: string): ParsedChannel | null {
  const raw = input.trim();
  if (!raw) return null;
  if (CHANNEL_ID.test(raw)) return { type: "id", value: raw };
  if (raw.startsWith("@")) {
    const h = raw.slice(1);
    return HANDLE.test(h) ? { type: "handle", value: h } : null;
  }

  const url = toUrl(raw);
  if (url && YT_HOSTS.has(url.hostname.toLowerCase())) {
    const parts = url.pathname.split("/").filter(Boolean).map(decodeURIComponent);
    const [first, second] = parts;
    if (!first) return null;
    if (first.startsWith("@")) {
      const h = first.slice(1);
      return HANDLE.test(h) ? { type: "handle", value: h } : null;
    }
    if (first === "channel" && second && CHANNEL_ID.test(second)) return { type: "id", value: second };
    if (first === "user" && second) return { type: "username", value: second };
    if (first === "c" && second) return { type: "custom", value: second };
    // Legacy vanity URL: youtube.com/name
    if (parts.length === 1 && HANDLE.test(first) && !["watch", "shorts", "embed", "results", "playlist", "feed"].includes(first)) {
      return { type: "custom", value: first };
    }
    return null;
  }

  // Bare handle without @
  if (HANDLE.test(raw) && !raw.includes(".")) return { type: "handle", value: raw };
  return null;
}

/** ISO-8601 duration (PT1H2M3S, P1DT2H) → seconds. */
export function parseIsoDuration(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const m = /^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?)?$/.exec(iso);
  if (!m) return null;
  const [, d, h, min, s] = m;
  return Number(d ?? 0) * 86400 + Number(h ?? 0) * 3600 + Number(min ?? 0) * 60 + Math.round(Number(s ?? 0));
}
