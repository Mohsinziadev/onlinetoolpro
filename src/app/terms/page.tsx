import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/content/page-intro";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Terms of Use",
  description: `The terms for using ${siteConfig.name}'s free online tools and guides.`,
  path: "/terms",
});

export default function TermsPage() {
  return (
    <div className="container-page pt-12 sm:pt-16">
      <PageIntro eyebrow="Legal" title="Terms of Use">
        Last updated: September 30, 2026
      </PageIntro>
      <div className="prose-article mt-12 max-w-2xl">
        <p>By using {siteConfig.name} you agree to these terms. If you don&apos;t agree, please don&apos;t use the site.</p>

        <h3>Using the tools</h3>
        <p>
          The tools are free and provided &ldquo;as is&rdquo;. You may use them for personal and commercial purposes. Please
          don&apos;t try to overload the service, get around rate limits, or access it automatically at scale.
        </p>

        <h3>Content that belongs to others</h3>
        <p>
          Some tools let you view or save content created by other people, such as YouTube thumbnails, titles or descriptions. That
          content belongs to its owners. You&apos;re responsible for making sure your use of it is lawful and, where needed, that you
          have the owner&apos;s permission.
        </p>

        <h3>YouTube content</h3>
        <p>
          Tools that load YouTube thumbnails or players do so directly from YouTube, and YouTube&apos;s{" "}
          <a href="https://www.youtube.com/t/terms" rel="noopener noreferrer" target="_blank">
            Terms of Service
          </a>{" "}
          apply to that content.
        </p>

        <h3>No guarantees</h3>
        <p>
          Calculators produce estimates from the numbers you enter, and checks and measurements describe what they find. They
          don&apos;t guarantee earnings, rankings, views or any other outcome. See our <Link href="/disclaimer">disclaimer</Link>.
        </p>

        <h3>Liability</h3>
        <p>To the fullest extent allowed by law, {siteConfig.name} isn&apos;t liable for losses arising from use of the site or decisions based on its output.</p>

        <h3>Changes</h3>
        <p>We may change these terms or the tools at any time. Changes take effect when published here.</p>

        <h3>Trademarks</h3>
        <p>YouTube is a trademark of Google LLC. {siteConfig.name} isn&apos;t affiliated with or endorsed by Google or YouTube.</p>
      </div>
    </div>
  );
}
