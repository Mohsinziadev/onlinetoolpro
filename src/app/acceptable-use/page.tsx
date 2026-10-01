import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/content/page-intro";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Acceptable Use Policy",
  description: `How you may and may not use ${siteConfig.name}'s free tools and the files and images you create with them, and how to report misuse.`,
  path: "/acceptable-use",
});

export default function AcceptableUsePage() {
  return (
    <div className="container-page pt-12 sm:pt-16">
      <PageIntro eyebrow="Legal" title="Acceptable Use Policy">
        Last updated: October 1, 2026
      </PageIntro>
      <div className="prose-article mt-12 max-w-2xl">
        <p>
          {siteConfig.name}&apos;s tools are free to use for personal and commercial work. This policy explains where the line is. It applies to
          every tool on the site and to anything you create with them.
        </p>

        <h2>What is not allowed</h2>
        <p>You may not use any {siteConfig.name} tool, or anything it produces, to:</p>
        <ul>
          <li>
            <strong>Commit fraud</strong> — for example altering documents, images or PDFs to deceive someone, or creating fake proof for payments,
            claims or official processes.
          </li>
          <li>
            <strong>Impersonate someone</strong> — misleading people about who you are or what a real person or business said or did.
          </li>
          <li>
            <strong>Harass, threaten or defame</strong> — content meant to bully, shame, intimidate or damage someone&apos;s reputation.
          </li>
          <li>
            <strong>Scam people</strong> — phishing, deceptive links or QR codes, or any attempt to get money or information by deception.
          </li>
          <li>
            <strong>Infringe rights</strong> — using content you don&apos;t have the right to use, such as other people&apos;s images or
            copyrighted material.
          </li>
          <li>Break the law where you live.</li>
        </ul>

        <h2>Your responsibility</h2>
        <p>
          The tools run in your browser; we don&apos;t see or store the text, files or images you work with. That also means you are responsible
          for how you use them and the results.
        </p>

        <h2>Reporting misuse</h2>
        <p>
          If you believe something made with our tools is being used to deceive or harm someone, email{" "}
          <a href={`mailto:${siteConfig.contactEmail}?subject=Misuse%20report`}>{siteConfig.contactEmail}</a> with what you&apos;ve seen. We take
          reports seriously and, where required, cooperate with the relevant authorities.
        </p>

        <h2>Related policies</h2>
        <p>
          See also our <Link href="/terms">Terms of Use</Link>, <Link href="/privacy-policy">Privacy Policy</Link> and{" "}
          <Link href="/disclaimer">Disclaimer</Link>.
        </p>
      </div>
    </div>
  );
}
