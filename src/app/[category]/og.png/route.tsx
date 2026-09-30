import { toolCount } from "@/lib/utils";
import { ogImage } from "@/lib/og";
import { activeCategories, getCategoryByPath, liveCount } from "@/lib/catalog";
import { categoryBackdrop } from "@/lib/catalog/visuals";

/** /youtube-tools/og.png — the category's social share image, built at build time. */
export const dynamic = "force-static";

export function generateStaticParams() {
  return activeCategories.map((c) => ({ category: c.path }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ category: string }> }) {
  const c = getCategoryByPath((await params).category);
  if (!c) return ogImage({ eyebrow: "Tools", title: "Free online tools" });
  return ogImage({ eyebrow: toolCount(liveCount(c.slug), "free"), title: c.title, subtitle: c.description, tint: categoryBackdrop(c).tint });
}
