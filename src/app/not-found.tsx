import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { ToolIcon } from "@/components/tool-icon";
import { HeroSearch } from "@/components/search/hero-search";
import { activeCategories, categoryHref, popularTools, toolHref } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Page not found",
  description: "This page doesn't exist or has moved. Search for a tool or browse every category.",
  robots: { index: false, follow: true },
};

/** Useful 404: search, popular tools and every category, so nobody hits a dead end. */
export default function NotFound() {
  const popular = popularTools(6);
  return (
    <div className="container-page py-20 sm:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <p className="font-mono text-sm text-accent">404</p>
        <h1 className="h1 mt-3 text-ink">Page not found</h1>
        <p className="lead mt-4 text-muted">The page you’re looking for doesn’t exist or has moved. Try searching for the tool you need.</p>
        <HeroSearch className="mt-8" />
        <div className="mt-6 flex justify-center gap-3">
          <ButtonLink href="/tools">Browse all tools</ButtonLink>
          <ButtonLink href="/" variant="secondary">
            Home
          </ButtonLink>
        </div>
      </div>

      <div className="mx-auto mt-20 grid grid-cols-1 max-w-4xl gap-12 sm:grid-cols-2">
        <section aria-labelledby="nf-popular">
          <h2 id="nf-popular" className="h4 text-ink">
            Popular tools
          </h2>
          <ul className="mt-4 space-y-1">
            {popular.map((t) => (
              <li key={`${t.category}/${t.slug}`}>
                <Link href={toolHref(t)} className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-[15px] text-ink-2 transition-colors hover:bg-bg-subtle hover:text-ink">
                  <ToolIcon name={t.icon} className="text-muted" />
                  {t.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
        <section aria-labelledby="nf-categories">
          <h2 id="nf-categories" className="h4 text-ink">
            Categories
          </h2>
          <ul className="mt-4 space-y-1">
            {activeCategories.map((c) => (
              <li key={c.slug}>
                <Link href={categoryHref(c)} className="group flex items-center gap-2.5 rounded-lg px-2 py-2 text-[15px] text-ink-2 transition-colors hover:bg-bg-subtle hover:text-ink">
                  <ToolIcon name={c.icon} className="text-muted" />
                  <span className="flex-1">{c.title}</span>
                  <ArrowRight aria-hidden className="h-4 w-4 text-faint transition-transform group-hover:translate-x-0.5" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
