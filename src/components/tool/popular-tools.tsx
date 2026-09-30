import { SectionHeader } from "@/components/tool/section";
import { ToolGrid } from "@/components/tool/tool-card";
import { popularTools } from "@/lib/catalog";

/**
 * Popular tools from any category (or one category). Driven by `popular: true`
 * in the catalog, so tools from new categories appear here automatically.
 */
export function PopularTools({
  category,
  limit = 6,
  title = "Popular tools",
  description = "The tools people use most. Pick one and get started in seconds.",
  eyebrow = "Popular",
  link,
  className,
}: {
  category?: string;
  limit?: number;
  title?: string;
  description?: string;
  eyebrow?: string;
  link?: { href: string; label: string };
  className?: string;
}) {
  const list = popularTools(limit, category);
  if (!list.length) return null;
  return (
    <section aria-labelledby="popular-heading" className={className}>
      <SectionHeader id="popular-heading" eyebrow={eyebrow} title={title} description={description} link={link} />
      <ToolGrid tools={list} showCategory={!category} className="mt-10" />
    </section>
  );
}
