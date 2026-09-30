"use client";

import { useState } from "react";
import { CopyButton } from "@/components/tool/copy-button";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SMALL_WORDS = new Set("a an and as at but by for from in into nor of on or over per the to up via with".split(" "));

const cap = (w: string) => w.charAt(0).toLocaleUpperCase() + w.slice(1);

const MODES = {
  sentence: {
    label: "Sentence case",
    fn: (s: string) => s.toLocaleLowerCase().replace(/(^\s*|[.!?]\s+|\n\s*)(\p{L})/gu, (_, p, c: string) => p + c.toLocaleUpperCase()),
  },
  lower: { label: "lowercase", fn: (s: string) => s.toLocaleLowerCase() },
  upper: { label: "UPPERCASE", fn: (s: string) => s.toLocaleUpperCase() },
  title: {
    label: "Title Case",
    fn: (s: string) =>
      s
        .toLocaleLowerCase()
        .split(/(\s+)/)
        .map((w, i, arr) => (i === 0 || i === arr.length - 1 || !SMALL_WORDS.has(w) ? cap(w) : w))
        .join(""),
  },
  capitalized: { label: "Capitalized Case", fn: (s: string) => s.toLocaleLowerCase().replace(/(^|\s)(\p{L})/gu, (_, p, c: string) => p + c.toLocaleUpperCase()) },
  alternating: {
    label: "aLtErNaTiNg",
    fn: (s: string) => {
      let i = 0;
      return [...s].map((ch) => (/\p{L}/u.test(ch) ? (i++ % 2 ? ch.toLocaleUpperCase() : ch.toLocaleLowerCase()) : ch)).join("");
    },
  },
  inverse: {
    label: "iNVERSE cASE",
    fn: (s: string) => [...s].map((ch) => (ch === ch.toLocaleUpperCase() ? ch.toLocaleLowerCase() : ch.toLocaleUpperCase())).join(""),
  },
} as const;

type Mode = keyof typeof MODES;

export function CaseConverter() {
  const [text, setText] = useState("");
  const [last, setLast] = useState<Mode | null>(null);

  function apply(mode: Mode) {
    setText((t) => MODES[mode].fn(t));
    setLast(mode);
  }

  return (
    <div className="rounded-3xl border border-line bg-surface shadow-raised">
      <div className="flex flex-wrap gap-2 border-b border-line p-4 sm:p-5" role="group" aria-label="Change text to">
        {(Object.keys(MODES) as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => apply(m)}
            disabled={!text}
            className={cn(
              "h-10 rounded-full border px-4 text-[14px] font-medium transition-colors disabled:opacity-50",
              last === m ? "border-cta bg-cta text-cta-ink" : "border-line bg-surface text-ink hover:border-line-strong hover:bg-bg-subtle",
            )}
          >
            {MODES[m].label}
          </button>
        ))}
      </div>
      <label htmlFor="cc-text" className="sr-only">
        Your text
      </label>
      <textarea
        id="cc-text"
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setLast(null);
        }}
        placeholder="Type or paste your text here, then pick a style above…"
        autoFocus
        className="block min-h-72 w-full resize-y bg-transparent p-5 text-[16px] leading-[1.6] text-ink outline-none placeholder:text-faint sm:min-h-80 sm:p-7"
      />
      <div className="flex items-center justify-between gap-2 border-t border-line px-4 py-3 sm:px-5">
        <p className="text-[13px] text-muted" aria-live="polite">
          {last ? `Changed to ${MODES[last].label}.` : "Private — your text never leaves this page."}
        </p>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => setText("")} disabled={!text}>
            Clear
          </Button>
          <CopyButton value={text} label="Copy text" showLabel />
        </div>
      </div>
    </div>
  );
}
