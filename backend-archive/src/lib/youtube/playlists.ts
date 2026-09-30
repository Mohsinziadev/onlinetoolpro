import "server-only";
import { isMockMode, ytGet } from "@/lib/youtube/client";
import { YouTubeError } from "@/lib/youtube/errors";
import { mockUploadIds } from "@/lib/youtube/mock";

type PlaylistItemsResponse = {
  nextPageToken?: string;
  items?: { contentDetails?: { videoId?: string; videoPublishedAt?: string } }[];
};

/**
 * Most recent video IDs from a playlist (usually a channel's uploads playlist).
 * 1 quota unit per 50 items.
 */
export async function getPlaylistVideoIds(playlistId: string, max = 50): Promise<string[]> {
  if (isMockMode()) return mockUploadIds(playlistId, max);
  const ids: string[] = [];
  let pageToken: string | undefined;
  do {
    let res: PlaylistItemsResponse;
    try {
      res = await ytGet<PlaylistItemsResponse>(
        "playlistItems",
        { part: "contentDetails", playlistId, maxResults: Math.min(50, max - ids.length), pageToken },
        900,
      );
    } catch (err) {
      // A channel with no public uploads has no accessible uploads playlist.
      if (err instanceof YouTubeError && err.code === "NOT_FOUND") return ids;
      throw err;
    }
    for (const it of res.items ?? []) {
      const id = it.contentDetails?.videoId;
      if (id) ids.push(id);
    }
    pageToken = res.nextPageToken;
  } while (pageToken && ids.length < max);
  return ids.slice(0, max);
}
