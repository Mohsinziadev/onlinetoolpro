"use client";

import { useEffect, useId, useRef, useState, type DragEvent } from "react";
import { ImageUp, Loader2, ShieldCheck } from "lucide-react";
import { ACCEPTED_TYPES } from "@/lib/image/load";
import { cn } from "@/lib/utils";

/**
 * Drag-and-drop / click / paste image picker. Keyboard accessible via the
 * underlying file input. Validation happens in the caller's `onFile`.
 */
export function UploadDropzone({
  onFile,
  loading = false,
  compact = false,
  title = "Drop a thumbnail here",
  className,
}: {
  onFile: (file: File) => void;
  loading?: boolean;
  compact?: boolean;
  title?: string;
  className?: string;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  // Paste an image from the clipboard anywhere on the page
  useEffect(() => {
    function onPaste(e: ClipboardEvent) {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;
      const file = Array.from(e.clipboardData?.files ?? []).find((f) => f.type.startsWith("image/"));
      if (file) {
        e.preventDefault();
        onFile(file);
      }
    }
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [onFile]);

  function onDrop(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onFile(file);
  }

  return (
    <label
      htmlFor={inputId}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      className={cn(
        "group relative flex cursor-pointer flex-col items-center justify-center rounded-[20px] border border-dashed text-center transition-[border-color,background-color,box-shadow] duration-200",
        "focus-within:border-ink/40 focus-within:ring-4 focus-within:ring-ink/5",
        dragging
          ? "border-accent bg-accent-soft/60"
          : "border-line-strong bg-surface hover:border-ink/30 hover:bg-surface-2",
        compact ? "px-4 py-6" : "px-6 py-14 sm:py-20",
        className,
      )}
    >
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
          e.target.value = "";
        }}
      />
      <span
        className={cn(
          "flex items-center justify-center rounded-2xl border border-line bg-surface shadow-card transition-transform duration-200 group-hover:-translate-y-0.5",
          compact ? "h-10 w-10" : "h-14 w-14",
          dragging && "scale-105",
        )}
      >
        {loading ? (
          <Loader2 aria-hidden className="h-5 w-5 animate-spin text-muted" />
        ) : (
          <ImageUp aria-hidden className={cn("text-ink", compact ? "h-4 w-4" : "h-6 w-6")} strokeWidth={1.6} />
        )}
      </span>
      <span className={cn("font-semibold tracking-tight text-ink", compact ? "mt-3 text-sm" : "mt-5 text-lg")}>
        {loading ? "Reading image…" : dragging ? "Release to analyze" : title}
      </span>
      <span className={cn("text-muted", compact ? "mt-1 text-xs" : "mt-1.5 text-sm")}>
        or <span className="font-medium text-ink underline underline-offset-4">browse files</span>
        {compact ? null : " · paste with ⌘V / Ctrl+V"}
      </span>
      {compact ? null : (
        <span className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-bg-subtle px-3 py-1 text-xs text-muted">
          <ShieldCheck aria-hidden className="h-3.5 w-3.5 text-success" />
          JPG, PNG or WebP · processed on your device, never uploaded
        </span>
      )}
    </label>
  );
}
