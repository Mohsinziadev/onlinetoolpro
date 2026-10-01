import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { BlogIndex, pageCount, pageHref } from "@/components/blog/blog-index";
import { siteConfig } from "@/lib/site";

/** /blog/page/2, /blog/page/3… Only pages that have articles exist; page 1 lives at /blog. */
export const dynamicParams = false;

export function generateStaticParams() {
  // Next needs at least one entry; "1" just redirects to /blog.
  return Array.from({ length: pageCount }, (_, i) => ({ page: String(i + 1) }));
}

export async function generateMetadata({ params }: PageProps<"/blog/page/[page]">): Promise<Metadata> {
  const n = Number((await params).page);
  return {
    title: `Guides — Page ${n}`,
    description: `Page ${n} of practical guides from ${siteConfig.name}: money, images, PDFs, text, developer tools and YouTube — clear answers with tools to match.`,
    alternates: { canonical: pageHref(n) },
  };
}

export default async function BlogPaged({ params }: PageProps<"/blog/page/[page]">) {
  const n = Number((await params).page);
  if (!Number.isInteger(n) || n < 1 || n > pageCount) notFound();
  if (n === 1) permanentRedirect("/blog");
  return <BlogIndex page={n} />;
}
