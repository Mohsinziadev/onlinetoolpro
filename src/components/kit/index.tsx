"use client";

/**
 * Shared building blocks for the browser tools, so every tool looks and behaves
 * like part of one toolbox. Everything here is client-side only.
 */
import { useEffect, useId, useRef, useState, useSyncExternalStore, type DragEvent, type ReactNode } from "react";
import { AlertTriangle, Download, FileUp } from "lucide-react";
import { CopyButton } from "@/components/tool/copy-button";
import { cn, formatBytes } from "@/lib/utils";

/** True only in the browser after hydration — for values that must not be generated during the static build (random IDs, the current time). */
export function useMounted(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

/* ——— layout ——— */

export function Panel({ children, className, title, actions }: { children: ReactNode; className?: string; title?: ReactNode; actions?: ReactNode }) {
  return (
    <div className={cn("rounded-3xl border border-line bg-surface p-5 shadow-raised sm:p-6", className)}>
      {title || actions ? (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          {title ? <p className="text-[15px] font-medium text-ink">{title}</p> : <span />}
          {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
        </div>
      ) : null}
      {children}
    </div>
  );
}

/** Two columns on desktop (input | output), stacked on phones. */
export function TwoPane({ left, right, className }: { left: ReactNode; right: ReactNode; className?: string }) {
  return <div className={cn("grid grid-cols-1 gap-4 lg:grid-cols-2", className)}>{left}{right}</div>;
}

export function FieldLabel({ htmlFor, children, hint }: { htmlFor?: string; children: ReactNode; hint?: ReactNode }) {
  return (
    <div className="mb-1.5 flex items-baseline justify-between gap-3">
      <label htmlFor={htmlFor} className="text-[13.5px] font-medium text-ink-2">
        {children}
      </label>
      {hint ? <span className="text-[12px] text-muted">{hint}</span> : null}
    </div>
  );
}

/* ——— text in / text out ——— */

const areaClass =
  "block w-full resize-y rounded-2xl border border-line bg-surface-2 p-4 text-[15px] leading-[1.6] text-ink outline-none transition-[border-color,box-shadow] placeholder:text-faint focus:border-accent/50 focus:ring-4 focus:ring-accent/10";

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  rows = 8,
  mono = false,
  autoFocus = false,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  mono?: boolean;
  autoFocus?: boolean;
  hint?: ReactNode;
}) {
  const id = useId();
  return (
    <div>
      <FieldLabel htmlFor={id} hint={hint ?? `${value.length.toLocaleString()} characters`}>
        {label}
      </FieldLabel>
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        spellCheck={!mono}
        autoFocus={autoFocus}
        className={cn(areaClass, mono && "font-mono text-[13.5px]")}
      />
    </div>
  );
}

/** Read-only result with copy (and optional download). */
export function OutputBox({
  label = "Result",
  value,
  rows = 8,
  mono = false,
  filename,
  mime = "text/plain",
  empty = "Your result will appear here.",
}: {
  label?: string;
  value: string;
  rows?: number;
  mono?: boolean;
  filename?: string;
  mime?: string;
  empty?: string;
}) {
  const id = useId();
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <label htmlFor={id} className="text-[13.5px] font-medium text-ink-2">
          {label}
        </label>
        <div className="flex gap-2">
          {filename ? (
            <button
              type="button"
              disabled={!value}
              onClick={() => saveText(value, filename, mime)}
              className="inline-flex h-8 items-center gap-1.5 rounded-full border border-line bg-surface px-3 text-[12.5px] font-medium text-ink shadow-card transition-colors hover:bg-bg-subtle disabled:opacity-50"
            >
              <Download aria-hidden className="h-3.5 w-3.5" /> Download
            </button>
          ) : null}
          <CopyButton value={value} label="Copy result" showLabel />
        </div>
      </div>
      <textarea id={id} readOnly value={value} placeholder={empty} rows={rows} className={cn(areaClass, "bg-surface", mono && "font-mono text-[13.5px]")} onFocus={(e) => e.currentTarget.select()} />
    </div>
  );
}

export function ErrorNote({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="flex items-start gap-2 rounded-xl border border-danger/25 bg-danger-soft p-3 text-[14px] text-ink-2">
      <AlertTriangle aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-danger" /> {children}
    </p>
  );
}

/* ——— controls ——— */

export function Slider({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit = "",
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
}) {
  const id = useId();
  return (
    <div>
      <FieldLabel htmlFor={id} hint={<span className="num font-medium text-ink">{`${value}${unit}`}</span>}>
        {label}
      </FieldLabel>
      <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-[var(--accent)]" />
    </div>
  );
}

