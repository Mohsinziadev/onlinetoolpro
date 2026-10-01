/**
 * Page modules for tools that are "Coming soon" because they need a backend or
 * API (see backend-archive/README.md). Nothing imports this file, so none of
 * this code ships to visitors.
 *
 * To launch one: move its line into ./registry.ts, switch the module to
 * <ToolMount id="…" /> (add it to ./keys.ts and ./mounts.tsx), and set the
 * tool's status to "live" in the catalog.
 */
import type { ComponentType } from "react";

type ToolModule = { default: ComponentType };

export const upcomingToolModules: Record<string, () => Promise<ToolModule>> = {
  "youtube/channel-audit": () => import("./youtube/channel-audit"),
  "youtube/channel-id-finder": () => import("./youtube/channel-id-finder"),
  "youtube/channel-tracker": () => import("./youtube/channel-tracker"),
  "youtube/competitor-tracker": () => import("./youtube/competitor-tracker"),
  "youtube/content-gap-finder": () => import("./youtube/content-gap-finder"),
  "youtube/metadata-extractor": () => import("./youtube/metadata-extractor"),
  "youtube/seo-checker": () => import("./youtube/seo-checker"),
  "youtube/tag-extractor": () => import("./youtube/tag-extractor"),
  "youtube/video-comparison": () => import("./youtube/video-comparison"),
};
