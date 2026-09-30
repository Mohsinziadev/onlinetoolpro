"use client";

import { useState, type ReactNode } from "react";
import { BarChart3, Table2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Card wrapper for every chart. Includes a chart/table toggle so the data is
 * always available in a non-visual form (accessibility + precise values).
 */
export function ChartCard({
  title,
  description,
  action,
  children,
  table,
  className,
  footer,
}: {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  table?: ReactNode;
  className?: string;
  footer?: ReactNode;
}) {
  const [view, setView] = useState<"chart" | "table">("chart");
  return (
    <section className={cn("rounded-2xl border border-line bg-surface p-5 shadow-card sm:p-6", className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[15px] font-semibold tracking-tight text-ink">{title}</h3>
          {description ? <p className="mt-0.5 text-[13px] text-muted">{description}</p> : null}
        </div>
        <div className="flex items-center gap-2">
          {action}
          {table ? (
            <button
              type="button"
              onClick={() => setView((v) => (v === "chart" ? "table" : "chart"))}
              className="inline-flex h-8 items-center gap-1.5 rounded-full border border-line px-3 text-xs font-medium text-muted transition-colors hover:text-ink"
              aria-pressed={view === "table"}
            >
              {view === "chart" ? <Table2 aria-hidden className="h-3.5 w-3.5" /> : <BarChart3 aria-hidden className="h-3.5 w-3.5" />}
              {view === "chart" ? "Table" : "Chart"}
            </button>
          ) : null}
        </div>
      </div>
      <div className="mt-5 animate-fade-in" key={view}>
        {view === "chart" ? children : table}
      </div>
      {footer ? <div className="mt-4 border-t border-line pt-3 text-xs text-muted">{footer}</div> : null}
    </section>
  );
}

export function DataTable({ columns, rows }: { columns: string[]; rows: (string | number)[][] }) {
  return (
    <div className="max-h-80 overflow-auto rounded-xl border border-line">
      <table className="w-full text-left text-[13px]">
        <thead className="sticky top-0 bg-surface-2">
          <tr>
            {columns.map((c, i) => (
              <th key={c} scope="col" className={cn("px-3 py-2 font-medium text-muted", i > 0 && "text-right")}>
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((cell, j) => (
                <td key={j} className={cn("num px-3 py-2 text-ink", j > 0 && "text-right")}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
