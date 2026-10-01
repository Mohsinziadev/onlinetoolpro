"use client";

/**
 * PDF tools that work page by page: PDF to JPG, rotate, page numbers, watermark
 * and sign. pdf.js draws the previews; pdf-lib writes the new file. Both load
 * only when a file is added. Nothing is uploaded.
 */
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Caveat } from "next/font/google";
import { Download, Loader2, RotateCcw, RotateCw, X } from "lucide-react";
import { Choice, ColorField, DownloadButton, ErrorNote, FieldLabel, FileDrop, FileMeta, Panel, Slider, Toggle, baseName, canvasToBlob, saveBlob } from "@/components/kit";
import { closePdf, openPdf, renderPage, type PdfDoc } from "@/lib/pdf/pdfjs";
import { parseRanges } from "@/lib/pdf/ranges";
import { makeZip } from "@/lib/zip";
import { cn } from "@/lib/utils";

const signatureFont = Caveat({ subsets: ["latin"], weight: ["600"], display: "swap" });

const loadPdfLib = () => import("pdf-lib");
const PDF_ACCEPT = "application/pdf,.pdf";
const inputClass =
  "h-11 w-full rounded-xl border border-line bg-surface-2 px-3.5 text-[15px] text-ink outline-none transition-[border-color,box-shadow] placeholder:text-faint focus:border-accent/50 focus:ring-4 focus:ring-accent/10";

type Loaded = { file: File; doc: PdfDoc; pages: number; key: number };
let loadCount = 0;

/** One PDF at a time: opened with pdf.js for previews, read again by pdf-lib when saving. */
function usePdfFile() {
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [error, setError] = useState("");
  const [opening, setOpening] = useState(false);
  async function load(files: File[]) {
    setError("");
    setOpening(true);
    try {
      const doc = await openPdf(files[0]);
      setLoaded((prev) => {
        closePdf(prev?.doc);
        return { file: files[0], doc, pages: doc.numPages, key: ++loadCount };
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "This file couldn't be read as a PDF.");
    } finally {
      setOpening(false);
    }
  }
  function reset() {
    closePdf(loaded?.doc);
    setLoaded(null);
  }
  return { loaded, error, opening, load, reset };
}

function Busy({ children }: { children: string }) {
  return (
    <p className="flex items-center gap-2 text-[14px] text-muted" role="status">
      <Loader2 aria-hidden className="h-4 w-4 animate-spin" /> {children}
    </p>
  );
}

function Start({ title, loaded, error, opening, load }: { title: string; loaded: Loaded | null; error: string; opening: boolean; load: (f: File[]) => void }) {
  if (loaded) return null;
  return (
    <div className="space-y-3">
      {error ? <ErrorNote>{error}</ErrorNote> : null}
      <FileDrop accept={PDF_ACCEPT} onFiles={load} title={title} hint="The PDF is opened in your browser — it's never uploaded." />
      {opening ? <Busy>Opening the PDF…</Busy> : null}
    </div>
  );
}

function StartOver({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="chip">
      <RotateCcw aria-hidden className="h-3.5 w-3.5" /> Use another PDF
    </button>
  );
}

const MAX_THUMBS = 300;

/** Small page previews, drawn one by one so the first ones appear quickly. */
function useThumbs(doc: PdfDoc, pages: number, width = 180) {
  const [thumbs, setThumbs] = useState<string[]>([]);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const out: string[] = [];
      for (let i = 1; i <= Math.min(pages, MAX_THUMBS); i++) {
        if (cancelled) return;
        try {
          const c = await renderPage(doc, i, { width });
          out.push(c.toDataURL("image/jpeg", 0.8));
        } catch {
          out.push("");
        }
        if (!cancelled) setThumbs([...out]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [doc, pages, width]);
  return thumbs;
}

function Thumb({ src, label, rotate = 0, children, onClick, selected }: { src?: string; label: string; rotate?: number; children?: React.ReactNode; onClick?: () => void; selected?: boolean }) {
  const inner = (
    <>
      <span className="flex aspect-[3/4] w-full items-center justify-center overflow-hidden rounded-xl border border-line bg-surface-2">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt="" className="max-h-full max-w-full object-contain shadow-card transition-transform duration-200" style={{ transform: `rotate(${rotate}deg)${rotate % 180 ? " scale(0.75)" : ""}` }} />
        ) : (
          <Loader2 aria-hidden className="h-4 w-4 animate-spin text-faint" />
        )}
      </span>
      <span className="mt-1.5 block text-center text-[12.5px] text-muted">{label}</span>
    </>
  );
  return (
    <li className="relative">
      {onClick ? (
        <button type="button" onClick={onClick} aria-pressed={selected} aria-label={label} className={cn("block w-full rounded-2xl p-1.5 transition-colors", selected ? "bg-accent-soft ring-2 ring-accent" : "hover:bg-bg-subtle")}>
          {inner}
        </button>
      ) : (
        <div className="p-1.5">{inner}</div>
      )}
      {children}
    </li>
  );
}

function ThumbGrid({ children }: { children: React.ReactNode }) {
  return <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">{children}</ul>;
}

