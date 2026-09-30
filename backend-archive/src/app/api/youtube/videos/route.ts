import { z } from "zod";
import { enforceRateLimit, handle, ok, parseQuery } from "@/lib/api";
import { getChannelsByIds } from "@/lib/youtube/channels";
import { YouTubeError } from "@/lib/youtube/errors";
import { getRecentVideos } from "@/lib/youtube/videos";

const Query = z.object({
  channelId: z.string().regex(/^UC[A-Za-z0-9_-]{22}$/, "Invalid channel ID."),
  max: z.coerce.number().int().min(1).max(50).default(30),
});

/** GET /api/youtube/videos?channelId=UC…&max=30 — a channel's most recent uploads. */
export async function GET(req: Request) {
  return handle(async () => {
    enforceRateLimit(req, "yt-videos", 30);
    const { channelId, max } = parseQuery(req, Query);
    const [channel] = await getChannelsByIds([channelId]);
    if (!channel) throw new YouTubeError("NOT_FOUND", "We couldn't find that channel.");
    return ok(await getRecentVideos(channel, max), { cacheSeconds: 900 });
  });
}
