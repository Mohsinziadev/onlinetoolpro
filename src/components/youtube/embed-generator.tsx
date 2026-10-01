"use client";

import { useMemo, useState } from "react";
import { Link2 } from "lucide-react";
import { CopyButton } from "@/components/tool/copy-button";
import { EmptyState } from "@/components/tool/states";
import { Input, Label, FieldHint, Textarea } from "@/components/ui/primitives";
import { Segmented, Switch } from "@/components/ui/segmented";
import { parseVideoInput } from "@/lib/youtube/parse";

/** "1:30", "90", "1:02:03" → seconds. Empty → 0. Invalid → null. */
function parseStart(v: string): number | null {
  const s = v.trim();
  if (!s) return 0;
  if (!/^\d+(:\d{1,2}){0,2}$/.test(s)) return null;
  return s.split(":").reduce((acc, part) => acc * 60 + Number(part), 0);
}

type Size = "responsive" | "fixed";

export function EmbedGenerator() {
  const [link, setLink] = useState("");
  const [start, setStart] = useState("");
  const [autoplay, setAutoplay] = useState(false);
  const [mute, setMute] = useState(false);
  const [loop, setLoop] = useState(false);
  const [controls, setControls] = useState(true);
  const [captions, setCaptions] = useState(false);
  const [privacy, setPrivacy] = useState(true);
  const [size, setSize] = useState<Size>("responsive");
  const [width, setWidth] = useState("560");

  const video = parseVideoInput(link);
  const startSeconds = parseStart(start);

  const src = useMemo(() => {
    if (!video) return "";
    const p = new URLSearchParams();
    if (startSeconds) p.set("start", String(startSeconds));
    if (autoplay) p.set("autoplay", "1");
    // Browsers only allow autoplay when the video starts muted.
    if (mute || autoplay) p.set("mute", "1");
    if (loop) {
      p.set("loop", "1");
      p.set("playlist", video.id);
    }
    if (!controls) p.set("controls", "0");
    if (captions) p.set("cc_load_policy", "1");
    const host = privacy ? "https://www.youtube-nocookie.com" : "https://www.youtube.com";
    const qs = p.toString();
    return `${host}/embed/${video.id}${qs ? `?${qs}` : ""}`;
  }, [video, startSeconds, autoplay, mute, loop, controls, captions, privacy]);

  const w = Math.min(Math.max(Number(width) || 560, 200), 1920);
  const h = Math.round((w * 9) / 16);
  const attrs = `src="${src}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen`;
  const code = !src
    ? ""
    : size === "responsive"
      ? `<div style="position:relative;width:100%;aspect-ratio:16/9;">\n  <iframe style="position:absolute;inset:0;width:100%;height:100%;" ${attrs}></iframe>\n</div>`
      : `<iframe width="${w}" height="${h}" ${attrs}></iframe>`;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
      <div className="space-y-5 rounded-3xl border border-line bg-surface p-5 shadow-raised sm:p-7">
        <div>
          <Label htmlFor="embed-link">
            <span className="inline-flex items-center gap-2">
              <Link2 aria-hidden className="h-4 w-4 text-muted" /> Your YouTube video link
            </span>
          </Label>
          <Input
            id="embed-link"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="Paste your YouTube video link"
            inputMode="url"
            spellCheck={false}
            className="h-12"
          />
          {link && !video ? (
            <FieldHint className="text-danger">That doesn&apos;t look like a YouTube video link.</FieldHint>
          ) : null}
        </div>

        <div>
          <Label htmlFor="embed-start">Start the video at (optional)</Label>
          <Input id="embed-start" value={start} onChange={(e) => setStart(e.target.value)} placeholder="e.g. 1:30" inputMode="numeric" />
          {startSeconds === null ? <FieldHint className="text-danger">Use minutes:seconds, like 1:30.</FieldHint> : null}
        </div>

        <div className="divide-y divide-line rounded-2xl border border-line px-4">
          <Switch checked={privacy} onChange={setPrivacy} label="Privacy mode (no tracking cookies)" />
          <Switch checked={controls} onChange={setControls} label="Show player controls" />
          <Switch checked={autoplay} onChange={setAutoplay} label="Start playing automatically" />
          <Switch checked={mute || autoplay} onChange={setMute} label="Start muted" />
          <Switch checked={loop} onChange={setLoop} label="Play on repeat" />
          <Switch checked={captions} onChange={setCaptions} label="Turn on captions" />
        </div>
        {autoplay ? <FieldHint>Browsers only autoplay videos that start muted, so mute is turned on.</FieldHint> : null}

        <div>
          <Label>Size</Label>
          <Segmented
            label="Size"
            value={size}
            onChange={setSize}
            options={[
              { value: "responsive", label: "Fits any screen" },
              { value: "fixed", label: "Fixed width" },
            ]}
          />
          {size === "fixed" ? (
            <div className="mt-3 flex items-center gap-3">
              <Input value={width} onChange={(e) => setWidth(e.target.value)} inputMode="numeric" aria-label="Width in pixels" className="w-28" />
              <span className="text-[14px] text-muted">× {h} pixels</span>
            </div>
          ) : null}
        </div>
      </div>

      <div className="space-y-4">
        {video ? (
          <>
            <div className="overflow-hidden rounded-3xl border border-line bg-night shadow-raised">
              <iframe
                key={src}
                src={src}
                title="Preview"
                className="aspect-video w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
            <div className="rounded-3xl border border-line bg-surface p-4 shadow-card sm:p-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-[15px] font-medium text-ink">Your embed code</p>
                <CopyButton value={code} label="Copy code" showLabel />
              </div>
              <Textarea readOnly value={code} rows={6} className="font-mono text-[12.5px]" onFocus={(e) => e.currentTarget.select()} />
              <p className="mt-2 text-[13px] text-muted">Paste this into your website&apos;s HTML where you want the video to appear.</p>
            </div>
          </>
        ) : (
          <EmptyState
            className="h-full min-h-72"
            title="Your preview will appear here"
            description="Paste a YouTube video link on the left to see the player and get the code."
          />
        )}
      </div>
    </div>
  );
}
