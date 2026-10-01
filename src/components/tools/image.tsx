"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent } from "react";
import { RotateCcw } from "lucide-react";
import { Choice, DownloadButton, ErrorNote, FieldLabel, FileDrop, FileMeta, OutputBox, Panel, Slider, TextField, Toggle, baseName, canvasToBlob, readImage, saveBlob } from "@/components/kit";
import { CopyButton } from "@/components/tool/copy-button";
import { dominantColors } from "@/lib/image/analyze";
import { formatBytes, cn } from "@/lib/utils";

const IMAGE_ACCEPT = "image/png,image/jpeg,image/webp,image/gif,image/bmp,image/avif";
type Fmt = "image/jpeg" | "image/png" | "image/webp";
const EXT: Record<Fmt, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

type Loaded = { file: File; img: HTMLImageElement };

/** Load one image file with friendly errors; frees the previous object URL. */
function useImageFile() {
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [error, setError] = useState("");
  async function load(files: File[]) {
    setError("");
    try {
      const img = await readImage(files[0]);
      setLoaded((prev) => {
        if (prev) URL.revokeObjectURL(prev.img.src);
        return { file: files[0], img };
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "That file couldn't be opened.");
    }
  }
  return { loaded, error, load, reset: () => setLoaded(null) };
}

/** Draw an image onto a canvas at a size; JPEG gets a white background (it has no transparency). */
function draw(img: CanvasImageSource, w: number, h: number, fmt: Fmt, sx = 0, sy = 0, sw?: number, sh?: number) {
  const c = document.createElement("canvas");
  c.width = Math.max(1, Math.round(w));
  c.height = Math.max(1, Math.round(h));
  const ctx = c.getContext("2d")!;
  if (fmt === "image/jpeg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, c.width, c.height);
  }
  ctx.imageSmoothingQuality = "high";
  if (sw !== undefined && sh !== undefined) ctx.drawImage(img, sx, sy, sw, sh, 0, 0, c.width, c.height);
  else ctx.drawImage(img, 0, 0, c.width, c.height);
  return c;
}

function StartOver({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="chip">
      <RotateCcw aria-hidden className="h-3.5 w-3.5" /> Use another image
    </button>
  );
}

function Preview({ src, alt, className }: { src: string; alt: string; className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className={cn("checker mx-auto max-h-[420px] w-auto max-w-full rounded-2xl border border-line object-contain", className)} />;
}

/* ——— Compressor ——— */

export function ImageCompressor() {
  const { loaded, error, load, reset } = useImageFile();
  const [quality, setQuality] = useState(75);
  const [fmt, setFmt] = useState<"image/jpeg" | "image/webp">("image/jpeg");
  const [maxWidth, setMaxWidth] = useState(0);
  const [out, setOut] = useState<{ blob: Blob; url: string } | null>(null);

  useEffect(() => {
    if (!loaded) return;
    let cancelled = false;
    const { img } = loaded;
    const scale = maxWidth && img.naturalWidth > maxWidth ? maxWidth / img.naturalWidth : 1;
    const t = window.setTimeout(async () => {
      const blob = await canvasToBlob(draw(img, img.naturalWidth * scale, img.naturalHeight * scale, fmt), fmt, quality / 100);
      if (cancelled) return;
      setOut((prev) => {
        if (prev) URL.revokeObjectURL(prev.url);
        return { blob, url: URL.createObjectURL(blob) };
      });
    }, 120);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [loaded, quality, fmt, maxWidth]);

  if (!loaded) return <div className="space-y-3">{error ? <ErrorNote>{error}</ErrorNote> : null}<FileDrop accept={IMAGE_ACCEPT} onFiles={load} title="Drop an image to compress" /></div>;

  const before = loaded.file.size;
  const after = out?.blob.size ?? 0;
  const saved = before ? Math.round((1 - after / before) * 100) : 0;
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
      <Panel className="space-y-5">
        <FileMeta name={loaded.file.name} size={before} extra={`${loaded.img.naturalWidth} × ${loaded.img.naturalHeight}`} />
        <Slider label="Quality" value={quality} onChange={setQuality} min={10} max={100} unit="%" />
        <Choice label="Save as" value={fmt} onChange={setFmt} options={[{ value: "image/jpeg", label: "JPG" }, { value: "image/webp", label: "WebP (smaller)" }]} />
        <Choice
          label="Also shrink to (optional)"
          value={String(maxWidth)}
          onChange={(v) => setMaxWidth(Number(v))}
          options={[
            { value: "0", label: "Keep size" },
            { value: "2560", label: "2560 px" },
            { value: "1920", label: "1920 px" },
            { value: "1280", label: "1280 px" },
          ]}
        />
        <StartOver onClick={reset} />
      </Panel>
      <Panel className="space-y-4">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-2xl bg-bg-subtle p-3">
            <p className="text-[12px] text-muted">Before</p>
            <p className="num text-[17px] font-medium text-ink">{formatBytes(before)}</p>
          </div>
          <div className="rounded-2xl bg-bg-subtle p-3">
            <p className="text-[12px] text-muted">After</p>
            <p className="num text-[17px] font-medium text-ink">{out ? formatBytes(after) : "…"}</p>
          </div>
          <div className={cn("rounded-2xl p-3", saved > 0 ? "bg-success-soft" : "bg-warning-soft")}>
            <p className="text-[12px] text-muted">Saved</p>
            <p className={cn("num text-[17px] font-medium", saved > 0 ? "text-success" : "text-warning")}>{out ? `${saved}%` : "…"}</p>
          </div>
        </div>
        {out && saved <= 0 ? <p className="text-[13px] text-warning">This version is bigger than the original — try a lower quality or WebP.</p> : null}
        {out ? <Preview src={out.url} alt="Compressed image preview" /> : null}
        <DownloadButton disabled={!out} onClick={() => out && saveBlob(out.blob, `${baseName(loaded.file.name)}-compressed.${EXT[fmt]}`)}>
          Download compressed image
        </DownloadButton>
      </Panel>
    </div>
  );
}

/* ——— Resizer ——— */

export function ImageResizer() {
  const { loaded, error, load, reset } = useImageFile();
  const [w, setW] = useState("");
  const [h, setH] = useState("");
  const [lock, setLock] = useState(true);
  const [fmt, setFmt] = useState<Fmt>("image/png");

  // When a new image arrives, start from its real size and format.
  const [sizedFor, setSizedFor] = useState<File | null>(null);
  if (loaded && sizedFor !== loaded.file) {
    setSizedFor(loaded.file);
    setW(String(loaded.img.naturalWidth));
    setH(String(loaded.img.naturalHeight));
    setFmt(loaded.file.type === "image/jpeg" ? "image/jpeg" : loaded.file.type === "image/webp" ? "image/webp" : "image/png");
  }

  if (!loaded) return <div className="space-y-3">{error ? <ErrorNote>{error}</ErrorNote> : null}<FileDrop accept={IMAGE_ACCEPT} onFiles={load} title="Drop an image to resize" /></div>;

  const ratio = loaded.img.naturalWidth / loaded.img.naturalHeight;
  const W = Math.round(Number(w));
  const H = Math.round(Number(h));
  const valid = W > 0 && H > 0 && W <= 12000 && H <= 12000;

  function setWidth(v: string) {
    setW(v);
    if (lock && Number(v) > 0) setH(String(Math.round(Number(v) / ratio)));
  }
  function setHeight(v: string) {
    setH(v);
    if (lock && Number(v) > 0) setW(String(Math.round(Number(v) * ratio)));
  }
  function percent(p: number) {
    setW(String(Math.round(loaded!.img.naturalWidth * p)));
    setH(String(Math.round(loaded!.img.naturalHeight * p)));
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[340px_minmax(0,1fr)]">
      <Panel className="space-y-5">
        <FileMeta name={loaded.file.name} size={loaded.file.size} extra={`${loaded.img.naturalWidth} × ${loaded.img.naturalHeight}`} />
        <div className="grid grid-cols-2 gap-3">
          {[
            ["Width (px)", w, setWidth],
            ["Height (px)", h, setHeight],
          ].map(([label, v, fn]) => (
            <div key={label as string}>
              <FieldLabel htmlFor={`rs-${label}`}>{label as string}</FieldLabel>
              <input id={`rs-${label}`} value={v as string} onChange={(e) => (fn as (s: string) => void)(e.target.value.replace(/[^\d]/g, ""))} inputMode="numeric" className="num h-11 w-full rounded-xl border border-line bg-surface-2 px-3 text-[15px] text-ink outline-none focus:border-accent/50 focus:ring-4 focus:ring-accent/10" />
            </div>
          ))}
        </div>
        <Toggle label="Keep proportions" checked={lock} onChange={setLock} />
        <div className="flex flex-wrap gap-2">
          {[0.25, 0.5, 0.75, 2].map((p) => (
            <button key={p} type="button" onClick={() => percent(p)} className="chip">
              {p * 100}%
            </button>
          ))}
        </div>
        <Choice label="Save as" value={fmt} onChange={setFmt} options={[{ value: "image/png", label: "PNG" }, { value: "image/jpeg", label: "JPG" }, { value: "image/webp", label: "WebP" }]} />
        <StartOver onClick={reset} />
      </Panel>
      <Panel className="space-y-4">
        <Preview src={loaded.img.src} alt="Image to resize" />
        {!valid ? <ErrorNote>Enter a width and height between 1 and 12,000 pixels.</ErrorNote> : <p className="text-[14px] text-muted">New size: <span className="num font-medium text-ink">{W} × {H}</span> pixels</p>}
        <DownloadButton
          disabled={!valid}
          onClick={async () => saveBlob(await canvasToBlob(draw(loaded.img, W, H, fmt), fmt, 0.92), `${baseName(loaded.file.name)}-${W}x${H}.${EXT[fmt]}`)}
        >
          Download resized image
        </DownloadButton>
      </Panel>
    </div>
  );
}

/* ——— Cropper ——— */

type Box = { x: number; y: number; w: number; h: number }; // fractions of the image, 0–1
type Corner = "nw" | "ne" | "sw" | "se";
const ASPECTS: { value: string; label: string; r: number | null }[] = [
  { value: "free", label: "Free", r: null },
  { value: "1:1", label: "Square 1:1", r: 1 },
  { value: "16:9", label: "16:9", r: 16 / 9 },
  { value: "4:3", label: "4:3", r: 4 / 3 },
  { value: "9:16", label: "9:16 (story)", r: 9 / 16 },
];
const MIN = 0.03;
const clamp01 = (n: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, n));

/** Largest box of pixel ratio `r` that fits, centered on the current box. */
function fitAspect(b: Box, r: number | null, imgRatio: number): Box {
  if (!r) return b;
  // Pixel ratio (w·W)/(h·H) = r  →  h = w · imgRatio / r
  let w = b.w;
  let h = (w * imgRatio) / r;
  if (h > 1) {
    h = 1;
    w = (h * r) / imgRatio;
  }
  if (w > 1) {
    w = 1;
    h = (w * imgRatio) / r;
  }
  const cx = b.x + b.w / 2;
  const cy = b.y + b.h / 2;
  return { x: clamp01(cx - w / 2, 0, 1 - w), y: clamp01(cy - h / 2, 0, 1 - h), w, h };
}

/** Resize from a corner; the opposite corner stays put. Keeps the ratio when one is set. */
function resizeFrom(corner: Corner, s: Box, dx: number, dy: number, r: number | null, imgRatio: number): Box {
  const west = corner.includes("w");
  const north = corner.includes("n");
  let x1 = s.x, y1 = s.y, x2 = s.x + s.w, y2 = s.y + s.h;
  if (west) x1 = clamp01(x1 + dx, 0, x2 - MIN);
  else x2 = clamp01(x2 + dx, x1 + MIN, 1);
  if (north) y1 = clamp01(y1 + dy, 0, y2 - MIN);
  else y2 = clamp01(y2 + dy, y1 + MIN, 1);
  if (!r) return { x: x1, y: y1, w: x2 - x1, h: y2 - y1 };

  // Locked ratio: width drives height; if that runs off the image, height drives width.
  let w = x2 - x1;
  let h = (w * imgRatio) / r;
  const room = north ? y2 : 1 - y1;
  if (h > room) {
    h = room;
    w = (h * r) / imgRatio;
  }
  const x = west ? x2 - w : x1;
  const y = north ? y2 - h : y1;
  return { x, y, w, h };
}

export function ImageCropper() {
  const { loaded, error, load, reset } = useImageFile();
  const [aspect, setAspect] = useState("free");
  const [box, setBox] = useState<Box>({ x: 0.1, y: 0.1, w: 0.8, h: 0.8 });
  const [fmt, setFmt] = useState<Fmt>("image/png");
  const frame = useRef<HTMLDivElement>(null);
  const drag = useRef<{ mode: "move" | Corner; sx: number; sy: number; start: Box } | null>(null);

  const imgRatio = loaded ? loaded.img.naturalWidth / loaded.img.naturalHeight : 1;
  const ratio = ASPECTS.find((a) => a.value === aspect)?.r ?? null;

  function start(e: ReactPointerEvent, mode: "move" | Corner) {
    e.preventDefault();
    e.stopPropagation();
    frame.current?.setPointerCapture(e.pointerId);
    drag.current = { mode, sx: e.clientX, sy: e.clientY, start: box };
  }
  function move(e: ReactPointerEvent) {
    const d = drag.current;
    const el = frame.current;
    if (!d || !el) return;
    const rect = el.getBoundingClientRect();
    const dx = (e.clientX - d.sx) / rect.width;
    const dy = (e.clientY - d.sy) / rect.height;
    if (d.mode === "move") setBox({ ...d.start, x: clamp01(d.start.x + dx, 0, 1 - d.start.w), y: clamp01(d.start.y + dy, 0, 1 - d.start.h) });
    else setBox(resizeFrom(d.mode, d.start, dx, dy, ratio, imgRatio));
  }
  function end(e: ReactPointerEvent) {
    if (frame.current?.hasPointerCapture(e.pointerId)) frame.current.releasePointerCapture(e.pointerId);
    drag.current = null;
  }
  function nudge(e: ReactKeyboardEvent) {
    const step = e.shiftKey ? 0.05 : 0.01;
    const moves: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
    const m = moves[e.key];
    if (!m) return;
    e.preventDefault();
    setBox((b) => ({ ...b, x: clamp01(b.x + m[0], 0, 1 - b.w), y: clamp01(b.y + m[1], 0, 1 - b.h) }));
  }

  if (!loaded) return <div className="space-y-3">{error ? <ErrorNote>{error}</ErrorNote> : null}<FileDrop accept={IMAGE_ACCEPT} onFiles={load} title="Drop an image to crop" /></div>;

  const W = loaded.img.naturalWidth;
  const H = loaded.img.naturalHeight;
  const px = { x: Math.round(box.x * W), y: Math.round(box.y * H), w: Math.max(1, Math.round(box.w * W)), h: Math.max(1, Math.round(box.h * H)) };
  const pct = (n: number) => `${n * 100}%`;

  /** Edit the crop in exact pixels (width/height respect the chosen shape). */
  function setPx(key: "x" | "y" | "w" | "h", raw: string) {
    const v = Number(raw.replace(/[^\d]/g, ""));
    if (!Number.isFinite(v)) return;
    setBox((b) => {
      if (key === "x") return { ...b, x: clamp01(v / W, 0, 1 - b.w) };
      if (key === "y") return { ...b, y: clamp01(v / H, 0, 1 - b.h) };
      if (key === "w") {
        const w = clamp01(v / W, MIN, 1 - b.x);
        return ratio ? fitAspect({ ...b, w }, ratio, imgRatio) : { ...b, w };
      }
      const h = clamp01(v / H, MIN, 1 - b.y);
      return ratio ? fitAspect({ ...b, h, w: (h * ratio) / imgRatio }, ratio, imgRatio) : { ...b, h };
    });
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
      <Panel>
        <div
          ref={frame}
          className="relative mx-auto w-fit touch-none select-none"
          onPointerMove={move}
          onPointerUp={end}
          onPointerCancel={end}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={loaded.img.src} alt="Image being cropped" className="block max-h-[min(680px,72vh)] w-auto max-w-full rounded-md" draggable={false} />

          {/* Shade everything outside the crop — four panels, clipped to the image. */}
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-md">
            <div className="absolute inset-x-0 top-0 bg-black/55" style={{ height: pct(box.y) }} />
            <div className="absolute inset-x-0 bottom-0 bg-black/55" style={{ height: pct(1 - box.y - box.h) }} />
            <div className="absolute left-0 bg-black/55" style={{ top: pct(box.y), height: pct(box.h), width: pct(box.x) }} />
            <div className="absolute right-0 bg-black/55" style={{ top: pct(box.y), height: pct(box.h), width: pct(1 - box.x - box.w) }} />
          </div>

          {/* The crop box: move by dragging, resize from any corner, arrow keys to nudge. */}
          <div
            role="group"
            aria-roledescription="crop area"
            aria-label={`Crop area, ${px.w} by ${px.h} pixels. Drag to move, or use the arrow keys.`}
            tabIndex={0}
            onKeyDown={nudge}
            onPointerDown={(e) => start(e, "move")}
            className="absolute cursor-move outline-none focus-visible:ring-4 focus-visible:ring-accent/40"
            style={{ left: pct(box.x), top: pct(box.y), width: pct(box.w), height: pct(box.h) }}
          >
            {/* Dual-tone border: visible on light and dark images */}
            <div aria-hidden className="pointer-events-none absolute inset-0 border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.55),inset_0_0_0_1px_rgba(0,0,0,0.35)]" />
            {/* Rule-of-thirds guides */}
            <div aria-hidden className="pointer-events-none absolute inset-0">
              {[33.333, 66.666].map((p) => (
                <span key={`v${p}`} className="absolute top-0 h-full w-px bg-white/60" style={{ left: `${p}%` }} />
              ))}
              {[33.333, 66.666].map((p) => (
                <span key={`h${p}`} className="absolute left-0 h-px w-full bg-white/60" style={{ top: `${p}%` }} />
              ))}
            </div>
            {(["nw", "ne", "sw", "se"] as Corner[]).map((c) => (
              <span
                key={c}
                role="presentation"
                onPointerDown={(e) => start(e, c)}
                className={cn(
                  "absolute h-4 w-4 rounded-full border-2 border-white bg-accent shadow-[0_0_0_1px_rgba(0,0,0,0.4)]",
                  c === "nw" && "-top-2 -left-2 cursor-nwse-resize",
                  c === "ne" && "-top-2 -right-2 cursor-nesw-resize",
                  c === "sw" && "-bottom-2 -left-2 cursor-nesw-resize",
                  c === "se" && "-right-2 -bottom-2 cursor-nwse-resize",
                )}
              />
            ))}
          </div>
        </div>
        <p className="mt-4 text-center text-[13px] text-muted">Drag the box to move it and the corner dots to resize. Arrow keys nudge it (hold Shift for bigger steps).</p>
      </Panel>

      <Panel className="space-y-5">
        <FileMeta name={loaded.file.name} size={loaded.file.size} extra={`${W} × ${H}`} />
        <Choice
          label="Shape"
          value={aspect}
          onChange={(v) => {
            setAspect(v);
            setBox((b) => fitAspect(b, ASPECTS.find((a) => a.value === v)?.r ?? null, imgRatio));
          }}
          options={ASPECTS.map((a) => ({ value: a.value, label: a.label }))}
        />
        <div>
          <FieldLabel>Crop area (pixels)</FieldLabel>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                ["w", "Width", px.w],
                ["h", "Height", px.h],
                ["x", "Left", px.x],
                ["y", "Top", px.y],
              ] as const
            ).map(([k, label, v]) => (
              <label key={k} className="flex h-10 items-center gap-2 rounded-xl border border-line bg-surface-2 px-3 text-[13px] text-muted focus-within:border-accent/50">
                <span className="w-12 shrink-0">{label}</span>
                <input value={v} onChange={(e) => setPx(k, e.target.value)} inputMode="numeric" className="num w-full min-w-0 bg-transparent text-right text-[14px] text-ink outline-none" />
              </label>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setBox(fitAspect({ x: 0, y: 0, w: 1, h: 1 }, ratio, imgRatio))} className="chip">
            Select all
          </button>
          <button type="button" onClick={() => setBox(fitAspect({ x: 0.1, y: 0.1, w: 0.8, h: 0.8 }, ratio, imgRatio))} className="chip">
            <RotateCcw aria-hidden className="h-3.5 w-3.5" /> Reset
          </button>
        </div>
        <Choice label="Save as" value={fmt} onChange={setFmt} options={[{ value: "image/png", label: "PNG" }, { value: "image/jpeg", label: "JPG" }, { value: "image/webp", label: "WebP" }]} />
        <DownloadButton onClick={async () => saveBlob(await canvasToBlob(draw(loaded.img, px.w, px.h, fmt, px.x, px.y, px.w, px.h), fmt, 0.92), `${baseName(loaded.file.name)}-cropped.${EXT[fmt]}`)}>
          Download cropped image
        </DownloadButton>
        <StartOver onClick={reset} />
      </Panel>
    </div>
  );
}

