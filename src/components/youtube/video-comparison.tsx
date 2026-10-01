"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Loader2, Plus, X } from "lucide-react";
import { ErrorState, EmptyState, LoadingState, MockDataBanner } from "@/components/tool/states";
import { SectionHeading } from "@/components/tool/metric";
import { ChartCard, DataTable } from "@/components/charts/chart-card";
import { ComparisonBarChart, SERIES_COLORS } from "@/components/charts/charts";
import { VideoThumb } from "@/components/youtube/video-table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/primitives";
import { apiGet, errorMessage, errorTitle } from "@/lib/client-api";
import { commentRate, engagementRate, likeRate, viewsPerDay } from "@/lib/metrics";
import { parseVideoInput } from "@/lib/youtube/parse";
import type { DataSource, VideoInfo } from "@/lib/youtube/types";
import { cn, formatCompact, formatDate, formatDuration, formatNumber, formatPercent } from "@/lib/utils";

const MAX_VIDEOS = SERIES_COLORS.length;

type Result = { videos: VideoInfo[]; invalid: string[]; notFound: string[] };

export function VideoComparison() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const initialIds = (params.get("v") ?? "").split(",").filter(Boolean).slice(0, MAX_VIDEOS);
  const [inputs, setInputs] = useState<string[]>(initialIds.length >= 2 ? initialIds : ["", ""]);
  const [state, setState] = useState<
    | { status: "idle" }
    | { status: "loading" }
    | { status: "error"; error: unknown }
    | { status: "done"; result: Result; source: DataSource; fetchedAt: string }
  >({ status: "idle" });
  const started = useRef(false);

  const compare = useCallback(
    async (list: string[]) => {
      const clean = list.map((s) => s.trim()).filter(Boolean);
      setState({ status: "loading" });
      const ids = clean.map((s) => parseVideoInput(s)?.id ?? s);
      router.replace(`${pathname}?v=${ids.map(encodeURIComponent).join(",")}`, { scroll: false });
      try {
        const res = await apiGet<Result>(`/api/youtube/video?ids=${encodeURIComponent(clean.join(","))}`);
        setState({ status: "done", result: res.data, source: res.source, fetchedAt: res.fetchedAt });
      } catch (error) {
        setState({ status: "error", error });
      }
    },
    [pathname, router],
  );

  useEffect(() => {
    if (!started.current && initialIds.length >= 2) {
      started.current = true;
      void compare(initialIds);
    }
  }, [initialIds, compare]);

  const parsed = inputs.map((v) => (v.trim() ? parseVideoInput(v) : null));
  const validCount = parsed.filter(Boolean).length;

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (validCount >= 2) void compare(inputs);
  }

  return (
    <div className="space-y-10">
      <form onSubmit={onSubmit} className="rounded-[20px] border border-line bg-surface p-4 shadow-raised sm:p-5">
        <ol className="space-y-2">
          {inputs.map((value, i) => {
            const invalid = value.trim() !== "" && !parsed[i];
            return (
              <li key={i} className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: SERIES_COLORS[i] }} aria-hidden />
                <label htmlFor={`video-${i}`} className="sr-only">
                  Video {i + 1} URL or ID
                </label>
                <input
                  id={`video-${i}`}
                  value={value}
                  onChange={(e) => setInputs((arr) => arr.map((v, j) => (j === i ? e.target.value : v)))}
                  placeholder={`Video ${i + 1} — youtube.com/watch?v=…, youtu.be/…, Shorts link or ID`}
                  aria-invalid={invalid}
                  aria-describedby={invalid ? `video-${i}-err` : undefined}
                  spellCheck={false}
                  className={cn(
                    "h-11 min-w-0 flex-1 rounded-xl border bg-surface px-3.5 text-[14.5px] text-ink outline-none placeholder:text-faint focus:ring-4 focus:ring-ink/5",
                    invalid ? "border-danger/60" : "border-line focus:border-ink/30",
                  )}
                />
                {inputs.length > 2 ? (
                  <button
                    type="button"
                    onClick={() => setInputs((arr) => arr.filter((_, j) => j !== i))}
                    aria-label={`Remove video ${i + 1}`}
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted hover:bg-bg-subtle hover:text-ink"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : null}
                {invalid ? (
                  <span id={`video-${i}-err`} className="sr-only">
                    Not a recognized YouTube video URL
                  </span>
                ) : null}
              </li>
            );
          })}
        </ol>
        <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => setInputs((arr) => [...arr, ""])}
            disabled={inputs.length >= MAX_VIDEOS}
            className="inline-flex h-9 items-center gap-1.5 self-start rounded-full px-3 text-[13px] font-medium text-muted transition-colors hover:bg-bg-subtle hover:text-ink disabled:opacity-40"
          >
            <Plus className="h-4 w-4" /> Add video {inputs.length >= MAX_VIDEOS ? `(max ${MAX_VIDEOS})` : ""}
          </button>
          <Button type="submit" disabled={validCount < 2 || state.status === "loading"} size="lg">
            {state.status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Compare {validCount >= 2 ? `${validCount} videos` : "videos"}
          </Button>
        </div>
        {parsed.some((p, i) => inputs[i].trim() && !p) ? (
          <p className="mt-3 text-xs text-danger">Some entries aren&apos;t recognized as YouTube video links. They&apos;re highlighted above.</p>
        ) : null}
      </form>

      {state.status === "idle" ? (
        <EmptyState title="Add two or more videos" description="Paste any mix of watch, youtu.be, Shorts or embed links. Results appear side by side." />
      ) : null}
      {state.status === "loading" ? <LoadingState label="Fetching public video statistics…" /> : null}
      {state.status === "error" ? <ErrorState title={errorTitle(state.error)} description={errorMessage(state.error)} /> : null}
      {state.status === "done" ? <ComparisonResults {...state} /> : null}
    </div>
  );
}

