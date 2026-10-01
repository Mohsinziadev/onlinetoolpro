import { ogImage } from "@/lib/og";

/** /og.png — the site-wide social share image (home and standard pages), built at build time. */
export const dynamic = "force-static";

export function GET() {
  return ogImage({ eyebrow: "Free online tools", title: "Simple tools for everyday tasks.", subtitle: "Image, PDF, text, developer and YouTube tools. Free, no sign-up." });
}
