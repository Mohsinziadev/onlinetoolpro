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
  {
    slug: "how-to-open-heic-files-on-windows",
    title: "HEIC Files Won't Open on Windows? 4 Ways to Open or Convert iPhone Photos",
    metaTitle: "How to Open HEIC Files on Windows (4 Easy Fixes)",
    description:
      "iPhone photos (.heic) won't open on your PC? Convert them to JPG in a minute, teach Windows to read them, or change one iPhone setting for good.",
    cluster: "image",
    kind: "how-to",
    published: "2026-10-01",
    authorId: "editorial",
    readingMinutes: 6,
    primaryKeyword: "how to open heic files on windows",
    keywords: ["heic won't open windows", "open heic on windows 11", "iphone photos heic windows", "heif image extensions", "convert heic to jpg windows", "iphone transfer automatic", "most compatible camera format"],
    relatedTools: ["image/heic-to-jpg", "image/compressor", "image/resizer"],
    relatedPosts: ["reduce-image-size-to-100kb"],
  },
  {
    slug: "reduce-image-size-to-100kb",
    title: "How to Reduce a Photo to Under 100 KB (Without Making It Blurry)",
    metaTitle: "How to Reduce Image Size to 100 KB Without Losing Quality",
    description:
      "Get a photo under 100 KB for an online form and keep it sharp: the two settings that matter, sizes for common limits, and why a file stays too big.",
    cluster: "image",
    kind: "how-to",
    published: "2026-10-01",
    authorId: "editorial",
    readingMinutes: 6,
    primaryKeyword: "reduce image size to 100kb",
    keywords: ["compress image to 100kb", "reduce photo size in kb", "compress jpg to 50kb", "photo size for online form", "image under 100kb", "reduce image size without losing quality", "signature 20kb"],
    relatedTools: ["image/compressor", "image/resizer", "image/cropper", "image/heic-to-jpg"],
    relatedPosts: ["how-to-open-heic-files-on-windows"],
  },
  {
    slug: "sign-pdf-without-printing",
    title: "How to Sign a PDF Without Printing It — on a Computer or Phone",
    metaTitle: "How to Sign a PDF Without Printing (Free, Any Device)",
    description:
      "Sign a PDF on screen in a couple of minutes — in your browser, Adobe Reader, Preview or iPhone Markup — and know when a signature like this is legally enough.",
    cluster: "pdf",
    kind: "how-to",
    published: "2026-10-01",
    authorId: "editorial",
    readingMinutes: 5,
    primaryKeyword: "how to sign a pdf without printing",
    keywords: ["sign pdf on phone", "electronic signature pdf free", "add signature to pdf", "is electronic signature legal", "electronic vs digital signature", "sign pdf on iphone", "sign pdf on mac"],
    relatedTools: ["pdf/sign", "pdf/merge", "pdf/pdf-to-jpg"],
  },
  {
    slug: "common-json-errors",
    title: "JSON Errors Explained: What Each Message Means and How to Fix It",
    metaTitle: "Common JSON Errors and How to Fix Them",
    description:
      "Trailing commas, single quotes, “Unexpected token <”, NaN from Python: real JavaScript and Python error messages, what causes each and how to fix it.",
    cluster: "developer",
    kind: "guide",
    published: "2026-10-01",
    authorId: "editorial",
    readingMinutes: 6,
    primaryKeyword: "common json errors",
    keywords: ["unexpected token in json", "unexpected end of json input", "json trailing comma", "expecting property name enclosed in double quotes", "json parse error", "invalid json", "json comments"],
    relatedTools: ["developer/json-formatter", "text/text-diff"],
  },
  {
    slug: "wifi-qr-code",
    title: "How to Make a Wi-Fi QR Code (and Why Some Don't Connect)",
    metaTitle: "How to Make a Wi-Fi QR Code That Actually Works",
    description:
      "Let guests join your Wi-Fi with one scan: how to make the code, why some scan but won't connect, and how to print one that works on every phone.",
    cluster: "productivity",
    kind: "how-to",
    published: "2026-10-01",
    authorId: "editorial",
    readingMinutes: 6,
    primaryKeyword: "how to make a wifi qr code",
    keywords: ["wifi qr code", "qr code for wifi password", "share wifi qr code", "wifi qr code not working", "hidden network qr code", "wifi qr code format"],
    relatedTools: ["productivity/qr-code-generator", "productivity/password-generator"],
  },
  {
    slug: "how-to-calculate-percentage-change",
    title: "How to Calculate Percentage Change (and the Mistakes Everyone Makes)",
    metaTitle: "How to Calculate Percentage Change — With Examples",
    description:
      "The percentage change formula with worked examples, plus percent vs percentage points, reversing a discount, negative values and multi-year growth.",
    cluster: "calculators",
    kind: "explainer",
    published: "2026-10-01",
    authorId: "editorial",
    readingMinutes: 5,
    primaryKeyword: "how to calculate percentage change",
    keywords: ["percentage change formula", "percentage increase", "percentage decrease", "percent vs percentage points", "percentage difference", "find original price after discount", "percentage change excel"],
    relatedTools: ["calculators/percentage-calculator", "calculators/compound-interest-calculator", "calculators/tip-calculator"],
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
