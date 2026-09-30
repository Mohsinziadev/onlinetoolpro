"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AtSign, History, Loader2, RefreshCw, Trash2 } from "lucide-react";
import { UrlInput } from "@/components/tool/url-input";
import { EmptyState, ErrorState, LoadingState, MockDataBanner } from "@/components/tool/states";
import { MetricCard, MetricGrid, SectionHeading } from "@/components/tool/metric";
import { ChartCard, DataTable } from "@/components/charts/chart-card";
import { TimeSeriesChart } from "@/components/charts/charts";
import { ChannelAvatar, ChannelHeader } from "@/components/youtube/channel-header";
import { Segmented } from "@/components/ui/segmented";
import { Badge, Card } from "@/components/ui/primitives";
import { apiDelete, apiGet, apiPost, errorMessage, errorTitle } from "@/lib/client-api";
import type { ChannelInfo, DataSource } from "@/lib/youtube/types";
import { cn, formatCompact, formatDate, formatNumber, formatRelative } from "@/lib/utils";

type Snapshot = { capturedAt: string; subscriberCount: number | null; viewCount: number; videoCount: number };
type Tracked = { channel: ChannelInfo; trackedSince: string; lastFetchedAt: string; snapshots: Snapshot[] };
type Range = "7" | "30" | "90";

const RANGES = [
  { value: "7", label: "7 days" },
  { value: "30", label: "30 days" },
  { value: "90", label: "90 days" },
] as const;

export function ChannelTracker() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [list, setList] = useState<Tracked[] | null>(null);
  const [source, setSource] = useState<DataSource>("youtube");
  const [loadError, setLoadError] = useState<unknown>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<unknown>(null);
  const autoAdded = useRef(false);

  const load = useCallback(async (select?: string) => {
    try {
      const res = await apiGet<{ channels: Tracked[] }>("/api/tracker");
      setList(res.data.channels);
      setSource(res.source);
      setLoadError(null);
      setSelected((cur) => select ?? (cur && res.data.channels.some((c) => c.channel.id === cur) ? cur : (res.data.channels[0]?.channel.id ?? null)));
    } catch (err) {
      setLoadError(err);
      setList([]);
    }
  }, []);

  const add = useCallback(
    async (q: string) => {
      setAdding(true);
      setAddError(null);
      try {
        const res = await apiPost<{ channelId: string }>("/api/tracker", { channel: q });
        setInput("");
        await load(res.data.channelId);
      } catch (err) {
        setAddError(err);
      } finally {
        setAdding(false);
      }
    },
    [load],
  );

  useEffect(() => {
    const toAdd = params.get("add");
    if (toAdd && !autoAdded.current) {
      autoAdded.current = true;
      router.replace(pathname, { scroll: false });
      void add(toAdd);
    } else {
      void load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount
  }, []);

  async function remove(id: string) {
    try {
      await apiDelete(`/api/tracker/${id}`);
      await load();
    } catch (err) {
      setAddError(err);
    }
  }

  const current = list?.find((t) => t.channel.id === selected) ?? null;

  return (
    <div className="space-y-8">
      <UrlInput
        label="Channel to track"
        placeholder="Add a channel to track — URL, @handle or channel ID"
        value={input}
        onChange={setInput}
        onSubmit={add}
        loading={adding}
        submitLabel="Track channel"
        icon={<AtSign className="h-4 w-4" />}
        hint="Saved to this browser · up to 20 channels"
      />
      {addError ? <ErrorState title={errorTitle(addError)} description={errorMessage(addError)} /> : null}
      {source === "mock" && list?.length ? <MockDataBanner /> : null}

      {list === null ? (
        <LoadingState label="Loading your tracked channels…" />
      ) : loadError ? (
        <ErrorState title={errorTitle(loadError)} description={errorMessage(loadError)} />
      ) : list.length === 0 ? (
        <EmptyState
          icon={<History className="h-5 w-5" strokeWidth={1.75} />}
          title="No channels tracked yet"
          description="Add a public channel above. We'll store a snapshot of its subscribers, views and video count now, and more over time, so you can see real history."
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          <nav aria-label="Tracked channels" className="lg:sticky lg:top-24 lg:self-start">
            <p className="eyebrow mb-2 hidden lg:block">Tracked · {list.length}</p>
            <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] lg:mx-0 lg:flex-col lg:gap-1 lg:overflow-visible lg:px-0">
              {list.map((t) => (
                <li key={t.channel.id} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => setSelected(t.channel.id)}
                    aria-current={t.channel.id === selected ? "true" : undefined}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left transition-colors lg:border-transparent",
                      t.channel.id === selected ? "border-line bg-surface shadow-card lg:border-line" : "border-line hover:bg-bg-subtle",
                    )}
                  >
                    <ChannelAvatar channel={t.channel} size={32} />
                    <span className="min-w-0">
                      <span className="block max-w-40 truncate text-[13.5px] font-medium text-ink">{t.channel.title}</span>
                      <span className="block text-[11.5px] text-muted">
                        {t.snapshots.length} snapshot{t.snapshots.length === 1 ? "" : "s"}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
          {current ? <TrackerDashboard key={current.channel.id} tracked={current} onRemove={remove} onRefreshed={() => load(current.channel.id)} /> : null}
        </div>
      )}
    </div>
  );
}

