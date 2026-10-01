"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Link2, XCircle } from "lucide-react";
import { CopyButton } from "@/components/tool/copy-button";
import { Textarea } from "@/components/ui/primitives";
import { parseVideoInput, type ParsedVideo } from "@/lib/youtube/parse";

const KIND_LABEL: Record<ParsedVideo["kind"], string> = {
  watch: "Watch link",
  short: "Shorts link",
  embed: "Embed link",
  live: "Live link",
  id: "Video ID",
};

export function VideoIdFinder() {
  const [text, setText] = useState("");
  const lines = useMemo(
    () =>
      text
        .split(/\n+/)
        .map((l) => l.trim())
        .filter(Boolean)
        .slice(0, 50),
    [text],
  );
  const results = useMemo(() => lines.map((line) => ({ line, parsed: parseVideoInput(line) })), [lines]);
  const allIds = results.flatMap((r) => (r.parsed ? [r.parsed.id] : [])).join("\n");

  return (
    <div className="space-y-6">
      <div className="rounded-[20px] border border-line bg-surface p-4 shadow-raised sm:p-5">
        <label htmlFor="urls" className="mb-2 flex items-center gap-2 text-[13px] font-medium text-ink-2">
          <Link2 aria-hidden className="h-4 w-4 text-muted" /> YouTube URLs — one per line
        </label>
        <Textarea
          id="urls"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={"https://www.youtube.com/watch?v=dQw4w9WgXcQ\nhttps://youtu.be/dQw4w9WgXcQ\nhttps://www.youtube.com/shorts/…"}
          spellCheck={false}
          className="font-mono text-[13.5px]"
          autoFocus
        />
        <p className="mt-2 text-xs text-muted">Supports watch, youtu.be, Shorts, embed, live and mobile links. Up to 50 at once. Runs in your browser.</p>
      </div>

      {results.length > 0 ? (
        <div className="space-y-3" aria-live="polite">
          {results.length > 1 && allIds ? (
            <div className="flex items-center justify-between rounded-2xl border border-line bg-bg-subtle px-4 py-3">
              <p className="text-sm text-ink-2">
                {results.filter((r) => r.parsed).length} of {results.length} links recognized
              </p>
              <CopyButton value={allIds} label="Copy all IDs" showLabel />
            </div>
          ) : null}
          {results.map(({ line, parsed }, i) =>
            parsed ? (
              <div key={`${line}-${i}`} className="animate-fade-in rounded-2xl border border-line bg-surface p-4 shadow-card sm:p-5">
                <div className="flex items-center gap-2 text-xs text-muted">
                  <CheckCircle2 aria-hidden className="h-4 w-4 text-success" />
                  {KIND_LABEL[parsed.kind]}
                  <span className="truncate font-mono text-faint">{line}</span>
                </div>
                <dl className="mt-4 space-y-2.5">
                  {[
                    ["Video ID", parsed.id],
                    ["Canonical URL", parsed.canonicalUrl],
                    ["Embed URL", parsed.embedUrl],
                  ].map(([label, value]) => (
                    <div key={label} className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-4">
                      <dt className="w-32 shrink-0 text-[13px] text-muted">{label}</dt>
                      <dd className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-line bg-surface-2 py-1.5 pr-1.5 pl-3">
                        <code className="min-w-0 flex-1 truncate font-mono text-[13.5px] text-ink">{value}</code>
                        <CopyButton value={value} label={`Copy ${label}`} />
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            ) : (
              <div key={`${line}-${i}`} className="flex items-start gap-2 rounded-2xl border border-danger/25 bg-danger-soft p-4 text-sm">
                <XCircle aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
                <div className="min-w-0">
                  <p className="font-medium text-ink">Not a recognized YouTube video link</p>
                  <p className="truncate font-mono text-xs text-ink-2">{line}</p>
                  <p className="mt-1 text-xs text-muted">Channel, playlist and search URLs don&apos;t contain a single video ID.</p>
                </div>
              </div>
            ),
          )}
        </div>
      ) : null}
    </div>
  );
}
