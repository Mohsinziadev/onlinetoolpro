"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Kbd } from "@/components/ui/primitives";
import { runSearch, SearchResults, toolItem } from "@/components/search/search-results";
import { ToolIcon } from "@/components/tool-icon";
import { cn } from "@/lib/utils";
import { activeCategories, categoryHref, popularTools } from "@/lib/catalog";

/** ⌘K / Ctrl+K search across every category. Empty state suggests popular tools and categories. */
export function SearchDialog({ variant = "field" }: { variant?: "field" | "plain" }) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const { groups, navigable } = useMemo(() => {
    if (query.trim()) return runSearch(query, 20);
    const popular = popularTools(6);
    return { groups: [], navigable: popular.map(toolItem) };
  }, [query]);
  const active = navigable[activeIndex] ?? null;
  const activeKey = active?.key ?? null;

  function open() {
    setQuery("");
    setActiveIndex(0);
    dialogRef.current?.showModal();
    requestAnimationFrame(() => inputRef.current?.focus());
  }
  function close() {
    dialogRef.current?.close();
  }

  useEffect(() => {
    function onKey(e: globalThis.KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (dialogRef.current?.open) close();
        else open();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function onInputKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((a) => Math.min(a + 1, navigable.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (active) {
        close();
        router.push(active.href ?? "/tools");
      } else if (query.trim()) {
        close();
        router.push(`/tools?q=${encodeURIComponent(query.trim())}`);
      }
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={open}
        className={cn(
          "inline-flex h-10 items-center gap-2 rounded-full transition-colors max-md:w-10 max-md:justify-center max-md:hover:bg-bg-subtle",
          variant === "plain"
            ? "text-muted hover:text-ink md:px-3"
            : "text-ink-2 hover:text-ink md:border md:border-line md:bg-surface md:pr-2 md:pl-3.5 md:hover:border-line-strong",
        )}
        aria-label="Search tools"
      >
        <Search aria-hidden className="h-4.5 w-4.5" strokeWidth={1.75} />
        <span className={cn("hidden md:inline", variant === "plain" ? "text-[16px]" : "text-[14px]")}>{variant === "plain" ? "Search" : "Search tools"}</span>
        <Kbd className={cn("hidden", variant === "plain" ? "xl:inline-flex" : "ml-3 md:inline-flex")}>⌘K</Kbd>
      </button>

      <dialog
        ref={dialogRef}
        aria-label="Search tools"
        onClick={(e) => {
          if (e.target === dialogRef.current) close();
        }}
        className="m-0 mx-auto mt-[8vh] w-[calc(100%-2rem)] max-w-2xl rounded-2xl border border-line bg-surface p-0 text-ink shadow-float backdrop:bg-black/40 backdrop:backdrop-blur-[2px] open:animate-fade-up"
      >
        <div className="flex items-center gap-3 border-b border-line px-5">
          <Search aria-hidden className="h-5 w-5 text-muted" strokeWidth={1.75} />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={onInputKey}
            placeholder="Search tools and guides…"
            aria-label="Search for a tool"
            aria-controls="dialog-results"
            role="combobox"
            aria-expanded
            className="h-16 flex-1 bg-transparent text-[17px] outline-none placeholder:text-faint [&::-webkit-search-cancel-button]:hidden"
          />
          <button type="button" onClick={close} className="hidden sm:block" aria-label="Close search">
            <Kbd>Esc</Kbd>
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {query.trim() ? (
            groups.length ? (
              <SearchResults
                id="dialog-results"
                groups={groups}
                active={activeKey}
                onHover={(k) => setActiveIndex(Math.max(0, navigable.findIndex((t) => t.key === k)))}
                onPick={close}
              />
            ) : (
              <p className="px-3 py-12 text-center text-[15px] text-muted">
                No tools match &ldquo;{query}&rdquo; yet. Try a simpler word like &ldquo;thumbnail&rdquo; or &ldquo;words&rdquo;.
              </p>
            )
          ) : (
            <div className="space-y-4 pb-2">
              <SearchResults
                id="dialog-results"
                groups={[{ key: "popular", title: "Popular tools", items: navigable }]}
                active={activeKey}
                onHover={(k) => setActiveIndex(Math.max(0, navigable.findIndex((t) => t.key === k)))}
                onPick={close}
              />
              <div className="px-3">
                <p className="pb-2 text-[12px] font-medium text-muted">Browse categories</p>
                <div className="flex flex-wrap gap-2">
                  {activeCategories.map((c) => (
                    <Link key={c.slug} href={categoryHref(c)} onClick={close} className="chip">
                      <ToolIcon name={c.icon} className="h-3.5 w-3.5" />
                      {c.name}
                    </Link>
                  ))}
                  <Link href="/tools" onClick={close} className="chip">
                    All tools
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </dialog>
    </>
  );
}
