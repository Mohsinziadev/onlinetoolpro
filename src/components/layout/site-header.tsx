"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { SearchDialog } from "@/components/layout/search-dialog";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ToolIconTile } from "@/components/tool-icon";
import { BackdropPanel } from "@/components/visual/backdrop";
import { companyLinks, legalLinks, resourceLinks } from "@/lib/nav";
import { KIND_LABEL, latestPosts, postHref } from "@/lib/blog/posts";
import { activeCategories, categoryHref, getCategory, getTool, liveCount, newTools, popularTools, toolHref, upcomingCategories } from "@/lib/catalog";
import { toolBackdrop, categoryBackdrop } from "@/lib/catalog/visuals";
import { cn, toolCount } from "@/lib/utils";

type MenuId = "tools" | "categories" | "blog" | "resources";

const MENUS: { id: MenuId; label: string }[] = [
  { id: "tools", label: "Tools" },
  { id: "categories", label: "Categories" },
  { id: "blog", label: "Blog" },
  { id: "resources", label: "Resources" },
];

/* ——— mega-panel building blocks ——— */

function Column({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn("p-7", className)}>
      <p className="text-[13px] text-muted">{label}</p>
      <div className="mt-5">{children}</div>
    </div>
  );
}

function PanelItem({
  href,
  title,
  description,
  icon,
  onPick,
}: {
  href: string;
  title: string;
  description?: string;
  icon?: ReactNode;
  onPick: () => void;
}) {
  return (
    <Link href={href} onClick={onPick} className="group/item -mx-2 flex items-start gap-3.5 rounded-xl p-2 transition-colors hover:bg-bg-subtle">
      {icon}
      <span className="min-w-0">
        <span className="block text-[16px] leading-snug text-ink transition-colors group-hover/item:text-ink">{title}</span>
        {description ? <span className="mt-0.5 block text-[13px] leading-snug text-muted">{description}</span> : null}
      </span>
    </Link>
  );
}

function Featured({ href, onPick, children, caption }: { href: string; onPick: () => void; children: ReactNode; caption: ReactNode }) {
  return (
    <Column label="Featured" className="bg-bg-subtle">
      <Link href={href} onClick={onPick} className="group/feat block">
        <div className="overflow-hidden rounded-xl border border-line transition-shadow group-hover/feat:shadow-raised">{children}</div>
        <p className="mt-3 text-[15px] leading-snug text-ink">{caption}</p>
      </Link>
    </Column>
  );
}

