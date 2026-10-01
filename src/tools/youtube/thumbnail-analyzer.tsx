import Link from "next/link";
import { ToolPage } from "@/components/tool/tool-page";
import { ToolMount } from "@/tools/mounts";

const SLUG = "youtube/thumbnail-analyzer";

export default function Page() {
  return (
    <ToolPage
      slug={SLUG}
      sections={[
        {
          id: "what-it-measures",
          title: "What each measurement means",
          body: (
            <>
              <p>
                The analyzer describes your thumbnail with measurable properties. They&apos;re visual characteristics that may
                affect readability at small sizes — not a score and not a prediction of click-through rate.
              </p>
              <ul>
                <li>
                  <strong>Brightness</strong> — the average perceived lightness of all pixels (Rec. 709 luma), from 0
                  (black) to 100 (white).
                </li>
                <li>
                  <strong>Contrast</strong> — RMS contrast: how spread out pixel brightness is. Low contrast images can
                  turn into a flat mid-tone when shrunk. The tonal range shows the gap between the darkest and lightest 5%.
                </li>
                <li>
                  <strong>Saturation &amp; colorfulness</strong> — average color intensity, plus the Hasler–Süsstrunk
                  colorfulness metric widely used in image research.
                </li>
                <li>
                  <strong>Color diversity</strong> — how many distinct colors are used and how evenly. A handful of strong
                  colors usually survives downscaling better than many similar ones.
                </li>
                <li>
                  <strong>Text-like area</strong> — regions with dense, high-contrast strokes arranged horizontally. It&apos;s
                  a heuristic, not text recognition.
                </li>
                <li>
                  <strong>Whitespace</strong> — the share of the frame that is flat and low in detail, giving the eye room.
                </li>
                <li>
                  <strong>Edge density &amp; complexity</strong> — how much of the image sits on a strong edge, and the
                  spatial information (SI) measure from ITU-T P.910.
                </li>
                <li>
                  <strong>Subject position</strong> — where the most distinctive detail and color concentrate, mapped to
                  a rule-of-thirds grid.
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
                Your image is decoded by the browser and drawn to an off-screen canvas at 640 px wide. All analysis runs on
                those pixels in JavaScript on your device. Nothing is uploaded.
              </p>
              <ol>
                <li>Luma, saturation and a color histogram are computed for every pixel.</li>
                <li>Dominant colors come from deterministic k-means clustering of a 6,000-pixel sample.</li>
                <li>A Sobel filter measures edges; the frame is divided into blocks to classify detail and text-like areas.</li>
                <li>
                  Face detection uses your browser&apos;s built-in Shape Detection API when it&apos;s available. We don&apos;t
                  download a model or send the image anywhere.
                </li>
              </ol>
            </>
          ),
        },
        {
          id: "example",
          title: "Example: reading the results",
          body: (
            <>
              <p>
                Suppose a thumbnail shows brightness 34, RMS contrast 9%, and a text-like area of 18%. The low contrast
                means text and background have similar brightness — even if their colors differ. Open the{" "}
                <Link href="/youtube-tools/thumbnail-readability">Readability Tester</Link> and check whether the words are still legible
                at 25% and 15%. If they aren&apos;t, increasing the brightness difference between text and background is a
                measurable change to test.
              </p>
            </>
          ),
        },
        {
          id: "limitations",
          title: "Limitations",
          body: (
            <ul>
              <li>These measurements don&apos;t predict click-through rate, views or how YouTube recommends videos.</li>
              <li>Text-like detection can flag logos, fine patterns or foliage, and can miss very large or low-contrast text.</li>
              <li>Subject position is based on detail and color distinctiveness, not on recognizing people or objects.</li>
              <li>Face detection is only available in browsers that ship the Shape Detection API.</li>
              <li>Upload limits and recommended sizes are set by YouTube and can change; check YouTube Help for current values.</li>
            </ul>
          ),
        },
      ]}
      faqs={[
        {
          q: "Is my thumbnail uploaded to a server?",
          a: "No. The image is decoded and analyzed entirely in your browser using the Canvas API. It never leaves your device.",
        },
        {
          q: "What is the best size for a YouTube thumbnail?",
          a: "YouTube recommends 1280 × 720 pixels (16:9) with a minimum width of 640 pixels. The analyzer flags images that aren't 16:9 or are narrower than 1280 pixels.",
        },
        {
          q: "Does a higher contrast or saturation score mean more clicks?",
          a: "Not necessarily. These are descriptive measurements. They can help you spot thumbnails that become hard to read when shrunk, but click-through rate depends on many factors no image metric can capture.",
        },
        {
          q: "How accurate is the text detection?",
          a: "It's an approximation. It finds regions with dense, high-contrast, horizontally arranged strokes, which is typical of text. It doesn't read the text, and patterns or logos can register as text-like.",
        },
      ]}
    >
      <ToolMount id="youtube/thumbnail-analyzer" />
    </ToolPage>
  );
}
