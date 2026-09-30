import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { KIND_LABEL, postHref } from "@/lib/blog/posts";
import type { PostMeta } from "@/lib/blog/types";
import { formatDate, cn } from "@/lib/utils";

/** Article card used on the blog index, category pages, tool pages and the homepage. */
export function PostCard({ post, className }: { post: PostMeta; className?: string }) {
  return (
    <Link
      href={postHref(post)}
      className={cn(
        "group flex h-full flex-col rounded-2xl border border-line bg-surface p-5 shadow-card transition-[border-color,box-shadow] duration-200 hover:border-line-strong hover:shadow-raised sm:p-6",
        className,
      )}
    >
      <p className="text-[12.5px] font-medium text-accent">{KIND_LABEL[post.kind]}</p>
      <h3 className="mt-2 text-[17px] leading-snug font-medium tracking-[-0.01em] text-ink group-hover:text-accent">{post.title}</h3>
      <p className="mt-2 line-clamp-3 flex-1 text-[14px] leading-[1.5] text-muted">{post.description}</p>
      <p className="mt-4 flex items-center justify-between text-[12.5px] text-muted">
        <span>
          <time dateTime={post.updated ?? post.published}>{formatDate(post.updated ?? post.published)}</time> · {post.readingMinutes} min read
        </span>
        <ArrowRight aria-hidden className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </p>
    </Link>
  );
}

export function PostGrid({ posts, className }: { posts: PostMeta[]; className?: string }) {
  if (!posts.length) return null;
  return (
    <ul className={cn("grid gap-3 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {posts.map((p) => (
        <li key={p.slug}>
          <PostCard post={p} />
        </li>
      ))}
    </ul>
  );
}
