import { monetization } from "@/lib/monetization";

/**
 * Optional newsletter signup. Posts straight to your email provider's form
 * endpoint (NEXT_PUBLIC_NEWSLETTER_ACTION); renders nothing until that's set.
 * No popups — it only appears where it's placed.
 */
export function NewsletterSignup({ title = "Get new tools and guides by email", className }: { title?: string; className?: string }) {
  if (!monetization.newsletterAction) return null;
  return (
    <section aria-label="Newsletter" className={className}>
      <div className="rounded-2xl border border-line bg-bg-subtle p-5 sm:p-6">
        <p className="text-[16px] font-medium text-ink">{title}</p>
        <p className="mt-1 text-[14px] text-muted">Occasional emails when something new is worth your time. Unsubscribe any time.</p>
        <form action={monetization.newsletterAction} method="post" target="_blank" className="mt-4 flex flex-col gap-2 sm:flex-row">
          <label htmlFor="nl-email" className="sr-only">
            Email address
          </label>
          <input
            id="nl-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            className="h-11 flex-1 rounded-full border border-line bg-surface px-4 text-[15px] text-ink outline-none focus:border-accent/50 focus:ring-4 focus:ring-accent/10"
          />
          <button type="submit" className="h-11 rounded-full bg-cta px-5 text-[14.5px] font-medium text-cta-ink hover:bg-cta-hover">
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
}
