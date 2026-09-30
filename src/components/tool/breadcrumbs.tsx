import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { JsonLd } from "@/components/json-ld";
import { absoluteUrl } from "@/lib/site";

export type Crumb = { label: string; href: string };

/** Visible breadcrumb trail + BreadcrumbList structured data. The last crumb is the current page. */
export function Breadcrumbs({ items, className }: { items: Crumb[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-1 text-[13px] text-muted">
        {items.map((c, i) => {
          const last = i === items.length - 1;
          return (
            <li key={c.href} className="flex items-center gap-1">
              {i > 0 ? <ChevronRight aria-hidden className="h-3.5 w-3.5 text-faint" /> : null}
              {last ? (
                <span aria-current="page" className="text-ink-2">
                  {c.label}
                </span>
              ) : (
                <Link href={c.href} className="transition-colors hover:text-ink">
                  {c.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: items.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.label, item: absoluteUrl(c.href) })),
        }}
      />
    </nav>
  );
}
