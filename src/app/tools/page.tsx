import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { Suspense } from "react";
import { ToolDirectory } from "@/components/tool/tool-directory";
import { ToolGrid } from "@/components/tool/tool-card";
import { PopularTools } from "@/components/tool/popular-tools";
import { SectionHeader } from "@/components/tool/section";
import { Breadcrumbs } from "@/components/tool/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { absoluteUrl, siteConfig } from "@/lib/site";
import { activeCategories, liveTools, newTools, toolHref } from "@/lib/catalog";

export const metadata: Metadata = pageMetadata({
  title: "All Free Online Tools",
  description: `Browse every free tool on ${siteConfig.name}: image, PDF, text, developer, color, CSS and YouTube tools. Search or filter by category — no sign-up.`,
  path: "/tools",
});

export default function ToolsPage() {
  return (
    <div className="container-page pt-6 sm:pt-8">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Tools", href: "/tools" },
        ]}
      />
      <header className="mt-10 max-w-3xl sm:mt-14">
        <p className="eyebrow">All tools</p>
        <h1 className="h1 mt-4 text-ink">Every tool, in one place.</h1>
        <p className="lead mt-4 text-muted">
          {liveTools.length} free tools across {activeCategories.length} categories, with more on the way. Search or browse
          below.
        </p>
      </header>

      <div className="mt-10">
        <Suspense fallback={<div className="h-14 max-w-2xl rounded-2xl border border-line bg-surface" />}>
          <ToolDirectory />
        </Suspense>
      </div>

      <div id="popular" className="mt-28 scroll-mt-24 border-t border-line pt-16">
        <PopularTools limit={6} />
      </div>

      <section id="new" aria-labelledby="new-heading" className="mt-24 scroll-mt-24">
        <SectionHeader id="new-heading" eyebrow="Just added" title="New tools" description="The latest tools we've added." />
        <ToolGrid tools={newTools(6)} showCategory className="mt-10" />
      </section>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Free online tools",
          itemListElement: liveTools.map((t, i) => ({ "@type": "ListItem", position: i + 1, name: t.title ?? t.name, url: absoluteUrl(toolHref(t)) })),
        }}
      />
    </div>
  );
}
