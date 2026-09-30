"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { HeroSearch } from "@/components/search/hero-search";
import { ToolIcon, ToolIconTile } from "@/components/tool-icon";
import { companyLinks, legalLinks, resourceLinks } from "@/lib/nav";
import { categoryHref, laterCategories, liveCount, navCategories, popularTools, toolHref } from "@/lib/catalog";

/** Mobile menu, ordered for discovery: search → categories → popular tools → all tools → resources. */
export function MobileNav() {
  const pathname = usePathname();
  // The menu belongs to the page it was opened on, so navigating closes it.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpenOn(open ? null : pathname)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-bg-subtle"
      >
        {open ? <X className="h-5 w-5" strokeWidth={1.75} /> : <Menu className="h-5 w-5" strokeWidth={1.75} />}
      </button>

      {open ? (
        <div id="mobile-menu" className="fixed inset-x-0 top-20 bottom-0 z-40 animate-fade-in overflow-y-auto border-t border-line bg-bg">
          <nav
            aria-label="Mobile"
            className="container-page space-y-9 pt-5 pb-12"
            // Close on any item tap — including links to the page we're already on.
            onClick={(e) => {
              if ((e.target as HTMLElement).closest("a")) setOpenOn(null);
            }}
          >
            <HeroSearch />

            <div>
              <p className="eyebrow mb-3">Categories</p>
              <ul className="grid grid-cols-2 gap-2">
                {navCategories.map((c) => {
                  const count = liveCount(c.slug);
                  return (
                    <li key={c.slug}>
                      {count ? (
                        <Link href={categoryHref(c)} className="flex items-center gap-2.5 rounded-xl border border-line bg-surface p-3 text-[15px] text-ink">
                          <ToolIcon name={c.icon} className="text-accent" />
                          <span className="min-w-0 flex-1 truncate">{c.name}</span>
                        </Link>
                      ) : (
                        // Coming soon: shown, but there's no page to open yet.
                        <div aria-disabled className="flex items-center gap-2.5 rounded-xl border border-dashed border-line-strong p-3 text-[15px] text-ink-2">
                          <ToolIcon name={c.icon} className="text-faint" />
                          <span className="min-w-0 flex-1 truncate">{c.name}</span>
                          <span className="text-[11px] text-muted">Soon</span>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
              {laterCategories.length ? (
                <p className="mt-3 text-[13px] text-muted">Coming later: {laterCategories.map((c) => c.name).join(", ")}.</p>
              ) : null}
            </div>

            <div>
              <p className="eyebrow mb-2">Popular tools</p>
              <ul>
                {popularTools(6).map((t) => (
                  <li key={`${t.category}/${t.slug}`}>
                    <Link href={toolHref(t)} className="flex items-center gap-3 py-2.5 text-[16px] text-ink">
                      <ToolIconTile name={t.icon} size="sm" />
                      {t.name}
                    </Link>
                  </li>
                ))}
              </ul>
              <Link href="/tools" className="mt-3 inline-flex h-12 w-full items-center justify-center rounded-full bg-cta text-[15px] font-medium text-cta-ink">
                Start for free — browse all tools
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-1 border-t border-line pt-6 text-[15px]">
              {[...resourceLinks, ...companyLinks, ...legalLinks].map((l) => (
                <Link key={l.href} href={l.href} className="py-2 text-muted hover:text-ink">
                  {l.label}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      ) : null}
    </div>
  );
}
