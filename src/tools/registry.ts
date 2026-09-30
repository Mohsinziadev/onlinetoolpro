/**
 * Maps each live tool ("category/slug") to its page module. Modules are loaded
 * on demand, so adding a tool never grows the bundle of other pages.
 *
 * Adding a tool: create src/tools/<category>/<slug>.tsx and add one line here.
 */
import type { ComponentType } from "react";

type ToolModule = { default: ComponentType };

export const toolModules: Record<string, () => Promise<ToolModule>> = {
  "text/case-converter": () => import("./text/case-converter"),
  "text/word-counter": () => import("./text/word-counter"),
  "youtube/channel-audit": () => import("./youtube/channel-audit"),
  "youtube/channel-id-finder": () => import("./youtube/channel-id-finder"),
  "youtube/channel-tracker": () => import("./youtube/channel-tracker"),
  "youtube/comment-analyzer": () => import("./youtube/comment-analyzer"),
  "youtube/competitor-tracker": () => import("./youtube/competitor-tracker"),
  "youtube/content-gap-finder": () => import("./youtube/content-gap-finder"),
  "youtube/cpm-calculator": () => import("./youtube/cpm-calculator"),
  "youtube/description-generator": () => import("./youtube/description-generator"),
  "youtube/embed-generator": () => import("./youtube/embed-generator"),
  "youtube/hashtag-generator": () => import("./youtube/hashtag-generator"),
  "youtube/engagement-calculator": () => import("./youtube/engagement-calculator"),
  "youtube/metadata-extractor": () => import("./youtube/metadata-extractor"),
  "youtube/revenue-calculator": () => import("./youtube/revenue-calculator"),
  "youtube/rpm-calculator": () => import("./youtube/rpm-calculator"),
  "youtube/seo-checker": () => import("./youtube/seo-checker"),
  "youtube/tag-extractor": () => import("./youtube/tag-extractor"),
  "youtube/thumbnail-analyzer": () => import("./youtube/thumbnail-analyzer"),
  "youtube/thumbnail-downloader": () => import("./youtube/thumbnail-downloader"),
  "youtube/thumbnail-preview": () => import("./youtube/thumbnail-preview"),
  "youtube/thumbnail-readability": () => import("./youtube/thumbnail-readability"),
  "youtube/thumbnail-safe-zone": () => import("./youtube/thumbnail-safe-zone"),
  "youtube/timestamp-generator": () => import("./youtube/timestamp-generator"),
  "youtube/video-comparison": () => import("./youtube/video-comparison"),
  "youtube/video-id-finder": () => import("./youtube/video-id-finder"),
  "youtube/watch-time-calculator": () => import("./youtube/watch-time-calculator"),
};
