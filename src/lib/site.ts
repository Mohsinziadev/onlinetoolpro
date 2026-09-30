/**
 * Brand + site configuration. Change the brand here; nothing else hard-codes it.
 */
const NAME = "OnlineToolPro";
const PRODUCTION_URL = "https://onlinetoolpro.com";
// NEXT_PUBLIC_SITE_URL wins (if not empty); otherwise the real domain in production builds, localhost in development.
const URL_ = (process.env.NEXT_PUBLIC_SITE_URL || (process.env.NODE_ENV === "production" ? PRODUCTION_URL : "http://localhost:3000")).replace(/\/$/, "");

/**
 * The domain emails live on: the real site domain once it's configured,
 * otherwise "<name>.com" (onlinetoolpro.com). Local and placeholder hosts are ignored.
 */
function emailDomain(): string {
  try {
    const host = new URL(URL_).hostname.replace(/^www\./, "");
    if (host.includes(".") && !/^(localhost|127\.|your-domain\.)/.test(host)) return host;
  } catch {
    // fall through
  }
  return `${NAME.toLowerCase()}.com`;
}

export const siteConfig = {
  name: NAME,
  tagline: "Simple tools for everyday tasks.",
  description:
    "Free, simple online tools that help you get everyday tasks done faster — no technical knowledge and no sign-up required.",
  url: URL_,
  /** hello@onlinetoolpro.com by default — set NEXT_PUBLIC_CONTACT_EMAIL to override. */
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? `hello@${emailDomain()}`,
  locale: "en_US",
  /** Set NEXT_PUBLIC_SHOW_AD_SLOTS=true to show ad placeholder boxes during layout work. */
  showAdSlots: process.env.NEXT_PUBLIC_SHOW_AD_SLOTS === "true",
} as const;

export function absoluteUrl(path = "/"): string {
  return `${siteConfig.url}${path.startsWith("/") ? path : `/${path}`}`;
}
