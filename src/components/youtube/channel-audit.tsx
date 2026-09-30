"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AtSign, EyeOff, Info } from "lucide-react";
import { UrlInput } from "@/components/tool/url-input";
import { ErrorState, EmptyState, LoadingState, MockDataBanner } from "@/components/tool/states";
import { MetricCard, MetricGrid, SectionHeading } from "@/components/tool/metric";
import { ChannelHeader } from "@/components/youtube/channel-header";
import { VideoTable } from "@/components/youtube/video-table";
import { ChartCard, DataTable } from "@/components/charts/chart-card";
import { SimpleBarChart } from "@/components/charts/charts";
import { ButtonLink } from "@/components/ui/button";
import { Badge, Card } from "@/components/ui/primitives";
import { apiPost, errorMessage, errorTitle } from "@/lib/client-api";
import type { PerformanceSummary, PublishingActivity } from "@/lib/metrics";
import { viewsPerDay } from "@/lib/metrics";
import type { ChannelInfo, DataSource, VideoInfo } from "@/lib/youtube/types";
import { formatCompact, formatDate, formatDuration, formatNumber, formatPercent } from "@/lib/utils";

type AuditResult = {
  auditId: string | null;
  channel: ChannelInfo;
  videos: VideoInfo[];
  activity: PublishingActivity;
  performance: PerformanceSummary;
};

const EXAMPLES = [
  { label: "@veritasium", value: "@veritasium" },
  { label: "@mkbhd", value: "@mkbhd" },
  { label: "youtube.com/@TED", value: "https://www.youtube.com/@TED" },
];

export function ChannelAudit() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const initial = params.get("channel") ?? "";
  const [input, setInput] = useState(initial);
  const [state, setState] = useState<
    | { status: "idle" }
    | { status: "loading"; query: string }
    | { status: "error"; error: unknown }
    | { status: "done"; result: AuditResult; source: DataSource; fetchedAt: string }
  >({ status: "idle" });
  const ran = useRef<string | null>(null);

  const run = useCallback(
    async (q: string) => {
      ran.current = q;
      setState({ status: "loading", query: q });
      router.replace(`${pathname}?channel=${encodeURIComponent(q)}`, { scroll: false });
      try {
        const res = await apiPost<AuditResult>("/api/audit", { channel: q, videos: 30 });
        if (ran.current === q) setState({ status: "done", result: res.data, source: res.source, fetchedAt: res.fetchedAt });
      } catch (error) {
        if (ran.current === q) setState({ status: "error", error });
      }
    },
    [pathname, router],
  );

  // Auto-run for shared links (?channel=…)
  useEffect(() => {
    if (initial && ran.current === null) void run(initial);
  }, [initial, run]);

  return (
    <div className="space-y-10">
      <UrlInput
        label="YouTube channel URL, @handle or channel ID"
        placeholder="Paste a channel URL, @handle or channel ID"
        value={input}
        onChange={setInput}
        onSubmit={run}
        loading={state.status === "loading"}
        icon={<AtSign className="h-4 w-4" />}
        submitLabel="Audit channel"
        examples={EXAMPLES}
        hint="Public data only · no sign-in"
      />

      {state.status === "idle" ? (
        <EmptyState
          title="Audit any public channel"
          description="You'll get an overview, the 30 most recent uploads, publishing cadence and descriptive performance statistics."
        />
      ) : null}
      {state.status === "loading" ? <LoadingState label="Fetching public channel data and recent uploads…" rows={6} /> : null}
      {state.status === "error" ? <ErrorState title={errorTitle(state.error)} description={errorMessage(state.error)} /> : null}
      {state.status === "done" ? <AuditReport result={state.result} source={state.source} fetchedAt={state.fetchedAt} /> : null}
    </div>
  );
}

