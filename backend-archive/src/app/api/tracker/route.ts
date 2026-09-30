import { z } from "zod";
import { ApiError, enforceRateLimit, handle, ok, parseJson } from "@/lib/api";
import { db } from "@/lib/db";
import { getSnapshots, recordChannelSnapshot } from "@/lib/snapshots";
import { channelFromRow, MAX_TRACKED } from "@/lib/tracked";
import { getVisitorId } from "@/lib/visitor";
import { getChannel } from "@/lib/youtube/channels";

/** GET /api/tracker — the visitor's tracked channels with up to 90 days of snapshots. */
export async function GET(req: Request) {
  return handle(async () => {
    enforceRateLimit(req, "tracker-read", 60);
    const userId = await getVisitorId({ create: false });
    if (!userId) return ok({ channels: [] });
    const tracked = await db().trackedChannel.findMany({
      where: { userId },
      include: { channel: true },
      orderBy: { createdAt: "asc" },
    });
    const snapshots = await getSnapshots(tracked.map((t) => t.channelId), 90);
    return ok({
      channels: tracked.map((t) => ({
        channel: channelFromRow(t.channel),
        trackedSince: t.createdAt.toISOString(),
        lastFetchedAt: t.channel.lastFetchedAt.toISOString(),
        snapshots: snapshots[t.channelId] ?? [],
      })),
    });
  });
}

const Body = z.object({ channel: z.string({ error: "Enter a channel URL, @handle or channel ID." }).trim().min(1).max(200) });

/** POST /api/tracker { channel } — start tracking a channel and store its first snapshot. */
export async function POST(req: Request) {
  return handle(async () => {
    enforceRateLimit(req, "tracker-write", 15);
    const { channel: input } = await parseJson(req, Body);
    const channel = await getChannel(input);
    const userId = await getVisitorId({ create: true });
    if (!userId) throw new ApiError(500, "INTERNAL", "Could not create a visitor session.");

    const count = await db().trackedChannel.count({ where: { userId } });
    const existing = await db().trackedChannel.findUnique({ where: { userId_channelId: { userId, channelId: channel.id } } });
    if (!existing && count >= MAX_TRACKED) {
      throw new ApiError(409, "LIMIT_REACHED", `You can track up to ${MAX_TRACKED} channels. Remove one to add another.`);
    }
    await recordChannelSnapshot(channel);
    if (!existing) await db().trackedChannel.create({ data: { userId, channelId: channel.id } });
    return ok({ channelId: channel.id, alreadyTracked: Boolean(existing) }, { status: existing ? 200 : 201 });
  });
}
