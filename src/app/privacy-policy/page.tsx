import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/content/page-intro";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

const UPDATED = "October 1, 2026";

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy",
  description: `How ${siteConfig.name} handles your data: every tool runs in your browser, and we don't collect what you enter.`,
  path: "/privacy-policy",
});

export default function PrivacyPage() {
  return (
    <div className="container-page pt-12 sm:pt-16">
      <PageIntro eyebrow="Legal" title="Privacy Policy">
        Last updated: {UPDATED}
      </PageIntro>
      <div className="prose-article mt-12 max-w-2xl">
        <p>
          This policy explains what information {siteConfig.name} collects when you use the site, and why. The short version: most
          tools run entirely in your browser, we don&apos;t ask you to create an account, and we don&apos;t sell personal data.
        </p>

        <h2>Tools that run in your browser</h2>
        <p>
          Text tools, thumbnail checkers, calculators and generators process what you type or upload on your own device. That text and
          those images are not sent to or stored on our servers.
        </p>

        <h2>Content loaded from YouTube</h2>
        <p>
          The thumbnail downloader loads thumbnail images directly from YouTube&apos;s public image servers, and the embed code
          generator shows a YouTube player preview. These requests go from your browser straight to YouTube, which may log them
          like any other visit — see the{" "}
          <a href="https://policies.google.com/privacy" rel="noopener noreferrer" target="_blank">
            Google Privacy Policy
          </a>
          . The embed preview uses YouTube&apos;s privacy-enhanced mode (youtube-nocookie.com) by default. We never ask you to sign
          in with Google.
        </p>

        <h2>Analytics</h2>
        <p>
          We use Google Analytics to understand how the site is used — for example which pages and tools are visited, roughly where
          visitors come from (country or city level), the device and browser type, and how people arrive (search, links or directly).
          This helps us decide which tools to improve and build next.
        </p>
        <p>
          Google Analytics sets cookies in your browser and receives information such as your IP address, which Google uses to estimate
          location. It never receives the text, images or files you use in a tool. Learn{" "}
          <a href="https://policies.google.com/technologies/partner-sites" rel="noopener noreferrer" target="_blank">
            how Google uses information from sites that use its services
          </a>
          . You can opt out with the{" "}
          <a href="https://tools.google.com/dlpage/gaoptout" rel="noopener noreferrer" target="_blank">
            Google Analytics opt-out browser add-on
          </a>
          , or by blocking cookies in your browser.
        </p>

        <h2>What we store</h2>
        <p>
          We don&apos;t have accounts or a database. The site is a set of static pages; nothing you enter into a tool is sent to us.
        </p>
        <ul>
          <li>
            <strong>Your theme preference</strong> (light or dark) and the tools you used recently are kept in your browser&apos;s local
            storage, on your device only.
          </li>
          <li>
            <strong>Server logs</strong> (IP address, browser type, time of request) are kept by our hosting provider for security
            and to prevent abuse.
          </li>
        </ul>
        <p>You can clear local storage in your browser settings at any time.</p>

        <h2>Advertising</h2>
        <p>
          We don&apos;t currently show ads. If we introduce advertising (for example Google AdSense), advertising partners may use
          cookies to show and measure ads. We will update this policy before that happens, including how to opt out of personalised
          advertising.
        </p>

        <h2>Affiliate links</h2>
        <p>
          Some pages may in future include affiliate links. If you click one, the shop may set its own cookie to record that you came
          from us. Their privacy policy applies to anything you do on their site.
        </p>

        <h2>Your choices and rights</h2>
        <p>
          Depending on where you live, you may have the right to ask what personal information we hold about you, to correct it or to
          have it deleted. Email us and we&apos;ll respond within a reasonable time.
        </p>

        <h2>Children</h2>
        <p>The site isn&apos;t directed at children under 13, and we don&apos;t knowingly collect their personal information.</p>

        <h2>Changes to this policy</h2>
        <p>When we change this policy we&apos;ll update the date at the top of the page.</p>

        <h2>Contact</h2>
        <p>
          Questions about privacy: <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>, or use the{" "}
          <Link href="/contact">contact page</Link>.
        </p>
      </div>
    </div>
  );
}
