/**
 * Lightweight, dependency-free English text analysis used by the Comment
 * Analyzer and Content Gap Finder. Deterministic and explainable: frequency
 * counts, n-grams, pattern matching and a small sentiment lexicon.
 */

export const STOPWORDS = new Set(
  `a about above after again against all am an and any are aren't as at be because been before being below between both but by
can can't cannot could couldn't did didn't do does doesn't doing don't down during each few for from further had hadn't has hasn't
have haven't having he he'd he'll he's her here here's hers herself him himself his how how's i i'd i'll i'm i've if in into is
isn't it it's its itself let's me more most mustn't my myself no nor not of off on once only or other ought our ours ourselves
out over own same shan't she she'd she'll she's should shouldn't so some such than that that's the their theirs them themselves
then there there's these they they'd they'll they're they've this those through to too under until up very was wasn't we we'd
we'll we're we've were weren't what what's when when's where where's which while who who's whom why why's with won't would
wouldn't you you'd you'll you're you've your yours yourself yourselves im ive dont cant wont didnt doesnt isnt thats youre
also just really get got like one much even still thing things way lot well yeah yes ok okay oh lol u ur pls plz gonna wanna
will make made go going know think see want need use using used new good great video videos vid channel thanks thank please
guys guy watch watching watched time 1 2 3 4 5 6 7 8 9 10 would could should vs amp`.split(/\s+/),
);

/** Words that add no topic meaning to YouTube titles. */
export const TITLE_NOISE = new Set(
  `mock guide tutorial tutorials ultimate best tips tricks how why what top review reviews explained beginners beginner complete
easy quick simple step steps full part episode ep official new update updated 2020 2021 2022 2023 2024 2025 2026 2027 day days
minutes mistakes avoid actually matters tested vs versus shorts short live stream vlog my our your you i we test tried trying
every everything anyone nobody everyone better worst worse free secret truth things ways reasons first last ever never`.split(/\s+/),
);

