import type { ReactNode } from "react";
import { activeCategories } from "@/lib/catalog";

/** Every category with live tools; inherited by the category page, its tools and their social images. */
export const dynamicParams = false;

export function generateStaticParams() {
  return activeCategories.map((c) => ({ category: c.path }));
}

export default function CategoryLayout({ children }: { children: ReactNode }) {
  return children;
}