/* ——— Placing things on a page, whatever its rotation ——— */

type PdfLibPage = import("pdf-lib").PDFPage;

/**
 * Pages can be saved with a rotation (/Rotate). People think in the page as they
 * see it, so positions are given in "visual" coordinates (origin bottom-left of
 * the page as displayed) and mapped back to the page's own coordinates here.
 */
function visualFrame(page: PdfLibPage) {
  const r = ((page.getRotation().angle % 360) + 360) % 360;
  const { width: w, height: h } = page.getSize();
  const sideways = r === 90 || r === 270;
  return {
    r,
    width: sideways ? h : w,
    height: sideways ? w : h,
    /** Visual point → page point. */
    at(vx: number, vy: number): { x: number; y: number } {
      if (r === 90) return { x: w - vy, y: vx };
      if (r === 180) return { x: w - vx, y: h - vy };
      if (r === 270) return { x: vy, y: h - vx };
      return { x: vx, y: vy };
    },
  };
}

function hexToRgb01(hex: string) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  const n = m ? parseInt(m[1], 16) : 0;
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255] as const;
}

function friendlySaveError(e: unknown): string {
  const msg = e instanceof Error ? e.message : "";
  if (/encrypt/i.test(msg)) return "This PDF is password-protected. Remove the password first, then try again.";
  if (/WinAnsi|cannot encode/i.test(msg)) return "The built-in PDF font supports Latin letters only (A–Z, accents, common symbols). Remove other characters and try again.";
  return "Something went wrong while creating the PDF. Try again, or try another file.";
}

async function savePdf(bytes: Uint8Array, name: string) {
  saveBlob(new Blob([bytes as BlobPart], { type: "application/pdf" }), name);
}

/* ——— PDF to JPG ——— */

export function PdfToJpg() {
  const { loaded, error, opening, load, reset } = usePdfFile();
  return (
    <div className="space-y-4">
      <Start title="Drop a PDF to turn into images" loaded={loaded} error={error} opening={opening} load={load} />
      {loaded ? <PdfToJpgWorkspace key={loaded.key} loaded={loaded} reset={reset} /> : null}
    </div>
  );
}