export function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\[mock\]/g, " ")
    .replace(/[^\p{L}\p{N}'\s-]/gu, " ")
    .replace(/(^|\s)['-]+|['-]+(?=\s|$)/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokenize(text: string): string[] {
  const n = normalize(text);
  return n ? n.split(" ").filter((t) => t.length > 0) : [];
}

export function contentTokens(text: string, extraStop?: Set<string>): string[] {
  return tokenize(text).filter((t) => t.length > 1 && !STOPWORDS.has(t) && !(extraStop?.has(t) ?? false) && !/^\d+$/.test(t));
}

/**
 * Phrases of 2–3 consecutive meaningful words. Phrases never bridge a
 * stopword, so "camera settings for low light" yields "camera settings" and
 * "low light", not "settings low".
 */
export function phrases(text: string, extraStop?: Set<string>, sizes: number[] = [2, 3]): string[] {
  const toks = tokenize(text);
  const ok = (t: string) => t.length > 1 && !STOPWORDS.has(t) && !(extraStop?.has(t) ?? false) && !/^\d+$/.test(t);
  const out: string[] = [];
  for (const n of sizes) {
    for (let i = 0; i + n <= toks.length; i++) {
      const slice = toks.slice(i, i + n);
      if (slice.every(ok)) out.push(slice.join(" "));
    }
  }
  return out;
}

export type Counted = { term: string; count: number; examples: number[] };

/** Count in how many documents each term appears (document frequency). */
export function documentFrequency(docs: string[][], minCount = 2): Counted[] {
  const map = new Map<string, Set<number>>();
  docs.forEach((terms, i) => {
    for (const t of new Set(terms)) {
      if (!map.has(t)) map.set(t, new Set());
      map.get(t)?.add(i);
    }
  });
  return [...map.entries()]
    .map(([term, set]) => ({ term, count: set.size, examples: [...set] }))
    .filter((c) => c.count >= minCount)
    .sort((a, b) => b.count - a.count || a.term.localeCompare(b.term));
}

/** Drop shorter phrases whose documents are (almost) all covered by a longer phrase containing them. */
export function dedupeNested(items: Counted[]): Counted[] {
  const kept: Counted[] = [];
  const byLength = [...items].sort((a, b) => b.term.split(" ").length - a.term.split(" ").length || b.count - a.count);
  for (const it of byLength) {
    const dominated = kept.some((k) => k.term.includes(it.term) && k.count >= it.count * 0.8);
    if (!dominated) kept.push(it);
  }
  return kept.sort((a, b) => b.count - a.count || a.term.localeCompare(b.term));
}

function jaccard(a: Set<string>, b: Set<string>): number {
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  const union = a.size + b.size - inter;
  return union === 0 ? 0 : inter / union;
}

export type Group = { label: string; count: number; examples: { text: string; count: number }[]; keywords: string[] };

/** Greedy clustering of short texts by content-word overlap. */
export function groupSimilar(texts: string[], threshold = 0.5): Group[] {
  const groups: { rep: string; keys: Set<string>; items: string[]; freq: Map<string, number> }[] = [];
  for (const text of texts) {
    const keys = new Set(contentTokens(text));
    if (keys.size === 0) continue;
    let best: (typeof groups)[number] | null = null;
    let bestScore = 0;
    for (const g of groups) {
      const s = jaccard(keys, g.keys);
      if (s > bestScore) {
        bestScore = s;
        best = g;
      }
    }
    if (best && bestScore >= threshold) {
      best.items.push(text);
      for (const k of keys) best.freq.set(k, (best.freq.get(k) ?? 0) + 1);
    } else {
      groups.push({ rep: text, keys, items: [text], freq: new Map([...keys].map((k) => [k, 1])) });
    }
  }
  return groups
    .map((g) => ({
      // Shortest example tends to be the clearest phrasing
      label: [...g.items].sort((a, b) => a.length - b.length)[0],
      count: g.items.length,
      examples: [...g.items.reduce((m, t) => m.set(t, (m.get(t) ?? 0) + 1), new Map<string, number>())]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([text, count]) => ({ text, count })),
      keywords: [...g.freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4).map(([k]) => k),
    }))
    .sort((a, b) => b.count - a.count);
}

/** Wh-words mark a question even without "?"; modal/auxiliary openers only count with "?". */
const WH_START = /^(what|how|why|where|which|when|who|whom|whose|anyone)\b/i;

/** Split a comment into sentences and return the ones that are questions. */
export function extractQuestions(comment: string): string[] {
  const sentences = comment
    .replace(/\s+/g, " ")
    .split(/(?<=[?!.])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 8 && s.length <= 300);
  return sentences.filter((s) => s.endsWith("?") || (WH_START.test(s) && s.split(" ").length >= 4 && !s.endsWith(".")));
}

const REQUEST_PATTERNS = [
  /\b(?:can|could|would|will) you (?:please )?(?:make|do|cover|film|show|review|explain|talk about|share|try)\b(.*)/i,
  /\bplease (?:make|do|cover|film|show|review|explain|talk about|share)\b(.*)/i,
  /\b(?:make|do) a (?:video|tutorial|review|follow[- ]up|part 2|series)\b(.*)/i,
  /\b(?:would|i'd|i would) love (?:a|to see|an?)\b(.*)/i,
  /\b(?:next video|part 2|part two|follow[- ]up|sequel)\b(.*)/i,
  /\b(?:tutorial|video) (?:on|about|for)\b(.*)/i,
];

export function extractRequest(comment: string): string | null {
  const flat = comment.replace(/\s+/g, " ").trim();
  for (const re of REQUEST_PATTERNS) {
    const m = re.exec(flat);
    if (m) {
      const start = Math.max(0, m.index);
      return flat.slice(start, start + 160).trim();
    }
  }
  return null;
}

/**
 * Small hand-built sentiment lexicon (weights −3…+3). An estimate only:
 * lexicon methods miss sarcasm, slang and context.
 */
const LEXICON: Record<string, number> = {
  love: 3, loved: 3, loving: 2, amazing: 3, awesome: 3, excellent: 3, fantastic: 3, incredible: 3, perfect: 3, brilliant: 3,
  outstanding: 3, best: 2, great: 2, good: 2, nice: 2, helpful: 2, useful: 2, beautiful: 2, cool: 1, clear: 1, informative: 2,
  enjoy: 2, enjoyed: 2, fun: 2, funny: 2, happy: 2, glad: 2, thanks: 1, thank: 1, appreciate: 2, appreciated: 2, recommend: 2,
  wow: 2, solid: 1, underrated: 2, favorite: 2, favourite: 2, impressive: 2, inspiring: 2, inspired: 2, quality: 1, legend: 2,
  easy: 1, worth: 1, works: 1, worked: 1, fixed: 1, clean: 1, gem: 2, masterpiece: 3, insightful: 2, valuable: 2,
  bad: -2, terrible: -3, awful: -3, horrible: -3, worst: -3, hate: -3, hated: -3, boring: -2, useless: -2, wrong: -2, annoying: -2,
  disappointed: -2, disappointing: -2, confusing: -2, confused: -1, poor: -2, waste: -2, wasted: -2, broken: -2, fail: -2,
  failed: -2, problem: -1, problems: -1, issue: -1, issues: -1, quiet: -1, loud: -1, clickbait: -3, misleading: -3, fake: -2,
  scam: -3, sad: -2, angry: -2, stupid: -3, trash: -3, cringe: -2, slow: -1, long: -1, dislike: -2, unfortunately: -1, meh: -1,
  hard: -1, difficult: -1, buggy: -2, lag: -1, laggy: -2, overpriced: -2, expensive: -1, error: -1, crash: -2, crashes: -2,
};
const NEGATORS = new Set(["not", "no", "never", "don't", "dont", "didn't", "didnt", "isn't", "isnt", "wasn't", "wasnt", "can't", "cant", "won't", "hardly"]);

export type SentimentLabel = "positive" | "neutral" | "negative";

export function estimateSentiment(text: string): { score: number; label: SentimentLabel } {
  const toks = tokenize(text);
  let score = 0;
  for (let i = 0; i < toks.length; i++) {
    const w = LEXICON[toks[i]];
    if (!w) continue;
    const negated = NEGATORS.has(toks[i - 1] ?? "") || NEGATORS.has(toks[i - 2] ?? "");
    score += negated ? -w * 0.75 : w;
  }
  if (/!{2,}/.test(text) && score !== 0) score *= 1.2;
  const label: SentimentLabel = score >= 1 ? "positive" : score <= -1 ? "negative" : "neutral";
  return { score, label };
}
