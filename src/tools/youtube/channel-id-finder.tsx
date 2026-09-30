import { ToolPage } from "@/components/tool/tool-page";
import { ChannelIdFinder } from "@/components/youtube/channel-id-finder";

export default function Page() {
  return (
    <ToolPage
      slug="youtube/channel-id-finder"
      sections={[
        {
          id: "what",
          title: "What is a channel ID?",
          body: (
            <p>
              Every YouTube channel has a permanent ID that starts with <code>UC</code> and is 24 characters long. Unlike a
              channel&apos;s name or @handle, the ID never changes — which is why other apps and services often ask for it.
            </p>
          ),
        },
        {
          id: "where",
          title: "Where do I find my own channel ID?",
          body: (
            <p>
              Paste your channel link or @handle here, or in YouTube go to <strong>Settings → Advanced settings</strong>, where
              your channel ID is listed.
            </p>
          ),
        },
      ]}
      faqs={[
        { q: "Can I use an @handle instead of a link?", a: "Yes. Type the handle (for example @YouTube) and press Find channel ID." },
        { q: "Does a channel ID ever change?", a: "No. The ID stays the same even if the channel changes its name or handle." },
        { q: "Can I find a channel ID from a video link?", a: "Paste the video into the Video Metadata Extractor — it shows the channel ID of the video's creator." },
      ]}
    >
      <ChannelIdFinder />
    </ToolPage>
  );
}
