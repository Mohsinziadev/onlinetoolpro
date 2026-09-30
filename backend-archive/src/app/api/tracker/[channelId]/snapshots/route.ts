import { z } from "zod";
import { ApiError, enforceRateLimit, handle, ok, parseQuery } from "@/lib/api";
import { getSnapshots } from "@/lib/snapshots";
import { CHANNEL_ID } from "@/lib/tracked";

const Query = z.object({ days: z.coerce.number().int().min(1).max(365).default(90) });

/** GET /api/tracker/:channelId/snapshots?days=90 — stored historical snapshots (public data). */
export async function GET(req: Request, ctx: RouteContext<"/api/tracker/[channelId]/snapshots">) {
  return handle(async () => {
    enforceRateLimit(req, "snapshots-read", 60);
    const { channelId } = await ctx.params;
    if (!CHANNEL_ID.test(channelId)) throw new ApiError(400, "INVALID_INPUT", "Invalid channel ID.");
    const { days } = parseQuery(req, Query);
    const snaps = await getSnapshots([channelId], days);
    return ok({ channelId, days, snapshots: snaps[channelId] ?? [] });
  });
}
