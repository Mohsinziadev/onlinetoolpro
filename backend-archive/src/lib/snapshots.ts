import "server-only";
import { big, db } from "@/lib/db";
import { getChannelsByIds } from "@/lib/youtube/channels";
import type { ChannelInfo, VideoInfo } from "@/lib/youtube/types";

/** Minimum spacing between stored snapshots of the same channel. */
export const SNAPSHOT_MIN_INTERVAL_MS = 60 * 60 * 1000;

/** Upsert the latest channel details. */
export async function upsertChannel(c: ChannelInfo): Promise<void> {
  const data = {
    title: c.title,
    handle: c.handle,
    description: c.description.slice(0, 5000),
    thumbnailUrl: c.thumbnailUrl,
    country: c.country,
    publishedAt: new Date(c.publishedAt),
    uploadsPlaylistId: c.uploadsPlaylistId,
    subscriberCount: c.subscriberCount === null ? null : BigInt(c.subscriberCount),
    viewCount: BigInt(c.viewCount),
    videoCount: c.videoCount,
    lastFetchedAt: new Date(),
  };
  await db().channel.upsert({ where: { id: c.id }, create: { id: c.id, ...data }, update: data });
}

/**
 * Store a snapshot of the channel's current public statistics — unless one was
 * already captured within the minimum interval. Returns whether one was written.
 */
export async function recordChannelSnapshot(c: ChannelInfo): Promise<boolean> {
  await upsertChannel(c);
  const latest = await db().channelSnapshot.findFirst({
    where: { channelId: c.id },
    orderBy: { capturedAt: "desc" },
    select: { capturedAt: true },
  });
  if (latest && Date.now() - latest.capturedAt.getTime() < SNAPSHOT_MIN_INTERVAL_MS) return false;
  await db().channelSnapshot.create({
    data: {
      channelId: c.id,
      subscriberCount: c.subscriberCount === null ? null : BigInt(c.subscriberCount),
      viewCount: BigInt(c.viewCount),
      videoCount: c.videoCount,
    },
  });
  return true;
}

/** Store video details + a stats snapshot for each video (for future per-video history). */
export async function recordVideos(videos: VideoInfo[]): Promise<void> {
  const known = new Set((await db().channel.findMany({ where: { id: { in: videos.map((v) => v.channelId) } }, select: { id: true } })).map((c) => c.id));
  const now = new Date();
  for (const v of videos) {
    if (!known.has(v.channelId)) continue;
    const stats = {
      viewCount: v.viewCount === null ? null : BigInt(v.viewCount),
      likeCount: v.likeCount === null ? null : BigInt(v.likeCount),
      commentCount: v.commentCount === null ? null : BigInt(v.commentCount),
    };
    await db().video.upsert({
      where: { id: v.id },
      create: {
        id: v.id,
        channelId: v.channelId,
        title: v.title,
        publishedAt: new Date(v.publishedAt),
        durationSeconds: v.durationSeconds,
        thumbnailUrl: v.thumbnailUrl,
        ...stats,
      },
      update: { title: v.title, thumbnailUrl: v.thumbnailUrl, durationSeconds: v.durationSeconds, lastFetchedAt: now, ...stats },
    });
    const last = await db().videoSnapshot.findFirst({ where: { videoId: v.id }, orderBy: { capturedAt: "desc" }, select: { capturedAt: true } });
    if (!last || now.getTime() - last.capturedAt.getTime() >= SNAPSHOT_MIN_INTERVAL_MS) {
      await db().videoSnapshot.create({ data: { videoId: v.id, ...stats } });
    }
  }
}

export type SnapshotPoint = { capturedAt: string; subscriberCount: number | null; viewCount: number; videoCount: number };

export async function getSnapshots(channelIds: string[], sinceDays = 90): Promise<Record<string, SnapshotPoint[]>> {
  const since = new Date(Date.now() - sinceDays * 86_400_000);
  const rows = await db().channelSnapshot.findMany({
    where: { channelId: { in: channelIds }, capturedAt: { gte: since } },
    orderBy: { capturedAt: "asc" },
  });
  const out: Record<string, SnapshotPoint[]> = Object.fromEntries(channelIds.map((id) => [id, []]));
  for (const r of rows) {
    out[r.channelId].push({
      capturedAt: r.capturedAt.toISOString(),
      subscriberCount: big(r.subscriberCount),
      viewCount: big(r.viewCount) ?? 0,
      videoCount: r.videoCount,
    });
  }
  return out;
}

/**
 * Refresh every channel that anyone tracks or compares. Designed to be called
 * by a scheduled job; batches YouTube lookups 50 at a time (1 quota unit each).
 */
export async function snapshotAllTrackedChannels(): Promise<{ checked: number; written: number }> {
  const ids = (
    await db().channel.findMany({
      where: { OR: [{ trackedBy: { some: {} } }, { competitors: { some: {} } }] },
      select: { id: true },
    })
  ).map((c) => c.id);
  const channels = await getChannelsByIds(ids);
  let written = 0;
  for (const c of channels) if (await recordChannelSnapshot(c)) written++;
  return { checked: ids.length, written };
}
