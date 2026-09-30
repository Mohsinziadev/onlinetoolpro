"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts";
import { formatCompact, formatDate, formatNumber } from "@/lib/utils";

/** Categorical series colors in fixed order (validated palette, see globals.css). */
export const SERIES_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"] as const;
export const MAX_SERIES = SERIES_COLORS.length;

const axisTick = { fill: "var(--chart-axis)", fontSize: 11 };

export type Series = { key: string; label: string; color: string };

type Row = Record<string, number | string | null>;

function TooltipBox({
  active,
  payload,
  label,
  valueFormatter,
  labelFormatter,
}: Partial<TooltipContentProps<number, string>> & { valueFormatter: (v: number) => string; labelFormatter: (l: string | number) => string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="min-w-40 rounded-xl border border-line bg-surface px-3 py-2.5 text-xs shadow-float">
      <p className="mb-1.5 font-medium text-ink">{labelFormatter(label as string | number)}</p>
      <ul className="space-y-1">
        {payload.map((p) => (
          <li key={String(p.dataKey)} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-muted">
              <span className="h-2 w-2 rounded-full" style={{ background: p.color }} aria-hidden />
              {p.name}
            </span>
            <span className="num font-medium text-ink">{typeof p.value === "number" ? valueFormatter(p.value) : "—"}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Legend({ series }: { series: Series[] }) {
  if (series.length < 2) return null;
  return (
    <ul className="mb-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-ink-2" aria-label="Legend">
      {series.map((s) => (
        <li key={s.key} className="flex items-center gap-1.5">
          <span className="h-[3px] w-3 rounded-full" style={{ background: s.color }} aria-hidden />
          {s.label}
        </li>
      ))}
    </ul>
  );
}

/**
 * Time series. X values are epoch milliseconds so irregular snapshot spacing
 * is drawn truthfully (no evenly-spaced category axis).
 */
export function TimeSeriesChart({
  data,
  series,
  height = 260,
  valueFormatter = formatNumber,
  xKey = "t",
}: {
  data: Row[];
  series: Series[];
  height?: number;
  valueFormatter?: (v: number) => string;
  xKey?: string;
}) {
  const single = data.length === 1;
  return (
    <div>
      <Legend series={series} />
      <div style={{ height }} className="w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
            <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
            <XAxis
              dataKey={xKey}
              type="number"
              scale="time"
              domain={single ? ["dataMin - 43200000", "dataMax + 43200000"] : ["dataMin", "dataMax"]}
              tickFormatter={(v: number) => formatDate(new Date(v), { month: "short", day: "numeric" })}
              tick={axisTick}
              tickLine={false}
              axisLine={{ stroke: "var(--chart-grid)" }}
              minTickGap={32}
            />
            <YAxis
              tickFormatter={(v: number) => formatCompact(v)}
              tick={axisTick}
              tickLine={false}
              axisLine={false}
              width={48}
              domain={["auto", "auto"]}
            />
            <Tooltip
              cursor={{ stroke: "var(--line-strong)", strokeWidth: 1 }}
              content={(props) => (
                <TooltipBox
                  {...(props as TooltipContentProps<number, string>)}
                  valueFormatter={valueFormatter}
                  labelFormatter={(l) => formatDate(new Date(Number(l)), { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}
                />
              )}
            />
            {series.map((s) => (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.label}
                stroke={s.color}
                strokeWidth={2}
                dot={single || data.length < 12 ? { r: 4, strokeWidth: 2, stroke: "var(--surface)", fill: s.color } : false}
                activeDot={{ r: 5, strokeWidth: 2, stroke: "var(--surface)" }}
                connectNulls
                isAnimationActive
                animationDuration={600}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/** Single-series bar chart with a category axis (e.g. views per video). */
export function SimpleBarChart({
  data,
  dataKey,
  label,
  xKey,
  height = 240,
  color = "var(--chart-1)",
  valueFormatter = formatNumber,
  xTickFormatter,
  tooltipLabel,
}: {
  data: Row[];
  dataKey: string;
  label: string;
  xKey: string;
  height?: number;
  color?: string;
  valueFormatter?: (v: number) => string;
  xTickFormatter?: (v: string) => string;
  tooltipLabel?: (row: Row) => string;
}) {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: 0 }} barCategoryGap={2}>
          <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
          <XAxis
            dataKey={xKey}
            tick={axisTick}
            tickLine={false}
            axisLine={{ stroke: "var(--chart-grid)" }}
            tickFormatter={xTickFormatter}
            minTickGap={16}
            interval="preserveStartEnd"
          />
          <YAxis tickFormatter={(v: number) => formatCompact(v)} tick={axisTick} tickLine={false} axisLine={false} width={48} />
          <Tooltip
            cursor={{ fill: "var(--bg-subtle)" }}
            content={(props) => {
              const p = props as TooltipContentProps<number, string>;
              const row = p.payload?.[0]?.payload as Row | undefined;
              return (
                <TooltipBox
                  {...p}
                  valueFormatter={valueFormatter}
                  labelFormatter={(l) => (row && tooltipLabel ? tooltipLabel(row) : String(l))}
                />
              );
            }}
          />
          <Bar dataKey={dataKey} name={label} fill={color} radius={[4, 4, 0, 0]} maxBarSize={28} animationDuration={600} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Grouped bars for comparing a few entities on one measure. */
export function ComparisonBarChart({
  data,
  valueFormatter = formatNumber,
  height = 220,
}: {
  data: { label: string; value: number | null; color: string }[];
  valueFormatter?: (v: number) => string;
  height?: number;
}) {
  const max = Math.max(...data.map((d) => d.value ?? 0)) || 1;
  // Plain HTML bars: horizontal layout keeps long channel names readable on mobile.
  return (
    <ul className="space-y-3" style={{ minHeight: height / 2 }}>
      {data.map((d) => (
        <li key={d.label}>
          <div className="mb-1 flex items-baseline justify-between gap-3 text-[13px]">
            <span className="flex min-w-0 items-center gap-2 text-ink-2">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: d.color }} aria-hidden />
              <span className="truncate">{d.label}</span>
            </span>
            <span className="num shrink-0 font-medium text-ink">{d.value === null ? "Hidden" : valueFormatter(d.value)}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-bg-subtle">
            <div
              className="h-full rounded-full transition-[width] duration-700 ease-out"
              style={{ width: `${d.value === null ? 0 : Math.max(1, (d.value / max) * 100)}%`, background: d.color }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
