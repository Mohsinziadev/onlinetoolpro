"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ThumbnailWorkspace } from "@/components/thumbnail/thumbnail-workspace";
import { LoadingState } from "@/components/tool/states";
import { MetricCard, MetricGrid } from "@/components/tool/metric";
import { Switch, Segmented } from "@/components/ui/segmented";
import { Badge, Card } from "@/components/ui/primitives";
import { analyzeImage, type ThumbnailAnalysis } from "@/lib/image/analyze";
import { rasterizeToWidth, type LoadedImage } from "@/lib/image/load";

/**
 * Approximate area covered by the duration badge in YouTube-style layouts,
 * as a fraction of the thumbnail. The badge is a fixed pixel size, so it
 * covers relatively more of small thumbnails; this box reflects small sizes.
 */
const BADGE = { x: 0.8, y: 0.82, w: 0.185, h: 0.15 };
const CENTER = { x: 0.25, y: 0.25, w: 0.5, h: 0.5 };

type Toggles = { grid: boolean; safe: boolean; center: boolean; margins: boolean; badge: boolean; heat: boolean };
type LineColor = "white" | "black" | "accent";

export function ThumbnailSafeZone() {
  return (
    <ThumbnailWorkspace emptyTitle="Drop a thumbnail to check safe zones">{(image) => <SafeZoneStudio image={image} />}</ThumbnailWorkspace>
  );
}

