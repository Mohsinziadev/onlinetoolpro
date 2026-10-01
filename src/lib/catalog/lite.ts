/**
 * The catalog for client components: the same API as "@/lib/catalog", over a
 * trimmed copy with only names, links, icons, descriptions and keywords (see
 * scripts/gen-lite-catalog.ts). Keeps FAQs, guides and page copy out of the
 * JavaScript every page downloads.
 */
import { createCatalog } from "@/lib/catalog/model";
import { liteCategories, liteTools } from "@/lib/catalog/generated/lite-data";

export type { Category, Tool, ToolStatus, IconName, Faq } from "@/lib/catalog/types";
export { isLive, toolKey, toolTitle } from "@/lib/catalog/model";

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
} = createCatalog(liteCategories, liteTools);
