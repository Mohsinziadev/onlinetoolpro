"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import type { VideoInfo } from "@/lib/youtube/types";
import { likeRate, viewsPerDay } from "@/lib/metrics";
import { cn, formatCompact, formatDate, formatDuration, formatNumber, formatPercent } from "@/lib/utils";

type SortKey = "publishedAt" | "viewCount" | "likeCount" | "commentCount" | "durationSeconds" | "vpd" | "likeRate";

const COLUMNS: { key: SortKey; label: string; short: string }[] = [
  { key: "publishedAt", label: "Published", short: "Date" },
  { key: "durationSeconds", label: "Duration", short: "Length" },
  { key: "viewCount", label: "Views", short: "Views" },
  { key: "likeCount", label: "Likes", short: "Likes" },
  { key: "commentCount", label: "Comments", short: "Comments" },
  { key: "vpd", label: "Views / day", short: "Views/day" },
  { key: "likeRate", label: "Like rate", short: "Like rate" },
];

export function VideoThumb({ video, width = 96 }: { video: Pick<VideoInfo, "thumbnailUrl" | "title">; width?: number }) {
  return video.thumbnailUrl ? (
    <Image
      src={video.thumbnailUrl}
      alt=""
      width={width}
      height={Math.round((width * 9) / 16)}
      className="aspect-video shrink-0 rounded-md bg-bg-subtle object-cover"
      style={{ width }}
      sizes={`${width}px`}
    />
  ) : (
    <span className="block aspect-video max-w-full shrink-0 rounded-md bg-bg-subtle" style={{ width }} aria-hidden />
  );
}

export function VideoTable({ videos, now, initialRows = 10 }: { videos: VideoInfo[]; now: number; initialRows?: number }) {
  const [showAll, setShowAll] = useState(false);
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "publishedAt", dir: "desc" });

  const rows = useMemo(() => {
    const val = (v: VideoInfo): number => {
      switch (sort.key) {
        case "publishedAt":
          return new Date(v.publishedAt).getTime();
        case "vpd":
          return viewsPerDay(v, now) ?? -1;
        case "likeRate":
          return likeRate(v) ?? -1;
        default:
          return v[sort.key] ?? -1;
      }
    };
    return [...videos].sort((a, b) => (sort.dir === "desc" ? val(b) - val(a) : val(a) - val(b)));
  }, [videos, sort, now]);
  const visible = showAll ? rows : rows.slice(0, initialRows);
  const more = rows.length - visible.length;

  function toggle(key: SortKey) {
    setSort((s) => (s.key === key ? { key, dir: s.dir === "desc" ? "asc" : "desc" } : { key, dir: "desc" }));
  }

  const link = (id: string) => `https://www.youtube.com/watch?v=${id}`;

  return (
    <>
      {/* Mobile: sort control + cards */}
      <div className="md:hidden">
        <label className="mb-3 flex items-center gap-2 text-xs text-muted">
          Sort by
          <select
            value={`${sort.key}:${sort.dir}`}
            onChange={(e) => {
              const [key, dir] = e.target.value.split(":") as [SortKey, "asc" | "desc"];
              setSort({ key, dir });
            }}
            className="h-8 rounded-full border border-line bg-surface px-3 text-xs text-ink"
          >
            {COLUMNS.map((c) => (
              <option key={c.key} value={`${c.key}:desc`}>
                {c.label} (high → low)
              </option>
            ))}
            <option value="publishedAt:asc">Published (oldest first)</option>
          </select>
        </label>
        <ul className="space-y-2">
          {visible.map((v) => (
            <li key={v.id} className="rounded-xl border border-line p-3">
              <a href={link(v.id)} target="_blank" rel="noopener noreferrer" className="flex gap-3">
                <VideoThumb video={v} width={112} />
                <div className="min-w-0">
                  <p className="line-clamp-2 text-[13.5px] leading-snug font-medium text-ink">{v.title}</p>
                  <p className="num mt-1 text-xs text-muted">
                    {formatDate(v.publishedAt)} · {formatDuration(v.durationSeconds)}
                  </p>
                </div>
              </a>
              <dl className="num mt-3 grid grid-cols-4 gap-2 text-[11.5px]">
                {[
                  ["Views", formatCompact(v.viewCount)],
                  ["Likes", v.likeCount === null ? "Hidden" : formatCompact(v.likeCount)],
                  ["Comments", v.commentCount === null ? "Off" : formatCompact(v.commentCount)],
                  ["Views/day", formatCompact(viewsPerDay(v, now))],
                ].map(([k, val]) => (
                  <div key={k}>
                    <dt className="text-muted">{k}</dt>
                    <dd className="font-medium text-ink">{val}</dd>
                  </div>
                ))}
              </dl>
            </li>
          ))}
        </ul>
      </div>

      {/* Desktop: sortable table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[860px] text-left text-[13px]">
          <thead>
            <tr className="border-b border-line">
              <th scope="col" className="py-2.5 pr-3 font-medium text-muted">
                Video
              </th>
              {COLUMNS.map((c) => (
                <th
                  key={c.key}
                  scope="col"
                  aria-sort={sort.key === c.key ? (sort.dir === "desc" ? "descending" : "ascending") : "none"}
                  className="px-2 py-2.5 text-right font-medium whitespace-nowrap text-muted"
                >
                  <button
                    type="button"
                    onClick={() => toggle(c.key)}
                    className={cn("inline-flex items-center gap-1 hover:text-ink", sort.key === c.key && "text-ink")}
                  >
                    {c.short}
                    {sort.key === c.key ? (
                      sort.dir === "desc" ? (
                        <ArrowDown aria-hidden className="h-3 w-3" />
                      ) : (
                        <ArrowUp aria-hidden className="h-3 w-3" />
                      )
                    ) : null}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {visible.map((v) => (
              <tr key={v.id} className="transition-colors hover:bg-bg-subtle/60">
                <td className="py-2.5 pr-3">
                  <a href={link(v.id)} target="_blank" rel="noopener noreferrer" className="flex max-w-md items-center gap-3 hover:text-accent">
                    <VideoThumb video={v} width={80} />
                    <span className="line-clamp-2 font-medium text-ink">{v.title}</span>
                  </a>
                </td>
                <td className="num px-2 text-right whitespace-nowrap text-muted">{formatDate(v.publishedAt)}</td>
                <td className="num px-2 text-right text-ink">{formatDuration(v.durationSeconds)}</td>
                <td className="num px-2 text-right font-medium text-ink">{formatNumber(v.viewCount)}</td>
                <td className="num px-2 text-right text-ink">{v.likeCount === null ? <span className="text-muted">Hidden</span> : formatNumber(v.likeCount)}</td>
                <td className="num px-2 text-right text-ink">{v.commentCount === null ? <span className="text-muted">Off</span> : formatNumber(v.commentCount)}</td>
                <td className="num px-2 text-right text-ink">{formatNumber(viewsPerDay(v, now))}</td>
                <td className="num px-2 text-right text-ink">{formatPercent(likeRate(v))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length > initialRows ? (
        <div className="mt-3 flex justify-center">
          <button
            type="button"
            onClick={() => setShowAll((s) => !s)}
            className="h-8 rounded-full border border-line px-4 text-xs font-medium text-ink transition-colors hover:bg-bg-subtle"
          >
            {showAll ? "Show fewer" : `Show all ${rows.length} videos (${more} more)`}
          </button>
        </div>
      ) : null}
    </>
  );
}
