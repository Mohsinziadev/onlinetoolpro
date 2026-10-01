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
  "how-much-is-20-an-hour-a-year": () => import("./how-much-is-20-an-hour-a-year"),
  "how-to-calculate-pro-rata-salary": () => import("./how-to-calculate-pro-rata-salary"),
  "28-36-rule": () => import("./28-36-rule"),
  "15-vs-30-year-mortgage": () => import("./15-vs-30-year-mortgage"),
  "is-it-better-to-rent-or-buy": () => import("./is-it-better-to-rent-or-buy"),
  "what-is-a-good-rental-yield": () => import("./what-is-a-good-rental-yield"),
  "how-long-should-a-car-loan-be": () => import("./how-long-should-a-car-loan-be"),
  "debt-snowball-vs-avalanche": () => import("./debt-snowball-vs-avalanche"),
  "how-credit-card-interest-is-calculated": () => import("./how-credit-card-interest-is-calculated"),
  "how-is-emi-calculated": () => import("./how-is-emi-calculated"),
  "how-much-emergency-fund": () => import("./how-much-emergency-fund"),
  "4-percent-rule": () => import("./4-percent-rule"),
  "how-inflation-affects-savings": () => import("./how-inflation-affects-savings"),
  "simple-vs-compound-interest": () => import("./simple-vs-compound-interest"),
  "how-to-calculate-roi": () => import("./how-to-calculate-roi"),
  "margin-vs-markup": () => import("./margin-vs-markup"),
  "how-to-calculate-vat": () => import("./how-to-calculate-vat"),
};
