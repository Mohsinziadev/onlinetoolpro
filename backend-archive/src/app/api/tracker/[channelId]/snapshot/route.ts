import { ApiError, enforceRateLimit, handle, ok } from "@/lib/api";
import { db } from "@/lib/db";
import { recordChannelSnapshot, SNAPSHOT_MIN_INTERVAL_MS } from "@/lib/snapshots";
import { CHANNEL_ID } from "@/lib/tracked";
import { getVisitorId } from "@/lib/visitor";
import { getChannelsByIds } from "@/lib/youtube/channels";
import { YouTubeError } from "@/lib/youtube/errors";

/**
 * POST /api/tracker/:channelId/snapshot — capture a snapshot now.
 * At most one snapshot per channel per hour is stored.
 */
export async function POST(req: Request, ctx: RouteContext<"/api/tracker/[channelId]/snapshot">) {
  return handle(async () => {
    enforceRateLimit(req, "snapshot-write", 10);
    const { channelId } = await ctx.params;
    if (!CHANNEL_ID.test(channelId)) throw new ApiError(400, "INVALID_INPUT", "Invalid channel ID.");
    const userId = await getVisitorId({ create: false });
    const tracked = userId ? await db().trackedChannel.findUnique({ where: { userId_channelId: { userId, channelId } } }) : null;
    if (!tracked) throw new ApiError(404, "NOT_FOUND", "That channel isn't in your tracker.");
    const [channel] = await getChannelsByIds([channelId]);
    if (!channel) throw new YouTubeError("NOT_FOUND", "This channel is no longer available on YouTube. It may have been deleted.");
    const written = await recordChannelSnapshot(channel);
    return ok({
      written,
      message: written
        ? "Snapshot saved."
        : `A snapshot was already captured in the last ${SNAPSHOT_MIN_INTERVAL_MS / 60_000} minutes. Try again later.`,
    });
  });
}
