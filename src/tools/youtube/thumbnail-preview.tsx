import Link from "next/link";
import { ToolPage } from "@/components/tool/tool-page";
import { ToolMount } from "@/tools/mounts";

const SLUG = "youtube/thumbnail-preview";

export default function Page() {
  return (
    <ToolPage
      slug={SLUG}
      wide
      sections={[
        {
          id: "why-preview",
          title: "Why preview a thumbnail in context",
          body: (
            <>
              <p>
                Thumbnails are designed large and seen small, surrounded by other videos. A layout preview answers a
                simple question before you publish: is the thumbnail still understandable at the size and in the context
                where people actually see it?
              </p>
              <p>
                Dark mode matters too. Many viewers use YouTube&apos;s dark theme, where thumbnails with dark edges can
                blend into the background, and light thumbnails stand out more.
              </p>
            </>
          ),
        },
        {
          id: "how-it-works",
          title: "How it works",
          body: (
            <>
              <p>
                Your image is displayed inside four layouts modelled on common YouTube placements, using typical CSS
                widths: a home feed grid (about 360 px per card), a search result row, the suggested-video sidebar (about 168 px wide) and
                two phone layouts (a full-width feed and a compact list at about 160 px).
              </p>
              <p>
                You can edit the title, channel name, views and duration to see how your real metadata wraps next to the
                image, and zoom between 75% and 150%. The image is shown from memory in your browser and is never uploaded.
              </p>
            </>
          ),
        },
        {
          id: "example",
          title: "Example",
          body: (
            <p>
              A thumbnail with a small face on the right and a three-word caption might look clear in the home feed at
              roughly 350 px, but in the suggested sidebar at 168 px the face may be a few pixels tall. Switching to
              &ldquo;Suggested&rdquo; shows this immediately. The{" "}
              <Link href="/youtube-tools/thumbnail-readability">Readability Tester</Link> then measures how much detail survives at
              each size.
            </p>
          ),
        },
        {
          id: "limitations",
          title: "Limitations",
          body: (
            <ul>
              <li>Layouts are simplified mock-ups built from typical proportions, not pixel-perfect copies of YouTube.</li>
              <li>YouTube&apos;s layouts change often and differ across devices, apps and window sizes.</li>
              <li>A preview can&apos;t tell you whether a thumbnail will perform well — only how it looks at a given size.</li>
            </ul>
          ),
        },
      ]}
      faqs={[
        {
          q: "How big are YouTube thumbnails on mobile?",
          a: "It depends on the placement. In a phone's main feed a thumbnail typically spans the screen width (around 360–430 CSS pixels). In compact lists, such as suggested videos under a playing video, it is often around 160–170 pixels wide.",
        },
        {
          q: "Should I test my thumbnail in dark mode?",
          a: "Yes. Dark edges and dark backgrounds can blend into the dark interface, which changes how the thumbnail's shape reads in the feed.",
        },
        {
          q: "Is the preview exactly what YouTube shows?",
          a: "No. It's a close, simplified approximation of common layouts. It is meant for judging legibility and contrast at realistic sizes, not for reproducing YouTube's interface.",
        },
      ]}
    >
      <ToolMount id="youtube/thumbnail-preview" />
    </ToolPage>
  );
}
