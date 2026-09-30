import { ApiError, handle, ok } from "@/lib/api";
import { db } from "@/lib/db";
import { CHANNEL_ID } from "@/lib/tracked";
import { getVisitorId } from "@/lib/visitor";

/** DELETE /api/tracker/:channelId — stop tracking. Snapshots are kept for other trackers. */
export async function DELETE(_req: Request, ctx: RouteContext<"/api/tracker/[channelId]">) {
  return handle(async () => {
    const { channelId } = await ctx.params;
    if (!CHANNEL_ID.test(channelId)) throw new ApiError(400, "INVALID_INPUT", "Invalid channel ID.");
    const userId = await getVisitorId({ create: false });
    if (!userId) throw new ApiError(404, "NOT_FOUND", "That channel isn't in your tracker.");
    const { count } = await db().trackedChannel.deleteMany({ where: { userId, channelId } });
    if (count === 0) throw new ApiError(404, "NOT_FOUND", "That channel isn't in your tracker.");
    return ok({ removed: channelId });
  });
}
