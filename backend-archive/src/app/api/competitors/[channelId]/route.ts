import { ApiError, handle, ok } from "@/lib/api";
import { db } from "@/lib/db";
import { CHANNEL_ID } from "@/lib/tracked";
import { getVisitorId } from "@/lib/visitor";

/** DELETE /api/competitors/:channelId — remove a channel from the comparison set. */
export async function DELETE(_req: Request, ctx: RouteContext<"/api/competitors/[channelId]">) {
  return handle(async () => {
    const { channelId } = await ctx.params;
    if (!CHANNEL_ID.test(channelId)) throw new ApiError(400, "INVALID_INPUT", "Invalid channel ID.");
    const userId = await getVisitorId({ create: false });
    const { count } = userId ? await db().competitor.deleteMany({ where: { userId, channelId } }) : { count: 0 };
    if (count === 0) throw new ApiError(404, "NOT_FOUND", "That channel isn't in your comparison.");
    return ok({ removed: channelId });
  });
}
