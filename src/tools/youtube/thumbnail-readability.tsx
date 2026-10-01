import Link from "next/link";
import { ToolPage } from "@/components/tool/tool-page";
import { ToolMount } from "@/tools/mounts";

const SLUG = "youtube/thumbnail-readability";

export default function Page() {
  return (
    <ToolPage
      slug={SLUG}
      sections={[
        {
          id: "what-it-does",
          title: "What the readability test does",
          body: (
            <>
              <p>
                The tester renders your thumbnail at 100%, 75%, 50%, 25%, 15% and 10% of YouTube&apos;s recommended
                1280-pixel width — from 1280 px down to 128 px. Each tile is drawn at its true size so you see exactly
                what a viewer sees.
              </p>
              <p>
                For every size it measures <strong>detail retention</strong>: how much of the original edge contrast
                survives. When text-like regions are detected, retention is measured there specifically, because small
                text is usually the first thing to disappear.
              </p>
            </>
          ),
        },
        {
          id: "how-it-works",
          title: "How it works",
          body: (
            <ol>
              <li>The image is scaled down to each test width with high-quality browser resampling.</li>
              <li>The small version is scaled back up to the original size (up to 1280 px) so it can be compared pixel-for-pixel with the original.</li>
              <li>
                A Sobel filter measures edge strength in both. Retention is the fraction of original edge strength still
                present, capped to ignore sharpening artefacts.
              </li>
              <li>You mark each size as readable or not. Your judgement is shown separately from the measurement.</li>
            </ol>
          ),
        },
        {
          id: "example",
          title: "Example",
          body: (
            <p>
              A thumbnail with a bold two-word headline and a smaller subtitle might keep 80% of text-like detail at 50%,
              55% at 25% and 30% at 15%. The headline is probably still readable at 15%; the subtitle probably isn&apos;t.
              Mark what you can actually read, then try a version with the subtitle removed or enlarged and compare. The{" "}
              <Link href="/youtube-tools/thumbnail-analyzer">Thumbnail Analyzer</Link> shows the contrast values behind the
              result.
            </p>
          ),
        },
        {
          id: "limitations",
          title: "Limitations",
          body: (
            <ul>
              <li>Detail retention is a proxy. It doesn&apos;t read text and can&apos;t know which words matter.</li>
              <li>Displays with high pixel density show small thumbnails with more physical pixels than this test assumes.</li>
              <li>Thresholds (70% and 40%) are guides for where to look, not pass/fail rules.</li>
              <li>Nothing here predicts click-through rate or views.</li>
            </ul>
          ),
        },
      ]}
      faqs={[
        {
          q: "What's the smallest size I should test?",
          a: "Around 120–170 pixels wide covers the smallest common placements, such as suggested videos on mobile. The 15% (192 px) and 10% (128 px) tiles are there for that reason.",
        },
        {
          q: "Why measure edges instead of reading the text?",
          a: "Legibility depends on strokes staying distinct from their background. Edge strength is a direct, measurable way to see how much of that separation survives downscaling, without needing OCR or sending your image to a server.",
        },
        {
          q: "My score is low but I can read the text. Which is right?",
          a: "Your eyes. The measurement flags where detail is being lost, which is useful for comparing versions, but whether text is readable is a human judgement. That's why you can mark each size yourself.",
        },
      ]}
    >
      <ToolMount id="youtube/thumbnail-readability" />
    </ToolPage>
  );
}
