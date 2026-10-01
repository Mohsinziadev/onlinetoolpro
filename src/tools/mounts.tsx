"use client";

/**
 * Loads each tool's interface as its own chunk, so a page downloads only the tool
 * it shows. Every tool page is served by one route, and a route bundles every
 * client component it can reach — so interfaces must be reached through
 * next/dynamic here, not imported by the route or by page modules directly.
 * Interfaces are still rendered into the static HTML.
 *
 * Adding a tool: add its key to ./keys.ts and one line here.
 */
import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { ToolKey } from "@/tools/keys";

const mounts: Record<ToolKey, ComponentType> = {
  "text/remove-duplicate-lines": dynamic(() => import("@/components/tools/text").then((m) => m.RemoveDuplicateLines)),
  "text/sort-lines": dynamic(() => import("@/components/tools/text").then((m) => m.LineSorter)),
  "text/whitespace-remover": dynamic(() => import("@/components/tools/text").then((m) => m.WhitespaceRemover)),
  "text/text-diff": dynamic(() => import("@/components/tools/text").then((m) => m.TextDiff)),
  "text/lorem-ipsum-generator": dynamic(() => import("@/components/tools/text").then((m) => m.LoremIpsumGenerator)),
  "image/compressor": dynamic(() => import("@/components/tools/image").then((m) => m.ImageCompressor)),
  "image/resizer": dynamic(() => import("@/components/tools/image").then((m) => m.ImageResizer)),
  "image/cropper": dynamic(() => import("@/components/tools/image").then((m) => m.ImageCropper)),
  "image/converter": dynamic(() => import("@/components/tools/image").then((m) => m.ImageConverter)),
  "image/color-extractor": dynamic(() => import("@/components/tools/image").then((m) => m.ImageColorExtractor)),
  "image/image-to-base64": dynamic(() => import("@/components/tools/image").then((m) => m.ImageToBase64)),
  "image/svg-to-png": dynamic(() => import("@/components/tools/image").then((m) => m.SvgToPng)),
  "pdf/merge": dynamic(() => import("@/components/tools/pdf").then((m) => m.PdfMerger)),
  "pdf/split": dynamic(() => import("@/components/tools/pdf").then((m) => m.PdfSplitter)),
  "pdf/images-to-pdf": dynamic(() => import("@/components/tools/pdf").then((m) => m.ImagesToPdf)),
  "developer/json-formatter": dynamic(() => import("@/components/tools/developer").then((m) => m.JsonFormatter)),
  "developer/url-encoder": dynamic(() => import("@/components/tools/developer").then((m) => m.UrlEncoder)),
  "developer/base64": dynamic(() => import("@/components/tools/developer").then((m) => m.Base64Tool)),
  "developer/html-entities": dynamic(() => import("@/components/tools/developer").then((m) => m.HtmlEntities)),
  "developer/hash-generator": dynamic(() => import("@/components/tools/developer").then((m) => m.HashGenerator)),
  "developer/uuid-generator": dynamic(() => import("@/components/tools/developer").then((m) => m.UuidGenerator)),
  "developer/jwt-decoder": dynamic(() => import("@/components/tools/developer").then((m) => m.JwtDecoder)),
  "developer/timestamp-converter": dynamic(() => import("@/components/tools/developer").then((m) => m.TimestampConverter)),
  "developer/regex-tester": dynamic(() => import("@/components/tools/developer").then((m) => m.RegexTester)),
  "color/color-converter": dynamic(() => import("@/components/tools/design").then((m) => m.ColorConverter)),
  "color/contrast-checker": dynamic(() => import("@/components/tools/design").then((m) => m.ContrastChecker)),
  "color/shades-generator": dynamic(() => import("@/components/tools/design").then((m) => m.ShadesGenerator)),
  "css/gradient-generator": dynamic(() => import("@/components/tools/design").then((m) => m.GradientGenerator)),
  "css/box-shadow-generator": dynamic(() => import("@/components/tools/design").then((m) => m.BoxShadowGenerator)),
  "css/border-radius-generator": dynamic(() => import("@/components/tools/design").then((m) => m.BorderRadiusGenerator)),
  "css/minifier": dynamic(() => import("@/components/tools/design").then((m) => m.CssMinifier)),
  "productivity/qr-code-generator": dynamic(() => import("@/components/tools/misc").then((m) => m.QrCodeGenerator)),
  "productivity/password-generator": dynamic(() => import("@/components/tools/misc").then((m) => m.PasswordGenerator)),
  "productivity/list-randomizer": dynamic(() => import("@/components/tools/misc").then((m) => m.ListRandomizer)),
  "productivity/random-number-generator": dynamic(() => import("@/components/tools/misc").then((m) => m.RandomNumberGenerator)),
  "calculators/percentage-calculator": dynamic(() => import("@/components/tools/misc").then((m) => m.PercentageCalculator)),
  "calculators/age-calculator": dynamic(() => import("@/components/tools/misc").then((m) => m.AgeCalculator)),
  "seo/meta-tag-generator": dynamic(() => import("@/components/tools/misc").then((m) => m.MetaTagGenerator)),
  "seo/slug-generator": dynamic(() => import("@/components/tools/misc").then((m) => m.SlugGenerator)),
  "marketing/utm-builder": dynamic(() => import("@/components/tools/misc").then((m) => m.UtmBuilder)),
  "text/case-converter": dynamic(() => import("@/components/text/case-converter").then((m) => m.CaseConverter)),
  "text/word-counter": dynamic(() => import("@/components/text/word-counter").then((m) => m.WordCounter)),
  "youtube/comment-analyzer": dynamic(() => import("@/components/audience/comment-analyzer").then((m) => m.CommentAnalyzer)),
  "youtube/cpm-calculator": dynamic(() => import("@/components/calculators/calculators").then((m) => m.CpmCalculator)),
  "youtube/description-generator": dynamic(() => import("@/components/youtube/description-generator").then((m) => m.DescriptionGenerator)),
  "youtube/embed-generator": dynamic(() => import("@/components/youtube/embed-generator").then((m) => m.EmbedGenerator)),
  "youtube/hashtag-generator": dynamic(() => import("@/components/youtube/hashtag-generator").then((m) => m.HashtagGenerator)),
  "youtube/engagement-calculator": dynamic(() => import("@/components/calculators/calculators").then((m) => m.EngagementCalculator)),
  "youtube/revenue-calculator": dynamic(() => import("@/components/calculators/calculators").then((m) => m.RevenueCalculator)),
  "youtube/rpm-calculator": dynamic(() => import("@/components/calculators/calculators").then((m) => m.RpmCalculator)),
  "youtube/thumbnail-analyzer": dynamic(() => import("@/components/thumbnail/analyzer").then((m) => m.ThumbnailAnalyzer)),
  "youtube/thumbnail-downloader": dynamic(() => import("@/components/youtube/thumbnail-downloader").then((m) => m.ThumbnailDownloader)),
  "youtube/thumbnail-preview": dynamic(() => import("@/components/thumbnail/preview").then((m) => m.ThumbnailPreview)),
  "youtube/thumbnail-readability": dynamic(() => import("@/components/thumbnail/readability").then((m) => m.ThumbnailReadability)),
  "youtube/thumbnail-safe-zone": dynamic(() => import("@/components/thumbnail/safe-zone").then((m) => m.ThumbnailSafeZone)),
  "youtube/timestamp-generator": dynamic(() => import("@/components/utilities/timestamp-generator").then((m) => m.TimestampGenerator)),
  "youtube/video-id-finder": dynamic(() => import("@/components/utilities/video-id-finder").then((m) => m.VideoIdFinder)),
  "youtube/watch-time-calculator": dynamic(() => import("@/components/calculators/calculators").then((m) => m.WatchTimeCalculator)),
};

export function ToolMount({ id }: { id: ToolKey }) {
  const Interface = mounts[id];
  return <Interface />;
}
