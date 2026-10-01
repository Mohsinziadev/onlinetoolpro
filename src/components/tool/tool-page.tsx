import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, Check } from "lucide-react";
import { ToolIconTile } from "@/components/tool-icon";
import { AdPlaceholder } from "@/components/ad-placeholder";
import { Breadcrumbs } from "@/components/tool/breadcrumbs";
import { FaqSection, type Faq } from "@/components/tool/faq-section";
import { RelatedTools } from "@/components/tool/related-tools";
import { HowItWorksDemo } from "@/components/tool/how-it-works-demo";
import { Backdrop } from "@/components/visual/backdrop";
import { JsonLd } from "@/components/json-ld";
import { absoluteUrl, siteConfig } from "@/lib/site";
import { categoryHref, getCategory, liveCount, relatedCategories, relatedTools, toolHref, toolKey, toolTitle, tools } from "@/lib/catalog";
import { ToolNavDrawer, ToolSidebar } from "@/components/tool/tool-sidebar";
import { ToolPager } from "@/components/tool/tool-pager";
import { getDemo } from "@/lib/catalog/demos";
import { toolBackdrop } from "@/lib/catalog/visuals";
import { cn, formatDate, toolCount } from "@/lib/utils";
import { postsForTool } from "@/lib/blog/posts";
import { PostGrid } from "@/components/blog/post-card";
import { SectionHeader } from "@/components/tool/section";

export type ArticleSection = { id: string; title: string; body: ReactNode };

function findTool(key: string) {
  const tool = tools.find((t) => `${t.category}/${t.slug}` === key);
  if (!tool) throw new Error(`Unknown tool: ${key}`);
  return tool;
}

/**
 * Shared page for every tool. Left: every category and tool (sticky sidebar on
 * desktop, a drawer on small screens). Right: breadcrumb → name → description →
 * interface (+ result) → previous/next tool → how it works → good-to-know
 * articles → FAQ → related tools → related category.
 *
 * Each tool supplies only its interface and its words; layout lives here.
 */
