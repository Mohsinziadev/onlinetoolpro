import { ToolPage } from "@/components/tool/tool-page";
import { ToolMount } from "@/tools/mounts";

const SLUG = "youtube/engagement-calculator";

export default function Page() {
  return (
    <ToolPage
      slug={SLUG}
      sections={[
        {
          id: "what-it-calculates",
          title: "What the engagement calculator shows",
          body: (
            <p>
              It turns public view, like and comment counts into ratios, so videos of different sizes can be compared on the
              same scale: like rate, comment rate, combined engagement rate, likes per comment and comments per 1,000 views.
            </p>
          ),
        },
        {
          id: "formulas",
          title: "Formulas",
          body: (
            <ul>
              <li>
                <code>Like rate = Likes ÷ Views × 100</code>
              </li>
              <li>
                <code>Comment rate = Comments ÷ Views × 100</code>
              </li>
              <li>
                <code>Engagement rate = (Likes + Comments) ÷ Views × 100</code>
              </li>
            </ul>
          ),
        },
        {
          id: "example",
          title: "Example",
          body: (
            <p>
              48,000 views, 1,900 likes and 140 comments give a like rate of 3.96%, a comment rate of 0.292% and an
              engagement rate of 4.25%. Run the numbers for a few of your videos to see which formats get people
              talking.
            </p>
          ),
        },
        {
          id: "limitations",
          title: "Limitations",
          body: (
            <ul>
              <li>These ratios are descriptive. YouTube doesn&apos;t define an official engagement rate or publish how likes affect ranking.</li>
              <li>Shares, saves and watch time aren&apos;t public, so they can&apos;t be included.</li>
              <li>Ratios fall naturally as a video reaches broader audiences beyond its core viewers.</li>
            </ul>
          ),
        },
      ]}
      faqs={[
        { q: "What's a good engagement rate on YouTube?", a: "It depends on format, topic, audience and video age. Compare against your own past videos rather than a universal benchmark." },
        { q: "Why do likes and comments count equally?", a: "The combined rate is a simple sum so it's transparent. Look at like rate and comment rate separately for more detail." },
        { q: "Can I calculate this for any public video?", a: "Yes — views, likes and comments are public unless likes are hidden or comments are off. Leave a field empty if it isn't available." },
      ]}
    >
      <ToolMount id="youtube/engagement-calculator" />
    </ToolPage>
  );
}
