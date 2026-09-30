/** Parsing, validation and formatting of YouTube chapter timestamps. Client-safe. */

export type Chapter = { seconds: number; title: string; line: number };
export type ParseResult = { chapters: Chapter[]; skipped: { line: number; text: string }[] };

const CLOCK = String.raw`(\d{1,2}:)?\d{1,2}:\d{2}`;
const UNITS = String.raw`(?:\d+h)?\s*(?:\d+m)?\s*(?:\d+s)?`;
const SEP = String.raw`\s*[-–—:|•.)\]]*\s*`;

function toSeconds(raw: string): number | null {
  const s = raw.replace(/[[\]()]/g, "").trim().toLowerCase();
  if (s.includes(":")) {
    const parts = s.split(":").map(Number);
    if (parts.some((p) => !Number.isFinite(p)) || parts.slice(1).some((p) => p >= 60)) return null;
    return parts.reduce((a, p) => a * 60 + p, 0);
  }
  const m = /^(?:(\d+)h)?\s*(?:(\d+)m)?\s*(?:(\d+)s)?$/.exec(s);
  if (!m || !(m[1] || m[2] || m[3])) return null;
  return Number(m[1] ?? 0) * 3600 + Number(m[2] ?? 0) * 60 + Number(m[3] ?? 0);
}

const leading = new RegExp(String.raw`^[\[(]?(${CLOCK}|${UNITS})[\])]?${SEP}(.+)$`, "i");
const trailing = new RegExp(String.raw`^(.+?)\s*[-–—:|•]?\s*[\[(]?(${CLOCK})[\])]?$`, "i");

export function parseChapters(input: string): ParseResult {
  const chapters: Chapter[] = [];
  const skipped: ParseResult["skipped"] = [];
  input.split(/\r?\n/).forEach((rawLine, i) => {
    const text = rawLine.trim().replace(/^[-*•]\s+/, "");
    if (!text) return;
    const lead = leading.exec(text);
    if (lead && lead[1].trim()) {
      const secs = toSeconds(lead[1]);
      const title = lead[lead.length - 1].trim();
      if (secs !== null && title) {
        chapters.push({ seconds: secs, title, line: i + 1 });
        return;
      }
    }
    const trail = trailing.exec(text);
    if (trail) {
      const secs = toSeconds(trail[2]);
      if (secs !== null && trail[1].trim()) {
        chapters.push({ seconds: secs, title: trail[1].trim().replace(/[-–—:|•]+$/, "").trim(), line: i + 1 });
        return;
      }
    }
    skipped.push({ line: i + 1, text });
  });
  return { chapters, skipped };
}

export type FormatOptions = { pad: boolean; separator: string; forceHours?: boolean };

export function formatTimestamp(seconds: number, useHours: boolean, pad: boolean): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const two = (n: number) => n.toString().padStart(2, "0");
  // Hours are never padded (0:02:14), matching how YouTube displays long videos.
  if (useHours) return `${h}:${two(m)}:${two(s)}`;
  return `${pad ? two(m) : m}:${two(s)}`;
}

export function formatChapters(chapters: Chapter[], opts: FormatOptions): string[] {
  const useHours = opts.forceHours || chapters.some((c) => c.seconds >= 3600);
  return chapters.map((c) => `${formatTimestamp(c.seconds, useHours, opts.pad)}${opts.separator}${c.title}`);
}

export type Issue = { level: "error" | "warning"; message: string };

/** Checks against YouTube's documented chapter requirements. */
export function validateChapters(chapters: Chapter[], videoLength: number | null): Issue[] {
  const issues: Issue[] = [];
  if (chapters.length === 0) return issues;
  if (chapters[0].seconds !== 0) issues.push({ level: "error", message: "The first timestamp must be 0:00 for YouTube to create chapters." });
  if (chapters.length < 3) issues.push({ level: "error", message: "YouTube needs at least three timestamps to show chapters." });
  for (let i = 1; i < chapters.length; i++) {
    const gap = chapters[i].seconds - chapters[i - 1].seconds;
    if (gap <= 0) {
      issues.push({ level: "error", message: `“${chapters[i].title}” (line ${chapters[i].line}) isn't later than the previous timestamp. Timestamps must be in ascending order.` });
    } else if (gap < 10) {
      issues.push({ level: "error", message: `“${chapters[i - 1].title}” is only ${gap}s long. Each chapter must be at least 10 seconds.` });
    }
  }
  if (videoLength !== null) {
    const last = chapters[chapters.length - 1];
    if (last.seconds >= videoLength) issues.push({ level: "error", message: `“${last.title}” starts after the video ends.` });
    else if (videoLength - last.seconds < 10) issues.push({ level: "error", message: `The last chapter, “${last.title}”, is shorter than 10 seconds.` });
    if (videoLength < 10) issues.push({ level: "warning", message: "Chapters aren't available on very short videos." });
  }
  const titles = new Set<string>();
  for (const c of chapters) {
    if (c.title.length > 100) issues.push({ level: "warning", message: `Line ${c.line}: long chapter titles are truncated in the player.` });
    const key = c.title.toLowerCase();
    if (titles.has(key)) issues.push({ level: "warning", message: `“${c.title}” is used more than once.` });
    titles.add(key);
  }
  return issues;
}
