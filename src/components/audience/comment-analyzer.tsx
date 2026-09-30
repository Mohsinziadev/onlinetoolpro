"use client";

import { useMemo, useState } from "react";
import { MessageSquareText } from "lucide-react";
import { UrlInput } from "@/components/tool/url-input";
import { EmptyState, ErrorState, LoadingState, MockDataBanner } from "@/components/tool/states";
import { MetricCard, MetricGrid, SectionHeading } from "@/components/tool/metric";
import { Segmented } from "@/components/ui/segmented";
import { Button } from "@/components/ui/button";
import { Badge, Card, Textarea } from "@/components/ui/primitives";
import { apiGet, errorMessage, errorTitle } from "@/lib/client-api";
import { analyzeComments, splitPastedComments, type CommentAnalysisResult } from "@/lib/text/comment-analysis";
import type { Group } from "@/lib/text/nlp";
import type { CommentItem, DataSource, VideoInfo } from "@/lib/youtube/types";
import { formatPercent } from "@/lib/utils";

type Mode = "video" | "paste";

/**
 * Reading comments straight from a video needs the YouTube API (a server). The site is
 * currently static, so only the paste mode is offered; flip this when a backend returns.
 */
const VIDEO_MODE_AVAILABLE = false;

export function CommentAnalyzer() {
  const [mode, setMode] = useState<Mode>(VIDEO_MODE_AVAILABLE ? "video" : "paste");
  const [url, setUrl] = useState("");
  const [pasted, setPasted] = useState("");
  const [state, setState] = useState<
    | { status: "idle" }
    | { status: "loading" }
    | { status: "error"; error: unknown }
    | { status: "done"; result: CommentAnalysisResult; source: DataSource | "pasted"; video?: VideoInfo }
  >({ status: "idle" });

  async function fromVideo(v: string) {
    setState({ status: "loading" });
    try {
      const res = await apiGet<{ video: VideoInfo; comments: CommentItem[] }>(`/api/youtube/comments?video=${encodeURIComponent(v)}&max=300`);
      if (res.data.comments.length === 0) {
        setState({ status: "error", error: new Error("empty") });
        return;
      }
      setState({ status: "done", result: analyzeComments(res.data.comments), source: res.source, video: res.data.video });
    } catch (error) {
      setState({ status: "error", error });
    }
  }

  function fromPaste() {
    const comments = splitPastedComments(pasted);
    if (comments.length < 3) {
      setState({ status: "error", error: new Error("few") });
      return;
    }
    setState({ status: "done", result: analyzeComments(comments.map((text) => ({ text }))), source: "pasted" });
  }

  const err = state.status === "error" ? state.error : null;
  const errText =
    err instanceof Error && err.message === "few"
      ? { t: "Not enough comments", d: "Paste at least 3 comments, one per line." }
      : err instanceof Error && err.message === "empty"
        ? { t: "No comments found", d: "This video has no public comments yet." }
        : err
          ? { t: errorTitle(err), d: errorMessage(err) }
          : null;

  return (
    <div className="space-y-8">
      {VIDEO_MODE_AVAILABLE ? (
        <Segmented
          label="Comment source"
          value={mode}
          onChange={setMode}
          options={[
            { value: "video", label: "From a YouTube video" },
            { value: "paste", label: "Paste comments" },
          ]}
        />
      ) : (
        <p className="flex flex-wrap items-center gap-2 text-[14px] text-muted">
          <span className="rounded-full border border-line px-2.5 py-0.5 text-[12px] font-medium text-ink-2">Coming soon</span>
          Analysing comments straight from a video link. For now, copy the comments and paste them below.
        </p>
      )}
      {mode === "video" ? (
        <UrlInput
          label="YouTube video URL"
          placeholder="Paste a YouTube video URL or ID"
          value={url}
          onChange={setUrl}
          onSubmit={fromVideo}
          loading={state.status === "loading"}
          submitLabel="Analyze comments"
          icon={<MessageSquareText className="h-4 w-4" />}
          hint="Up to 300 top-level public comments · analyzed in your browser"
        />
      ) : (
        <div className="rounded-[20px] border border-line bg-surface p-4 shadow-raised sm:p-5">
          <label htmlFor="pasted" className="mb-2 block text-[13px] font-medium text-ink-2">
            Comments — one per line (or separate multi-line comments with a blank line)
          </label>
          <Textarea id="pasted" value={pasted} onChange={(e) => setPasted(e.target.value)} className="min-h-48" placeholder={"What mic are you using?\nCan you make a video on lighting?\nGreat video, really helpful!"} />
          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="text-xs text-muted">{splitPastedComments(pasted).length} comments · never uploaded or stored</p>
            <Button onClick={fromPaste} disabled={!pasted.trim()}>
              Analyze comments
            </Button>
          </div>
        </div>
      )}

      {state.status === "idle" ? (
        <EmptyState title="See what your audience is discussing" description="Find repeated questions, requests, common topics and frequently mentioned terms." />
      ) : null}
      {state.status === "loading" ? <LoadingState label="Fetching public comments…" /> : null}
      {errText ? <ErrorState title={errText.t} description={errText.d} /> : null}
      {state.status === "done" ? <Results result={state.result} source={state.source} video={state.video} /> : null}
    </div>
  );
}

