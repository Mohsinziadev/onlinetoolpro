import type { Metadata } from "next";
import { BlogIndex } from "@/components/blog/blog-index";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Blog — Practical Guides for YouTube and Everyday Online Tasks",
  description: `Step-by-step guides from ${siteConfig.name}: downloading thumbnails, understanding YouTube metrics, and getting the most from free online tools.`,
  path: "/blog",
});

export default function BlogPage() {
  return <BlogIndex page={1} />;
}
