import { SectionHeader } from "@/components/tool/section";
import { ToolGrid } from "@/components/tool/tool-card";
import type { Tool } from "@/lib/catalog/lite";

export function RelatedTools({ tools, title = "Related tools", className }: { tools: Tool[]; title?: string; className?: string }) {
  return (
    <section aria-labelledby="related-heading" className={className}>
      <SectionHeader id="related-heading" title={title} description="Other tools you might find useful next." />
      <ToolGrid tools={tools} showCategory className="mt-8" />
    </section>
  );
}
