import "server-only";
import { bestThumbnail, chunk, isMockMode, toNumber, ytGet } from "@/lib/youtube/client";
import { mockVideos } from "@/lib/youtube/mock";
import { parseIsoDuration } from "@/lib/youtube/parse";
import { getPlaylistVideoIds } from "@/lib/youtube/playlists";
import type { ChannelInfo, VideoDetails, VideoInfo } from "@/lib/youtube/types";

type RawVideo = {
  id: string;
  snippet?: {
    title?: string;
    channelId?: string;
    channelTitle?: string;
    publishedAt?: string;
    liveBroadcastContent?: string;
    thumbnails?: Record<string, { url?: string; width?: number; height?: number }>;
    description?: string;
    tags?: string[];
    categoryId?: string;
    defaultLanguage?: string;
    defaultAudioLanguage?: string;
  };
  statistics?: { viewCount?: string; likeCount?: string; commentCount?: string };
  contentDetails?: { duration?: string; definition?: string; caption?: string };
};
type VideoListResponse = { items?: RawVideo[] };

function mapVideo(v: RawVideo): VideoInfo {
  const live = v.snippet?.liveBroadcastContent;
  return {
    id: v.id,
    title: v.snippet?.title ?? "Untitled video",
    channelId: v.snippet?.channelId ?? "",
    channelTitle: v.snippet?.channelTitle ?? "",
    publishedAt: v.snippet?.publishedAt ?? new Date(0).toISOString(),
    durationSeconds: parseIsoDuration(v.contentDetails?.duration),
    viewCount: toNumber(v.statistics?.viewCount),
    likeCount: toNumber(v.statistics?.likeCount),
    commentCount: toNumber(v.statistics?.commentCount),
    thumbnailUrl: bestThumbnail(v.snippet?.thumbnails),
    liveBroadcastContent: live === "live" || live === "upcoming" ? live : "none",
  };
}

/** Video details for up to 50 IDs per request (1 unit per request). Missing/private videos are omitted. */
export async function getVideosByIds(ids: string[]): Promise<VideoInfo[]> {
  const unique = [...new Set(ids)];
  if (unique.length === 0) return [];
  if (isMockMode()) return mockVideos(unique);
  const out: VideoInfo[] = [];
  for (const group of chunk(unique, 50)) {
    const res = await ytGet<VideoListResponse>(
      "videos",
      { part: "snippet,statistics,contentDetails", id: group.join(","), maxResults: 50 },
      900,
    );
    for (const v of res.items ?? []) out.push(mapVideo(v));
  }
  // Preserve the requested order
  const order = new Map(unique.map((id, i) => [id, i]));
  return out.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
}

/** A channel's most recent uploads with statistics, newest first. ~2 quota units for 50 videos. */
export async function getRecentVideos(channel: ChannelInfo, max = 30): Promise<VideoInfo[]> {
  if (!channel.uploadsPlaylistId) return [];
  const ids = await getPlaylistVideoIds(channel.uploadsPlaylistId, max);
  const videos = await getVideosByIds(ids);
  return videos
    .filter((v) => v.liveBroadcastContent !== "upcoming")
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

/** Full public details for one video: description, tags, thumbnails. 1 quota unit. */
export async function getVideoDetails(id: string): Promise<VideoDetails | null> {
  if (isMockMode()) {
    const [v] = mockVideos([id]);
    const topic = v.title.replace(/^\[Mock\] /, "");
    return {
      ...v,
      description: `[Mock] ${topic}\n\nThis description is development mock data, not a real YouTube video.\n\n00:00 Intro\n01:30 Main part\n08:45 Wrap-up`,
      tags: ["mock data", ...topic.toLowerCase().split(/\s+/).filter((w) => w.length > 3).slice(0, 6), "tutorial"],
      categoryId: "27",
      defaultLanguage: "en",
      definition: "hd",
      hasCaptions: false,
      thumbnails: [],
    };
  }
  const res = await ytGet<VideoListResponse>("videos", { part: "snippet,statistics,contentDetails", id }, 900);
  const raw = res.items?.[0];
  if (!raw) return null;
  const thumbs = raw.snippet?.thumbnails ?? {};
  return {
    ...mapVideo(raw),
    description: raw.snippet?.description ?? "",
    tags: raw.snippet?.tags ?? [],
    categoryId: raw.snippet?.categoryId ?? null,
    defaultLanguage: raw.snippet?.defaultLanguage ?? raw.snippet?.defaultAudioLanguage ?? null,
    definition: raw.contentDetails?.definition ?? null,
    hasCaptions: raw.contentDetails?.caption === "true",
    thumbnails: Object.entries(thumbs).flatMap(([size, t]) =>
      t?.url ? [{ size, url: t.url, width: t.width ?? null, height: t.height ?? null }] : [],
    ),
  };
}
