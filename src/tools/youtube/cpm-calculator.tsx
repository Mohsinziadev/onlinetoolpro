import Link from "next/link";
import { ToolPage } from "@/components/tool/tool-page";
import { CpmCalculator } from "@/components/calculators/calculators";

const SLUG = "youtube/cpm-calculator";

export default function Page() {
  return (
    <ToolPage
      slug={SLUG}
      sections={[
        {
          id: "what-is-cpm",
          title: "What is CPM on YouTube?",
          body: (
            <p>
              CPM (cost per mille) is the price advertisers pay for 1,000 ad impressions. On YouTube, the CPM in Studio is
              calculated on <strong>monetized</strong> impressions — times an ad was actually shown — and before
              YouTube&apos;s revenue share.
            </p>
          ),
        },
        {
          id: "cpm-vs-rpm",
          title: "CPM vs RPM",
          body: (
            <>
              <ul>
                <li>
                  <strong>CPM</strong> = ad revenue ÷ monetized impressions × 1,000. Advertiser&apos;s side, gross.
                </li>
                <li>
                  <strong>RPM</strong> = total revenue ÷ all views × 1,000. Creator&apos;s side, net.
                </li>
              </ul>
              <p>
                RPM is usually lower because it&apos;s after the revenue share and includes views without ads. Enter your
                total revenue and views in the optional fields to see both side by side. More detail in our{" "}
                <Link href="/blog/rpm-vs-cpm-explained">RPM vs CPM guide</Link>.
              </p>
            </>
          ),
        },
        {
          id: "example",
          title: "Example",
          body: <p>$1,200 of ad revenue from 150,000 monetized impressions: $1,200 ÷ 150,000 × 1,000 = a CPM of $8.00.</p>,
        },
        {
          id: "limitations",
          title: "Limitations",
          body: (
            <ul>
              <li>CPM measures advertiser demand, not your income — use RPM to estimate earnings.</li>
              <li>A single view can carry several ad impressions, so impressions and views aren&apos;t interchangeable.</li>
            </ul>
          ),
        },
      ]}
      faqs={[
        { q: "Why is my CPM higher than my RPM?", a: "CPM is gross and counted only on impressions with ads. RPM is net of YouTube's share and divided by every view, including views with no ads." },
        { q: "Can I increase my CPM?", a: "CPM depends mostly on advertiser demand for your audience and topic, and on the season. It isn't a setting you control directly." },
        { q: "Is playback-based CPM the same thing?", a: "Playback-based CPM counts playbacks with at least one ad instead of individual impressions. Use whichever figures match the numbers you enter." },
      ]}
    >
      <CpmCalculator />
    </ToolPage>
  );
}
