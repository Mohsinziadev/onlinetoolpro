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
  "how-to-open-heic-files-on-windows": () => import("./how-to-open-heic-files-on-windows"),
  "reduce-image-size-to-100kb": () => import("./reduce-image-size-to-100kb"),
  "sign-pdf-without-printing": () => import("./sign-pdf-without-printing"),
  "common-json-errors": () => import("./common-json-errors"),
  "wifi-qr-code": () => import("./wifi-qr-code"),
  "how-to-calculate-percentage-change": () => import("./how-to-calculate-percentage-change"),
};
