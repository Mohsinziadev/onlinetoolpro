import type { Metadata } from "next";
import { categoryHref, liveCount, toolHref, toolTitle, type Category, type Tool } from "@/lib/catalog";
import { siteConfig } from "@/lib/site";

/** Unique title/description/canonical/OG for a tool page, from the catalog. */
export function toolMetadata(tool: Tool): Metadata {
  const url = toolHref(tool);
  const title = tool.metaTitle ?? `${toolTitle(tool)} — Free Online Tool`;
  const description = tool.metaDescription ?? tool.description;
  return {
    title: { absolute: `${title} | ${siteConfig.name}` },
    description,
    keywords: tool.keywords,
    alternates: { canonical: url },
    openGraph: { type: "website", title, description, url, siteName: siteConfig.name, images: [ogImageFor(url, `${toolTitle(tool)} — free online tool`)] },
    twitter: { card: "summary_large_image", title, description, images: [ogImageFor(url, `${toolTitle(tool)} — free online tool`)] },
  };
}

/** The pre-built social image that lives next to a page: <page>/og.png. */
export function ogImageFor(pagePath: string, alt: string) {
  return { url: `${pagePath}/og.png`, width: 1200, height: 630, alt, type: "image/png" };
}

export function categoryMetadata(category: Category): Metadata {
  const url = categoryHref(category);
  const title = category.metaTitle ?? `Free ${category.title} Online`;
  const description = category.metaDescription ?? `${category.description} ${category.intro}`;
  return {
    title: { absolute: `${title} | ${siteConfig.name}` },
    description,
    alternates: { canonical: url },
    openGraph: { type: "website", title, description, url, siteName: siteConfig.name, images: [ogImageFor(url, `${category.title} — free online tools`)] },
    twitter: { card: "summary_large_image", title, description, images: [ogImageFor(url, `${category.title} — free online tools`)] },
    // Only categories with live tools get a page at all; this is a safety net.
    robots: liveCount(category.slug) ? undefined : { index: false, follow: true },
  };
}

export function pageMetadata({ title, description, path }: { title: string; description: string; path: string }): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title: `${title} | ${siteConfig.name}`, description, url: path, siteName: siteConfig.name },
  };
}
