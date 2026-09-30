import { ogImage } from "@/lib/og";
import { KIND_LABEL, getPost, posts } from "@/lib/blog/posts";

/** /blog/<slug>/og.png — the article's social share image, built at build time. */
export const dynamic = "force-static";

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const post = getPost((await params).slug);
  if (!post) return ogImage({ eyebrow: "Guide", title: "Guides" });
  return ogImage({ eyebrow: `${KIND_LABEL[post.kind]} · ${post.readingMinutes} min read`, title: post.title, tint: "sand" });
}
