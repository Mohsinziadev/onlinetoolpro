"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, ListOrdered, Wand2 } from "lucide-react";
import { CopyButton } from "@/components/tool/copy-button";
import { NumberField } from "@/components/calculators/calc-ui";
import { Segmented, Switch } from "@/components/ui/segmented";
import { Button } from "@/components/ui/button";
import { Card, Textarea } from "@/components/ui/primitives";
import { parseDuration } from "@/lib/calc";
import { formatChapters, formatTimestamp, parseChapters, validateChapters, type Chapter } from "@/lib/timestamps";
import { cn } from "@/lib/utils";

const SEPARATORS = [
  { value: " ", label: "0:00 Title" },
  { value: " - ", label: "0:00 - Title" },
  { value: " – ", label: "0:00 – Title" },
] as const;

const SAMPLE = `00:00 Introduction
02:14 First topic
05:42 Second topic
Recap and next steps 9:05`;

export function TimestampGenerator() {
  const [input, setInput] = useState(SAMPLE);
  const [separator, setSeparator] = useState<(typeof SEPARATORS)[number]["value"]>(" ");
  const [pad, setPad] = useState(true);
  const [sort, setSort] = useState(true);
  const [addIntro, setAddIntro] = useState(false);
  const [header, setHeader] = useState(true);
  const [length, setLength] = useState("");
  const [generated, setGenerated] = useState(false);

  const parsed = useMemo(() => parseChapters(input), [input]);
  const chapters: Chapter[] = useMemo(() => {
    let list = sort ? [...parsed.chapters].sort((a, b) => a.seconds - b.seconds) : parsed.chapters;
    if (addIntro && list.length && list[0].seconds !== 0) list = [{ seconds: 0, title: "Intro", line: 0 }, ...list];
    return list;
  }, [parsed, sort, addIntro]);

  const videoLength = length.trim() ? parseDuration(length) : null;
  const lengthErr = length.trim() && videoLength === null ? "Use HH:MM:SS or MM:SS." : null;
  const issues = useMemo(() => validateChapters(chapters, videoLength), [chapters, videoLength]);
  const errors = issues.filter((i) => i.level === "error");
  const lines = formatChapters(chapters, { pad, separator });
  const output = `${header ? "Chapters\n" : ""}${lines.join("\n")}`;
  const useHours = chapters.some((c) => c.seconds >= 3600);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-5 rounded-[20px] border border-line bg-surface p-5 shadow-raised sm:p-6">
        <div>
          <label htmlFor="ts-input" className="mb-1.5 flex items-center gap-2 text-[13px] font-medium text-ink">
            <ListOrdered aria-hidden className="h-4 w-4 text-muted" /> Your chapters
          </label>
          <Textarea
            id="ts-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-56 font-mono text-[13.5px]"
            spellCheck={false}
            placeholder={"00:00 Introduction\n02:14 First topic"}
          />
          <p className="mt-1.5 text-xs text-muted">One chapter per line. Timestamps can be at the start or end: 2:14, 1:02:14, [2:14] or 2m14s.</p>
        </div>
        <NumberField
          label="Video length (optional)"
          value={length}
          onChange={setLength}
          inputMode="text"
          placeholder="e.g. 12:04"
          error={lengthErr}
          hint="Used to check that the last chapter is at least 10 seconds long."
        />
        <div>
          <p className="mb-1.5 text-[13px] font-medium text-ink">Format</p>
          <Segmented label="Format" size="sm" value={separator} onChange={setSeparator} options={SEPARATORS} />
        </div>
        <div className="divide-y divide-line">
          {useHours ? null : <Switch label="Pad minutes (02:14 instead of 2:14)" checked={pad} onChange={setPad} />}
          <Switch label="Sort by time" checked={sort} onChange={setSort} />
          <Switch label="Add “Intro” at 0:00 if missing" checked={addIntro} onChange={setAddIntro} />
          <Switch label="Add “Chapters” heading" checked={header} onChange={setHeader} />
        </div>
        <Button size="lg" className="w-full" onClick={() => setGenerated(true)} disabled={chapters.length === 0}>
          <Wand2 aria-hidden className="h-4 w-4" /> Generate YouTube description timestamps
        </Button>
      </div>

      <div className="min-w-0 space-y-4" aria-live="polite">
        <Card className="p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <p className="text-[15px] font-semibold text-ink">Parsed chapters</p>
            <span className="num text-xs text-muted">{chapters.length} found</span>
          </div>
          {chapters.length ? (
            <ol className="mt-3 divide-y divide-line text-[13.5px]">
              {chapters.map((c, i) => {
                const next = chapters[i + 1]?.seconds ?? videoLength;
                const dur = next !== null && next !== undefined ? next - c.seconds : null;
                return (
                  <li key={`${c.line}-${i}`} className="flex items-center gap-3 py-2">
                    <span className="num w-16 shrink-0 font-mono text-ink">{formatTimestamp(c.seconds, useHours, pad)}</span>
                    <span className="min-w-0 flex-1 truncate text-ink-2">{c.title}</span>
                    {dur !== null ? (
                      <span className={cn("num shrink-0 text-xs", dur < 10 ? "text-danger" : "text-muted")}>
                        {Math.floor(dur / 60)}m {dur % 60}s
                      </span>
                    ) : null}
                  </li>
                );
              })}
            </ol>
          ) : (
            <p className="mt-3 text-sm text-muted">No timestamps recognized yet.</p>
          )}
          {parsed.skipped.length ? (
            <p className="mt-3 text-xs text-muted">
              Skipped {parsed.skipped.length} line{parsed.skipped.length === 1 ? "" : "s"} without a timestamp: {parsed.skipped.map((s) => `line ${s.line}`).join(", ")}.
            </p>
          ) : null}
        </Card>

        {chapters.length ? (
          errors.length === 0 ? (
            <p className="flex items-center gap-2 rounded-2xl border border-success/25 bg-success-soft px-4 py-3 text-[13.5px] text-ink">
              <CheckCircle2 aria-hidden className="h-4 w-4 text-success" /> Meets YouTube&apos;s chapter requirements.
            </p>
          ) : (
            <ul className="space-y-1.5 rounded-2xl border border-danger/25 bg-danger-soft px-4 py-3 text-[13px] text-ink">
              {errors.map((e) => (
                <li key={e.message} className="flex gap-2">
                  <AlertTriangle aria-hidden className="mt-0.5 h-3.5 w-3.5 shrink-0 text-danger" /> {e.message}
                </li>
              ))}
            </ul>
          )
        ) : null}
        {issues
          .filter((i) => i.level === "warning")
          .map((w) => (
            <p key={w.message} className="rounded-xl bg-warning-soft px-4 py-2.5 text-[12.5px] text-ink-2">
              {w.message}
            </p>
          ))}

        {generated && chapters.length ? (
          <Card className="animate-fade-in p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[15px] font-semibold text-ink">Description timestamps</p>
              <CopyButton value={output} label="Copy" showLabel />
            </div>
            <pre className="mt-3 overflow-x-auto rounded-xl border border-line bg-bg-subtle p-4 font-mono text-[13.5px] leading-relaxed whitespace-pre text-ink">
              {output}
            </pre>
            <p className="mt-2 text-xs text-muted">Paste into your video description. Updates automatically as you edit.</p>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