/* ——— Converter ——— */

export function ImageConverter() {
  const { loaded, error, load, reset } = useImageFile();
  const [fmt, setFmt] = useState<Fmt>("image/png");
  const [quality, setQuality] = useState(90);

  if (!loaded) return <div className="space-y-3">{error ? <ErrorNote>{error}</ErrorNote> : null}<FileDrop accept={IMAGE_ACCEPT} onFiles={load} title="Drop an image to convert" hint="JPG, PNG, WebP, GIF, BMP or AVIF — the file stays on your device." /></div>;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
      <Panel className="space-y-5">
        <FileMeta name={loaded.file.name} size={loaded.file.size} extra={loaded.file.type.replace("image/", "").toUpperCase()} />
        <Choice label="Convert to" value={fmt} onChange={setFmt} options={[{ value: "image/png", label: "PNG" }, { value: "image/jpeg", label: "JPG" }, { value: "image/webp", label: "WebP" }]} />
        {fmt !== "image/png" ? <Slider label="Quality" value={quality} onChange={setQuality} min={30} max={100} unit="%" /> : <p className="text-[13px] text-muted">PNG is lossless — no quality setting needed.</p>}
        {fmt === "image/jpeg" ? <p className="text-[13px] text-muted">JPG has no transparency, so see-through areas become white.</p> : null}
        <DownloadButton onClick={async () => saveBlob(await canvasToBlob(draw(loaded.img, loaded.img.naturalWidth, loaded.img.naturalHeight, fmt), fmt, quality / 100), `${baseName(loaded.file.name)}.${EXT[fmt]}`)}>
          Download {EXT[fmt].toUpperCase()}
        </DownloadButton>
        <StartOver onClick={reset} />
      </Panel>
      <Panel>
        <Preview src={loaded.img.src} alt="Image to convert" />
      </Panel>
    </div>
  );
}

