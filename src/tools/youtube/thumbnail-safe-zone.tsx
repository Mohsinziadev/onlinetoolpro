import { ToolPage } from "@/components/tool/tool-page";
import { ThumbnailSafeZone } from "@/components/thumbnail/safe-zone";

const SLUG = "youtube/thumbnail-safe-zone";

export default function Page() {
  return (
    <ToolPage
      slug={SLUG}
      wide
      sections={[
        {
          id: "safe-zones",
          title: "What the safe zones are",
          body: (
            <>
              <p>
                A safe zone is the part of the frame where important elements are unlikely to be covered or cropped. For
                YouTube thumbnails there are two practical concerns:
              </p>
              <ul>
                <li>
                  <strong>The duration badge</strong> in the bottom-right corner, which covers more of the thumbnail as it
                  gets smaller.
                </li>
                <li>
                  <strong>The edges</strong>, where rounded corners, progress bars and tight crops in some layouts can clip
                  content.
                </li>
              </ul>
              <p>
                The rule-of-thirds grid, center lines and center focus area are composition aids for checking where your
                subject and text sit.
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
                Overlays are drawn as vector shapes on top of your image in the browser. The measurements use the same
                block-level detail map as the Thumbnail Analyzer: each block&apos;s edge density and local color contrast.
              </p>
              <ul>
                <li>
                  <strong>Detail in edge margins</strong> compares the share of detail in the margin with the share of the
                  frame the margin occupies. Much more detail than area means important content may be close to the edge.
                </li>
                <li>
                  <strong>Text-like area under badge</strong> checks whether text-like regions fall inside the approximate
                  badge area.
                </li>
              </ul>
            </>
          ),
        },
        {
          id: "example",
          title: "Example",
          body: (
            <p>
              A thumbnail with a price tag in the bottom-right corner shows 40% text-like area under the badge. At full
              size the price is visible, but in the feed the &ldquo;12:04&rdquo; badge may sit on top of it. Moving the
              price to the upper right or left third avoids the overlap.
            </p>
          ),
        },
        {
          id: "limitations",
          title: "Limitations",
          body: (
            <ul>
              <li>The badge area is an approximation. Its exact size and position vary by device, layout and video length.</li>
              <li>Detail and subject detection are heuristics — they don&apos;t recognize faces, objects or words.</li>
              <li>Composition guides are conventions, not rules that determine performance.</li>
            </ul>
          ),
        },
      ]}
      faqs={[
        {
          q: "Where does YouTube put the video duration on thumbnails?",
          a: "In the bottom-right corner, as a small dark label. Because it's a fixed size, it covers a larger share of small thumbnails, such as in the suggested-video list.",
        },
        {
          q: "How big should thumbnail margins be?",
          a: "There's no official number. Keeping key text and faces a few percent away from the edges — the tool defaults to 5% — avoids most cropping and corner rounding. Adjust the slider to test tighter or looser margins.",
        },
        {
          q: "Is the image uploaded to check safe zones?",
          a: "No. The overlays and measurements run entirely in your browser.",
        },
      ]}
    >
      <ThumbnailSafeZone />
    </ToolPage>
  );
}
