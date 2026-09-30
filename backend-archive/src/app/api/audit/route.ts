import { z } from "zod";
import { enforceRateLimit, handle, ok, parseJson } from "@/lib/api";
import { db, isDbConfigured } from "@/lib/db";
import { performanceSummary, publishingActivity } from "@/lib/metrics";
import { recordVideos, upsertChannel } from "@/lib/snapshots";
import { getChannel } from "@/lib/youtube/channels";
import { getRecentVideos } from "@/lib/youtube/videos";

const Body = z.object({
  channel: z
    .string()
    .trim()
    .min(1, "Enter a channel URL, @handle or channel ID.")
    .max(200),
  videos: z.number().int().min(5).max(50).default(30),
});

export async function POST(req: Request) {
  return handle(async () => {
    enforceRateLimit(req, "audit", 10);
    const body = await parseJson(req, Body);
    const channel = await getChannel(body.channel);
    const videos = await getRecentVideos(channel, body.videos);
    const now = Date.now();
    const activity = publishingActivity(videos, now);
    const performance = performanceSummary(videos, now);

    let auditId: string | null = null;
    if (isDbConfigured()) {
      try {
        await upsertChannel(channel);
        await recordVideos(videos);
        const audit = await db().audit.create({
          data: {
            channelId: channel.id,
            summary: { activity, performance, videoCount: videos.length },
          },
          select: { id: true },
        });
        auditId = audit.id;
      } catch (err) {
        console.error("[audit] could not save audit", err);
      }
    }
    return ok({ auditId, channel, videos, activity, performance });
  });
}
