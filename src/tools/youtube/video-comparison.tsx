import Link from "next/link";
import { Suspense } from "react";
import { ToolPage } from "@/components/tool/tool-page";
import { VideoComparison } from "@/components/youtube/video-comparison";
import { LoadingState } from "@/components/tool/states";

const SLUG = "youtube/video-comparison";

export default function Page() {
  return (
    <ToolPage
      slug={SLUG}
      wide
      sections={[
        {
          id: "what-it-compares",
          title: "What the comparison shows",
          body: (
            <>
              <p>
                Add two to five public videos — yours, a competitor&apos;s or a mix — and see their public statistics side
                by side: title, channel, publish date, duration, views, likes and comments, plus calculated ratios.
              </p>
              <p>
                Raw view counts favour older videos, so the comparison also shows <strong>views per day</strong>, and
                engagement ratios that divide by views so videos of different sizes can be compared on the same scale.
              </p>
            </>
          ),
        },
        {
          id: "how-it-works",
          title: "How it works",
          body: (
            <ul>
              <li>Each link is parsed in your browser to extract the 11-character video ID.</li>
              <li>One request to the YouTube Data API <code>videos</code> endpoint returns statistics for all videos.</li>
              <li>
                <strong>Views per day</strong> = views ÷ days since publishing (minimum 1). <strong>Like rate</strong> =
                likes ÷ views × 100. <strong>Comment rate</strong> = comments ÷ views × 100.{" "}
                <strong>Engagement rate</strong> = (likes + comments) ÷ views × 100.
              </li>
              <li>The URL updates with the video IDs, so you can bookmark or share a comparison.</li>
            </ul>
          ),
        },
        {
          id: "example",
          title: "Example",
          body: (
            <p>
              Video A was published 200 days ago and has 400,000 views (2,000 per day). Video B was published 10 days ago
              and has 60,000 views (6,000 per day). A has more total views; B is currently gaining views faster. Neither
              number says which is &ldquo;better&rdquo; — they describe different things. For per-video math on your own
              numbers, use the <Link href="/youtube-tools/engagement-calculator">Engagement Calculator</Link>.
            </p>
          ),
        },
        {
          id: "limitations",
          title: "Limitations",
          body: (
            <ul>
              <li>Views per day is an average over the video&apos;s life; most videos get more views early on.</li>
              <li>Likes can be hidden and comments disabled; those ratios then show as unavailable.</li>
              <li>Private, deleted and some age-restricted videos can&apos;t be retrieved.</li>
              <li>Engagement ratios are descriptive. YouTube doesn&apos;t publish how, or whether, they affect recommendations.</li>
            </ul>
          ),
        },
      ]}
      faqs={[
        {
          q: "Can I compare Shorts with long videos?",
          a: "Yes, any public video works. Keep in mind that Shorts and long-form videos are viewed differently, so ratios aren't directly comparable across formats.",
        },
        {
          q: "Why only five videos?",
          a: "Each video gets its own distinct color in the charts, and five is the most that stays clearly distinguishable, including for colorblind viewers.",
        },
        {
          q: "Where do the numbers come from?",
          a: "The official YouTube Data API. They're the same public counts shown on YouTube, fetched at the time you run the comparison.",
        },
      ]}
    >
      <Suspense fallback={<LoadingState label="Loading…" />}>
        <VideoComparison />
      </Suspense>
    </ToolPage>
  );
}
