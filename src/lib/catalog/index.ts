/**
 * The tool catalog: single source of truth for categories and tools.
 * Routing, menus, cards, search, SEO and the sitemap all read from here.
 *
 * URLs: /<category path>/<tool slug>, e.g. /youtube-tools/thumbnail-downloader.
 *
 * To add a tool: add an entry to a file in ./tools, then (if it's live) add its
 * interface module to src/tools/registry.ts. To add a category: add an entry to
 * ./categories.ts. Nothing else needs to change.
 */
import { categories as allCategories } from "@/lib/catalog/categories";
import { youtubeTools } from "@/lib/catalog/tools/youtube";
import { otherTools } from "@/lib/catalog/tools/other";
import type { Category, Tool } from "@/lib/catalog/types";

export type { Category, Tool, ToolStatus, IconName, Faq } from "@/lib/catalog/types";

export const categories: Category[] = [...allCategories].sort((a, b) => a.order - b.order);
export const tools: Tool[] = [...youtubeTools, ...otherTools];

const categoryMap = new Map(categories.map((c) => [c.slug, c]));
const toolMap = new Map(tools.map((t) => [toolKey(t), t]));

if (process.env.NODE_ENV !== "production") {
  for (const t of tools) {
    if (!categoryMap.has(t.category)) throw new Error(`Tool "${t.slug}" references unknown category "${t.category}"`);
  }
  if (toolMap.size !== tools.length) throw new Error("Duplicate tool slug inside a category");
}

/* ——— identity & links ——— */

export function toolKey(t: Pick<Tool, "category" | "slug">): string {
  return `${t.category}/${t.slug}`;
}
/** /youtube-tools/thumbnail-downloader */
export function toolHref(t: Pick<Tool, "category" | "slug">): string {
  return `/${categoryMap.get(t.category)?.path ?? t.category}/${t.slug}`;
}
/** /youtube-tools — accepts a category or its slug */
export function categoryHref(c: Pick<Category, "slug"> | string): string {
  const slug = typeof c === "string" ? c : c.slug;
  return `/${categoryMap.get(slug)?.path ?? slug}`;
}
export function toolTitle(t: Tool): string {
  return t.title ?? t.name;
}
export const isLive = (t: Tool) => t.status !== "coming-soon";

/* ——— lookups ——— */

export function getCategory(slug: string): Category | undefined {
  return categoryMap.get(slug);
}
const pathMap = new Map(categories.map((c) => [c.path, c]));
/** Look up a category by its public URL segment ("youtube-tools"). */
export function getCategoryByPath(path: string): Category | undefined {
  return pathMap.get(path);
}
export function getTool(category: string, slug: string): Tool | undefined {
  return toolMap.get(`${category}/${slug}`);
}
/** Resolve "slug" (relative to `from`) or "category/slug". */
export function resolveTool(ref: string, from: string): Tool | undefined {
  return ref.includes("/") ? toolMap.get(ref) : toolMap.get(`${from}/${ref}`);
}

/* ——— collections ——— */

export const liveTools = tools.filter(isLive);

export function toolsIn(category: string, { includeSoon = true } = {}): Tool[] {
  const list = tools.filter((t) => t.category === category && (includeSoon || isLive(t)));
  // Featured first, then live before soon, then original order.
  return list
    .map((t, i) => ({ t, i }))
    .sort((a, b) => rank(a.t) - rank(b.t) || a.i - b.i)
    .map(({ t }) => t);
}
function rank(t: Tool) {
  return (t.featured ? 0 : 1) + (isLive(t) ? 0 : 10);
}

export function liveCount(category: string): number {
  return tools.filter((t) => t.category === category && isLive(t)).length;
}

/** Categories that have at least one live tool, in display order. */
export const activeCategories = categories.filter((c) => liveCount(c.slug) > 0);
export const upcomingCategories = categories.filter((c) => liveCount(c.slug) === 0);
/** Categories shown in menus: those with tools, plus any flagged to appear early ("Coming soon"). */
export const navCategories = categories.filter((c) => liveCount(c.slug) > 0 || c.showInNav);
/** Planned categories not shown in menus yet — mentioned as "coming later". */
export const laterCategories = upcomingCategories.filter((c) => !c.showInNav);

/**
 * Tools marked popular. Within one category, in catalog order; across the whole
 * site, taken round-robin by category so one big category can't fill the list.
 */
export function popularTools(limit = 8, category?: string): Tool[] {
  const popular = liveTools.filter((t) => t.popular && (!category || t.category === category));
  if (category) return popular.slice(0, limit);
  const byCat = categories.map((c) => popular.filter((t) => t.category === c.slug)).filter((l) => l.length);
  const out: Tool[] = [];
  for (let i = 0; out.length < limit && byCat.some((l) => l[i]); i++) for (const l of byCat) if (l[i] && out.length < limit) out.push(l[i]);
  return out;
}

export function newTools(limit = 6): Tool[] {
  return [...liveTools]
    .filter((t) => t.addedAt)
    .sort((a, b) => (b.addedAt ?? "").localeCompare(a.addedAt ?? ""))
    .slice(0, limit);
}

/** Explicit related tools first, then same-group, then same-category tools. */
export function relatedTools(tool: Tool, limit = 3): Tool[] {
  const out: Tool[] = [];
  const seen = new Set([toolKey(tool)]);
  const push = (t: Tool | undefined) => {
    if (t && isLive(t) && !seen.has(toolKey(t)) && out.length < limit) {
      seen.add(toolKey(t));
      out.push(t);
    }
  };
  tool.related?.forEach((r) => push(resolveTool(r, tool.category)));
  liveTools.filter((t) => t.category === tool.category && t.group === tool.group).forEach(push);
  liveTools.filter((t) => t.category === tool.category).forEach(push);
  return out;
}

/** Other categories that have tools (coming-soon categories have no page to link to). */
export function relatedCategories(current: string, limit = 4): Category[] {
  return activeCategories.filter((c) => c.slug !== current).slice(0, limit);
}

/** Tools in a category arranged by its declared groups (for large categories). */
export function groupedTools(category: Category): { id: string; name: string; tools: Tool[] }[] {
  const list = toolsIn(category.slug);
  if (!category.groups?.length) return [{ id: "all", name: category.title, tools: list }];
  const groups = category.groups.map((g) => ({ ...g, tools: list.filter((t) => t.group === g.id) }));
  const rest = list.filter((t) => !category.groups!.some((g) => g.id === t.group));
  if (rest.length) groups.push({ id: "other", name: "More tools", tools: rest });
  return groups.filter((g) => g.tools.length);
}
