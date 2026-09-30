import { ToolPage } from "@/components/tool/tool-page";
import { VideoIdFinder } from "@/components/utilities/video-id-finder";

const SLUG = "youtube/video-id-finder";

export default function Page() {
  return (
    <ToolPage
      slug={SLUG}
      sections={[
        {
          id: "what-is-a-video-id",
          title: "What is a YouTube video ID?",
          body: (
            <>
              <p>
                Every YouTube video has an 11-character ID made of letters, numbers, hyphens and underscores — for example{" "}
                <code>dQw4w9WgXcQ</code>. It appears in every link format, but in different places, which makes it easy to
                copy the wrong part.
              </p>
              <p>
                You need the ID for embeds, API requests, analytics spreadsheets, chapters tools and many browser
                extensions.
              </p>
            </>
          ),
        },
        {
          id: "supported-formats",
          title: "Supported link formats",
          body: (
            <ul>
              <li>
                <code>youtube.com/watch?v=ID</code> (including extra parameters like <code>&amp;t=42s</code> or{" "}
                <code>&amp;list=…</code>)
              </li>
              <li>
                <code>youtu.be/ID</code> short links
              </li>
              <li>
                <code>youtube.com/shorts/ID</code>
              </li>
              <li>
                <code>youtube.com/embed/ID</code> and <code>youtube-nocookie.com/embed/ID</code>
              </li>
              <li>
                <code>youtube.com/live/ID</code>, <code>m.youtube.com</code> and <code>music.youtube.com</code> links
              </li>
            </ul>
          ),
        },
        {
          id: "example",
          title: "Example",
          body: (
            <p>
              Paste <code>https://youtu.be/dQw4w9WgXcQ?si=abc123</code> and you get the ID <code>dQw4w9WgXcQ</code>, the
              canonical URL <code>https://www.youtube.com/watch?v=dQw4w9WgXcQ</code> (tracking parameters removed) and the
              embed URL <code>https://www.youtube.com/embed/dQw4w9WgXcQ</code>.
            </p>
          ),
        },
        {
          id: "limitations",
          title: "Limitations",
          body: (
            <ul>
              <li>Parsing happens in your browser and doesn&apos;t check whether the video exists or is public.</li>
              <li>Channel, playlist and search URLs don&apos;t contain a single video ID and are reported as not recognised.</li>
            </ul>
          ),
        },
      ]}
      faqs={[
        {
          q: "How do I find the ID of a YouTube Short?",
          a: "It's the part after /shorts/ in the link. Paste the Shorts URL here and the tool extracts it for you.",
        },
        {
          q: "Does this remove tracking parameters?",
          a: "Yes. The canonical URL contains only the video ID, so parameters like ?si= and &feature= are dropped.",
        },
        {
          q: "Can I convert many links at once?",
          a: "Yes. Paste up to 50 links, one per line, and use “Copy all IDs” to copy them as a list.",
        },
      ]}
    >
      <VideoIdFinder />
    </ToolPage>
  );
}