function PdfToJpgWorkspace({ loaded, reset }: { loaded: Loaded; reset: () => void }) {
  const thumbs = useThumbs(loaded.doc, loaded.pages);
  const [fmt, setFmt] = useState<"image/jpeg" | "image/png">("image/jpeg");
  const [dpi, setDpi] = useState<"72" | "150" | "300">("150");
  const [quality, setQuality] = useState(90);
  const [which, setWhich] = useState<"all" | "some">("all");
  const [ranges, setRanges] = useState(`1-${Math.min(loaded.pages, 3)}`);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const ext = fmt === "image/png" ? "png" : "jpg";
  const name = baseName(loaded.file.name);
  const picked = which === "all" ? Array.from({ length: loaded.pages }, (_, i) => i) : parseRanges(ranges, loaded.pages);

  async function pageBlob(i: number) {
    const c = await renderPage(loaded.doc, i + 1, { scale: Number(dpi) / 72, maxSide: 8000 });
    return canvasToBlob(c, fmt, quality / 100);
  }

  async function downloadOne(i: number) {
    setError("");
    setBusy(`Rendering page ${i + 1}…`);
    try {
      saveBlob(await pageBlob(i), `${name}-page-${i + 1}.${ext}`);
    } catch {
      setError("That page couldn't be rendered.");
    } finally {
      setBusy("");
    }
  }

  async function downloadAll() {
    if (typeof picked === "string") return;
    setError("");
    try {
      if (picked.length === 1) return void (await downloadOne(picked[0]));
      const files: { name: string; data: Blob }[] = [];
      for (const [n, i] of picked.entries()) {
        setBusy(`Rendering page ${n + 1} of ${picked.length}…`);
        files.push({ name: `${name}-page-${i + 1}.${ext}`, data: await pageBlob(i) });
      }
      setBusy("Creating the ZIP file…");
      saveBlob(await makeZip(files), `${name}-${ext}.zip`);
    } catch {
      setError("Some pages couldn't be rendered. Try a lower resolution.");
    } finally {
      setBusy("");
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
      <Panel className="space-y-5 self-start">
        <FileMeta name={loaded.file.name} size={loaded.file.size} extra={`${loaded.pages} page${loaded.pages === 1 ? "" : "s"}`} />
        <Choice label="Image format" value={fmt} onChange={setFmt} options={[{ value: "image/jpeg", label: "JPG" }, { value: "image/png", label: "PNG" }]} />
        <Choice label="Resolution" value={dpi} onChange={setDpi} options={[{ value: "72", label: "Screen (72 dpi)" }, { value: "150", label: "Standard (150 dpi)" }, { value: "300", label: "Print (300 dpi)" }]} />
        {fmt === "image/jpeg" ? <Slider label="Quality" value={quality} onChange={setQuality} min={40} max={100} unit="%" /> : null}
        <Choice label="Pages" value={which} onChange={setWhich} options={[{ value: "all", label: "All pages" }, { value: "some", label: "Choose pages" }]} />
        {which === "some" ? (
          <div>
            <FieldLabel htmlFor="p2j-ranges" hint="e.g. 1-3, 5, 8-">
              Pages to convert
            </FieldLabel>
            <input id="p2j-ranges" value={ranges} onChange={(e) => setRanges(e.target.value)} className={inputClass} />
            {typeof picked === "string" ? <p className="mt-1.5 text-[12.5px] text-danger">{picked}</p> : null}
          </div>
        ) : null}
        {error ? <ErrorNote>{error}</ErrorNote> : null}
        <DownloadButton onClick={downloadAll} disabled={Boolean(busy) || typeof picked === "string"}>
          {typeof picked !== "string" && picked.length > 1 ? `Download ${picked.length} images (ZIP)` : `Download ${ext.toUpperCase()}`}
        </DownloadButton>
        {busy ? <Busy>{busy}</Busy> : null}
        <StartOver onClick={reset} />
      </Panel>
      <Panel title="Pages" actions={<span className="text-[12.5px] text-muted">Tap a page to download it alone</span>}>
        <ThumbGrid>
          {Array.from({ length: Math.min(loaded.pages, MAX_THUMBS) }, (_, i) => (
            <Thumb key={i} src={thumbs[i]} label={`Page ${i + 1}`} onClick={() => downloadOne(i)} />
          ))}
        </ThumbGrid>
        {loaded.pages > MAX_THUMBS ? <p className="mt-3 text-[13px] text-muted">Previews show the first {MAX_THUMBS} pages; all pages can still be converted.</p> : null}
      </Panel>
    </div>
  );
}

/* ——— Rotate ——— */

export function RotatePdf() {
  const { loaded, error, opening, load, reset } = usePdfFile();
  return (
    <div className="space-y-4">
      <Start title="Drop a PDF to rotate its pages" loaded={loaded} error={error} opening={opening} load={load} />
      {loaded ? <RotateWorkspace key={loaded.key} loaded={loaded} reset={reset} /> : null}
    </div>
  );
}

function RotateWorkspace({ loaded, reset }: { loaded: Loaded; reset: () => void }) {
  const thumbs = useThumbs(loaded.doc, loaded.pages);
  const [turns, setTurns] = useState<number[]>(() => Array(loaded.pages).fill(0));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const changed = turns.filter((t) => t % 360 !== 0).length;
  const turnAll = (d: number) => setTurns((ts) => ts.map((t) => t + d));
  const turnOne = (i: number, d: number) => setTurns((ts) => ts.map((t, k) => (k === i ? t + d : t)));

  async function save() {
    setBusy(true);
    setError("");
    try {
      const { PDFDocument, degrees } = await loadPdfLib();
      const doc = await PDFDocument.load(await loaded.file.arrayBuffer(), { ignoreEncryption: true });
      doc.getPages().forEach((p, i) => {
        const add = turns[i] ?? 0;
        if (add % 360) p.setRotation(degrees((((p.getRotation().angle + add) % 360) + 360) % 360));
      });
      await savePdf(await doc.save(), `${baseName(loaded.file.name)}-rotated.pdf`);
    } catch (e) {
      setError(friendlySaveError(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <Panel className="flex flex-wrap items-center gap-3">
        <FileMeta name={loaded.file.name} size={loaded.file.size} extra={`${loaded.pages} page${loaded.pages === 1 ? "" : "s"}`} />
        <div className="flex flex-wrap gap-2 sm:ml-auto">
          <button type="button" className="chip" onClick={() => turnAll(-90)}>
            <RotateCcw aria-hidden className="h-3.5 w-3.5" /> All left
          </button>
          <button type="button" className="chip" onClick={() => turnAll(90)}>
            <RotateCw aria-hidden className="h-3.5 w-3.5" /> All right
          </button>
          <button type="button" className="chip" onClick={() => setTurns(Array(loaded.pages).fill(0))} disabled={!changed}>
            Reset
          </button>
        </div>
      </Panel>
      <Panel>
        <ThumbGrid>
          {Array.from({ length: Math.min(loaded.pages, MAX_THUMBS) }, (_, i) => (
            <Thumb key={i} src={thumbs[i]} label={`Page ${i + 1}${turns[i] % 360 ? ` · ${(((turns[i] % 360) + 360) % 360)}°` : ""}`} rotate={turns[i]}>
              <div className="absolute top-3 right-3 flex gap-1">
                <button type="button" onClick={() => turnOne(i, -90)} aria-label={`Rotate page ${i + 1} left`} className="rounded-full border border-line bg-surface/90 p-1.5 text-ink-2 shadow-card hover:text-ink">
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
                <button type="button" onClick={() => turnOne(i, 90)} aria-label={`Rotate page ${i + 1} right`} className="rounded-full border border-line bg-surface/90 p-1.5 text-ink-2 shadow-card hover:text-ink">
                  <RotateCw className="h-3.5 w-3.5" />
                </button>
              </div>
            </Thumb>
          ))}
        </ThumbGrid>
        {loaded.pages > MAX_THUMBS ? <p className="mt-3 text-[13px] text-muted">Previews show the first {MAX_THUMBS} pages. “All left / All right” rotates every page.</p> : null}
      </Panel>
      {error ? <ErrorNote>{error}</ErrorNote> : null}
      <div className="flex flex-wrap items-center gap-3">
        <DownloadButton onClick={save} disabled={busy || !changed}>
          Download rotated PDF
        </DownloadButton>
        {busy ? <Busy>Saving…</Busy> : !changed ? <span className="text-[13.5px] text-muted">Rotate at least one page.</span> : <span className="text-[13.5px] text-muted">{changed} page{changed === 1 ? "" : "s"} rotated</span>}
        <StartOver onClick={reset} />
      </div>
    </div>
  );
}

/* ——— Page numbers ——— */

type Pos = "tl" | "tc" | "tr" | "bl" | "bc" | "br";
const POSITIONS: { value: Pos; label: string }[] = [
  { value: "tl", label: "Top left" },
  { value: "tc", label: "Top center" },
  { value: "tr", label: "Top right" },
  { value: "bl", label: "Bottom left" },
  { value: "bc", label: "Bottom center" },
  { value: "br", label: "Bottom right" },
];
type NumFormat = "n" | "page-n" | "page-n-of" | "n-of" | "dash";
const formatNumber = (f: NumFormat, n: number, total: number) =>
  f === "page-n" ? `Page ${n}` : f === "page-n-of" ? `Page ${n} of ${total}` : f === "n-of" ? `${n} / ${total}` : f === "dash" ? `- ${n} -` : String(n);

export function AddPageNumbers() {
  const { loaded, error, opening, load, reset } = usePdfFile();
  return (
    <div className="space-y-4">
      <Start title="Drop a PDF to number its pages" loaded={loaded} error={error} opening={opening} load={load} />
      {loaded ? <PageNumbersWorkspace key={loaded.key} loaded={loaded} reset={reset} /> : null}
    </div>
  );
}

function PageNumbersWorkspace({ loaded, reset }: { loaded: Loaded; reset: () => void }) {
  const [preview, setPreview] = useState("");
  const [pos, setPos] = useState<Pos>("bc");
  const [format, setFormat] = useState<NumFormat>("n");
  const [start, setStart] = useState("1");
  const [size, setSize] = useState(11);
  const [margin, setMargin] = useState(28);
  const [skipFirst, setSkipFirst] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const startN = Math.max(0, Math.floor(Number(start) || 0));
  const counted = skipFirst ? loaded.pages - 1 : loaded.pages;
  const sample = formatNumber(format, startN, startN + counted - 1);

  useEffect(() => {
    let off = false;
    renderPage(loaded.doc, skipFirst && loaded.pages > 1 ? 2 : 1, { width: 520 }).then((c) => !off && setPreview(c.toDataURL("image/jpeg", 0.85)), () => {});
    return () => {
      off = true;
    };
  }, [loaded.doc, loaded.pages, skipFirst]);

  async function save() {
    setBusy(true);
    setError("");
    try {
      const { PDFDocument, StandardFonts, degrees, rgb } = await loadPdfLib();
      const doc = await PDFDocument.load(await loaded.file.arrayBuffer(), { ignoreEncryption: true });
      const font = await doc.embedFont(StandardFonts.Helvetica);
      const pages = doc.getPages();
      const total = startN + counted - 1;
      pages.forEach((page, i) => {
        if (skipFirst && i === 0) return;
        const n = startN + (skipFirst ? i - 1 : i);
        const text = formatNumber(format, n, total);
        const f = visualFrame(page);
        const tw = font.widthOfTextAtSize(text, size);
        const vx = pos[1] === "l" ? margin : pos[1] === "r" ? f.width - margin - tw : (f.width - tw) / 2;
        const vy = pos[0] === "t" ? f.height - margin - size * 0.75 : margin;
        const { x, y } = f.at(vx, vy);
        page.drawText(text, { x, y, size, font, color: rgb(0.15, 0.15, 0.15), rotate: degrees(f.r) });
      });
      await savePdf(await doc.save(), `${baseName(loaded.file.name)}-numbered.pdf`);
    } catch (e) {
      setError(friendlySaveError(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[340px_minmax(0,1fr)]">
      <Panel className="space-y-5 self-start">
        <FileMeta name={loaded.file.name} size={loaded.file.size} extra={`${loaded.pages} pages`} />
        <div>
          <FieldLabel>Position</FieldLabel>
          <div className="grid grid-cols-3 gap-1.5" role="radiogroup" aria-label="Position">
            {POSITIONS.map((p) => (
              <button key={p.value} type="button" role="radio" aria-checked={pos === p.value} aria-label={p.label} onClick={() => setPos(p.value)} className={cn("flex h-10 items-center rounded-lg border px-2 text-[12px] transition-colors", p.value[1] === "l" ? "justify-start" : p.value[1] === "r" ? "justify-end" : "justify-center", p.value[0] === "t" ? "items-start pt-1" : "items-end pb-1", pos === p.value ? "border-accent bg-accent-soft text-ink" : "border-line text-muted hover:border-line-strong")}>
                <span className="num">{pos === p.value ? "1" : "·"}</span>
              </button>
            ))}
          </div>
        </div>
        <Choice label="Format" value={format} onChange={setFormat} options={[{ value: "n", label: "1" }, { value: "page-n", label: "Page 1" }, { value: "page-n-of", label: "Page 1 of N" }, { value: "n-of", label: "1 / N" }, { value: "dash", label: "- 1 -" }]} />
        <div>
          <FieldLabel htmlFor="pn-start">Start at</FieldLabel>
          <input id="pn-start" inputMode="numeric" value={start} onChange={(e) => setStart(e.target.value.replace(/\D/g, ""))} className={inputClass} />
        </div>
        <Slider label="Text size" value={size} onChange={setSize} min={7} max={24} unit=" pt" />
        <Slider label="Distance from edge" value={margin} onChange={setMargin} min={10} max={72} unit=" pt" />
        <Toggle label="Don't number the first page (cover)" checked={skipFirst} onChange={setSkipFirst} />
        {error ? <ErrorNote>{error}</ErrorNote> : null}
        <DownloadButton onClick={save} disabled={busy}>
          Download numbered PDF
        </DownloadButton>
        {busy ? <Busy>Adding page numbers…</Busy> : null}
        <StartOver onClick={reset} />
      </Panel>
      <Panel title="Preview" actions={<span className="text-[12.5px] text-muted">Approximate</span>}>
        <div className="relative mx-auto w-fit">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="First numbered page" className="max-h-[560px] w-auto rounded-lg border border-line shadow-card" />
          ) : (
            <div className="flex h-80 w-60 items-center justify-center rounded-lg border border-line">
              <Loader2 aria-hidden className="h-5 w-5 animate-spin text-faint" />
            </div>
          )}
          {preview ? (
            <span
              className={cn("pointer-events-none absolute rounded bg-accent/15 px-1 font-sans text-[11px] text-ink", pos[0] === "t" ? "top-[4%]" : "bottom-[4%]", pos[1] === "l" ? "left-[6%]" : pos[1] === "r" ? "right-[6%]" : "left-1/2 -translate-x-1/2")}
            >
              {sample}
            </span>
          ) : null}
        </div>
      </Panel>
    </div>
  );
}

/* ——— Watermark ——— */

export function WatermarkPdf() {
  const { loaded, error, opening, load, reset } = usePdfFile();
  return (
    <div className="space-y-4">
      <Start title="Drop a PDF to watermark" loaded={loaded} error={error} opening={opening} load={load} />
      {loaded ? <WatermarkWorkspace key={loaded.key} loaded={loaded} reset={reset} /> : null}
    </div>
  );
}

function WatermarkWorkspace({ loaded, reset }: { loaded: Loaded; reset: () => void }) {
  const [preview, setPreview] = useState("");
  const [text, setText] = useState("CONFIDENTIAL");
  const [size, setSize] = useState(56);
  const [opacity, setOpacity] = useState(18);
  const [angle, setAngle] = useState(45);
  const [color, setColor] = useState("#c62828");
  const [layout, setLayout] = useState<"center" | "tile">("center");
  const [which, setWhich] = useState<"all" | "some">("all");
  const [ranges, setRanges] = useState("1");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const picked = which === "all" ? Array.from({ length: loaded.pages }, (_, i) => i) : parseRanges(ranges, loaded.pages);

  useEffect(() => {
    let off = false;
    renderPage(loaded.doc, 1, { width: 520 }).then((c) => !off && setPreview(c.toDataURL("image/jpeg", 0.85)), () => {});
    return () => {
      off = true;
    };
  }, [loaded.doc]);

  async function save() {
    if (typeof picked === "string" || !text.trim()) return;
    setBusy(true);
    setError("");
    try {
      const { PDFDocument, StandardFonts, degrees, rgb } = await loadPdfLib();
      const doc = await PDFDocument.load(await loaded.file.arrayBuffer(), { ignoreEncryption: true });
      const font = await doc.embedFont(StandardFonts.HelveticaBold);
      const [r, g, b] = hexToRgb01(color);
      const tw = font.widthOfTextAtSize(text, size);
      const th = size * 0.7;
      const a = (angle * Math.PI) / 180;
      // Offset from the text's start point to its visual center, after rotation.
      const ox = (tw / 2) * Math.cos(a) - (th / 2) * Math.sin(a);
      const oy = (tw / 2) * Math.sin(a) + (th / 2) * Math.cos(a);
      const pages = doc.getPages();
      for (const i of picked) {
        const page = pages[i];
        const f = visualFrame(page);
        const centers: [number, number][] = [];
        if (layout === "center") centers.push([f.width / 2, f.height / 2]);
        else {
          const stepX = Math.max(tw * 0.9, 160);
          const stepY = Math.max(size * 3.2, 140);
          for (let y = stepY / 2, row = 0; y < f.height + stepY; y += stepY, row++)
            for (let x = (row % 2 ? stepX / 2 : 0) + stepX / 4; x < f.width + stepX; x += stepX) centers.push([x, y]);
        }
        for (const [cx, cy] of centers) {
          const { x, y } = f.at(cx - ox, cy - oy);
          page.drawText(text, { x, y, size, font, color: rgb(r, g, b), opacity: opacity / 100, rotate: degrees(f.r + angle) });
        }
      }
      await savePdf(await doc.save(), `${baseName(loaded.file.name)}-watermarked.pdf`);
    } catch (e) {
      setError(friendlySaveError(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[340px_minmax(0,1fr)]">
      <Panel className="space-y-5 self-start">
        <FileMeta name={loaded.file.name} size={loaded.file.size} extra={`${loaded.pages} pages`} />
        <div>
          <FieldLabel htmlFor="wm-text">Watermark text</FieldLabel>
          <input id="wm-text" value={text} onChange={(e) => setText(e.target.value)} maxLength={60} className={inputClass} />
        </div>
        <Choice label="Layout" value={layout} onChange={setLayout} options={[{ value: "center", label: "Once, centered" }, { value: "tile", label: "Repeated" }]} />
        <Slider label="Text size" value={size} onChange={setSize} min={12} max={120} unit=" pt" />
        <Slider label="Angle" value={angle} onChange={setAngle} min={-90} max={90} unit="°" />
        <Slider label="Opacity" value={opacity} onChange={setOpacity} min={5} max={100} unit="%" />
        <ColorField label="Color" value={color} onChange={setColor} />
        <Choice label="Pages" value={which} onChange={setWhich} options={[{ value: "all", label: "All pages" }, { value: "some", label: "Choose pages" }]} />
        {which === "some" ? (
          <div>
            <FieldLabel htmlFor="wm-ranges" hint="e.g. 1-3, 5">
              Pages to watermark
            </FieldLabel>
            <input id="wm-ranges" value={ranges} onChange={(e) => setRanges(e.target.value)} className={inputClass} />
            {typeof picked === "string" ? <p className="mt-1.5 text-[12.5px] text-danger">{picked}</p> : null}
          </div>
        ) : null}
        {error ? <ErrorNote>{error}</ErrorNote> : null}
        <DownloadButton onClick={save} disabled={busy || !text.trim() || typeof picked === "string"}>
          Download watermarked PDF
        </DownloadButton>
        {busy ? <Busy>Adding the watermark…</Busy> : null}
        <StartOver onClick={reset} />
      </Panel>
      <Panel title="Preview" actions={<span className="text-[12.5px] text-muted">Page 1, approximate</span>}>
        <div className="relative mx-auto w-fit overflow-hidden rounded-lg">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="First page with watermark" className="max-h-[560px] w-auto rounded-lg border border-line shadow-card" />
          ) : (
            <div className="flex h-80 w-60 items-center justify-center rounded-lg border border-line">
              <Loader2 aria-hidden className="h-5 w-5 animate-spin text-faint" />
            </div>
          )}
          {preview && text ? (
            layout === "center" ? (
              <span aria-hidden className="pointer-events-none absolute top-1/2 left-1/2 font-sans font-bold whitespace-nowrap" style={{ color, opacity: opacity / 100, fontSize: `${size * 0.62}px`, transform: `translate(-50%, -50%) rotate(${-angle}deg)` }}>
                {text}
              </span>
            ) : (
              <span aria-hidden className="pointer-events-none absolute inset-[-50%] flex flex-wrap content-center items-center justify-center gap-x-16 gap-y-10 font-sans font-bold whitespace-nowrap" style={{ color, opacity: opacity / 100, fontSize: `${size * 0.62}px`, transform: `rotate(${-angle}deg)` }}>
                {Array.from({ length: 40 }, (_, i) => (
                  <span key={i}>{text}</span>
                ))}
              </span>
            )
          ) : null}
        </div>
      </Panel>
    </div>
  );
}

/* ——— Sign ——— */

type Signature = { url: string; width: number; height: number };

/** Crop a canvas to its drawn pixels, so the signature sits tight in its box. */
function trimCanvas(src: HTMLCanvasElement): Signature | null {
  const ctx = src.getContext("2d")!;
  const { width, height } = src;
  const data = ctx.getImageData(0, 0, width, height).data;
  let top = height, left = width, right = -1, bottom = -1;
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++)
      if (data[(y * width + x) * 4 + 3] > 8) {
        if (x < left) left = x;
        if (x > right) right = x;
        if (y < top) top = y;
        if (y > bottom) bottom = y;
      }
  if (right < 0) return null;
  const pad = 6;
  left = Math.max(0, left - pad);
  top = Math.max(0, top - pad);
  right = Math.min(width - 1, right + pad);
  bottom = Math.min(height - 1, bottom + pad);
  const out = document.createElement("canvas");
  out.width = right - left + 1;
  out.height = bottom - top + 1;
  out.getContext("2d")!.drawImage(src, left, top, out.width, out.height, 0, 0, out.width, out.height);
  return { url: out.toDataURL("image/png"), width: out.width, height: out.height };
}

const INKS = [
  { value: "#111827", label: "Black" },
  { value: "#1d3fae", label: "Blue" },
];

function SignaturePad({ onDone }: { onDone: (s: Signature) => void }) {
  const [mode, setMode] = useState<"draw" | "type">("draw");
  const [ink, setInk] = useState(INKS[0].value);
  const [name, setName] = useState("");
  const [hasInk, setHasInk] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const last = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c || mode !== "draw") return;
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    const rect = c.getBoundingClientRect();
    c.width = Math.round(rect.width * dpr);
    c.height = Math.round(rect.height * dpr);
    const ctx = c.getContext("2d")!;
    ctx.scale(dpr, dpr);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, [mode]);

  function point(e: ReactPointerEvent<HTMLCanvasElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }
  function down(e: ReactPointerEvent<HTMLCanvasElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    last.current = point(e);
  }
  function move(e: ReactPointerEvent<HTMLCanvasElement>) {
    if (!last.current) return;
    const ctx = e.currentTarget.getContext("2d")!;
    const p = point(e);
    ctx.strokeStyle = ink;
    ctx.lineWidth = e.pointerType === "pen" ? 1.5 + e.pressure * 2.5 : 2.6;
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last.current = p;
    if (!hasInk) setHasInk(true);
  }
  function clear() {
    const c = canvasRef.current!;
    c.getContext("2d")!.clearRect(0, 0, c.width, c.height);
    setHasInk(false);
  }

  async function useSignature() {
    if (mode === "draw") {
      const s = canvasRef.current && trimCanvas(canvasRef.current);
      if (s) onDone(s);
      return;
    }
    const family = signatureFont.style.fontFamily;
    await document.fonts.load(`600 96px ${family}`);
    const c = document.createElement("canvas");
    c.width = 1400;
    c.height = 260;
    const ctx = c.getContext("2d")!;
    ctx.font = `600 120px ${family}`;
    ctx.fillStyle = ink;
    ctx.textBaseline = "middle";
    ctx.fillText(name.trim(), 30, 130);
    const s = trimCanvas(c);
    if (s) onDone(s);
  }

  return (
    <div className="space-y-4">
      <Choice label="Create your signature" value={mode} onChange={setMode} options={[{ value: "draw", label: "Draw it" }, { value: "type", label: "Type it" }]} />
      {mode === "draw" ? (
        <div>
          <canvas
            ref={canvasRef}
            onPointerDown={down}
            onPointerMove={move}
            onPointerUp={() => (last.current = null)}
            onPointerCancel={() => (last.current = null)}
            aria-label="Signature drawing area. Draw with your mouse, finger or pen."
            className="h-44 w-full touch-none rounded-2xl border border-dashed border-line-strong bg-white"
          />
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[12.5px] text-muted">Sign with your mouse, finger or pen.</span>
            <button type="button" className="text-[13px] font-medium text-accent hover:underline" onClick={clear} disabled={!hasInk}>
              Clear
            </button>
          </div>
        </div>
      ) : (
        <div>
          <FieldLabel htmlFor="sig-name">Your name</FieldLabel>
          <input id="sig-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={40} className={inputClass} placeholder="Jane Doe" />
          {name.trim() ? (
            <p className={cn(signatureFont.className, "mt-3 truncate rounded-2xl border border-line bg-white px-4 py-2 text-[44px] leading-tight")} style={{ color: ink }}>
              {name}
            </p>
          ) : null}
        </div>
      )}
      <Choice label="Ink" value={ink} onChange={setInk} options={INKS} />
      <DownloadButton onClick={useSignature} disabled={mode === "draw" ? !hasInk : !name.trim()}>
        Use this signature
      </DownloadButton>
    </div>
  );
}

export function SignPdf() {
  const { loaded, error, opening, load, reset } = usePdfFile();
  return (
    <div className="space-y-4">
      <Start title="Drop the PDF you need to sign" loaded={loaded} error={error} opening={opening} load={load} />
      {loaded ? <SignWorkspace key={loaded.key} loaded={loaded} reset={reset} /> : null}
    </div>
  );
}

function SignWorkspace({ loaded, reset }: { loaded: Loaded; reset: () => void }) {
  const [sig, setSig] = useState<Signature | null>(null);
  const [page, setPage] = useState(loaded.pages);
  const [preview, setPreview] = useState<{ page: number; url: string } | null>(null);
  // Signature box as fractions of the page as displayed (top-left origin).
  const [box, setBox] = useState({ x: 0.58, y: 0.8, w: 0.3 });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const areaRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ dx: number; dy: number } | null>(null);

  useEffect(() => {
    let off = false;
    renderPage(loaded.doc, page, { width: 900 }).then((c) => !off && setPreview({ page, url: c.toDataURL("image/jpeg", 0.85) }), () => {});
    return () => {
      off = true;
    };
  }, [loaded.doc, page]);

  const aspect = sig ? sig.height / sig.width : 0.3;
  const clampBox = (b: typeof box) => ({ ...b, x: Math.min(Math.max(b.x, 0), 1 - b.w), y: Math.min(Math.max(b.y, 0), 0.98) });

  function frac(e: { clientX: number; clientY: number }) {
    const r = areaRef.current!.getBoundingClientRect();
    return { fx: (e.clientX - r.left) / r.width, fy: (e.clientY - r.top) / r.height, ratio: r.width / r.height };
  }
  function startDrag(e: ReactPointerEvent<HTMLElement>) {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    const { fx, fy } = frac(e);
    drag.current = { dx: fx - box.x, dy: fy - box.y };
  }
  function moveDrag(e: ReactPointerEvent<HTMLElement>) {
    if (!drag.current) return;
    const { fx, fy } = frac(e);
    setBox((b) => clampBox({ ...b, x: fx - drag.current!.dx, y: fy - drag.current!.dy }));
  }
  function placeAt(e: ReactPointerEvent<HTMLDivElement>) {
    if (!sig) return;
    const { fx, fy, ratio } = frac(e);
    const hFrac = box.w * aspect * ratio;
    setBox((b) => clampBox({ ...b, x: fx - b.w / 2, y: fy - hFrac / 2 }));
  }

  async function save() {
    if (!sig) return;
    setBusy(true);
    setError("");
    try {
      const { PDFDocument, degrees } = await loadPdfLib();
      const doc = await PDFDocument.load(await loaded.file.arrayBuffer(), { ignoreEncryption: true });
      const png = await doc.embedPng(sig.url);
      const p = doc.getPage(page - 1);
      const f = visualFrame(p);
      const width = box.w * f.width;
      const height = width * aspect;
      const vx = box.x * f.width;
      const vy = f.height - box.y * f.height - height;
      const { x, y } = f.at(vx, vy);
      p.drawImage(png, { x, y, width, height, rotate: degrees(f.r) });
      await savePdf(await doc.save(), `${baseName(loaded.file.name)}-signed.pdf`);
    } catch (e) {
      setError(friendlySaveError(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[360px_minmax(0,1fr)]">
      <Panel className="space-y-5 self-start">
        <FileMeta name={loaded.file.name} size={loaded.file.size} extra={`${loaded.pages} pages`} />
        {sig ? (
          <>
            <div>
              <FieldLabel>Your signature</FieldLabel>
              <div className="flex items-center gap-3 rounded-2xl border border-line bg-white p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={sig.url} alt="Your signature" className="max-h-14 max-w-[70%] object-contain" />
                <button type="button" onClick={() => setSig(null)} className="ml-auto inline-flex items-center gap-1 text-[13px] font-medium text-accent hover:underline">
                  <X aria-hidden className="h-3.5 w-3.5" /> Redo
                </button>
              </div>
            </div>
            <div>
              <FieldLabel htmlFor="sign-page">Page</FieldLabel>
              <select id="sign-page" value={page} onChange={(e) => setPage(Number(e.target.value))} className={inputClass}>
                {Array.from({ length: loaded.pages }, (_, i) => (
                  <option key={i} value={i + 1}>
                    Page {i + 1}
                    {i + 1 === loaded.pages ? " (last)" : ""}
                  </option>
                ))}
              </select>
            </div>
            <Slider label="Signature size" value={Math.round(box.w * 100)} onChange={(v) => setBox((b) => clampBox({ ...b, w: v / 100 }))} min={8} max={70} unit="%" />
            <p className="text-[13px] text-muted">Tap the page to place your signature, or drag it into position.</p>
            {error ? <ErrorNote>{error}</ErrorNote> : null}
            <DownloadButton onClick={save} disabled={busy}>
              Download signed PDF
            </DownloadButton>
            {busy ? <Busy>Signing…</Busy> : null}
          </>
        ) : (
          <SignaturePad onDone={setSig} />
        )}
        <StartOver onClick={reset} />
      </Panel>
      <Panel title={`Page ${page} of ${loaded.pages}`}>
        <div ref={areaRef} onPointerDown={placeAt} className={cn("relative mx-auto w-full max-w-[640px] touch-none select-none", sig && "cursor-crosshair")}>
          {preview?.page === page ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview.url} alt={`Page ${page}`} draggable={false} className="block w-full rounded-lg border border-line shadow-card" />
          ) : (
            <div className="flex aspect-[3/4] w-full items-center justify-center rounded-lg border border-line">
              <Loader2 aria-hidden className="h-5 w-5 animate-spin text-faint" />
            </div>
          )}
          {sig && preview?.page === page ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={sig.url}
              alt="Signature position"
              draggable={false}
              onPointerDown={startDrag}
              onPointerMove={moveDrag}
              onPointerUp={() => (drag.current = null)}
              className="absolute cursor-move rounded outline-2 outline-offset-2 outline-accent/60 outline-dashed"
              style={{ left: `${box.x * 100}%`, top: `${box.y * 100}%`, width: `${box.w * 100}%` }}
            />
          ) : null}
        </div>
        {!sig ? <p className="mt-3 text-center text-[13px] text-muted">Create your signature first, then place it on the page.</p> : null}
        <p className="mt-3 flex items-center justify-center gap-1.5 text-[12.5px] text-muted">
          <Download aria-hidden className="h-3.5 w-3.5" /> The signed copy is created on your device.
        </p>
      </Panel>
    </div>
  );
}
