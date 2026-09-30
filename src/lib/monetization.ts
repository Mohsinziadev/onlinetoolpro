/**
 * Monetization switches. Everything is off by default, so nothing ships until
 * it's deliberately enabled with an environment variable.
 *
 *  NEXT_PUBLIC_SHOW_AD_SLOTS=true   show reserved ad spaces (see components/ad-placeholder.tsx)
 *  NEXT_PUBLIC_AFFILIATES=true      show affiliate recommendations
 *  NEXT_PUBLIC_NEWSLETTER_ACTION    form action URL from your email provider (enables the signup box)
 *
 * Rules the components enforce: ads never sit inside a tool or look like a
 * download button; affiliate links are labelled and use rel="sponsored nofollow".
 */
export const monetization = {
  affiliatesEnabled: process.env.NEXT_PUBLIC_AFFILIATES === "true",
  newsletterAction: process.env.NEXT_PUBLIC_NEWSLETTER_ACTION ?? "",
} as const;

/** Affiliate offers, keyed by id. Add real partners here — only where genuinely relevant to the page. */
export type AffiliateOffer = { id: string; name: string; description: string; url: string; cta: string };
export const affiliateOffers: AffiliateOffer[] = [];