type Metric = "subscriberCount" | "viewCount" | "videoCount";

function change(points: Snapshot[], key: Metric): { delta: number; days: number } | null {
  const valid = points.filter((p) => p[key] !== null);
  if (valid.length < 2) return null;
  const first = valid[0];
  const last = valid[valid.length - 1];
  const days = (new Date(last.capturedAt).getTime() - new Date(first.capturedAt).getTime()) / 86_400_000;
  return { delta: (last[key] as number) - (first[key] as number), days };
}

function TrackerDashboard({ tracked, onRemove, onRefreshed }: { tracked: Tracked; onRemove: (id: string) => void; onRefreshed: () => void }) {
  const [range, setRange] = useState<Range>("30");
  const [refreshing, setRefreshing] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const { channel, snapshots } = tracked;

  // Ranges are measured back from the most recent stored snapshot.
  const inRange = useMemo(() => {
    const last = snapshots.length ? new Date(snapshots[snapshots.length - 1].capturedAt).getTime() : 0;
    const since = last - Number(range) * 86_400_000;
    return snapshots.filter((s) => new Date(s.capturedAt).getTime() >= since);
  }, [snapshots, range]);
  const hasHistory = inRange.length >= 2;
  const latest = snapshots[snapshots.length - 1];

  async function refresh() {
    setRefreshing(true);
    setNotice(null);
    try {
      const res = await apiPost<{ written: boolean; message: string }>(`/api/tracker/${channel.id}/snapshot`, {});
      setNotice(res.data.message);
      if (res.data.written) onRefreshed();
    } catch (err) {
      setNotice(errorMessage(err));
    } finally {
      setRefreshing(false);
    }
  }

  const chartData = (key: Metric) =>
    inRange.filter((s) => s[key] !== null).map((s) => ({ t: new Date(s.capturedAt).getTime(), [key]: s[key] }));

  const deltaSub = (key: Metric) => {
    const c = change(inRange, key);
    if (!c) return "Change appears after a second snapshot in this range.";
    const sign = c.delta > 0 ? "+" : c.delta < 0 ? "−" : "±";
    return `${sign}${formatNumber(Math.abs(c.delta))} over ${c.days < 1 ? "<1" : Math.round(c.days)} day${Math.round(c.days) === 1 ? "" : "s"} of snapshots`;
  };

  return (
    <div className="min-w-0 animate-fade-in space-y-8">
      <Card className="p-5 sm:p-6">
        <ChannelHeader
          channel={channel}
          actions={
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={refresh}
                disabled={refreshing}
                className="inline-flex h-8 items-center gap-1.5 rounded-full border border-line px-3 text-xs font-medium text-ink transition-colors hover:bg-bg-subtle disabled:opacity-50"
              >
                {refreshing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                Snapshot now
              </button>
              {confirmRemove ? (
                <span className="inline-flex items-center gap-1">
                  <button type="button" onClick={() => onRemove(channel.id)} className="h-8 rounded-full bg-danger px-3 text-xs font-medium text-white">
                    Remove
                  </button>
                  <button type="button" onClick={() => setConfirmRemove(false)} className="h-8 rounded-full px-2 text-xs text-muted hover:text-ink">
                    Cancel
                  </button>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmRemove(true)}
                  aria-label={`Stop tracking ${channel.title}`}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-danger-soft hover:text-danger"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          }
        />
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-4 text-xs text-muted">
          <Badge>Tracking since {formatDate(tracked.trackedSince)}</Badge>
          {latest ? <Badge>Last snapshot {formatRelative(latest.capturedAt)}</Badge> : null}
          <Badge>{snapshots.length} snapshot{snapshots.length === 1 ? "" : "s"} stored (90 days)</Badge>
          {notice ? <span role="status" className="text-ink-2">{notice}</span> : null}
        </div>
      </Card>

      <section aria-labelledby="hist-h">
        <SectionHeading
          id="hist-h"
          title="History"
          description="Only real snapshots are shown. Points are connected; nothing between them is estimated."
          action={<Segmented label="Date range" value={range} onChange={setRange} options={RANGES} size="sm" />}
        />
        <MetricGrid cols={3}>
          <MetricCard
            label="Subscribers"
            value={latest?.subscriberCount === null || latest === undefined ? "Hidden" : formatCompact(latest.subscriberCount)}
            sub={latest?.subscriberCount === null ? "The channel hides its subscriber count." : deltaSub("subscriberCount")}
            hint="Public counts are rounded by YouTube, so small changes may not appear."
          />
          <MetricCard label="Total views" value={formatCompact(latest?.viewCount)} sub={deltaSub("viewCount")} />
          <MetricCard label="Videos" value={formatNumber(latest?.videoCount)} sub={deltaSub("videoCount")} />
        </MetricGrid>

        {!hasHistory ? (
          <EmptyState
            className="mt-3"
            icon={<History className="h-5 w-5" strokeWidth={1.75} />}
            title="Historical data will appear after additional snapshots are collected."
            description={`There ${inRange.length === 1 ? "is 1 snapshot" : `are ${inRange.length} snapshots`} in the last ${range} days. Snapshots are captured automatically once a day, and you can take one manually (at most once per hour).`}
          />
        ) : (
          <div className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-2">
            {channel.subscriberCount !== null ? (
              <HistoryChart title="Subscribers" metric="subscriberCount" data={chartData("subscriberCount")} className="xl:col-span-2" />
            ) : null}
            <HistoryChart title="Total views" metric="viewCount" data={chartData("viewCount")} />
            <HistoryChart title="Video count" metric="videoCount" data={chartData("videoCount")} />
          </div>
        )}
      </section>

      <section aria-labelledby="snap-h">
        <SectionHeading id="snap-h" title="Stored snapshots" description={`Every observation in the last ${range} days.`} />
        {inRange.length ? (
          <DataTable
            columns={["Captured", "Subscribers", "Total views", "Videos"]}
            rows={[...inRange].reverse().map((s) => [
              formatDate(s.capturedAt, { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }),
              s.subscriberCount === null ? "Hidden" : formatNumber(s.subscriberCount),
              formatNumber(s.viewCount),
              formatNumber(s.videoCount),
            ])}
          />
        ) : (
          <p className="text-sm text-muted">No snapshots in this range.</p>
        )}
      </section>
    </div>
  );
}

function HistoryChart({ title, metric, data, className }: { title: string; metric: Metric; data: Record<string, number | string | null>[]; className?: string }) {
  return (
    <ChartCard
      className={className}
      title={title}
      description={`${data.length} snapshots`}
      table={
        <DataTable
          columns={["Captured", title]}
          rows={data.map((d) => [formatDate(new Date(Number(d.t)), { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }), formatNumber(d[metric] as number)])}
        />
      }
    >
      <TimeSeriesChart data={data} series={[{ key: metric, label: title, color: "var(--chart-1)" }]} height={metric === "subscriberCount" ? 260 : 200} />
    </ChartCard>
  );
}
