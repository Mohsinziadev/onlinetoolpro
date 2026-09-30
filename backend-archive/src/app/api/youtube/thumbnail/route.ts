import { enforceRateLimit, handle } from "@/lib/api";

const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;
const SIZES = new Set(["maxresdefault", "sddefault", "hqdefault", "mqdefault", "default"]);

/**
 * GET /api/youtube/thumbnail?id=<videoId>&size=<size>
 * Streams a thumbnail from YouTube's image CDN with a download filename, so
 * the browser saves it instead of opening it (cross-origin <a download> is ignored).
 */
export async function GET(req: Request) {
  return handle(async () => {
    enforceRateLimit(req, "yt-thumb", 60);
    const url = new URL(req.url);
    const id = url.searchParams.get("id") ?? "";
    const size = url.searchParams.get("size") ?? "hqdefault";
    if (!VIDEO_ID.test(id) || !SIZES.has(size)) {
      return Response.json({ error: { code: "INVALID_INPUT", message: "Invalid video or size." } }, { status: 400 });
    }
    const upstream = await fetch(`https://i.ytimg.com/vi/${id}/${size}.jpg`, { signal: AbortSignal.timeout(10_000) });
    if (!upstream.ok || !upstream.body) {
      return Response.json({ error: { code: "NOT_FOUND", message: "This size isn't available for this video." } }, { status: 404 });
    }
    return new Response(upstream.body, {
      headers: {
        "Content-Type": upstream.headers.get("Content-Type") ?? "image/jpeg",
        "Content-Disposition": `attachment; filename="youtube-thumbnail-${id}-${size}.jpg"`,
        "Cache-Control": "public, max-age=86400",
      },
    });
  });
}
