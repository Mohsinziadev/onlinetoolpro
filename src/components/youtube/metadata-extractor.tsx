"use client";

import { useState } from "react";
import { Link2 } from "lucide-react";
import { UrlInput } from "@/components/tool/url-input";
import { ErrorState, LoadingState, MockDataBanner } from "@/components/tool/states";
import { CopyButton } from "@/components/tool/copy-button";
import { useVideoDetails } from "@/components/youtube/use-video-details";
import { errorMessage, errorTitle } from "@/lib/client-api";
import { formatDate, formatDuration, formatNumber } from "@/lib/utils";

const INVALID = "Open the video on YouTube, press Share → Copy, then paste the link here.";

export function MetadataExtractor() {
  const [input, setInput] = useState("");
  const { loading, error, invalid, data, lookup } = useVideoDetails();
  const v = data?.video;

  const fields: { label: string; value: string }[] = v
    ? [
        { label: "Title", value: v.title },
        { label: "Channel", value: v.channelTitle },
        { label: "Published", value: formatDate(v.publishedAt, { dateStyle: "long" }) },
        { label: "Length", value: formatDuration(v.durationSeconds) },
        { label: "Views", value: v.viewCount === null ? "Hidden" : formatNumber(v.viewCount) },
        { label: "Likes", value: v.likeCount === null ? "Hidden" : formatNumber(v.likeCount) },
        { label: "Comments", value: v.commentCount === null ? "Turned off" : formatNumber(v.commentCount) },
        { label: "Quality", value: v.definition === "hd" ? "HD" : v.definition === "sd" ? "SD" : "—" },
        { label: "Captions", value: v.hasCaptions ? "Yes" : "No" },
        { label: "Language", value: v.defaultLanguage ?? "Not set" },
        { label: "Video ID", value: v.id },
        { label: "Video link", value: `https://www.youtube.com/watch?v=${v.id}` },
        { label: "Channel ID", value: v.channelId },
      ]
    : [];

  const allText = v
    ? [...fields.map((f) => `${f.label}: ${f.value}`), `Tags: ${v.tags.join(", ") || "None"}`, "", "Description:", v.description].join("\n")
    : "";

  return (
    <div className="space-y-8">
      <UrlInput
        value={input}
        onChange={setInput}
        onSubmit={lookup}
        loading={loading}
        label="YouTube video link"
        placeholder="Paste your YouTube video link"
        submitLabel="Get details"
        icon={<Link2 className="h-5 w-5" />}
        examples={[{ label: "Example video", value: "https://www.youtube.com/watch?v=jNQXAC9IVRw" }]}
      />

      {invalid ? <ErrorState title="That doesn't look like a YouTube video link" description={INVALID} /> : null}
      {loading ? <LoadingState label="Getting the video details…" /> : null}
      {error ? <ErrorState title={errorTitle(error)} description={errorMessage(error)} /> : null}

      {v ? (
        <div className="animate-fade-up space-y-4" aria-live="polite">
          {data?.source === "mock" ? <MockDataBanner /> : null}
          <div className="overflow-hidden rounded-3xl border border-line bg-surface shadow-raised">
            <div className="flex flex-col gap-5 border-b border-line p-5 sm:flex-row sm:items-center sm:p-6">
              {v.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={v.thumbnailUrl} alt="" className="aspect-video w-full rounded-xl border border-line object-cover sm:w-48" />
              ) : null}
              <div className="min-w-0 flex-1">
                <p className="text-[19px] leading-snug font-medium tracking-[-0.01em] text-ink">{v.title}</p>
                <p className="mt-1 text-[14px] text-muted">{v.channelTitle}</p>
              </div>
              <CopyButton value={allText} label="Copy everything" showLabel className="h-10 px-4 text-[14px]" />
            </div>
            <dl className="divide-y divide-line">
              {fields.map((f) => (
                <div key={f.label} className="flex items-center gap-4 px-5 py-3 sm:px-6">
                  <dt className="w-28 shrink-0 text-[14px] text-muted">{f.label}</dt>
                  <dd className="min-w-0 flex-1 truncate text-[15px] text-ink">{f.value}</dd>
                  <CopyButton value={f.value} label={`Copy ${f.label}`} />
                </div>
              ))}
            </dl>
          </div>

          <div className="rounded-3xl border border-line bg-surface p-5 shadow-card sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-[17px] font-medium text-ink">Description</h2>
              <CopyButton value={v.description} label="Copy description" showLabel />
            </div>
            <p className="mt-4 max-h-96 overflow-y-auto text-[15px] leading-[1.6] whitespace-pre-wrap text-ink-2">
              {v.description || "This video has no description."}
            </p>
          </div>

          <div className="rounded-3xl border border-line bg-surface p-5 shadow-card sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-[17px] font-medium text-ink">Tags ({v.tags.length})</h2>
              {v.tags.length ? <CopyButton value={v.tags.join(", ")} label="Copy tags" showLabel /> : null}
            </div>
            {v.tags.length ? (
              <ul className="mt-4 flex flex-wrap gap-2">
                {v.tags.map((t) => (
                  <li key={t} className="rounded-full border border-line bg-surface-2 px-3 py-1 text-[14px] text-ink-2">
                    {t}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-[15px] text-muted">This video doesn&apos;t use any tags.</p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
