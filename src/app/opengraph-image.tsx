import { ogContentType, ogImage, ogSize } from "@/lib/og";
import { siteConfig } from "@/lib/site";

/** Generated once at build time (static export). */
export const dynamic = "force-static";

export const alt = `${siteConfig.name} — free online tools for everyday tasks`;
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return ogImage({ eyebrow: "Free online tools", title: "Simple tools for everyday tasks.", subtitle: "YouTube, text and more — no technical knowledge required." });
}
