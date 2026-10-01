import type { Metadata } from "next";
import { categoryHref, liveCount, toolHref, toolTitle, type Category, type Tool } from "@/lib/catalog";
import { siteConfig } from "@/lib/site";

/** Google shows roughly 60 characters of a title. Add the brand only when it still fits. */
const TITLE_BUDGET = 60;
export function brandedTitle(title: string): string {
  const full = `${title} | ${siteConfig.name}`;
  return full.length <= TITLE_BUDGET ? full : title;
}

/** Site-wide share image for pages without their own. */
export const defaultOgImage = { url: "/og.png", width: 1200, height: 630, alt: `${siteConfig.name} — free online tools for everyday tasks`, type: "image/png" };

/** Unique title/description/canonical/OG for a tool page, from the catalog. */
export function toolMetadata(tool: Tool): Metadata {
  const url = toolHref(tool);
  const title = tool.metaTitle ?? `${toolTitle(tool)} — Free Online Tool`;
  const description = tool.metaDescription ?? tool.description;
  return {
    title: { absolute: brandedTitle(title) },
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
    title: { absolute: brandedTitle(title) },
    description,
    alternates: { canonical: url },
    openGraph: { type: "website", title, description, url, siteName: siteConfig.name, images: [ogImageFor(url, `${category.title} — free online tools`)] },
    twitter: { card: "summary_large_image", title, description, images: [ogImageFor(url, `${category.title} — free online tools`)] },
    // Only categories with live tools get a page at all; this is a safety net.
    robots: liveCount(category.slug) ? undefined : { index: false, follow: true },
  };
}

/** Standard pages (about, legal, blog index…): the layout's title template adds the brand. */
export function pageMetadata({ title, description, path, noindex = false }: { title: string; description: string; path: string; noindex?: boolean }): Metadata {
  const full = `${title} | ${siteConfig.name}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { type: "website", title: full, description, url: path, siteName: siteConfig.name, locale: siteConfig.locale, images: [defaultOgImage] },
    twitter: { card: "summary_large_image", title: full, description, images: [defaultOgImage] },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
  };
}
