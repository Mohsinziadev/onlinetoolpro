"use client";

import { useState } from "react";
import { AtSign } from "lucide-react";
import { UrlInput } from "@/components/tool/url-input";
import { ErrorState, LoadingState, MockDataBanner } from "@/components/tool/states";
import { CopyButton } from "@/components/tool/copy-button";
import { apiGet, errorMessage, errorTitle } from "@/lib/client-api";
import { parseChannelInput } from "@/lib/youtube/parse";
import type { ChannelInfo, DataSource } from "@/lib/youtube/types";
import { formatCompact } from "@/lib/utils";

type Result = { id: string; channel: ChannelInfo | null; source: DataSource | null };

export function ChannelIdFinder() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [invalid, setInvalid] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  async function submit(value: string) {
    const parsed = parseChannelInput(value);
    setError(null);
    setResult(null);
    setInvalid(!parsed);
    if (!parsed) return;
    setLoading(true);
    try {
      const res = await apiGet<ChannelInfo>(`/api/youtube/channel?q=${encodeURIComponent(value)}`);
      setResult({ id: res.data.id, channel: res.data, source: res.source });
    } catch (err) {
      // A channel link that already contains the ID doesn't need the API.
      if (parsed.type === "id") setResult({ id: parsed.value, channel: null, source: null });
      else setError(err);
    } finally {
      setLoading(false);
    }
  }

  const rows = result
    ? [
        { label: "Channel ID", value: result.id, mono: true },
        { label: "Channel link", value: `https://www.youtube.com/channel/${result.id}`, mono: true },
        ...(result.channel?.handle ? [{ label: "Handle link", value: `https://www.youtube.com/${result.channel.handle}`, mono: true }] : []),
      ]
    : [];

  return (
    <div className="space-y-8">
      <UrlInput
        value={input}
        onChange={setInput}
        onSubmit={submit}
        loading={loading}
        label="YouTube channel link or @handle"
        placeholder="Paste a channel link or type an @handle"
        submitLabel="Find channel ID"
        icon={<AtSign className="h-5 w-5" />}
        examples={[
          { label: "@YouTube", value: "@YouTube" },
          { label: "youtube.com/@GoogleDevelopers", value: "https://www.youtube.com/@GoogleDevelopers" },
        ]}
      />

      {invalid ? (
        <ErrorState
          title="We couldn't read that"
          description="Paste the link from the channel page (for example youtube.com/@name) or type the @handle. Video links won't work here — use the Video ID Finder instead."
        />
      ) : null}
      {loading ? <LoadingState label="Looking up the channel…" rows={2} /> : null}
      {error ? <ErrorState title={errorTitle(error)} description={errorMessage(error)} /> : null}

      {result ? (
        <div className="animate-fade-up space-y-4" aria-live="polite">
          {result.source === "mock" ? <MockDataBanner /> : null}
          <div className="rounded-3xl border border-line bg-surface p-5 shadow-raised sm:p-7">
            {result.channel ? (
              <div className="flex items-center gap-4">
                {result.channel.thumbnailUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={result.channel.thumbnailUrl} alt="" className="h-14 w-14 rounded-full border border-line object-cover" />
                ) : (
                  <span className="h-14 w-14 rounded-full bg-bg-subtle" />
                )}
                <div className="min-w-0">
                  <p className="truncate text-[19px] font-medium tracking-[-0.01em] text-ink">{result.channel.title}</p>
                  <p className="text-[14px] text-muted">
                    {result.channel.handle ? `${result.channel.handle} · ` : ""}
                    {result.channel.subscriberCount !== null ? `${formatCompact(result.channel.subscriberCount)} subscribers · ` : ""}
                    {formatCompact(result.channel.videoCount)} videos
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-[15px] text-muted">The ID was read straight from the link you pasted.</p>
            )}

            <dl className="mt-6 space-y-3 border-t border-line pt-6">
              {rows.map((r) => (
                <div key={r.label} className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-4">
                  <dt className="w-32 shrink-0 text-[14px] text-muted">{r.label}</dt>
                  <dd className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-line bg-surface-2 py-1.5 pr-1.5 pl-3.5">
                    <code className="min-w-0 flex-1 truncate font-mono text-[14px] text-ink">{r.value}</code>
                    <CopyButton value={r.value} label={`Copy ${r.label}`} />
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      ) : null}
    </div>
  );
}
