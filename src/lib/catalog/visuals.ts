import { categories, tools, type Category, type Tool } from "@/lib/catalog";
import type { Backdrop, Pattern, Tint } from "@/lib/catalog/types";

export const PATTERNS: Pattern[] = ["strings", "grid", "dots", "rings", "waves", "rays", "diagonal", "arcs", "plus"];
export const TINTS: Tint[] = ["mint", "sky", "sand", "mist", "aqua"];

// 9 patterns × 5 tints: stepping both by one gives 45 distinct pairs before any repeat.
const toolIndex = new Map(tools.map((t, i) => [`${t.category}/${t.slug}`, i]));

/** The tool's own backdrop: its override, else a pattern + tint pair no other tool shares. */
export function toolBackdrop(tool: Tool): Backdrop {
  const i = toolIndex.get(`${tool.category}/${tool.slug}`) ?? 0;
  return {
    pattern: tool.backdrop?.pattern ?? PATTERNS[i % PATTERNS.length],
    tint: tool.backdrop?.tint ?? TINTS[i % TINTS.length],
  };
}

/** Categories vary both pattern and tint, so every category page looks different. */
export function categoryBackdrop(category: Category): Backdrop {
  const i = categories.findIndex((c) => c.slug === category.slug);
  return {
    pattern: category.backdrop?.pattern ?? PATTERNS[(Math.max(i, 0) * 2) % PATTERNS.length],
    tint: category.backdrop?.tint ?? TINTS[Math.max(i, 0) % TINTS.length],
  };
}
