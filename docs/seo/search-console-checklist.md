# Google Search Console checklist

Nothing here has been verified against a live Search Console account. The code is ready; these steps have to be done by hand after deploying.

## Before the first deploy

- [ ] **Don't set `NEXT_PUBLIC_SITE_URL` on Vercel** (or set it to exactly `https://onlinetoolpro.com`). Every canonical, the sitemap and social tags come from it. A production build that points at localhost prints a warning.
- [ ] Run `npm run build` and `npm run seo:check`. Both must pass.

## Domain setup (Vercel → Project → Settings → Domains)

- [ ] Add `onlinetoolpro.com` as the primary domain.
- [ ] Add `www.onlinetoolpro.com` and set it to **redirect (308) to `onlinetoolpro.com`**. The site's canonicals use the bare domain without `www`, so both must agree.
- [ ] Confirm `http://` redirects to `https://` (Vercel does this automatically).
- [ ] Spot-check: `curl -I https://www.onlinetoolpro.com/pdf-tools/merge` should return one redirect, straight to `https://onlinetoolpro.com/pdf-tools/merge`. There should be no chains.

## Search Console

- [ ] Add a **Domain property** for `onlinetoolpro.com`, verified with a DNS TXT record at your registrar. This covers http/https and www in one property.
- [ ] **Sitemaps** → submit `https://onlinetoolpro.com/sitemap.xml`. Expect about 75 URLs: tools, categories, articles and site pages.
- [ ] **URL Inspection** → test a few live URLs: `/`, `/tools`, `/image-tools`, `/pdf-tools/merge`, `/developer-tools/json-formatter`, and one blog post. Check:
  - "URL is available to Google"
  - the user-declared canonical equals the URL itself
  - the rendered screenshot shows the tool and the text below it
- [ ] Request indexing for the homepage and the category pages. The rest will be found through the sitemap and internal links.
- [ ] Open the robots.txt report and confirm it fetched `https://onlinetoolpro.com/robots.txt`. It only blocks `/api/` and `?q=` search-result URLs.

## Structured data

- [ ] Run a tool page and a blog post through the [Rich Results Test](https://search.google.com/test/rich-results) and the [Schema Markup Validator](https://validator.schema.org/). Expect `BreadcrumbList`, `WebApplication` and `BlogPosting` with no errors.
- FAQ markup (`FAQPage`) stays on pages because the questions are visible there and other search engines and AI assistants read it. **Google stopped showing FAQ rich results on 7 May 2026**, so don't expect them in Google, and don't treat their absence as an error.

## Social previews

- [ ] Paste a tool URL into the [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/) or an X post draft. The image should be the page's own `og.png`.

## After 2–4 weeks

- [ ] **Pages report**: look for "Crawled – currently not indexed" and "Discovered – not indexed". For a new domain these are normal at first. If a tool page stays out for weeks, improve its unique content (`src/lib/catalog/tools/help.ts`) and internal links before requesting indexing again.
- [ ] **Duplicate, Google chose different canonical**: should not happen. If it does, check the `www` and trailing-slash redirects.
- [ ] **Core Web Vitals** (needs real traffic): mobile LCP under 2.5 s, INP under 200 ms, CLS under 0.1.
- [ ] **Performance → Queries**: compare the queries each page actually gets with its `primaryKeyword` in `docs/seo/keyword-map.md`. Adjust titles and descriptions toward the wording real people use, and re-run `npm run seo:check`.

## Bing

- [ ] Import the Search Console property into [Bing Webmaster Tools](https://www.bing.com/webmasters) (one click). Bing also powers several AI search products.
