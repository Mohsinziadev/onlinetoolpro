/**
 * Shared pdf.js helpers for tools that need to *see* PDF pages (PDF to JPG, page
 * previews). pdf.js is large, so it's imported only when one of these runs. Its
 * worker is served from /pdfjs/ (copied there on install — see
 * scripts/copy-pdf-worker.mjs).
 */
import type { PDFDocumentProxy } from "pdfjs-dist";

let ready: Promise<typeof import("pdfjs-dist")> | null = null;

function loadPdfJs() {
  ready ??= import("pdfjs-dist").then((pdfjs) => {
    pdfjs.GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.min.mjs";
    return pdfjs;
  });
  return ready;
}

export type PdfDoc = PDFDocumentProxy;

// pdf.js v6 frees a document through the task that opened it.
const tasks = new WeakMap<PdfDoc, { destroy(): Promise<void> }>();

/** Free a document's memory and worker resources. Safe to call more than once. */
export function closePdf(doc: PdfDoc | null | undefined) {
  if (!doc) return;
  void tasks.get(doc)?.destroy();
  tasks.delete(doc);
}

/** Open a PDF file for rendering. Throws a friendly message for protected or broken files. */
export async function openPdf(file: File | ArrayBuffer): Promise<PdfDoc> {
  const pdfjs = await loadPdfJs();
  const data = new Uint8Array(file instanceof File ? await file.arrayBuffer() : file.slice(0));
  try {
    const task = pdfjs.getDocument({ data });
    const doc = await task.promise;
    tasks.set(doc, task);
    return doc;
  } catch (e) {
    const name = e instanceof Error ? e.name : "";
    if (name === "PasswordException") throw new Error("This PDF is password-protected. Remove the password first, then try again.");
    throw new Error("This file couldn't be read as a PDF.");
  }
}

/**
 * Draw one page (1-based) onto a new canvas. Pass `scale` for an exact zoom
 * (1 = 72 dpi), or `width` to fit a thumbnail width; `maxSide` caps the longest
 * side in pixels. The page is drawn on white.
 */
export async function renderPage(doc: PdfDoc, pageNumber: number, opts: { scale?: number; width?: number; rotation?: number; maxSide?: number }): Promise<HTMLCanvasElement> {
  const page = await doc.getPage(pageNumber);
  const rotation = ((page.rotate + (opts.rotation ?? 0)) % 360 + 360) % 360;
  const base = page.getViewport({ scale: 1, rotation });
  let scale = opts.scale ?? (opts.width ? opts.width / base.width : 1);
  // Cap huge pages so the browser doesn't run out of canvas memory.
  if (opts.maxSide) scale = Math.min(scale, opts.maxSide / Math.max(base.width, base.height));
  const viewport = page.getViewport({ scale, rotation });
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.floor(viewport.width));
  canvas.height = Math.max(1, Math.floor(viewport.height));
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvas, viewport }).promise;
  page.cleanup();
  return canvas;
}
