import "server-only";
import { bestThumbnail, chunk, isMockMode, toNumber, ytGet } from "@/lib/youtube/client";
import { YouTubeError } from "@/lib/youtube/errors";
import { mockChannel } from "@/lib/youtube/mock";
import { parseChannelInput } from "@/lib/youtube/parse";
import type { ChannelInfo } from "@/lib/youtube/types";

type RawChannel = {
  id: string;
  snippet?: {
    title?: string;
    description?: string;
    customUrl?: string;
    publishedAt?: string;
    country?: string;
    thumbnails?: Record<string, { url?: string }>;
  };
  statistics?: { viewCount?: string; subscriberCount?: string; hiddenSubscriberCount?: boolean; videoCount?: string };
  contentDetails?: { relatedPlaylists?: { uploads?: string } };
};
type ChannelListResponse = { items?: RawChannel[] };
type SearchResponse = { items?: { id?: { channelId?: string } }[] };

const PARTS = "snippet,statistics,contentDetails";

function mapChannel(c: RawChannel): ChannelInfo {
  const hidden = c.statistics?.hiddenSubscriberCount === true;
  return {
    id: c.id,
    title: c.snippet?.title ?? "Untitled channel",
    handle: c.snippet?.customUrl?.startsWith("@") ? c.snippet.customUrl : c.snippet?.customUrl ? `@${c.snippet.customUrl}` : null,
    description: c.snippet?.description ?? "",
    thumbnailUrl: bestThumbnail(c.snippet?.thumbnails),
    country: c.snippet?.country ?? null,
    publishedAt: c.snippet?.publishedAt ?? new Date(0).toISOString(),
    subscriberCount: hidden ? null : toNumber(c.statistics?.subscriberCount),
    viewCount: toNumber(c.statistics?.viewCount) ?? 0,
    videoCount: toNumber(c.statistics?.videoCount) ?? 0,
    uploadsPlaylistId: c.contentDetails?.relatedPlaylists?.uploads ?? null,
  };
}

const notFound = () =>
  new YouTubeError("NOT_FOUND", "We couldn't find that channel. It may have been deleted, renamed or made private.");

/** Resolve a channel URL, @handle or ID and return its public details. 1–101 quota units. */
export async function getChannel(input: string): Promise<ChannelInfo> {
  const parsed = parseChannelInput(input);
  if (!parsed) {
    throw new YouTubeError(
      "INVALID_INPUT",
      "That doesn't look like a YouTube channel. Paste a channel URL, an @handle or a channel ID (starting with UC).",
    );
  }
  if (isMockMode()) return mockChannel(parsed.value);

  const byParam: Record<string, string> =
    parsed.type === "id" ? { id: parsed.value } : parsed.type === "username" ? { forUsername: parsed.value } : { forHandle: parsed.value };

  const res = await ytGet<ChannelListResponse>("channels", { part: PARTS, ...byParam, maxResults: 1 }, 1800);
  let raw = res.items?.[0];

  // Legacy /c/ custom URLs aren't directly resolvable; fall back to a
  // channel search (100 quota units) only for that case.
  if (!raw && parsed.type === "custom") {
    const search = await ytGet<SearchResponse>("search", { part: "id", type: "channel", q: parsed.value, maxResults: 1 }, 86400);
    const id = search.items?.[0]?.id?.channelId;
    if (id) raw = (await ytGet<ChannelListResponse>("channels", { part: PARTS, id }, 1800)).items?.[0];
  }
  if (!raw) throw notFound();
  return mapChannel(raw);
}

/** Batch lookup by channel IDs (50 per request, 1 unit each). Missing channels are omitted. */
export async function getChannelsByIds(ids: string[]): Promise<ChannelInfo[]> {
  if (ids.length === 0) return [];
  if (isMockMode()) return ids.map((id) => mockChannel(id));
  const out: ChannelInfo[] = [];
  for (const group of chunk(ids, 50)) {
    const res = await ytGet<ChannelListResponse>("channels", { part: PARTS, id: group.join(","), maxResults: 50 }, 1800);
    for (const c of res.items ?? []) out.push(mapChannel(c));
  }
  return out;
}
