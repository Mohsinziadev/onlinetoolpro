import { ToolPage } from "@/components/tool/tool-page";
import { ToolMount } from "@/tools/mounts";

const SLUG = "youtube/watch-time-calculator";

export default function Page() {
  return (
    <ToolPage
      slug={SLUG}
      sections={[
        {
          id: "what-it-calculates",
          title: "What the watch time calculator does",
          body: (
            <p>
              It converts views and average view duration into total minutes and hours watched — handy for planning toward
              watch-hour goals or sanity-checking the numbers in YouTube Studio.
            </p>
          ),
        },
        {
          id: "formula",
          title: "The formula",
          body: (
            <>
              <p>
                <code>Total watch time = Views × Average view duration</code>
              </p>
              <p>
                Duration can be entered as <code>HH:MM:SS</code>, <code>MM:SS</code>, plain seconds, or <code>4m 30s</code>.
                The result is shown in minutes, hours and days.
              </p>
            </>
          ),
        },
        {
          id: "example",
          title: "Example",
          body: <p>25,000 views × 4:30 (270 seconds) = 6,750,000 seconds = 112,500 minutes = 1,875 hours.</p>,
        },
        {
          id: "limitations",
          title: "Limitations",
          body: (
            <ul>
              <li>Average view duration is an average — the total is exact only if the average is.</li>
              <li>Not all watch time counts toward YouTube Partner Program eligibility; check YouTube&apos;s current rules.</li>
            </ul>
          ),
        },
      ]}
      faqs={[
        { q: "How many views do I need for 4,000 watch hours?", a: "Divide 14,400,000 seconds (4,000 hours) by your average view duration in seconds. At a 5-minute average, that's 48,000 views." },
        { q: "Where do I find average view duration?", a: "YouTube Studio → Analytics → Engagement shows average view duration for your channel and each video." },
        { q: "Do Shorts views count toward watch hours?", a: "YouTube's Partner Program rules treat Shorts views separately from long-form watch hours. Check the current requirements in YouTube Help." },
      ]}
    >
      <ToolMount id="youtube/watch-time-calculator" />
    </ToolPage>
  );
}
