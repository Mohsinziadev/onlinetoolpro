/**
 * Client-safe helpers for YouTube titles, descriptions and hashtags, based on
 * YouTube's published guidance:
 * - Titles: up to 100 characters; long titles get cut off in search and on phones.
 * - Descriptions: up to 5,000 characters; only the first lines show before "…more".
 * - Hashtags: no spaces; more than 15 on a video and YouTube ignores all of them;
 *   the first three from the description can appear above the title.
 * - Chapters: start at 00:00, at least 3, ascending, each at least 10 seconds.
 */
import { parseChapters, validateChapters, type Chapter } from "@/lib/timestamps";

export const LIMITS = {
  titleMax: 100,
  titleVisible: 70,
  descriptionMax: 5000,
  descriptionPreview: 150,
  hashtagsMax: 15,
  hashtagsAboveTitle: 3,
  tagsCharsMax: 500,
} as const;

/* ——— hashtags ——— */

export type HashtagStyle = "camel" | "lower";

/** "cooking tips!" → "#CookingTips" (camel) or "#cookingtips" (lower). Returns null if nothing usable is left. */
export function toHashtag(phrase: string, style: HashtagStyle = "camel"): string | null {
  const words = phrase
    .normalize("NFKC")
    .replace(/^#+/, "")
    .split(/[^\p{L}\p{N}_]+/u)
    .filter(Boolean);
  if (!words.length) return null;
  const body =
    style === "camel"
      ? words.map((w) => w.charAt(0).toLocaleUpperCase() + w.slice(1)).join("")
      : words.join("").toLocaleLowerCase();
  // A hashtag made only of numbers isn't treated as a hashtag.
  if (!/\p{L}/u.test(body)) return null;
  return `#${body}`;
}

const STOP = new Set("a an and are as at be but by for from how i in into is it its my of on or so that the this to was what when why with you your".split(" "));

/**
 * Suggest hashtags from free text: every phrase the user wrote (comma/newline separated)
 * plus meaningful single words from those phrases. De-duplicated case-insensitively.
 */
export function suggestHashtags(input: string, style: HashtagStyle): string[] {
  const phrases = input
    .split(/[,\n;]+/)
    .map((p) => p.trim())
    .filter(Boolean);
  const out: string[] = [];
  const seen = new Set<string>();
  const add = (h: string | null) => {
    if (!h) return;
    const key = h.toLocaleLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    out.push(h);
  };
  phrases.forEach((p) => add(toHashtag(p, style)));
  phrases.forEach((p) =>
    p
      .split(/\s+/)
      .map((w) => w.replace(/[^\p{L}\p{N}_]/gu, ""))
      .filter((w) => w.length > 2 && !STOP.has(w.toLocaleLowerCase()))
      .forEach((w) => add(toHashtag(w, style))),
  );
  return out;
}

/** All #hashtags in a block of text, in order. */
export function findHashtags(text: string): string[] {
  return text.match(/(^|\s)#[\p{L}\p{N}_]+/gu)?.map((h) => h.trim()) ?? [];
}

/* ——— chapters ——— */

const TIMESTAMP_LINE = /^\s*[[(]?(\d{1,2}:)?\d{1,2}:\d{2}/;

/** Chapters written as lines that start with a timestamp, the way YouTube reads them. */
export function findChapters(description: string): Chapter[] {
  const lines = description.split(/\r?\n/).filter((l) => TIMESTAMP_LINE.test(l));
  return parseChapters(lines.join("\n")).chapters;
}

/* ——— checks ——— */

export type CheckStatus = "pass" | "improve" | "tip";
export type Check = { id: string; label: string; status: CheckStatus; detail: string };

type VideoForChecks = {
  title: string;
  description: string;
  tags: string[];
  durationSeconds: number | null;
  hasCaptions: boolean;
  definition: string | null;
};

/**
 * Checks against YouTube's published guidelines. Deliberately no overall score:
 * each result explains itself, and nothing here predicts ranking.
 */
export function runSeoChecks(v: VideoForChecks): Check[] {
  const checks: Check[] = [];
  const title = v.title.trim();
  const desc = v.description.trim();

  // Title length
  if (title.length < 20)
    checks.push({ id: "title-length", label: "Title length", status: "improve", detail: `The title is ${title.length} characters. Very short titles give viewers and YouTube little to go on — describe what the video is about.` });
  else if (title.length > LIMITS.titleVisible)
    checks.push({ id: "title-length", label: "Title length", status: "improve", detail: `The title is ${title.length} characters. Titles longer than about ${LIMITS.titleVisible} characters are often cut off in search and on phones, so put the most important words first.` });
  else checks.push({ id: "title-length", label: "Title length", status: "pass", detail: `${title.length} characters — short enough to show in full in most places.` });

  // All caps
  const letters = title.replace(/[^\p{L}]/gu, "");
  if (letters.length > 8 && letters === letters.toLocaleUpperCase())
    checks.push({ id: "title-caps", label: "Title capitals", status: "improve", detail: "The whole title is in capital letters, which is harder to read. Use capitals for one or two words at most." });

  // Description
  if (!desc) checks.push({ id: "description", label: "Description", status: "improve", detail: "The description is empty. Add a few sentences explaining what viewers will get — it helps both viewers and YouTube understand the video." });
  else if (desc.length < 200)
    checks.push({ id: "description", label: "Description", status: "improve", detail: `The description is ${desc.length} characters. A few more sentences about the video's topic give viewers and search more context.` });
  else checks.push({ id: "description", label: "Description", status: "pass", detail: `${desc.length.toLocaleString()} characters, within YouTube's ${LIMITS.descriptionMax.toLocaleString()}-character limit.` });

  // First line
  if (desc) {
    const first = desc.split(/\r?\n/).find((l) => l.trim())?.trim() ?? "";
    if (/^https?:\/\//i.test(first) || first.length < 30)
      checks.push({ id: "first-line", label: "Opening line", status: "improve", detail: "Only the first lines show before “…more”. Start with a sentence that says what the video is about, rather than a link or a short phrase." });
    else checks.push({ id: "first-line", label: "Opening line", status: "pass", detail: "The description opens with a sentence, which is what viewers see before “…more”." });
  }

  // Chapters
  const chapters = findChapters(desc);
  if (chapters.length) {
    const errors = validateChapters(chapters, v.durationSeconds).filter((i) => i.level === "error");
    checks.push(
      errors.length
        ? { id: "chapters", label: "Chapters", status: "improve", detail: `Timestamps were found, but YouTube may not turn them into chapters: ${errors[0].message}` }
        : { id: "chapters", label: "Chapters", status: "pass", detail: `${chapters.length} chapters that follow YouTube's rules.` },
    );
  } else if ((v.durationSeconds ?? 0) > 5 * 60) {
    checks.push({ id: "chapters", label: "Chapters", status: "tip", detail: "No chapters found. For longer videos, chapters help viewers jump to what they need — add timestamps starting at 00:00." });
  }

  // Hashtags
  const hashtags = [...findHashtags(v.title), ...findHashtags(desc)];
  if (hashtags.length > LIMITS.hashtagsMax)
    checks.push({ id: "hashtags", label: "Hashtags", status: "improve", detail: `${hashtags.length} hashtags found. With more than ${LIMITS.hashtagsMax}, YouTube ignores all of the video's hashtags.` });
  else if (hashtags.length)
    checks.push({ id: "hashtags", label: "Hashtags", status: "pass", detail: `${hashtags.length} hashtag${hashtags.length === 1 ? "" : "s"}, within YouTube's limit of ${LIMITS.hashtagsMax}.` });
  else checks.push({ id: "hashtags", label: "Hashtags", status: "tip", detail: "No hashtags. They're optional — if you add a few relevant ones, the first three can appear above the title." });

  // Tags
  const tagChars = v.tags.join(",").length;
  if (tagChars > LIMITS.tagsCharsMax)
    checks.push({ id: "tags", label: "Tags", status: "improve", detail: `Tags use ${tagChars} characters; YouTube allows ${LIMITS.tagsCharsMax}.` });
  else
    checks.push({
      id: "tags",
      label: "Tags",
      status: v.tags.length ? "pass" : "tip",
      detail: v.tags.length
        ? `${v.tags.length} tags. YouTube says tags play a small role, mostly for common misspellings.`
        : "No tags. That's fine — YouTube says tags play a small role compared with the title, thumbnail and description.",
    });

  // Captions
  checks.push(
    v.hasCaptions
      ? { id: "captions", label: "Captions", status: "pass", detail: "The video has uploaded captions, which help viewers who watch without sound." }
      : { id: "captions", label: "Captions", status: "tip", detail: "No uploaded captions. YouTube's automatic captions may still exist; reviewing or uploading captions improves accuracy." },
  );

  // Quality
  if (v.definition === "sd")
    checks.push({ id: "quality", label: "Video quality", status: "tip", detail: "The video is only available in standard definition. Uploading in HD looks better on large screens." });

  return checks;
}
