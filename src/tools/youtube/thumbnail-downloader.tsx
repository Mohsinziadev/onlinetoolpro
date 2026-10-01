import { ToolPage } from "@/components/tool/tool-page";
import { ToolMount } from "@/tools/mounts";

export default function Page() {
  return (
    <ToolPage
      slug="youtube/thumbnail-downloader"
      sections={[
        {
          id: "sizes",
          title: "Which size should I download?",
          body: (
            <>
              <p>
                Pick <strong>Full HD (1280 × 720)</strong> whenever it&apos;s available — it&apos;s the sharpest version and
                the one the creator uploaded. Older videos and some Shorts only have <strong>Standard</strong> or{" "}
                <strong>High</strong> sizes; the tool shows you which ones exist.
              </p>
              <p>The smaller sizes are useful for previews, lists and places where file size matters.</p>
            </>
          ),
        },
        {
          id: "permission",
          title: "Can I reuse a thumbnail?",
          body: (
            <p>
              Thumbnails are owned by the person who made the video. Downloading one to look at it, study it or use it for
              your own video is fine; publishing someone else&apos;s thumbnail as your own usually needs their permission.
            </p>
          ),
        },
      ]}
      faqs={[
        { q: "Is this thumbnail downloader free?", a: "Yes. It's completely free, with no sign-up and no limits for normal use." },
        { q: "Does it work with YouTube Shorts?", a: "Yes. Paste a Shorts link (youtube.com/shorts/…) and you'll get the thumbnail the same way." },
        { q: "Why isn't Full HD available for some videos?", a: "YouTube only creates the 1280 × 720 version when the original upload was large enough. When it's missing, download the next biggest size." },
        { q: "Can I download a thumbnail on my phone?", a: "Yes. Tap Download and your phone will save the image, usually to your Downloads or Files app." },
        { q: "What format are the thumbnails?", a: "They are JPG images, the same files YouTube shows on its site." },
      ]}
    >
      <ToolMount id="youtube/thumbnail-downloader" />
    </ToolPage>
  );
}
