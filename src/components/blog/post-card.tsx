import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ToolIcon } from "@/components/tool-icon";
import { KIND_LABEL, postHref } from "@/lib/blog/posts";
import type { PostMeta } from "@/lib/blog/types";
import { getCategory } from "@/lib/catalog/lite";
import { categoryBackdrop } from "@/lib/catalog/visuals";
import { formatDate, cn } from "@/lib/utils";

/*
 * Card cover art: fine line motifs in the article's category tint, drawn for
 * cards (they're deliberately different from the page backgrounds). Each motif
 * fills a 400 × 200 box and fades out on the left, where the text sits.
 */
const W = 400;
const H = 200;

function Contours() {
  return (
    <g fill="none" stroke="currentColor" strokeWidth={1}>
      {Array.from({ length: 11 }, (_, i) => {
        const y = 14 + i * 18;
        const a = 10 + (i % 4) * 4;
        return (
          <path
            key={i}
            d={`M120 ${y} C200 ${y - a} 250 ${y + a * 1.6} 310 ${y} S380 ${y - a} 420 ${y + a * 0.6}`}
            opacity={0.18 + (i % 3) * 0.08}
          />
        );
      })}
    </g>
  );
}

function Orbits() {
  return (
    <g fill="none" stroke="currentColor" strokeWidth={1}>
      {Array.from({ length: 9 }, (_, i) => (
        <circle
          key={i}
          cx={400}
          cy={0}
          r={34 + i * 26}
          opacity={0.42 - i * 0.03}
        />
      ))}
      <circle
        cx={400 - 112}
        cy={86}
        r={3.5}
        fill="currentColor"
        stroke="none"
        opacity={0.6}
      />
      <circle
        cx={400 - 192}
        cy={52}
        r={2.5}
        fill="currentColor"
        stroke="none"
        opacity={0.45}
      />
    </g>
  );
}

function Fan() {
  return (
    <g fill="none" stroke="currentColor" strokeWidth={1}>
      {Array.from({ length: 22 }, (_, i) => {
        const x = 140 + i * 13;
        return (
          <line
            key={i}
            x1={W + 10}
            y1={H + 10}
            x2={x}
            y2={-10}
            opacity={0.14 + (i % 4) * 0.07}
          />
        );
      })}
    </g>
  );
}

function Hatch() {
  return (
    <g fill="none" stroke="currentColor" strokeWidth={1}>
      {Array.from({ length: 26 }, (_, i) => {
        const x = 120 + i * 12;
        return (
          <line
            key={i}
            x1={x}
            y1={H + 10}
            x2={x + 120}
            y2={-10}
            opacity={i % 5 === 0 ? 0.45 : 0.2}
          />
        );
      })}
      <rect
        x={318}
        y={-18}
        width={64}
        height={64}
        rx={14}
        fill="var(--tint-1)"
        stroke="currentColor"
        opacity={0.75}
        strokeWidth={1.1}
      />
    </g>
  );
}

function DotsRing() {
  const dots: [number, number][] = [];
  for (let x = 150; x <= 400; x += 16)
    for (let y = 8; y <= 200; y += 16) dots.push([x, y]);
  return (
    <g>
      {dots.map(([x, y]) => (
        <circle
          key={`${x}-${y}`}
          cx={x}
          cy={y}
          r={1.3}
          fill="currentColor"
          opacity={0.3}
        />
      ))}
      <circle
        cx={352}
        cy={26}
        r={44}
        fill="var(--tint-1)"
        stroke="currentColor"
        strokeWidth={1.1}
        opacity={0.75}
      />
      <circle
        cx={352}
        cy={26}
        r={30}
        fill="none"
        stroke="currentColor"
        strokeWidth={1}
        strokeDasharray="3 5"
        opacity={0.55}
      />
    </g>
  );
}

const MOTIFS = [Contours, Orbits, Fan, Hatch, DotsRing];

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

/** Article card used on the blog index, category pages, tool pages and the homepage. */
export function PostCard({
  post,
  className,
  headingLevel = 3,
  featured = false,
  variant,
}: {
  post: PostMeta;
  className?: string;
  headingLevel?: 2 | 3;
  featured?: boolean;
  /** Which line motif to draw. Grids pass the card's position so neighbours always differ. */
  variant?: number;
}) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const category = getCategory(post.cluster);
  const tint = category ? categoryBackdrop(category).tint : "mint";
  const Motif = MOTIFS[(variant ?? hash(post.slug)) % MOTIFS.length];

  return (
    <Link
      href={postHref(post)}
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-[22px] border border-line bg-surface shadow-card transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-raised",
        className,
      )}
    >
      {/* Cover */}
      <div
        className={cn(
          `tint-${tint}`,
          "relative isolate flex flex-col justify-between gap-6 overflow-hidden border-b border-line bg-[var(--tint-1)] p-5 sm:p-6",
          featured ? "min-h-[240px] sm:min-h-[280px]" : "min-h-[204px]",
        )}
      >
        {/* The featured card stays plain: just the tint, no line art. */}
        {featured ? null : (
          <svg
            aria-hidden
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="xMaxYMid slice"
            className="post-cover-art absolute inset-0 -z-10 h-full w-full text-[var(--tint-ink)] transition-transform duration-500 group-hover:scale-[1.03]"
          >
            <Motif />
          </svg>
        )}
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-line bg-surface/90 py-1 pr-3 pl-1 text-[12px] font-medium text-ink-2 shadow-card">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--tint-3)] text-[var(--tint-ink)]">
            {category ? (
              <ToolIcon name={category.icon} className="h-3 w-3" />
            ) : null}
          </span>
          {category?.title ?? "Guides"}
        </span>
        <div>
          <p className="text-[11.5px] font-semibold tracking-[0.12em] text-[var(--tint-ink)] uppercase">
            {KIND_LABEL[post.kind]}
          </p>
          <Heading
            className={cn(
              "mt-2 font-medium tracking-[-0.02em] text-balance text-ink",
              featured
                ? "max-w-3xl text-[24px] leading-[1.15] sm:text-[30px]"
                : "line-clamp-3 text-[19px] leading-[1.22]",
            )}
          >
            {post.title}
          </Heading>
        </div>
      </div>

      {/* Body */}
      <div
        className={cn("flex flex-1 flex-col p-5 sm:p-6", featured && "sm:px-8")}
      >
        <div className="flex-1">
          <p
            className={cn(
              "text-[14.5px] leading-[1.55] text-muted",
              featured ? "line-clamp-4 sm:text-[15.5px]" : "line-clamp-3",
            )}
          >
            {post.description}
          </p>
        </div>
        <p className="mt-5 flex items-center justify-between text-[12.5px] text-muted">
          <span>
            <time dateTime={post.updated ?? post.published}>
              {formatDate(post.updated ?? post.published)}
            </time>{" "}
            · {post.readingMinutes} min read
          </span>
          <span className="inline-flex items-center gap-1 font-medium text-ink-2 transition-colors group-hover:text-accent">
            Read
            <ArrowRight
              aria-hidden
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
            />
          </span>
        </p>
      </div>
    </Link>
  );
}

export function PostGrid({
  posts,
  className,
}: {
  posts: PostMeta[];
  className?: string;
}) {
  if (!posts.length) return null;
  return (
    <ul
      className={cn(
        "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3",
        className,
      )}
    >
      {posts.map((p, i) => (
        <li key={p.slug}>
          <PostCard post={p} variant={i} />
        </li>
      ))}
    </ul>
  );
}
