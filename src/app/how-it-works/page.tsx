import type { Metadata } from "next";
import { PageIntro } from "@/components/content/page-intro";
import { HowItWorks } from "@/components/tool/how-it-works";
import { ButtonLink } from "@/components/ui/button";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "How it works",
  description: `How ${siteConfig.name}'s free online tools work, and how they keep your files and text private.`,
  path: "/how-it-works",
});

export default function HowItWorksPage() {
  return (
    <div className="container-page pt-12 sm:pt-16">
      <PageIntro eyebrow="How it works" title="Find a tool. Use it. Done.">
        Every tool on {siteConfig.name} does one job and is designed so anyone can use it — no instructions needed.
      </PageIntro>

      <HowItWorks
        className="mt-16"
        title="Three steps, every time"
        steps={[
          "Search for what you want to do, or browse a category.",
          "Paste a link, drop a file or type your text into the big box.",
          "Copy or download your result. Nothing to install, no account.",
        ]}
      />

      <div className="prose-tool mt-20 max-w-2xl text-[17px]">
        <h2>Where your data goes</h2>
        <p>
          <strong>Every tool runs entirely in your browser.</strong> Text, image, PDF, developer and YouTube tools do their
          work on your own device — your files and words are never uploaded, and we don&apos;t have a database to store them in.
        </p>
        <p>
          <strong>A few tools load public content from YouTube</strong> — such as a video&apos;s thumbnail image — straight into
          your browser. That request goes to YouTube, not to us.
        </p>
        <h2>Why it&apos;s free</h2>
        <p>
          Tools are cheap for us to run, and we want them to be useful to as many people as possible. We may show a small
          number of clearly labelled ads in the future — never inside the tools themselves.
        </p>
      </div>

      <ButtonLink href="/tools" size="lg" className="mt-12">
        Browse all tools
      </ButtonLink>
    </div>
  );
}
