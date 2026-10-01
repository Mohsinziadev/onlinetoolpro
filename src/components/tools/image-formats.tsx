"use client";

/**
 * One-job format converters (PNG to JPG, WebP to JPG, JPG to PNG, HEIC to JPG).
 * They take many files at once and download one image or a ZIP. Everything is
 * converted in the browser; HEIC decoding loads only when a HEIC file is added.
 */
import { useState } from "react";
import { CheckCircle2, Download, ImageIcon, Loader2, RotateCcw, X } from "lucide-react";
import { DownloadButton, ErrorNote, FileDrop, Panel, Slider, baseName, canvasToBlob, saveBlob } from "@/components/kit";
import { makeZip } from "@/lib/zip";
import { formatBytes } from "@/lib/utils";

type Target = "image/jpeg" | "image/png";
const EXT: Record<Target, string> = { "image/jpeg": "jpg", "image/png": "png" };

type Item = { id: number; file: File; status: "waiting" | "working" | "done" | "error"; out?: Blob; error?: string };
let nextId = 0;

/** Decode an ordinary image file and re-encode it. JPG gets a white background (no transparency). */
async function convertImage(file: File, to: Target, quality: number): Promise<Blob> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = "async";
    img.src = url;
    await img.decode();
    const c = document.createElement("canvas");
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    const ctx = c.getContext("2d")!;
    if (to === "image/jpeg") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, c.width, c.height);
    }
    ctx.drawImage(img, 0, 0);
    return await canvasToBlob(c, to, quality);
  } catch {
    throw new Error("This file couldn't be opened as an image.");
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** HEIC/HEIF (iPhone photos) → JPG/PNG with heic2any, loaded on first use. */
async function convertHeic(file: File, to: Target, quality: number): Promise<Blob> {
  const { default: heic2any } = await import("heic2any");
  try {
    const out = await heic2any({ blob: file, toType: to, quality });
    return Array.isArray(out) ? out[0] : out;
  } catch {
    throw new Error("This HEIC file couldn't be decoded. It may be damaged, or use a variant that isn't supported.");
  }
}

function FormatConverter({ from, accept, to, heic = false, hint }: { from: string; accept: string; to: Target; heic?: boolean; hint: string }) {
  const [items, setItems] = useState<Item[]>([]);
  const [quality, setQuality] = useState(92);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
  const ext = EXT[to];
  const target = ext.toUpperCase();

  function add(files: File[]) {
    setError("");
    setItems((xs) => [...xs, ...files.map((file) => ({ id: ++nextId, file, status: "waiting" as const }))]);
  }

  async function convertAll() {
    setRunning(true);
    setError("");
    const results: Item[] = [];
    for (const it of items) {
      if (it.status === "done") {
        results.push(it);
        continue;
      }
      setItems((xs) => xs.map((x) => (x.id === it.id ? { ...x, status: "working" } : x)));
      try {
        const out = await (heic ? convertHeic : convertImage)(it.file, to, quality / 100);
        const done = { ...it, status: "done" as const, out };
        results.push(done);
        setItems((xs) => xs.map((x) => (x.id === it.id ? done : x)));
      } catch (e) {
        const failed = { ...it, status: "error" as const, error: e instanceof Error ? e.message : "Couldn't convert this file." };
        results.push(failed);
        setItems((xs) => xs.map((x) => (x.id === it.id ? failed : x)));
      }
    }
    setRunning(false);
    const done = results.filter((r) => r.out);
    if (!done.length) return setError("None of the files could be converted.");
    if (done.length === 1) return saveBlob(done[0].out!, `${baseName(done[0].file.name)}.${ext}`);
    saveBlob(await makeZip(done.map((d) => ({ name: `${baseName(d.file.name)}.${ext}`, data: d.out! }))), `converted-${ext}.zip`);
  }

  const doneCount = items.filter((x) => x.status === "done").length;

  return (
    <div className="space-y-4">
      <FileDrop accept={accept} multiple onFiles={add} title={items.length ? `Add more ${from} files` : `Drop ${from} files to convert to ${target}`} hint={hint} compact={items.length > 0} />
      {items.length ? (
        <Panel title={`${items.length} file${items.length === 1 ? "" : "s"}`} className="space-y-4">
          <ul className="space-y-2">
            {items.map((it) => (
              <li key={it.id} className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-3">
                <ImageIcon aria-hidden className="h-5 w-5 shrink-0 text-accent" strokeWidth={1.7} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14.5px] font-medium text-ink">{it.file.name}</span>
                  <span className="block text-[12.5px] text-muted">
                    {formatBytes(it.file.size)}
                    {it.out ? ` → ${formatBytes(it.out.size)} ${target}` : ""}
                    {it.error ? <span className="text-danger"> · {it.error}</span> : null}
                  </span>
                </span>
                {it.status === "working" ? <Loader2 aria-label="Converting" className="h-4 w-4 animate-spin text-muted" /> : null}
                {it.status === "done" && it.out ? (
                  <button type="button" onClick={() => saveBlob(it.out!, `${baseName(it.file.name)}.${ext}`)} aria-label={`Download ${baseName(it.file.name)}.${ext}`} className="rounded-full p-1.5 text-accent hover:bg-accent-soft">
                    <Download className="h-4 w-4" />
                  </button>
                ) : null}
                {it.status === "done" ? <CheckCircle2 aria-hidden className="h-4 w-4 text-success" /> : null}
                <button type="button" onClick={() => setItems((xs) => xs.filter((x) => x.id !== it.id))} disabled={running} aria-label={`Remove ${it.file.name}`} className="rounded-full p-1.5 text-muted hover:bg-bg-subtle hover:text-ink disabled:opacity-30">
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
          {to === "image/jpeg" ? <Slider label="JPG quality" value={quality} onChange={setQuality} min={50} max={100} unit="%" /> : <p className="text-[13px] text-muted">PNG is lossless, so the picture is kept exactly — the file is usually larger than the JPG.</p>}
          {error ? <ErrorNote>{error}</ErrorNote> : null}
          <div className="flex flex-wrap items-center gap-3">
            <DownloadButton onClick={convertAll} disabled={running}>
              {items.length > 1 ? `Convert and download ${items.length} files (ZIP)` : `Convert to ${target}`}
            </DownloadButton>
            {running ? (
              <span className="flex items-center gap-2 text-[14px] text-muted" role="status">
                <Loader2 aria-hidden className="h-4 w-4 animate-spin" /> Converting{heic ? " (HEIC takes a few seconds per photo)" : ""}…
              </span>
            ) : doneCount ? (
              <span className="text-[13.5px] text-muted">{doneCount} converted</span>
            ) : null}
            <button type="button" className="chip" onClick={() => setItems([])} disabled={running}>
              <RotateCcw aria-hidden className="h-3.5 w-3.5" /> Clear
            </button>
          </div>
        </Panel>
      ) : null}
    </div>
  );
}

export const PngToJpg = () => <FormatConverter from="PNG" accept="image/png,.png" to="image/jpeg" hint="Transparent areas become white. Files stay on your device." />;
export const WebpToJpg = () => <FormatConverter from="WebP" accept="image/webp,.webp" to="image/jpeg" hint="Works with animated WebP too (first frame). Files stay on your device." />;
export const JpgToPng = () => <FormatConverter from="JPG" accept="image/jpeg,.jpg,.jpeg" to="image/png" hint="Files stay on your device." />;
export const HeicToJpg = () => <FormatConverter from="HEIC" accept="image/heic,image/heif,.heic,.heif" to="image/jpeg" heic hint="iPhone and iPad photos (.heic / .heif). Converted on your device — never uploaded." />;
