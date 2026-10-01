import Link from "next/link";
import { ToolPage } from "@/components/tool/tool-page";
import { SeoChecker } from "@/components/youtube/seo-checker";

export default function Page() {
  return (
    <ToolPage
      slug="youtube/seo-checker"
      sections={[
        {
          id: "what-it-checks",
          title: "What the checks are based on",
          body: (
            <>
              <p>
                Every check comes from YouTube&apos;s own published guidance: titles up to 100 characters (with the start
                most likely to be seen), descriptions up to 5,000 characters with the key information first, chapters that
                start at 00:00, no more than 15 hashtags, and tags as a minor signal.
              </p>
              <p>
                The parts of YouTube search you can&apos;t see — like how many people click and how long they watch — matter
                a lot too. That&apos;s why this tool doesn&apos;t give an overall score: a video can pass every check and
                still not rank, and a video can rank well while failing some.
              </p>
            </>
          ),
        },
        {
          id: "next-steps",
          title: "Fixing what it finds",
          body: (
            <ul>
              <li>
                Rewrite a long-winded description with the <Link href="/youtube-tools/description-generator">description generator</Link>.
              </li>
              <li>
                Get chapters YouTube recognizes with the <Link href="/youtube-tools/timestamp-generator">timestamp generator</Link>.
              </li>
              <li>
                Format hashtags correctly with the <Link href="/youtube-tools/hashtag-generator">hashtag generator</Link>.
              </li>
            </ul>
          ),
        },
      ]}
      faqs={[
        { q: "Will fixing these checks make my video rank higher?", a: "Not necessarily. They fix avoidable problems in the parts you control. How a video ranks also depends on how viewers respond to it, which no outside tool can see." },
        { q: "Can I check someone else's video?", a: "Yes. The tool reads the same public details anyone can see on YouTube, so it works for any public or unlisted video." },
        { q: "Why is there no SEO score?", a: "A single number would suggest a precision that doesn't exist. Each check explains exactly what was found instead, so you can decide what's worth changing." },
        { q: "Does it check the thumbnail?", a: "Not here. Use the thumbnail checker and thumbnail text tester to check brightness, contrast and whether text is readable at small sizes." },
      ]}
    >
      <SeoChecker />
    </ToolPage>
  );
}
