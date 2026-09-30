import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, BookOpen } from "lucide-react";
import { Breadcrumbs } from "@/components/tool/breadcrumbs";
import { FaqSection } from "@/components/tool/faq-section";
import { RelatedTools } from "@/components/tool/related-tools";
import { SectionHeader } from "@/components/tool/section";
import { ToolIconTile } from "@/components/tool-icon";
import { AdPlaceholder } from "@/components/ad-placeholder";
import { JsonLd } from "@/components/json-ld";
import { PostGrid } from "@/components/blog/post-card";
import { ToolCta } from "@/components/blog/content";
import { BackdropPanel } from "@/components/visual/backdrop";
import { NewsletterSignup } from "@/components/monetization/newsletter";
import { getAuthor } from "@/lib/blog/authors";
import { KIND_LABEL, adjacentPosts, getPost, postHref, posts, relatedPosts } from "@/lib/blog/posts";
import { postContent } from "@/content/blog";
import { categoryHref, getCategory, isLive, resolveTool } from "@/lib/catalog";
import { categoryBackdrop } from "@/lib/catalog/visuals";
import { absoluteUrl, siteConfig } from "@/lib/site";
import { ogImageFor } from "@/lib/seo";
import { formatDate } from "@/lib/utils";

export const dynamicParams = false;

export function generateStaticParams() {
  return posts.filter((p) => postContent[p.slug]).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const post = getPost((await params).slug);
  if (!post) return {};
  const title = post.metaTitle ?? post.title;
  const url = postHref(post);
  return {
    title: { absolute: `${title} | ${siteConfig.name}` },
    description: post.description,
    keywords: [post.primaryKeyword, ...(post.keywords ?? [])],
    alternates: { canonical: url },
    authors: [{ name: getAuthor(post.authorId).name }],
    openGraph: {
      type: "article",
      title,
      description: post.description,
      url,
      siteName: siteConfig.name,
      publishedTime: post.published,
      modifiedTime: post.updated ?? post.published,
      section: getCategory(post.cluster)?.title,
      images: [ogImageFor(url, post.title)],
    },
    twitter: { card: "summary_large_image", title, description: post.description, images: [ogImageFor(url, post.title)] },
  };
}

/**
 * The article template. Order: breadcrumb → title → byline → featured header →
 * quick answer → contents → sections (in-content ad after the second) → FAQ →
 * author → related tools → related articles → previous/next.
 */
