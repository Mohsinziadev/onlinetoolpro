"use client";

import { useId, type ReactNode } from "react";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

/** Two-column calculator layout: inputs left, results right (stacked on mobile). */
export function CalcLayout({ inputs, results, className }: { inputs: ReactNode; results: ReactNode; className?: string }) {
  return (
    <div className={cn("grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]", className)}>
      <form onSubmit={(e) => e.preventDefault()} className="space-y-5 self-start rounded-[20px] border border-line bg-surface p-5 shadow-raised sm:p-6">
        {inputs}
      </form>
      <div className="min-w-0 space-y-4" aria-live="polite">
        {results}
      </div>
    </div>
  );
}

export function NumberField({
  label,
  value,
  onChange,
  prefix,
  suffix,
  hint,
  error,
  placeholder,
  inputMode = "decimal",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  prefix?: string;
  suffix?: string;
  hint?: ReactNode;
  error?: string | null;
  placeholder?: string;
  inputMode?: "decimal" | "numeric" | "text";
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[13px] font-medium text-ink">
        {label}
      </label>
      <div
        className={cn(
          "flex h-12 items-center rounded-xl border bg-surface transition-[border-color,box-shadow] focus-within:ring-4 focus-within:ring-ink/5",
          error ? "border-danger/60" : "border-line focus-within:border-ink/30",
        )}
      >
        {prefix ? <span className="pl-3.5 text-[15px] text-muted">{prefix}</span> : null}
        <input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          inputMode={inputMode}
          placeholder={placeholder}
          autoComplete="off"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-err` : hint ? `${id}-hint` : undefined}
          className="num h-full min-w-0 flex-1 bg-transparent px-3.5 text-[16px] text-ink outline-none placeholder:text-faint"
        />
        {suffix ? <span className="pr-3.5 text-[13px] text-muted">{suffix}</span> : null}
      </div>
      {error ? (
        <p id={`${id}-err`} className="mt-1.5 text-xs text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function ResultHero({ label, value, sub }: { label: string; value: ReactNode; sub?: ReactNode }) {
  return (
    <div className="rounded-[20px] bg-night p-6 text-white sm:p-7">
      <p className="text-[13px] text-white/60">{label}</p>
      <p className="num mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">{value}</p>
      {sub ? <p className="mt-2 text-[13px] text-white/60">{sub}</p> : null}
    </div>
  );
}

export function ResultGrid({ items }: { items: { label: string; value: ReactNode; sub?: ReactNode }[] }) {
  return (
    <dl className="grid grid-cols-2 gap-3">
      {items.map((it) => (
        <div key={it.label} className="rounded-2xl border border-line bg-surface p-4 shadow-card">
          <dt className="text-[12.5px] text-muted">{it.label}</dt>
          <dd className="num mt-1 text-xl font-semibold tracking-tight text-ink">{it.value}</dd>
          {it.sub ? <dd className="mt-0.5 text-[11.5px] text-muted">{it.sub}</dd> : null}
        </div>
      ))}
    </dl>
  );
}

/** Shows the formula and the substituted calculation. */
export function Calculation({ formula, steps }: { formula: string; steps: string[] }) {
  return (
    <div className="rounded-2xl border border-line bg-bg-subtle p-4 sm:p-5">
      <p className="eyebrow">Calculation</p>
      <p className="mt-2 font-mono text-[13.5px] text-ink">{formula}</p>
      {steps.length ? (
        <ol className="mt-2 space-y-1 font-mono text-[12.5px] text-muted">
          {steps.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
      ) : null}
    </div>
  );
}

export function Disclaimer({ children }: { children: ReactNode }) {
  return (
    <p className="flex gap-2 rounded-2xl border border-line bg-surface p-4 text-[12.5px] leading-relaxed text-muted">
      <Info aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{children}</span>
    </p>
  );
}

export function EmptyResult({ children }: { children: ReactNode }) {
  return <div className="flex min-h-40 items-center justify-center rounded-[20px] border border-dashed border-line-strong p-6 text-center text-sm text-muted">{children}</div>;
}

export function numberError(v: number | null, raw: string, { min = 0, allowZero = true }: { min?: number; allowZero?: boolean } = {}): string | null {
  if (raw.trim() === "") return null;
  if (v === null) return "Enter a number.";
  if (v < min) return `Must be ${min} or more.`;
  if (!allowZero && v === 0) return "Must be greater than 0.";
  return null;
}
