"use client";

import { useState } from "react";
import { Check, Link2, Tags } from "lucide-react";
import { UrlInput } from "@/components/tool/url-input";
import { EmptyState, ErrorState, LoadingState, MockDataBanner } from "@/components/tool/states";
import { CopyButton } from "@/components/tool/copy-button";
import { Segmented } from "@/components/ui/segmented";
import { useVideoDetails } from "@/components/youtube/use-video-details";
import { errorMessage, errorTitle } from "@/lib/client-api";
import { cn } from "@/lib/utils";

type Format = "comma" | "lines" | "hashtags";

function formatTags(tags: string[], format: Format): string {
  if (format === "lines") return tags.join("\n");
  if (format === "hashtags") return tags.map((t) => `#${t.replace(/\s+/g, "")}`).join(" ");
  return tags.join(", ");
}

export function TagExtractor() {
  const [input, setInput] = useState("");
  const [format, setFormat] = useState<Format>("comma");
  const [deselected, setDeselected] = useState<Set<string>>(new Set());
  const { loading, error, invalid, data, lookup } = useVideoDetails();
  const tags = data?.video.tags ?? [];
  const chosen = tags.filter((t) => !deselected.has(t));
  const output = formatTags(chosen, format);

  function toggle(tag: string) {
    setDeselected((s) => {
      const next = new Set(s);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  }

  return (
    <div className="space-y-8">
      <UrlInput
        value={input}
        onChange={setInput}
        onSubmit={(v) => {
          setDeselected(new Set());
          lookup(v);
        }}
        loading={loading}
        label="YouTube video link"
        placeholder="Paste your YouTube video link"
        submitLabel="Get tags"
        icon={<Link2 className="h-5 w-5" />}
        examples={[{ label: "Example video", value: "https://www.youtube.com/watch?v=jNQXAC9IVRw" }]}
      />

      {invalid ? (
        <ErrorState
          title="That doesn't look like a YouTube video link"
          description="Open the video on YouTube, press Share → Copy, then paste the link here."
        />
      ) : null}
      {loading ? <LoadingState label="Finding the tags…" rows={2} /> : null}
      {error ? <ErrorState title={errorTitle(error)} description={errorMessage(error)} /> : null}

      {data ? (
        <div className="animate-fade-up space-y-4" aria-live="polite">
          {data.source === "mock" ? <MockDataBanner /> : null}
          {tags.length === 0 ? (
            <EmptyState
              icon={<Tags aria-hidden className="h-5 w-5" />}
              title="This video doesn't use any tags"
              description="Many creators skip tags — YouTube relies mostly on the title, description and thumbnail."
            />
          ) : (
            <div className="rounded-3xl border border-line bg-surface p-5 shadow-raised sm:p-7">
              <p className="truncate text-[14px] text-muted">{data.video.title}</p>
              <div className="mt-1 flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-[22px] font-medium tracking-[-0.02em] text-ink">{tags.length} tags found</h2>
                <p className="text-[13px] text-muted">Tap a tag to leave it out</p>
              </div>
              <ul className="mt-5 flex flex-wrap gap-2">
                {tags.map((t) => {
                  const on = !deselected.has(t);
                  return (
                    <li key={t}>
                      <button
                        type="button"
                        aria-pressed={on}
                        onClick={() => toggle(t)}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[14px] transition-colors",
                          on ? "border-accent/30 bg-accent-soft text-ink" : "border-line bg-surface text-faint line-through",
                        )}
                      >
                        {on ? <Check aria-hidden className="h-3.5 w-3.5 text-accent" /> : null}
                        {t}
                      </button>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-6 space-y-3 border-t border-line pt-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <Segmented
                    label="Copy format"
                    size="sm"
                    value={format}
                    onChange={setFormat}
                    options={[
                      { value: "comma", label: "Comma separated" },
                      { value: "lines", label: "One per line" },
                      { value: "hashtags", label: "Hashtags" },
                    ]}
                  />
                  <CopyButton value={output} label={`Copy ${chosen.length} tags`} showLabel className="h-10 px-4 text-[14px]" />
                </div>
                <pre className="max-h-48 overflow-auto rounded-xl border border-line bg-surface-2 p-3.5 font-mono text-[13px] whitespace-pre-wrap text-ink-2">
                  {output || "No tags selected."}
                </pre>
                <p className="text-[13px] text-muted">{output.length} characters (YouTube allows up to 500).</p>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
