import Link from "next/link";
import { Suspense } from "react";
import { ToolPage } from "@/components/tool/tool-page";
import { ChannelTracker } from "@/components/youtube/channel-tracker";
import { LoadingState } from "@/components/tool/states";

const SLUG = "youtube/channel-tracker";

export default function Page() {
  return (
    <ToolPage
      slug={SLUG}
      wide
      sections={[
        {
          id: "how-tracking-works",
          title: "How channel tracking works",
          body: (
            <>
              <p>
                YouTube&apos;s public API only reports a channel&apos;s <em>current</em> totals. To see how a channel
                changes over time, those totals have to be recorded repeatedly. The Channel Tracker does exactly that.
              </p>
              <ol>
                <li>When you add a channel, its subscriber count, total views and video count are stored as the first snapshot.</li>
                <li>A scheduled job captures a new snapshot for every tracked channel once a day.</li>
                <li>You can also capture a snapshot manually — at most once per hour per channel.</li>
                <li>Charts draw only the stored snapshots for the 7, 30 or 90-day range you choose.</li>
              </ol>
            </>
          ),
        },
        {
          id: "no-fabrication",
          title: "Why there's no history on day one",
          body: (
            <>
              <p>
                Some tools show a year of &ldquo;history&rdquo; for any channel the moment you search for it. Unless
                they&apos;ve been recording that channel all along, those curves are estimates.
              </p>
              <p>
                OnlineToolPro never fills gaps or back-fills estimated values. With a single snapshot you&apos;ll see a single
                value and the message &ldquo;Historical data will appear after additional snapshots are collected.&rdquo;
                After a few days you&apos;ll have a real, if short, history.
              </p>
            </>
          ),
        },
        {
          id: "example",
          title: "Example",
          body: (
            <p>
              You add a channel on the 1st with 48,200 subscribers. Daily snapshots follow. On the 30th the tracker shows
              50,100 subscribers and &ldquo;+1,900 over 29 days of snapshots&rdquo;. Because YouTube rounds public
              subscriber counts, the line moves in steps — that&apos;s the rounding, not missing data. Pair this with the{" "}
              <Link href="/youtube-tools/channel-audit">Channel Audit</Link> to relate changes to what was uploaded.
            </p>
          ),
        },
        {
          id: "limitations",
          title: "Limitations",
          body: (
            <ul>
              <li>History starts when you add a channel. We can&apos;t retrieve past values from YouTube.</li>
              <li>Subscriber counts are rounded to three significant figures and may be hidden by the channel.</li>
              <li>Total views can occasionally drop when YouTube removes invalid views.</li>
              <li>Your list is tied to a cookie in this browser. Clearing cookies starts a new list.</li>
              <li>If a tracked channel is deleted, no new snapshots are stored; existing ones remain visible.</li>
            </ul>
          ),
        },
      ]}
      faqs={[
        {
          q: "Can I see a channel's subscriber history from before I added it?",
          a: "No. The YouTube API doesn't provide historical values, and we don't estimate them. History begins with your first snapshot.",
        },
        {
          q: "How often are snapshots taken?",
          a: "Automatically once a day for every tracked channel, plus whenever you click “Snapshot now” (at most once per hour).",
        },
        {
          q: "Do I need an account?",
          a: "No. Tracked channels are linked to an anonymous cookie in your browser. You can track up to 20 channels.",
        },
        {
          q: "Why does the subscriber line look like steps?",
          a: "YouTube rounds public subscriber counts (for example 48,249 is shown as 48.2K), so the stored value only changes when the rounded figure changes.",
        },
      ]}
    >
      <Suspense fallback={<LoadingState label="Loading…" />}>
        <ChannelTracker />
      </Suspense>
    </ToolPage>
  );
}
