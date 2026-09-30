import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ToolIconTile } from "@/components/tool-icon";
import { categoryHref, liveCount, toolsIn, type Category } from "@/lib/catalog";
import { categoryBackdrop } from "@/lib/catalog/visuals";
import { cn, toolCount } from "@/lib/utils";

/**
 * Compact category card: icon, name and tool count on one line, a one-line summary,
 * and a one-line preview of its tools. Scales to many categories without a long scroll.
 */
export function CategoryCard({ category, className }: { category: Category; className?: string }) {
  const count = liveCount(category.slug);
  // The tool count sits under the name, so this line just previews the first few tools.
  const peek = toolsIn(category.slug, { includeSoon: false }).slice(0, 3);

  return (
    <Link
      href={categoryHref(category)}
      className={cn(
        "group flex h-full flex-col rounded-2xl border border-line bg-surface p-5 shadow-card transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-raised",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <ToolIconTile name={category.icon} tone="tint" tint={categoryBackdrop(category).tint} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[17px] leading-tight font-medium tracking-[-0.01em] text-ink">{category.name}</h3>
          <p className="text-[13px] text-muted">{toolCount(count)}</p>
        </div>
        <ArrowRight aria-hidden className="h-4 w-4 shrink-0 text-faint transition-[color,transform] duration-200 group-hover:translate-x-0.5 group-hover:text-accent" />
      </div>
      <p className="mt-3 mb-4 line-clamp-2 text-[14px] leading-[1.45] text-muted">{category.description}</p>
      {peek.length ? (
        <p className="mt-auto truncate border-t border-line pt-3 text-[13px] text-ink-2">
          {peek.map((t) => t.name).join(" · ")}
        </p>
      ) : null}
    </Link>
  );
}

/** Compact row card — scales to many categories without crowding. */
export function CategoryTile({ category, active = false }: { category: Category; active?: boolean }) {
  const count = liveCount(category.slug);
  // Coming-soon categories have no page yet, so they're shown but not linked.
  if (!count)
    return (
      <div className="flex items-center gap-3.5 rounded-2xl border border-dashed border-line-strong/70 p-4">
        <ToolIconTile name={category.icon} className="opacity-60" />
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-medium text-muted">{category.name}</span>
          <span className="block truncate text-[13px] text-muted">Coming soon</span>
        </span>
      </div>
    );
  return (
    <Link
      href={categoryHref(category)}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group flex items-center gap-3.5 rounded-2xl border p-4 transition-[border-color,background-color,box-shadow] duration-200",
        active ? "border-accent/40 bg-accent-soft" : "border-line bg-surface hover:border-line-strong hover:shadow-card",
      )}
    >
      <ToolIconTile name={category.icon} tone={active ? "accent" : "neutral"} className="group-hover:text-accent" />
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-medium text-ink">{category.name}</span>
        <span className="block truncate text-[13px] text-muted">{count ? toolCount(count) : "Coming soon"}</span>
      </span>
      <ArrowRight aria-hidden className="h-4 w-4 shrink-0 text-faint transition-[color,transform] group-hover:translate-x-0.5 group-hover:text-ink" />
    </Link>
  );
}