export default async function BlogPostPage({ params }: PageProps<"/blog/[slug]">) {
  const post = getPost((await params).slug);
  const load = post ? postContent[post.slug] : undefined;
  if (!post || !load) notFound();
  const { default: content } = await load();

  const author = getAuthor(post.authorId);
  const category = getCategory(post.cluster);
  const tools = post.relatedTools.flatMap((k) => resolveTool(k, "") ?? []);
  const primaryTool = tools.find(isLive);
  const related = relatedPosts(post, 3);
  const { prev, next } = adjacentPosts(post);
  const updated = post.updated && post.updated !== post.published ? post.updated : null;
  const showToc = content.sections.length >= 4;
  const toc = [...content.sections.map((s) => ({ id: s.id, title: s.title })), ...(content.faqs?.length ? [{ id: "faq-heading", title: "FAQ" }] : [])];

  return (
    <div className="container-page pt-6 sm:pt-8">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Blog", href: "/blog" },
          { label: post.title, href: postHref(post) },
        ]}
      />

      <header className="mt-10 max-w-3xl sm:mt-12">
        <p className="eyebrow">
          {KIND_LABEL[post.kind]}
          {category ? (
            <>
              {" · "}
              <Link href={categoryHref(category)} className="hover:underline">
                {category.name}
              </Link>
            </>
          ) : null}
        </p>
        <h1 className="h1 mt-4 text-ink">{post.title}</h1>
        <p className="lead mt-5 text-muted">{post.description}</p>
        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[14px] text-muted">
          <span>
            By{" "}
            <Link href={author.url ?? "/about"} className="font-medium text-ink-2 hover:text-accent">
              {author.name}
            </Link>
          </span>
          <span>
            Published <time dateTime={post.published}>{formatDate(post.published, { year: "numeric", month: "long", day: "numeric" })}</time>
          </span>
          {updated ? (
            <span>
              Updated <time dateTime={updated}>{formatDate(updated, { year: "numeric", month: "long", day: "numeric" })}</time>
            </span>
          ) : null}
          <span>{post.readingMinutes} min read</span>
        </div>
      </header>

      {post.image ? (
        <Image
          src={post.image.src}
          alt={post.image.alt}
          width={post.image.width}
          height={post.image.height}
          priority
          sizes="(min-width: 1024px) 1024px, 100vw"
          className="mt-10 w-full max-w-5xl rounded-3xl border border-line"
        />
      ) : category ? (
        <BackdropPanel spec={categoryBackdrop(category)} className="mt-10 flex aspect-[21/7] max-w-5xl items-center justify-center rounded-3xl border border-line">
          <div aria-hidden className="flex items-center gap-4">
            <ToolIconTile name={category.icon} size="lg" tone="tint" tint={categoryBackdrop(category).tint} className="bg-surface shadow-card" />
            <span className="hidden text-[15px] font-medium text-ink-2 sm:block">{category.title} · {KIND_LABEL[post.kind]}</span>
          </div>
        </BackdropPanel>
      ) : null}

      <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-16">
        <article className="min-w-0 max-w-[720px]">
          {content.quickAnswer ? (
            <section aria-labelledby="quick-answer" className="rounded-2xl border border-accent/25 bg-accent-soft p-5 sm:p-6">
              <h2 id="quick-answer" className="text-[15px] font-medium text-accent">
                The short answer
              </h2>
              <div className="prose-article mt-2 text-[16px]">{content.quickAnswer}</div>
            </section>
          ) : null}

          <div className="prose-article mt-8">{content.intro}</div>

          {showToc ? (
            <details className="mt-8 rounded-2xl border border-line bg-surface p-4 lg:hidden">
              <summary className="cursor-pointer text-[15px] font-medium text-ink">On this page</summary>
              <ol className="mt-3 space-y-2 text-[14.5px]">
                {toc.map((t) => (
                  <li key={t.id}>
                    <a href={`#${t.id}`} className="text-muted hover:text-ink">
                      {t.title}
                    </a>
                  </li>
                ))}
              </ol>
            </details>
          ) : null}

          {content.sections.map((s, i) => (
            <div key={s.id}>
              <section id={s.id} aria-labelledby={`${s.id}-h`} className="mt-14 scroll-mt-28">
                <h2 id={`${s.id}-h`} className="h3 text-ink">
                  {s.title}
                </h2>
                <div className="prose-article mt-5">{s.body}</div>
              </section>
              {i === 2 ? <AdPlaceholder slot="in-content" className="mt-14" /> : null}
            </div>
          ))}

          {content.faqs?.length ? (
            <div className="mt-16 scroll-mt-28">
              <FaqSection faqs={content.faqs} />
            </div>
          ) : null}

          <section aria-label="About the author" className="mt-16 flex gap-4 rounded-2xl border border-line bg-surface p-5 sm:p-6">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
              <BookOpen aria-hidden className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[15px] font-medium text-ink">{author.name}</p>
              <p className="text-[13px] text-muted">{author.role}</p>
              <p className="mt-2 text-[14.5px] leading-[1.55] text-ink-2">{author.bio}</p>
            </div>
          </section>
        </article>

        <aside className="hidden lg:block">
          <div className="sticky top-28 space-y-6">
            {showToc ? (
              <nav aria-label="On this page" className="rounded-2xl border border-line bg-surface p-5">
                <p className="text-[13px] font-medium text-ink">On this page</p>
                <ol className="mt-3 space-y-2 text-[13.5px] leading-snug">
                  {toc.map((t) => (
                    <li key={t.id}>
                      <a href={`#${t.id}`} className="text-muted transition-colors hover:text-ink">
                        {t.title}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            ) : null}
            {primaryTool ? <ToolCta tool={`${primaryTool.category}/${primaryTool.slug}`} label="Try it free" compact /> : null}
            <AdPlaceholder slot="sidebar" />
          </div>
        </aside>
      </div>

      {tools.length ? <RelatedTools tools={tools.slice(0, 3)} title="Tools mentioned in this guide" className="mt-24 border-t border-line pt-16" /> : null}

      {related.length ? (
        <section aria-labelledby="related-posts" className="mt-20">
          <SectionHeader id="related-posts" title="Keep reading" link={{ href: "/blog", label: "All guides" }} />
          <PostGrid posts={related} className="mt-8" />
        </section>
      ) : null}

      {prev || next ? (
        <nav aria-label="More articles" className="mt-16 grid gap-3 border-t border-line pt-10 sm:grid-cols-2">
          {prev ? (
            <Link href={postHref(prev)} className="group rounded-2xl border border-line p-5 transition-colors hover:border-line-strong">
              <span className="inline-flex items-center gap-1 text-[13px] text-muted">
                <ArrowLeft aria-hidden className="h-3.5 w-3.5" /> Previous
              </span>
              <span className="mt-1 block text-[15px] font-medium text-ink group-hover:text-accent">{prev.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link href={postHref(next)} className="group rounded-2xl border border-line p-5 text-right transition-colors hover:border-line-strong">
              <span className="inline-flex items-center gap-1 text-[13px] text-muted">
                Next <ArrowRight aria-hidden className="h-3.5 w-3.5" />
              </span>
              <span className="mt-1 block text-[15px] font-medium text-ink group-hover:text-accent">{next.title}</span>
            </Link>
          ) : null}
        </nav>
      ) : null}

      <NewsletterSignup className="mt-16 max-w-3xl" />
      <AdPlaceholder slot="bottom" className="mt-16" />

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.metaTitle ?? post.title,
          description: post.description,
          datePublished: post.published,
          dateModified: post.updated ?? post.published,
          mainEntityOfPage: absoluteUrl(postHref(post)),
          image: absoluteUrl(`${postHref(post)}/og.png`),
          articleSection: category?.title,
          keywords: [post.primaryKeyword, ...(post.keywords ?? [])].join(", "),
          author: { "@type": author.type, name: author.name, url: absoluteUrl(author.url ?? "/about") },
          publisher: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url, logo: { "@type": "ImageObject", url: absoluteUrl("/icon.svg") } },
        }}
      />
    </div>
  );
}
