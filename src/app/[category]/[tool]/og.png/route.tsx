import { ogImage } from "@/lib/og";
import { getCategory, getCategoryByPath, getTool, liveTools, toolTitle } from "@/lib/catalog";
import { toolBackdrop } from "@/lib/catalog/visuals";

/** /youtube-tools/thumbnail-downloader/og.png — the tool's social share image, built at build time. */
export const dynamic = "force-static";

export function generateStaticParams() {
  return liveTools.map((t) => ({ category: getCategory(t.category)!.path, tool: t.slug }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ category: string; tool: string }> }) {
  const { category, tool } = await params;
  const c = getCategoryByPath(category);
  const t = c ? getTool(c.slug, tool) : undefined;
  if (!c || !t) return ogImage({ eyebrow: "Tools", title: "Free online tools" });
  return ogImage({ eyebrow: c.title, title: toolTitle(t), subtitle: t.description, tint: toolBackdrop(t).tint });
}
