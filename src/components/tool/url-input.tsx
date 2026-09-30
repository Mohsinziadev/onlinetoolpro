"use client";

import { useId, type FormEvent, type ReactNode } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Large single-field form used by the URL-driven tools (channel audit, video
 * lookup, comments). Submits on Enter; shows example chips.
 */
export function UrlInput({
  value,
  onChange,
  onSubmit,
  placeholder,
  label,
  submitLabel = "Analyze",
  loading = false,
  icon,
  examples,
  hint,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: (v: string) => void;
  placeholder: string;
  label: string;
  submitLabel?: string;
  loading?: boolean;
  icon?: ReactNode;
  examples?: { label: string; value: string }[];
  hint?: ReactNode;
  className?: string;
}) {
  const id = useId();
  function submit(e: FormEvent) {
    e.preventDefault();
    if (value.trim() && !loading) onSubmit(value.trim());
  }
  return (
    <form onSubmit={submit} className={cn("w-full", className)} role="search">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <div className="flex flex-col gap-2 rounded-[20px] border border-line bg-surface p-2 shadow-raised transition-[border-color,box-shadow] focus-within:border-accent/50 focus-within:ring-4 focus-within:ring-accent/10 sm:flex-row sm:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-3 pl-3">
          {icon ? <span className="shrink-0 text-muted">{icon}</span> : null}
          <input
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            autoComplete="off"
            spellCheck={false}
            inputMode="url"
            className="h-12 min-w-0 flex-1 bg-transparent text-[16px] text-ink outline-none placeholder:text-faint"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !value.trim()}
          className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-cta px-6 text-[15px] font-medium text-cta-ink transition-colors hover:bg-cta-hover disabled:opacity-50"
        >
          {loading ? <Loader2 aria-hidden className="h-4 w-4 animate-spin" /> : null}
          {loading ? "Working…" : submitLabel}
          {!loading ? <ArrowRight aria-hidden className="h-4 w-4" /> : null}
        </button>
      </div>
      {examples?.length || hint ? (
        <div className="mt-3 flex flex-wrap items-center gap-2 px-1 text-xs text-muted">
          {examples?.length ? <span>Try:</span> : null}
          {examples?.map((ex) => (
            <button
              key={ex.value}
              type="button"
              onClick={() => {
                onChange(ex.value);
                onSubmit(ex.value);
              }}
              className="rounded-full border border-line bg-surface px-2.5 py-1 font-mono text-[11.5px] text-ink-2 transition-colors hover:border-line-strong hover:text-ink"
            >
              {ex.label}
            </button>
          ))}
          {hint ? <span className="w-full sm:ml-auto sm:w-auto">{hint}</span> : null}
        </div>
      ) : null}
    </form>
  );
}
