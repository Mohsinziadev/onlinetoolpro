"use client";

import { useEffect, useState } from "react";
import { Check, Eye, Ruler, X } from "lucide-react";
import { ThumbnailWorkspace } from "@/components/thumbnail/thumbnail-workspace";
import { LoadingState } from "@/components/tool/states";
import { Badge, Card } from "@/components/ui/primitives";
import { SectionHeading } from "@/components/tool/metric";
import { analyzeImage, detailRetention } from "@/lib/image/analyze";
import { rasterize, rasterizeToWidth, type LoadedImage } from "@/lib/image/load";
import { cn } from "@/lib/utils";

/** 100% = the 1280 px reference width YouTube recommends for thumbnails. */
const REFERENCE_WIDTH = 1280;
const SCALES = [1, 0.75, 0.5, 0.25, 0.15, 0.1] as const;
/** Measure at up to the reference width so losses at 75% and 50% are visible. */
const ANALYSIS_WIDTH = REFERENCE_WIDTH;

type ScaleResult = { scale: number; px: number; overall: number; text: number | null };

export function ThumbnailReadability() {
  return (
    <ThumbnailWorkspace emptyTitle="Drop a thumbnail to test readability">{(image) => <ReadabilityResults image={image} />}</ThumbnailWorkspace>
  );
}

function measure(image: LoadedImage): { results: ScaleResult[]; hasText: boolean } {
  const original = rasterizeToWidth(image.bitmap, ANALYSIS_WIDTH);
  const analysis = analyzeImage(original);
  const textBlocks = analysis.grid.textLike;
  const hasText = textBlocks.some((b) => b === 1);
  const aspect = image.height / image.width;

  const results = SCALES.map((scale) => {
    const px = Math.round(REFERENCE_WIDTH * scale);
    // Downscale to the on-screen width, then back up to the analysis size
    const small = document.createElement("canvas");
    small.width = px;
    small.height = Math.max(1, Math.round(px * aspect));
    const sctx = small.getContext("2d");
    if (!sctx) throw new Error("Canvas unavailable");
    sctx.imageSmoothingQuality = "high";
    sctx.drawImage(image.bitmap, 0, 0, small.width, small.height);
    const roundTrip = rasterize(small, original.width, original.height);
    const overall = detailRetention(original, roundTrip);
    const text = hasText ? detailRetention(original, roundTrip, { grid: analysis.grid, blocks: textBlocks }) : null;
    return { scale, px, overall, text };
  });
  return { results, hasText };
}

function verdict(v: number): { label: string; tone: "success" | "warning" | "danger" } {
  if (v >= 0.7) return { label: "Largely preserved", tone: "success" };
  if (v >= 0.4) return { label: "Partially preserved", tone: "warning" };
  return { label: "Mostly lost", tone: "danger" };
}

