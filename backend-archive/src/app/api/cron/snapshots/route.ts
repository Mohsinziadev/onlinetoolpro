import { NextResponse } from "next/server";
import { snapshotAllTrackedChannels } from "@/lib/snapshots";

export const maxDuration = 300;

/**
 * GET /api/cron/snapshots — scheduled job that snapshots every tracked or
 * compared channel. Protected by CRON_SECRET (Vercel Cron sends it as a
 * Bearer token). Any external scheduler can call it the same way.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Unauthorized" } }, { status: 401 });
  }
  try {
    const result = await snapshotAllTrackedChannels();
    return NextResponse.json({ ok: true, ...result, at: new Date().toISOString() });
  } catch (err) {
    console.error("[cron] snapshot job failed", err);
    return NextResponse.json({ ok: false, error: "Snapshot job failed" }, { status: 500 });
  }
}
