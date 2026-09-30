import type { ReactNode } from "react";
import { ExternalLink } from "lucide-react";
import { affiliateOffers, monetization } from "@/lib/monetization";

/** Inline affiliate link. Always labelled and marked rel="sponsored". */
export function AffiliateLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} rel="sponsored nofollow noopener" target="_blank">
      {children}
      <span className="sr-only"> (affiliate link)</span>
    </a>
  );
}

/** A clearly labelled recommendation card. Renders nothing until affiliates are enabled and the offer exists. */
export function AffiliateCard({ offerId }: { offerId: string }) {
  const offer = affiliateOffers.find((o) => o.id === offerId);
  if (!monetization.affiliatesEnabled || !offer) return null;
  return (
    <aside className="not-prose my-8 rounded-2xl border border-line bg-surface p-5 sm:p-6" aria-label="Recommendation">
      <p className="text-[12px] font-medium tracking-[0.06em] text-muted uppercase">Recommended · affiliate link</p>
      <p className="mt-2 text-[16px] font-medium text-ink">{offer.name}</p>
      <p className="mt-1 text-[14.5px] text-muted">{offer.description}</p>
      <a
        href={offer.url}
        rel="sponsored nofollow noopener"
        target="_blank"
        className="mt-4 inline-flex h-10 items-center gap-1.5 rounded-full border border-line px-4 text-[14px] font-medium text-ink hover:border-line-strong"
      >
        {offer.cta} <ExternalLink aria-hidden className="h-3.5 w-3.5" />
      </a>
      <p className="mt-3 text-[12px] text-muted">We may earn a commission if you buy through this link, at no extra cost to you.</p>
    </aside>
  );
}
