"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, CircleAlert, Lightbulb, Link2 } from "lucide-react";
import { UrlInput } from "@/components/tool/url-input";
import { ErrorState, LoadingState, MockDataBanner } from "@/components/tool/states";
import { useVideoDetails } from "@/components/youtube/use-video-details";
import { errorMessage, errorTitle } from "@/lib/client-api";
import { runSeoChecks, type CheckStatus } from "@/lib/youtube/writing";
import { cn } from "@/lib/utils";

const STATUS: Record<CheckStatus, { label: string; icon: typeof CheckCircle2; className: string }> = {
  pass: { label: "Looks good", icon: CheckCircle2, className: "text-success" },
  improve: { label: "Can be improved", icon: CircleAlert, className: "text-warning" },
  tip: { label: "Tip", icon: Lightbulb, className: "text-muted" },
};

export function SeoChecker() {
  const [input, setInput] = useState("");
  const { loading, error, invalid, data, lookup } = useVideoDetails();
  const checks = useMemo(() => (data ? runSeoChecks(data.video) : []), [data]);
  const count = (s: CheckStatus) => checks.filter((c) => c.status === s).length;
  const order: CheckStatus[] = ["improve", "pass", "tip"];

  return (
    <div className="space-y-8">
      <UrlInput
        value={input}
        onChange={setInput}
        onSubmit={lookup}
        loading={loading}
        label="YouTube video link"
        placeholder="Paste your YouTube video link"
        submitLabel="Check video"
        icon={<Link2 className="h-5 w-5" />}
        examples={[{ label: "Example video", value: "https://www.youtube.com/watch?v=jNQXAC9IVRw" }]}
        hint="Works with any public video."
      />

      {invalid ? (
        <ErrorState title="That doesn't look like a YouTube video link" description="Open the video on YouTube, press Share → Copy, then paste the link here." />
      ) : null}
      {loading ? <LoadingState label="Reading the video's public details…" /> : null}
      {error ? <ErrorState title={errorTitle(error)} description={errorMessage(error)} /> : null}

      {data ? (
        <div className="animate-fade-up space-y-4" aria-live="polite">
          {data.source === "mock" ? <MockDataBanner /> : null}
          <div className="rounded-3xl border border-line bg-surface p-5 shadow-raised sm:p-7">
            <p className="truncate text-[14px] text-muted">{data.video.channelTitle}</p>
            <h2 className="mt-1 text-[20px] leading-snug font-medium tracking-[-0.01em] text-ink">{data.video.title}</h2>
            <div className="mt-4 flex flex-wrap gap-2 text-[13px]">
              <span className="rounded-full bg-warning-soft px-3 py-1 font-medium text-warning">{count("improve")} to improve</span>
              <span className="rounded-full bg-success-soft px-3 py-1 font-medium text-success">{count("pass")} looking good</span>
              <span className="rounded-full bg-bg-subtle px-3 py-1 font-medium text-ink-2">{count("tip")} tips</span>
            </div>
            <p className="mt-4 text-[13px] text-muted">
              These checks follow YouTube&apos;s published guidelines. There&apos;s no overall score — nobody outside YouTube can
              measure how a video will rank.
            </p>
          </div>

          <ul className="divide-y divide-line overflow-hidden rounded-3xl border border-line bg-surface">
            {order.flatMap((s) =>
              checks
                .filter((c) => c.status === s)
                .map((c) => {
                  const meta = STATUS[c.status];
                  return (
                    <li key={c.id} className="flex gap-4 p-5 sm:px-6">
                      <meta.icon aria-hidden className={cn("mt-0.5 h-5 w-5 shrink-0", meta.className)} strokeWidth={1.9} />
                      <div className="min-w-0">
                        <p className="flex flex-wrap items-baseline gap-x-2 text-[15px] font-medium text-ink">
                          {c.label}
                          <span className={cn("text-[12.5px] font-normal", meta.className)}>{meta.label}</span>
                        </p>
                        <p className="mt-1 text-[14.5px] leading-[1.5] text-ink-2">{c.detail}</p>
                      </div>
                    </li>
                  );
                }),
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
