import { ToolPage } from "@/components/tool/tool-page";
import { TimestampGenerator } from "@/components/utilities/timestamp-generator";

const SLUG = "youtube/timestamp-generator";

export default function Page() {
  return (
    <ToolPage
      slug={SLUG}
      wide
      sections={[
        {
          id: "how-chapters-work",
          title: "How YouTube chapters work",
          body: (
            <>
              <p>
                When a video description contains a list of timestamps, YouTube can split the progress bar into chapters.
                For chapters to appear, the list has to follow a few rules:
              </p>
              <ul>
                <li>The first timestamp must be <code>0:00</code>.</li>
                <li>There must be at least three timestamps, in ascending order.</li>
                <li>Each chapter must be at least 10 seconds long.</li>
              </ul>
              <p>The generator checks all of these and tells you exactly which line breaks a rule.</p>
            </>
          ),
        },
        {
          id: "how-it-works",
          title: "How the generator works",
          body: (
            <p>
              Paste rough notes — timestamps at the start or end of each line, in brackets, or written as <code>2m14s</code>.
              The tool extracts each time and title, optionally sorts them and adds an intro at 0:00, then formats every line
              consistently (switching to <code>H:MM:SS</code> automatically when the video passes an hour).
            </p>
          ),
        },
        {
          id: "example",
          title: "Example",
          body: (
            <p>
              Input: <code>Intro 0:00</code>, <code>[2:14] Mic setup</code>, <code>5m42s - Lighting</code>. Output:{" "}
              <code>00:00 Intro</code>, <code>02:14 Mic setup</code>, <code>05:42 Lighting</code>.
            </p>
          ),
        },
        {
          id: "limitations",
          title: "Limitations",
          body: (
            <ul>
              <li>YouTube may still choose not to show chapters in some cases, such as on certain video types.</li>
              <li>Automatic chapters created by YouTube can differ from the ones you write.</li>
            </ul>
          ),
        },
      ]}
      faqs={[
        { q: "Why aren't my YouTube chapters showing?", a: "The most common causes are a first timestamp that isn't 0:00, fewer than three timestamps, timestamps out of order, or a chapter shorter than 10 seconds." },
        { q: "Should I write 0:00 or 00:00?", a: "Both work. Use the padding switch to choose; the generator keeps the format consistent across every line." },
        { q: "Does the text have to be at the start of the description?", a: "No, the list can go anywhere in the description, but each timestamp needs to be on its own line." },
      ]}
    >
      <TimestampGenerator />
    </ToolPage>
  );
}
