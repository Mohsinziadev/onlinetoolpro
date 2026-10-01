/**
 * The tool catalog: single source of truth for categories and tools.
 * Routing, menus, cards, search, SEO and the sitemap all read from here.
 *
 * URLs: /<category path>/<tool slug>, e.g. /youtube-tools/thumbnail-downloader.
 *
 * To add a tool: add an entry to a file in ./tools, then (if it's live) add its
 * interface to src/tools/keys.ts + src/tools/mounts.tsx. To add a category: add an
 * entry to ./categories.ts. Nothing else needs to change.
 *
 * This module carries every tool's full page copy, so it's for server components.
 * Client components import "@/lib/catalog/lite" — the same API over a trimmed copy.
 */
import { categories as allCategories } from "@/lib/catalog/categories";
import { youtubeTools } from "@/lib/catalog/tools/youtube";
import { otherTools } from "@/lib/catalog/tools/other";
import { moreTools } from "@/lib/catalog/tools/more";
import { financeTools } from "@/lib/catalog/tools/finance";
import { toolHelp } from "@/lib/catalog/tools/help";
import { createCatalog } from "@/lib/catalog/model";
import type { Tool } from "@/lib/catalog/types";

export type { Category, Tool, ToolStatus, IconName, Faq } from "@/lib/catalog/types";
export { isLive, toolKey, toolTitle } from "@/lib/catalog/model";

/** Long-form help (./tools/help.ts) is merged in: a tool's own guide wins; extra FAQs are appended. */
function withHelp(t: Tool): Tool {
  const help = toolHelp[`${t.category}/${t.slug}`];
  if (!help) return t;
  return { ...t, guide: t.guide ?? help.guide, faqs: [...(t.faqs ?? []), ...(help.faqs ?? [])] };
}

export const {
  categories,
  tools,
  toolHref,
  categoryHref,
  getCategory,
  getCategoryByPath,
  getTool,
  resolveTool,
  liveTools,
  toolsIn,
  liveCount,
  activeCategories,
  upcomingCategories,
  navCategories,
  laterCategories,
  popularTools,
  newTools,
  relatedTools,
  relatedCategories,
  groupedTools,
} = createCatalog(allCategories, [...youtubeTools, ...otherTools, ...moreTools, ...financeTools].map(withHelp));