/* ——— Color extractor + picker ——— */

export function ImageColorExtractor() {
  const { loaded, error, load, reset } = useImageFile();
  const [count, setCount] = useState(6);
  const [picked, setPicked] = useState<string | null>(null);

  // A small copy of the image for sampling; the swatches come from the same pixels.
  const sample = useMemo(() => {
    if (!loaded) return null;
    const { img } = loaded;
    const scale = Math.min(1, 320 / img.naturalWidth);
    const c = document.createElement("canvas");
    c.width = Math.max(1, Math.round(img.naturalWidth * scale));
    c.height = Math.max(1, Math.round(img.naturalHeight * scale));
    const ctx = c.getContext("2d", { willReadFrequently: true })!;
    ctx.drawImage(img, 0, 0, c.width, c.height);
    return { canvas: c, data: ctx.getImageData(0, 0, c.width, c.height) };
  }, [loaded]);
  const swatches = useMemo(() => (sample ? dominantColors(sample.data, count) : []), [sample, count]);

  if (!loaded) return <div className="space-y-3">{error ? <ErrorNote>{error}</ErrorNote> : null}<FileDrop accept={IMAGE_ACCEPT} onFiles={load} title="Drop an image to get its colors" /></div>;

  function pick(e: ReactMouseEvent<HTMLImageElement>) {
    const c = sample?.canvas;
    if (!c) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = Math.floor(((e.clientX - r.left) / r.width) * c.width);
    const y = Math.floor(((e.clientY - r.top) / r.height) * c.height);
    const [R, G, B] = c.getContext("2d")!.getImageData(x, y, 1, 1).data;
    setPicked("#" + [R, G, B].map((v) => v.toString(16).padStart(2, "0")).join(""));
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
      <Panel>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={loaded.img.src} alt="Click anywhere to pick a color" onClick={pick} className="mx-auto max-h-[460px] w-auto max-w-full cursor-crosshair rounded-2xl border border-line" />
        <p className="mt-3 text-center text-[13px] text-muted">Click anywhere on the image to pick that exact color.</p>
      </Panel>
      <Panel className="space-y-4">
        {picked ? (
          <div className="flex items-center gap-3 rounded-2xl border border-line p-3">
            <span className="h-10 w-10 rounded-xl border border-line" style={{ background: picked }} />
            <span className="flex-1">
              <span className="block text-[12px] text-muted">Picked color</span>
              <code className="font-mono text-[15px] text-ink uppercase">{picked}</code>
            </span>
            <CopyButton value={picked} label="Copy picked color" />
          </div>
        ) : null}
        <Slider label="Main colors" value={count} onChange={setCount} min={3} max={10} />
        <ul className="space-y-2">
          {swatches.map((s) => (
            <li key={s.hex} className="flex items-center gap-3">
              <span className="h-9 w-9 shrink-0 rounded-lg border border-line" style={{ background: s.hex }} />
              <code className="flex-1 font-mono text-[14px] text-ink uppercase">{s.hex}</code>
              <span className="num text-[12.5px] text-muted">{Math.round(s.share * 100)}%</span>
              <CopyButton value={s.hex} label={`Copy ${s.hex}`} />
            </li>
          ))}
        </ul>
        <CopyButton value={swatches.map((s) => s.hex).join(", ")} label="Copy all colors" showLabel />
        <StartOver onClick={reset} />
      </Panel>
    </div>
  );
}

