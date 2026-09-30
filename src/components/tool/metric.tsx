import type { ReactNode } from "react";
import { Info } from "lucide-react";
import { Tooltip } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

export function MetricCard({
  label,
  value,
  unit,
  hint,
  sub,
  meter,
  tag,
  className,
}: {
  label: string;
  value: ReactNode;
  unit?: string;
  /** Tooltip explaining how the metric is measured */
  hint?: string;
  sub?: ReactNode;
  /** 0–100 progress meter */
  meter?: number;
  tag?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-2xl border border-line bg-surface p-4 shadow-card sm:p-5", className)}>
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-[12.5px] font-medium text-muted">
          {label}
          {hint ? (
            <Tooltip content={hint}>
              <button type="button" aria-label={`About ${label}: ${hint}`} className="text-faint hover:text-ink">
                <Info aria-hidden className="h-3.5 w-3.5" />
              </button>
            </Tooltip>
          ) : null}
        </p>
        {tag}
      </div>
      <p className="num mt-2 text-[1.6rem] leading-none font-semibold tracking-tight text-ink">
        {value}
        {unit ? <span className="ml-1 text-sm font-medium text-muted">{unit}</span> : null}
      </p>
      {meter !== undefined ? (
        <div
          className="mt-3 h-1.5 overflow-hidden rounded-full bg-bg-subtle"
          role="meter"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(meter)}
          aria-label={label}
        >
          <div
            className="h-full rounded-full bg-ink transition-[width] duration-700 ease-out"
            style={{ width: `${Math.max(2, Math.min(100, meter))}%` }}
          />
        </div>
      ) : null}
      {sub ? <div className="mt-2.5 text-xs leading-relaxed text-muted">{sub}</div> : null}
    </div>
  );
}

export function MetricGrid({ children, className, cols = 4 }: { children: ReactNode; className?: string; cols?: 2 | 3 | 4 | 5 }) {
  const colClass =
    cols === 2
      ? "sm:grid-cols-2"
      : cols === 3
        ? "sm:grid-cols-2 lg:grid-cols-3"
        : cols === 5
          ? "sm:grid-cols-3 lg:grid-cols-5"
          : "sm:grid-cols-2 lg:grid-cols-4";
  return <div className={cn("grid grid-cols-2 gap-3", colClass, className)}>{children}</div>;
}

/** Compact key/value row list for "Basic information" style panels. */
export function StatList({ items, className }: { items: { label: string; value: ReactNode; note?: ReactNode }[]; className?: string }) {
  return (
    <dl className={cn("divide-y divide-line", className)}>
      {items.map((it) => (
        <div key={it.label} className="flex items-baseline justify-between gap-4 py-2.5">
          <dt className="text-[13px] text-muted">{it.label}</dt>
          <dd className="num text-right text-[13.5px] font-medium text-ink">
            {it.value}
            {it.note ? <span className="block text-[11.5px] font-normal text-muted">{it.note}</span> : null}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function SectionHeading({ title, description, action, id }: { title: string; description?: ReactNode; action?: ReactNode; id?: string }) {
  return (
    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 id={id} className="text-lg font-semibold tracking-tight text-ink">
          {title}
        </h2>
        {description ? <p className="mt-0.5 text-[13.5px] text-muted">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