function ReadabilityResults({ image }: { image: LoadedImage }) {
  const [data, setData] = useState<{ url: string; results: ScaleResult[]; hasText: boolean } | null>(null);
  const [answers, setAnswers] = useState<Record<string, Record<number, boolean>>>({});

  useEffect(() => {
    let cancelled = false;
    const id = requestAnimationFrame(() => {
      const r = measure(image);
      if (!cancelled) setData({ url: image.url, ...r });
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(id);
    };
  }, [image]);

  if (!data || data.url !== image.url) return <LoadingState label="Rendering and measuring each size…" />;
  const mine = answers[image.url] ?? {};
  const setAnswer = (scale: number, ok: boolean) =>
    setAnswers((a) => ({ ...a, [image.url]: { ...(a[image.url] ?? {}), [scale]: ok } }));

  const firstLost = data.results.find((r) => (r.text ?? r.overall) < 0.4);
  const lastReadable = [...data.results].reverse().find((r) => mine[r.scale] === true);

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Card className="flex gap-4 p-5">
          <Ruler aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-muted" strokeWidth={1.75} />
          <div>
            <p className="text-[13px] font-medium text-muted">Measurement</p>
            <p className="mt-1 text-[15px] text-ink">
              {firstLost
                ? `${data.hasText ? "Text-like detail" : "Fine detail"} drops below 40% retention at ${Math.round(firstLost.scale * 100)}% (${firstLost.px} px wide).`
                : `${data.hasText ? "Text-like detail" : "Fine detail"} stays above 40% retention at every tested size.`}
            </p>
            {!data.hasText ? <p className="mt-1 text-xs text-muted">No text-like regions were detected, so the whole image is measured.</p> : null}
          </div>
        </Card>
        <Card className="flex gap-4 p-5">
          <Eye aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-muted" strokeWidth={1.75} />
          <div>
            <p className="text-[13px] font-medium text-muted">Your judgement</p>
            <p className="mt-1 text-[15px] text-ink">
              {Object.keys(mine).length === 0
                ? "Mark each size below: can you still read the text?"
                : lastReadable
                  ? `You marked the text readable down to ${Math.round(lastReadable.scale * 100)}% (${lastReadable.px} px).`
                  : "You haven't marked any size as readable yet."}
            </p>
            <p className="mt-1 text-xs text-muted">Only you can judge legibility. Measurements help you know where to look.</p>
          </div>
        </Card>
      </div>

      <section aria-labelledby="scales-h">
        <SectionHeading
          id="scales-h"
          title="Can the text still be read?"
          description="Each tile is drawn at its real pixel width — no upscaling — so you see what a viewer sees."
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {data.results.map((r) => {
            const primary = r.text ?? r.overall;
            const v = verdict(primary);
            const answer = mine[r.scale];
            return (
              <Card key={r.scale} className="flex flex-col p-4">
                <div className="flex items-baseline justify-between">
                  <p className="num text-lg font-semibold text-ink">{Math.round(r.scale * 100)}%</p>
                  <p className="num text-xs text-muted">{r.px} px wide</p>
                </div>
                <div className="checker mt-3 flex min-h-[120px] flex-1 items-center justify-center overflow-hidden rounded-xl p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element -- local object URL */}
                  <img
                    src={image.url}
                    alt={`Thumbnail at ${r.px} pixels wide`}
                    style={{ width: r.px, maxWidth: "100%" }}
                    className="h-auto rounded"
                  />
                </div>
                {r.px > 320 ? <p className="mt-1.5 text-[11px] text-faint">Scaled to fit this card on smaller screens.</p> : null}
                <dl className="mt-3 space-y-1.5 text-[12.5px]">
                  {r.text !== null ? (
                    <div className="flex items-center justify-between">
                      <dt className="text-muted">Text-like detail retained</dt>
                      <dd className="num font-medium text-ink">{(r.text * 100).toFixed(0)}%</dd>
                    </div>
                  ) : null}
                  <div className="flex items-center justify-between">
                    <dt className="text-muted">Overall detail retained</dt>
                    <dd className="num font-medium text-ink">{(r.overall * 100).toFixed(0)}%</dd>
                  </div>
                </dl>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-bg-subtle">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      v.tone === "success" ? "bg-success" : v.tone === "warning" ? "bg-warning" : "bg-danger",
                    )}
                    style={{ width: `${primary * 100}%` }}
                  />
                </div>
                <div className="mt-3 flex items-center justify-between gap-2 border-t border-line pt-3">
                  <Badge tone={v.tone}>{v.label}</Badge>
                  <div className="flex items-center gap-1" role="group" aria-label={`Can you read the text at ${Math.round(r.scale * 100)}%?`}>
                    <span className="mr-1 text-[11.5px] text-muted">Readable?</span>
                    <button
                      type="button"
                      aria-pressed={answer === true}
                      onClick={() => setAnswer(r.scale, true)}
                      className={cn(
                        "inline-flex h-7 w-7 items-center justify-center rounded-full border transition-colors",
                        answer === true ? "border-success bg-success text-white" : "border-line text-muted hover:text-ink",
                      )}
                      aria-label="Yes"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      aria-pressed={answer === false}
                      onClick={() => setAnswer(r.scale, false)}
                      className={cn(
                        "inline-flex h-7 w-7 items-center justify-center rounded-full border transition-colors",
                        answer === false ? "border-danger bg-danger text-white" : "border-line text-muted hover:text-ink",
                      )}
                      aria-label="No"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      <Card className="p-5 text-[13.5px] leading-relaxed text-muted sm:p-6">
        <p className="font-medium text-ink">Measurement vs. recommendation</p>
        <p className="mt-1.5">
          <strong className="text-ink">Measured:</strong> the share of edge contrast that survives when the image is
          reduced to each width and scaled back up.{" "}
          <strong className="text-ink">Not measured:</strong> whether a person can read the words, or whether the
          thumbnail will perform well. If detail drops sharply at 25% or 15%, larger text, thicker strokes or a stronger
          brightness difference between text and background are changes worth testing.
        </p>
      </Card>
    </div>
  );
}