/* ——— Image to Base64 ——— */

type B64Out = "uri" | "raw" | "css" | "html";

export function ImageToBase64() {
  const [file, setFile] = useState<File | null>(null);
  const [dataUrl, setDataUrl] = useState("");
  const [format, setFormat] = useState<B64Out>("uri");

  function load(files: File[]) {
    const f = files[0];
    const reader = new FileReader();
    reader.onload = () => {
      setFile(f);
      setDataUrl(String(reader.result));
    };
    reader.readAsDataURL(f);
  }

  if (!file) return <FileDrop accept={IMAGE_ACCEPT + ",image/svg+xml,image/x-icon"} onFiles={load} title="Drop an image to convert to Base64" />;

  const raw = dataUrl.split(",")[1] ?? "";
  const out = format === "uri" ? dataUrl : format === "raw" ? raw : format === "css" ? `background-image: url("${dataUrl}");` : `<img src="${dataUrl}" alt="" />`;
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
      <Panel className="space-y-5">
        <FileMeta name={file.name} size={file.size} />
        <Preview src={dataUrl} alt="Your image" className="max-h-48" />
        <Choice label="Output" value={format} onChange={setFormat} options={[{ value: "uri", label: "Data URI" }, { value: "raw", label: "Base64 only" }, { value: "css", label: "CSS" }, { value: "html", label: "HTML <img>" }]} />
        {file.size > 100 * 1024 ? <p className="text-[13px] text-warning">Base64 is about a third bigger than the file. For images over ~100 KB a normal image file usually loads faster.</p> : null}
        <StartOver onClick={() => setFile(null)} />
      </Panel>
      <Panel>
        <OutputBox label={`Base64 · ${formatBytes(out.length)}`} value={out} rows={14} mono filename={`${baseName(file.name)}-base64.txt`} />
      </Panel>
    </div>
  );
}