function AuditReport({ result, source, fetchedAt }: { result: AuditResult; source: DataSource; fetchedAt: string }) {
  const { channel, videos, activity: act, performance: perf } = result;
  const now = useMemo(() => new Date(fetchedAt).getTime(), [fetchedAt]);
  const chrono = useMemo(() => [...videos].sort((a, b) => a.publishedAt.localeCompare(b.publishedAt)), [videos]);
  const observations = useMemo(() => buildObservations(result, now), [result, now]);

  const weekly = useMemo(() => uploadsPerWeek(videos, now, 12), [videos, now]);

  return (
    <div className="animate-fade-up space-y-12">
      {source === "mock" ? <MockDataBanner /> : null}

      {/* Overview */}
      <section aria-labelledby="overview-h" className="space-y-5">
        <Card className="p-5 sm:p-7">
          <ChannelHeader
            channel={channel}
            actions={
              <ButtonLink href={`/youtube-tools/channel-tracker?add=${encodeURIComponent(channel.id)}`} size="sm" variant="secondary">
                Track this channel
              </ButtonLink>
            }
          />
        </Card>
        <h2 id="overview-h" className="sr-only">
          Channel overview
        </h2>
        <MetricGrid>
          <MetricCard
            label="Subscribers"
            value={channel.subscriberCount === null ? <span className="inline-flex items-center gap-2 text-xl text-muted"><EyeOff className="h-4 w-4" />Hidden</span> : formatCompact(channel.subscriberCount)}
            sub={channel.subscriberCount === null ? "The channel hides its subscriber count." : `${formatNumber(channel.subscriberCount)} · rounded by YouTube`}
            hint="YouTube rounds public subscriber counts to three significant figures."
          />
          <MetricCard label="Total views" value={formatCompact(channel.viewCount)} sub={formatNumber(channel.viewCount)} />
          <MetricCard label="Videos" value={formatNumber(channel.videoCount)} sub="Public uploads" />
          <MetricCard
            label="Channel age"
            value={formatNumber(Math.floor((now - new Date(channel.publishedAt).getTime()) / (365.25 * 86_400_000)))}
            unit="years"
            sub={`Created ${formatDate(channel.publishedAt)}`}
          />
        </MetricGrid>
      </section>

      {videos.length === 0 ? (
        <EmptyState title="No public uploads found" description="This channel has no public videos, so there's no recent activity to analyze." />
      ) : (
        <>
          {/* Publishing activity */}
          <section aria-labelledby="activity-h">
            <SectionHeading
              id="activity-h"
              title="Publishing activity"
              description={`Calculated from the ${videos.length} most recent public uploads.`}
            />
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
              <MetricGrid cols={2} className="content-start">
                <MetricCard label="Last 7 days" value={act.last7Days} unit={act.last7Days === 1 ? "upload" : "uploads"} />
                <MetricCard label="Last 30 days" value={act.last30Days} unit={act.last30Days === 1 ? "upload" : "uploads"} />
                <MetricCard
                  label="Average per week"
                  value={act.perWeek === null ? "—" : act.perWeek.toFixed(1)}
                  hint="Number of analyzed uploads divided by the weeks between the oldest analyzed upload and today."
                  sub={act.windowDays ? `Over ${Math.round(act.windowDays)} days` : undefined}
                />
                <MetricCard
                  label="Average length"
                  value={formatDuration(act.averageLengthSeconds)}
                  sub={act.shortsShare !== null ? `${formatPercent(act.shortsShare * 100, 0)} are ≤ 60 s (likely Shorts)` : undefined}
                />
              </MetricGrid>
              <ChartCard
                title="Uploads per week"
                description="Last 12 weeks, from analyzed uploads."
                table={<DataTable columns={["Week starting", "Uploads"]} rows={weekly.map((w) => [w.label, w.count])} />}
              >
                <SimpleBarChart data={weekly} dataKey="count" label="Uploads" xKey="label" valueFormatter={(v) => String(v)} height={220} />
              </ChartCard>
            </div>
          </section>

          {/* Performance */}
          <section aria-labelledby="perf-h">
            <SectionHeading
              id="perf-h"
              title="Recent video performance"
              description="Descriptive statistics calculated by OnlineToolPro from public counts — not official YouTube metrics."
            />
            <MetricGrid cols={5}>
              <MetricCard label="Average views" value={formatCompact(perf.averageViews)} sub={formatNumber(perf.averageViews)} />
              <MetricCard
                label="Median views"
                value={formatCompact(perf.medianViews)}
                hint="The middle value when videos are sorted by views. Less affected by one unusually popular video than the average."
                sub={formatNumber(perf.medianViews)}
              />
              <MetricCard
                label="Average likes"
                value={formatCompact(perf.averageLikes)}
                sub={perf.likesHiddenCount ? `${perf.likesHiddenCount} with hidden likes excluded` : `Like rate ${formatPercent(perf.averageLikeRate)}`}
              />
              <MetricCard
                label="Average comments"
                value={formatCompact(perf.averageComments)}
                sub={
                  perf.commentsDisabledCount
                    ? `${perf.commentsDisabledCount} with comments off excluded`
                    : `Comment rate ${formatPercent(perf.averageCommentRate, 3)}`
                }
              />
              <MetricCard
                label="Median views per day"
                value={formatCompact(perf.medianViewsPerDay)}
                hint="Views divided by days since publishing (minimum one day), per video, then the median."
                sub={`Average ${formatCompact(perf.averageViewsPerDay)}`}
              />
            </MetricGrid>

            <ChartCard
              className="mt-3"
              title="Views per video"
              description="Oldest to newest. Newer videos have had less time to collect views."
              table={
                <DataTable
                  columns={["Video", "Published", "Views", "Views/day"]}
                  rows={chrono.map((v) => [v.title, formatDate(v.publishedAt), formatNumber(v.viewCount), formatNumber(viewsPerDay(v, now))])}
                />
              }
            >
              <SimpleBarChart
                data={chrono.map((v) => ({ id: v.id, date: formatDate(v.publishedAt, { month: "short", day: "numeric" }), views: v.viewCount, title: v.title }))}
                dataKey="views"
                label="Views"
                xKey="date"
                tooltipLabel={(row) => String(row.title)}
                height={260}
              />
            </ChartCard>
          </section>

          {/* Videos */}
          <section aria-labelledby="videos-h">
            <SectionHeading id="videos-h" title="Recent videos" description="Click a column to sort. Links open on YouTube." />
            <Card className="p-3 sm:p-5">
              <VideoTable videos={videos} now={now} />
            </Card>
          </section>

          {/* Detailed audit */}
          <section aria-labelledby="audit-h">
            <SectionHeading id="audit-h" title="Detailed audit" description="Factual observations from the data above. No judgement, no predictions." />
            <Card className="divide-y divide-line">
              {observations.map((o) => (
                <div key={o.title} className="flex gap-3 p-4 sm:p-5">
                  <Info aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
                  <div>
                    <p className="text-[14px] font-medium text-ink">
                      {o.title} {o.tag ? <Badge className="ml-1 align-middle">{o.tag}</Badge> : null}
                    </p>
                    <p className="mt-0.5 text-[13.5px] leading-relaxed text-muted">{o.body}</p>
                  </div>
                </div>
              ))}
            </Card>
          </section>
        </>
      )}

      <p className="text-xs text-muted">
        Data fetched {formatDate(fetchedAt, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })} from the YouTube Data API.
        Want to see how these numbers change? <Link href={`/youtube-tools/channel-tracker?add=${encodeURIComponent(channel.id)}`} className="text-ink underline underline-offset-4">Track this channel</Link>.
      </p>
    </div>
  );
}

