import { ToolPage } from "@/components/tool/tool-page";
import { TagExtractor } from "@/components/youtube/tag-extractor";

export default function Page() {
  return (
    <ToolPage
      slug="youtube/tag-extractor"
      sections={[
        {
          id: "what",
          title: "What are YouTube tags?",
          body: (
            <p>
              Tags are extra words a creator adds when uploading a video. They aren&apos;t shown on the video page, but
              they&apos;re part of its public data. YouTube says tags play a small role — mainly helping with common
              misspellings — so the title, thumbnail and description matter much more.
            </p>
          ),
        },
      ]}
      faqs={[
        { q: "Why does a video have no tags?", a: "Tags are optional and many creators don't add any." },
        { q: "How many tags can a video have?", a: "YouTube allows up to 500 characters of tags in total. The tool shows the character count of your selection." },
        { q: "Can I copy only some tags?", a: "Yes. Tap tags to leave them out, then copy the rest." },
      ]}
    >
      <TagExtractor />
    </ToolPage>
  );
}
