import "server-only";
import { YouTubeError, messages } from "@/lib/youtube/errors";
import type { ChannelInfo, CommentItem, VideoInfo } from "@/lib/youtube/types";

/**
 * DEVELOPMENT-ONLY MOCK DATA. Used when YOUTUBE_MOCK=true, no API key is set,
 * and NODE_ENV !== "production". Every API response built from this module is
 * returned with `source: "mock"` and labelled in the UI. Titles are prefixed
 * with "[Mock]" so they can never be mistaken for real YouTube data.
 *
 * Test hooks: inputs containing "notfound", "quota" or "hidden" simulate a
 * missing channel, an exhausted API quota and a hidden subscriber count.
 */

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rng(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-";
function idFrom(seed: string, len: number): string {
  const r = rng(hash(seed));
  let out = "";
  for (let i = 0; i < len; i++) out += ALPHABET[Math.floor(r() * 64)];
  return out;
}

type Registry = { channels: Map<string, string>; videos: Map<string, { seed: string; index: number }> };
const g = globalThis as unknown as { __ytMockRegistry?: Registry };
const registry: Registry = (g.__ytMockRegistry ??= { channels: new Map(), videos: new Map() });

const TOPICS = [
  "OBS microphone settings",
  "budget studio lighting",
  "camera settings for low light",
  "editing workflow",
  "color grading basics",
  "thumbnail design",
  "audio noise reduction",
  "streaming setup",
  "desk setup tour",
  "green screen tips",
  "podcast microphone",
  "YouTube analytics explained",
  "script writing",
  "b-roll ideas",
  "vertical video editing",
];
const FORMATS = ["{t} for beginners", "My {t} in 2026", "{t}: 5 mistakes to avoid", "The ultimate {t} guide", "{t} — what actually matters", "I tested {t} for 30 days"];

function mockSeedFromId(id: string): string {
  return registry.channels.get(id) ?? id;
}

export function mockChannel(input: string): ChannelInfo {
  const key = input.toLowerCase();
  if (key.includes("notfound")) {
    throw new YouTubeError("NOT_FOUND", "We couldn't find that channel. It may have been deleted, renamed or made private.");
  }
  if (key.includes("quota")) throw new YouTubeError("QUOTA_EXCEEDED", messages.quota);

  const seed = input.startsWith("UC") ? mockSeedFromId(input) : key;
  const id = input.startsWith("UC") && input.length === 24 ? input : `UC${idFrom(seed, 22)}`;
  registry.channels.set(id, seed);
  const r = rng(hash(seed));
  const created = new Date(Date.UTC(2014 + Math.floor(r() * 9), Math.floor(r() * 12), 1 + Math.floor(r() * 27)));
  // Stats drift slowly with real time so snapshots taken on different days differ.
  const daysSince = (Date.now() - Date.UTC(2026, 0, 1)) / 86_400_000;
  const baseSubs = Math.round(5_000 + r() * 400_000);
  const subsPerDay = baseSubs * (0.0004 + r() * 0.002);
  const baseViews = baseSubs * (60 + r() * 140);
  const empty = key.includes("empty");
  const name = seed.replace(/^@/, "").replace(/[-_.]/g, " ");
  return {
    id,
    title: `[Mock] ${name.charAt(0).toUpperCase()}${name.slice(1)}`,
    handle: `@${seed.replace(/^@/, "").replace(/\s+/g, "")}`,
    description: "Development mock channel. This is not real YouTube data.",
    thumbnailUrl: null,
    country: ["US", "GB", "CA", "AU", null][Math.floor(r() * 5)],
    publishedAt: created.toISOString(),
    subscriberCount: key.includes("hidden") ? null : Math.round(baseSubs + subsPerDay * daysSince),
    viewCount: Math.round(baseViews + baseViews * 0.002 * daysSince),
    videoCount: empty ? 0 : 60 + Math.floor(r() * 400 + daysSince / 5),
    uploadsPlaylistId: empty ? null : `UU${id.slice(2)}`,
  };
}

export function mockUploadIds(playlistId: string, max: number): string[] {
  const seed = mockSeedFromId(`UC${playlistId.slice(2)}`);
  const ids: string[] = [];
  for (let i = 0; i < max; i++) {
    const id = idFrom(`${seed}:v${i}`, 11);
    registry.videos.set(id, { seed, index: i });
    ids.push(id);
  }
  return ids;
}

export function mockVideos(ids: string[]): VideoInfo[] {
  return ids.map((id) => {
    const meta = registry.videos.get(id) ?? { seed: id, index: 0 };
    const r = rng(hash(`${meta.seed}:${meta.index}`));
    const channelRand = rng(hash(meta.seed));
    // Each channel favours a subset of topics so content-gap analysis has signal.
    const favoured = [0, 1, 2, 3, 4].map(() => Math.floor(channelRand() * TOPICS.length));
    const topic = r() < 0.75 ? TOPICS[favoured[Math.floor(r() * favoured.length)]] : TOPICS[Math.floor(r() * TOPICS.length)];
    const title = FORMATS[Math.floor(r() * FORMATS.length)].replace("{t}", topic);
    const gapDays = 2 + r() * 6;
    const published = new Date(Date.now() - (meta.index * gapDays + r() * 2) * 86_400_000 - 3_600_000);
    const views = Math.round(2_000 + r() ** 2 * 250_000);
    const channelId = `UC${idFrom(meta.seed, 22)}`;
    return {
      id,
      title: `[Mock] ${title.charAt(0).toUpperCase()}${title.slice(1)}`,
      channelId,
      channelTitle: `[Mock] ${meta.seed}`,
      publishedAt: published.toISOString(),
      durationSeconds: r() < 0.2 ? Math.round(20 + r() * 40) : Math.round(240 + r() * 1500),
      viewCount: views,
      likeCount: r() < 0.08 ? null : Math.round(views * (0.015 + r() * 0.04)),
      commentCount: Math.round(views * (0.001 + r() * 0.004)),
      thumbnailUrl: null,
      liveBroadcastContent: "none",
    };
  });
}

const COMMENT_TEMPLATES = [
  "What microphone are you using in this video?",
  "Can you make a video about {t}?",
  "This was really helpful, thank you!",
  "Great video, the editing is excellent",
  "Please do a follow-up on {t}",
  "How do you fix the echo in your room?",
  "What camera are you using?",
  "The audio is a bit quiet in the second half",
  "I tried this and it didn't work for me",
  "Part 2 please!",
  "Love the new setup, looks amazing",
  "Could you share your OBS settings?",
  "Which microphone is better for beginners?",
  "This is the best explanation of {t} I've found",
  "Too long, could be half the length",
  "Would love a tutorial on {t}",
  "Where did you buy that light?",
  "Honestly disappointed, expected more detail",
];

export function mockComments(videoId: string, max: number): CommentItem[] {
  if (videoId.toLowerCase().includes("disab")) {
    throw new YouTubeError("COMMENTS_DISABLED", "Comments are disabled for this video.");
  }
  const r = rng(hash(videoId));
  const n = Math.min(max, 80 + Math.floor(r() * 120));
  return Array.from({ length: n }, (_, i) => {
    const t = TOPICS[Math.floor(r() * TOPICS.length)];
    return {
      id: `mock-${videoId}-${i}`,
      text: COMMENT_TEMPLATES[Math.floor(r() * COMMENT_TEMPLATES.length)].replace("{t}", t),
      likeCount: Math.floor(r() ** 3 * 200),
      publishedAt: new Date(Date.now() - r() * 20 * 86_400_000).toISOString(),
      replyCount: Math.floor(r() * 4),
    };
  });
}
