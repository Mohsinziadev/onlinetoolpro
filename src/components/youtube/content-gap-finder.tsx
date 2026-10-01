"use client";

import { useState, type FormEvent } from "react";
import { CircleSlash, Loader2, Plus, X } from "lucide-react";
import { EmptyState, ErrorState, LoadingState, MockDataBanner } from "@/components/tool/states";
import { SectionHeading } from "@/components/tool/metric";
import { ChannelAvatar } from "@/components/youtube/channel-header";
import { SERIES_COLORS } from "@/components/charts/charts";
import { Button } from "@/components/ui/button";
import { Badge, Card } from "@/components/ui/primitives";
import { apiPost, errorMessage, errorTitle } from "@/lib/client-api";
import type { ContentGapResult } from "@/lib/text/content-gap";
import type { ChannelInfo, DataSource } from "@/lib/youtube/types";
import { formatCompact, formatDate } from "@/lib/utils";

const MAX_COMPARISONS = 4;

export function ContentGapFinder() {
  const [target, setTarget] = useState("");
  const [comparisons, setComparisons] = useState<string[]>(["", ""]);
  const [state, setState] = useState<
    | { status: "idle" }
    | { status: "loading" }
    | { status: "error"; error: unknown }
    | { status: "done"; result: ContentGapResult; source: DataSource }
  >({ status: "idle" });

  const filled = comparisons.map((c) => c.trim()).filter(Boolean);
  const canSubmit = target.trim() !== "" && filled.length >= 1 && state.status !== "loading";

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setState({ status: "loading" });
    try {
      const res = await apiPost<ContentGapResult>("/api/content-gap", { target: target.trim(), comparisons: filled });
      setState({ status: "done", result: res.data, source: res.source });
    } catch (error) {
      setState({ status: "error", error });
    }
  }

  const field =
    "h-11 w-full rounded-xl border border-line bg-surface px-3.5 text-[14.5px] text-ink outline-none placeholder:text-faint focus:border-ink/30 focus:ring-4 focus:ring-ink/5";

  return (
    <div className="space-y-10">
      <form onSubmit={onSubmit} className="grid grid-cols-1 gap-5 rounded-[20px] border border-line bg-surface p-4 shadow-raised sm:p-6 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <label htmlFor="gap-target" className="mb-1.5 block text-[13px] font-medium text-ink">
            Your channel
          </label>
          <input id="gap-target" value={target} onChange={(e) => setTarget(e.target.value)} placeholder="@yourhandle or channel URL" className={field} spellCheck={false} />
          <p className="mt-1.5 text-xs text-muted">Topics are checked against this channel&apos;s 50 most recent uploads.</p>
        </div>
        <div>
          <p className="mb-1.5 text-[13px] font-medium text-ink">Comparison channels</p>
          <ol className="space-y-2">
            {comparisons.map((value, i) => (
              <li key={i} className="flex items-center gap-2">
                <label htmlFor={`gap-cmp-${i}`} className="sr-only">
                  Comparison channel {i + 1}
                </label>
                <input
                  id={`gap-cmp-${i}`}
                  value={value}
                  onChange={(e) => setComparisons((arr) => arr.map((v, j) => (j === i ? e.target.value : v)))}
                  placeholder={`Channel ${String.fromCharCode(65 + i)} — @handle or URL`}
                  className={field}
                  spellCheck={false}
                />
                {comparisons.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => setComparisons((arr) => arr.filter((_, j) => j !== i))}
                    aria-label={`Remove comparison channel ${i + 1}`}
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted hover:bg-bg-subtle hover:text-ink"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : null}
              </li>
            ))}
          </ol>
          <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => setComparisons((arr) => [...arr, ""])}
              disabled={comparisons.length >= MAX_COMPARISONS}
              className="inline-flex h-9 items-center gap-1.5 self-start rounded-full px-3 text-[13px] font-medium text-muted transition-colors hover:bg-bg-subtle hover:text-ink disabled:opacity-40"
            >
              <Plus className="h-4 w-4" /> Add channel
            </button>
            <Button type="submit" size="lg" disabled={!canSubmit}>
              {state.status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Find content gaps
            </Button>
          </div>
        </div>
      </form>

      {state.status === "idle" ? (
        <EmptyState
          title="Compare recent title topics"
          description="Enter your channel and one to four channels in your niche. You'll see topics they cover repeatedly that haven't appeared in your recent titles — with the exact videos behind each one."
        />
      ) : null}
      {state.status === "loading" ? <LoadingState label="Reading recent uploads from each channel…" /> : null}
      {state.status === "error" ? <ErrorState title={errorTitle(state.error)} description={errorMessage(state.error)} /> : null}
      {state.status === "done" ? <GapResults result={state.result} source={state.source} /> : null}
    </div>
  );
}

