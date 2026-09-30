"use client";

import { useMemo, useState } from "react";
import { Eraser } from "lucide-react";
import { CopyButton } from "@/components/tool/copy-button";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/utils";

const WPM_READ = 238;
const WPM_SPEAK = 150;

function minutes(words: number, wpm: number): string {
  if (!words) return "0 sec";
  const secs = Math.max(1, Math.round((words / wpm) * 60));
  return secs < 60 ? `${secs} sec` : `${Math.floor(secs / 60)} min ${secs % 60 ? `${secs % 60} sec` : ""}`.trim();
}

export function countText(text: string) {
  const trimmed = text.trim();
  const words = trimmed ? (trimmed.match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu) ?? []).length : 0;
  return {
    words,
    characters: [...text].length,
    charactersNoSpaces: [...text.replace(/\s/g, "")].length,
    sentences: trimmed ? (trimmed.match(/[^.!?…]+[.!?…]+|[^.!?…]+$/g) ?? []).filter((s) => /[\p{L}\p{N}]/u.test(s)).length : 0,
    paragraphs: trimmed ? trimmed.split(/\n\s*\n/).filter((p) => p.trim()).length : 0,
    lines: text ? text.split("\n").length : 0,
  };
}

export function WordCounter() {
  const [text, setText] = useState("");
  const c = useMemo(() => countText(text), [text]);

  const stats = [
    { label: "Words", value: formatNumber(c.words), big: true },
    { label: "Characters", value: formatNumber(c.characters), big: true },
    { label: "Characters (no spaces)", value: formatNumber(c.charactersNoSpaces) },
    { label: "Sentences", value: formatNumber(c.sentences) },
    { label: "Paragraphs", value: formatNumber(c.paragraphs) },
    { label: "Reading time", value: minutes(c.words, WPM_READ) },
    { label: "Speaking time", value: minutes(c.words, WPM_SPEAK) },
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="flex flex-col rounded-3xl border border-line bg-surface shadow-raised">
        <label htmlFor="wc-text" className="sr-only">
          Your text
        </label>
        <textarea
          id="wc-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type or paste your text here…"
          autoFocus
          className="min-h-80 flex-1 resize-y rounded-t-3xl bg-transparent p-5 text-[16px] leading-[1.6] text-ink outline-none placeholder:text-faint sm:min-h-[420px] sm:p-7"
        />
        <div className="flex items-center justify-between gap-2 border-t border-line px-4 py-3 sm:px-5">
          <p className="text-[13px] text-muted">Private — your text never leaves this page.</p>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => setText("")} disabled={!text}>
              <Eraser aria-hidden className="h-3.5 w-3.5" /> Clear
            </Button>
            <CopyButton value={text} label="Copy text" showLabel />
          </div>
        </div>
      </div>

      <dl aria-live="polite" className="grid grid-cols-2 gap-3 self-start lg:grid-cols-1">
        {stats.map((s) => (
          <div key={s.label} className={s.big ? "rounded-2xl border border-line bg-surface p-5 shadow-card" : "rounded-2xl border border-line bg-bg-subtle px-5 py-3.5"}>
            <dt className="text-[13px] text-muted">{s.label}</dt>
            <dd className={s.big ? "num mt-1 text-[36px] leading-none font-medium tracking-[-0.03em] text-ink" : "num mt-0.5 text-[17px] font-medium text-ink"}>
              {s.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
