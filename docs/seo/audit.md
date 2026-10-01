# SEO audit — October 2026

What was checked, what was changed, and what still needs a decision. Re-run the checks any time with `npm run seo:check` (catalog) and a build crawl (see "How this was checked").

## The project at a glance

- **Stack:** Next.js 16 App Router with `output: "export"`. Every page is static HTML, built once and served from Vercel's CDN. There's no server, database or API. Redirects and security headers are in `vercel.json`.
- **Content source:** one catalog (`src/lib/catalog`) drives:
  - routes and the sitemap
  - menus, the sidebar and search
  - titles, descriptions, canonicals and structured data
  - FAQs, related tools and the keyword map

  Blog metadata is in `src/lib/blog/posts.ts`.
- **Public URLs (75 indexable):**

  | Kind | Count | Pattern |
  |---|---|---|
  | Home | 1 | `/` |
  | All tools | 1 | `/tools` |
  | Categories with live tools | 11 | `/image-tools`, `/pdf-tools`, … |
  | Live tools | 58 | `/<category>/<tool>`, e.g. `/pdf-tools/merge` |
  | Blog index and articles | 1 + 4 | `/blog`, `/blog/<slug>` |
  | Site and trust pages | 7 | `/about`, `/contact`, `/faq`, `/how-it-works`, `/privacy-policy`, `/terms`, `/disclaimer` |

  Not indexable, by design:
  - the 404 page (`noindex`)
  - `/blog/page/1`, which 301s to `/blog`
  - `?q=` search URLs (blocked in robots.txt)
  - coming-soon tools and categories, which have no page

  The 41 legacy URLs (`/tools/<slug>`, `/categories/<x>`, `/privacy`) 301 to their current addresses.

## URL decision: keep `/<category>/<tool>`

