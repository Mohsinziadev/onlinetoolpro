import type { ReactNode } from "react";
import type { Faq } from "@/lib/catalog/types";

/** What kind of search intent the article serves. Drives the label and schema. */
export type PostKind = "pillar" | "how-to" | "guide" | "explainer" | "comparison";

export type Author = {
  id: string;
  name: string;
  /** Shown under the name. Describe what the person or team actually does — never invent credentials. */
  role: string;
  bio: string;
  /** "Person" for a named writer, "Organization" for a team byline */
  type: "Person" | "Organization";
  url?: string;
};

/** Client-safe article metadata: used by the blog index, site search, sitemap and related-content links. */
export type PostMeta = {
  slug: string;
  /** The on-page H1 */
  title: string;
  /** <title> tag when it should differ from the H1 */
  metaTitle?: string;
  /** Meta description and the standfirst under the H1 */
  description: string;
  /** Category slug this article supports ("youtube") — ties it to that topic cluster */
  cluster: string;
  kind: PostKind;
  /** ISO dates */
  published: string;
  updated?: string;
  authorId: string;
  readingMinutes: number;
  /** The main query this article is written to answer. One article per primary keyword — no cannibalisation. */
  primaryKeyword: string;
  keywords?: string[];
  /** Tools this article helps people use, "category/slug" */
  relatedTools: string[];
  /** Hand-picked related articles; otherwise chosen from the same cluster */
  relatedPosts?: string[];
  /** Optional real image in /public/blog (descriptive filename). Without it a designed header is shown. */
  image?: { src: string; alt: string; width: number; height: number };
};

export type PostSection = { id: string; title: string; body: ReactNode };

/** The article body, loaded only on its own page. */
export type PostContent = {
  /** A direct answer to the query, shown first. Satisfies the searcher before any detail. */
  quickAnswer?: ReactNode;
  intro: ReactNode;
  sections: PostSection[];
  faqs?: Faq[];
};