function GapResults({ result, source }: { result: ContentGapResult; source: DataSource }) {
  const byId = new Map<string, { channel: ChannelInfo; color: string; label: string }>(
    result.comparisons.map((c, i) => [c.channel.id, { channel: c.channel, color: SERIES_COLORS[(i + 1) % SERIES_COLORS.length], label: String.fromCharCode(65 + i) }]),
  );
  const t = result.target;

  return (
    <div className="animate-fade-up space-y-10">
      {source === "mock" ? <MockDataBanner /> : null}

      <section aria-labelledby="scope-h">
        <SectionHeading id="scope-h" title="What was analyzed" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <ChannelChip channel={t.channel} color={SERIES_COLORS[0]} label="Your channel" videos={t.videosAnalyzed} />
          {result.comparisons.map((c) => {
            const meta = byId.get(c.channel.id);
            return <ChannelChip key={c.channel.id} channel={c.channel} color={meta?.color ?? SERIES_COLORS[1]} label={`Channel ${meta?.label}`} videos={c.videosAnalyzed} />;
          })}
        </div>
      </section>

      <section aria-labelledby="gaps-h">
        <SectionHeading
          id="gaps-h"
          title="Topics frequently covered by comparison channels"
          description={`Not found in the titles of ${t.channel.title}'s ${t.videosAnalyzed} most recent uploads. Sorted by how many channels use the topic.`}
        />
        {result.gaps.length === 0 ? (
          <EmptyState
            icon={<CircleSlash className="h-5 w-5" strokeWidth={1.75} />}
            title="No gaps detected"
            description="Every repeated topic in the comparison channels' recent titles also appears in your recent titles, or no topic repeats often enough. Try adding more comparison channels."
          />
        ) : (
          <ul className="space-y-3">
            {result.gaps.map((g) => (
              <li key={g.topic}>
                <Card className="p-4 sm:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="eyebrow">Topic</p>
                      <h3 className="mt-1 text-lg font-semibold tracking-tight text-ink">{g.topic.charAt(0).toUpperCase() + g.topic.slice(1)}</h3>
                    </div>
                    <div className="flex gap-1.5">
                      <Badge>
                        {g.channelCount} channel{g.channelCount === 1 ? "" : "s"}
                      </Badge>
                      <Badge>
                        {g.videoCount} video{g.videoCount === 1 ? "" : "s"}
                      </Badge>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto]">
                    <div>
                      <p className="text-[12.5px] font-medium text-muted">Found in</p>
                      <ul className="mt-2 space-y-2">
                        {g.channels.map((c) => {
                          const meta = byId.get(c.channelId);
                          return (
                            <li key={c.channelId}>
                              <details className="group">
                                <summary className="flex cursor-pointer list-none items-center gap-2 text-[13.5px] text-ink [&::-webkit-details-marker]:hidden">
                                  <span className="h-2 w-2 rounded-full" style={{ background: meta?.color }} aria-hidden />
                                  <span className="font-medium">{meta?.channel.title ?? c.channelId}</span>
                                  <span className="text-muted">
                                    · {c.videos.length} video{c.videos.length === 1 ? "" : "s"}
                                  </span>
                                  <span className="text-xs text-faint group-open:hidden">Show</span>
                                </summary>
                                <ul className="mt-2 ml-4 space-y-1.5 border-l-2 border-line pl-3">
                                  {c.videos.map((v) => (
                                    <li key={v.id} className="flex items-baseline justify-between gap-3 text-[12.5px]">
                                      <a href={`https://www.youtube.com/watch?v=${v.id}`} target="_blank" rel="noopener noreferrer" className="text-ink-2 hover:text-accent">
                                        {v.title}
                                      </a>
                                      <span className="num shrink-0 text-muted">
                                        {formatDate(v.publishedAt, { month: "short", day: "numeric" })} · {formatCompact(v.viewCount)} views
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              </details>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                    <div className="self-start rounded-xl bg-bg-subtle px-3.5 py-3 text-[12.5px] md:max-w-64">
                      <p className="font-medium text-muted">Not recently detected on</p>
                      <p className="mt-1 text-ink">{t.channel.title}</p>
                      {g.partialInTarget.length ? (
                        <p className="mt-2 text-muted">
                          Related wording appears in {g.partialInTarget.length} title{g.partialInTarget.length === 1 ? "" : "s"}, e.g. “{g.partialInTarget[0].title}”.
                        </p>
                      ) : null}
                    </div>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      {result.shared.length ? (
        <section aria-labelledby="shared-h">
          <SectionHeading id="shared-h" title="Topics you share" description="Repeated in comparison channels and also present in your recent titles." />
          <div className="flex flex-wrap gap-2">
            {result.shared.map((s) => (
              <span key={s.topic} className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-[13px] text-ink">
                {s.topic}
                <span className="num text-xs text-muted">
                  you {s.targetVideos} · them {s.comparisonVideos}
                </span>
              </span>
            ))}
          </div>
        </section>
      ) : null}

      <p className="text-xs text-muted">
        Topics are 1–3 word phrases taken directly from video titles, excluding common words. This is a data comparison, not a recommendation —
        a topic missing from your titles may be covered in descriptions, playlists or older videos.
      </p>
    </div>
  );
}

function ChannelChip({ channel, color, label, videos }: { channel: ChannelInfo; color: string; label: string; videos: number }) {
  return (
    <Card className="flex items-center gap-3 p-3">
      <ChannelAvatar channel={channel} size={36} />
      <div className="min-w-0">
        <p className="flex items-center gap-1.5 text-[11.5px] text-muted">
          <span className="h-2 w-2 rounded-full" style={{ background: color }} aria-hidden />
          {label}
        </p>
        <p className="truncate text-[13.5px] font-medium text-ink">{channel.title}</p>
        <p className="num text-[11.5px] text-muted">{videos} recent uploads analyzed</p>
      </div>
    </Card>
  );
}
