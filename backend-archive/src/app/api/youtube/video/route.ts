import { z } from "zod";
import { enforceRateLimit, handle, ok, parseQuery } from "@/lib/api";
import { parseVideoInput } from "@/lib/youtube/parse";
import { getVideosByIds } from "@/lib/youtube/videos";

const Query = z.object({
  ids: z
    .string({ error: "Add at least one video URL or ID." })
    .trim()
    .min(1, "Add at least one video URL or ID.")
    .max(2000)
    .transform((s) => s.split(/[\s,]+/).filter(Boolean))
    .pipe(z.array(z.string()).min(1).max(10, "Compare up to 10 videos at a time.")),
});

/**
 * GET /api/youtube/video?ids=<url or id>,<url or id>
 * Returns found videos plus which inputs were invalid or not found.
 */
export async function GET(req: Request) {
  return handle(async () => {
    enforceRateLimit(req, "yt-video", 30);
    const { ids } = parseQuery(req, Query);
    const parsed = ids.map((input) => ({ input, parsed: parseVideoInput(input) }));
    const invalid = parsed.filter((p) => !p.parsed).map((p) => p.input);
    const videoIds = parsed.flatMap((p) => (p.parsed ? [p.parsed.id] : []));
    const videos = await getVideosByIds(videoIds);
    const found = new Set(videos.map((v) => v.id));
    const notFound = [...new Set(videoIds.filter((id) => !found.has(id)))];
    return ok({ videos, invalid, notFound }, { cacheSeconds: 600 });
  });
}
