"use client";

import { usePathname } from "next/navigation";
import { Backdrop } from "@/components/visual/backdrop";
import { PATTERNS, TINTS } from "@/lib/catalog/visuals";
import { getCategoryByPath, getTool, isLive } from "@/lib/catalog/lite";
import type { Backdrop as BackdropSpec } from "@/lib/catalog/types";

/** Hand-picked backgrounds for the site's own pages — each one different. */
const PAGES: Record<string, BackdropSpec> = {
  "/tools": { pattern: "dots", tint: "sky" },
  "/how-it-works": { pattern: "waves", tint: "mint" },
  "/faq": { pattern: "rings", tint: "mist" },
  "/about": { pattern: "arcs", tint: "sand" },
  "/contact": { pattern: "plus", tint: "aqua" },
  "/privacy-policy": { pattern: "grid", tint: "mist" },
  "/disclaimer": { pattern: "rays", tint: "sky" },
  "/terms": { pattern: "diagonal", tint: "sand" },
  "/acceptable-use": { pattern: "plus", tint: "mist" },
  "/blog": { pattern: "strings", tint: "sky" },
};

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** Anything else — including 404s, which a static host serves at any URL. */
const FALLBACK: BackdropSpec = { pattern: "dots", tint: "mint" };

/**
 * Background for pages that don't draw their own. The homepage, category pages
 * and tool pages render their own backdrop, so they're skipped here. Site pages
 * use the list above, blog posts get a stable pattern + tint from their path, and
 * anything else gets the fallback. (A 404 is pre-rendered once but served for every
 * unknown URL, so it must not depend on the path or hydration would mismatch.)
 */
export function PageBackdrop() {
  const pathname = usePathname() ?? "/";
  // Category pages (/youtube-tools) and tool pages (/youtube-tools/…) draw their own.
  const [, first = "", second, ...rest] = pathname.split("/");
  const category = getCategoryByPath(first);
  const tool = category && second && !rest.length ? getTool(category.slug, second) : undefined;
  if (pathname === "/" || (category && !second) || (tool && isLive(tool))) return null;
  const h = hash(pathname);
  const spec = PAGES[pathname] ?? (pathname.startsWith("/blog/") ? { pattern: PATTERNS[h % PATTERNS.length], tint: TINTS[(h >>> 4) % TINTS.length] } : FALLBACK);
  return <Backdrop spec={spec} maxHeight="max-h-[620px]" />;
}
