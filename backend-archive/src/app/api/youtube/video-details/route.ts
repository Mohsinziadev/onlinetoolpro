import { z } from "zod";
import { ApiError, enforceRateLimit, handle, ok, parseQuery } from "@/lib/api";
import { parseVideoInput } from "@/lib/youtube/parse";
import { getVideoDetails } from "@/lib/youtube/videos";

const Query = z.object({
  v: z.string({ error: "Paste a YouTube video link." }).trim().min(1, "Paste a YouTube video link.").max(500),
});

/** GET /api/youtube/video-details?v=<url or id> — title, description, tags, stats. */
export async function GET(req: Request) {
  return handle(async () => {
    enforceRateLimit(req, "yt-video-details", 30);
    const { v } = parseQuery(req, Query);
    const parsed = parseVideoInput(v);
    if (!parsed) throw new ApiError(400, "INVALID_INPUT", "That doesn't look like a YouTube video link. Try copying it again from the address bar or the Share button.");
    const details = await getVideoDetails(parsed.id);
    if (!details) throw new ApiError(404, "NOT_FOUND", "We couldn't find that video. It may be private, deleted or age-restricted.");
    return ok(details, { cacheSeconds: 600 });
  });
}
