import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, Info, Lightbulb, TriangleAlert } from "lucide-react";
import { ToolIconTile } from "@/components/tool-icon";
import { isLive, resolveTool, toolHref, toolTitle } from "@/lib/catalog/lite";
import { toolBackdrop } from "@/lib/catalog/visuals";
import { cn } from "@/lib/utils";

/** Inline call-to-action for a tool, placed where it naturally helps the reader. */
export function ToolCta({ tool: key, children, label, compact = false }: { tool: string; children?: ReactNode; label?: string; compact?: boolean }) {
  const tool = resolveTool(key, "");
  if (!tool) return null;
  return (
    <aside
      className={cn(
        "not-prose flex flex-col gap-4 rounded-2xl border border-line bg-surface p-5 shadow-card",
        compact ? "" : "my-8 sm:flex-row sm:items-center sm:p-6",
      )}
    >
      <ToolIconTile name={tool.icon} size="lg" tone="tint" tint={toolBackdrop(tool).tint} />
      <div className="min-w-0 flex-1">
        <p className="text-[16px] font-medium text-ink">{toolTitle(tool)}</p>
        <p className="mt-1 text-[14.5px] leading-[1.5] text-muted">{children ?? tool.description}</p>
      </div>
      {isLive(tool) ? (
        <Link
          href={toolHref(tool)}
          className="inline-flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-full bg-cta px-5 text-[14.5px] font-medium text-cta-ink transition-colors hover:bg-cta-hover"
        >
          {label ?? "Open the tool"} <ArrowRight aria-hidden className="h-4 w-4" />
        </Link>
      ) : (
        <span className="inline-flex h-11 shrink-0 items-center rounded-full border border-line px-5 text-[14px] text-muted">Coming soon</span>
      )}
    </aside>
  );
}

const CALLOUT = {
  note: { icon: Info, className: "border-line bg-bg-subtle", iconClass: "text-ink-2" },
  tip: { icon: Lightbulb, className: "border-accent/25 bg-accent-soft", iconClass: "text-accent" },
  warning: { icon: TriangleAlert, className: "border-warning/30 bg-warning-soft", iconClass: "text-warning" },
};

export function Callout({ type = "note", title, children }: { type?: keyof typeof CALLOUT; title?: string; children: ReactNode }) {
  const c = CALLOUT[type];
  return (
    <div className={cn("not-prose my-6 flex gap-3 rounded-2xl border p-4 sm:p-5", c.className)}>
      <c.icon aria-hidden className={cn("mt-0.5 h-5 w-5 shrink-0", c.iconClass)} strokeWidth={1.8} />
      <div className="text-[15px] leading-[1.6] text-ink-2">
        {title ? <p className="mb-1 font-medium text-ink">{title}</p> : null}
        {children}
      </div>
    </div>
  );
}

