---
name: design-system
description: OnlineToolPro visual design system — tokens, type scale, backdrops, and the page layouts (tool page with sidebar, category, homepage). Use before building or restyling any page or component.
---

# OnlineToolPro design system

Clean, minimal, MetaView-inspired. Light mode is the default; dark mode is a
first-class theme. Everything lives in `src/app/globals.css` (tokens + component
classes) and is exposed to Tailwind through `@theme inline`.

## Colour tokens (use the Tailwind names, never raw hex)

| Token | Use |
| --- | --- |
| `bg`, `bg-subtle`, `surface`, `surface-2` | Page, soft fills, cards, insets |
| `ink`, `ink-2`, `muted`, `faint` | Text, from strongest to weakest |
| `line`, `line-strong` | Borders (default / hover) |
| `accent`, `accent-soft` | Green accent (#1f7a58, dark #6fe3a3) and its wash — links, current item, icons |
| `cta`, `cta-ink` | Green-black primary button (#0a2119, inverted in dark mode) |
| `mint` | #7afab2 highlight (PRO badge, glows) |
| `success/warning/danger(-soft)` | Status only |

Shadows: `shadow-card`, `shadow-raised`, `shadow-float`.

## Type

`.display` (homepage hero) · `.h1` (static pages) · `.tool-title` (tool pages, beside
the sidebar) · `.h2 .h3 .h4` · `.lead` · `.eyebrow` (small uppercase accent label) ·
`.prose-tool` / `.prose-article` for long copy (opt out with `.not-prose`).
Headings are weight 500 with tight negative tracking.

## Backdrops — every page gets its own

- Tints: `mint | sky | sand | mist | aqua` → `.tint-*` sets `--tint-1..3`, `--tint-ink`.
- Patterns: `strings grid dots rings waves rays diagonal arcs plus`.
- `<Backdrop spec={...} />` (`src/components/visual/backdrop.tsx`): absolute, `-z-10`,
  reaches 80px up under the floating header, fades into `bg`. Parent needs `relative isolate`.
- `<BackdropPanel>` — the same art inside a card (demos, spotlights).
- Tools get theirs from `toolBackdrop(tool)`; static pages from `PageBackdrop`.

## Containers

- `.container-page` — 1200px, for content pages.
- `.container-app` — 1600px wide. Used by tool pages (sidebar + tool), which benefit from the extra room; wider than the header card on large screens by design.

## Tool page layout (`src/components/tool/tool-page.tsx`)

Modelled on 10015.io tool pages, in our visual language:

```
┌ header (floating card) ─────────────────────────────────────┐
├ sidebar (264px, sticky) ┬ content ──────────────────────────┤
│ Find a tool  [/]        │ Breadcrumb                        │
│ Recently used           │ [icon] Tool title                 │
│ Categories ▾            │        description                │
│   current category open │ ✓ 100% free  ✓ notes              │
│   ▌current tool         │ ┌ tool interface ───────────────┐ │
│   View all …            │ └───────────────────────────────┘ │
│ Browse all tools        │ ← Previous tool   Next tool →     │
└─────────────────────────┴ About · How it works · Uses ·     │
                            Good to know · FAQ · Guides ·     │
                            Related · Category card           │
```

- Sidebar: `ToolSidebar` (desktop, `lg+`) and `ToolNavDrawer` (below `lg`: a
  "Browse all N tools" bar that opens a left drawer `<dialog>`). Both render `ToolNav`.
- Sidebar classes: `.side-card` (frosted floating card), `.side-heading`,
  `.side-link` (+ `.side-link-compact` for nested tools, `.side-link-current` for
  `aria-current="page"`), `.side-icon` (+ `.side-icon-active`), `.side-badge` ("Soon"),
  `.side-scroll`, `.side-drawer`.
- Coming-soon tools and categories are visible but never links (`Soon` badge).
- `/` focuses the sidebar filter; ⌘K / Ctrl+K opens site search.
- Recently used tools are kept in `localStorage` (`otp:recent-tools`) — a per-browser
  convenience only; everything works without it. `useRecentTools()` reads them;
  `RecentToolChips` shows them on the homepage.
- `ToolPager` — previous/next tool in sidebar order.
- Inner two-column blocks (about, good-to-know, FAQ) switch to two columns at `xl`,
  since the content column is narrower than the page.

## Components and patterns

- Cards: `rounded-2xl`/`rounded-3xl`, `border border-line bg-surface`, hover `border-line-strong`.
- Chips: `.chip`, `.chip-active`.
- Icon tiles: `ToolIconTile` (`neutral | accent | tint`), icons from `src/components/tool-icon.tsx` (lucide, stroke 1.75).
- Tool UI kit: `src/components/kit` (Panel, TwoPane, FileDrop, OutputBox, Choice, Toggle, Slider, DownloadButton…).
- Motion: short (150–250ms), `cubic-bezier(0.2, 0.7, 0.2, 1)`; respect `prefers-reduced-motion`.
- Mobile: 16px gutters, no horizontal scroll, tap targets ≥ 34px.
