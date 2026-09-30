import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { PageIntro } from "@/components/content/page-intro";
import { PostCard, PostGrid } from "@/components/blog/post-card";
import { SectionHeader } from "@/components/tool/section";
import { JsonLd } from "@/components/json-ld";
import { POSTS_PER_PAGE, postHref, sortedPosts } from "@/lib/blog/posts";
import { activeCategories, categoryHref } from "@/lib/catalog";
import { absoluteUrl, siteConfig } from "@/lib/site";

export const pageCount = Math.max(1, Math.ceil(sortedPosts.length / POSTS_PER_PAGE));
export const pageHref = (n: number) => (n <= 1 ? "/blog" : `/blog/page/${n}`);

/** Shared by /blog and /blog/page/[n]. Page 1 also shows the featured article and topics. */
export function BlogIndex({ page }: { page: number }) {
  const list = sortedPosts.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE);
  const [featured, ...rest] = page === 1 ? list : [undefined, ...list];
  const topics = activeCategories
    .map((c) => ({ category: c, count: sortedPosts.filter((p) => p.cluster === c.slug).length }))
    .filter((t) => t.count > 0);

  return (
    <div className="container-page pt-12 sm:pt-16">
      <PageIntro eyebrow="Blog" title={page === 1 ? "Guides that get things done." : `Guides — page ${page}`}>
        Clear, practical guides that go with our tools — written to answer your question quickly, then explain the details.
      </PageIntro>

      {featured ? (
        <section aria-label="Featured guide" className="mt-12">
          <PostCard post={featured} className="border-accent/25 sm:p-8 [&_h3]:text-[22px]" />
        </section>
      ) : null}

      <section aria-labelledby="latest" className="mt-12">
        <SectionHeader id="latest" title={page === 1 ? "Latest guides" : "More guides"} />
        <PostGrid posts={rest.filter(Boolean) as typeof list} className="mt-8" />
      </section>

      {pageCount > 1 ? (
        <nav aria-label="Blog pages" className="mt-12 flex items-center justify-between border-t border-line pt-8 text-[15px]">
          {page > 1 ? (
            <Link href={pageHref(page - 1)} rel="prev" className="inline-flex items-center gap-1.5 font-medium text-ink hover:text-accent">
              <ArrowLeft aria-hidden className="h-4 w-4" /> Newer guides
            </Link>
          ) : (
            <span />
          )}
          <span className="text-muted">
            Page {page} of {pageCount}
          </span>
          {page < pageCount ? (
            <Link href={pageHref(page + 1)} rel="next" className="inline-flex items-center gap-1.5 font-medium text-ink hover:text-accent">
              Older guides <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
          ) : (
            <span />
          )}
        </nav>
      ) : null}

      {page === 1 && topics.length ? (
        <section aria-labelledby="topics" className="mt-20 border-t border-line pt-14">
          <SectionHeader id="topics" title="Guides by topic" description="Every guide belongs to a topic, alongside the tools it explains." />
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {topics.map(({ category, count }) => (
              <li key={category.slug}>
                <Link href={`${categoryHref(category)}#guides`} className="group flex items-center justify-between rounded-2xl border border-line bg-surface p-5 transition-colors hover:border-line-strong">
                  <span>
                    <span className="block text-[16px] font-medium text-ink">{category.name}</span>
                    <span className="text-[13.5px] text-muted">
                      {count} guide{count === 1 ? "" : "s"} and the {category.title.toLowerCase()} they cover
                    </span>
                  </span>
                  <ArrowRight aria-hidden className="h-4 w-4 text-faint transition-transform group-hover:translate-x-0.5 group-hover:text-ink" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Blog",
          name: `${siteConfig.name} Blog`,
          url: absoluteUrl(pageHref(page)),
          blogPost: list.map((p) => ({ "@type": "BlogPosting", headline: p.title, url: absoluteUrl(postHref(p)), datePublished: p.published })),
        }}
      />
    </div>
  );
}
