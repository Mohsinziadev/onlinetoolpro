"use client";

import { useEffect, useId, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { optionId, runSearch, SearchResults } from "@/components/search/search-results";
import { cn } from "@/lib/utils";

const PLACEHOLDERS = ["Search for a tool…", "Try “thumbnail”", "Try “word counter”", "Try “channel ID”"];

/**
 * Big search field with instant, grouped results across every category.
 * Enter opens the highlighted tool, or the full results page if none is highlighted.
 */
export function HeroSearch({ className, autoFocus = false }: { className?: string; autoFocus?: boolean }) {
  const router = useRouter();
  const id = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [placeholder, setPlaceholder] = useState(0);

  const { groups, navigable } = useMemo(() => runSearch(query, 8), [query]);
  const active = navigable[activeIndex] ?? null;
  const activeKey = active?.key ?? null;
  const showPanel = open && query.trim().length > 0;

  // Rotate example searches in the placeholder while the field is empty.
  useEffect(() => {
    if (query) return;
    const t = window.setInterval(() => setPlaceholder((p) => (p + 1) % PLACEHOLDERS.length), 3200);
    return () => window.clearInterval(t);
  }, [query]);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(active?.href ?? `/tools?q=${encodeURIComponent(query.trim())}`);
  }

  function onKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((i) => Math.min(i + 1, navigable.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={wrapRef} className={cn("relative", className)}>
      <form onSubmit={submit} role="search" className="relative">
        <label htmlFor={id} className="sr-only">
          Search for a tool
        </label>
        <Search aria-hidden className="pointer-events-none absolute top-1/2 left-5 h-5 w-5 -translate-y-1/2 text-muted" strokeWidth={1.75} />
        <input
          id={id}
          type="search"
          value={query}
          autoFocus={autoFocus}
          autoComplete="off"
          spellCheck={false}
          role="combobox"
          aria-expanded={showPanel}
          aria-controls={`${id}-results`}
          aria-activedescendant={showPanel && activeKey ? optionId(`${id}-results`, activeKey) : undefined}
          onChange={(e) => {
            setQuery(e.target.value);
            setActiveIndex(0);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKey}
          placeholder={PLACEHOLDERS[placeholder]}
          className="h-16 w-full rounded-2xl border border-line-strong/70 bg-surface pr-32 pl-14 text-[17px] text-ink shadow-raised outline-none transition-[border-color,box-shadow] placeholder:text-faint focus:border-accent/60 focus:ring-4 focus:ring-accent/10 sm:text-[18px] [&::-webkit-search-cancel-button]:hidden"
        />
        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setOpen(false);
            }}
            aria-label="Clear search"
            className="absolute top-1/2 right-[104px] -translate-y-1/2 rounded-full p-1.5 text-faint hover:text-ink"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
        <button
          type="submit"
          className="absolute top-1/2 right-2.5 inline-flex h-11 -translate-y-1/2 items-center rounded-full bg-cta px-5 text-[15px] font-medium text-cta-ink transition-colors hover:bg-cta-hover"
        >
          Search
        </button>
      </form>

      {showPanel ? (
        <div className="absolute inset-x-0 top-[calc(100%+8px)] z-30 max-h-[min(460px,60vh)] animate-fade-in overflow-y-auto rounded-2xl border border-line bg-surface p-2 text-left shadow-float">
          {groups.length ? (
            <SearchResults
              id={`${id}-results`}
              groups={groups}
              active={activeKey}
              onHover={(k) => setActiveIndex(Math.max(0, navigable.findIndex((t) => t.key === k)))}
              onPick={() => setOpen(false)}
            />
          ) : (
            <p className="px-4 py-8 text-center text-[15px] text-muted">
              No tools match &ldquo;{query}&rdquo; yet. Try a simpler word like &ldquo;thumbnail&rdquo; or &ldquo;words&rdquo;.
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
