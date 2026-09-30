import { ToolCta } from "@/components/blog/content";
import type { PostContent } from "@/lib/blog/types";

const content: PostContent = {
  intro: (
    <>
      <p>
        When you research another channel, you&apos;re working only with public
        data. Knowing exactly what is public — and what isn&apos;t — keeps your
        conclusions honest.
      </p>
    </>
  ),
  sections: [
    {
      id: "available-publicly-via-the-youtube-data-api",
      title: "Available publicly (via the YouTube Data API)",
      body: (
        <>
          <ul>
            <li>
              Channel: subscriber count (rounded to 3 significant figures, and
              hideable by the owner), total views, video count, creation date,
              country if set.
            </li>
            <li>
              Video: view count, like count (if not hidden), comment count (if
              comments are enabled), duration, publish date, title, description
              and tags.
            </li>
          </ul>
          <ToolCta tool="youtube/channel-audit" />
        </>
      ),
    },
    {
      id: "not-public",
      title: "Not public",
      body: (
        <>
          <ul>
            <li>Impressions and impressions click-through rate</li>
            <li>Watch time and average view duration</li>
            <li>
              Traffic sources, audience demographics and returning viewers
            </li>
            <li>Revenue, RPM and CPM</li>
            <li>Dislike counts</li>
          </ul>
        </>
      ),
    },
    {
      id: "useful-descriptive-metrics-you-can-derive",
      title: "Useful descriptive metrics you can derive",
      body: (
        <>
          <p>
            Several useful numbers can be calculated from public data, as long
            as they&apos;re labelled as derived: uploads per week, median views
            of recent uploads (more robust to one viral video than the average),
            views per day since publishing, and like or comment rate per view.
          </p>
        </>
      ),
    },
    {
      id: "why-history-matters",
      title: "Why history matters",
      body: (
        <>
          <p>
            The API returns current totals only — not history. To see growth you
            need to record snapshots over time. A tracker that has stored one
            snapshot can show one data point; anything else would be an estimate
            presented as data.
          </p>
        </>
      ),
    },
  ],
};

export default content;
