import Link from "next/link";
import { ToolPage } from "@/components/tool/tool-page";
import { CompetitorTracker } from "@/components/youtube/competitor-tracker";

const SLUG = "youtube/competitor-tracker";

export default function Page() {
  return (
    <ToolPage
      slug={SLUG}
      wide
      sections={[
        {
          id: "what-it-compares",
          title: "What the competitor tracker compares",
          body: (
            <>
              <p>
                Add up to five public channels — typically your own and a few in the same niche — to see measurable
                differences in one place:
              </p>
              <ul>
                <li>
                  <strong>Overview</strong> — subscribers, total views, video count and lifetime views per video.
                </li>
                <li>
                  <strong>Growth history</strong> — change in subscribers, views or videos since the first stored snapshot,
                  on one shared scale.
                </li>
                <li>
                  <strong>Upload activity</strong> — uploads in the last 30 days, uploads per week, average length and
                  short-form share.
                </li>
                <li>
                  <strong>Video performance</strong> — average and median views, views per day, likes, comments and like
                  rate across each channel&apos;s 15 most recent uploads.
                </li>
              </ul>
            </>
          ),
        },
        {
          id: "how-it-works",
          title: "How it works",
          body: (
            <>
              <p>
                Channel statistics are fetched from the YouTube Data API in a single batched request, and each
                channel&apos;s recent uploads come from its uploads playlist. Every time you open the comparison, a snapshot
                is stored for each channel (at most hourly), and a daily job adds one more — so the growth history fills in
                over time.
              </p>
              <p>
                Channels of very different sizes are hard to compare on raw totals, so the history chart defaults to
                <strong> change since the first snapshot</strong>. Each line starts at zero, putting every channel on the
                same scale.
              </p>
            </>
          ),
        },
        {
          id: "example",
          title: "Example",
          body: (
            <p>
              Your channel uploads 6 videos in 30 days; two comparison channels upload 2 and 12. Median views are 18K, 55K
              and 9K. That&apos;s a description of difference, not a ranking: the channel with the fewest uploads has the
              highest median, and the most frequent uploader the lowest. To see which topics those channels cover, try the{" "}
              <Link href="/youtube-tools/content-gap-finder">Content Gap Finder</Link>.
            </p>
          ),
        },
        {
          id: "limitations",
          title: "Limitations",
          body: (
            <ul>
              <li>Only public statistics are used — no watch time, impressions, click-through rate or revenue.</li>
              <li>Recent performance is based on 15 uploads; newer videos have had less time to collect views.</li>
              <li>History begins when a channel is added. Earlier values aren&apos;t available and aren&apos;t estimated.</li>
              <li>Your comparison set is stored against an anonymous cookie in this browser.</li>
            </ul>
          ),
        },
      ]}
      faqs={[
        {
          q: "Does this tell me which channel is doing better?",
          a: "No. It shows measurable differences in public data. Channels have different goals, formats and audiences, so 'better' depends on what you're trying to achieve.",
        },
        {
          q: "How many channels can I compare?",
          a: "Up to five. Each channel keeps its own color throughout the charts, and five is the most that stays clearly distinguishable.",
        },
        {
          q: "Why is the growth history empty?",
          a: "History needs at least two snapshots. One is stored when you add a channel, and more are added daily and when you revisit the comparison.",
        },
      ]}
    >
      <CompetitorTracker />
    </ToolPage>
  );
}
