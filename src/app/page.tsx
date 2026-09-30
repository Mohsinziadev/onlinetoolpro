import { toolCount } from "@/lib/utils";
import Link from "next/link";
import { ArrowRight, Lock, MousePointerClick, Smartphone, Sparkles } from "lucide-react";
import { HeroSearch } from "@/components/search/hero-search";
import { CategoryCard, CategoryTile } from "@/components/tool/category-card";
import { PopularTools } from "@/components/tool/popular-tools";
import { SectionHeader } from "@/components/tool/section";
import { ToolGrid } from "@/components/tool/tool-card";
import { ToolIcon } from "@/components/tool-icon";
import { FaqSection } from "@/components/tool/faq-section";
import { ButtonLink } from "@/components/ui/button";
import { JsonLd } from "@/components/json-ld";
import { Backdrop } from "@/components/visual/backdrop";
import { activeCategories, categoryHref, getTool, liveCount, liveTools, newTools, popularTools, toolHref, toolsIn, upcomingCategories } from "@/lib/catalog";
import { latestPosts } from "@/lib/blog/posts";
import { PostGrid } from "@/components/blog/post-card";
import { siteConfig } from "@/lib/site";
import { toolBackdrop } from "@/lib/catalog/visuals";

const promises = [
  { icon: Sparkles, title: "Free, always", body: "Every tool is free to use. No trials, no hidden limits." },
  { icon: MousePointerClick, title: "No sign-up", body: "Open a tool and start. No account, no email, no password." },
  { icon: Lock, title: "Private by design", body: "Most tools run right in your browser, so your files and text stay with you." },
  { icon: Smartphone, title: "Works on any device", body: "Phone, tablet or computer — every tool is built to be easy on a small screen." },
];

const faqs = [
  { q: `What is ${siteConfig.name}?`, a: `${siteConfig.name} is a collection of free online tools for everyday tasks — like downloading a YouTube thumbnail, finding a video ID or counting the words in a text. Each tool does one job, simply.` },
  { q: "Do I need to create an account?", a: "No. Every tool works straight away without signing up." },
  { q: "Are the tools really free?", a: "Yes. All tools are free to use." },
  { q: "Is my data safe?", a: "Yes. Every tool runs entirely in your browser, so your files and text never leave your device. We don't have accounts or a database." },
  { q: "Will you add more tools?", a: "Yes. We're starting with YouTube and text tools, and image, PDF, social media and developer tools are on the way." },
];

// The homepage uses the same backdrop as the Tag Extractor page.
const tagExtractor = getTool("youtube", "tag-extractor");
const homeBackdrop = tagExtractor ? toolBackdrop(tagExtractor) : ({ pattern: "rays", tint: "mint" } as const);