Every slug was checked against how the tool is searched. Top-ranking pages use the plain search phrase (vidIQ's `/youtube-thumbnail-downloader/`, "Text Compare", "Merge PDF"). The current URLs already contain that phrase across the category and tool segments: `/youtube-tools/thumbnail-downloader`, `/pdf-tools/merge`, `/image-tools/compressor`.

The structure stays as it is:

- **Hierarchy helps.** Breadcrumbs, Search Console reports per folder and category hub pages all rely on it, and it scales to hundreds of tools without slug collisions (`/youtube-tools/title-generator` and `/ai-tools/title-generator` can both exist).
- **The gain from flattening is tiny.** Words in URLs are a very small ranking signal. Moving 58 URLs to a flat structure (e.g. `/youtube-thumbnail-downloader`) would mean 58 redirects for, at best, a marginal gain.

**Needs your decision:** if you'd still prefer flat URLs, do it **before** the site is indexed. Afterwards, every change costs a redirect and some temporary ranking churn. I recommend keeping the current structure.

## What was fixed

| Area | Problem found | Fix |
|---|---|---|
| Canonicals and sitemap | The local `.env` set `NEXT_PUBLIC_SITE_URL` to `http://localhost:3210`, so every locally built canonical, sitemap URL and OG tag pointed to localhost | Commented out in `.env`. A production build now warns if the site URL is localhost. Builds use `https://onlinetoolpro.com` |
| Titles | Most tool, category and blog titles were over 60 characters with the brand suffix, so Google would truncate them | Every title rewritten keyword-first and ≤ 60 characters. The brand suffix is added only when it fits (`brandedTitle` in `src/lib/seo.ts`) |
| Title wording | Some titles didn't use the phrase people search | "Merge PDF Files Online…", "Split PDF Online…", "UTM Builder…", "List Randomizer & Random Name Picker…" |
| Descriptions | 11 tool descriptions outside 110–160 characters, plus long blog and short trust-page descriptions | Rewritten to stay accurate and specific |
| Homepage | Generic title; the FAQ said image, PDF and developer tools were "on the way" when they're live | Title "Free Online Tools for Everyday Tasks", a description and intro naming the categories, and a corrected FAQ (plus "Who are the tools for?") |
| Spelling | "Colour" in names and titles on an `en_US` site whose URLs use `/color-tools` | US spelling throughout. Site search maps British spellings ("colour", "grey", "analyse") to the same tools |
| Thin content | 41 tool pages had about 150 words of unique copy and 1–2 FAQs | Tool-specific "Good to know" sections and extra FAQs for all 41 (`src/lib/catalog/tools/help.ts`), checked against what each tool actually does |
| Social images | Trust pages and `/tools` had no OG image. The site image was served without a file extension | `/og.png` site image on every page without its own; Twitter card tags everywhere |
| 404 | Same title as the homepage, no `noindex`, a dead end | `noindex` plus its own title, search, popular tools and every category. Fixed a hydration error on 404 pages |
| Headings | About, legal and blog pages jumped from H1 to H3 | Correct H2s; same visual style |
| Performance | Every tool page downloaded **every** tool's code (pdf-lib, qrcode and charts for unreleased tools): 456 KB gzipped JS. Every page also downloaded the full catalog text (48 KB gzipped) | Each interface now loads as its own chunk (`src/tools/mounts.tsx`). Unreleased tools aren't bundled. The browser gets a trimmed catalog. Tool pages are now about **235 KB gzipped (−48%)**; the remaining ~156 KB is React and Next.js |
| Mobile | The homepage and the gradient generator scrolled sideways at 375px | Grids constrained (`grid-cols-1` base, `minmax(0,1fr)`). No horizontal scroll on any tested page |
| Keyword cannibalization | No mechanism to prevent it | Each tool and article has a unique `primaryKeyword`. `npm run seo:check` fails on duplicates and writes `docs/seo/keyword-map.md` |

## Already in good shape (verified, not changed)

- Every indexable page has a unique title, description and self-referencing absolute canonical.
- robots.txt allows everything except `/api/` and `?q=` URLs and points to the sitemap. CSS and JS aren't blocked.
- The sitemap contains only live, indexable, canonical URLs and updates automatically when a tool goes live.
- Every page is server-rendered static HTML, so Google doesn't need JavaScript to read content or links.
- Structured data matches visible content:
  - `WebSite` + `Organization` (home)
  - `CollectionPage` + `BreadcrumbList` (categories)
  - `WebApplication` + `BreadcrumbList` (tools)
  - `BlogPosting` + `BreadcrumbList` (articles)
  - `FAQPage` only where the FAQs are visible
- There are no fake ratings, reviews or authors.
- Every tool links to related tools, its category, guides, and previous/next tools. The sidebar lists the whole catalog, and nothing is orphaned.
- **Security:**
  - no secrets in client code (the only public env vars are feature flags and the site URL)
  - JSON-LD is escaped
  - the HTML entity decoder uses a detached textarea, so pasted markup is never executed
  - affiliate links use `rel="sponsored nofollow noopener"`

## Frontend-only vs backend

**All 58 live tools run entirely in the browser.** The only external request is the thumbnail downloader loading public images from `i.ytimg.com`.

These 20 are listed as "Coming soon", aren't linked, and have no page:

| Tools | Why not live | Needs |
|---|---|---|
| YouTube: channel ID finder, metadata extractor, tag extractor, SEO checker, channel audit, channel/competitor tracker, video comparison, content gap finder | Need YouTube Data API data | Backend + API key (code kept in `backend-archive/`) |
| YouTube title generator, thumbnail generator; AI: summarizer, paraphraser, grammar checker, background remover, caption generator, title generator | Need an AI model | Backend + model API, or in-browser models (large downloads) |
| PDF compressor | Real compression needs re-encoding embedded images (e.g. Ghostscript) | Server, or a large WebAssembly build |
| Social media: hashtag counter, bio formatter | **Not a technical limit — these can run in the browser** | Just need building. Quick wins that would also make the Social Media category live |

## Monetization readiness

- Ad slots are reserved in the layout (top banner, in-content, bottom) but render nothing until `NEXT_PUBLIC_SHOW_AD_SLOTS=true`, so there are no empty boxes and no layout shift today.
- No ad sits inside or above a tool's controls.
- **Before turning on AdSense:**
  - give each slot a fixed `min-height` matching the ad size, to avoid CLS
  - add a Google-certified consent banner (CMP), which Google requires for visitors in the EEA, UK and Switzerland
  - update the Privacy Policy's advertising section to name the network
- Recommendation: wait until the site has steady organic traffic. Early ads earn little and can hurt engagement signals.

## Not done here (needs data or your accounts)

- **Search volumes:** there's no keyword-tool access here. Primary keywords were chosen from search-result research and phrasing; confirm them in Search Console once there's data (see the checklist).
- **Search Console and indexing:** not verified. See `docs/seo/search-console-checklist.md`.
- **Lab Core Web Vitals:** JS weight was measured, but Lighthouse wasn't run against the deployed site. Check PageSpeed Insights after deploy.

## How this was checked

1. `npm run build`, then a script parsed every HTML file in `out/`:
   - title, description, canonical, robots, H1 count and heading order
   - OG and Twitter tags, JSON-LD types, image alt text
   - inbound internal links and word count
2. JS per page was measured from the script tags in each HTML file.
3. Pages were tested in headless Chrome at 375px for horizontal overflow and hydration errors, and the functional test suite was run against the static build.
4. `npm run seo:check` checked catalog titles, descriptions, keywords and related links.
