import { z } from "zod";
import { ApiError, enforceRateLimit, handle, ok, parseJson } from "@/lib/api";
import { db } from "@/lib/db";
import { performanceSummary, publishingActivity } from "@/lib/metrics";
import { getSnapshots, recordChannelSnapshot } from "@/lib/snapshots";
import { channelFromRow, MAX_COMPETITORS } from "@/lib/tracked";
import { getVisitorId } from "@/lib/visitor";
import { getChannel, getChannelsByIds } from "@/lib/youtube/channels";
import { getRecentVideos } from "@/lib/youtube/videos";

const RECENT = 15;

/**
 * GET /api/competitors — live comparison of the visitor's competitor set:
 * current public stats, recent upload activity and performance, and stored
 * snapshot history. Each call also records a snapshot (max one per hour).
 */
export async function GET(req: Request) {
  return handle(async () => {
    enforceRateLimit(req, "competitors-read", 20);
    const userId = await getVisitorId({ create: false });
    if (!userId) return ok({ competitors: [] });
    const rows = await db().competitor.findMany({ where: { userId }, include: { channel: true }, orderBy: { position: "asc" } });
    if (rows.length === 0) return ok({ competitors: [] });

    const live = await getChannelsByIds(rows.map((r) => r.channelId));
    const liveById = new Map(live.map((c) => [c.id, c]));
    const now = Date.now();

    const competitors = await Promise.all(
      rows.map(async (r) => {
        const current = liveById.get(r.channelId);
        if (!current) {
          return { channel: channelFromRow(r.channel), available: false as const, position: r.position };
        }
        await recordChannelSnapshot(current);
        const videos = await getRecentVideos(current, RECENT);
        return {
          channel: current,
          available: true as const,
          position: r.position,
          recentVideos: videos.map((v) => ({ id: v.id, title: v.title, publishedAt: v.publishedAt, viewCount: v.viewCount })),
          activity: publishingActivity(videos, now),
          performance: performanceSummary(videos, now),
        };
      }),
    );
    const snapshots = await getSnapshots(rows.map((r) => r.channelId), 90);
    return ok({ competitors: competitors.map((c) => ({ ...c, snapshots: snapshots[c.channel.id] ?? [] })) });
  });
}

const Body = z.object({ channel: z.string({ error: "Enter a channel URL, @handle or channel ID." }).trim().min(1).max(200) });

/** POST /api/competitors { channel } — add a channel to the comparison set (max 5). */
export async function POST(req: Request) {
  return handle(async () => {
    enforceRateLimit(req, "competitors-write", 15);
    const { channel: input } = await parseJson(req, Body);
    const channel = await getChannel(input);
    const userId = await getVisitorId({ create: true });
    if (!userId) throw new ApiError(500, "INTERNAL", "Could not create a visitor session.");

    const existing = await db().competitor.findMany({ where: { userId }, select: { channelId: true, position: true } });
    if (existing.some((e) => e.channelId === channel.id)) {
      throw new ApiError(409, "DUPLICATE", `${channel.title} is already in your comparison.`);
    }
    if (existing.length >= MAX_COMPETITORS) {
      throw new ApiError(409, "LIMIT_REACHED", `You can compare up to ${MAX_COMPETITORS} channels. Remove one to add another.`);
    }
    // Reuse the lowest free position so colors stay stable per slot.
    const used = new Set(existing.map((e) => e.position));
    let position = 0;
    while (used.has(position)) position++;
    await recordChannelSnapshot(channel);
    await db().competitor.create({ data: { userId, channelId: channel.id, position } });
    return ok({ channelId: channel.id, position }, { status: 201 });
  });
}
