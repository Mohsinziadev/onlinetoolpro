"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AtSign, Loader2, Users, X } from "lucide-react";
import { UrlInput } from "@/components/tool/url-input";
import { EmptyState, ErrorState, LoadingState, MockDataBanner } from "@/components/tool/states";
import { SectionHeading } from "@/components/tool/metric";
import { ChartCard, DataTable } from "@/components/charts/chart-card";
import { ComparisonBarChart, SERIES_COLORS, TimeSeriesChart, type Series } from "@/components/charts/charts";
import { ChannelAvatar } from "@/components/youtube/channel-header";
import { Segmented } from "@/components/ui/segmented";
import { Badge, Card } from "@/components/ui/primitives";
import { apiDelete, apiGet, apiPost, errorMessage, errorTitle } from "@/lib/client-api";
import type { PerformanceSummary, PublishingActivity } from "@/lib/metrics";
import type { ChannelInfo, DataSource } from "@/lib/youtube/types";
import { cn, formatCompact, formatDuration, formatNumber, formatPercent } from "@/lib/utils";

type Snapshot = { capturedAt: string; subscriberCount: number | null; viewCount: number; videoCount: number };
type Competitor =
  | { channel: ChannelInfo; available: false; position: number; snapshots: Snapshot[] }
  | {
      channel: ChannelInfo;
      available: true;
      position: number;
      snapshots: Snapshot[];
      recentVideos: { id: string; title: string; publishedAt: string; viewCount: number | null }[];
      activity: PublishingActivity;
      performance: PerformanceSummary;
    };

type Tab = "overview" | "history" | "activity" | "performance";
const TABS = [
  { value: "overview", label: "Overview" },
  { value: "history", label: "Growth history" },
  { value: "activity", label: "Upload activity" },
  { value: "performance", label: "Video performance" },
] as const;

const colorOf = (c: Competitor) => SERIES_COLORS[c.position % SERIES_COLORS.length];
const name = (c: Competitor) => c.channel.title;

