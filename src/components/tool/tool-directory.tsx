"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Search, X } from "lucide-react";
import { ToolGrid } from "@/components/tool/tool-card";
import { EmptyState } from "@/components/tool/states";
import { categories, categoryHref, liveCount, toolsIn } from "@/lib/catalog/lite";
import { groupResults, searchSite, searchTools } from "@/lib/catalog/search";
import { PostCard } from "@/components/blog/post-card";
import { cn, toolCount } from "@/lib/utils";

/**
 * Every tool, grouped by category, with a search box and category filter.
 * `?q=` and `?category=` are read from the URL so searches are shareable.
 */
export function ToolDirectory() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const fromUrl = params.get("category");
  const filter = categories.some((c) => c.slug === fromUrl) ? fromUrl : null;

  const groups = useMemo(() => {
    if (query.trim()) {
      return groupResults(searchTools(query))
        .filter((g) => !filter || g.category.slug === filter)
        .map((g) => ({ category: g.category, tools: g.results.map((r) => r.tool) }));
    }
    return categories
      .filter((c) => !filter || c.slug === filter)
      .map((c) => ({ category: c, tools: toolsIn(c.slug) }))
      .filter((g) => g.tools.length);
  }, [query, filter]);
  const total = groups.reduce((n, g) => n + g.tools.length, 0);
  const guides = useMemo(() => (query.trim() ? searchSite(query, { postLimit: 3 }).posts : []), [query]);

  function setParam(key: string, value: string | null) {
    const sp = new URLSearchParams(params.toString());
    if (value) sp.set(key, value);
    else sp.delete(key);
    const qs = sp.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  return (
    <div>
      <div className="relative max-w-2xl">
        <Search aria-hidden className="pointer-events-none absolute top-1/2 left-4.5 h-5 w-5 -translate-y-1/2 text-muted" strokeWidth={1.75} />
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setParam("q", e.target.value.trim() || null);
          }}
          placeholder="Search for a tool…"
          aria-label="Search for a tool"
          className="h-14 w-full rounded-2xl border border-line-strong/70 bg-surface pr-12 pl-13 text-[17px] text-ink shadow-card outline-none placeholder:text-faint focus:border-accent/60 focus:ring-4 focus:ring-accent/10 [&::-webkit-search-cancel-button]:hidden"
        />
        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setParam("q", null);
            }}
            aria-label="Clear search"
            className="absolute top-1/2 right-3.5 -translate-y-1/2 rounded-full p-1.5 text-faint hover:text-ink"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <div role="group" aria-label="Filter by category" className="-mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
        {[{ slug: null, name: "All" }, ...categories].map((c) => {
          const on = filter === c.slug;
          const count = c.slug ? liveCount(c.slug) : null;
          return (
            <button
              key={c.slug ?? "all"}
              type="button"
              aria-pressed={on}
              onClick={() => setParam("category", c.slug)}
              className={cn("chip shrink-0", on && "chip-active")}
            >
              {c.name}
              {count === 0 ? <span className="text-[11px] opacity-70">Soon</span> : null}
            </button>
          );
        })}
      </div>

      <p className="mt-8 text-[14px] text-muted" aria-live="polite">
        {query.trim() ? `${total} ${total === 1 ? "result" : "results"} for “${query.trim()}”` : toolCount(total)}
      </p>

      {guides.length ? (
        <section aria-labelledby="dir-guides" className="mt-6 rounded-2xl border border-line bg-bg-subtle p-4 sm:p-5">
          <h2 id="dir-guides" className="text-[14px] font-medium text-ink-2">
            Guides about “{query.trim()}”
          </h2>
          <ul className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
            {guides.map((g) =>
              g.type === "post" ? (
                <li key={g.post.slug}>
                  <PostCard post={g.post} />
                </li>
              ) : null,
            )}
          </ul>
        </section>
      ) : null}

      {groups.length ? (
        <div className="mt-6 space-y-16">
          {groups.map(({ category, tools }) => (
            <section key={category.slug} aria-labelledby={`dir-${category.slug}`}>
              <div className="flex items-end justify-between gap-4 border-b border-line pb-4">
                <div>
                  <h2 id={`dir-${category.slug}`} className="h3 text-ink">
                    {category.title}
                  </h2>
                  <p className="mt-1.5 text-[15px] text-muted">{category.description}</p>
                </div>
                {liveCount(category.slug) ? (
                  <Link href={categoryHref(category)} className="group hidden shrink-0 items-center gap-1.5 text-[14px] font-medium text-ink hover:text-accent sm:inline-flex">
                    Open category <ArrowRight aria-hidden className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                ) : (
                  <span className="hidden shrink-0 text-[13px] text-muted sm:inline">Coming soon</span>
                )}
              </div>
              <ToolGrid tools={tools} className="mt-6" />
            </section>
          ))}
        </div>
      ) : (
        <EmptyState
          className="mt-6"
          title="No tools found"
          description={`Nothing matches “${query}” yet. Try a simpler word like “thumbnail”, “words” or “ID”.`}
        />
      )}
    </div>
  );
}