function GroupList({ groups, empty }: { groups: Group[]; empty: string }) {
  if (!groups.length) return <p className="text-sm text-muted">{empty}</p>;
  return (
    <Card className="divide-y divide-line">
      {groups.map((g) => (
        <details key={g.label} className="group px-4 py-3 sm:px-5">
          <summary className="flex cursor-pointer list-none items-start justify-between gap-3 [&::-webkit-details-marker]:hidden">
            <span className="text-[14px] text-ink">{g.label}</span>
            <Badge className="shrink-0">{g.count}×</Badge>
          </summary>
          <ul className="mt-2 space-y-1 border-l-2 border-line pl-3 text-[13px] text-muted">
            {g.examples.map((e) => (
              <li key={e.text}>
                {e.text}
                {e.count > 1 ? <span className="num ml-1.5 text-faint">×{e.count}</span> : null}
              </li>
            ))}
          </ul>
        </details>
      ))}
    </Card>
  );
}

function Results({ result: r, source, video }: { result: CommentAnalysisResult; source: DataSource | "pasted"; video?: VideoInfo }) {
  const total = r.total || 1;
  const sent = r.sentiment.counts;
  const maxTerm = useMemo(() => Math.max(1, ...r.terms.map((t) => t.count)), [r.terms]);
  return (
    <div className="animate-fade-up space-y-10">
      {source === "mock" ? <MockDataBanner /> : null}
      {video ? <p className="text-sm text-muted">Analyzing comments on <span className="font-medium text-ink">{video.title}</span></p> : null}
      <MetricGrid>
        <MetricCard label="Comments analyzed" value={r.total} />
        <MetricCard label="Contain a question" value={formatPercent((r.questions.commentsWithQuestions / total) * 100, 0)} sub={`${r.questions.totalQuestions} questions found`} />
        <MetricCard label="Requests detected" value={r.requests.total} hint="Comments matching patterns like “can you make…”, “please do…”, “part 2”." />
        <MetricCard
          label="Estimated sentiment"
          value={formatPercent((sent.positive / total) * 100, 0)}
          unit="positive"
          hint="Lexicon-based estimate. It misses sarcasm, slang and context — treat it as a rough guide, not a verdict."
          sub={`${formatPercent((sent.neutral / total) * 100, 0)} neutral · ${formatPercent((sent.negative / total) * 100, 0)} negative`}
        />
      </MetricGrid>

      <section>
        <SectionHeading title="Frequently Asked Questions" description="Similar questions grouped together. Expand to see the original wording." />
        <GroupList groups={r.questions.groups} empty="No questions detected." />
      </section>
      <section>
        <SectionHeading title="Repeated Requests" description="What viewers ask you to make, cover or continue." />
        <GroupList groups={r.requests.groups} empty="No requests detected." />
      </section>
      <section>
        <SectionHeading title="Common Topics" description="Two- and three-word phrases mentioned in at least two comments." />
        {r.topics.length ? (
          <div className="flex flex-wrap gap-2">
            {r.topics.map((t) => (
              <span key={t.phrase} title={t.examples.join("\n")} className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-[13px] text-ink shadow-card">
                {t.phrase} <span className="num text-xs text-muted">{t.count}</span>
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted">No repeated phrases found.</p>
        )}
      </section>
      <section>
        <SectionHeading title="Frequently Mentioned Terms" description="Number of comments mentioning each word (common words excluded)." />
        <Card className="grid gap-x-8 gap-y-2 p-5 sm:grid-cols-2">
          {r.terms.map((t) => (
            <div key={t.term} className="flex items-center gap-3 text-[13px]">
              <span className="w-28 truncate text-ink">{t.term}</span>
              <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-bg-subtle">
                <span className="block h-full rounded-full" style={{ width: `${(t.count / maxTerm) * 100}%`, background: "var(--chart-1)" }} />
              </span>
              <span className="num w-8 text-right text-muted">{t.count}</span>
            </div>
          ))}
        </Card>
      </section>
      <p className="text-xs text-muted">All analysis runs in your browser using word frequencies and pattern matching. Estimated sentiment is not an objective measure of viewer opinion.</p>
    </div>
  );
}
