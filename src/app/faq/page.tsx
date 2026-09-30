import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/content/page-intro";
import { FaqSection } from "@/components/tool/faq-section";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Frequently asked questions",
  description: `Answers to common questions about ${siteConfig.name}'s free online tools.`,
  path: "/faq",
});

const faqs = [
  { q: "Are the tools free?", a: "Yes. Every tool is free to use, with no trial period and no sign-up." },
  { q: "Do I need an account?", a: "No. Open any tool and start using it straight away." },
  { q: "Are my files and text uploaded?", a: "No. Every tool runs in your browser, so your files and text never leave your device." },
  { q: "Do the tools work on my phone?", a: "Yes. Every tool is designed to work on phones, tablets and computers." },
  { q: "Why does a tool say “Coming soon”?", a: "We list tools we're building so you know what's on the way. They'll become clickable as soon as they're ready." },
  { q: "Are you connected to YouTube or Google?", a: `No. ${siteConfig.name} is independent and isn't affiliated with or endorsed by YouTube, Google or any other platform we build tools for.` },
  { q: "Can I suggest a tool?", a: "Yes, please do — send us a message from the contact page." },
];

export default function FaqPage() {
  return (
    <div className="container-page pt-12 sm:pt-16">
      <PageIntro eyebrow="FAQs" title="Questions, answered.">
        Can&apos;t find what you&apos;re looking for? <Link href="/contact" className="text-accent underline underline-offset-4">Contact us</Link>.
      </PageIntro>
      <div className="mt-14 max-w-3xl">
        <FaqSection faqs={faqs} title="General" />
      </div>
    </div>
  );
}
