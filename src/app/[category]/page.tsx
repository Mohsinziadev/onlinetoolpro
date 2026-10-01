import { toolCount } from "@/lib/utils";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ToolIconTile } from "@/components/tool-icon";
import { Breadcrumbs } from "@/components/tool/breadcrumbs";
import { SectionHeader } from "@/components/tool/section";
import { ToolGrid } from "@/components/tool/tool-card";
import { PopularTools } from "@/components/tool/popular-tools";
import { CategoryTile } from "@/components/tool/category-card";
import { FaqSection } from "@/components/tool/faq-section";
import { PostGrid } from "@/components/blog/post-card";
import { JsonLd } from "@/components/json-ld";
import { Backdrop } from "@/components/visual/backdrop";
import { activeCategories, categoryHref, getCategoryByPath, groupedTools, liveCount, popularTools, toolHref, toolsIn, upcomingCategories } from "@/lib/catalog";
import { categoryBackdrop } from "@/lib/catalog/visuals";
import { latestPosts } from "@/lib/blog/posts";
import { categoryMetadata } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";

/** /youtube-tools, /text-tools… Only categories with live tools get a page — no thin placeholders. */
export const dynamicParams = false;

export function generateStaticParams() {
  return activeCategories.map((c) => ({ category: c.path }));
}

export async function generateMetadata({ params }: PageProps<"/[category]">): Promise<Metadata> {
  const c = getCategoryByPath((await params).category);
  return c ? categoryMetadata(c) : {};
}

/**
 * The same template for every category:
 * header → popular tools → all tools (grouped) → helpful guides → FAQ → other categories.
 */
export default async function CategoryPage({ params }: PageProps<"/[category]">) {
  const category = getCategoryByPath((await params).category);
  if (!category || !liveCount(category.slug)) notFound();

  const count = liveCount(category.slug);
  const groups = groupedTools(category);
  const hasPopular = popularTools(1, category.slug).length > 0;
  const live = toolsIn(category.slug, { includeSoon: false });
  const guides = latestPosts(6, category.slug);
  const others = activeCategories.filter((c) => c.slug !== category.slug);

  const jump = [
    ...(hasPopular ? [{ href: "#popular-heading", label: "Popular" }] : []),
    ...(groups.length > 1 ? groups.map((g) => ({ href: `#group-${g.id}`, label: g.name })) : []),
    ...(guides.length ? [{ href: "#guides", label: "Guides" }] : []),
    ...(category.faqs?.length ? [{ href: "#faq-heading", label: "FAQ" }] : []),
  ];

  return (
    <div className="relative isolate">
      <Backdrop spec={categoryBackdrop(category)} maxHeight="max-h-[640px]" />
      <div className="container-page pt-6 sm:pt-8">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Tools", href: "/tools" },
            { label: category.title, href: categoryHref(category) },
          ]}
        />

        <header className="mt-10 max-w-3xl sm:mt-14">
          <ToolIconTile name={category.icon} size="lg" tone="tint" tint={categoryBackdrop(category).tint} className="bg-surface shadow-card" />
          <h1 className="h1 mt-6 text-ink">{category.title}</h1>
          <p className="lead mt-4 text-muted">{category.intro}</p>
          <p className="mt-5 text-[14px] text-muted">{toolCount(count, "free")} · No sign-up · Works on any device</p>
        </header>

        {jump.length > 1 ? (
          <nav aria-label={`${category.name} sections`} className="-mx-4 mt-10 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0">
            <ul className="flex gap-2">
              {jump.map((j) => (
                <li key={j.href}>
                  <a href={j.href} className="chip">
                    {j.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}

        {hasPopular ? (
          <PopularTools
            category={category.slug}
            eyebrow="Most used"
            title={`Popular ${category.name} tools`}
            description="Start here — these are the ones people use most."
            className="mt-16 sm:mt-20"
          />
        ) : null}

        <section aria-labelledby="all-heading" className="mt-24 sm:mt-28">
          <SectionHeader id="all-heading" eyebrow="Everything" title={`All ${category.title}`} />
          {groups.length > 1 ? (
            <div className="mt-12 space-y-14">
              {groups.map((g) => (
                <div key={g.id}>
                  <h3 id={`group-${g.id}`} className="scroll-mt-28 text-[18px] font-medium tracking-[-0.01em] text-ink">
                    {g.name} <span className="ml-1 text-muted">{g.tools.length}</span>
                  </h3>
                  <ToolGrid tools={g.tools} className="mt-5" />
                </div>
              ))}
            </div>
          ) : (
            <ToolGrid tools={toolsIn(category.slug)} className="mt-10" />
          )}
        </section>

        {guides.length ? (
          <section id="guides" aria-labelledby="guides-heading" className="mt-24 scroll-mt-28 border-t border-line pt-16">
            <SectionHeader
              id="guides-heading"
              eyebrow="Learn"
              title={`Helpful ${category.name} guides`}
              description="Step-by-step explanations that go with the tools above."
              link={{ href: "/blog", label: "All guides" }}
            />
            <PostGrid posts={guides} className="mt-8" />
          </section>
        ) : null}

        {category.faqs?.length ? (
          <div className="mt-24 grid grid-cols-1 gap-8 border-t border-line pt-16 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-16">
            <p className="eyebrow">FAQ</p>
            <div className="max-w-3xl">
              <FaqSection faqs={category.faqs} title={`${category.title}: common questions`} />
            </div>
          </div>
        ) : null}

        {others.length ? (
          <section aria-labelledby="more-categories" className="mt-24 border-t border-line pt-16">
            <SectionHeader id="more-categories" title="Explore other categories" link={{ href: "/tools", label: "All tools" }} />
            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {others.map((c) => (
                <CategoryTile key={c.slug} category={c} />
              ))}
            </div>
            {upcomingCategories.length ? (
              <p className="mt-5 text-[14px] text-muted">Coming later: {upcomingCategories.map((c) => c.name).join(", ")}.</p>
            ) : null}
          </section>
        ) : null}

        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: category.title,
            description: category.description,
            url: absoluteUrl(categoryHref(category)),
            mainEntity: {
              "@type": "ItemList",
              itemListElement: live.map((t, i) => ({ "@type": "ListItem", position: i + 1, name: t.title ?? t.name, url: absoluteUrl(toolHref(t)) })),
            },
          }}
        />
      </div>
    </div>
  );
}
