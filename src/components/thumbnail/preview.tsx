"use client";

import { useState } from "react";
import { ThumbnailWorkspace } from "@/components/thumbnail/thumbnail-workspace";
import { Segmented } from "@/components/ui/segmented";
import { Input, Label } from "@/components/ui/primitives";
import type { LoadedImage } from "@/lib/image/load";
import { cn } from "@/lib/utils";

/**
 * Generic video-platform layouts modelled on YouTube's proportions. These are
 * original mock-ups built from measured sizes, not copies of YouTube's UI.
 */
type Layout = "home" | "search" | "suggested" | "mobile";
type Theme = "light" | "dark";

const LAYOUTS = [
  { value: "home", label: "Home feed" },
  { value: "search", label: "Search results" },
  { value: "suggested", label: "Suggested" },
  { value: "mobile", label: "Small mobile" },
] as const;

const ZOOMS = [
  { value: "0.75", label: "75%" },
  { value: "1", label: "100%" },
  { value: "1.25", label: "125%" },
  { value: "1.5", label: "150%" },
] as const;

type Meta = { title: string; channel: string; views: string; age: string; duration: string };

export function ThumbnailPreview() {
  return (
    <ThumbnailWorkspace emptyTitle="Drop a thumbnail to preview">{(image) => <PreviewStudio image={image} />}</ThumbnailWorkspace>
  );
}

function PreviewStudio({ image }: { image: LoadedImage }) {
  const [layout, setLayout] = useState<Layout>("home");
  const [theme, setTheme] = useState<Theme>("dark");
  const [zoom, setZoom] = useState<(typeof ZOOMS)[number]["value"]>("1");
  const [meta, setMeta] = useState<Meta>({
    title: "Your video title goes here — see how it wraps next to the thumbnail",
    channel: "Your Channel",
    views: "12K views",
    age: "2 days ago",
    duration: "12:04",
  });

  const update = (k: keyof Meta) => (e: React.ChangeEvent<HTMLInputElement>) => setMeta((m) => ({ ...m, [k]: e.target.value }));

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div className="min-w-0">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Segmented label="Layout" idPrefix="layout" value={layout} onChange={setLayout} options={LAYOUTS} />
        </div>
        <div
          id={`layout-panel-${layout}`}
          role="tabpanel"
          aria-labelledby={`layout-tab-${layout}`}
          className={cn(
            "overflow-auto rounded-2xl border border-line p-4 transition-colors sm:p-8",
            theme === "dark" ? "bg-[#0f0f0f] text-[#f1f1f1]" : "bg-white text-[#0f0f0f]",
          )}
        >
          <div style={{ zoom: Number(zoom) }} className="origin-top-left">
            {layout === "home" ? <HomeFeed image={image} meta={meta} theme={theme} /> : null}
            {layout === "search" ? <SearchResults image={image} meta={meta} theme={theme} /> : null}
            {layout === "suggested" ? <Suggested image={image} meta={meta} theme={theme} /> : null}
            {layout === "mobile" ? <MobileFeed image={image} meta={meta} theme={theme} /> : null}
          </div>
        </div>
        <p className="mt-2 text-xs text-muted">
          Neighbouring grey tiles stand in for other videos so you can judge your thumbnail in context. Sizes are typical
          CSS widths and vary by screen and window size.
        </p>
      </div>

      <aside className="space-y-5 rounded-2xl border border-line bg-surface p-5 shadow-card lg:self-start">
        <div>
          <p className="mb-2 text-[13px] font-medium text-ink-2">Interface</p>
          <Segmented
            label="Interface theme"
            value={theme}
            onChange={setTheme}
            options={[
              { value: "dark", label: "Dark" },
              { value: "light", label: "Light" },
            ]}
          />
        </div>
        <div>
          <p className="mb-2 text-[13px] font-medium text-ink-2">Zoom</p>
          <Segmented label="Zoom" value={zoom} onChange={setZoom} options={ZOOMS} size="sm" />
        </div>
        <div className="space-y-3 border-t border-line pt-5">
          <div>
            <Label htmlFor="pv-title">Title</Label>
            <Input id="pv-title" value={meta.title} onChange={update("title")} maxLength={100} />
          </div>
          <div>
            <Label htmlFor="pv-channel">Channel</Label>
            <Input id="pv-channel" value={meta.channel} onChange={update("channel")} maxLength={50} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="pv-views">Views</Label>
              <Input id="pv-views" value={meta.views} onChange={update("views")} maxLength={20} />
            </div>
            <div>
              <Label htmlFor="pv-duration">Duration</Label>
              <Input id="pv-duration" value={meta.duration} onChange={update("duration")} maxLength={8} />
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

type ViewProps = { image: LoadedImage; meta: Meta; theme: Theme };

function Thumb({ image, duration, width, radius = 12, placeholder = false, theme }: { image?: LoadedImage; duration?: string; width: number | string; radius?: number; placeholder?: boolean; theme: Theme }) {
  return (
    <div className="relative shrink-0 overflow-hidden" style={{ width, aspectRatio: "16 / 9", borderRadius: radius }}>
      {placeholder || !image ? (
        <div className={cn("h-full w-full", theme === "dark" ? "bg-[#272727]" : "bg-[#e5e5e5]")} />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element -- local object URL
        <img src={image.url} alt="Your thumbnail in context" className="h-full w-full object-cover" />
      )}
      {duration && !placeholder ? (
        <span className="absolute right-1 bottom-1 rounded bg-black/80 px-1 py-px text-[12px] leading-4 font-medium text-white">{duration}</span>
      ) : null}
    </div>
  );
}

function Avatar({ size = 36, theme }: { size?: number; theme: Theme }) {
  return <span className={cn("shrink-0 rounded-full", theme === "dark" ? "bg-[#3f3f3f]" : "bg-[#d9d9d9]")} style={{ width: size, height: size }} />;
}

function Lines({ theme, widths }: { theme: Theme; widths: string[] }) {
  return (
    <div className="flex-1 space-y-2 pt-1">
      {widths.map((w, i) => (
        <div key={i} className={cn("h-3 rounded", theme === "dark" ? "bg-[#272727]" : "bg-[#e5e5e5]")} style={{ width: w }} />
      ))}
    </div>
  );
}

const subtle = (theme: Theme) => (theme === "dark" ? "text-[#aaaaaa]" : "text-[#606060]");

function HomeFeed({ image, meta, theme }: ViewProps) {
  return (
    <div className="grid w-max grid-cols-[repeat(2,360px)] gap-x-4 gap-y-10">
      {[0, 1, 2, 3].map((i) =>
        i === 1 ? (
          <div key={i}>
            <Thumb image={image} duration={meta.duration} width="100%" theme={theme} />
            <div className="mt-3 flex gap-3">
              <Avatar theme={theme} />
              <div className="min-w-0">
                <p className="line-clamp-2 text-[16px] leading-[22px] font-medium">{meta.title}</p>
                <p className={cn("mt-1 text-[14px] leading-5", subtle(theme))}>{meta.channel}</p>
                <p className={cn("text-[14px] leading-5", subtle(theme))}>
                  {meta.views} · {meta.age}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div key={i}>
            <Thumb placeholder width="100%" theme={theme} />
            <div className="mt-3 flex gap-3">
              <Avatar theme={theme} />
              <Lines theme={theme} widths={["90%", "60%", "40%"]} />
            </div>
          </div>
        ),
      )}
    </div>
  );
}

function SearchResults({ image, meta, theme }: ViewProps) {
  return (
    <div className="w-[1000px] space-y-4">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex gap-4">
          {i === 0 ? (
            <>
              <Thumb image={image} duration={meta.duration} width={500} theme={theme} />
              <div className="min-w-0 pt-1">
                <p className="line-clamp-2 text-[18px] leading-[26px]">{meta.title}</p>
                <p className={cn("mt-1 text-[12px]", subtle(theme))}>
                  {meta.views} · {meta.age}
                </p>
                <div className={cn("mt-3 flex items-center gap-2 text-[12px]", subtle(theme))}>
                  <Avatar size={24} theme={theme} />
                  {meta.channel}
                </div>
              </div>
            </>
          ) : (
            <>
              <Thumb placeholder width={500} theme={theme} />
              <Lines theme={theme} widths={["80%", "40%", "30%"]} />
            </>
          )}
        </div>
      ))}
    </div>
  );
}