function MenuPanel({ id, close }: { id: MenuId; close: () => void }) {
  if (id === "tools") {
    const featured = getTool("youtube", "thumbnail-downloader") ?? popularTools(1)[0];
    return (
      <div className="grid grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_280px] divide-x divide-line">
        <Column label="Popular">
          <div className="grid grid-cols-2 gap-x-5 gap-y-1">
            {popularTools(6).map((t) => (
              <PanelItem
                key={`${t.category}/${t.slug}`}
                href={toolHref(t)}
                title={t.name}
                description={getCategory(t.category)?.name}
                icon={<ToolIconTile name={t.icon} tone="tint" tint={toolBackdrop(t).tint} />}
                onPick={close}
              />
            ))}
          </div>
        </Column>
        <Column label="Recently added">
          <div className="space-y-1">
            {newTools(4).map((t) => (
              <PanelItem key={`${t.category}/${t.slug}`} href={toolHref(t)} title={t.name} description={getCategory(t.category)?.name} onPick={close} />
            ))}
          </div>
          <Link href="/tools" onClick={close} className="mt-4 inline-flex items-center gap-1 text-[14px] font-medium text-accent hover:underline">
            Browse all tools <ArrowUpRight aria-hidden className="h-3.5 w-3.5" />
          </Link>
        </Column>
        {featured ? (
          <Featured href={toolHref(featured)} onPick={close} caption={<>Try the {featured.name} — free, in seconds.</>}>
            <BackdropPanel spec={toolBackdrop(featured)} className="flex aspect-[16/9] items-center justify-center">
              <ToolIconTile name={featured.icon} size="lg" tone="tint" tint={toolBackdrop(featured).tint} className="bg-surface shadow-card" />
            </BackdropPanel>
          </Featured>
        ) : null}
      </div>
    );
  }

  if (id === "categories") {
    const featured = getCategory("youtube") ?? activeCategories[0];
    return (
      <div className="grid grid-cols-[minmax(0,2fr)_280px] divide-x divide-line">
        <Column label="Tool categories">
          {/* Only categories that actually have tools. */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
            {activeCategories.map((c) => (
              <PanelItem
                key={c.slug}
                href={categoryHref(c)}
                title={c.title}
                description={`${toolCount(liveCount(c.slug))} · ${c.description}`}
                icon={<ToolIconTile name={c.icon} tone="tint" tint={categoryBackdrop(c).tint} />}
                onPick={close}
              />
            ))}
          </div>
          {upcomingCategories.length ? (
            <p className="mt-6 border-t border-line pt-4 text-[13px] text-muted">Coming later: {upcomingCategories.map((c) => c.name).join(", ")}.</p>
          ) : null}
        </Column>
        {featured ? (
          <Featured href={categoryHref(featured)} onPick={close} caption={<>{featured.title}: {toolCount(liveCount(featured.slug), "free")}, no sign-up.</>}>
            <BackdropPanel spec={categoryBackdrop(featured)} className="flex aspect-[16/9] items-center justify-center">
              <ToolIconTile name={featured.icon} size="lg" tone="tint" tint={categoryBackdrop(featured).tint} className="bg-surface shadow-card" />
            </BackdropPanel>
          </Featured>
        ) : null}
      </div>
    );
  }

  if (id === "blog") {
    const [lead, ...rest] = latestPosts(4);
    return (
      <div className="grid grid-cols-[minmax(0,2fr)_280px] divide-x divide-line">
        <Column label="Latest guides">
          <div className="space-y-1">
            {rest.map((p) => (
              <PanelItem key={p.slug} href={postHref(p)} title={p.title} description={`${KIND_LABEL[p.kind]} · ${p.readingMinutes} min read`} onPick={close} />
            ))}
          </div>
          <Link href="/blog" onClick={close} className="mt-4 inline-flex items-center gap-1 text-[14px] font-medium text-accent hover:underline">
            All guides <ArrowUpRight aria-hidden className="h-3.5 w-3.5" />
          </Link>
        </Column>
        {lead ? (
          <Featured href={postHref(lead)} onPick={close} caption={lead.title}>
            <BackdropPanel spec={{ pattern: "waves", tint: "sand" }} className="flex aspect-[16/9] items-center justify-center">
              <span className="rounded-full bg-surface px-3 py-1.5 text-[13px] font-medium text-ink shadow-card">{KIND_LABEL[lead.kind]}</span>
            </BackdropPanel>
          </Featured>
        ) : null}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_280px] divide-x divide-line">
      <Column label="Learn">
        <div className="space-y-1">
          {resourceLinks.map((l) => (
            <PanelItem key={l.href} href={l.href} title={l.label} description={l.description} onPick={close} />
          ))}
        </div>
      </Column>
      <Column label="Company">
        <div className="space-y-1">
          {[...companyLinks, ...legalLinks].map((l) => (
            <PanelItem key={l.href} href={l.href} title={l.label} description={l.description} onPick={close} />
          ))}
        </div>
      </Column>
      <Featured href="/how-it-works" onPick={close} caption="Every tool is free. No sign-up, no limits.">
        <BackdropPanel spec={{ pattern: "waves", tint: "mint" }} className="flex aspect-[16/9] items-center justify-center">
          <span className="rounded-full bg-surface px-4 py-2 text-[15px] font-medium text-ink shadow-card">100% free</span>
        </BackdropPanel>
      </Featured>
    </div>
  );
}

/* ——— header ——— */

/**
 * Floating header card. On desktop a menu opens on hover or click and expands the
 * card into a mega-panel. Any click on an item, a route change, Escape or a click
 * outside closes it.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const panelId = useId();
  const cardRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number | undefined>(undefined);
  // A menu belongs to the page it was opened on, so navigating closes it.
  const [state, setState] = useState<{ menu: MenuId; path: string } | null>(null);
  const open = state && state.path === pathname ? state.menu : null;

  const openMenu = (menu: MenuId) => {
    window.clearTimeout(closeTimer.current);
    setState({ menu, path: pathname });
  };
  const close = () => {
    window.clearTimeout(closeTimer.current);
    setState(null);
  };
  const closeSoon = () => {
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setState(null), 140);
  };

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setState(null);
    }
    function onDown(e: MouseEvent) {
      if (!cardRef.current?.contains(e.target as Node)) setState(null);
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [open]);

  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  return (
    <header className="sticky top-0 z-40 h-20 px-3 pt-3 sm:px-4">
      <div
        ref={cardRef}
        onMouseLeave={closeSoon}
        onMouseEnter={() => window.clearTimeout(closeTimer.current)}
        className={cn(
          "mx-auto max-w-[1232px] overflow-hidden rounded-[28px] border transition-[background-color,border-color,box-shadow] duration-200",
          open
            ? "border-line bg-surface shadow-float"
            : "border-line/60 bg-surface/80 shadow-[0_1px_2px_rgb(0_8_5/0.04),0_8px_24px_-16px_rgb(0_8_5/0.18)] backdrop-blur-xl",
        )}
      >
        <div className="flex h-14 items-center gap-8 pr-2 pl-5 sm:pl-6">
          <Logo />

          <nav aria-label="Main" className="hidden lg:block">
            <ul className="flex items-center gap-7">
              {MENUS.map((m) => {
                const isOpen = open === m.id;
                return (
                  <li key={m.id}>
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={isOpen ? panelId : undefined}
                      onMouseEnter={() => openMenu(m.id)}
                      onClick={() => (isOpen ? close() : openMenu(m.id))}
                      className={cn(
                        "inline-flex h-10 items-center gap-1 text-[16px] font-medium transition-colors",
                        isOpen ? "text-muted" : "text-ink hover:text-muted",
                      )}
                    >
                      {m.label}
                      <ChevronDown aria-hidden className={cn("h-3.5 w-3.5 transition-transform duration-200", isOpen && "rotate-180")} strokeWidth={2} />
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <SearchDialog variant="plain" />
            <ThemeToggle />
            <Link
              href="/tools"
              onClick={close}
              className="ml-1 hidden h-10 items-center gap-1.5 rounded-full bg-cta px-5 text-[15px] font-medium text-cta-ink transition-colors hover:bg-cta-hover sm:inline-flex"
            >
              Start for free
              <ArrowUpRight aria-hidden className="h-4 w-4" />
            </Link>
            <MobileNav />
          </div>
        </div>

        {open ? (
          <div id={panelId} className="hidden animate-fade-in border-t border-line lg:block">
            <MenuPanel id={open} close={close} />
          </div>
        ) : null}
      </div>
    </header>
  );
}
