"use client";

/**
 * Which animated scene each tool gets, how it's framed, and how it moves
 * between steps. Every tool has its own combination, so no two "How it works"
 * sections feel the same. Scenes load on demand (one small chunk per group).
 *
 * New tool? Add a scene to src/components/demos/scenes/ and a line here —
 * or do nothing and the generic demo from src/lib/catalog/demos.ts is used.
 */
import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { SceneProps } from "@/components/demos/kit";

/** window: app window · dark: dark editor · phone: phone frame · bare: pieces float on the backdrop */
export type Frame = "window" | "dark" | "phone" | "bare";
export type Transition = "rise" | "slide" | "zoom" | "flip" | "blur" | "drop";
export type SceneSpec = {
  frame: Frame;
  transition: Transition;
  Scene: ComponentType<SceneProps>;
};

const placeholder = () => <div className="min-h-[220px]" />;
const links = (name: string) =>
  dynamic(
    () =>
      import("./scenes/links").then(
        (m) => m[name as keyof typeof m] as ComponentType<SceneProps>,
      ),
    { loading: placeholder },
  );
const writing = (name: string) =>
  dynamic(
    () =>
      import("./scenes/writing").then(
        (m) => m[name as keyof typeof m] as ComponentType<SceneProps>,
      ),
    { loading: placeholder },
  );
const thumbs = (name: string) =>
  dynamic(
    () =>
      import("./scenes/thumbnails").then(
        (m) => m[name as keyof typeof m] as ComponentType<SceneProps>,
      ),
    { loading: placeholder },
  );
const stats = (name: string) =>
  dynamic(
    () =>
      import("./scenes/stats").then(
        (m) => m[name as keyof typeof m] as ComponentType<SceneProps>,
      ),
    { loading: placeholder },
  );
const seo = (name: string) =>
  dynamic(
    () =>
      import("./scenes/seo").then(
        (m) => m[name as keyof typeof m] as ComponentType<SceneProps>,
      ),
    { loading: placeholder },
  );
const money = (name: string) =>
  dynamic(
    () =>
      import("./scenes/money").then(
        (m) => m[name as keyof typeof m] as ComponentType<SceneProps>,
      ),
    { loading: placeholder },
  );

export const scenes: Record<string, SceneSpec> = {
  "youtube/seo-checker": { frame: "window", transition: "slide", Scene: seo("SeoCheckerScene") },
  "youtube/hashtag-generator": { frame: "bare", transition: "zoom", Scene: seo("HashtagScene") },
  "youtube/description-generator": { frame: "window", transition: "drop", Scene: seo("DescriptionScene") },
  "youtube/thumbnail-downloader": {
    frame: "window",
    transition: "rise",
    Scene: links("ThumbnailDownloaderScene"),
  },
  "youtube/video-id-finder": {
    frame: "bare",
    transition: "slide",
    Scene: links("VideoIdScene"),
  },
  "youtube/channel-id-finder": {
    frame: "window",
    transition: "zoom",
    Scene: links("ChannelIdScene"),
  },
  "youtube/embed-generator": {
    frame: "dark",
    transition: "flip",
    Scene: links("EmbedScene"),
  },
  "youtube/metadata-extractor": {
    frame: "window",
    transition: "blur",
    Scene: links("MetadataScene"),
  },
  "youtube/tag-extractor": {
    frame: "bare",
    transition: "drop",
    Scene: links("TagScene"),
  },
  "youtube/timestamp-generator": {
    frame: "window",
    transition: "slide",
    Scene: writing("TimestampScene"),
  },
  "text/word-counter": {
    frame: "bare",
    transition: "rise",
    Scene: writing("WordCounterScene"),
  },
  "text/case-converter": {
    frame: "window",
    transition: "flip",
    Scene: writing("CaseScene"),
  },
  "youtube/thumbnail-analyzer": {
    frame: "window",
    transition: "zoom",
    Scene: thumbs("AnalyzerScene"),
  },
  "youtube/thumbnail-preview": {
    frame: "phone",
    transition: "blur",
    Scene: thumbs("PreviewScene"),
  },
  "youtube/thumbnail-readability": {
    frame: "bare",
    transition: "zoom",
    Scene: thumbs("ReadabilityScene"),
  },
  "youtube/thumbnail-safe-zone": {
    frame: "window",
    transition: "drop",
    Scene: thumbs("SafeZoneScene"),
  },
  "youtube/channel-audit": {
    frame: "window",
    transition: "slide",
    Scene: stats("AuditScene"),
  },
  "youtube/channel-tracker": {
    frame: "bare",
    transition: "blur",
    Scene: stats("TrackerScene"),
  },
  "youtube/competitor-tracker": {
    frame: "window",
    transition: "rise",
    Scene: stats("CompetitorScene"),
  },
  "youtube/video-comparison": {
    frame: "bare",
    transition: "zoom",
    Scene: stats("VideoComparisonScene"),
  },
  "youtube/comment-analyzer": {
    frame: "window",
    transition: "drop",
    Scene: stats("CommentsScene"),
  },
  "youtube/content-gap-finder": {
    frame: "bare",
    transition: "flip",
    Scene: stats("GapScene"),
  },
  "youtube/revenue-calculator": {
    frame: "window",
    transition: "blur",
    Scene: money("RevenueScene"),
  },
  "youtube/rpm-calculator": {
    frame: "bare",
    transition: "slide",
    Scene: money("RpmScene"),
  },
  "youtube/cpm-calculator": {
    frame: "dark",
    transition: "drop",
    Scene: money("CpmScene"),
  },
  "youtube/watch-time-calculator": {
    frame: "bare",
    transition: "flip",
    Scene: money("WatchTimeScene"),
  },
  "youtube/engagement-calculator": {
    frame: "window",
    transition: "zoom",
    Scene: money("EngagementScene"),
  },
};