export function CompetitorTracker() {
  const [items, setItems] = useState<Competitor[] | null>(null);
  const [source, setSource] = useState<DataSource>("youtube");
  const [loadError, setLoadError] = useState<unknown>(null);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [actionError, setActionError] = useState<unknown>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [refreshing, setRefreshing] = useState(false);

  const apply = useCallback((res: { data: { competitors: Competitor[] }; source: DataSource } | { error: unknown }) => {
    if ("error" in res) {
      setLoadError(res.error);
      setItems((cur) => cur ?? []);
    } else {
      setItems(res.data.competitors);
      setSource(res.source);
      setLoadError(null);
    }
    setRefreshing(false);
  }, []);

  const request = () => apiGet<{ competitors: Competitor[] }>("/api/competitors").catch((error: unknown) => ({ error }));

  const load = useCallback(async () => {
    setRefreshing(true);
    apply(await request());
  }, [apply]);

  useEffect(() => {
    let cancelled = false;
    request().then((res) => {
      if (!cancelled) apply(res);
    });
    return () => {
      cancelled = true;
    };
  }, [apply]);

  async function add(q: string) {
    setBusy("add");
    setActionError(null);
    try {
      await apiPost("/api/competitors", { channel: q });
      setInput("");
      await load();
    } catch (err) {
      setActionError(err);
    } finally {
      setBusy(null);
    }
  }

  async function remove(id: string) {
    setBusy(id);
    setActionError(null);
    try {
      await apiDelete(`/api/competitors/${id}`);
      setItems((cur) => cur?.filter((c) => c.channel.id !== id) ?? null);
    } catch (err) {
      setActionError(err);
    } finally {
      setBusy(null);
    }
  }

  const full = (items?.length ?? 0) >= SERIES_COLORS.length;

  return (
    <div className="space-y-8">
      <UrlInput
        label="Channel to compare"
        placeholder={full ? "Comparison is full — remove a channel to add another" : "Add a channel — URL, @handle or channel ID"}
        value={input}
        onChange={setInput}
        onSubmit={add}
        loading={busy === "add"}
        submitLabel="Add channel"
        icon={<AtSign className="h-4 w-4" />}
        hint={`${items?.length ?? 0} of ${SERIES_COLORS.length} channels`}
      />
      {actionError ? <ErrorState title={errorTitle(actionError)} description={errorMessage(actionError)} /> : null}

      {items === null ? (
        <LoadingState label="Loading your comparison…" />
      ) : loadError && items.length === 0 ? (
        <ErrorState title={errorTitle(loadError)} description={errorMessage(loadError)} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<Users className="h-5 w-5" strokeWidth={1.75} />}
          title="Add at least two channels"
          description="For example your own channel and two or three channels in the same niche. Comparisons use public data and neutral language — different isn't better or worse."
        />
      ) : (
        <>
          {source === "mock" ? <MockDataBanner /> : null}
          <ul className="flex flex-wrap gap-2" aria-label="Channels in comparison">
            {items.map((c) => (
              <li key={c.channel.id} className="inline-flex items-center gap-2 rounded-full border border-line bg-surface py-1 pr-1 pl-1 shadow-card">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: colorOf(c) }} aria-hidden />
                <ChannelAvatar channel={c.channel} size={24} />
                <span className="max-w-44 truncate text-[13px] font-medium text-ink">{name(c)}</span>
                {!c.available ? <Badge tone="warning">Unavailable</Badge> : null}
                <button
                  type="button"
                  onClick={() => remove(c.channel.id)}
                  disabled={busy === c.channel.id}
                  aria-label={`Remove ${name(c)}`}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-full text-muted hover:bg-bg-subtle hover:text-ink"
                >
                  {busy === c.channel.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
                </button>
              </li>
            ))}
            {refreshing ? (
              <li className="inline-flex items-center gap-1.5 px-2 text-xs text-muted">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Updating
              </li>
            ) : null}
          </ul>

          {items.length === 1 ? (
            <p className="rounded-xl border border-line bg-bg-subtle px-4 py-3 text-sm text-muted">Add one more channel to start comparing.</p>
          ) : null}

          <div>
            <Segmented label="Comparison view" idPrefix="cmp" value={tab} onChange={setTab} options={TABS} />
            <div id={`cmp-panel-${tab}`} role="tabpanel" aria-labelledby={`cmp-tab-${tab}`} className="mt-6 animate-fade-in" key={tab}>
              {tab === "overview" ? <Overview items={items} /> : null}
              {tab === "history" ? <History items={items} /> : null}
              {tab === "activity" ? <Activity items={items.filter((c): c is Extract<Competitor, { available: true }> => c.available)} /> : null}
              {tab === "performance" ? <Performance items={items.filter((c): c is Extract<Competitor, { available: true }> => c.available)} /> : null}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Overview({ items }: { items: Competitor[] }) {
  const rows: { label: string; get: (c: Competitor) => string }[] = [
    { label: "Subscribers", get: (c) => (c.channel.subscriberCount === null ? "Hidden" : formatNumber(c.channel.subscriberCount)) },
    { label: "Total views", get: (c) => formatNumber(c.channel.viewCount) },
    { label: "Videos", get: (c) => formatNumber(c.channel.videoCount) },
    { label: "Views per video (lifetime)", get: (c) => (c.channel.videoCount ? formatCompact(c.channel.viewCount / c.channel.videoCount) : "—") },
    { label: "Uploads, last 30 days", get: (c) => (c.available ? String(c.activity.last30Days) : "—") },
    { label: "Average views (recent 15)", get: (c) => (c.available ? formatCompact(c.performance.averageViews) : "—") },
    { label: "Median views (recent 15)", get: (c) => (c.available ? formatCompact(c.performance.medianViews) : "—") },
    { label: "Average likes (recent 15)", get: (c) => (c.available ? formatCompact(c.performance.averageLikes) : "—") },
    { label: "Average comments (recent 15)", get: (c) => (c.available ? formatCompact(c.performance.averageComments) : "—") },
    { label: "Joined", get: (c) => new Date(c.channel.publishedAt).getFullYear().toString() },
  ];
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <ChartCard title="Subscribers" description="Public counts, rounded by YouTube.">
          <ComparisonBarChart data={items.map((c) => ({ label: name(c), value: c.channel.subscriberCount, color: colorOf(c) }))} valueFormatter={formatCompact} />
        </ChartCard>
        <ChartCard title="Total views">
          <ComparisonBarChart data={items.map((c) => ({ label: name(c), value: c.channel.viewCount, color: colorOf(c) }))} valueFormatter={formatCompact} />
        </ChartCard>
      </div>
      <Card className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-[13px]">
          <caption className="sr-only">Channel comparison</caption>
          <thead>
            <tr className="border-b border-line">
              <th scope="col" className="p-3 font-medium text-muted">
                Metric
              </th>
              {items.map((c) => (
                <th key={c.channel.id} scope="col" className="p-3 text-right font-medium text-ink">
                  <span className="inline-flex max-w-40 items-center gap-1.5">
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: colorOf(c) }} aria-hidden />
                    <span className="truncate">{name(c)}</span>
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((r) => (
              <tr key={r.label}>
                <th scope="row" className="p-3 font-normal text-muted">
                  {r.label}
                </th>
                {items.map((c) => (
                  <td key={c.channel.id} className="num p-3 text-right text-ink">
                    {r.get(c)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <p className="text-xs text-muted">Recent metrics use each channel&apos;s 15 most recent public uploads. Calculated by OnlineToolPro from public data.</p>
    </div>
  );
}

type HMetric = "subscriberCount" | "viewCount" | "videoCount";

function History({ items }: { items: Competitor[] }) {
  const [metric, setMetric] = useState<HMetric>("subscriberCount");
  const [mode, setMode] = useState<"change" | "total">("change");
  const [range, setRange] = useState<"7" | "30" | "90">("30");

  const { data, series, enough } = useMemo(() => {
    // Measured back from the most recent stored snapshot across all channels.
    const last = Math.max(0, ...items.flatMap((c) => c.snapshots.map((s) => new Date(s.capturedAt).getTime())));
    const since = last - Number(range) * 86_400_000;
    const rows: Record<string, number | null>[] = [];
    const series: Series[] = [];
    let enough = false;
    for (const c of items) {
      const pts = c.snapshots.filter((s) => new Date(s.capturedAt).getTime() >= since && s[metric] !== null);
      if (pts.length >= 2) enough = true;
      if (pts.length === 0) continue;
      series.push({ key: c.channel.id, label: name(c), color: colorOf(c) });
      const base = pts[0][metric] as number;
      for (const p of pts) rows.push({ t: new Date(p.capturedAt).getTime(), [c.channel.id]: mode === "change" ? (p[metric] as number) - base : (p[metric] as number) });
    }
    rows.sort((a, b) => (a.t as number) - (b.t as number));
    return { data: rows, series, enough };
  }, [items, metric, mode, range]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Segmented
          label="Metric"
          size="sm"
          value={metric}
          onChange={setMetric}
          options={[
            { value: "subscriberCount", label: "Subscribers" },
            { value: "viewCount", label: "Total views" },
            { value: "videoCount", label: "Videos" },
          ]}
        />
        <Segmented
          label="Values"
          size="sm"
          value={mode}
          onChange={setMode}
          options={[
            { value: "change", label: "Change since first snapshot" },
            { value: "total", label: "Totals" },
          ]}
        />
        <Segmented
          label="Date range"
          size="sm"
          value={range}
          onChange={setRange}
          options={[
            { value: "7", label: "7D" },
            { value: "30", label: "30D" },
            { value: "90", label: "90D" },
          ]}
        />
      </div>
      {!enough ? (
        <EmptyState
          title="Historical data will appear after additional snapshots are collected."
          description="A snapshot is stored when you view this comparison (at most once per hour per channel) and once a day automatically. History is never estimated."
        />
      ) : (
        <ChartCard
          title={mode === "change" ? "Historical change" : "Totals over time"}
          description={
            mode === "change"
              ? "Each line starts at zero at its first snapshot in range, so channels of different sizes share one scale."
              : "Absolute values. Large differences in size can flatten smaller channels — switch to change to compare movement."
          }
          table={
            <DataTable
              columns={["Captured", ...series.map((s) => s.label)]}
              rows={data.map((d) => [
                new Date(d.t as number).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }),
                ...series.map((s) => (d[s.key] === undefined || d[s.key] === null ? "—" : formatNumber(d[s.key] as number))),
              ])}
            />
          }
        >
          <TimeSeriesChart data={data} series={series} height={300} />
        </ChartCard>
      )}
    </div>
  );
}

function Activity({ items }: { items: Extract<Competitor, { available: true }>[] }) {
  if (!items.length) return <EmptyState title="No activity data" description="None of the channels could be loaded right now." />;
  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
      <ChartCard title="Uploads in the last 30 days">
        <ComparisonBarChart data={items.map((c) => ({ label: name(c), value: c.activity.last30Days, color: colorOf(c) }))} valueFormatter={(v) => String(v)} />
      </ChartCard>
      <ChartCard title="Average uploads per week" description="Across each channel's 15 most recent uploads.">
        <ComparisonBarChart data={items.map((c) => ({ label: name(c), value: c.activity.perWeek, color: colorOf(c) }))} valueFormatter={(v) => v.toFixed(1)} />
      </ChartCard>
      <ChartCard title="Average video length">
        <ComparisonBarChart data={items.map((c) => ({ label: name(c), value: c.activity.averageLengthSeconds, color: colorOf(c) }))} valueFormatter={formatDuration} />
      </ChartCard>
      <ChartCard title="Short-form share" description="Uploads of 60 seconds or less (approximation of Shorts).">
        <ComparisonBarChart
          data={items.map((c) => ({ label: name(c), value: c.activity.shortsShare === null ? null : c.activity.shortsShare * 100, color: colorOf(c) }))}
          valueFormatter={(v) => formatPercent(v, 0)}
        />
      </ChartCard>
    </div>
  );
}

function Performance({ items }: { items: Extract<Competitor, { available: true }>[] }) {
  if (!items.length) return <EmptyState title="No performance data" description="None of the channels could be loaded right now." />;
  const charts: { title: string; get: (p: PerformanceSummary) => number | null; fmt: (v: number) => string; desc?: string }[] = [
    { title: "Median views", get: (p) => p.medianViews, fmt: formatCompact, desc: "Middle value — less affected by one viral video." },
    { title: "Average views", get: (p) => p.averageViews, fmt: formatCompact },
    { title: "Median views per day", get: (p) => p.medianViewsPerDay, fmt: formatCompact },
    { title: "Average likes", get: (p) => p.averageLikes, fmt: formatCompact },
    { title: "Average comments", get: (p) => p.averageComments, fmt: formatCompact },
    { title: "Average like rate", get: (p) => p.averageLikeRate, fmt: (v) => formatPercent(v) },
  ];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {charts.map((ch) => (
          <ChartCard key={ch.title} title={ch.title} description={ch.desc ?? "Recent 15 uploads."}>
            <ComparisonBarChart data={items.map((c) => ({ label: name(c), value: ch.get(c.performance), color: colorOf(c) }))} valueFormatter={ch.fmt} />
          </ChartCard>
        ))}
      </div>
      <SectionHeading title="Latest uploads" description="Each channel's five most recent public videos." />
      <div className={cn("grid grid-cols-1 gap-3", items.length > 1 && "md:grid-cols-2", items.length > 2 && "xl:grid-cols-3")}>
        {items.map((c) => (
          <Card key={c.channel.id} className="overflow-hidden">
            <div className="h-1" style={{ background: colorOf(c) }} />
            <div className="p-4">
              <p className="truncate text-sm font-semibold text-ink">{name(c)}</p>
              <ol className="mt-3 space-y-2">
                {c.recentVideos.slice(0, 5).map((v) => (
                  <li key={v.id} className="flex items-baseline justify-between gap-3 text-[12.5px]">
                    <a href={`https://www.youtube.com/watch?v=${v.id}`} target="_blank" rel="noopener noreferrer" className="line-clamp-1 text-ink-2 hover:text-accent">
                      {v.title}
                    </a>
                    <span className="num shrink-0 text-muted">{formatCompact(v.viewCount)}</span>
                  </li>
                ))}
              </ol>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
