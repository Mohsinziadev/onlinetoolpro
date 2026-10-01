# Content roadmap

How the blog grows alongside the tools. Every article must answer a real question better than what already ranks, and link naturally to the tool that solves it.

> **No search volumes are listed.** Nothing here was checked in a keyword tool. Before writing each article, confirm demand and look at the current results in a keyword research tool (Google Search Console once the site has data, plus a tool such as Ahrefs, Semrush or Google Keyword Planner). Priorities below are based on search intent, fit with existing tools, and internal-linking value — not on volume.

---

## How the site is structured for search

```
Category page (/youtube-tools)              ← "youtube tools", category-level searches
  ├─ Pillar guide (/blog/…complete-guide…)  ← broad "how do I…" topic, links to everything below
  ├─ Supporting articles (/blog/…)          ← one specific question each
  └─ Tool pages (/youtube-tools/…)          ← "… downloader / generator / checker / calculator"
```

Every supporting article links **up** to its pillar and category, **across** to 1–3 sibling articles, and **down** to the tool that does the job. Every tool page links back to its guides automatically (the "Related guides" section reads `relatedTools` from each article's metadata).

### One query, one page

Tool pages target the **"do it"** query; articles target the **"how / why / what"** query. They must not compete:

| Tool page targets | Article targets instead |
|---|---|
| youtube thumbnail downloader | how to download a youtube thumbnail · youtube thumbnail url |
| youtube video id finder | how to find a youtube video id |
| youtube channel id finder | how to find a youtube channel id |
| youtube embed code generator | how to embed a youtube video on a website |
| youtube timestamp generator | how to add chapters to youtube videos |
| youtube tag extractor | how to see youtube tags · do youtube tags matter |
| youtube hashtag generator | youtube hashtag rules / limits |
| youtube description generator | how to write a youtube description |
| youtube seo checker | youtube seo for beginners · how long should a youtube title be |
| youtube money / earnings calculator | how much does youtube pay per 1,000 views |
| youtube rpm calculator / cpm calculator | youtube rpm vs cpm |
| watch time calculator | how to calculate youtube watch hours |

If two planned articles would answer the same query, merge them.

---

## Already published

| Article | Primary keyword | Tool it supports |
|---|---|---|
| YouTube Thumbnail Downloader: How to Download YouTube Thumbnails in Full Size | how to download youtube thumbnail | Thumbnail Downloader |
| Which YouTube Metrics Are Public | public youtube metrics | Channel Checker |
| How to Check Whether a Thumbnail Still Reads at Small Sizes | youtube thumbnail readability | Thumbnail Text Tester |
| RPM vs CPM on YouTube | youtube rpm vs cpm | RPM / CPM calculators |

---

## Next up: image, PDF, text and developer clusters

Added October 2026, when those categories went live. Write these **before** the remaining YouTube articles: they support tools people use every week, not just creators.

Be realistic about head terms. "image compressor", "merge pdf" and "json formatter" are dominated by long-established sites (iLovePDF, Smallpdf, TinyPNG, jsonformatter.org). A new site wins first on **specific questions**, where a precise answer plus a tool that runs privately in the browser beats a generic page. The tool pages keep targeting the head term; these articles target the questions around it.

| # | Article | Primary keyword | Type | Links to | Priority |
|---|---|---|---|---|---|
| 1 | How to Reduce Image File Size Without Losing Quality | reduce image file size | How-to | Image Compressor, Image Resizer | P1 |
| 2 | How to Compress a JPG to Under 100 KB (or Any Size Limit) | compress jpg to 100kb | How-to | Image Compressor | P1 |
| 3 | WebP vs JPG vs PNG: Which Image Format Should You Use? | webp vs jpg vs png | Comparison | Image Converter | P1 |
| 4 | How to Combine PDF Files Without Uploading Them | combine pdf files without uploading | How-to | PDF Merger | P1 |
| 5 | How to Extract Pages From a PDF | extract pages from pdf | How-to | PDF Splitter | P2 |
| 6 | How to Turn Phone Photos Into a PDF | photos to pdf | How-to | Images to PDF, Image Cropper | P2 |
| 7 | Common JSON Errors and How to Fix Them | json errors | Troubleshooting | JSON Formatter | P1 |
| 8 | What Is a JWT? How to Read One Safely | what is a jwt | Explainer | JWT Decoder, Base64 | P2 |
| 9 | Unix Timestamps Explained (Seconds, Milliseconds, Time Zones) | unix timestamp explained | Explainer | Timestamp Converter | P2 |
| 10 | Regex Cheat Sheet With Examples You Can Test | regex cheat sheet | Guide | Regex Tester | P2 |
| 11 | What Color Contrast Ratio Do You Need? (WCAG AA vs AAA) | wcag contrast ratio | Explainer | Contrast Checker, Shades Generator | P1 |
| 12 | How to Make a QR Code for Wi-Fi | wifi qr code | How-to | QR Code Generator | P1 |
| 13 | How Long Should a Password Be? | how long should a password be | Explainer | Password Generator | P2 |
| 14 | How to Pick a Random Winner Fairly for a Giveaway | pick a random winner | How-to | List Randomizer, Remove Duplicate Lines | P2 |
| 15 | How to Calculate Percentage Change (With Examples) | how to calculate percentage change | How-to | Percentage Calculator | P1 |
| 16 | UTM Parameters Explained: Tag Links the Right Way | utm parameters | Guide | UTM Builder | P2 |
| 17 | How to Write a Meta Description That Gets Clicks | how to write a meta description | How-to | Meta Tag Generator, Slug Generator | P2 |
| 18 | How to Clean Up Text Copied From a PDF | text copied from pdf line breaks | Troubleshooting | Extra Space Remover, Case Converter | P2 |

Each article gets `cluster` set to its category and `relatedTools` set to the tools above, so tool pages link back to it automatically. `npm run seo:check` fails if an article's primary keyword collides with a tool's.

---

## First 30 articles

Priority: **P1** = write first (direct support for an existing popular tool or a pillar), **P2** = next, **P3** = fills out the cluster.
Content types: How-to · Guide · Explainer · Troubleshooting · Comparison · Pillar.

### Thumbnails cluster

**1. YouTube Thumbnail Size & Dimensions Guide** — P1
- Primary keyword: youtube thumbnail size
- Intent: informational — people designing or uploading a thumbnail
- Supporting: youtube thumbnail dimensions, youtube thumbnail resolution, youtube thumbnail aspect ratio, thumbnail file size limit
- Target tool: Thumbnail Safe Zone, Thumbnail Preview
- Internal links: how to download a youtube thumbnail · thumbnail best practices (#2) · thumbnail blurry (#5)
- Type: Guide (with a size table and diagram)
- Why: the most common thumbnail question; natural hub for the whole thumbnail cluster.

**2. How to Make a Good YouTube Thumbnail** — P1
- Primary keyword: youtube thumbnail best practices
- Intent: informational / improvement
- Supporting: how to make a good youtube thumbnail, thumbnail tips, thumbnail text size
- Target tool: Thumbnail Checker, Thumbnail Text Tester, Thumbnail Preview
- Internal links: thumbnail size (#1) · readability article · colours and contrast (#7)
- Type: Guide
- Why: connects four thumbnail tools; strong internal-linking hub. Base advice on YouTube's own guidance and checks a reader can repeat — no invented CTR statistics.

**3. How to Change a YouTube Thumbnail (Computer and Phone)** — P1
- Primary keyword: how to change youtube thumbnail
- Intent: task — step-by-step
- Supporting: change thumbnail on youtube app, edit youtube thumbnail, update thumbnail after upload
- Target tool: Thumbnail Preview (check before swapping)
- Internal links: thumbnail size (#1) · custom thumbnail not available (#4)
- Type: How-to
- Why: clear task intent; screenshots of YouTube Studio add original value.

**4. Why Can't I Upload a Custom YouTube Thumbnail?** — P2
- Primary keyword: youtube custom thumbnail not available
- Intent: troubleshooting
- Supporting: verify youtube account for thumbnails, custom thumbnail greyed out
- Target tool: —(links to #3)
- Internal links: change thumbnail (#3) · thumbnail size (#1)
- Type: Troubleshooting
- Why: frustrated searchers, short precise answer; feeds users into the thumbnail cluster.

**5. Why Is My YouTube Thumbnail Blurry? (And How to Fix It)** — P2
- Primary keyword: youtube thumbnail blurry
- Intent: troubleshooting
- Supporting: thumbnail low quality, thumbnail pixelated
- Target tool: Thumbnail Checker, Thumbnail Downloader (check what YouTube serves)
- Internal links: thumbnail size (#1) · download article
- Type: Troubleshooting
- Why: problem-based long tail with an obvious tool tie-in.

**6. YouTube Shorts Thumbnails: How They Work** — P2
- Primary keyword: youtube shorts thumbnail
- Intent: informational
- Supporting: shorts thumbnail size, change shorts thumbnail, download shorts thumbnail
- Target tool: Thumbnail Downloader
- Internal links: download article · thumbnail size (#1)
- Type: Explainer
- Why: Shorts behave differently and confuse people; verify current YouTube behaviour before publishing — it changes.

**7. Thumbnail Colours and Contrast: A Practical Check** — P3
- Primary keyword: youtube thumbnail colors
- Intent: informational
- Supporting: thumbnail contrast, thumbnail brightness
- Target tool: Thumbnail Checker
- Internal links: best practices (#2) · readability article
- Type: Guide
- Why: rounds out the cluster with a measurable, tool-backed angle.

### Videos & links cluster

**8. How to Find a YouTube Video ID** — P1
- Primary keyword: how to find youtube video id
- Intent: task
- Supporting: youtube video id from url, youtube id shorts, what is a youtube video id
- Target tool: Video ID Finder
- Internal links: channel id (#9) · embed (#10) · download article
- Type: How-to
- Why: short, exact answer; high tool-conversion.

**9. How to Find a YouTube Channel ID** — P1
- Primary keyword: how to find youtube channel id
- Intent: task
- Supporting: youtube channel id from handle, youtube uc id, channel id vs handle
- Target tool: Channel ID Finder
- Internal links: video id (#8) · channel stats (#22)
- Type: How-to
- Why: common need for integrations; direct tool match.

**10. How to Embed a YouTube Video on a Website** — P1
- Primary keyword: how to embed youtube video
- Intent: task
- Supporting: youtube embed code, embed youtube in wordpress, responsive youtube embed
- Target tool: Embed Code Generator
- Internal links: link to a time (#11) · privacy mode (#12) · autoplay/loop (#13)
- Type: How-to
- Why: evergreen task with several platform-specific sub-questions.

**11. How to Link to a Specific Time in a YouTube Video** — P1
- Primary keyword: youtube link to specific time
- Intent: task
- Supporting: youtube timestamp link, share youtube at time, start youtube at time
- Target tool: Embed Code Generator (start time); future: timestamp link tool
- Internal links: embed (#10) · chapters (#16)
- Type: How-to
- Why: very common task; candidate for a small new tool later.

**12. YouTube Privacy-Enhanced Mode Explained** — P3
- Primary keyword: youtube-nocookie
- Intent: informational (site owners, GDPR-minded)
- Supporting: youtube privacy enhanced mode, embed youtube without cookies
- Target tool: Embed Code Generator
- Internal links: embed (#10)
- Type: Explainer
- Why: niche but underserved; builds authority for the embed cluster.

**13. How to Autoplay, Mute or Loop an Embedded YouTube Video** — P3
- Primary keyword: youtube embed autoplay
- Intent: task
- Supporting: youtube embed loop, autoplay muted
- Target tool: Embed Code Generator
- Internal links: embed (#10)
- Type: How-to
- Why: specific parameter questions the generator already solves.

### Titles, descriptions & SEO cluster

**14. YouTube SEO for Beginners** — P1 (pillar for this cluster)
- Primary keyword: youtube seo
- Intent: informational — broad
- Supporting: how to rank youtube videos, youtube search optimization
- Target tool: SEO Checker
- Internal links: every article in this cluster (#15–#21)
- Type: Pillar
- Why: hub for the cluster. Stick to what YouTube publicly documents; say plainly that no one outside YouTube knows the full ranking system.

**15. How to Write a YouTube Description (With a Template)** — P1
- Primary keyword: how to write a youtube description
- Intent: task
- Supporting: youtube description template, youtube description example, description length
- Target tool: Description Generator
- Internal links: chapters (#16) · hashtags (#19) · SEO pillar (#14)
- Type: How-to
- Why: direct match for a new tool; templates are highly shareable.

**16. How to Add Chapters (Timestamps) to YouTube Videos** — P1
- Primary keyword: how to add chapters to youtube videos
- Intent: task
- Supporting: youtube timestamps in description, youtube chapters requirements
- Target tool: Timestamp Generator
- Internal links: chapters not showing (#17) · description (#15)
- Type: How-to
- Why: clear rules (00:00, 3 chapters, 10 seconds) the tool validates.

**17. YouTube Chapters Not Showing? How to Fix Them** — P2
- Primary keyword: youtube chapters not showing
- Intent: troubleshooting
- Supporting: timestamps not working youtube
- Target tool: Timestamp Generator, SEO Checker
- Internal links: add chapters (#16)
- Type: Troubleshooting
- Why: problem-based search where the tool gives an instant answer.

**18. YouTube Tags: How to See Them and Whether They Matter** — P1
- Primary keyword: youtube tags
- Intent: informational + task
- Supporting: how to see tags on youtube, do youtube tags matter, youtube tag limit
- Target tool: Tag Extractor
- Internal links: hashtags (#19) · SEO pillar (#14)
- Type: Explainer
- Why: one article covers both "see" and "matter" intents (merged to avoid cannibalisation).

**19. YouTube Hashtags: Rules, Limits and How to Use Them** — P1
- Primary keyword: youtube hashtags
- Intent: informational
- Supporting: how many hashtags on youtube, hashtags above title, shorts hashtags
- Target tool: Hashtag Generator
- Internal links: tags (#18) · description (#15)
- Type: Guide
- Why: clear documented rules the new tool enforces.

**20. How Long Should a YouTube Title Be?** — P1
- Primary keyword: youtube title length
- Intent: informational
- Supporting: youtube title character limit, title cut off
- Target tool: SEO Checker, Thumbnail Preview (see truncation)
- Internal links: SEO pillar (#14)
- Type: Explainer
- Why: precise question with a precise answer (100 max, ~70 visible).

**21. How to See When a YouTube Video Was Uploaded** — P2
- Primary keyword: youtube video upload date
- Intent: task
- Supporting: exact upload time youtube
- Target tool: Metadata Extractor
- Internal links: public metrics article
- Type: How-to
- Why: simple question the metadata tool answers exactly.

### Channel & video stats cluster

**22. How to Check Any YouTube Channel's Subscribers and Stats** — P2
- Primary keyword: youtube channel stats
- Intent: task
- Supporting: see subscriber count, hidden subscriber count
- Target tool: Channel Checker, Channel Tracker
- Internal links: public metrics article · compare channels (#23)
- Type: How-to
- Why: supports the analytics tools; builds on the published metrics explainer.

**23. How to Compare YouTube Channels** — P2
- Primary keyword: compare youtube channels
- Intent: task
- Supporting: youtube competitor analysis
- Target tool: Channel Comparison, Video Comparison
- Internal links: channel stats (#22) · video ideas (#24)
- Type: How-to
- Why: commercial-leaning audience (creators, agencies).

**24. How to Find YouTube Video Ideas From Similar Channels** — P2
- Primary keyword: youtube video ideas
- Intent: informational
- Supporting: content gap youtube, what to make videos about
- Target tool: Video Idea Finder, Comment Summary
- Internal links: compare channels (#23) · viewer questions (#25)
- Type: Guide
- Why: broad, recurring need; data-backed angle stands out from generic idea lists.

**25. How to Find the Questions Your Viewers Keep Asking** — P3
- Primary keyword: analyze youtube comments
- Intent: informational
- Supporting: youtube comment analysis
- Target tool: Comment Summary
- Internal links: video ideas (#24)
- Type: Guide
- Why: unique angle for the comment tool.

### Earnings cluster

**26. How Much Does YouTube Pay per 1,000 Views?** — P1
- Primary keyword: how much does youtube pay per 1000 views
- Intent: informational (very common)
- Supporting: youtube rpm, youtube money per view
- Target tool: Earnings Calculator, RPM Calculator
- Internal links: RPM vs CPM article · watch hours (#27)
- Type: Explainer
- Why: huge curiosity query. **Do not publish invented pay rates** — explain RPM, the factors that move it, and show readers how to find their own number.

**27. How to Calculate YouTube Watch Hours** — P1
- Primary keyword: how to calculate youtube watch hours
- Intent: task
- Supporting: 4000 watch hours, watch time calculator
- Target tool: Watch Time Calculator
- Internal links: earnings (#26)
- Type: How-to
- Why: exact formula, exact tool.

**28. How to Calculate Your YouTube Engagement Rate** — P2
- Primary keyword: youtube engagement rate
- Intent: task
- Supporting: like rate, comment rate formula
- Target tool: Engagement Calculator
- Internal links: compare videos (#23)
- Type: How-to
- Why: formula-based; avoid unsourced "good engagement rate" benchmarks — teach comparison against your own videos.

### Pillar and text

**29. The Complete Guide to Free YouTube Tools** — P1 (pillar for the whole category)
- Primary keyword: free youtube tools
- Intent: navigational / informational
- Supporting: best youtube tools for creators, youtube creator tools
- Target tool: all YouTube tools
- Internal links: one line + link per tool, and one per cluster pillar (#1, #14, #26)
- Type: Pillar
- Why: ties the category together for readers and search engines. Must be genuinely organised by task, not a link list.

**30. How to Count Words and Characters (Word, Google Docs and Online)** — P2
- Primary keyword: how to count words
- Intent: task
- Supporting: character count, word count in google docs, word count in word
- Target tool: Word Counter
- Internal links: case converter tool
- Type: How-to
- Why: seeds the Text cluster and proves the site isn't YouTube-only.

---

## Articles 31–50

Write once 1–30 are published and Search Console shows which clusters are gaining impressions.

31. How to Download a YouTube Channel's Profile Picture and Banner — (candidate new tool)
32. YouTube Thumbnail Templates: What a Safe Layout Looks Like — Safe Zone
33. How to Test Two Thumbnails (What YouTube's "Test & Compare" Does) — verify feature status first
34. How to Get a YouTube Video's Transcript — (only if a compliant method exists)
35. How to Make a YouTube Playlist Link Start at a Specific Video — Video ID Finder
36. What Is a YouTube Handle? (Handle vs Channel ID vs Custom URL) — Channel ID Finder
37. How to Write YouTube Titles People Click Without Clickbait — SEO Checker
38. YouTube Description Examples for Common Video Types — Description Generator
39. How to Add Links to a YouTube Description — Description Generator
40. How YouTube Search Works: What's Public and What Isn't — SEO pillar
41. How to Track YouTube Subscriber Growth Over Time — Channel Tracker
42. How Often Should You Upload on YouTube? (Reading Your Own Data) — Channel Checker
43. How to Compare Two YouTube Videos' Performance — Video Comparison
44. YouTube CPM by Month: Why Q4 Is Different — CPM Calculator (explain, don't invent figures)
45. How to Estimate a Sponsorship Rate From Public Stats — Engagement Calculator
46. How to Convert Text to Title Case (Rules Explained) — Case Converter
47. Sentence Case vs Title Case: When to Use Each — Case Converter
48. How Long Does It Take to Read 1,000 Words? — Word Counter
49. How to Count Characters for Social Media Posts — Word Counter (bridges to Social Media category)
50. The Complete Guide to Free Text Tools — Text pillar

## Articles 51–100

Plan these **only as their tools launch** — an article about a tool that doesn't exist yet would send readers nowhere.

- **Image tools (when launched):** how to compress an image without losing quality · image file size for websites · JPG vs PNG vs WebP · how to resize an image for YouTube, Instagram, etc. · how to crop an image to a square · how to convert HEIC to JPG · image resolution vs file size explained · pillar: complete guide to image tools (8 articles)
- **PDF tools:** how to merge PDFs · how to reduce PDF size for email · how to split a PDF · how to convert PDF pages to images · why PDFs are large · pillar (6)
- **Social media tools:** hashtag limits per platform · Instagram bio line breaks · caption length limits by platform · TikTok vs Shorts vs Reels specs · pillar (5)
- **SEO tools:** how to write a meta description · title tag length · how to check how a page looks in Google results · Open Graph tags explained · pillar (5)
- **Developer tools:** how to format JSON · URL encoding explained · Base64 explained · pillar (4)
- **Marketing / productivity / calculators:** UTM parameters explained · how to build a UTM link · how to make a QR code · percentage calculations (increase, decrease, discount) · date difference · pillar per category (12)
- **YouTube, deeper (10):** refresh the top performers from 1–50 into full guides; add troubleshooting articles for whatever users ask via the contact page and Search Console queries.

---

## Before publishing any article

- [ ] One primary keyword, not targeted by any other page (check the table above).
- [ ] Answers the question in the first screen (use `quickAnswer`), then goes deeper.
- [ ] Every platform rule checked against the official source, with the date checked noted in the PR.
- [ ] No invented statistics, quotes, reviews, credentials or pay rates.
- [ ] Links to its target tool once in the body where it naturally helps (`<ToolCta>`), plus natural text links — vary anchor text ("download the thumbnail", "check the available sizes"), don't repeat the exact keyword.
- [ ] Links up to its pillar/category and across to 1–3 siblings (`relatedPosts`).
- [ ] `relatedTools` set, so the tool page lists this guide under "Related guides".
- [ ] Original visuals where they genuinely help (diagram, annotated screenshot, table).
- [ ] FAQ only for real follow-up questions — not repeated body text.
- [ ] `updated` date changed whenever facts change.

## Images

- Save real images in `public/blog/<article-slug>/` with descriptive names: `youtube-thumbnail-size-guide.webp`, `youtube-studio-change-thumbnail.webp`.
- Prefer WebP, sized to the content width (about 1440 px wide for full-width images).
- Alt text describes what the image shows for someone who can't see it — no keyword lists.
- Diagrams that can be drawn in code (like the thumbnail URL diagram) stay as components: sharp at any size and fast.
- Every page already gets a generated social image (`opengraph-image`), so no manual OG images are needed.
