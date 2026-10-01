/**
 * Maps each live tool ("category/slug") to its page module — for tools with their
 * own long-form copy. Modules render their interface with <ToolMount id="…" />
 * (never by importing it directly), so each page only downloads its own tool.
 *
 * Adding a tool: create src/tools/<category>/<slug>.tsx, add one line here, and
 * add the interface to src/tools/keys.ts and src/tools/mounts.tsx.
 * Coming-soon tools live in ./registry-upcoming.ts until they launch.
 */
import type { ComponentType } from "react";

type ToolModule = { default: ComponentType };

export const toolModules: Record<string, () => Promise<ToolModule>> = {
  "text/case-converter": () => import("./text/case-converter"),
  "text/word-counter": () => import("./text/word-counter"),
  "youtube/comment-analyzer": () => import("./youtube/comment-analyzer"),
  "youtube/cpm-calculator": () => import("./youtube/cpm-calculator"),
  "youtube/description-generator": () => import("./youtube/description-generator"),
  "youtube/embed-generator": () => import("./youtube/embed-generator"),
  "youtube/hashtag-generator": () => import("./youtube/hashtag-generator"),
  "youtube/engagement-calculator": () => import("./youtube/engagement-calculator"),
  "youtube/revenue-calculator": () => import("./youtube/revenue-calculator"),
  "youtube/rpm-calculator": () => import("./youtube/rpm-calculator"),
  "youtube/thumbnail-analyzer": () => import("./youtube/thumbnail-analyzer"),
  "youtube/thumbnail-downloader": () => import("./youtube/thumbnail-downloader"),
  "youtube/thumbnail-preview": () => import("./youtube/thumbnail-preview"),
  "youtube/thumbnail-readability": () => import("./youtube/thumbnail-readability"),
  "youtube/thumbnail-safe-zone": () => import("./youtube/thumbnail-safe-zone"),
  "youtube/timestamp-generator": () => import("./youtube/timestamp-generator"),
  "youtube/video-id-finder": () => import("./youtube/video-id-finder"),
  "youtube/watch-time-calculator": () => import("./youtube/watch-time-calculator"),
};
