import { z } from "zod";
import { enforceRateLimit, handle, ok, parseQuery } from "@/lib/api";
import { getChannel } from "@/lib/youtube/channels";

const Query = z.object({ q: z.string({ error: "Enter a channel URL, @handle or channel ID." }).trim().min(1, "Enter a channel URL, @handle or channel ID.").max(200) });

/** GET /api/youtube/channel?q=<url | @handle | channel id> */
export async function GET(req: Request) {
  return handle(async () => {
    enforceRateLimit(req, "yt-channel", 30);
    const { q } = parseQuery(req, Query);
    return ok(await getChannel(q), { cacheSeconds: 900 });
  });
}
