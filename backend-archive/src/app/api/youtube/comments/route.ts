import { z } from "zod";
import { ApiError, enforceRateLimit, handle, ok, parseQuery } from "@/lib/api";
import { getComments } from "@/lib/youtube/comments";
import { parseVideoInput } from "@/lib/youtube/parse";
import { getVideosByIds } from "@/lib/youtube/videos";

const Query = z.object({
  video: z.string({ error: "Enter a YouTube video URL or ID." }).trim().min(1, "Enter a YouTube video URL or ID.").max(500),
  max: z.coerce.number().int().min(20).max(500).default(300),
});

/** GET /api/youtube/comments?video=<url or id>&max=300 — public top-level comments. */
export async function GET(req: Request) {
  return handle(async () => {
    enforceRateLimit(req, "yt-comments", 10);
    const { video, max } = parseQuery(req, Query);
    const parsed = parseVideoInput(video);
    if (!parsed) throw new ApiError(400, "INVALID_INPUT", "That doesn't look like a YouTube video URL or ID.");
    const [info] = await getVideosByIds([parsed.id]);
    if (!info) throw new ApiError(404, "NOT_FOUND", "We couldn't find that video. It may be private or deleted.");
    const comments = await getComments(parsed.id, max);
    return ok({ video: info, comments }, { cacheSeconds: 1800 });
  });
}
