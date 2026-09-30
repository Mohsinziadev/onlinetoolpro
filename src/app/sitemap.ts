import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";
import { activeCategories, categoryHref, liveTools, toolHref } from "@/lib/catalog";
import { postHref, sortedPosts } from "@/lib/blog/posts";
import { pageCount, pageHref } from "@/components/blog/blog-index";

/** Generated once at build time (static export). */
export const dynamic = "force-static";

/**
 * Every indexable page, and nothing else: live tools, categories that have tools,
 * published articles, blog pages and the site's own pages. No query-string URLs.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const latestContent = sortedPosts[0]?.updated ?? sortedPosts[0]?.published;
  const page = (path: string, priority: number, changeFrequency: "weekly" | "monthly" | "yearly", lastModified?: string) => ({
    url: absoluteUrl(path),
    lastModified: lastModified ? new Date(lastModified) : undefined,
    changeFrequency,
    priority,
  });

  return [
    page("/", 1, "weekly", latestContent),
    page("/tools", 0.9, "weekly"),
    ...activeCategories.map((c) => page(categoryHref(c), 0.9, "weekly")),
    ...liveTools.map((t) => page(toolHref(t), 0.8, "monthly", t.updatedAt ?? t.addedAt)),
    page("/blog", 0.7, "weekly", latestContent),
    ...Array.from({ length: pageCount - 1 }, (_, i) => page(pageHref(i + 2), 0.3, "weekly")),
    ...sortedPosts.map((p) => page(postHref(p), 0.7, "monthly", p.updated ?? p.published)),
    ...["/how-it-works", "/faq", "/about", "/contact"].map((p) => page(p, 0.4, "yearly")),
    ...["/privacy-policy", "/terms", "/disclaimer"].map((p) => page(p, 0.2, "yearly")),
  ];
}
