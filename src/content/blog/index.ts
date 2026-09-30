/**
 * Article bodies, loaded only on their own page. Add one line per article;
 * its metadata goes in src/lib/blog/posts.ts.
 */
import type { PostContent } from "@/lib/blog/types";

export const postContent: Record<string, () => Promise<{ default: PostContent }>> = {
  "how-to-download-youtube-thumbnail": () => import("./how-to-download-youtube-thumbnail"),
  "public-youtube-metrics-guide": () => import("./public-youtube-metrics-guide"),
  "thumbnail-readability-at-small-sizes": () => import("./thumbnail-readability-at-small-sizes"),
  "rpm-vs-cpm-explained": () => import("./rpm-vs-cpm-explained"),
};
