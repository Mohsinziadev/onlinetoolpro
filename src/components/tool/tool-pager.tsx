import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { isLive, navCategories, toolHref, toolKey, toolsIn, type Tool } from "@/lib/catalog/lite";
import { cn } from "@/lib/utils";

/** Every live tool in sidebar order, so "next" always matches what people see on the left. */
const ordered: Tool[] = navCategories.flatMap((c) => toolsIn(c.slug).filter(isLive));

/** Previous / next tool — lets people keep exploring without going back to a menu. */
export function ToolPager({ tool, className }: { tool: Tool; className?: string }) {
  const i = ordered.findIndex((t) => toolKey(t) === toolKey(tool));
  if (i < 0 || ordered.length < 2) return null;
  const prev = ordered[(i - 1 + ordered.length) % ordered.length];
  const next = ordered[(i + 1) % ordered.length];
  const label = (t: Tool) => (t.category === tool.category ? t.name : `${t.name} · ${navCategories.find((c) => c.slug === t.category)?.name}`);

  return (
    <nav aria-label="More tools" className={cn("grid grid-cols-1 gap-3 sm:grid-cols-2", className)}>
      <Link href={toolHref(prev)} rel="prev" className="group flex items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3.5 transition-colors hover:border-line-strong">
        <ArrowLeft aria-hidden className="h-4 w-4 shrink-0 text-muted transition-transform group-hover:-translate-x-0.5" />
        <span className="min-w-0">
          <span className="block text-[12px] text-muted">Previous tool</span>
          <span className="block truncate text-[15px] font-medium text-ink">{label(prev)}</span>
        </span>
      </Link>
      <Link href={toolHref(next)} rel="next" className="group flex items-center justify-end gap-3 rounded-2xl border border-line bg-surface px-4 py-3.5 text-right transition-colors hover:border-line-strong">
        <span className="min-w-0">
          <span className="block text-[12px] text-muted">Next tool</span>
          <span className="block truncate text-[15px] font-medium text-ink">{label(next)}</span>
        </span>
        <ArrowRight aria-hidden className="h-4 w-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5" />
      </Link>
    </nav>
  );
}
