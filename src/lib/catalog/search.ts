/**
 * Client-safe tool search across every category.
 *
 * Each tool is indexed once into weighted fields. A query is split into terms;
 * every term must match somewhere (prefix match on words), and the score rewards
 * matches in the name over keywords over description. Linear over the catalog,
 * which stays well under a millisecond for thousands of tools.
 */
import { categories, getCategory, isLive, liveCount, tools, type Category, type Tool } from "@/lib/catalog/lite";
import { posts } from "@/lib/blog/posts";
import type { PostMeta } from "@/lib/blog/types";

type Indexed = { tool: Tool; name: string[]; category: string[]; keywords: string[]; description: string[]; phrase: string };

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9@#]+/g, " ")
    // British spellings find the same tools ("colour picker" → "color picker").
    .replace(/colour/g, "color")
    .replace(/(recogni|organi|summari|anal[yi])s(e|ed|es|ing|er)\b/g, "$1z$2")
    .replace(/\bgrey/g, "gray")
    .replace(/\bcentre/g, "center")
    .trim();
const words = (s: string) => norm(s).split(" ").filter(Boolean);

// Common plain-language synonyms so "shrink" finds compressors, etc.
const SYNONYMS: Record<string, string[]> = {
  shrink: ["compress", "compressor", "smaller"],
  smaller: ["compress", "compressor", "resize"],
  combine: ["merge"],
  join: ["merge"],
  yt: ["youtube"],
  pic: ["image", "thumbnail"],
  picture: ["image", "thumbnail"],
  photo: ["image"],
  money: ["earnings", "revenue"],
  earn: ["earnings", "revenue"],
  caps: ["uppercase", "case"],
};

let index: Indexed[] | null = null;
function getIndex(): Indexed[] {
  if (index) return index;
  index = tools.map((tool) => {
    const cat = getCategory(tool.category);
    return {
      tool,
      name: words(`${tool.name} ${tool.title ?? ""}`),
      category: cat ? words(`${cat.name} ${cat.title} ${cat.slug}`) : [],
      keywords: words((tool.keywords ?? []).join(" ")),
      description: words(tool.description),
      phrase: norm(`${tool.title ?? tool.name} ${tool.name}`),
    };
  });
  return index;
}

/** Word-prefix matches count fully; mid-word matches ("words" in "keywords") count half. */
function fieldScore(term: string, list: string[], weight: number): number {
  if (list.some((w) => w.startsWith(term))) return weight;
  if (term.length > 3 && list.some((w) => w.includes(term))) return weight / 2;
  return 0;
}

function termScore(term: string, doc: Indexed): number {
  const score = (t: string) =>
    Math.max(fieldScore(t, doc.name, 10), fieldScore(t, doc.keywords, 6), fieldScore(t, doc.category, 5), fieldScore(t, doc.description, 3));
  // Simple plural handling: "words" also matches "word".
  return Math.max(score(term), term.length > 3 && term.endsWith("s") ? score(term.slice(0, -1)) : 0);
}

export type SearchResult = { tool: Tool; score: number };

export function searchTools(query: string, { includeSoon = true, limit }: { includeSoon?: boolean; limit?: number } = {}): SearchResult[] {
  const q = norm(query);
  const pool = getIndex().filter((d) => includeSoon || isLive(d.tool));
  if (!q) return pool.map((d) => ({ tool: d.tool, score: 0 }));

  const terms = q.split(" ");
  const out: SearchResult[] = [];
  for (const doc of pool) {
    let total = 0;
    let ok = true;
    for (const term of terms) {
      let s = termScore(term, doc);
      if (!s) for (const alt of SYNONYMS[term] ?? []) s = Math.max(s, termScore(alt, doc) - 1);
      if (!s) {
        ok = false;
        break;
      }
      total += s;
    }
    if (!ok) continue;
    if (doc.phrase.includes(q)) total += 15;
    if (doc.tool.popular) total += 2;
    if (!isLive(doc.tool)) total -= 4;
    out.push({ tool: doc.tool, score: total });
  }
  out.sort((a, b) => b.score - a.score);
  return limit ? out.slice(0, limit) : out;
}

export type SearchGroup = { category: Category; results: SearchResult[] };

/** Group results by category, ordering groups by their best match. */
export function groupResults(results: SearchResult[]): SearchGroup[] {
  const byCat = new Map<string, SearchResult[]>();
  for (const r of results) {
    const list = byCat.get(r.tool.category) ?? [];
    list.push(r);
    byCat.set(r.tool.category, list);
  }
  return categories
    .filter((c) => byCat.has(c.slug))
    .map((c) => ({ category: c, results: byCat.get(c.slug)! }))
    .sort((a, b) => b.results[0].score - a.results[0].score);
}

/* ——— site-wide search: tools, guides and categories ——— */


export type SiteHit =
  | { type: "tool"; tool: Tool; score: number }
  | { type: "post"; post: PostMeta; score: number }
  | { type: "category"; category: Category; score: number };

type Doc = { fields: [string[], number][]; phrase: string };

function scoreDoc(doc: Doc, terms: string[], q: string): number {
  let total = 0;
  for (const term of terms) {
    let best = 0;
    for (const t of [term, ...(SYNONYMS[term] ?? [])]) {
      for (const [list, weight] of doc.fields) best = Math.max(best, fieldScore(t, list, weight) - (t === term ? 0 : 1));
    }
    if (!best && term.length > 3 && term.endsWith("s")) {
      for (const [list, weight] of doc.fields) best = Math.max(best, fieldScore(term.slice(0, -1), list, weight));
    }
    if (!best) return 0;
    total += best;
  }
  return doc.phrase.includes(q) ? total + 15 : total;
}

let postDocs: { post: PostMeta; doc: Doc }[] | null = null;
let categoryDocs: { category: Category; doc: Doc }[] | null = null;

/** Tools (grouped by category), then guides, then categories — each ranked by relevance. */
export function searchSite(query: string, { toolLimit = 10, postLimit = 4 } = {}): { tools: SearchResult[]; posts: SiteHit[]; categories: SiteHit[] } {
  const q = norm(query);
  if (!q) return { tools: [], posts: [], categories: [] };
  const terms = q.split(" ");

  postDocs ??= posts.map((post) => ({
    post,
    doc: {
      fields: [
        [words(post.title), 10],
        [words([post.primaryKeyword, ...(post.keywords ?? [])].join(" ")), 6],
        [words(post.description), 3],
      ],
      phrase: norm(`${post.title} ${post.primaryKeyword}`),
    },
  }));
  categoryDocs ??= categories
    .filter((c) => liveCount(c.slug) > 0)
    .map((category) => ({
      category,
      doc: { fields: [[words(`${category.name} ${category.title}`), 10], [words(category.description), 3]], phrase: norm(category.title) },
    }));

  const rank = <T extends { score: number }>(xs: T[], limit: number) => xs.filter((x) => x.score > 0).sort((a, b) => b.score - a.score).slice(0, limit);

  return {
    tools: searchTools(query, { limit: toolLimit }),
    posts: rank(postDocs.map(({ post, doc }) => ({ type: "post" as const, post, score: scoreDoc(doc, terms, q) })), postLimit),
    categories: rank(categoryDocs.map(({ category, doc }) => ({ type: "category" as const, category, score: scoreDoc(doc, terms, q) })), 2),
  };
}
