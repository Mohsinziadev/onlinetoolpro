import type { Metadata } from "next";
import { Bug, Lightbulb, Mail } from "lucide-react";
import { PageIntro } from "@/components/content/page-intro";
import { CopyButton } from "@/components/tool/copy-button";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Contact",
  description: `Contact ${siteConfig.name} with feedback, bug reports or tool requests.`,
  path: "/contact",
});

export default function ContactPage() {
  const topics = [
    { icon: Bug, title: "Report a problem", body: "Tell us which tool, what you tried and what went wrong.", subject: "Problem report" },
    { icon: Lightbulb, title: "Suggest a tool", body: "Is there a task you wish was quicker? We add new tools regularly.", subject: "Tool suggestion" },
    { icon: Mail, title: "Everything else", body: "Partnerships, press or general questions.", subject: "Hello" },
  ];
  return (
    <div className="container-page pt-12 sm:pt-16">
      <PageIntro eyebrow="Contact" title="Get in touch">
        We read every message and usually reply within 1–2 working days.
      </PageIntro>
      <div className="mt-10 flex max-w-xl items-center justify-between gap-3 rounded-2xl border border-line bg-surface p-4 pl-5 shadow-card">
        <Mail aria-hidden className="h-5 w-5 shrink-0 text-accent" strokeWidth={1.75} />
        <a href={`mailto:${siteConfig.contactEmail}`} className="min-w-0 flex-1 truncate text-[17px] font-medium text-ink hover:text-accent">
          {siteConfig.contactEmail}
        </a>
        <CopyButton value={siteConfig.contactEmail} label="Copy email" />
      </div>
      <div className="mt-10 grid gap-3 md:grid-cols-3">
        {topics.map((t) => (
          <a
            key={t.title}
            href={`mailto:${siteConfig.contactEmail}?subject=${encodeURIComponent(`${siteConfig.name}: ${t.subject}`)}`}
            className="rounded-2xl border border-line bg-surface p-6 shadow-card transition-[border-color,box-shadow] hover:border-line-strong hover:shadow-raised"
          >
            <t.icon aria-hidden className="h-5 w-5 text-accent" strokeWidth={1.75} />
            <h2 className="mt-4 font-semibold tracking-tight text-ink">{t.title}</h2>
            <p className="mt-1 text-sm text-muted">{t.body}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
