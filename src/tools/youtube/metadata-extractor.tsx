import { ToolPage } from "@/components/tool/tool-page";
import { MetadataExtractor } from "@/components/youtube/metadata-extractor";

export default function Page() {
  return (
    <ToolPage
      slug="youtube/metadata-extractor"
      sections={[
        {
          id: "source",
          title: "Where the details come from",
          body: (
            <p>
              Everything shown comes from YouTube&apos;s official public data — the same information anyone can see on the
              video page. Private details like watch time or earnings are only visible to the creator in YouTube Studio.
            </p>
          ),
        },
      ]}
      faqs={[
        { q: "Why are likes shown as hidden?", a: "Some creators hide their like count. When they do, YouTube doesn't share it with anyone." },
        { q: "Does this work on private videos?", a: "No. Only public and unlisted videos can be looked up." },
        { q: "Can I copy the full description?", a: "Yes. Use Copy description, or Copy everything to get all details as plain text." },
      ]}
    >
      <MetadataExtractor />
    </ToolPage>
  );
}
