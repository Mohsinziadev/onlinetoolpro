import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ToolIconTile } from "@/components/tool-icon";
import { Badge } from "@/components/ui/primitives";
import { getCategory, isLive, toolHref, type Tool } from "@/lib/catalog";
import { toolBackdrop } from "@/lib/catalog/visuals";
import { cn } from "@/lib/utils";

/**
 * The one card used for every tool, everywhere. Live tools link to their page;
 * coming-soon tools render as a quiet, non-interactive card.
 */
export function ToolCard({
  tool,
  showCategory = false,
  showPopular = true,
  className,
}: {
  tool: Tool;
  showCategory?: boolean;
  showPopular?: boolean;
  className?: string;
}) {
  const live = isLive(tool);
  const category = getCategory(tool.category);
  // Every live tool is free, so every live card says so.
  const hasBadges = live || Boolean(showCategory && category);
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <ToolIconTile name={tool.icon} tone={live ? "tint" : "neutral"} tint={toolBackdrop(tool).tint} className={live ? undefined : "opacity-60"} />
        {live ? (
          <ArrowUpRight
            aria-hidden
            className="h-4 w-4 text-faint transition-[color,transform] duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent"
          />
        ) : (
          <Badge>Coming soon</Badge>
        )}
      </div>
      <h3 className={cn("mt-5 text-[16px] leading-snug font-medium tracking-[-0.01em]", live ? "text-ink" : "text-muted")}>
        {tool.name}
      </h3>
      <p className="mt-1.5 flex-1 text-[14px] leading-[1.45] text-muted">{tool.description}</p>
      {hasBadges ? (
        <div className="mt-4 flex flex-wrap items-center gap-1.5">
          {live ? tool.access === "premium" ? <Badge tone="accent">Premium</Badge> : <Badge tone="success">Free</Badge> : null}
          {showCategory && category ? <Badge>{category.name}</Badge> : null}
          {showPopular && tool.popular && live ? <Badge tone="accent">Popular</Badge> : null}
          {tool.status === "beta" ? <Badge tone="warning">Beta</Badge> : null}
        </div>
      ) : null}
    </>
  );

  const base = "relative flex h-full flex-col rounded-2xl border p-5 sm:p-6";
  if (!live) {
    return <div className={cn(base, "border-dashed border-line-strong/70 bg-transparent", className)}>{body}</div>;
  }
  return (
    <Link
      href={toolHref(tool)}
      className={cn(
        base,
        "group border-line bg-surface shadow-card transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-raised",
        className,
      )}
    >
      {body}
    </Link>
  );
}

export function ToolGrid({
  tools,
  showCategory = false,
  columns = 3,
  className,
}: {
  tools: Tool[];
  showCategory?: boolean;
  columns?: 3 | 4;
  className?: string;
}) {
  return (
    <ul className={cn("grid gap-3 sm:grid-cols-2", columns === 4 ? "lg:grid-cols-3 xl:grid-cols-4" : "lg:grid-cols-3", className)}>
      {tools.map((t) => (
        <li key={`${t.category}/${t.slug}`}>
          <ToolCard tool={t} showCategory={showCategory} />
        </li>
      ))}
    </ul>
  );
}
