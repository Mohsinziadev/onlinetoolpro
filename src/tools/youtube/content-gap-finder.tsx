import Link from "next/link";
import { ToolPage } from "@/components/tool/tool-page";
import { ContentGapFinder } from "@/components/youtube/content-gap-finder";

const SLUG = "youtube/content-gap-finder";

export default function Page() {
  return (
    <ToolPage
      slug={SLUG}
      wide
      sections={[
        {
          id: "what-it-does",
          title: "What the content gap finder does",
          body: (
            <>
              <p>
                It compares the recent video titles of channels in your niche with your own. Topics that appear repeatedly
                for the comparison channels — but not in your recent titles — are listed as gaps.
              </p>
              <p>
                Every topic shows exactly which channels and videos it came from, with dates and view counts, so you can
                judge whether it&apos;s relevant. Nothing is generated: this is a data discovery tool, not an idea
                generator.
              </p>
            </>
          ),
        },
        {
          id: "how-it-works",
          title: "How it works",
          body: (
            <ol>
              <li>The 50 most recent public uploads of each channel are fetched from the YouTube Data API.</li>
              <li>
                Each title is broken into 1–3 word phrases. Common words (“the”, “how”) and title filler (“ultimate”,
                “guide”, “2026”) are excluded, and phrases never bridge a common word.
              </li>
              <li>
                A topic counts as repeated when it appears in at least two comparison videos across two or more channels,
                or three videos from one channel.
              </li>
              <li>Repeated topics absent from your recent titles are gaps; ones you also use are listed as shared.</li>
            </ol>
          ),
        },
        {
          id: "example",
          title: "Example",
          body: (
            <p>
              Topic: <strong>OBS microphone settings</strong>. Found in: Channel A (2 videos) and Channel B (1 video). Not
              recently detected on: your channel. Open the videos to see how each channel approached it, then check your{" "}
              <Link href="/youtube-tools/comment-analyzer">comments</Link> to see whether your audience asks about it too.
            </p>
          ),
        },
        {
          id: "limitations",
          title: "Limitations",
          body: (
            <ul>
              <li>Only titles are analyzed — not descriptions, tags, transcripts or thumbnails.</li>
              <li>Synonyms aren&apos;t merged: “mic” and “microphone” are different words.</li>
              <li>Only the 50 most recent uploads are compared, so older coverage isn&apos;t counted.</li>
              <li>English titles work best.</li>
            </ul>
          ),
        },
      ]}
      faqs={[
        {
          q: "Is this an AI video idea generator?",
          a: "No. Every topic comes directly from real video titles, and each one lists the videos it was found in. Nothing is invented.",
        },
        {
          q: "How many channels can I compare?",
          a: "Your channel plus up to four comparison channels.",
        },
        {
          q: "Why is a topic listed that I've already covered?",
          a: "It may be in an older video, or worded differently in your titles. When your titles contain the same words in a different order, the result notes it as related wording.",
        },
      ]}
    >
      <ContentGapFinder />
    </ToolPage>
  );
}
