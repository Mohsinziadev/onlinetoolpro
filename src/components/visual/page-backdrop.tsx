"use client";

import { usePathname } from "next/navigation";
import { Backdrop } from "@/components/visual/backdrop";
import { PATTERNS, TINTS } from "@/lib/catalog/visuals";
import { getCategoryByPath } from "@/lib/catalog";
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
  "/blog": { pattern: "strings", tint: "sky" },
};

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

/**
 * Background for pages that don't draw their own. The homepage, category pages
 * and tool pages render their own backdrop, so they're skipped here. Any other
 * page (blog posts, 404, future pages) gets a stable pattern + tint from its path.
 */
export function PageBackdrop() {
  const pathname = usePathname() ?? "/";
  // Category pages (/youtube-tools) and tool pages (/youtube-tools/…) draw their own.
  if (pathname === "/" || getCategoryByPath(pathname.split("/")[1] ?? "")) return null;
  const h = hash(pathname);
  const spec = PAGES[pathname] ?? { pattern: PATTERNS[h % PATTERNS.length], tint: TINTS[(h >>> 4) % TINTS.length] };
  return <Backdrop spec={spec} maxHeight="max-h-[620px]" />;
}
