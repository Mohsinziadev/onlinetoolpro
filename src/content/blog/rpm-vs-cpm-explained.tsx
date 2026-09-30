import { ToolCta } from "@/components/blog/content";
import type { PostContent } from "@/lib/blog/types";

const content: PostContent = {
  intro: (
    <>
      <p>
        YouTube Studio shows two revenue-per-thousand numbers that look similar
        and are frequently confused. They answer different questions, and mixing
        them up is the most common reason revenue estimates come out wrong.
      </p>
    </>
  ),
  sections: [
    {
      id: "cpm-the-advertiser-s-side",
      title: "CPM: the advertiser's side",
      body: (
        <>
          <p>
            CPM (cost per mille) is the amount advertisers pay for 1,000
            monetized ad impressions, before YouTube&apos;s revenue share. It
            only counts views where an ad was actually shown.
          </p>
          <p>
            <code>CPM = ad revenue ÷ monetized ad impressions × 1,000</code>
          </p>
          <ToolCta tool="youtube/cpm-calculator" />
        </>
      ),
    },
    {
      id: "rpm-the-creator-s-side",
      title: "RPM: the creator's side",
      body: (
        <>
          <p>
            RPM (revenue per mille) is what you earned per 1,000 views, after
            YouTube&apos;s share, across every view — including views where no
            ad ran — and including other revenue sources shown in Studio such as
            memberships or Super Thanks.
          </p>
          <p>
            <code>RPM = total revenue ÷ total views × 1,000</code>
          </p>
        </>
      ),
    },
    {
      id: "why-rpm-is-almost-always-lower-than-cpm",
      title: "Why RPM is almost always lower than CPM",
      body: (
        <>
          <ul>
            <li>RPM is net of YouTube&apos;s revenue share; CPM is gross.</li>
            <li>
              RPM divides by all views, while CPM divides only by monetized
              impressions. Views with no ad (ad blockers, ineligible content,
              viewers who already saw an ad) lower RPM but not CPM.
            </li>
            <li>
              One view can contain several ad impressions, which pushes
              CPM-based numbers up relative to per-view numbers.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "which-one-should-you-use-for-estimates",
      title: "Which one should you use for estimates?",
      body: (
        <>
          <p>
            Use RPM when estimating your own earnings from views, because it
            already includes the revenue share and unmonetized views. Use CPM
            when you want to understand advertiser demand — for example, how
            much seasonal ad pricing changes in Q4.
          </p>
          <p>
            Both vary substantially by audience geography, content category,
            time of year, video length and viewer device. Audiences in the US,
            UK, Canada and Australia often see higher advertiser demand than the
            global average, but your own Studio numbers are the only reliable
            input.
          </p>
        </>
      ),
    },
  ],
};

export default content;
