"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Check, Hash } from "lucide-react";
import { CopyButton } from "@/components/tool/copy-button";
import { EmptyState } from "@/components/tool/states";
import { Label, Textarea } from "@/components/ui/primitives";
import { Segmented } from "@/components/ui/segmented";
import { LIMITS, suggestHashtags, type HashtagStyle } from "@/lib/youtube/writing";
import { cn } from "@/lib/utils";

export function HashtagGenerator() {
  const [text, setText] = useState("");
  const [style, setStyle] = useState<HashtagStyle>("camel");
  // Stored lower-case so switching style keeps the same selection.
  const [removed, setRemoved] = useState<Set<string>>(new Set());

  const all = useMemo(() => suggestHashtags(text, style), [text, style]);
  const chosen = all.filter((h) => !removed.has(h.toLocaleLowerCase()));
  const over = chosen.length > LIMITS.hashtagsMax;
  const output = chosen.join(" ");

  function toggle(h: string) {
    const key = h.toLocaleLowerCase();
    setRemoved((s) => {
      const next = new Set(s);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <div className="space-y-5 rounded-3xl border border-line bg-surface p-5 shadow-raised sm:p-7">
        <div>
          <Label htmlFor="ht-input">Your video&apos;s topic and keywords</Label>
          <Textarea
            id="ht-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={"easy pasta recipe, weeknight dinner, italian cooking"}
            rows={5}
            autoFocus
          />
          <p className="mt-2 text-[13px] text-muted">Separate ideas with commas or new lines. Multi-word ideas become one hashtag.</p>
        </div>
        <div>
          <Label>Style</Label>
          <Segmented
            label="Hashtag style"
            value={style}
            onChange={setStyle}
            options={[
              { value: "camel", label: "#EasyToRead" },
              { value: "lower", label: "#alllowercase" },
            ]}
          />
          <p className="mt-2 text-[13px] text-muted">Capital letters make multi-word hashtags easier to read. YouTube treats both the same.</p>
        </div>
      </div>

      <div className="space-y-4">
        {all.length ? (
          <div className="rounded-3xl border border-line bg-surface p-5 shadow-card sm:p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-[17px] font-medium text-ink">
                {chosen.length} hashtag{chosen.length === 1 ? "" : "s"} selected
              </p>
              <p className="text-[13px] text-muted">Tap one to leave it out</p>
            </div>
            <ul className="mt-4 flex flex-wrap gap-2">
              {all.map((h) => {
                const on = !removed.has(h.toLocaleLowerCase());
                const position = chosen.indexOf(h);
                return (
                  <li key={h}>
                    <button
                      type="button"
                      aria-pressed={on}
                      onClick={() => toggle(h)}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[14px] transition-colors",
                        on ? "border-accent/30 bg-accent-soft text-ink" : "border-line bg-surface text-faint line-through",
                      )}
                    >
                      {on ? <Check aria-hidden className="h-3.5 w-3.5 text-accent" /> : null}
                      {h}
                      {on && position > -1 && position < LIMITS.hashtagsAboveTitle ? (
                        <span className="rounded-full bg-cta px-1.5 text-[10.5px] text-cta-ink">above title</span>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
            {over ? (
              <p className="mt-4 flex items-start gap-2 rounded-xl bg-warning-soft p-3 text-[13.5px] text-ink-2">
                <AlertTriangle aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                You have more than {LIMITS.hashtagsMax}. YouTube ignores all hashtags on a video that uses too many — remove some.
              </p>
            ) : null}
            <div className="mt-5 border-t border-line pt-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[14px] text-muted">Ready to paste</p>
                <CopyButton value={output} label="Copy hashtags" showLabel />
              </div>
              <p className="mt-3 rounded-xl border border-line bg-surface-2 p-3.5 font-mono text-[13.5px] break-words text-ink">{output || "Nothing selected."}</p>
              <p className="mt-2 text-[13px] text-muted">
                Put them at the end of your description. The first {LIMITS.hashtagsAboveTitle} can show above your title.
              </p>
            </div>
          </div>
        ) : (
          <EmptyState
            className="h-full min-h-72"
            icon={<Hash aria-hidden className="h-5 w-5" />}
            title="Your hashtags will appear here"
            description="Type your video's topic and a few keywords on the left."
          />
        )}
      </div>
    </div>
  );
}
