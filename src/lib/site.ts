/**
 * Brand + site configuration. Change the brand here; nothing else hard-codes it.
 */
const NAME = "OnlineToolPro";
const PRODUCTION_URL = "https://onlinetoolpro.com";
// NEXT_PUBLIC_SITE_URL wins (if not empty); otherwise the real domain in production builds, localhost in development.
const URL_ = (process.env.NEXT_PUBLIC_SITE_URL || (process.env.NODE_ENV === "production" ? PRODUCTION_URL : "http://localhost:3000")).replace(/\/$/, "");

export const siteConfig = {
  name: NAME,
  tagline: "Simple tools for everyday tasks.",
  description:
    "Free online tools for images, PDFs, text, code, colors and YouTube. Compress, convert, format and calculate right in your browser, with no sign-up.",
  url: URL_,
  /** Shown on the contact, about and privacy pages. Set NEXT_PUBLIC_CONTACT_EMAIL to override (e.g. a domain address later). */
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "mohsinziadev@gmail.com",
  locale: "en_US",
  /** Set NEXT_PUBLIC_SHOW_AD_SLOTS=true to show ad placeholder boxes during layout work. */
  showAdSlots: process.env.NEXT_PUBLIC_SHOW_AD_SLOTS === "true",
  /** Google Analytics 4 measurement ID. Loaded only in production builds. Set NEXT_PUBLIC_GA_ID to override, or to "" to turn it off. */
  gaId: process.env.NEXT_PUBLIC_GA_ID ?? "G-NV9D9KQYL4",
} as const;

export function absoluteUrl(path = "/"): string {
  return `${siteConfig.url}${path.startsWith("/") ? path : `/${path}`}`;
}