export function ToolPage({
  slug,
  children,
  sections: sectionsProp,
  faqs: faqsProp,
  headerAside,
  wide = false,
}: {
  /** "category/slug" */
  slug: string;
  children: ReactNode;
  sections?: ArticleSection[];
  faqs?: Faq[];
  headerAside?: ReactNode;
  /** Use the full container width for the interface (dashboards) */
  wide?: boolean;
}) {
  const tool = findTool(slug);
  // Page modules pass their own copy; catalog-only tools use the catalog's FAQs and notes.
  const faqs = faqsProp ?? tool.faqs ?? [];
  const sections: ArticleSection[] =
    sectionsProp ??
    (tool.guide ?? []).map((g, i) => ({
      id: `note-${i + 1}`,
      title: g.title,
      body: (
        <>
          {g.body.map((para) => (
            <p key={para}>{para}</p>
          ))}
        </>
      ),
    }));
  const key = toolKey(tool);
  const ads = !tool.noAds;
  const category = getCategory(tool.category)!;
  const title = toolTitle(tool);
  const related = relatedTools(tool, 3);
  const guides = postsForTool(key, 3);
  const otherCategories = relatedCategories(category.slug, 4);

  const backdrop = toolBackdrop(tool);
  // Every tool is free — always say so first.
  const notes = ["100% free", ...(tool.notes ?? []).filter((n) => n.toLowerCase() !== "free")];

  return (
    <>
      {/* The tool's own backdrop sits behind everything at the top, reaching up under the nav. */}
      <div className="relative isolate">
        <Backdrop spec={backdrop} maxHeight="max-h-[640px]" />
        <div className="container-app gap-8 pt-6 lg:grid lg:grid-cols-[264px_minmax(0,1fr)] xl:gap-12">
          <ToolSidebar current={key} />

          <div className="min-w-0">
            <ToolNavDrawer current={key} categoryName={category.title} />

            <header className="mt-6 lg:mt-1">
              <Breadcrumbs
                items={[
                  { label: "Home", href: "/" },
                  { label: category.title, href: categoryHref(category) },
                  { label: tool.name, href: toolHref(tool) },
                ]}
              />
              <div className="mt-6 flex items-start gap-4 sm:gap-5">
                <ToolIconTile name={tool.icon} size="lg" tone="tint" tint={backdrop.tint} className="mt-1 bg-surface shadow-card" />
                <div className="min-w-0 flex-1">
                  <h1 className="tool-title text-ink">{title}</h1>
                  <p className="mt-2.5 max-w-2xl text-[16px] leading-[1.55] text-muted sm:text-[17px]">{tool.description}</p>
                </div>
              </div>
              {notes.length ? (
                <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-[14px] text-ink-2">
                  {notes.map((n) => (
                    <li key={n} className="flex items-center gap-1.5">
                      <Check aria-hidden className="h-4 w-4 text-accent" strokeWidth={2.25} />
                      {n}
                    </li>
                  ))}
                </ul>
              ) : null}
              {headerAside ? <div className="mt-6">{headerAside}</div> : null}
            </header>

            <section aria-label={`${tool.name} tool`} className={cn("pt-8", !wide && "max-w-4xl")}>
              {children}
            </section>

            <ToolPager tool={tool} className="mt-10" />

            {tool.updatedAt ? (
              <p className="mt-6 text-[13px] text-muted">
                Last reviewed <time dateTime={tool.updatedAt}>{formatDate(tool.updatedAt, { year: "numeric", month: "long", day: "numeric" })}</time> by the{" "}
                <Link href="/about" className="underline decoration-line-strong underline-offset-2 hover:text-ink">
                  {siteConfig.name} team
                </Link>
              </p>
            ) : null}

            {ads ? <AdPlaceholder slot="top-banner" className="mt-14" /> : null}

            {tool.about ? (
              <section aria-labelledby="about-heading" className="mt-20 grid grid-cols-1 gap-6 border-t border-line pt-16 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] xl:gap-12">
                <h2 id="about-heading" className="h2 text-ink">
                  What is the {title}?
                </h2>
                <p className="lead text-ink-2">{tool.about}</p>
              </section>
            ) : null}

            {tool.steps?.length ? (
              <HowItWorksDemo
                toolKey={key}
                steps={tool.steps}
                demo={getDemo(tool)}
                backdrop={backdrop}
                toolName={tool.name}
                title={`How to use the ${title}`}
                icon={tool.icon}
                className="mt-20 border-t border-line pt-16"
              />
            ) : null}

            {tool.useCases?.length ? (
              <section aria-labelledby="uses-heading" className="mt-20 border-t border-line pt-16">
                <h2 id="uses-heading" className="h2 text-ink">
                  What can you use it for?
                </h2>
                <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {tool.useCases.map((u) => (
                    <li key={u} className="flex gap-3 rounded-2xl border border-line bg-surface p-5 text-[15px] leading-[1.5] text-ink-2">
                      <Check aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-accent" strokeWidth={2.25} />
                      {u}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {sections.length ? (
              <div className="mt-20 grid grid-cols-1 gap-10 border-t border-line pt-16 xl:grid-cols-[200px_minmax(0,1fr)] xl:gap-12">
                <div>
                  <p className="eyebrow">Good to know</p>
                  <nav aria-label="On this page" className="mt-4 hidden xl:block">
                    <ul className="space-y-2.5 text-[14px]">
                      {sections.map((s) => (
                        <li key={s.id}>
                          <a href={`#${s.id}`} className="text-muted transition-colors hover:text-ink">
                            {s.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </nav>
                </div>
                <article className="min-w-0 max-w-3xl space-y-12">
                  {sections.map((s, i) => (
                    <div key={s.id}>
                      <section id={s.id} aria-labelledby={`${s.id}-h`} className="scroll-mt-24">
                        <h2 id={`${s.id}-h`} className="h4 text-ink">
                          {s.title}
                        </h2>
                        <div className="prose-tool mt-4">{s.body}</div>
                      </section>
                      {i === 1 && ads ? <AdPlaceholder slot="in-content" className="mt-12" /> : null}
                    </div>
                  ))}
                </article>
              </div>
            ) : null}

            {faqs.length ? (
              <div className="mt-20 grid grid-cols-1 gap-8 border-t border-line pt-16 xl:grid-cols-[200px_minmax(0,1fr)] xl:gap-12">
                <p className="eyebrow">FAQ</p>
                <div className="max-w-3xl">
                  <FaqSection faqs={faqs} />
                </div>
              </div>
            ) : null}

            {guides.length ? (
              <section aria-labelledby="guides-heading" className="mt-20 border-t border-line pt-16">
                <SectionHeader id="guides-heading" title="Related guides" description={`Step-by-step help for getting more out of the ${tool.name.toLowerCase()}.`} link={{ href: "/blog", label: "All guides" }} />
                <PostGrid posts={guides} className="mt-8" />
              </section>
            ) : null}

            {ads ? <AdPlaceholder slot="in-content" className="mt-16" /> : null}
            {related.length ? <RelatedTools tools={related} className="mt-16 border-t border-line pt-16" /> : null}

            <section aria-labelledby="category-heading" className="mt-16">
              <Link
                href={categoryHref(category)}
                className="group flex flex-col gap-6 rounded-3xl border border-line bg-bg-subtle p-6 transition-colors hover:border-line-strong sm:flex-row sm:items-center sm:p-8"
              >
                <ToolIconTile name={category.icon} size="lg" tone="accent" />
                <div className="min-w-0 flex-1">
                  <h2 id="category-heading" className="h4 text-ink">
                    More {category.title}
                  </h2>
                  <p className="mt-1.5 text-[15px] text-muted">
                    {category.description} {toolCount(liveCount(category.slug), "free")}.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 text-[15px] font-medium text-accent">
                  Browse {category.name} tools
                  <ArrowRight aria-hidden className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
              <div className="mt-5 flex flex-wrap items-center gap-2 text-[14px]">
                <span className="mr-1 text-muted">Other categories:</span>
                {otherCategories.map((c) => (
                  <Link
                    key={c.slug}
                    href={categoryHref(c)}
                    className="rounded-full border border-line bg-surface px-3 py-1 text-ink-2 transition-colors hover:border-line-strong hover:text-ink"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            </section>

            {ads ? <AdPlaceholder slot="bottom" className="mt-16" /> : null}
          </div>
        </div>
      </div>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: title,
          url: absoluteUrl(toolHref(tool)),
          description: tool.metaDescription ?? tool.description,
          applicationCategory: "UtilitiesApplication",
          ...(tool.updatedAt ? { dateModified: tool.updatedAt } : {}),
          operatingSystem: "Any (web browser)",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          publisher: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
        }}
      />
    </>
  );
}
