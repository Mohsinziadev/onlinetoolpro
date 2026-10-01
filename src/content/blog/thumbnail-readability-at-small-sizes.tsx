import { ToolCta } from "@/components/blog/content";
import type { PostContent } from "@/lib/blog/types";

const content: PostContent = {
  intro: (
    <>
      <p>
        A YouTube thumbnail is usually designed at 1280×720 and viewed at a
        fraction of that. In a phone&apos;s suggested-video list it can be under
        170 pixels wide. Detail that looks bold in an editor can disappear
        entirely at that size.
      </p>
    </>
  ),
  sections: [
    {
      id: "what-actually-gets-lost-when-an-image-shrinks",
      title: "What actually gets lost when an image shrinks",
      body: (
        <>
          <p>
            Downscaling averages neighboring pixels. Thin strokes, fine
            outlines and small text are the first things averaged away. Large
            shapes with strong tonal contrast survive; subtle color differences
            with similar brightness do not.
          </p>
          <ToolCta tool="youtube/thumbnail-readability" />
        </>
      ),
    },
    {
      id: "a-repeatable-test",
      title: "A repeatable test",
      body: (
        <>
          <ul>
            <li>
              Render the thumbnail at 100%, 50%, 25%, 15% and 10% of its width.
            </li>
            <li>
              At each size, ask one question: can the main words still be read,
              and is the subject still identifiable?
            </li>
            <li>
              Measure detail retention: how much of the original edge contrast
              survives after scaling down and back up. Large drops at 25%
              usually mean fine detail or thin text.
            </li>
            <li>
              Check luminance contrast between text and its background, not just
              color contrast. Yellow on white can look distinct in color but
              be similar in brightness.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "what-the-measurements-can-t-tell-you",
      title: "What the measurements can't tell you",
      body: (
        <>
          <p>
            Readability metrics describe the image. They don&apos;t predict
            click-through rate, which depends on the title, topic, audience,
            competition in the feed and much more. Treat them as a checklist for
            avoidable problems, not a score to maximize.
          </p>
        </>
      ),
    },
  ],
};

export default content;
