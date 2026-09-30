"use client";

import Image from "next/image";
import { useState } from "react";
import { CalendarDays, ExternalLink, Globe } from "lucide-react";
import type { ChannelInfo } from "@/lib/youtube/types";
import { formatDate } from "@/lib/utils";

export function ChannelAvatar({ channel, size = 56 }: { channel: Pick<ChannelInfo, "title" | "thumbnailUrl">; size?: number }) {
  if (!channel.thumbnailUrl) {
    return (
      <span
        className="inline-flex shrink-0 items-center justify-center rounded-full border border-line bg-bg-subtle font-semibold text-muted"
        style={{ width: size, height: size, fontSize: size * 0.36 }}
        aria-hidden
      >
        {channel.title.replace(/^\[Mock\]\s*/, "").charAt(0).toUpperCase()}
      </span>
    );
  }
  return (
    <Image
      src={channel.thumbnailUrl}
      alt=""
      width={size}
      height={size}
      className="shrink-0 rounded-full border border-line object-cover"
      style={{ width: size, height: size }}
    />
  );
}

export function ChannelHeader({ channel, actions }: { channel: ChannelInfo; actions?: React.ReactNode }) {
  const [expanded, setExpanded] = useState(false);
  const url = channel.handle ? `https://www.youtube.com/${channel.handle}` : `https://www.youtube.com/channel/${channel.id}`;
  const desc = channel.description.trim();
  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
      <ChannelAvatar channel={channel} size={72} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate text-2xl font-semibold tracking-tight text-ink">{channel.title}</h2>
            <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-muted">
              {channel.handle ? <span>{channel.handle}</span> : null}
              <span className="inline-flex items-center gap-1">
                <CalendarDays aria-hidden className="h-3.5 w-3.5" /> Joined {formatDate(channel.publishedAt)}
              </span>
              {channel.country ? (
                <span className="inline-flex items-center gap-1">
                  <Globe aria-hidden className="h-3.5 w-3.5" /> {channel.country}
                </span>
              ) : null}
              <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-ink">
                View on YouTube <ExternalLink aria-hidden className="h-3 w-3" />
              </a>
            </p>
          </div>
          {actions}
        </div>
        {desc ? (
          <div className="mt-3 max-w-3xl text-[13.5px] leading-relaxed text-ink-2">
            <p className={expanded ? "whitespace-pre-line" : "line-clamp-2"}>{desc}</p>
            {desc.length > 160 ? (
              <button type="button" onClick={() => setExpanded((e) => !e)} className="mt-1 text-xs font-medium text-muted hover:text-ink">
                {expanded ? "Show less" : "Show more"}
              </button>
            ) : null}
          </div>
        ) : (
          <p className="mt-3 text-[13.5px] text-muted">No channel description.</p>
        )}
      </div>
    </div>
  );
}
