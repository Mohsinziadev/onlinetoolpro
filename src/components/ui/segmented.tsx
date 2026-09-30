"use client";

import { useId, useRef, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

type Option<T extends string> = { value: T; label: string };

/**
 * Segmented control / tab list. Implements the WAI-ARIA tabs keyboard pattern
 * (arrow keys, Home/End) so it can drive tab panels or simple toggles.
 */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
  size = "md",
  className,
  idPrefix,
}: {
  options: readonly Option<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  size?: "sm" | "md";
  className?: string;
  /** When set, tabs get ids `${idPrefix}-tab-${value}` and control `${idPrefix}-panel-${value}` */
  idPrefix?: string;
}) {
  const autoId = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if (e.key === "ArrowRight") next = (index + 1) % options.length;
    else if (e.key === "ArrowLeft") next = (index - 1 + options.length) % options.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = options.length - 1;
    else return;
    e.preventDefault();
    onChange(options[next].value);
    refs.current[next]?.focus();
  }

  return (
    <div
      role="tablist"
      aria-label={label}
      className={cn(
        "inline-flex max-w-full items-center gap-0.5 overflow-x-auto rounded-full border border-line bg-bg-subtle p-0.5 [scrollbar-width:none]",
        className,
      )}
    >
      {options.map((opt, i) => {
        const selected = opt.value === value;
        const prefix = idPrefix ?? autoId;
        return (
          <button
            key={opt.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            id={`${prefix}-tab-${opt.value}`}
            role="tab"
            type="button"
            aria-selected={selected}
            aria-controls={idPrefix ? `${idPrefix}-panel-${opt.value}` : undefined}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(opt.value)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={cn(
              "shrink-0 rounded-full font-medium whitespace-nowrap transition-[background-color,color,box-shadow] duration-150",
              size === "sm" ? "h-7 px-3 text-xs" : "h-8 px-3.5 text-[13px]",
              selected ? "bg-surface text-ink shadow-card ring-1 ring-line" : "text-muted hover:text-ink",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export function Switch({
  checked,
  onChange,
  label,
  id,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  id?: string;
}) {
  const autoId = useId();
  const switchId = id ?? autoId;
  return (
    <label htmlFor={switchId} className="flex cursor-pointer items-center justify-between gap-3 py-1.5 text-sm text-ink-2">
      <span>{label}</span>
      <button
        id={switchId}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-5 w-9 shrink-0 rounded-full transition-colors duration-150",
          checked ? "bg-accent" : "bg-line-strong",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-150",
            checked && "translate-x-4",
          )}
        />
      </button>
    </label>
  );
}
