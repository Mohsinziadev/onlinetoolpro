"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Plus, X } from "lucide-react";
import { CopyButton } from "@/components/tool/copy-button";
import { Input, Label, Textarea } from "@/components/ui/primitives";
import { parseChapters, validateChapters, formatChapters } from "@/lib/timestamps";
import { LIMITS, findHashtags, toHashtag } from "@/lib/youtube/writing";
import { cn } from "@/lib/utils";

type LinkRow = { label: string; url: string };

/** Assembles a description in the order viewers read it: summary → details → chapters → links → call to action → hashtags. */
function buildDescription(f: { summary: string; details: string; chapters: string; links: LinkRow[]; cta: string; hashtags: string }) {
  const parts: string[] = [];
  if (f.summary.trim()) parts.push(f.summary.trim());
  if (f.details.trim()) parts.push(f.details.trim());

  const parsed = parseChapters(f.chapters);
  if (parsed.chapters.length) {
    const useHours = parsed.chapters.some((c) => c.seconds >= 3600);
    parts.push(["Chapters", ...formatChapters(parsed.chapters, { pad: true, separator: " ", forceHours: useHours })].join("\n"));
  }

  const links = f.links.filter((l) => l.url.trim());
  if (links.length) parts.push(["Links", ...links.map((l) => (l.label.trim() ? `${l.label.trim()}: ${l.url.trim()}` : l.url.trim()))].join("\n"));
  if (f.cta.trim()) parts.push(f.cta.trim());

  const tags = f.hashtags
    .split(/[\s,]+/)
    .map((t) => toHashtag(t))
    .filter((t): t is string => Boolean(t));
  if (tags.length) parts.push(tags.join(" "));

  return { text: parts.join("\n\n"), chapters: parsed.chapters };
}

export function DescriptionGenerator() {
  const [summary, setSummary] = useState("");
  const [details, setDetails] = useState("");
  const [chapters, setChapters] = useState("");
  const [links, setLinks] = useState<LinkRow[]>([{ label: "", url: "" }]);
  const [cta, setCta] = useState("");
  const [hashtags, setHashtags] = useState("");

  const built = useMemo(() => buildDescription({ summary, details, chapters, links, cta, hashtags }), [summary, details, chapters, links, cta, hashtags]);
  const chapterIssues = built.chapters.length ? validateChapters(built.chapters, null).filter((i) => i.level === "error") : [];
  const hashtagCount = findHashtags(built.text).length;
  const length = built.text.length;
  const preview = built.text.slice(0, LIMITS.descriptionPreview);

  function setLink(i: number, patch: Partial<LinkRow>) {
    setLinks((rows) => rows.map((r, k) => (k === i ? { ...r, ...patch } : r)));
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-5 rounded-3xl border border-line bg-surface p-5 shadow-raised sm:p-7">
        <div>
          <Label htmlFor="dg-summary">What is the video about? (most important)</Label>
          <Textarea id="dg-summary" value={summary} onChange={(e) => setSummary(e.target.value)} rows={3} placeholder="In this video I show you how to make an easy 20-minute pasta for busy weeknights." autoFocus />
          <p className="mt-1.5 text-[13px] text-muted">Only the first line or two show before “…more”, so say what the video is about here.</p>
        </div>
        <div>
          <Label htmlFor="dg-details">More details (optional)</Label>
          <Textarea id="dg-details" value={details} onChange={(e) => setDetails(e.target.value)} rows={3} placeholder="Ingredients, equipment, who the video is for…" />
        </div>
        <div>
          <Label htmlFor="dg-chapters">Chapters (optional)</Label>
          <Textarea id="dg-chapters" value={chapters} onChange={(e) => setChapters(e.target.value)} rows={4} placeholder={"0:00 Intro\n1:30 Ingredients\n4:05 Cooking the sauce"} className="font-mono text-[14px]" />
        </div>
        <div>
          <Label>Links (optional)</Label>
          <div className="space-y-2">
            {links.map((l, i) => (
              <div key={i} className="flex gap-2">
                <Input value={l.label} onChange={(e) => setLink(i, { label: e.target.value })} placeholder="Label, e.g. Recipe" aria-label={`Link ${i + 1} label`} className="w-2/5" />
                <Input value={l.url} onChange={(e) => setLink(i, { url: e.target.value })} placeholder="https://…" aria-label={`Link ${i + 1} address`} inputMode="url" />
                {links.length > 1 ? (
                  <button type="button" onClick={() => setLinks((rows) => rows.filter((_, k) => k !== i))} aria-label={`Remove link ${i + 1}`} className="shrink-0 rounded-full p-2 text-muted hover:bg-bg-subtle hover:text-ink">
                    <X className="h-4 w-4" />
                  </button>
                ) : null}
              </div>
            ))}
          </div>
          {links.length < 8 ? (
            <button type="button" onClick={() => setLinks((rows) => [...rows, { label: "", url: "" }])} className="mt-2 inline-flex items-center gap-1 text-[14px] font-medium text-accent">
              <Plus aria-hidden className="h-4 w-4" /> Add a link
            </button>
          ) : null}
        </div>
        <div>
          <Label htmlFor="dg-cta">Closing line (optional)</Label>
          <Input id="dg-cta" value={cta} onChange={(e) => setCta(e.target.value)} placeholder="Subscribe for a new recipe every week." />
        </div>
        <div>
          <Label htmlFor="dg-tags">Hashtags (optional)</Label>
          <Input id="dg-tags" value={hashtags} onChange={(e) => setHashtags(e.target.value)} placeholder="pasta, easy recipes, dinner" />
        </div>
      </div>

      <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-3xl border border-line bg-surface p-5 shadow-card sm:p-6">
          <p className="text-[13px] text-muted">How the top of your description looks under a video</p>
          <p className="mt-3 rounded-xl bg-bg-subtle p-4 text-[14px] leading-[1.5] whitespace-pre-line text-ink">
            {preview || <span className="text-faint">Start with a sentence about your video…</span>}
            {built.text.length > LIMITS.descriptionPreview ? <span className="font-medium text-ink"> …more</span> : null}
          </p>
        </div>

        <div className="rounded-3xl border border-line bg-surface p-5 shadow-card sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[15px] font-medium text-ink">Your description</p>
            <CopyButton value={built.text} label="Copy description" showLabel />
          </div>
          <Textarea readOnly value={built.text} rows={12} className="mt-3 text-[14px]" onFocus={(e) => e.currentTarget.select()} />
          <p className={cn("mt-2 text-[13px]", length > LIMITS.descriptionMax ? "text-danger" : "text-muted")}>
            {length.toLocaleString()} / {LIMITS.descriptionMax.toLocaleString()} characters
          </p>
          {chapterIssues.length || hashtagCount > LIMITS.hashtagsMax ? (
            <ul className="mt-3 space-y-2">
              {chapterIssues.map((i) => (
                <li key={i.message} className="flex items-start gap-2 rounded-xl bg-warning-soft p-3 text-[13.5px] text-ink-2">
                  <AlertTriangle aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-warning" /> Chapters: {i.message}
                </li>
              ))}
              {hashtagCount > LIMITS.hashtagsMax ? (
                <li className="flex items-start gap-2 rounded-xl bg-warning-soft p-3 text-[13.5px] text-ink-2">
                  <AlertTriangle aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-warning" /> More than {LIMITS.hashtagsMax} hashtags — YouTube would ignore them all.
                </li>
              ) : null}
            </ul>
          ) : null}
        </div>
      </div>
    </div>
  );
}
