"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, FileText, Loader2, X } from "lucide-react";
import { Choice, DownloadButton, ErrorNote, FieldLabel, FileDrop, Panel, Slider, baseName, canvasToBlob, readImage, saveBlob } from "@/components/kit";
import { formatBytes } from "@/lib/utils";

/** pdf-lib is loaded only when a PDF tool is actually used. */
const loadPdfLib = () => import("pdf-lib");

type PdfItem = { id: string; file: File; pages: number | null; error?: string };
const uid = () => Math.random().toString(36).slice(2);

async function countPages(file: File): Promise<number> {
  const { PDFDocument } = await loadPdfLib();
  const doc = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
  return doc.getPageCount();
}

function friendlyPdfError(e: unknown): string {
  const msg = e instanceof Error ? e.message : "";
  if (/encrypt/i.test(msg)) return "This PDF is password-protected. Remove the password first, then try again.";
  return "This file couldn't be read as a PDF.";
}

function FileList({ items, setItems, unit = "pages" }: { items: PdfItem[]; setItems: (fn: (xs: PdfItem[]) => PdfItem[]) => void; unit?: string }) {
  const move = (i: number, d: number) =>
    setItems((xs) => {
      const a = [...xs];
      const j = i + d;
      if (j < 0 || j >= a.length) return a;
      [a[i], a[j]] = [a[j], a[i]];
      return a;
    });
  return (
    <ol className="space-y-2">
      {items.map((it, i) => (
        <li key={it.id} className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-3">
          <span className="num flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-bg-subtle text-[12.5px] font-medium text-ink-2">{i + 1}</span>
          <FileText aria-hidden className="h-5 w-5 shrink-0 text-accent" strokeWidth={1.7} />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[14.5px] font-medium text-ink">{it.file.name}</span>
            <span className="block text-[12.5px] text-muted">
              {it.error ? <span className="text-danger">{it.error}</span> : <>{formatBytes(it.file.size)}{it.pages !== null ? ` · ${it.pages} ${unit}` : ""}</>}
            </span>
          </span>
          <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move ${it.file.name} up`} className="rounded-full p-1.5 text-muted hover:bg-bg-subtle hover:text-ink disabled:opacity-30">
            <ArrowUp className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label={`Move ${it.file.name} down`} className="rounded-full p-1.5 text-muted hover:bg-bg-subtle hover:text-ink disabled:opacity-30">
            <ArrowDown className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => setItems((xs) => xs.filter((x) => x.id !== it.id))} aria-label={`Remove ${it.file.name}`} className="rounded-full p-1.5 text-muted hover:bg-bg-subtle hover:text-ink">
            <X className="h-4 w-4" />
          </button>
        </li>
      ))}
    </ol>
  );
}

function Busy({ children }: { children: string }) {
  return (
    <p className="flex items-center gap-2 text-[14px] text-muted">
      <Loader2 aria-hidden className="h-4 w-4 animate-spin" /> {children}
    </p>
  );
}

/* ——— Merge ——— */

export function PdfMerger() {
  const [items, setItems] = useState<PdfItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function add(files: File[]) {
    const added = files.map((file) => ({ id: uid(), file, pages: null as number | null }));
    setItems((xs) => [...xs, ...added]);
    for (const a of added) {
      try {
        const pages = await countPages(a.file);
        setItems((xs) => xs.map((x) => (x.id === a.id ? { ...x, pages } : x)));
      } catch (e) {
        setItems((xs) => xs.map((x) => (x.id === a.id ? { ...x, error: friendlyPdfError(e) } : x)));
      }
    }
  }

  async function merge() {
    setBusy(true);
    setError("");
    try {
      const { PDFDocument } = await loadPdfLib();
      const out = await PDFDocument.create();
      for (const it of items.filter((x) => !x.error)) {
        const src = await PDFDocument.load(await it.file.arrayBuffer(), { ignoreEncryption: true });
        const pages = await out.copyPages(src, src.getPageIndices());
        pages.forEach((p) => out.addPage(p));
      }
      const bytes = await out.save();
      saveBlob(new Blob([bytes as BlobPart], { type: "application/pdf" }), "merged.pdf");
    } catch (e) {
      setError(friendlyPdfError(e));
    } finally {
      setBusy(false);
    }
  }

  const usable = items.filter((x) => !x.error);
  const total = usable.reduce((n, x) => n + (x.pages ?? 0), 0);
  return (
    <div className="space-y-4">
      <FileDrop accept="application/pdf,.pdf" multiple onFiles={add} title={items.length ? "Add more PDFs" : "Drop the PDFs you want to combine"} compact={items.length > 0} />
      {items.length ? (
        <Panel title={`${usable.length} file${usable.length === 1 ? "" : "s"} · ${total} pages`} className="space-y-4">
          <FileList items={items} setItems={setItems} />
          {error ? <ErrorNote>{error}</ErrorNote> : null}
          <div className="flex flex-wrap items-center gap-3">
            <DownloadButton onClick={merge} disabled={busy || usable.length < 2}>
              Merge and download
            </DownloadButton>
            {busy ? <Busy>Combining your files…</Busy> : usable.length < 2 ? <span className="text-[13.5px] text-muted">Add at least two PDFs.</span> : null}
          </div>
        </Panel>
      ) : null}
    </div>
  );
}

/* ——— Split ——— */

/** "1-3, 5, 8-" → zero-based page indexes, in order, without duplicates. */
function parseRanges(input: string, max: number): number[] | string {
  const out: number[] = [];
  for (const part of input.split(",").map((p) => p.trim()).filter(Boolean)) {
    const m = /^(\d+)?\s*(-)?\s*(\d+)?$/.exec(part);
    if (!m || (!m[1] && !m[3])) return `“${part}” isn't a page or range.`;
    const a = m[1] ? Number(m[1]) : 1;
    const b = m[2] ? (m[3] ? Number(m[3]) : max) : a;
    if (a < 1 || b > max || a > b) return `“${part}” is outside pages 1–${max}.`;
    for (let i = a; i <= b; i++) if (!out.includes(i - 1)) out.push(i - 1);
  }
  return out.length ? out : "Enter at least one page.";
}

export function PdfSplitter() {
  const [item, setItem] = useState<{ file: File; pages: number } | null>(null);
  const [mode, setMode] = useState<"pick" | "each">("pick");
  const [ranges, setRanges] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function load(files: File[]) {
    setError("");
    try {
      const pages = await countPages(files[0]);
      setItem({ file: files[0], pages });
      setRanges(`1-${Math.min(pages, 3)}`);
    } catch (e) {
      setError(friendlyPdfError(e));
    }
  }

  const parsed = item ? parseRanges(ranges, item.pages) : [];

  async function run() {
    if (!item) return;
    setBusy(true);
    setError("");
    try {
      const { PDFDocument } = await loadPdfLib();
      const src = await PDFDocument.load(await item.file.arrayBuffer(), { ignoreEncryption: true });
      const name = baseName(item.file.name);
      const groups = mode === "each" ? src.getPageIndices().map((i) => [i]) : [parsed as number[]];
      for (const [k, idx] of groups.entries()) {
        const out = await PDFDocument.create();
        (await out.copyPages(src, idx)).forEach((p) => out.addPage(p));
        const bytes = await out.save();
        saveBlob(new Blob([bytes as BlobPart], { type: "application/pdf" }), mode === "each" ? `${name}-page-${k + 1}.pdf` : `${name}-pages.pdf`);
        // Give the browser a moment between downloads.
        if (groups.length > 1) await new Promise((r) => setTimeout(r, 350));
      }
    } catch (e) {
      setError(friendlyPdfError(e));
    } finally {
      setBusy(false);
    }
  }

  if (!item) return <div className="space-y-3">{error ? <ErrorNote>{error}</ErrorNote> : null}<FileDrop accept="application/pdf,.pdf" onFiles={load} title="Drop the PDF you want to split" /></div>;

  return (
    <Panel className="space-y-5">
      <p className="text-[14px] text-muted">
        <span className="font-medium text-ink">{item.file.name}</span> · {item.pages} pages · {formatBytes(item.file.size)}
      </p>
      <Choice label="What do you want?" value={mode} onChange={setMode} options={[{ value: "pick", label: "Pick pages into one PDF" }, { value: "each", label: "Every page as its own PDF" }]} />
      {mode === "pick" ? (
        <div>
          <FieldLabel htmlFor="ranges" hint="Example: 1-3, 5, 8-">
            Pages to keep
          </FieldLabel>
          <input id="ranges" value={ranges} onChange={(e) => setRanges(e.target.value)} className="h-11 w-full rounded-xl border border-line bg-surface-2 px-3.5 font-mono text-[15px] text-ink outline-none focus:border-accent/50 focus:ring-4 focus:ring-accent/10" />
          {typeof parsed === "string" ? <p className="mt-1.5 text-[13px] text-danger">{parsed}</p> : <p className="mt-1.5 text-[13px] text-muted">{parsed.length} page{parsed.length === 1 ? "" : "s"} selected</p>}
        </div>
      ) : item.pages > 20 ? (
        <p className="text-[13.5px] text-warning">This creates {item.pages} separate downloads. Your browser may ask you to allow multiple downloads.</p>
      ) : null}
      {error ? <ErrorNote>{error}</ErrorNote> : null}
      <div className="flex flex-wrap items-center gap-3">
        <DownloadButton onClick={run} disabled={busy || (mode === "pick" && typeof parsed === "string")}>
          {mode === "pick" ? "Download selected pages" : `Download ${item.pages} PDFs`}
        </DownloadButton>
        {busy ? <Busy>Working…</Busy> : null}
        <button type="button" onClick={() => setItem(null)} className="chip">
          Use another PDF
        </button>
      </div>
    </Panel>
  );
}

/* ——— Images to PDF ——— */

const PAGE_SIZES = { fit: null, a4: [595.28, 841.89], letter: [612, 792] } as const;

export function ImagesToPdf() {
  const [items, setItems] = useState<PdfItem[]>([]);
  const [size, setSize] = useState<keyof typeof PAGE_SIZES>("a4");
  const [margin, setMargin] = useState(24);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function build() {
    setBusy(true);
    setError("");
    try {
      const { PDFDocument } = await loadPdfLib();
      const doc = await PDFDocument.create();
      for (const it of items) {
        let bytes: ArrayBuffer;
        let kind: "jpg" | "png";
        if (it.file.type === "image/jpeg") {
          bytes = await it.file.arrayBuffer();
          kind = "jpg";
        } else if (it.file.type === "image/png") {
          bytes = await it.file.arrayBuffer();
          kind = "png";
        } else {
          // WebP, GIF etc. → PNG via canvas
          const img = await readImage(it.file);
          const c = document.createElement("canvas");
          c.width = img.naturalWidth;
          c.height = img.naturalHeight;
          c.getContext("2d")!.drawImage(img, 0, 0);
          bytes = await (await canvasToBlob(c, "image/png")).arrayBuffer();
          kind = "png";
        }
        const image = kind === "jpg" ? await doc.embedJpg(bytes) : await doc.embedPng(bytes);
        const fixed = PAGE_SIZES[size];
        const landscape = image.width > image.height;
        const [pw, ph] = fixed ? (landscape ? [fixed[1], fixed[0]] : [fixed[0], fixed[1]]) : [image.width + margin * 2, image.height + margin * 2];
        const page = doc.addPage([pw, ph]);
        const scale = Math.min((pw - margin * 2) / image.width, (ph - margin * 2) / image.height, fixed ? Infinity : 1);
        const w = image.width * scale;
        const h = image.height * scale;
        page.drawImage(image, { x: (pw - w) / 2, y: (ph - h) / 2, width: w, height: h });
      }
      const out = await doc.save();
      saveBlob(new Blob([out as BlobPart], { type: "application/pdf" }), "images.pdf");
    } catch {
      setError("One of the images couldn't be added. Try saving it as JPG or PNG first.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <FileDrop
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        onFiles={(files) => setItems((xs) => [...xs, ...files.map((file) => ({ id: uid(), file, pages: null }))])}
        title={items.length ? "Add more images" : "Drop the images for your PDF"}
        compact={items.length > 0}
      />
      {items.length ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <Panel title={`${items.length} image${items.length === 1 ? "" : "s"} · one per page`}>
            <FileList items={items} setItems={setItems} />
          </Panel>
          <Panel className="space-y-5">
            <Choice label="Page size" value={size} onChange={setSize} options={[{ value: "a4", label: "A4" }, { value: "letter", label: "US Letter" }, { value: "fit", label: "Same as image" }]} />
            <Slider label="Margin" value={margin} onChange={setMargin} min={0} max={72} unit=" pt" />
            {error ? <ErrorNote>{error}</ErrorNote> : null}
            <DownloadButton onClick={build} disabled={busy}>
              Create PDF
            </DownloadButton>
            {busy ? <Busy>Building your PDF…</Busy> : null}
          </Panel>
        </div>
      ) : null}
    </div>
  );
}
