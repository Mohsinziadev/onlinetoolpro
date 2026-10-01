import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/content/page-intro";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Disclaimer",
  description: `What ${siteConfig.name}'s tools and guides can and can't tell you, plus how the site is funded.`,
  path: "/disclaimer",
});

export default function DisclaimerPage() {
  return (
    <div className="container-page pt-12 sm:pt-16">
      <PageIntro eyebrow="Legal" title="Disclaimer">
        Last updated: September 30, 2026
      </PageIntro>
      <div className="prose-article mt-12 max-w-2xl">
        <h2>Information, not advice</h2>
        <p>
          The tools and guides on {siteConfig.name} are for general information. We work to keep them accurate and up to date, but
          platforms change their rules and features, and mistakes can happen. Nothing on this site is financial, legal or
          professional advice.
        </p>

        <h2>Estimates and measurements</h2>
        <p>
          Earnings calculators show estimates based on the numbers you enter; real earnings depend on many factors we can&apos;t see.
          Thumbnail, SEO and analytics tools describe what they measure — they don&apos;t predict clicks, views or rankings, and no
          tool can guarantee them.
        </p>

        <h2>Advertising and affiliate links</h2>
        <p>
          The site is free to use. In future it may be supported by clearly labelled advertising and by affiliate links, which earn us a
          small commission if you buy something after clicking, at no extra cost to you. Affiliate links will be marked, and we only
          recommend things that are relevant to the page. Ads will never be placed inside a tool or disguised as a download button.
        </p>

        <h2>Third-party sites and content</h2>
        <p>
          We link to other websites and show content from platforms like YouTube. We&apos;re not responsible for their content,
          policies or availability. Content shown by our tools belongs to its owners.
        </p>

        <h2>No affiliation</h2>
        <p>
          {siteConfig.name} is independent and isn&apos;t affiliated with, endorsed by or sponsored by YouTube, Google or any other
          platform we build tools for.
        </p>

        <h2>Questions</h2>
        <p>
          If something looks wrong, please <Link href="/contact">let us know</Link>.
        </p>
      </div>
    </div>
  );
}