export function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const id = useId();
  const [text, setText] = useState(value);
  const [synced, setSynced] = useState(value);
  // Follow outside changes (e.g. picking from the swatch) without an effect.
  if (synced !== value) {
    setSynced(value);
    setText(value);
  }
  return (
    <div>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <div className="flex h-11 items-center gap-2 rounded-xl border border-line bg-surface px-2">
        <input
          type="color"
          aria-label={`${label} picker`}
          value={/^#[0-9a-f]{6}$/i.test(value) ? value : "#000000"}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-9 cursor-pointer rounded-md border-0 bg-transparent p-0"
        />
        <input
          id={id}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            const v = e.target.value.trim();
            if (/^#?[0-9a-f]{6}$/i.test(v)) onChange(v.startsWith("#") ? v : `#${v}`);
          }}
          spellCheck={false}
          className="num min-w-0 flex-1 bg-transparent font-mono text-[14px] text-ink uppercase outline-none"
        />
      </div>
    </div>
  );
}

/** Pill-style option group for small choices (formats, modes). */
export function Choice<T extends string>({ label, value, onChange, options }: { label: string; value: T; onChange: (v: T) => void; options: { value: T; label: string }[] }) {
  return (
    <div role="radiogroup" aria-label={label}>
      <p className="mb-1.5 text-[13.5px] font-medium text-ink-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={value === o.value}
            onClick={() => onChange(o.value)}
            className={cn("chip", value === o.value && "chip-active")}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-[14px] text-ink-2">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-[var(--accent)]" />
      {label}
    </label>
  );
}

/* ——— files ——— */

/**
 * Drag-and-drop / click / paste file picker for any file type. Files never leave
 * the device — callers read them with browser APIs.
 */
export function FileDrop({
  onFiles,
  accept,
  multiple = false,
  title,
  hint,
  compact = false,
}: {
  onFiles: (files: File[]) => void;
  accept: string;
  multiple?: boolean;
  title: string;
  hint?: string;
  compact?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const id = useId();
  const [dragging, setDragging] = useState(false);
  const matches = (f: File) =>
    accept.split(",").some((a) => {
      const t = a.trim();
      return t.startsWith(".") ? f.name.toLowerCase().endsWith(t) : t.endsWith("/*") ? f.type.startsWith(t.slice(0, -1)) : f.type === t;
    });

  useEffect(() => {
    function onPaste(e: ClipboardEvent) {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;
      const files = Array.from(e.clipboardData?.files ?? []).filter(matches);
      if (files.length) {
        e.preventDefault();
        onFiles(multiple ? files : files.slice(0, 1));
      }
    }
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  });

  function drop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files).filter(matches);
    if (files.length) onFiles(multiple ? files : files.slice(0, 1));
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={drop}
      className={cn(
        "relative flex flex-col items-center justify-center rounded-3xl border-2 border-dashed text-center transition-colors",
        compact ? "px-4 py-6" : "px-6 py-14",
        dragging ? "border-accent bg-accent-soft" : "border-line-strong bg-surface hover:border-accent/50",
      )}
    >
      <FileUp aria-hidden className="h-7 w-7 text-accent" strokeWidth={1.6} />
      <p className="mt-3 text-[16px] font-medium text-ink">{title}</p>
      <p className="mt-1 text-[13.5px] text-muted">{hint ?? "Drag and drop, paste, or choose a file. Files stay on your device."}</p>
      <label htmlFor={id} className="mt-5 inline-flex h-11 cursor-pointer items-center rounded-full bg-cta px-5 text-[14.5px] font-medium text-cta-ink transition-colors hover:bg-cta-hover">
        Choose {multiple ? "files" : "a file"}
      </label>
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        multiple={multiple}
        className="sr-only"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          if (files.length) onFiles(files);
          e.target.value = "";
        }}
      />
    </div>
  );
}

export function FileMeta({ name, size, extra }: { name: string; size: number; extra?: ReactNode }) {
  return (
    <p className="truncate text-[13.5px] text-muted">
      <span className="font-medium text-ink">{name}</span> · {formatBytes(size)}
      {extra ? <> · {extra}</> : null}
    </p>
  );
}

/* ——— saving ——— */

export function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export function saveText(text: string, filename: string, mime = "text/plain") {
  saveBlob(new Blob([text], { type: `${mime};charset=utf-8` }), filename);
}

export function DownloadButton({ onClick, children = "Download", disabled }: { onClick: () => void; children?: ReactNode; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex h-11 items-center gap-2 rounded-full bg-cta px-5 text-[14.5px] font-medium text-cta-ink transition-colors hover:bg-cta-hover disabled:opacity-50"
    >
      <Download aria-hidden className="h-4 w-4" /> {children}
    </button>
  );
}

/** Load a File into an HTMLImageElement (works for JPG, PNG, WebP, GIF, SVG). */
export function readImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("This file couldn't be opened as an image."));
    };
    img.src = url;
  });
}

export function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Couldn't create the image."))), type, quality));
}

export const baseName = (name: string) => name.replace(/\.[^.]+$/, "");
