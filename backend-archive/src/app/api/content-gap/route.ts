import { z } from "zod";
import { ApiError, enforceRateLimit, handle, ok, parseJson } from "@/lib/api";
import { findContentGaps } from "@/lib/text/content-gap";
import { getChannel } from "@/lib/youtube/channels";
import { YouTubeError } from "@/lib/youtube/errors";
import { getRecentVideos } from "@/lib/youtube/videos";

const channelInput = z.string().trim().min(1, "Every channel field needs a URL, @handle or ID.").max(200);
const Body = z.object({
  target: channelInput,
  comparisons: z.array(channelInput).min(1, "Add at least one comparison channel.").max(4, "Use up to four comparison channels."),
  videos: z.number().int().min(10).max(50).default(50),
});

/**
 * POST /api/content-gap { target, comparisons[], videos? }
 * Finds title topics repeated across comparison channels' recent uploads that
 * don't appear in the target channel's recent uploads. ~3 quota units per channel.
 */
export async function POST(req: Request) {
  return handle(async () => {
    enforceRateLimit(req, "content-gap", 6);
    const body = await parseJson(req, Body);

    const resolve = async (input: string, role: string) => {
      try {
        const channel = await getChannel(input);
        return { channel, videos: await getRecentVideos(channel, body.videos) };
      } catch (err) {
        if (err instanceof YouTubeError && (err.code === "NOT_FOUND" || err.code === "INVALID_INPUT")) {
          throw new ApiError(err.status, err.code, `${role} (“${input}”): ${err.message}`);
        }
        throw err;
      }
    };

    const target = await resolve(body.target, "Your channel");
    const comparisons = await Promise.all(body.comparisons.map((c, i) => resolve(c, `Comparison channel ${i + 1}`)));
    const ids = new Set([target.channel.id]);
    for (const c of comparisons) {
      if (ids.has(c.channel.id)) throw new ApiError(400, "DUPLICATE", `${c.channel.title} was entered more than once.`);
      ids.add(c.channel.id);
    }
    if (target.videos.length === 0) throw new ApiError(422, "NO_VIDEOS", `${target.channel.title} has no public uploads to compare against.`);
    return ok(findContentGaps(target, comparisons), { cacheSeconds: 900 });
  });
}
