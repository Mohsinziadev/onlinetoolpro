"use client";

import { useState } from "react";
import { Download, ImageOff, Link2 } from "lucide-react";
import { UrlInput } from "@/components/tool/url-input";
import { ErrorState } from "@/components/tool/states";
import { CopyButton } from "@/components/tool/copy-button";
import { buttonClasses } from "@/components/ui/button";
import { parseVideoInput } from "@/lib/youtube/parse";
import { cn } from "@/lib/utils";

const SIZES = [
  { id: "maxresdefault", label: "Full HD", dims: "1280 × 720" },
  { id: "sddefault", label: "Standard", dims: "640 × 480" },
  { id: "hqdefault", label: "High", dims: "480 × 360" },
  { id: "mqdefault", label: "Medium", dims: "320 × 180" },
  { id: "default", label: "Small", dims: "120 × 90" },
] as const;
type SizeId = (typeof SIZES)[number]["id"];

const imageUrl = (id: string, size: SizeId) => `https://i.ytimg.com/vi/${id}/${size}.jpg`;
/**
 * Download in the browser: YouTube's image server allows cross-origin requests, so we
 * fetch the JPG and save it as a file. If that ever fails, open the image so it can be
 * saved manually.
 */
async function downloadThumbnail(id: string, size: SizeId) {
  // If the requested size doesn't exist (YouTube answers 404), step down to the next size that does.
  const order = SIZES.map((s) => s.id);
  for (const candidate of order.slice(order.indexOf(size))) {
    try {
      const res = await fetch(imageUrl(id, candidate), { mode: "cors" });
      if (!res.ok) continue;
      const blob = await res.blob();
      const href = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = href;
      a.download = `youtube-thumbnail-${id}-${candidate}.jpg`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(href), 1000);
      return;
    } catch {
      break;
    }
  }
  // Network or browser problem: open the image so it can be saved manually.
  window.open(imageUrl(id, size), "_blank", "noopener");
}

export function ThumbnailDownloader() {
  const [input, setInput] = useState("");
  const [videoId, setVideoId] = useState<string | null>(null);
  const [error, setError] = useState(false);
  // YouTube serves a 120×90 grey placeholder when a large size doesn't exist.
  const [missing, setMissing] = useState<Set<SizeId>>(new Set());

  function submit(value: string) {
    const parsed = parseVideoInput(value);
    setError(!parsed);
    setVideoId(parsed?.id ?? null);
    setMissing(new Set());
  }

  function onLoad(size: SizeId, img: HTMLImageElement) {
    if (size !== "default" && img.naturalWidth <= 120) setMissing((m) => new Set(m).add(size));
  }

  const available = SIZES.filter((s) => !missing.has(s.id));
  const best = available[0];

  return (
    <div className="space-y-8">
      <UrlInput
        value={input}
        onChange={setInput}
        onSubmit={submit}
        label="YouTube video link"
        placeholder="Paste your YouTube video link"
        submitLabel="Get thumbnails"
        icon={<Link2 className="h-5 w-5" />}
        examples={[{ label: "Example video", value: "https://www.youtube.com/watch?v=jNQXAC9IVRw" }]}
        hint="Works with normal videos, Shorts and youtu.be links."
      />

      {error ? (
        <ErrorState
          title="That doesn't look like a YouTube video link"
          description="Open the video on YouTube, press Share → Copy, then paste the link here. Channel and playlist links won't work."
        />
      ) : null}

      {videoId && best ? (
        <div className="animate-fade-up space-y-6" aria-live="polite">
          <div className="overflow-hidden rounded-3xl border border-line bg-surface shadow-raised">
            <div className="checker aspect-video w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl(videoId, best.id)} alt="Largest available thumbnail" className="h-full w-full object-contain" />
            </div>
            <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div>
                <p className="text-[17px] font-medium text-ink">Best quality: {best.label}</p>
                <p className="text-[14px] text-muted">{best.dims} pixels · JPG</p>
              </div>
              <div className="flex gap-2">
                <CopyButton value={imageUrl(videoId, best.id)} label="Copy image link" showLabel className="h-12 px-5 text-[14px]" />
                <button type="button" onClick={() => downloadThumbnail(videoId, best.id)} className={buttonClasses("primary", "lg")}>
                  <Download aria-hidden className="h-4 w-4" /> Download
                </button>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-[17px] font-medium text-ink">All sizes</h2>
            <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {SIZES.slice(1).map((s) => {
                const gone = missing.has(s.id);
                return (
                  <li key={s.id} className={cn("flex flex-col rounded-2xl border border-line bg-surface p-3", gone && "opacity-60")}>
                    <div className="checker flex aspect-video items-center justify-center overflow-hidden rounded-xl">
                      {gone ? (
                        <ImageOff aria-hidden className="h-5 w-5 text-faint" />
                      ) : (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={imageUrl(videoId, s.id)}
                          alt={`${s.label} thumbnail`}
                          loading="lazy"
                          onLoad={(e) => onLoad(s.id, e.currentTarget)}
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-2 px-1">
                      <div>
                        <p className="text-[14px] font-medium text-ink">{s.label}</p>
                        <p className="text-[12.5px] text-muted">{gone ? "Not available" : s.dims}</p>
                      </div>
                      {!gone ? (
                        <button
                          type="button"
                          onClick={() => downloadThumbnail(videoId, s.id)}
                          aria-label={`Download ${s.label} thumbnail`}
                          className={buttonClasses("secondary", "icon")}
                        >
                          <Download aria-hidden className="h-4 w-4" />
                        </button>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Probe the full-HD size so we can fall back when it doesn't exist. */}
          {!missing.has("maxresdefault") ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl(videoId, "maxresdefault")} alt="" hidden onLoad={(e) => onLoad("maxresdefault", e.currentTarget)} />
          ) : null}

          <p className="text-[13px] text-muted">
            Thumbnails belong to the video&apos;s creator. Please only reuse them where you have permission.
          </p>
        </div>
      ) : null}
    </div>
  );
}