function useAnalysis(image: LoadedImage) {
  const [res, setRes] = useState<{ url: string; a: ThumbnailAnalysis } | null>(null);
  useEffect(() => {
    let cancelled = false;
    const id = requestAnimationFrame(() => {
      const a = analyzeImage(rasterizeToWidth(image.bitmap, 640));
      if (!cancelled) setRes({ url: image.url, a });
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(id);
    };
  }, [image]);
  return res && res.url === image.url ? res.a : null;
}

/** Share of block-level values that fall inside/outside rectangles. */
function zoneStats(a: ThumbnailAnalysis, margin: number) {
  const { grid } = a;
  let totalDetail = 0,
    edgeDetail = 0,
    centerDetail = 0,
    badgeText = 0,
    badgeDetail = 0,
    badgeTotal = 0;
  for (let by = 0; by < grid.rows; by++) {
    for (let bx = 0; bx < grid.cols; bx++) {
      const b = by * grid.cols + bx;
      const cx = (bx + 0.5) / grid.cols;
      const cy = (by + 0.5) / grid.rows;
      const d = grid.saliency[b];
      totalDetail += d;
      const inMargin = cx < margin || cx > 1 - margin || cy < margin || cy > 1 - margin;
      if (inMargin) edgeDetail += d;
      if (cx >= CENTER.x && cx <= CENTER.x + CENTER.w && cy >= CENTER.y && cy <= CENTER.y + CENTER.h) centerDetail += d;
      if (cx >= BADGE.x && cx <= BADGE.x + BADGE.w && cy >= BADGE.y && cy <= BADGE.y + BADGE.h) {
        badgeTotal++;
        badgeDetail += d;
        if (grid.textLike[b]) badgeText++;
      }
    }
  }
  const marginArea = 1 - (1 - 2 * margin) ** 2;
  return {
    edgeShare: totalDetail ? edgeDetail / totalDetail : 0,
    marginArea,
    centerShare: totalDetail ? centerDetail / totalDetail : 0,
    badgeTextShare: badgeTotal ? badgeText / badgeTotal : 0,
    badgeDetailShare: totalDetail ? badgeDetail / totalDetail : 0,
  };
}

function SafeZoneStudio({ image }: { image: LoadedImage }) {
  const analysis = useAnalysis(image);
  const [t, setT] = useState<Toggles>({ grid: true, safe: true, center: false, margins: true, badge: true, heat: false });
  const [marginPct, setMarginPct] = useState(5);
  const [color, setColor] = useState<LineColor>("white");
  const toggle = (k: keyof Toggles) => (v: boolean) => setT((s) => ({ ...s, [k]: v }));
  const stats = useMemo(() => (analysis ? zoneStats(analysis, marginPct / 100) : null), [analysis, marginPct]);

  if (!analysis || !stats) return <LoadingState label="Mapping detail across the frame…" />;

  const stroke = color === "white" ? "rgba(255,255,255,0.9)" : color === "black" ? "rgba(0,0,0,0.85)" : "var(--accent)";
  const m = marginPct / 100;
  const edgeOver = stats.edgeShare > stats.marginArea * 1.25;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="min-w-0">
          <div className="relative overflow-hidden rounded-2xl border border-line shadow-raised">
            {/* eslint-disable-next-line @next/next/no-img-element -- local object URL */}
            <img src={image.url} alt="Your thumbnail with safe-zone overlay" className="block h-auto w-full" />
            {t.heat ? <Heatmap analysis={analysis} /> : null}
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
              {t.safe ? (
                <path
                  fillRule="evenodd"
                  d={`M0,0H100V100H0Z M${m * 100},${m * 100}V${100 - m * 100}H${100 - m * 100}V${m * 100}Z`}
                  fill="rgba(0,0,0,0.38)"
                />
              ) : null}
              {t.margins ? (
                <rect
                  x={m * 100}
                  y={m * 100}
                  width={100 - 2 * m * 100}
                  height={100 - 2 * m * 100}
                  fill="none"
                  stroke={stroke}
                  strokeWidth="1.5"
                  vectorEffect="non-scaling-stroke"
                />
              ) : null}
              {t.grid
                ? [100 / 3, 200 / 3].map((p) => (
                    <g key={p}>
                      <line x1={p} x2={p} y1="0" y2="100" stroke={stroke} strokeWidth="1" vectorEffect="non-scaling-stroke" opacity="0.8" />
                      <line y1={p} y2={p} x1="0" x2="100" stroke={stroke} strokeWidth="1" vectorEffect="non-scaling-stroke" opacity="0.8" />
                    </g>
                  ))
                : null}
              {t.center ? (
                <>
                  <line x1="50" x2="50" y1="0" y2="100" stroke={stroke} strokeWidth="1" vectorEffect="non-scaling-stroke" strokeDasharray="4 4" />
                  <line y1="50" y2="50" x1="0" x2="100" stroke={stroke} strokeWidth="1" vectorEffect="non-scaling-stroke" strokeDasharray="4 4" />
                  <rect
                    x={CENTER.x * 100}
                    y={CENTER.y * 100}
                    width={CENTER.w * 100}
                    height={CENTER.h * 100}
                    fill="rgba(57,135,229,0.12)"
                    stroke="#3987e5"
                    strokeWidth="1.5"
                    vectorEffect="non-scaling-stroke"
                  />
                </>
              ) : null}
              {t.badge ? (
                <rect
                  x={BADGE.x * 100}
                  y={BADGE.y * 100}
                  width={BADGE.w * 100}
                  height={BADGE.h * 100}
                  fill="rgba(212,64,31,0.35)"
                  stroke="#f0603c"
                  strokeWidth="1.5"
                  vectorEffect="non-scaling-stroke"
                />
              ) : null}
            </svg>
            {t.badge ? (
              <span
                className="absolute rounded bg-black/80 px-1 font-mono text-[10px] text-white sm:text-xs"
                style={{ right: `${(1 - BADGE.x - BADGE.w) * 100 + 1}%`, bottom: `${(1 - BADGE.y - BADGE.h) * 100 + 1.5}%` }}
              >
                12:04
              </span>
            ) : null}
          </div>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted">
            {t.safe || t.margins ? <Legend swatch="bg-black/40 ring-1 ring-ink/40" label={`Edge margin (${marginPct}%)`} /> : null}
            {t.center ? <Legend swatch="bg-[#3987e5]" label="Center focus area" /> : null}
            {t.badge ? <Legend swatch="bg-accent" label="Duration badge area (approx.)" /> : null}
            {t.heat ? <Legend swatch="bg-gradient-to-r from-transparent to-accent" label="Detail concentration" /> : null}
          </div>
        </div>

        <aside className="rounded-2xl border border-line bg-surface p-5 shadow-card lg:self-start">
          <p className="text-[13px] font-medium text-ink">Overlays</p>
          <div className="mt-2 divide-y divide-line">
            <Switch label="Rule-of-thirds grid" checked={t.grid} onChange={toggle("grid")} />
            <Switch label="Safe area shading" checked={t.safe} onChange={toggle("safe")} />
            <Switch label="Margins" checked={t.margins} onChange={toggle("margins")} />
            <Switch label="Center lines & focus" checked={t.center} onChange={toggle("center")} />
            <Switch label="Duration badge area" checked={t.badge} onChange={toggle("badge")} />
            <Switch label="Detail heatmap" checked={t.heat} onChange={toggle("heat")} />
          </div>
          <div className="mt-5 border-t border-line pt-5">
            <label htmlFor="margin" className="flex items-center justify-between text-[13px] font-medium text-ink">
              Margin size <span className="num text-muted">{marginPct}%</span>
            </label>
            <input
              id="margin"
              type="range"
              min={2}
              max={12}
              step={1}
              value={marginPct}
              onChange={(e) => setMarginPct(Number(e.target.value))}
              className="mt-2 w-full accent-[var(--accent)]"
            />
          </div>
          <div className="mt-5">
            <p className="mb-2 text-[13px] font-medium text-ink">Line color</p>
            <Segmented
              label="Line color"
              size="sm"
              value={color}
              onChange={setColor}
              options={[
                { value: "white", label: "White" },
                { value: "black", label: "Black" },
                { value: "accent", label: "Accent" },
              ]}
            />
          </div>
        </aside>
      </div>

      <MetricGrid>
        <MetricCard
          label="Detail in edge margins"
          value={(stats.edgeShare * 100).toFixed(0)}
          unit="%"
          meter={stats.edgeShare * 100}
          tag={edgeOver ? <Badge tone="warning">Above area share</Badge> : <Badge>Proportional</Badge>}
          hint="Share of the image's detail (edges + local color contrast) that falls inside the outer margin."
          sub={`The margin covers ${(stats.marginArea * 100).toFixed(0)}% of the frame.`}
        />
        <MetricCard
          label="Detail in center focus"
          value={(stats.centerShare * 100).toFixed(0)}
          unit="%"
          meter={stats.centerShare * 100}
          hint="Share of detail inside the central 50% × 50% rectangle (25% of the frame's area)."
          sub="The center area is 25% of the frame."
        />
        <MetricCard
          label="Text-like area under badge"
          value={(stats.badgeTextShare * 100).toFixed(0)}
          unit="%"
          meter={stats.badgeTextShare * 100}
          tag={stats.badgeTextShare > 0.15 ? <Badge tone="warning">Check</Badge> : <Badge tone="success">Clear</Badge>}
          hint="Share of the approximate duration-badge area classified as text-like. Text there may be covered."
        />
        <MetricCard
          label="Main subject"
          value={<span className="text-xl capitalize">{analysis.subject.region}</span>}
          hint="Weighted center of the strongest region of detail, excluding text-like areas. A heuristic, not object recognition."
          sub={`At ${(analysis.subject.x * 100).toFixed(0)}% × ${(analysis.subject.y * 100).toFixed(0)}% of the frame`}
        />
      </MetricGrid>

      <Card className="p-5 text-[13.5px] leading-relaxed text-muted sm:p-6">
        <p className="font-medium text-ink">About the duration badge area</p>
        <p className="mt-1.5">
          YouTube overlays the video length in the bottom-right corner, and in some places adds progress bars or other
          badges along the bottom edge. The badge is a fixed pixel size, so it covers a larger share of small thumbnails.
          The highlighted box is an approximation for small sizes — exact placement varies by device and layout.
        </p>
      </Card>
    </div>
  );
}

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`h-2.5 w-2.5 rounded-sm ${swatch}`} aria-hidden />
      {label}
    </span>
  );
}

function Heatmap({ analysis }: { analysis: ThumbnailAnalysis }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const { grid } = analysis;
    c.width = grid.cols;
    c.height = grid.rows;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const max = Math.max(...grid.saliency) || 1;
    for (let b = 0; b < grid.cols * grid.rows; b++) {
      ctx.fillStyle = `rgba(212,64,31,${((grid.saliency[b] / max) * 0.7).toFixed(3)})`;
      ctx.fillRect(b % grid.cols, Math.floor(b / grid.cols), 1, 1);
    }
  }, [analysis]);
  return <canvas ref={ref} aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" />;
}
