"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ThumbnailWorkspace } from "@/components/thumbnail/thumbnail-workspace";
import { MetricCard, MetricGrid, SectionHeading, StatList } from "@/components/tool/metric";
import { CopyButton } from "@/components/tool/copy-button";
import { Segmented } from "@/components/ui/segmented";
import { Badge, Card } from "@/components/ui/primitives";
import { LoadingState } from "@/components/tool/states";
import { analyzeImage, type ThumbnailAnalysis } from "@/lib/image/analyze";
import { describeAspectRatio, rasterizeToWidth, type LoadedImage } from "@/lib/image/load";
import { cn, formatBytes } from "@/lib/utils";

export function ThumbnailAnalyzer() {
  return (
    <ThumbnailWorkspace emptyTitle="Drop a thumbnail to analyze">{(image) => <AnalyzerResults image={image} />}</ThumbnailWorkspace>
  );
}

const ANALYSIS_WIDTH = 640;

function useAnalysis(image: LoadedImage) {
  const [result, setResult] = useState<{ url: string; analysis: ThumbnailAnalysis } | null>(null);
  useEffect(() => {
    let cancelled = false;
    // Yield a frame so the loading state paints before the synchronous work
    const id = requestAnimationFrame(() => {
      const data = rasterizeToWidth(image.bitmap, ANALYSIS_WIDTH);
      const analysis = analyzeImage(data);
      if (!cancelled) setResult({ url: image.url, analysis });
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(id);
    };
  }, [image]);
  return result && result.url === image.url ? result.analysis : null;
}

type FaceResult = { status: "unsupported" } | { status: "error" } | { status: "ok"; faces: { x: number; y: number; w: number; h: number }[] };

type FaceDetectorCtor = new (opts?: { fastMode?: boolean; maxDetectedFaces?: number }) => {
  detect(src: ImageBitmapSource): Promise<{ boundingBox: DOMRectReadOnly }[]>;
};

/** Uses the browser's built-in Shape Detection API when available. No model download, no upload. */
function useFaceDetection(image: LoadedImage): FaceResult | null {
  const [result, setResult] = useState<{ url: string; value: FaceResult } | null>(null);
  useEffect(() => {
    let cancelled = false;
    const FD = (window as unknown as { FaceDetector?: FaceDetectorCtor }).FaceDetector;
    const finish = (value: FaceResult) => {
      if (!cancelled) setResult({ url: image.url, value });
    };
    if (!FD) {
      queueMicrotask(() => finish({ status: "unsupported" }));
    } else {
      new FD({ fastMode: true, maxDetectedFaces: 10 })
        .detect(image.bitmap)
        .then((faces) =>
          finish({
            status: "ok",
            faces: faces.map((f) => ({
              x: f.boundingBox.x / image.width,
              y: f.boundingBox.y / image.height,
              w: f.boundingBox.width / image.width,
              h: f.boundingBox.height / image.height,
            })),
          }),
        )
        .catch(() => finish({ status: "error" }));
    }
    return () => {
      cancelled = true;
    };
  }, [image]);
  return result && result.url === image.url ? result.value : null;
}

type Overlay = "none" | "detail" | "text" | "subject";

function levelLabel(v: number, [a, b]: [number, number], labels: [string, string, string]) {
  return v < a ? labels[0] : v < b ? labels[1] : labels[2];
}

function AnalyzerResults({ image }: { image: LoadedImage }) {
  const analysis = useAnalysis(image);
  const faces = useFaceDetection(image);
  const [overlay, setOverlay] = useState<Overlay>("none");
  const ratio = describeAspectRatio(image.width, image.height);

  if (!analysis) return <LoadingState label="Measuring pixels in your browser…" />;

  const a = analysis;
  const brightnessLabel = levelLabel(a.brightness, [30, 70], ["Dark", "Balanced", "Bright"]);
  const contrastLabel = levelLabel(a.contrastRms, [12, 22], ["Low", "Moderate", "High"]);
  const satLabel = levelLabel(a.saturation, [20, 45], ["Muted", "Moderate", "Vivid"]);

  return (
    <div className="space-y-12">
      {/* Preview + key info */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <div>
          <OverlayPreview image={image} analysis={a} overlay={overlay} faces={faces?.status === "ok" ? faces.faces : []} />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <Segmented
              label="Overlay"
              size="sm"
              value={overlay}
              onChange={setOverlay}
              options={[
                { value: "none", label: "Original" },
                { value: "detail", label: "Detail map" },
                { value: "text", label: "Text-like areas" },
                { value: "subject", label: "Subject" },
              ]}
            />
            <p className="text-xs text-muted">Overlays are drawn from the measurements below.</p>
          </div>
        </div>

        <Card className="p-5 sm:p-6">
          <SectionHeading title="Basic information" />
          <StatList
            items={[
              { label: "Dimensions", value: `${image.width} × ${image.height}` },
              {
                label: "Aspect ratio",
                value: ratio.isSixteenNine ? "16:9" : ratio.exact,
                note: ratio.isSixteenNine ? "Matches YouTube's 16:9 player" : `Nearest common ratio: ${ratio.nearest}`,
              },
              {
                label: "File size",
                value: formatBytes(image.file.size),
                note: image.file.size > 2 * 1024 * 1024 ? "Above the 2 MB limit YouTube has long used for custom thumbnails" : undefined,
              },
              { label: "Format", value: image.file.type.replace("image/", "").toUpperCase() },
              {
                label: "Resolution",
                value: image.width >= 1280 ? "≥ 1280 px wide" : image.width >= 640 ? "640–1279 px wide" : "< 640 px wide",
                note: image.width < 1280 ? "YouTube recommends 1280 × 720" : undefined,
              },
            ]}
          />
          <div className="mt-5 flex flex-wrap gap-1.5">
            {ratio.isSixteenNine ? <Badge tone="success">16:9</Badge> : <Badge tone="warning">Not 16:9 — will be letterboxed or cropped</Badge>}
            {image.width >= 1280 ? <Badge tone="success">Recommended width</Badge> : <Badge tone="warning">Below 1280 px</Badge>}
          </div>
        </Card>
      </div>

      {/* Visual analysis */}
      <section aria-labelledby="visual-h">
        <SectionHeading
          id="visual-h"
          title="Visual analysis"
          description="Visual characteristics that may affect readability. Measured, not predicted."
        />
        <MetricGrid>
          <MetricCard
            label="Brightness"
            value={a.brightness.toFixed(0)}
            unit="/ 100"
            meter={a.brightness}
            tag={<Badge>{brightnessLabel}</Badge>}
            hint="Mean Rec. 709 luma of all pixels, scaled 0–100."
          />
          <MetricCard
            label="Contrast"
            value={a.contrastRms.toFixed(1)}
            unit="% RMS"
            meter={Math.min(100, a.contrastRms * 3)}
            tag={<Badge>{contrastLabel}</Badge>}
            hint="RMS contrast: standard deviation of luma divided by 255. Higher means stronger light/dark separation."
            sub={`Tonal range (5th–95th percentile): ${a.dynamicRange.toFixed(0)}%`}
          />
          <MetricCard
            label="Saturation"
            value={a.saturation.toFixed(0)}
            unit="%"
            meter={a.saturation}
            tag={<Badge>{satLabel}</Badge>}
            hint="Mean HSV saturation across all pixels."
            sub={`Colorfulness ${a.colorfulness.toFixed(0)} · ${a.colorfulnessLabel}`}
          />
          <MetricCard
            label="Color diversity"
            value={a.colorDiversity.toFixed(0)}
            unit="/ 100"
            meter={a.colorDiversity}
            hint="Normalized entropy of colors quantized into 512 bins. 0 = one flat color, 100 = every bin equally used."
            sub={`${a.hueFamilies} distinct hue ${a.hueFamilies === 1 ? "family" : "families"} (≥ 3% of pixels)`}
          />
        </MetricGrid>
      </section>

      {/* Colors */}
      <section aria-labelledby="colors-h" className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <Card className="p-5 sm:p-6">
          <SectionHeading id="colors-h" title="Dominant colors" description="k-means clustering of a pixel sample." />
          <div className="flex h-10 gap-0.5 overflow-hidden rounded-xl">
            {a.dominantColors.map((c) => (
              <div key={c.hex} style={{ background: c.hex, width: `${c.share * 100}%` }} title={`${c.hex} · ${(c.share * 100).toFixed(1)}%`} />
            ))}
          </div>
          <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {a.dominantColors.map((c) => (
              <li key={c.hex} className="flex items-center gap-2.5 rounded-xl border border-line p-2">
                <span className="h-8 w-8 shrink-0 rounded-lg ring-1 ring-black/10 ring-inset" style={{ background: c.hex }} />
                <span className="min-w-0 flex-1">
                  <span className="block font-mono text-[12px] text-ink uppercase">{c.hex}</span>
                  <span className="num block text-[11px] text-muted">{(c.share * 100).toFixed(1)}%</span>
                </span>
                <CopyButton value={c.hex} label={`Copy ${c.hex}`} className="h-7 w-7 border-0 shadow-none" />
              </li>
            ))}
          </ul>
        </Card>
        <Card className="p-5 sm:p-6">
          <SectionHeading title="Tonal distribution" description="Share of pixels at each brightness level." />
          <LumaHistogram bins={a.lumaHistogram} />
          <div className="mt-2 flex justify-between text-[11px] text-muted">
            <span>Shadows</span>
            <span>Midtones</span>
            <span>Highlights</span>
          </div>
        </Card>
      </section>

      {/* Composition */}
      <section aria-labelledby="comp-h">
        <SectionHeading
          id="comp-h"
          title="Composition"
          description="Where detail and distinct color sit in the frame. Heuristic measurements — not object recognition."
        />
        <MetricGrid>
          <MetricCard
            label="Subject position"
            value={<span className="text-xl capitalize">{a.subject.region}</span>}
            hint="Weighted center of the 15% most distinctive areas (edge density + color distinct from the average)."
            sub={
              <div className="flex items-center gap-3">
                <ThirdsDot x={a.subject.x} y={a.subject.y} />
                <span>
                  Center at {(a.subject.x * 100).toFixed(0)}% × {(a.subject.y * 100).toFixed(0)}%
                </span>
              </div>
            }
          />
          <MetricCard
            label="Text-like area"
            value={`≈ ${a.textLikeArea.toFixed(0)}`}
            unit="%"
            meter={a.textLikeArea}
            hint="Share of the frame with dense, high-contrast strokes arranged horizontally — typical of text. An approximation, not OCR; logos and fine patterns can register too."
          />
          <MetricCard
            label="Whitespace"
            value={a.lowDetailArea.toFixed(0)}
            unit="%"
            meter={a.lowDetailArea}
            hint="Share of the frame made of flat, low-detail blocks (little edge or tonal variation)."
            sub="Low-detail area of the frame"
          />
          <MetricCard
            label="Edge density"
            value={a.edgeDensity.toFixed(1)}
            unit="%"
            meter={Math.min(100, a.edgeDensity * 4)}
            tag={<Badge>{a.complexityLabel} complexity</Badge>}
            hint="Share of pixels on a strong Sobel edge. Complexity uses spatial information (SI), the standard deviation of edge strength (ITU-T P.910)."
            sub={`Spatial information (SI): ${a.spatialInformation.toFixed(0)}`}
          />
        </MetricGrid>
        <p className="mt-3 text-xs text-muted">
          Face detection:{" "}
          {faces === null
            ? "checking…"
            : faces.status === "unsupported"
              ? "not available in this browser (uses the built-in Shape Detection API; no model is downloaded)."
              : faces.status === "error"
                ? "the browser's detector returned an error for this image."
                : faces.faces.length === 0
                  ? "no faces detected by the browser's detector."
                  : `${faces.faces.length} face${faces.faces.length > 1 ? "s" : ""} detected — shown on the Subject overlay.`}
        </p>
      </section>

      {/* Size preview */}
      <section aria-labelledby="sizes-h">
        <SectionHeading
          id="sizes-h"
          title="Thumbnail at real sizes"
          description="Rendered at typical on-screen widths in CSS pixels. Look for text or detail that disappears as it shrinks."
        />
        <Card className="overflow-x-auto p-5 sm:p-6">
          <div className="flex min-w-max items-end gap-6">
            {[
              { w: 360, label: "Desktop home", sub: "≈ 360 px" },
              { w: 246, label: "Medium / search", sub: "≈ 246 px" },
              { w: 168, label: "Mobile suggested", sub: "≈ 168 px" },
              { w: 120, label: "Very small", sub: "≈ 120 px" },
            ].map((s) => (
              <figure key={s.w}>
                {/* eslint-disable-next-line @next/next/no-img-element -- local object URL */}
                <img src={image.url} alt={`Thumbnail at ${s.w} pixels wide`} style={{ width: s.w }} className="aspect-video rounded-lg object-cover" />
                <figcaption className="mt-2 text-xs">
                  <span className="font-medium text-ink">{s.label}</span> <span className="num text-muted">{s.sub}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}

function ThirdsDot({ x, y }: { x: number; y: number }) {
  return (
    <span className="relative inline-block aspect-video w-14 shrink-0 rounded border border-line-strong bg-bg-subtle" aria-hidden>
      <span className="absolute inset-y-0 left-1/3 w-px bg-line-strong" />
      <span className="absolute inset-y-0 left-2/3 w-px bg-line-strong" />
      <span className="absolute inset-x-0 top-1/3 h-px bg-line-strong" />
      <span className="absolute inset-x-0 top-2/3 h-px bg-line-strong" />
      <span
        className="absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent ring-2 ring-surface"
        style={{ left: `${x * 100}%`, top: `${y * 100}%` }}
      />
    </span>
  );
}

function LumaHistogram({ bins }: { bins: number[] }) {
  const max = Math.max(...bins) || 1;
  return (
    <div className="flex h-36 items-end gap-[2px]" role="img" aria-label="Luminance histogram">
      {bins.map((b, i) => (
        <div
          key={i}
          className="group relative flex-1 rounded-t-[3px] bg-ink/75 transition-colors hover:bg-accent"
          style={{ height: `${Math.max(1, (b / max) * 100)}%` }}
        >
          <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 rounded bg-ink px-1.5 py-0.5 text-[10px] whitespace-nowrap text-bg group-hover:block">
            {(b * 100).toFixed(1)}%
          </span>
        </div>
      ))}
    </div>
  );
}

function OverlayPreview({
  image,
  analysis,
  overlay,
  faces,
}: {
  image: LoadedImage;
  analysis: ThumbnailAnalysis;
  overlay: Overlay;
  faces: { x: number; y: number; w: number; h: number }[];
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { grid } = analysis;

  const maxSal = useMemo(() => Math.max(...grid.saliency) || 1, [grid]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = grid.cols;
    canvas.height = grid.rows;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, grid.cols, grid.rows);
    if (overlay === "detail") {
      for (let b = 0; b < grid.cols * grid.rows; b++) {
        const v = grid.saliency[b] / maxSal;
        ctx.fillStyle = `rgba(212, 64, 31, ${(v * 0.75).toFixed(3)})`;
        ctx.fillRect(b % grid.cols, Math.floor(b / grid.cols), 1, 1);
      }
    } else if (overlay === "text") {
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.fillRect(0, 0, grid.cols, grid.rows);
      for (let b = 0; b < grid.cols * grid.rows; b++) {
        if (grid.textLike[b]) ctx.clearRect(b % grid.cols, Math.floor(b / grid.cols), 1, 1);
      }
    }
  }, [overlay, grid, maxSal]);

  const { box } = analysis.subject;

  return (
    <div className="checker relative overflow-hidden rounded-2xl border border-line shadow-raised">
      {/* eslint-disable-next-line @next/next/no-img-element -- local object URL */}
      <img src={image.url} alt="Uploaded thumbnail" className="block h-auto w-full" />
      <canvas
        ref={canvasRef}
        aria-hidden
        className={cn("absolute inset-0 h-full w-full transition-opacity duration-200", overlay === "detail" || overlay === "text" ? "opacity-100" : "opacity-0")}
        style={{ imageRendering: overlay === "text" ? "pixelated" : "auto" }}
      />
      {overlay === "subject" ? (
        <>
          <div
            className="absolute rounded-md border-2 border-dashed border-white/90 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]"
            style={{ left: `${box.x * 100}%`, top: `${box.y * 100}%`, width: `${box.w * 100}%`, height: `${box.h * 100}%` }}
          />
          <div
            className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent ring-2 ring-white"
            style={{ left: `${analysis.subject.x * 100}%`, top: `${analysis.subject.y * 100}%` }}
          />
          {faces.map((f, i) => (
            <div
              key={i}
              className="absolute rounded border-2 border-[#3987e5]"
              style={{ left: `${f.x * 100}%`, top: `${f.y * 100}%`, width: `${f.w * 100}%`, height: `${f.h * 100}%` }}
            />
          ))}
        </>
      ) : null}
    </div>
  );
}
