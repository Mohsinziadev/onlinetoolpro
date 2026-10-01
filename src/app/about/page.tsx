import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/content/page-intro";
import { ButtonLink } from "@/components/ui/button";
import { JsonLd } from "@/components/json-ld";
import { activeCategories, liveTools } from "@/lib/catalog";
import { pageMetadata } from "@/lib/seo";
import { absoluteUrl, siteConfig } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "About",
  description: `${siteConfig.name} is an independent collection of free, simple online tools, with guides that explain how they work.`,
  path: "/about",
});

export default function AboutPage() {
  return (
    <div className="container-page pt-12 sm:pt-16">
      <PageIntro eyebrow="About" title={`What ${siteConfig.name} is`}>
        An independent collection of free online tools for everyday tasks — each one built to do a single job well, for people who
        just want that job done.
      </PageIntro>

      <div className="prose-article mt-12 max-w-2xl">
        <h2>What we build</h2>
        <p>
          Right now there are {liveTools.length} tools across {activeCategories.length} categories, starting with YouTube and text
          tools, with more categories planned. Every tool has to be genuinely useful on its own: no sign-up, no paywall in front of the
          basics, and a clear explanation of what it does and what it can&apos;t do.
        </p>

        <h2>How the tools work</h2>
        <ul>
          <li>
            <strong>Every tool runs in your browser.</strong> Text, image, PDF, developer and YouTube tools all process what you
            give them on your own device. Nothing you enter is sent to us.
          </li>
          <li>
            <strong>No accounts.</strong> There&apos;s nothing to sign up for, and we never ask you to sign in with Google.
          </li>
          <li>
            <strong>We show our working.</strong> Calculators show their formulas, and measurements are labelled as measurements —
            not predictions or guarantees.
          </li>
        </ul>

        <h2>How we write guides</h2>
        <p>
          Our <Link href="/blog">guides</Link> are written by the {siteConfig.name} editorial team from building and testing these
          tools, and platform rules are checked against official sources such as YouTube Help. We don&apos;t publish invented
          statistics, fake reviews or made-up expert quotes. When a platform changes how something works, we update the article and
          its date. If you spot a mistake, <Link href="/contact">tell us</Link> and we&apos;ll fix it.
        </p>

        <h2>How the site is funded</h2>
        <p>
          The tools are free. In future the site may show clearly labelled ads and occasionally recommend products through affiliate
          links. Ads will never sit inside a tool or imitate a download button, and a recommendation will only appear where it&apos;s
          genuinely relevant. See our <Link href="/disclaimer">disclaimer</Link> for details.
        </p>

        <h2>Independence</h2>
        <p>
          {siteConfig.name} isn&apos;t affiliated with, endorsed by or sponsored by YouTube, Google or any other platform we build
          tools for. YouTube is a trademark of Google LLC.
        </p>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <ButtonLink href="/tools">Explore the tools</ButtonLink>
        <ButtonLink href="/contact" variant="secondary">
          Contact us
        </ButtonLink>
      </div>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          url: absoluteUrl("/about"),
          mainEntity: {
            "@type": "Organization",
            name: siteConfig.name,
            url: siteConfig.url,
            logo: absoluteUrl("/icon.svg"),
            email: siteConfig.contactEmail,
            description: siteConfig.description,
          },
        }}
      />
    </div>
  );
}