/** Accessible, scrollable data table with a caption. */
export function DataTable({ caption, head, rows, nowrapFirst = false }: { caption: string; head: string[]; rows: ReactNode[][]; nowrapFirst?: boolean }) {
  return (
    <figure className="not-prose my-8">
      <div className="overflow-x-auto rounded-2xl border border-line">
        <table className="w-full min-w-[520px] border-collapse text-left text-[14.5px]">
          <caption className="sr-only">{caption}</caption>
          <thead className="bg-bg-subtle">
            <tr>
              {head.map((h) => (
                <th key={h} scope="col" className="px-4 py-3 text-[13px] font-medium text-ink-2">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line bg-surface">
            {rows.map((r, i) => (
              <tr key={i}>
                {r.map((cell, k) => (
                  <td key={k} className={cn("px-4 py-3 align-top leading-[1.5]", k === 0 ? cn("font-medium text-ink", nowrapFirst && "whitespace-nowrap") : "text-ink-2")}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <figcaption className="mt-2 text-[13px] text-muted">{caption}</figcaption>
    </figure>
  );
}

/** Numbered steps for how-to sections. */
export function Steps({ items }: { items: ReactNode[] }) {
  return (
    <ol className="not-prose my-6 space-y-3">
      {items.map((it, i) => (
        <li key={i} className="flex gap-4 rounded-2xl border border-line bg-surface p-4 sm:p-5">
          <span className="num flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cta text-[13px] font-medium text-cta-ink">{i + 1}</span>
          <div className="pt-0.5 text-[15.5px] leading-[1.6] text-ink-2">{it}</div>
        </li>
      ))}
    </ol>
  );
}

export function Figure({ caption, children }: { caption: ReactNode; children: ReactNode }) {
  return (
    <figure className="not-prose my-8">
      <div className="overflow-hidden rounded-2xl border border-line bg-surface p-4 sm:p-6">{children}</div>
      <figcaption className="mt-2 text-[13px] leading-[1.5] text-muted">{caption}</figcaption>
    </figure>
  );
}

/* ——— thumbnail article diagrams ——— */

/** Anatomy of a thumbnail URL, labelled part by part. */
export function ThumbnailUrlDiagram() {
  const parts = [
    { text: "https://i.ytimg.com/vi/", label: "YouTube's image server", tone: "bg-bg-subtle text-ink-2" },
    { text: "aqz-KE-bpKQ", label: "The video ID (11 characters)", tone: "bg-accent-soft text-accent" },
    { text: "/", label: "", tone: "text-muted" },
    { text: "maxresdefault", label: "The size you want", tone: "bg-[#fdf3e1] text-[#9a6200] dark:bg-[#2a1f0c] dark:text-[#e0a53a]" },
    { text: ".jpg", label: "File type", tone: "text-muted" },
  ];
  return (
    <Figure caption="Every YouTube thumbnail address follows the same pattern. Swap in a different video ID or size name to get a different image.">
      <div role="img" aria-label="Diagram of a YouTube thumbnail URL: https://i.ytimg.com/vi/, then the 11-character video ID, then a slash, then the size name such as maxresdefault, then .jpg">
        <p className="font-mono text-[13px] leading-[2] break-all sm:text-[15px]">
          {parts.map((p, i) => (
            <span key={i} className={cn("rounded px-1 py-0.5", p.tone)}>
              {p.text}
            </span>
          ))}
        </p>
        <ul className="mt-5 grid grid-cols-1 gap-2 text-[13.5px] sm:grid-cols-3">
          {parts
            .filter((p) => p.label && p.label !== "File type")
            .map((p) => (
              <li key={p.label} className="flex items-center gap-2 text-ink-2">
                <span className={cn("h-3 w-3 shrink-0 rounded-sm", p.tone.split(" ")[0])} />
                {p.label}
              </li>
            ))}
        </ul>
      </div>
    </Figure>
  );
}

/** The five standard sizes drawn to scale, with the letterboxing on 4:3 sizes shown. */
export function ThumbnailSizesVisual() {
  const sizes = [
    { name: "maxresdefault", w: 1280, h: 720, box: false },
    { name: "sddefault", w: 640, h: 480, box: true },
    { name: "hqdefault", w: 480, h: 360, box: true },
    { name: "mqdefault", w: 320, h: 180, box: false },
    { name: "default", w: 120, h: 90, box: true },
  ];
  const scale = 0.22;
  return (
    <Figure caption="The five standard sizes drawn to scale. The 4:3 sizes (sddefault, hqdefault, default) add black bars above and below a normal 16:9 video.">
      <div role="img" aria-label="Scale drawing of the five YouTube thumbnail sizes, from 1280 by 720 down to 120 by 90. The 4:3 sizes show black bars above and below the image." className="flex flex-wrap items-end gap-4">
        {sizes.map((s) => (
          <div key={s.name} className="text-center">
            <div className="relative overflow-hidden rounded-[3px] bg-black" style={{ width: s.w * scale, height: s.h * scale }}>
              <div
                className="absolute inset-x-0 bg-[linear-gradient(135deg,#1f7a58,#0a2119)]"
                style={s.box ? { top: `${12.5}%`, bottom: `${12.5}%` } : { top: 0, bottom: 0 }}
              />
            </div>
            <p className="mt-1.5 font-mono text-[11px] text-ink-2">{s.name}</p>
            <p className="num text-[11px] text-muted">
              {s.w} × {s.h}
            </p>
          </div>
        ))}
      </div>
    </Figure>
  );
}
