import Link from "next/link";
import { ToolPage } from "@/components/tool/tool-page";
import { ToolMount } from "@/tools/mounts";

const SLUG = "youtube/rpm-calculator";

export default function Page() {
  return (
    <ToolPage
      slug={SLUG}
      sections={[
        {
          id: "what-is-rpm",
          title: "What is RPM on YouTube?",
          body: (
            <p>
              RPM (revenue per mille) is the amount you earn for every 1,000 views. It&apos;s calculated after YouTube&apos;s
              revenue share and across all views — including views where no ad was shown — so it describes your real
              earnings per view better than CPM does.
            </p>
          ),
        },
        {
          id: "formula",
          title: "How RPM is calculated",
          body: (
            <>
              <p>
                <code>RPM = Revenue ÷ Views × 1,000</code>
              </p>
              <p>
                Use revenue and views from the same period. The calculator also shows revenue per single view, which is RPM
                divided by 1,000.
              </p>
            </>
          ),
        },
        {
          id: "example",
          title: "Example",
          body: (
            <p>
              You earned $850 from 210,000 views last month. $850 ÷ 210,000 = $0.00405 per view, × 1,000 = an RPM of $4.05.
              Plug that RPM into the <Link href="/youtube-tools/revenue-calculator">Revenue Calculator</Link> to estimate
              future months.
            </p>
          ),
        },
        {
          id: "limitations",
          title: "Limitations",
          body: (
            <ul>
              <li>RPM reflects a past period; it shifts with seasons, audience mix and content.</li>
              <li>Mixing periods (e.g. yearly revenue with monthly views) produces a meaningless result.</li>
              <li>Channel-level RPM can hide large differences between individual videos.</li>
            </ul>
          ),
        },
      ]}
      faqs={[
        { q: "What's the difference between RPM and CPM?", a: "CPM is what advertisers pay per 1,000 monetized ad impressions, before YouTube's share. RPM is what you earn per 1,000 views of any kind, after YouTube's share. RPM is almost always lower." },
        { q: "Where do I find my RPM?", a: "In YouTube Studio under Analytics → Revenue. You can also calculate it here from your revenue and views." },
        { q: "Why is my RPM lower than other creators'?", a: "Audience location, content category, video length, season and the share of views that show ads all influence RPM." },
      ]}
    >
      <ToolMount id="youtube/rpm-calculator" />
    </ToolPage>
  );
}
