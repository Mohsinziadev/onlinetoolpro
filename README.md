# OnlineToolPro — Free Online Tools (onlinetoolpro.com)

A growing platform of simple, free online tools. **Everything runs in the browser**: the site is a
static export with no server, API routes or database, so it deploys to Vercel (or any static host)
as plain files. The brand name lives in one place: `src/lib/site.ts`.

Built with Next.js 16 (App Router, `output: "export"`), TypeScript and Tailwind CSS v4. Client-side
libraries: `pdf-lib` (PDF tools) and `qrcode` (QR codes), both loaded only on the pages that use them.

## Deploying to Vercel

1. Push the repo and import it in Vercel — the Next.js preset is detected automatically.
2. Set `NEXT_PUBLIC_SITE_URL` to your production URL (used for canonical links, the sitemap and social images).
3. Deploy. `npm run build` writes the whole site to `out/`; redirects and security headers come from `vercel.json`.

No other environment variables, API keys or databases are needed. To preview the production build
locally: `npm run build && npm start` (serves `out/`).

## How tools work without a backend

| Technique | Used by |
|---|---|
| Plain JavaScript on text you paste | text tools, JSON/URL/Base64/HTML/regex/JWT tools, generators, calculators |
| Web Crypto API | hash generator (SHA family), passwords, UUIDs, randomizers |
| Canvas API | image compressor, resizer, cropper, converter, colour extractor, SVG to PNG, thumbnail tools |
| `pdf-lib` in the browser | PDF merger, splitter, images to PDF |
| Public images with CORS | YouTube thumbnail downloader (YouTube's image server allows browser downloads) |

Tools that need a server (the YouTube Data API or a database) are listed as **Coming soon**: channel
checker and tracker, channel comparison, video comparison, video idea finder, channel ID finder,
metadata and tag extractors, SEO checker, PDF compressor. Their code is kept, and the server side is
preserved in [`backend-archive/`](backend-archive/README.md) for when a backend is added.

## Adding tools and categories

Everything — header menus, mobile menu, footer, homepage, category pages, `/tools`, site search,
related tools, breadcrumbs, sitemap and social images — is generated from the catalog in `src/lib/catalog/`.

**New tool**
1. Add an entry to `src/lib/catalog/tools/*.ts`: name, slug, category, plain-language `description`,
   icon, `status`, and the page content fields `about` ("What is this tool?"), `useCases`, `steps`,
   `updatedAt`, a unique `primaryKeyword`, plus optional `popular` / `featured` / `group` / `related` /
   `keywords` / `metaTitle` (≤ 60 characters) / `metaDescription` (110–160 characters).
2. If it's live, write its interface component (browser-only — no server calls), then:
   - add its key to `src/tools/keys.ts` and one `dynamic(...)` line to `src/tools/mounts.tsx`
     (this keeps each tool in its own chunk — never import an interface directly from a page), and
   - put its "Good to know" notes and extra FAQs in `src/lib/catalog/tools/help.ts`, or, for custom
     page copy, create `src/tools/<category>/<slug>.tsx` (`<ToolPage>` + `<ToolMount id="…" />`) and
     add one line to `src/tools/registry.ts`.
   - Run `npm run seo:check` — it catches duplicate keywords/titles and long titles, and
     regenerates `docs/seo/keyword-map.md`.
3. Optional: an animated "How it works" scene in `src/components/demos/scenes/` + a line in
   `src/components/demos/registry.tsx` (otherwise a generic demo is used).

A tool with `status: "coming-soon"` is listed (not linked) and has no page.

**New category** — add one entry to `src/lib/catalog/categories.ts` with its public `path`
(e.g. `image-tools`). It gets a page, menu entries and a sitemap entry as soon as it has a live tool;
until then it only appears as "coming later" text, so there are no thin placeholder pages.

## URLs

```
/                                   homepage
/tools                              every tool, searchable
/<category path>                    /youtube-tools, /text-tools …
/<category path>/<tool slug>        /youtube-tools/thumbnail-downloader
/blog, /blog/page/<n>               guides (pagination starts after 12 articles)
/blog/<slug>                        /blog/how-to-download-youtube-thumbnail
/about /contact /faq /how-it-works /privacy-policy /terms /disclaimer
```

Older URLs (`/tools/<slug>`, `/tools/<category>/<tool>`, `/privacy`) 308-redirect — see `next.config.ts`.

## Adding an article

1. Metadata in `src/lib/blog/posts.ts` — title, `description`, `cluster`, `kind`, dates, one
   `primaryKeyword` (never shared with another page), `relatedTools`, optional `relatedPosts`.
2. Body in `src/content/blog/<slug>.tsx` exporting a `PostContent` (`quickAnswer`, `intro`,
   `sections`, `faqs`) — use `ToolCta`, `DataTable`, `Steps`, `Callout`, `Figure` from
   `src/components/blog/content.tsx`.
3. One line in `src/content/blog/index.ts`.

The article then appears on the blog, its category page, the homepage, in search, and under
"Related guides" on every tool in `relatedTools`. The editorial plan is in
[`docs/seo/content-roadmap.md`](docs/seo/content-roadmap.md).

## Monetization (all off by default)

| Setting | Effect |
|---|---|
| `NEXT_PUBLIC_SHOW_AD_SLOTS=true` | Shows the reserved ad spaces (top banner, in-content, sidebar, bottom). Wire the ad unit into `src/components/ad-placeholder.tsx`. Ads are never placed inside a tool. |
| `NEXT_PUBLIC_AFFILIATES=true` | Enables `<AffiliateCard>` recommendations from `src/lib/monetization.ts` (labelled, `rel="sponsored nofollow"`). |
| `NEXT_PUBLIC_NEWSLETTER_ACTION=<url>` | Shows the newsletter signup (end of articles) posting to your provider. |
| `access: "premium"` on a tool | Marks a tool as premium in the catalog (for a future paid tier). |

Update the privacy policy before switching on ads or affiliates.

---

## Project structure

```
src/
  app/                      routes: /, /tools, /[category], /[category]/[tool], /blog, legal pages,
                            sitemap.ts, robots.ts, og.png image routes
  components/
    kit/                    shared building blocks for browser tools (panels, file drop, outputs…)
    tools/                  browser tool interfaces: text, developer, design (color + CSS), image, pdf, misc
    tool/                   ToolPage template, cards, search results, how-it-works demo
    demos/                  animated "How it works" scenes
    youtube/, thumbnail/, calculators/, utilities/, audience/   YouTube tool interfaces
    blog/, layout/, search/, visual/, monetization/
  content/blog/             article bodies
  lib/
    catalog/                categories, tools, search, demo scripts, visual identity
    blog/                   article metadata, authors
    color.ts, md5.ts, timestamps.ts, image/, text/, youtube/{parse,types,writing}.ts
  tools/
    keys.ts                 every live tool with an interface
    mounts.tsx              lazy-loads each interface as its own chunk
    registry.ts             tools with a custom page module
    registry-upcoming.ts    page modules for coming-soon tools (not bundled)
backend-archive/            server code kept for a future backend (not built)
docs/seo/                 content roadmap, keyword map, SEO audit, Search Console checklist
scripts/seo-check.ts      catalog SEO checks (npm run seo:check)
vercel.json                 redirects + security headers
```

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Static export to `out/` |
| `npm start` | Serve `out/` locally |
| `npm run lint` / `npm run typecheck` | Checks |

