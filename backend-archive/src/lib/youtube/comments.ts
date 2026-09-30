import "server-only";
import { isMockMode, ytGet } from "@/lib/youtube/client";
import { mockComments } from "@/lib/youtube/mock";
import type { CommentItem } from "@/lib/youtube/types";

type CommentThreadsResponse = {
  nextPageToken?: string;
  items?: {
    id: string;
    snippet?: {
      totalReplyCount?: number;
      topLevelComment?: {
        snippet?: { textOriginal?: string; textDisplay?: string; likeCount?: number; publishedAt?: string };
      };
    };
  }[];
};

/**
 * Top-level public comments for a video, most relevant first.
 * 1 quota unit per 100 comments.
 */
export async function getComments(videoId: string, max = 300): Promise<CommentItem[]> {
  if (isMockMode()) return mockComments(videoId, max);
  const out: CommentItem[] = [];
  let pageToken: string | undefined;
  do {
    const res = await ytGet<CommentThreadsResponse>(
      "commentThreads",
      {
        part: "snippet",
        videoId,
        maxResults: 100,
        order: "relevance",
        textFormat: "plainText",
        pageToken,
      },
      1800,
    );
    for (const t of res.items ?? []) {
      const s = t.snippet?.topLevelComment?.snippet;
      const text = s?.textOriginal ?? s?.textDisplay ?? "";
      if (!text) continue;
      out.push({
        id: t.id,
        text,
        likeCount: s?.likeCount ?? 0,
        publishedAt: s?.publishedAt ?? "",
        replyCount: t.snippet?.totalReplyCount ?? 0,
      });
    }
    pageToken = res.nextPageToken;
  } while (pageToken && out.length < max);
  return out.slice(0, max);
}
