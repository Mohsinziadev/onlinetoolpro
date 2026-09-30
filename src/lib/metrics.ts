/**
 * Descriptive statistics derived from public YouTube data. Client-safe.
 * These are calculations by this site, not official YouTube metrics.
 */
import type { VideoInfo } from "@/lib/youtube/types";

const DAY = 86_400_000;

export function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

/** Days since publication, minimum 1 day so brand-new uploads aren't inflated. */
export function ageInDays(publishedAt: string, now = Date.now()): number {
  return Math.max(1, (now - new Date(publishedAt).getTime()) / DAY);
}

export function viewsPerDay(v: Pick<VideoInfo, "viewCount" | "publishedAt">, now = Date.now()): number | null {
  if (v.viewCount === null) return null;
  return v.viewCount / ageInDays(v.publishedAt, now);
}

export function likeRate(v: Pick<VideoInfo, "viewCount" | "likeCount">): number | null {
  if (!v.viewCount || v.likeCount === null) return null;
  return (v.likeCount / v.viewCount) * 100;
}

export function commentRate(v: Pick<VideoInfo, "viewCount" | "commentCount">): number | null {
  if (!v.viewCount || v.commentCount === null) return null;
  return (v.commentCount / v.viewCount) * 100;
}

export function engagementRate(v: Pick<VideoInfo, "viewCount" | "likeCount" | "commentCount">): number | null {
  if (!v.viewCount || (v.likeCount === null && v.commentCount === null)) return null;
  return (((v.likeCount ?? 0) + (v.commentCount ?? 0)) / v.viewCount) * 100;
}

const nums = (arr: (number | null)[]) => arr.filter((n): n is number => n !== null && Number.isFinite(n));

export type PublishingActivity = {
  last7Days: number;
  last30Days: number;
  /** Average uploads per week across the analyzed window */
  perWeek: number | null;
  /** Span of the analyzed window in days */
  windowDays: number | null;
  averageLengthSeconds: number | null;
  medianGapDays: number | null;
  shortsShare: number | null;
};

export function publishingActivity(videos: VideoInfo[], now = Date.now()): PublishingActivity {
  const times = videos.map((v) => new Date(v.publishedAt).getTime()).sort((a, b) => b - a);
  const last7Days = times.filter((t) => now - t <= 7 * DAY).length;
  const last30Days = times.filter((t) => now - t <= 30 * DAY).length;
  let perWeek: number | null = null;
  let windowDays: number | null = null;
  if (times.length >= 2) {
    windowDays = Math.max(1, (now - times[times.length - 1]) / DAY);
    perWeek = (times.length / windowDays) * 7;
  } else if (times.length === 1) {
    windowDays = Math.max(1, (now - times[0]) / DAY);
  }
  const gaps: number[] = [];
  for (let i = 0; i < times.length - 1; i++) gaps.push((times[i] - times[i + 1]) / DAY);
  const durations = nums(videos.map((v) => v.durationSeconds));
  return {
    last7Days,
    last30Days,
    perWeek,
    windowDays,
    averageLengthSeconds: average(durations),
    medianGapDays: median(gaps),
    // Duration ≤ 60s is a proxy for Shorts; the API doesn't label Shorts directly.
    shortsShare: durations.length ? durations.filter((d) => d <= 60).length / durations.length : null,
  };
}

export type PerformanceSummary = {
  count: number;
  averageViews: number | null;
  medianViews: number | null;
  averageLikes: number | null;
  averageComments: number | null;
  averageViewsPerDay: number | null;
  medianViewsPerDay: number | null;
  averageLikeRate: number | null;
  averageCommentRate: number | null;
  likesHiddenCount: number;
  commentsDisabledCount: number;
};

export function performanceSummary(videos: VideoInfo[], now = Date.now()): PerformanceSummary {
  const views = nums(videos.map((v) => v.viewCount));
  const vpd = nums(videos.map((v) => viewsPerDay(v, now)));
  return {
    count: videos.length,
    averageViews: average(views),
    medianViews: median(views),
    averageLikes: average(nums(videos.map((v) => v.likeCount))),
    averageComments: average(nums(videos.map((v) => v.commentCount))),
    averageViewsPerDay: average(vpd),
    medianViewsPerDay: median(vpd),
    averageLikeRate: average(nums(videos.map(likeRate))),
    averageCommentRate: average(nums(videos.map(commentRate))),
    likesHiddenCount: videos.filter((v) => v.likeCount === null).length,
    commentsDisabledCount: videos.filter((v) => v.commentCount === null).length,
  };
}
