import Link from "next/link";
import { Suspense } from "react";
import { ToolPage } from "@/components/tool/tool-page";
import { ChannelAudit } from "@/components/youtube/channel-audit";
import { LoadingState } from "@/components/tool/states";

const SLUG = "youtube/channel-audit";

export default function Page() {
  return (
    <ToolPage
      slug={SLUG}
      wide
      sections={[
        {
          id: "what-you-get",
          title: "What the channel audit shows",
          body: (
            <>
              <p>
                Paste a channel URL, an @handle or a channel ID and the audit gathers the channel&apos;s public details and
                its 30 most recent uploads, then calculates descriptive statistics you&apos;d otherwise work out by hand in
                a spreadsheet.
              </p>
              <ul>
                <li>
                  <strong>Overview</strong> — subscribers (when public), total views, video count, creation date, country
                  and description.
                </li>
                <li>
                  <strong>Publishing activity</strong> — uploads in the last 7 and 30 days, average uploads per week,
                  average video length and a weekly upload chart.
                </li>
                <li>
                  <strong>Recent video performance</strong> — average and median views, average likes and comments, and
                  views per day.
                </li>
                <li>
                  <strong>Recent videos</strong> — a sortable table with every analyzed upload.
                </li>
              </ul>
            </>
          ),
        },
        {
          id: "how-it-works",
          title: "How the numbers are calculated",
          body: (
            <>
              <p>
                Data comes from the official YouTube Data API v3: the <code>channels</code> endpoint for the overview, the
                channel&apos;s uploads playlist for recent video IDs, and the <code>videos</code> endpoint for statistics.
              </p>
              <ul>
                <li>
                  <strong>Average uploads per week</strong> = analyzed uploads ÷ days from the oldest analyzed upload to
                  today × 7.
                </li>
                <li>
                  <strong>Views per day</strong> = a video&apos;s views ÷ days since it was published (minimum one day).
                </li>
                <li>
                  <strong>Median views</strong> is the middle value, which is less sensitive to one viral video than the
                  average.
                </li>
                <li>
                  <strong>Like rate</strong> = likes ÷ views × 100. Videos with hidden likes are excluded.
                </li>
              </ul>
              <p>These are OnlineToolPro calculations based on public counts. They aren&apos;t official YouTube metrics.</p>
            </>
          ),
        },
        {
          id: "example",
          title: "Example",
          body: (
            <p>
              A channel shows 30 analyzed uploads over 105 days: that&apos;s 2.0 uploads per week. Average views are 84,000
              but the median is 31,000 — so a few videos are pulling the average up. Sorting the table by views per day
              shows which recent uploads are still collecting views fastest. To see how the channel&apos;s totals change
              over time, add it to the <Link href="/youtube-tools/channel-tracker">Channel Tracker</Link>.
            </p>
          ),
        },
        {
          id: "limitations",
          title: "Limitations",
          body: (
            <ul>
              <li>
                Only public data is available. Watch time, impressions, click-through rate, traffic sources and revenue
                are private to the channel owner.
              </li>
              <li>Subscriber counts are rounded by YouTube and can be hidden by the channel.</li>
              <li>Shorts aren&apos;t labelled by the API; videos of 60 seconds or less are used as an approximation.</li>
              <li>Newer videos have had less time to gather views, which affects averages over short windows.</li>
              <li>Scheduled premieres and upcoming livestreams are excluded.</li>
            </ul>
          ),
        },
      ]}
      faqs={[
        {
          q: "Can I audit any YouTube channel?",
          a: "Any channel with public videos. Private channels, terminated channels and channels without public uploads return limited or no data.",
        },
        {
          q: "Why is the subscriber count rounded or missing?",
          a: "YouTube publicly shows subscriber counts rounded to three significant figures, and channel owners can hide them entirely. We display exactly what the API returns.",
        },
        {
          q: "Is this the same data as YouTube Studio?",
          a: "No. YouTube Studio includes private analytics such as watch time, impressions and revenue. This audit uses only public data that anyone can see.",
        },
        {
          q: "How many videos are analyzed?",
          a: "The 30 most recent public uploads. That's enough to describe current publishing habits without mixing in very old videos.",
        },
      ]}
    >
      <Suspense fallback={<LoadingState label="Loading…" />}>
        <ChannelAudit />
      </Suspense>
    </ToolPage>
  );
}