export default function HomePage() {
  const heroTools = popularTools(5);
  const spotlight = activeCategories[0];
  const spotlightTools = spotlight ? toolsIn(spotlight.slug, { includeSoon: false }).slice(0, 8) : [];

  return (
    <>
      {/* HERO — what this is, and search first */}
      <section className="relative isolate">
        <Backdrop spec={homeBackdrop} maxHeight="max-h-[900px]" />
        <div className="container-page relative pt-16 pb-24 text-center sm:pt-24 sm:pb-28">
          <p className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-surface/80 py-1 pr-3.5 pl-1 text-[14px] text-ink-2 shadow-card backdrop-blur">
            <span className="rounded-full bg-cta px-2.5 py-0.5 text-[12px] font-medium text-cta-ink">100% free</span>
            Every tool is free — no sign-up, no limits
          </p>
          <p className="eyebrow mt-8">Free online tools</p>
          <h1 className="display mx-auto mt-5 max-w-4xl">
            <span className="text-ink/55">Simple tools for</span>
            <br />
            <span className="text-ink">everyday tasks.</span>
          </h1>
          <p className="lead mx-auto mt-6 max-w-xl text-muted">
            Useful online tools that help you get things done faster — no technical knowledge required.
          </p>

          <HeroSearch className="mx-auto mt-10 max-w-2xl" />

          <div className="mx-auto mt-6 flex max-w-2xl flex-wrap items-center justify-center gap-2">
            <span className="mr-1 text-[14px] text-muted">Popular:</span>
            {heroTools.map((t) => (
              <Link key={`${t.category}/${t.slug}`} href={toolHref(t)} className="chip">
                <ToolIcon name={t.icon} className="h-3.5 w-3.5 text-muted" />
                {t.name}
              </Link>
            ))}
          </div>

          <p className="mt-10 text-[14px] text-muted">
            {liveTools.length} free tools · No sign-up · Works on any device
          </p>
        </div>
      </section>

      {/* CATEGORIES — scales from one category to many */}
      <section className="container-page" aria-labelledby="categories-heading">
        <SectionHeader
          id="categories-heading"
          eyebrow="Categories"
          title="Browse tools by category."
          description="Pick a category to see every tool in it. New categories are added regularly."
          link={{ href: "/tools", label: "All tools" }}
        />
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {activeCategories.map((c) => (
            <CategoryCard key={c.slug} category={c} />
          ))}
        </div>
        {upcomingCategories.length ? (
          <div className="mt-10">
            <p className="text-[14px] font-medium text-ink-2">Coming soon</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {upcomingCategories.map((c) => (
                <CategoryTile key={c.slug} category={c} />
              ))}
            </div>
          </div>
        ) : null}
      </section>

      {/* POPULAR — from any category */}
      <div className="container-page mt-28 sm:mt-32">
        <PopularTools limit={6} link={{ href: "/tools#popular", label: "See all popular tools" }} />
      </div>

      {/* RECENTLY ADDED */}
      <section className="container-page mt-28 sm:mt-32" aria-labelledby="new-heading">
        <SectionHeader id="new-heading" eyebrow="Just added" title="Recently added tools" description="The newest tools on the site." link={{ href: "/tools#new", label: "See all new tools" }} />
        <ToolGrid tools={newTools(4)} showCategory columns={4} className="mt-10" />
      </section>

      {/* SPOTLIGHT — the leading category right now */}
      {spotlight ? (
        <section className="tint-mint mt-28 border-y border-line bg-[linear-gradient(180deg,var(--tint-1),var(--bg))] sm:mt-32" aria-labelledby="spotlight-heading">
          <div className="container-page py-20 sm:py-24">
            <SectionHeader
              id="spotlight-heading"
              eyebrow={toolCount(liveCount(spotlight.slug))}
              title={spotlight.title}
              description={spotlight.intro}
              link={{ href: categoryHref(spotlight), label: `See all ${spotlight.name} tools` }}
            />
            <ToolGrid tools={spotlightTools} columns={4} className="mt-10" />
          </div>
        </section>
      ) : null}

      {/* GUIDES — the blog supports the tools */}
      {latestPosts(1).length ? (
        <section className="container-page mt-28 sm:mt-32" aria-labelledby="guides-heading">
          <SectionHeader
            id="guides-heading"
            eyebrow="Guides"
            title="Popular guides"
            description="Clear, step-by-step answers to the questions people ask most."
            link={{ href: "/blog", label: "All guides" }}
          />
          <PostGrid posts={latestPosts(3)} className="mt-10" />
        </section>
      ) : null}

      {/* PROMISES — hairline-divided columns */}
      <section className="mt-28 sm:mt-32" aria-labelledby="promise-heading">
        <div className="container-page text-center">
          <h2 id="promise-heading" className="h2 mx-auto max-w-2xl text-ink">
            No setup. No learning curve.
          </h2>
          <p className="lead mx-auto mt-4 max-w-xl text-muted">Every tool is built for people who just want the job done.</p>
        </div>
        <div className="mt-14 border-y border-line">
          <ul className="container-page grid sm:grid-cols-2 lg:grid-cols-4">
            {promises.map((p, i) => (
              <li
                key={p.title}
                className={`border-line px-2 py-10 sm:px-8 ${i > 0 ? "border-t sm:border-t-0" : ""} ${i % 2 === 1 ? "sm:border-l" : ""} ${i >= 2 ? "sm:border-t lg:border-t-0" : ""} ${i > 0 ? "lg:border-l" : ""}`}
              >
                <p.icon aria-hidden className="h-5 w-5 text-accent" strokeWidth={1.75} />
                <h3 className="mt-8 text-[22px] leading-[1.16] font-medium tracking-[-0.02em] text-ink">{p.title}</h3>
                <p className="mt-3 text-[15px] leading-[1.48] text-muted">{p.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FAQ + CTA */}
      <section className="container-page mt-28 grid grid-cols-1 gap-12 sm:mt-32 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-16">
        <FaqSection faqs={faqs} />
        <div className="relative isolate flex flex-col justify-between self-start overflow-hidden rounded-3xl bg-[linear-gradient(180deg,#00140c_0%,#0a2119_100%)] dark:border dark:border-white/10 p-8 text-white sm:p-10 lg:sticky lg:top-28">
          <div aria-hidden className="absolute -right-16 -bottom-20 -z-10 h-64 w-64 rounded-full bg-[#7afab2] opacity-20 blur-[90px]" />
          <div>
            <h2 className="h3">Find the right tool in seconds.</h2>
            <p className="mt-3 max-w-sm text-[16px] leading-[1.48] text-white/65">
              Search every tool across every category, or browse them all on one page.
            </p>
          </div>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/tools" size="lg" className="bg-[#7afab2] text-[#00140c] hover:bg-[#9dfdc6]">
              Browse all tools <ArrowRight aria-hidden className="h-4 w-4" />
            </ButtonLink>
          </div>
        </div>
      </section>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebSite",
              "@id": `${siteConfig.url}/#website`,
              name: siteConfig.name,
              url: siteConfig.url,
              description: siteConfig.description,
              publisher: { "@id": `${siteConfig.url}/#organization` },
              potentialAction: {
                "@type": "SearchAction",
                target: `${siteConfig.url}/tools?q={search_term_string}`,
                "query-input": "required name=search_term_string",
              },
            },
            {
              "@type": "Organization",
              "@id": `${siteConfig.url}/#organization`,
              name: siteConfig.name,
              url: siteConfig.url,
              logo: `${siteConfig.url}/icon.svg`,
              email: siteConfig.contactEmail,
            },
          ],
        }}
      />
    </>
  );
}
