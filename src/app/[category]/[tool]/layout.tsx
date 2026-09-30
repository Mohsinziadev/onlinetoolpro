import type { ReactNode } from "react";
import { getCategory, liveTools, toolKey } from "@/lib/catalog";
import { toolModules } from "@/tools/registry";
import { toolInterfaces } from "@/tools/interfaces";

/**
 * Declares every tool path once for this segment, so the page and its generated
 * social image are both pre-rendered in the static export.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return liveTools
    .filter((t) => toolModules[toolKey(t)] || toolInterfaces[toolKey(t)])
    .map((t) => ({ category: getCategory(t.category)!.path, tool: t.slug }));
}

export default function ToolLayout({ children }: { children: ReactNode }) {
  return children;
}
