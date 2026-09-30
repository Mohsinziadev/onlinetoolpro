import {
  contentTokens,
  dedupeNested,
  documentFrequency,
  estimateSentiment,
  extractQuestions,
  extractRequest,
  groupSimilar,
  phrases,
  type Group,
  type SentimentLabel,
} from "@/lib/text/nlp";

export type InputComment = { text: string; publishedAt?: string | null; likeCount?: number };

export type CommentAnalysisResult = {
  total: number;
  analyzedWords: number;
  questions: { totalQuestions: number; commentsWithQuestions: number; groups: Group[] };
  requests: { total: number; groups: Group[] };
  topics: { phrase: string; count: number; examples: string[] }[];
  terms: { term: string; count: number }[];
  sentiment: {
    counts: Record<SentimentLabel, number>;
    examples: Record<SentimentLabel, string[]>;
  };
  /** Comments per day (only when dates are known) */
  frequency: { date: string; count: number }[] | null;
  mostLiked: { text: string; likeCount: number }[];
};

export function analyzeComments(comments: InputComment[]): CommentAnalysisResult {
  const texts = comments.map((c) => c.text.trim()).filter(Boolean);

  // Questions
  const questionList: string[] = [];
  let commentsWithQuestions = 0;
  for (const t of texts) {
    // Requests ("can you make…?") are reported separately, not as FAQs.
    const qs = extractQuestions(t).filter((q) => extractRequest(q) === null);
    if (qs.length) commentsWithQuestions++;
    questionList.push(...qs);
  }
  const questionGroups = groupSimilar(questionList, 0.45);

  // Requests
  const requests = texts.map(extractRequest).filter((r): r is string => r !== null);
  const requestGroups = groupSimilar(requests, 0.4);

  // Topics: 2–3 word phrases by number of comments mentioning them
  const phraseDocs = texts.map((t) => phrases(t));
  const topics = dedupeNested(documentFrequency(phraseDocs, 2))
    .slice(0, 20)
    .map((c) => ({ phrase: c.term, count: c.count, examples: c.examples.slice(0, 4).map((i) => texts[i]) }));

  // Terms: single words by number of comments mentioning them
  const termDocs = texts.map((t) => contentTokens(t).filter((w) => w.length > 2));
  const terms = documentFrequency(termDocs, 2)
    .slice(0, 30)
    .map((c) => ({ term: c.term, count: c.count }));

  // Estimated sentiment
  const counts: Record<SentimentLabel, number> = { positive: 0, neutral: 0, negative: 0 };
  const scored = texts.map((t) => ({ t, ...estimateSentiment(t) }));
  for (const s of scored) counts[s.label]++;
  const examples: Record<SentimentLabel, string[]> = {
    positive: scored.filter((s) => s.label === "positive").sort((a, b) => b.score - a.score).slice(0, 3).map((s) => s.t),
    neutral: scored.filter((s) => s.label === "neutral").slice(0, 3).map((s) => s.t),
    negative: scored.filter((s) => s.label === "negative").sort((a, b) => a.score - b.score).slice(0, 3).map((s) => s.t),
  };

  // Frequency by day
  const dated = comments.filter((c) => c.publishedAt);
  let frequency: CommentAnalysisResult["frequency"] = null;
  if (dated.length >= Math.max(3, comments.length * 0.5)) {
    const byDay = new Map<string, number>();
    for (const c of dated) {
      const d = (c.publishedAt as string).slice(0, 10);
      byDay.set(d, (byDay.get(d) ?? 0) + 1);
    }
    frequency = [...byDay.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([date, count]) => ({ date, count }));
  }

  const mostLiked = comments
    .filter((c) => (c.likeCount ?? 0) > 0)
    .sort((a, b) => (b.likeCount ?? 0) - (a.likeCount ?? 0))
    .slice(0, 5)
    .map((c) => ({ text: c.text, likeCount: c.likeCount ?? 0 }));

  return {
    total: texts.length,
    analyzedWords: termDocs.reduce((s, d) => s + d.length, 0),
    questions: { totalQuestions: questionList.length, commentsWithQuestions, groups: questionGroups.slice(0, 15) },
    requests: { total: requests.length, groups: requestGroups.slice(0, 12) },
    topics,
    terms,
    sentiment: { counts, examples },
    frequency,
    mostLiked,
  };
}

/** Split pasted text into comments: one per line, or blank-line separated blocks if lines look wrapped. */
export function splitPastedComments(raw: string): string[] {
  const text = raw.replace(/\r\n/g, "\n").trim();
  if (!text) return [];
  const blocks = text.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  // If the text is clearly separated into blocks, keep multi-line comments together.
  return blocks.length > 1 && blocks.length < lines.length * 0.8 ? blocks.map((b) => b.replace(/\n/g, " ")) : lines;
}