function uploadsPerWeek(videos: VideoInfo[], now: number, weeks: number) {
  const WEEK = 7 * 86_400_000;
  const buckets = Array.from({ length: weeks }, (_, i) => {
    const start = now - (weeks - i) * WEEK;
    return { start, label: formatDate(new Date(start), { month: "short", day: "numeric" }), count: 0 };
  });
  for (const v of videos) {
    const t = new Date(v.publishedAt).getTime();
    const idx = weeks - 1 - Math.floor((now - t) / WEEK);
    if (idx >= 0 && idx < weeks) buckets[idx].count++;
  }
  return buckets;
}

function buildObservations({ videos, activity, performance, channel }: AuditResult, now: number) {
  const out: { title: string; body: string; tag?: string }[] = [];
  const viewed = videos.filter((v) => v.viewCount !== null);
  if (performance.averageViews && performance.medianViews) {
    const ratio = performance.medianViews / performance.averageViews;
    out.push({
      title: "Views distribution",
      body:
        ratio < 0.6
          ? `The median (${formatCompact(performance.medianViews)}) is ${Math.round(ratio * 100)}% of the average (${formatCompact(performance.averageViews)}), so a small number of videos account for a large share of recent views.`
          : `The median (${formatCompact(performance.medianViews)}) is close to the average (${formatCompact(performance.averageViews)}), so recent views are spread fairly evenly across videos.`,
    });
  }
  const top = [...viewed].sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0))[0];
  const total = viewed.reduce((s, v) => s + (v.viewCount ?? 0), 0);
  if (top && total > 0 && viewed.length > 2) {
    out.push({
      title: "Most-viewed recent upload",
      body: `“${top.title}” has ${formatNumber(top.viewCount)} views — ${Math.round(((top.viewCount ?? 0) / total) * 100)}% of all views across the ${viewed.length} analyzed videos.`,
    });
  }
  const latest = [...videos].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))[0];
  if (latest) {
    const days = Math.floor((now - new Date(latest.publishedAt).getTime()) / 86_400_000);
    out.push({ title: "Most recent upload", body: `${days === 0 ? "Today" : `${days} day${days === 1 ? "" : "s"} ago`}: “${latest.title}”.` });
  }
  if (activity.medianGapDays !== null) {
    out.push({
      title: "Typical gap between uploads",
      body: `The median time between consecutive analyzed uploads is ${activity.medianGapDays < 1 ? "under a day" : `${activity.medianGapDays.toFixed(1)} days`}.`,
    });
  }
  if (activity.shortsShare !== null && activity.shortsShare > 0) {
    out.push({
      title: "Short-form share",
      tag: "Approximate",
      body: `${Math.round(activity.shortsShare * 100)}% of analyzed uploads are 60 seconds or shorter. The API doesn't label Shorts directly, so duration is used as a proxy.`,
    });
  }
  if (performance.likesHiddenCount || performance.commentsDisabledCount) {
    out.push({
      title: "Hidden or disabled counts",
      body: `${performance.likesHiddenCount} video(s) hide likes and ${performance.commentsDisabledCount} have comments turned off. They're excluded from the related averages.`,
    });
  }
  if (channel.subscriberCount && performance.medianViews) {
    out.push({
      title: "Median views relative to subscribers",
      tag: "Descriptive",
      body: `Median recent views equal ${formatPercent((performance.medianViews / channel.subscriberCount) * 100, 1)} of the public subscriber count. Subscribers aren't the only viewers, so this ratio is context, not a performance score.`,
    });
  }
  return out;
}
