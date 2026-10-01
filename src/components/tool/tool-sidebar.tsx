"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { ArrowRight, ChevronDown, Clock, LayoutGrid, Search, X } from "lucide-react";
import { ToolIcon } from "@/components/tool-icon";
import { Kbd } from "@/components/ui/primitives";
import { categoryHref, getTool, isLive, liveTools, navCategories, toolHref, toolKey, toolsIn, type Tool } from "@/lib/catalog/lite";
import { searchTools } from "@/lib/catalog/search";
import { cn } from "@/lib/utils";

/* ——— recently used tools (per-browser convenience, never required) ——— */

const RECENT_KEY = "otp:recent-tools";
const RECENT_EVENT = "otp:recent-tools";
const RECENT_MAX = 5;

function readRecent(): string {
  try {
    return localStorage.getItem(RECENT_KEY) ?? "";
  } catch {
    return "";
  }
}
function subscribeRecent(cb: () => void) {
  window.addEventListener(RECENT_EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(RECENT_EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}
/** Remember that a tool was opened. */
function rememberTool(key: string) {
  try {
    const list = readRecent().split(",").filter((k) => k && k !== key);
    localStorage.setItem(RECENT_KEY, [key, ...list].slice(0, RECENT_MAX + 1).join(","));
    window.dispatchEvent(new Event(RECENT_EVENT));
  } catch {
    /* storage blocked — recents are optional */
  }
}
/** Recently opened live tools, most recent first. Empty on the server and before hydration. */
export function useRecentTools(exclude?: string): Tool[] {
  const raw = useSyncExternalStore(subscribeRecent, readRecent, () => "");
  return useMemo(
    () =>
      raw
        .split(",")
        .filter((k) => k && k !== exclude)
        .map((k) => {
          const [cat, slug] = k.split("/");
          return getTool(cat, slug);
        })
        .filter((t): t is Tool => Boolean(t && isLive(t)))
        .slice(0, RECENT_MAX),
    [raw, exclude],
  );
}

/* ——— the list itself ——— */

const TOTAL = liveTools.length;

/**
 * Every category and tool, with a quick filter. The current category starts open
 * and the current tool is highlighted. Used by the desktop sidebar and the mobile drawer.
 */
function ToolNav({ current, onNavigate, autoFocus = false }: { current: string; onNavigate?: () => void; autoFocus?: boolean }) {
  const currentCategory = current.split("/")[0];
  const [open, setOpen] = useState<Set<string>>(() => new Set([currentCategory]));
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recent = useRecentTools(current);

  const q = query.trim();
  const matches = useMemo(() => (q ? searchTools(q, { limit: 40 }).map((r) => r.tool) : null), [q]);

  // Keep the current tool in view inside the list (without scrolling the page).
  useLayoutEffect(() => {
    const box = scrollRef.current;
    const el = box?.querySelector<HTMLElement>("[aria-current='page']");
    if (box && el && el.offsetTop + el.offsetHeight > box.clientHeight - 16) box.scrollTop = el.offsetTop - box.clientHeight / 3;
  }, []);

  // "/" jumps to the filter from anywhere on the page (unless you're typing).
  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      if (!inputRef.current?.offsetParent) return; // hidden (other breakpoint)
      e.preventDefault();
      inputRef.current.focus();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [autoFocus]);

  const toggle = (slug: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 p-3">
        <label className="relative block">
          <span className="sr-only">Filter tools</span>
          <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape" && query) {
                e.stopPropagation();
                setQuery("");
              }
            }}
            placeholder={`Find a tool (${TOTAL} free)`}
            autoComplete="off"
            spellCheck={false}
            className="h-10 w-full rounded-xl border border-line bg-surface pr-9 pl-9 text-[14px] text-ink placeholder:text-muted transition-colors outline-none hover:border-line-strong focus:border-accent focus:ring-3 focus:ring-accent/15 [&::-webkit-search-cancel-button]:hidden"
          />
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              aria-label="Clear filter"
              className="absolute top-1/2 right-2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-muted hover:bg-bg-subtle hover:text-ink"
            >
              <X aria-hidden className="h-3.5 w-3.5" />
            </button>
          ) : (
            <Kbd className="pointer-events-none absolute top-1/2 right-2.5 hidden -translate-y-1/2 lg:inline-flex">/</Kbd>
          )}
        </label>
      </div>

      <div ref={scrollRef} className="side-scroll relative min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 pb-3">
        {matches ? (
          matches.length ? (
            <div>
              <p className="side-heading">
                {matches.length} {matches.length === 1 ? "match" : "matches"}
              </p>
              <ul className="space-y-0.5">
                {matches.map((t) => (
                  <li key={toolKey(t)}>
                    <ToolLink tool={t} current={current} onNavigate={onNavigate} showCategory />
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="px-3 py-8 text-center">
              <p className="text-[14px] text-ink-2">No tools match “{q}”.</p>
              <button type="button" onClick={() => setQuery("")} className="mt-2 text-[13px] font-medium text-accent hover:underline">
                Show all tools
              </button>
            </div>
          )
        ) : (
          <>
            {recent.length ? (
              <div className="mb-2">
                <p className="side-heading flex items-center gap-1.5">
                  <Clock aria-hidden className="h-3 w-3" />
                  Recently used
                </p>
                <ul className="space-y-0.5">
                  {recent.map((t) => (
                    <li key={toolKey(t)}>
                      <ToolLink tool={t} current={current} onNavigate={onNavigate} />
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <p className="side-heading">Categories</p>
            <ul className="space-y-0.5">
              {navCategories.map((c) => {
                const list = toolsIn(c.slug);
                const live = list.filter(isLive).length;
                const expanded = open.has(c.slug);
                const active = c.slug === currentCategory;
                const panelId = `side-cat-${c.slug}`;
                return (
                  <li key={c.slug}>
                    <button
                      type="button"
                      onClick={() => toggle(c.slug)}
                      aria-expanded={expanded}
                      aria-controls={panelId}
                      className={cn("side-link w-full font-medium", active ? "text-ink" : "text-ink-2")}
                    >
                      <span className={cn("side-icon", active && "side-icon-active")}>
                        <ToolIcon name={c.icon} className="h-[15px] w-[15px]" />
                      </span>
                      <span className="min-w-0 flex-1 truncate text-left">{c.title}</span>
                      {live ? <span className="text-[12px] font-normal text-muted tabular-nums">{live}</span> : <span className="side-badge">Soon</span>}
                      <ChevronDown aria-hidden className={cn("h-4 w-4 shrink-0 text-muted transition-transform duration-200", expanded && "rotate-180")} />
                    </button>
                    {expanded ? (
                      <div id={panelId} className="mt-0.5 mb-2 ml-[22px] border-l border-line pl-2">
                        <ul className="space-y-0.5">
                          {list.map((t) => (
                            <li key={t.slug}>
                              <ToolLink tool={t} current={current} onNavigate={onNavigate} compact />
                            </li>
                          ))}
                        </ul>
                        {live ? (
                          <Link href={categoryHref(c)} onClick={onNavigate} className="group mt-1 inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[13px] font-medium text-accent hover:bg-accent-soft">
                            View all {c.title}
                            <ArrowRight aria-hidden className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                          </Link>
                        ) : null}
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>

      <div className="shrink-0 border-t border-line p-2">
        <Link href="/tools" onClick={onNavigate} className="side-link text-ink-2">
          <span className="side-icon">
            <LayoutGrid aria-hidden className="h-[15px] w-[15px]" strokeWidth={1.75} />
          </span>
          <span className="flex-1">Browse all tools</span>
          <ArrowRight aria-hidden className="h-4 w-4 text-muted" />
        </Link>
      </div>
    </div>
  );
}

function ToolLink({ tool, current, onNavigate, compact = false, showCategory = false }: { tool: Tool; current: string; onNavigate?: () => void; compact?: boolean; showCategory?: boolean }) {
  const live = isLive(tool);
  const here = toolKey(tool) === current;
  const body = (
    <>
      {compact ? null : (
        <span className={cn("side-icon", here && "side-icon-active")}>
          <ToolIcon name={tool.icon} className="h-[15px] w-[15px]" />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block truncate">{tool.name}</span>
        {showCategory ? <span className="block truncate text-[12px] text-muted">{navCategories.find((c) => c.slug === tool.category)?.title}</span> : null}
      </span>
      {live ? null : <span className="side-badge">Soon</span>}
    </>
  );
  if (!live)
    return (
      <span className={cn("side-link cursor-default text-muted", compact && "side-link-compact")} title="Coming soon">
        {body}
      </span>
    );
  return (
    <Link href={toolHref(tool)} onClick={onNavigate} aria-current={here ? "page" : undefined} className={cn("side-link", compact && "side-link-compact", here ? "side-link-current" : "text-ink-2")}>
      {body}
    </Link>
  );
}

/* ——— placements ——— */

/** Desktop: a floating card that stays in view while the tool scrolls. */
export function ToolSidebar({ current }: { current: string }) {
  useEffect(() => rememberTool(current), [current]);
  return (
    <aside aria-label="All tools" className="hidden lg:block">
      <div className="side-card sticky top-24 h-[calc(100dvh-7.5rem)]">
        <ToolNav current={current} />
      </div>
    </aside>
  );
}

/** Small screens: a bar that opens the same list in a drawer. */
export function ToolNavDrawer({ current, categoryName }: { current: string; categoryName: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [shown, setShown] = useState(false);
  const close = () => ref.current?.close();

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => {
          setShown(true);
          ref.current?.showModal();
        }}
        className="flex w-full items-center gap-3 rounded-2xl border border-line bg-surface/85 px-3.5 py-2.5 text-left shadow-card backdrop-blur transition-colors hover:border-line-strong"
      >
        <span className="side-icon side-icon-active">
          <LayoutGrid aria-hidden className="h-[15px] w-[15px]" strokeWidth={1.75} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[14px] font-medium text-ink">Browse all {TOTAL} tools</span>
          <span className="block truncate text-[12px] text-muted">You’re in {categoryName}</span>
        </span>
        <Search aria-hidden className="h-4 w-4 text-muted" />
      </button>
      <dialog
        ref={ref}
        aria-label="All tools"
        onClose={() => setShown(false)}
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
        className="side-drawer"
      >
        <div className="flex h-full flex-col">
          <div className="flex shrink-0 items-center justify-between border-b border-line px-4 py-3">
            <p className="text-[15px] font-medium text-ink">All tools</p>
            <button type="button" onClick={close} aria-label="Close" className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-bg-subtle hover:text-ink">
              <X aria-hidden className="h-4 w-4" />
            </button>
          </div>
          <div className="min-h-0 flex-1">{shown ? <ToolNav current={current} onNavigate={close} /> : null}</div>
        </div>
      </dialog>
    </div>
  );
}