function ComparisonResults({ result, source, fetchedAt }: { result: Result; source: DataSource; fetchedAt: string }) {
  const now = useMemo(() => new Date(fetchedAt).getTime(), [fetchedAt]);
  const { videos } = result;
  const colored = videos.map((v, i) => ({ v, color: SERIES_COLORS[i] }));
  const short = (t: string) => (t.length > 42 ? `${t.slice(0, 40)}…` : t);

  if (videos.length === 0) {
    return (
      <ErrorState
        title="No videos found"
        description="None of those videos could be found. They may be private, deleted or age-restricted."
      />
    );
  }

  const metrics: { key: string; label: string; get: (v: VideoInfo) => number | null; fmt: (n: number) => string }[] = [
    { key: "views", label: "Views", get: (v) => v.viewCount, fmt: (n) => formatNumber(n) },
    { key: "vpd", label: "Views per day", get: (v) => viewsPerDay(v, now), fmt: (n) => formatNumber(n) },
    { key: "likes", label: "Likes", get: (v) => v.likeCount, fmt: (n) => formatNumber(n) },
    { key: "comments", label: "Comments", get: (v) => v.commentCount, fmt: (n) => formatNumber(n) },
    { key: "likeRate", label: "Like rate", get: likeRate, fmt: (n) => formatPercent(n) },
    { key: "commentRate", label: "Comment rate", get: commentRate, fmt: (n) => formatPercent(n, 3) },
    { key: "engagement", label: "Engagement rate", get: engagementRate, fmt: (n) => formatPercent(n) },
  ];

  return (
    <div className="animate-fade-up space-y-10">
      {source === "mock" ? <MockDataBanner /> : null}
      {result.invalid.length || result.notFound.length ? (
        <ErrorState
          title="Some videos were skipped"
          description={[
            result.invalid.length ? `Not recognized as YouTube links: ${result.invalid.join(", ")}.` : "",
            result.notFound.length ? `Not found (private, deleted or unavailable): ${result.notFound.join(", ")}.` : "",
          ]
            .filter(Boolean)
            .join(" ")}
        />
      ) : null}

      <section aria-labelledby="side-h">
        <SectionHeading id="side-h" title="Side by side" description="Public statistics at the time of fetching." />
        <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:px-0 lg:grid-cols-[repeat(auto-fit,minmax(220px,1fr))]">
          {colored.map(({ v, color }) => (
            <Card key={v.id} className="w-[78vw] max-w-[320px] shrink-0 snap-start overflow-hidden sm:w-auto sm:max-w-none">
              <div className="h-1" style={{ background: color }} />
              <div className="p-4">
                <a href={`https://www.youtube.com/watch?v=${v.id}`} target="_blank" rel="noopener noreferrer" className="block">
                  <VideoThumb video={v} width={400} />
                  <p className="mt-3 line-clamp-2 text-[14px] leading-snug font-semibold text-ink hover:text-accent">{v.title}</p>
                </a>
                <p className="mt-1 truncate text-xs text-muted">{v.channelTitle}</p>
                <dl className="num mt-4 grid grid-cols-2 gap-x-3 gap-y-2.5 text-[12.5px]">
                  {[
                    ["Published", formatDate(v.publishedAt)],
                    ["Duration", formatDuration(v.durationSeconds)],
                    ["Views", formatCompact(v.viewCount)],
                    ["Views/day", formatCompact(viewsPerDay(v, now))],
                    ["Likes", v.likeCount === null ? "Hidden" : formatCompact(v.likeCount)],
                    ["Comments", v.commentCount === null ? "Off" : formatCompact(v.commentCount)],
                    ["Like rate", formatPercent(likeRate(v))],
                    ["Engagement", formatPercent(engagementRate(v))],
                  ].map(([k, val]) => (
                    <div key={k}>
                      <dt className="text-muted">{k}</dt>
                      <dd className="font-medium text-ink">{val}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section aria-labelledby="charts-h">
        <SectionHeading id="charts-h" title="Comparison" description="Bars share a scale within each chart. Colors match the list above." />
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {metrics
            .filter((m) => ["views", "vpd", "likeRate", "commentRate"].includes(m.key))
            .map((m) => (
              <ChartCard
                key={m.key}
                title={m.label}
                table={
                  <DataTable
                    columns={["Video", m.label]}
                    rows={colored.map(({ v }) => [short(v.title), m.get(v) === null ? "—" : m.fmt(m.get(v) as number)])}
                  />
                }
              >
                <ComparisonBarChart
                  data={colored.map(({ v, color }) => ({ label: short(v.title), value: m.get(v), color }))}
                  valueFormatter={m.fmt}
                />
              </ChartCard>
            ))}
        </div>
      </section>

      <section aria-labelledby="table-h">
        <SectionHeading id="table-h" title="Detailed comparison" />
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-[13px]">
            <thead>
              <tr className="border-b border-line">
                <th scope="col" className="p-3 font-medium text-muted">
                  Metric
                </th>
                {colored.map(({ v, color }) => (
                  <th key={v.id} scope="col" className="p-3 text-right font-medium text-ink">
                    <span className="inline-flex max-w-44 items-center gap-1.5">
                      <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: color }} aria-hidden />
                      <span className="truncate">{v.title}</span>
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {[
                { label: "Channel", cells: videos.map((v) => v.channelTitle) },
                { label: "Published", cells: videos.map((v) => formatDate(v.publishedAt)) },
                { label: "Duration", cells: videos.map((v) => formatDuration(v.durationSeconds)) },
                ...metrics.map((m) => ({ label: m.label, cells: videos.map((v) => (m.get(v) === null ? "—" : m.fmt(m.get(v) as number))) })),
              ].map((row) => (
                <tr key={row.label}>
                  <th scope="row" className="p-3 font-normal text-muted">
                    {row.label}
                  </th>
                  {row.cells.map((c, i) => (
                    <td key={i} className="num max-w-44 truncate p-3 text-right text-ink">
                      {c}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
        <p className="mt-3 text-xs text-muted">
          Views per day = views ÷ days since publishing (min. 1). Engagement rate = (likes + comments) ÷ views × 100. Calculated by
          OnlineToolPro; not official YouTube metrics.
        </p>
      </section>
    </div>
  );
}