function Suggested({ image, meta, theme }: ViewProps) {
  return (
    <div className="w-[402px] space-y-2">
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className="flex gap-2">
          {i === 2 ? (
            <>
              <Thumb image={image} duration={meta.duration} width={168} radius={8} theme={theme} />
              <div className="min-w-0">
                <p className="line-clamp-2 text-[14px] leading-5 font-medium">{meta.title}</p>
                <p className={cn("mt-1 text-[12px] leading-[18px]", subtle(theme))}>{meta.channel}</p>
                <p className={cn("text-[12px] leading-[18px]", subtle(theme))}>
                  {meta.views} · {meta.age}
                </p>
              </div>
            </>
          ) : (
            <>
              <Thumb placeholder width={168} radius={8} theme={theme} />
              <Lines theme={theme} widths={["95%", "55%", "40%"]} />
            </>
          )}
        </div>
      ))}
    </div>
  );
}

function MobileFeed({ image, meta, theme }: ViewProps) {
  return (
    <div className="flex flex-wrap items-start gap-8">
      {/* Phone: full-width feed */}
      <figure>
        <div className={cn("w-[360px] overflow-hidden rounded-[28px] border-[6px]", theme === "dark" ? "border-[#272727]" : "border-[#e5e5e5]")}>
          <Thumb image={image} duration={meta.duration} width="100%" radius={0} theme={theme} />
          <div className="flex gap-3 p-3">
            <Avatar theme={theme} />
            <div className="min-w-0">
              <p className="line-clamp-2 text-[14px] leading-5">{meta.title}</p>
              <p className={cn("mt-0.5 text-[12px]", subtle(theme))}>
                {meta.channel} · {meta.views} · {meta.age}
              </p>
            </div>
          </div>
          <Thumb placeholder width="100%" radius={0} theme={theme} />
        </div>
        <figcaption className={cn("mt-2 text-xs", subtle(theme))}>Phone feed ≈ 360 px</figcaption>
      </figure>
      {/* Phone: compact list under a playing video */}
      <figure>
        <div className={cn("w-[360px] space-y-3 overflow-hidden rounded-[28px] border-[6px] p-3", theme === "dark" ? "border-[#272727]" : "border-[#e5e5e5]")}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex gap-2.5">
              {i === 1 ? (
                <>
                  <Thumb image={image} duration={meta.duration} width={160} radius={8} theme={theme} />
                  <div className="min-w-0">
                    <p className="line-clamp-2 text-[13px] leading-[18px]">{meta.title}</p>
                    <p className={cn("mt-0.5 text-[11px]", subtle(theme))}>{meta.channel}</p>
                  </div>
                </>
              ) : (
                <>
                  <Thumb placeholder width={160} radius={8} theme={theme} />
                  <Lines theme={theme} widths={["90%", "50%"]} />
                </>
              )}
            </div>
          ))}
        </div>
        <figcaption className={cn("mt-2 text-xs", subtle(theme))}>Compact list ≈ 160 px</figcaption>
      </figure>
    </div>
  );
}
