import "server-only";
import { big } from "@/lib/db";
import type { ChannelInfo } from "@/lib/youtube/types";

type ChannelRow = {
  id: string;
  title: string;
  handle: string | null;
  description: string;
  thumbnailUrl: string | null;
  country: string | null;
  publishedAt: Date;
  uploadsPlaylistId: string | null;
  subscriberCount: bigint | null;
  viewCount: bigint;
  videoCount: number;
};

/** Convert a stored Channel row to the API's ChannelInfo shape. */
export function channelFromRow(c: ChannelRow): ChannelInfo {
  return {
    id: c.id,
    title: c.title,
    handle: c.handle,
    description: c.description,
    thumbnailUrl: c.thumbnailUrl,
    country: c.country,
    publishedAt: c.publishedAt.toISOString(),
    uploadsPlaylistId: c.uploadsPlaylistId,
    subscriberCount: big(c.subscriberCount),
    viewCount: big(c.viewCount) ?? 0,
    videoCount: c.videoCount,
  };
}

export const MAX_TRACKED = 20;
export const MAX_COMPETITORS = 5;
export const CHANNEL_ID = /^UC[A-Za-z0-9_-]{22}$/;
