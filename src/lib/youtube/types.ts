/** Shared, client-safe YouTube data shapes returned by our API routes. */

export type DataSource = "youtube" | "mock";

export type ChannelInfo = {
  id: string;
  title: string;
  handle: string | null;
  description: string;
  thumbnailUrl: string | null;
  country: string | null;
  publishedAt: string;
  /** null when the channel hides its subscriber count */
  subscriberCount: number | null;
  viewCount: number;
  videoCount: number;
  uploadsPlaylistId: string | null;
};

export type VideoInfo = {
  id: string;
  title: string;
  channelId: string;
  channelTitle: string;
  publishedAt: string;
  durationSeconds: number | null;
  viewCount: number | null;
  /** null when likes are hidden */
  likeCount: number | null;
  /** null when comments are disabled */
  commentCount: number | null;
  thumbnailUrl: string | null;
  liveBroadcastContent: "none" | "live" | "upcoming";
};

/** Full public details for a single video (metadata + tag tools). */
export type VideoDetails = VideoInfo & {
  description: string;
  tags: string[];
  categoryId: string | null;
  defaultLanguage: string | null;
  /** "hd" | "sd" */
  definition: string | null;
  hasCaptions: boolean;
  thumbnails: { size: string; url: string; width: number | null; height: number | null }[];
};

export type CommentItem = {
  id: string;
  text: string;
  likeCount: number;
  publishedAt: string;
  replyCount: number;
};

export type ApiEnvelope<T> = { data: T; source: DataSource; fetchedAt: string };

export type ApiErrorBody = { error: { code: string; message: string } };
