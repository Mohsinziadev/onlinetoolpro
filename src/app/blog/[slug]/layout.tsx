import type { ReactNode } from "react";
import { posts } from "@/lib/blog/posts";
import { postContent } from "@/content/blog";

/** Every published article; inherited by the article page and its social image. */
export const dynamicParams = false;

export function generateStaticParams() {
  return posts.filter((p) => postContent[p.slug]).map((p) => ({ slug: p.slug }));
}

export default function PostLayout({ children }: { children: ReactNode }) {
  return children;
}