/* ——— SVG to PNG ——— */

export function SvgToPng() {
  const [code, setCode] = useState("");
  const [name, setName] = useState("image");
  const [scale, setScale] = useState(2);
  const [transparent, setTransparent] = useState(true);
  const [err, setErr] = useState("");
  const [png, setPng] = useState<{ blob: Blob; url: string; w: number; h: number } | null>(null);

  useEffect(() => {
    if (!code.trim()) return;
    let cancelled = false;
    const t = window.setTimeout(async () => {
      try {
        const doc = new DOMParser().parseFromString(code, "image/svg+xml");
        const svg = doc.documentElement;
        if (svg.nodeName !== "svg" || doc.querySelector("parsererror")) throw new Error("That isn't valid SVG code.");
        const vb = svg.getAttribute("viewBox")?.split(/[\s,]+/).map(Number);
        const w = parseFloat(svg.getAttribute("width") ?? "") || vb?.[2] || 300;
        const h = parseFloat(svg.getAttribute("height") ?? "") || vb?.[3] || 150;
        svg.setAttribute("width", String(w));
        svg.setAttribute("height", String(h));
        const blob = new Blob([new XMLSerializer().serializeToString(svg)], { type: "image/svg+xml" });
        const img = await readImage(new File([blob], "x.svg", { type: "image/svg+xml" }));
        const c = draw(img, w * scale, h * scale, transparent ? "image/png" : "image/jpeg");
        const out = await canvasToBlob(c, "image/png");
        if (cancelled) return;
        setErr("");
        setPng((prev) => {
          if (prev) URL.revokeObjectURL(prev.url);
          return { blob: out, url: URL.createObjectURL(out), w: c.width, h: c.height };
        });
      } catch (e) {
        if (!cancelled) setErr(e instanceof Error ? e.message : "That SVG couldn't be drawn.");
      }
    }, 200);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [code, scale, transparent]);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Panel className="space-y-4">
        <FileDrop
          compact
          accept="image/svg+xml,.svg"
          title="Drop an SVG file"
          hint="…or paste SVG code below."
          onFiles={async (files) => {
            setName(baseName(files[0].name));
            setCode(await files[0].text());
          }}
        />
        <TextField label="SVG code" value={code} onChange={setCode} rows={8} mono placeholder={'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">…</svg>'} />
        <Choice label="Size" value={String(scale)} onChange={(v) => setScale(Number(v))} options={[1, 2, 3, 4].map((n) => ({ value: String(n), label: `${n}×` }))} />
        <Toggle label="Transparent background" checked={transparent} onChange={setTransparent} />
      </Panel>
      <Panel className="space-y-4">
        {code.trim() && err ? <ErrorNote>{err}</ErrorNote> : null}
        {code.trim() && png && !err ? (
          <>
            <Preview src={png.url} alt="PNG preview" />
            <p className="text-[14px] text-muted">
              PNG size: <span className="num font-medium text-ink">{png.w} × {png.h}</span> px · {formatBytes(png.blob.size)}
            </p>
            <DownloadButton onClick={() => saveBlob(png.blob, `${name}.png`)}>Download PNG</DownloadButton>
          </>
        ) : (
          <p className="text-[14px] text-muted">Your PNG preview will appear here.</p>
        )}
        <p className="text-[12.5px] text-muted">SVGs that load external fonts or images may not draw exactly the same.</p>
      </Panel>
    </div>
  );
}
