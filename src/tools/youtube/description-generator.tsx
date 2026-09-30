import Link from "next/link";
import { ToolPage } from "@/components/tool/tool-page";
import { DescriptionGenerator } from "@/components/youtube/description-generator";

export default function Page() {
  return (
    <ToolPage
      slug="youtube/description-generator"
      wide
      sections={[
        {
          id: "structure",
          title: "A simple structure that works",
          body: (
            <ol>
              <li>
                <strong>One or two sentences about the video.</strong> This is the part people see before “…more” and the
                part that helps YouTube understand the topic.
              </li>
              <li>
                <strong>Details.</strong> What&apos;s covered, who it&apos;s for, anything viewers need.
              </li>
              <li>
                <strong>Chapters</strong> if the video is long enough to benefit from them.
              </li>
              <li>
                <strong>Links</strong> to anything you mention.
              </li>
              <li>
                <strong>Hashtags</strong> at the end — a few relevant ones.
              </li>
            </ol>
          ),
        },
        {
          id: "honest",
          title: "What a description can and can't do",
          body: (
            <p>
              A clear description helps viewers decide whether to watch and helps YouTube understand the topic. It won&apos;t make
              an unwatched video popular on its own. Write for people first, and use words your viewers would actually search
              for. To format chapters that YouTube recognises, use the <Link href="/youtube-tools/timestamp-generator">timestamp generator</Link>.
            </p>
          ),
        },
      ]}
      faqs={[
        { q: "How long should a YouTube description be?", a: "YouTube allows up to 5,000 characters. There's no ideal length — a couple of useful paragraphs plus links and chapters is plenty for most videos." },
        { q: "Does this tool write the description for me?", a: "It builds the structure from what you type. Your own words about your own video will always be more accurate than anything generated." },
        { q: "Will my chapters work?", a: "The tool checks YouTube's chapter rules as you type: start at 00:00, at least three chapters, in order, each at least 10 seconds long." },
        { q: "Is anything saved?", a: "No. Everything happens in your browser. Copy your description before closing the page." },
      ]}
    >
      <DescriptionGenerator />
    </ToolPage>
  );
}
