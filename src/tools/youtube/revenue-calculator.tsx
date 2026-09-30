import Link from "next/link";
import { ToolPage } from "@/components/tool/tool-page";
import { RevenueCalculator } from "@/components/calculators/calculators";

const SLUG = "youtube/revenue-calculator";

export default function Page() {
  return (
    <ToolPage
      slug={SLUG}
      sections={[
        {
          id: "how-youtube-pays",
          title: "How YouTube revenue is estimated",
          body: (
            <>
              <p>
                The most practical way to estimate YouTube earnings is with <strong>RPM</strong> — revenue per 1,000 views.
                RPM already includes YouTube&apos;s revenue share, views where no ad was shown, and other revenue sources in
                YouTube Studio, so it maps directly from views to what you earn.
              </p>
              <p>
                The calculator multiplies your monthly views by your RPM and scales the result to daily, weekly and yearly
                figures. It also shows how much the result moves if your RPM is 25–50% higher or lower, because RPM changes
                through the year.
              </p>
            </>
          ),
        },
        {
          id: "formula",
          title: "The formula",
          body: (
            <>
              <p>
                <code>Revenue = Views ÷ 1,000 × RPM</code>
              </p>
              <ul>
                <li>Monthly = monthly views ÷ 1,000 × RPM</li>
                <li>Yearly = monthly × 12</li>
                <li>Daily = yearly ÷ 365</li>
                <li>Weekly = daily × 7</li>
              </ul>
            </>
          ),
        },
        {
          id: "example",
          title: "Example",
          body: (
            <p>
              A channel with 250,000 monthly views and an RPM of $5.00 earns an estimated 250,000 ÷ 1,000 × $5.00 = $1,250 per
              month, $15,000 per year, or about $41 per day. If RPM drops to $3.75 in a quieter month, the monthly estimate
              becomes $937.50. Find your own RPM with the <Link href="/youtube-tools/rpm-calculator">RPM Calculator</Link>.
            </p>
          ),
        },
        {
          id: "limitations",
          title: "What affects real earnings",
          body: (
            <>
              <p>
                Actual YouTube earnings vary substantially by audience, geography, content category, monetization, ad
                inventory and other factors. This is only a mathematical estimate.
              </p>
              <ul>
                <li>
                  <strong>Audience location</strong> — advertiser demand differs by country. Audiences in the US, UK, Canada
                  and Australia often see higher demand than the global average, but ranges are wide.
                </li>
                <li>
                  <strong>Season</strong> — ad prices typically rise toward the end of the year and fall in January.
                </li>
                <li>
                  <strong>Format</strong> — Shorts, long-form videos and livestreams are monetized differently.
                </li>
                <li>
                  <strong>Topic</strong> — categories that attract high-value advertisers (finance, software) tend to have
                  higher RPMs than general entertainment.
                </li>
              </ul>
            </>
          ),
        },
      ]}
      faqs={[
        {
          q: "How much does YouTube pay per 1,000 views?",
          a: "There's no fixed rate. What you earn per 1,000 views is your RPM, which varies widely between channels and over time. The only reliable figure is the RPM shown in your own YouTube Studio analytics.",
        },
        {
          q: "What RPM should I use if I'm not monetized yet?",
          a: "Use a range rather than one number. Try a low and a high RPM and treat the results as bounds, not a forecast. The sensitivity table does this automatically.",
        },
        {
          q: "Why does this calculator use RPM instead of CPM?",
          a: "CPM is what advertisers pay per 1,000 ad impressions before YouTube's share, and it only counts monetized impressions. RPM is what you earn per 1,000 of all views, so it's the right input for estimating your income.",
        },
        {
          q: "Is the estimate guaranteed?",
          a: "No. It's arithmetic on the numbers you enter. Actual earnings depend on many factors outside any calculator's view.",
        },
      ]}
    >
      <RevenueCalculator />
    </ToolPage>
  );
}
