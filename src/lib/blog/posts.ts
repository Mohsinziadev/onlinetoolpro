/**
 * Every article's metadata. Client-safe (no article text), so site search can
 * index articles without shipping them. Article bodies live in
 * src/content/blog/<slug>.tsx and are registered in src/content/blog/index.ts.
 *
 * One article per primary keyword — if two articles would answer the same
 * query, merge them instead.
 */
import type { PostMeta } from "@/lib/blog/types";

export const posts: PostMeta[] = [
  {
    slug: "how-to-download-youtube-thumbnail",
    title: "YouTube Thumbnail Downloader: How to Download YouTube Thumbnails in Full Size",
    metaTitle: "How to Download a YouTube Thumbnail in Full Size (HD)",
    description:
      "Save any YouTube thumbnail in the largest size available, on a computer or phone. Every size YouTube makes, how the URLs work, and fixes for common problems.",
    cluster: "youtube",
    kind: "how-to",
    published: "2026-09-30",
    authorId: "editorial",
    readingMinutes: 9,
    primaryKeyword: "how to download youtube thumbnail",
    keywords: [
      "download youtube thumbnail",
      "youtube thumbnail download",
      "youtube thumbnail url",
      "get youtube thumbnail",
      "save youtube thumbnail",
      "youtube thumbnail image",
      "youtube thumbnail size",
      "download thumbnail from youtube video",
    ],
    relatedTools: ["youtube/thumbnail-downloader", "youtube/video-id-finder", "youtube/thumbnail-analyzer", "youtube/thumbnail-preview"],
    relatedPosts: ["thumbnail-readability-at-small-sizes", "public-youtube-metrics-guide"],
  },
  {
    slug: "public-youtube-metrics-guide",
    title: "Which YouTube Metrics Are Public — and What You Can Learn From Them",
    metaTitle: "Which YouTube Metrics Are Public? What They Tell You",
    description:
      "Subscribers, views, likes and comments are public. Click-through rate, impressions and watch time are not. What that public data can tell you about a channel.",
    cluster: "youtube",
    kind: "explainer",
    published: "2026-09-15",
    authorId: "editorial",
    readingMinutes: 5,
    primaryKeyword: "public youtube metrics",
    keywords: ["youtube public stats", "see youtube channel stats", "youtube analytics public"],
    relatedTools: ["youtube/channel-audit", "youtube/competitor-tracker", "youtube/video-comparison", "youtube/metadata-extractor"],
  },
  {
    slug: "thumbnail-readability-at-small-sizes",
    title: "How to Check Whether a Thumbnail Still Reads at Small Sizes",
    description:
      "Most thumbnails are seen far smaller than they're designed. A practical, repeatable way to test text and subject legibility before you publish.",
    cluster: "youtube",
    kind: "guide",
    published: "2026-09-08",
    authorId: "editorial",
    readingMinutes: 5,
    primaryKeyword: "youtube thumbnail readability",
    keywords: ["thumbnail text size", "thumbnail mobile", "readable thumbnail"],
    relatedTools: ["youtube/thumbnail-readability", "youtube/thumbnail-preview", "youtube/thumbnail-analyzer", "youtube/thumbnail-safe-zone"],
    relatedPosts: ["how-to-download-youtube-thumbnail"],
  },
  {
    slug: "rpm-vs-cpm-explained",
    title: "RPM vs CPM on YouTube: What Each Number Actually Measures",
    description:
      "CPM is what advertisers pay per 1,000 ad impressions. RPM is what you earn per 1,000 views. Why they differ, and how to calculate both.",
    cluster: "youtube",
    kind: "comparison",
    published: "2026-09-01",
    authorId: "editorial",
    readingMinutes: 5,
    primaryKeyword: "youtube rpm vs cpm",
    keywords: ["what is rpm on youtube", "what is cpm on youtube", "rpm vs cpm"],
    relatedTools: ["youtube/rpm-calculator", "youtube/cpm-calculator", "youtube/revenue-calculator"],
  },
];

const bySlug = new Map(posts.map((p) => [p.slug, p]));

export const postHref = (p: Pick<PostMeta, "slug">) => `/blog/${p.slug}`;
export const getPost = (slug: string) => bySlug.get(slug);

/** Newest first, by last update. */
export const sortedPosts = [...posts].sort((a, b) => (b.updated ?? b.published).localeCompare(a.updated ?? a.published));

export function latestPosts(limit = 6, cluster?: string): PostMeta[] {
  return sortedPosts.filter((p) => !cluster || p.cluster === cluster).slice(0, limit);
}

/** Articles that help with a tool — the tool page's "Related guides". */
export function postsForTool(toolKey: string, limit = 3): PostMeta[] {
  return sortedPosts.filter((p) => p.relatedTools.includes(toolKey)).slice(0, limit);
}

/** Hand-picked first, then articles sharing tools, then the same cluster. */
export function relatedPosts(post: PostMeta, limit = 3): PostMeta[] {
  const out: PostMeta[] = [];
  const add = (p?: PostMeta) => {
    if (p && p.slug !== post.slug && !out.includes(p) && out.length < limit) out.push(p);
  };
  post.relatedPosts?.forEach((s) => add(bySlug.get(s)));
  sortedPosts.filter((p) => p.relatedTools.some((t) => post.relatedTools.includes(t))).forEach(add);
  sortedPosts.filter((p) => p.cluster === post.cluster).forEach(add);
  return out;
}

/** Previous (older) and next (newer) article in the same cluster. */
export function adjacentPosts(post: PostMeta): { prev?: PostMeta; next?: PostMeta } {
  const cluster = sortedPosts.filter((p) => p.cluster === post.cluster);
  const i = cluster.findIndex((p) => p.slug === post.slug);
  return { next: i > 0 ? cluster[i - 1] : undefined, prev: i < cluster.length - 1 ? cluster[i + 1] : undefined };
}

export const KIND_LABEL: Record<PostMeta["kind"], string> = {
  pillar: "Complete guide",
  "how-to": "How-to",
  guide: "Guide",
  explainer: "Explainer",
  comparison: "Comparison",
};

export const POSTS_PER_PAGE = 12;
