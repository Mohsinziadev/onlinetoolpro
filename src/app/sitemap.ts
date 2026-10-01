import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";
import {
  activeCategories,
  categoryHref,
  liveTools,
  toolHref,
} from "@/lib/catalog";
import { postHref, sortedPosts } from "@/lib/blog/posts";
import { pageCount, pageHref } from "@/components/blog/blog-index";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const latestContent = sortedPosts[0]?.updated ?? sortedPosts[0]?.published;
  const page = (
    path: string,
    priority: number,
    changeFrequency: "weekly" | "monthly" | "yearly",
    lastModified?: string
  ) => ({
    url: absoluteUrl(path),
    lastModified: lastModified ? new Date(lastModified) : undefined,
    changeFrequency,
    priority,
  });

  // A listing page changes when one of its tools does.
  const toolDate = (t: (typeof liveTools)[number]) =>
    t.updatedAt ?? t.addedAt ?? "";
  const newest = (list: typeof liveTools) =>
    list.map(toolDate).sort().at(-1) || undefined;

  return [
    page(
      "/",
      1,
      "weekly",
      [latestContent, newest(liveTools)].filter(Boolean).sort().at(-1)
    ),
    page("/tools", 0.9, "weekly", newest(liveTools)),
    ...activeCategories.map((c) =>
      page(
        categoryHref(c),
        0.9,
        "weekly",
        newest(liveTools.filter((t) => t.category === c.slug))
      )
    ),
    ...liveTools.map((t) =>
      page(toolHref(t), 0.8, "monthly", t.updatedAt ?? t.addedAt)
    ),
    page("/blog", 0.7, "weekly", latestContent),
    ...Array.from({ length: pageCount - 1 }, (_, i) =>
      page(pageHref(i + 2), 0.3, "weekly")
    ),
    ...sortedPosts.map((p) =>
      page(postHref(p), 0.7, "monthly", p.updated ?? p.published)
    ),
    ...["/how-it-works", "/faq", "/about", "/contact"].map((p) =>
      page(p, 0.4, "yearly")
    ),
    ...["/privacy-policy", "/terms", "/disclaimer", "/acceptable-use"].map((p) =>
      page(p, 0.2, "yearly")
    ),
  ];
}
