"use client";

import Link from "next/link";
import { BookOpen, CornerDownLeft } from "lucide-react";
import { ToolIconTile } from "@/components/tool-icon";
import { categoryHref, isLive, liveCount, toolHref, type IconName, type Tool } from "@/lib/catalog/lite";
import { groupResults, searchSite } from "@/lib/catalog/search";
import { KIND_LABEL, postHref } from "@/lib/blog/posts";
import { cn, toolCount } from "@/lib/utils";

/** One row in the results: a tool, a guide or a category. `href` is null for coming-soon tools. */
export type SearchItem = {
  key: string;
  kind: "tool" | "post" | "category";
  href: string | null;
  title: string;
  description: string;
  icon?: IconName;
  badge?: string;
};
export type ResultGroup = { key: string; title: string; items: SearchItem[] };

export function toolItem(tool: Tool): SearchItem {
  const live = isLive(tool);
  return {
    key: `tool:${tool.category}/${tool.slug}`,
    kind: "tool",
    href: live ? toolHref(tool) : null,
    title: tool.name,
    description: tool.description,
    icon: tool.icon,
    badge: live ? undefined : "Soon",
  };
}

/**
 * Search tools, guides and categories. Tools are grouped by category; guides and
 * categories get a group each. `navigable` is the flat list the keyboard moves through.
 */
export function runSearch(query: string, toolLimit = 10): { groups: ResultGroup[]; navigable: SearchItem[] } {
  const hits = searchSite(query, { toolLimit, postLimit: 4 });
  const groups: ResultGroup[] = groupResults(hits.tools).map((g) => ({
    key: g.category.slug,
    title: g.category.title,
    items: g.results.map((r) => toolItem(r.tool)),
  }));
  if (hits.posts.length)
    groups.push({
      key: "guides",
      title: "Guides",
      items: hits.posts.map((h) =>
        h.type === "post"
          ? { key: `post:${h.post.slug}`, kind: "post", href: postHref(h.post), title: h.post.title, description: h.post.description, badge: KIND_LABEL[h.post.kind] }
          : (null as never),
      ),
    });
  if (hits.categories.length)
    groups.push({
      key: "categories",
      title: "Categories",
      items: hits.categories.map((h) =>
        h.type === "category"
          ? { key: `cat:${h.category.slug}`, kind: "category", href: categoryHref(h.category), title: h.category.title, description: `${toolCount(liveCount(h.category.slug))} · ${h.category.description}`, icon: h.category.icon }
          : (null as never),
      ),
    });
  return { groups, navigable: groups.flatMap((g) => g.items.filter((i) => i.href)) };
}

/**
 * Grouped result list. Coming-soon tools are shown (so people know they're
 * planned) but are not links.
 */
export function SearchResults({
  id,
  groups,
  active,
  onHover,
  onPick,
  className,
}: {
  id: string;
  groups: ResultGroup[];
  /** Key of the keyboard-highlighted item */
  active: string | null;
  onHover?: (key: string) => void;
  onPick?: () => void;
  className?: string;
}) {
  return (
    <div id={id} role="listbox" aria-label="Search results" className={cn("space-y-3", className)}>
      {groups.map((g) => (
        <div key={g.key} role="group" aria-label={g.title}>
          <p className="px-3 pt-2 pb-1.5 text-[12px] font-medium tracking-[0.01em] text-muted">{g.title}</p>
          <ul>
            {g.items.map((item) => {
              const selected = item.key === active;
              const inner = (
                <>
                  {item.icon ? (
                    <ToolIconTile name={item.icon} size="sm" tone={selected ? "accent" : "neutral"} className={!item.href ? "opacity-60" : undefined} />
                  ) : (
                    <span className={cn("inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] border", selected ? "border-transparent bg-accent-soft text-accent" : "border-line bg-surface-2 text-ink-2")}>
                      <BookOpen aria-hidden className="h-4 w-4" strokeWidth={1.75} />
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className={cn("block truncate text-[15px] font-medium", item.href ? "text-ink" : "text-muted")}>{item.title}</span>
                    <span className="block truncate text-[13px] text-muted">{item.description}</span>
                  </span>
                  {item.badge ? (
                    <span className="shrink-0 rounded-full border border-line px-2 py-0.5 text-[11px] text-muted">{item.badge}</span>
                  ) : selected ? (
                    <CornerDownLeft aria-hidden className="h-3.5 w-3.5 shrink-0 text-muted" />
                  ) : null}
                </>
              );
              return (
                <li key={item.key} role="option" aria-selected={selected} aria-disabled={!item.href || undefined} id={`${id}-${item.key.replace(/[^a-z0-9-]/gi, "-")}`}>
                  {item.href ? (
                    <Link
                      href={item.href}
                      onMouseEnter={() => onHover?.(item.key)}
                      onClick={onPick}
                      className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors", selected ? "bg-bg-subtle" : "hover:bg-bg-subtle")}
                    >
                      {inner}
                    </Link>
                  ) : (
                    <div className="flex cursor-default items-center gap-3 rounded-xl px-3 py-2.5">{inner}</div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}

export const optionId = (listId: string, key: string) => `${listId}-${key.replace(/[^a-z0-9-]/gi, "-")}`;
