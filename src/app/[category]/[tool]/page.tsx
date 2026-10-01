import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ToolPage } from "@/components/tool/tool-page";
import {
  getCategory,
  getCategoryByPath,
  getTool,
  isLive,
  liveTools,
  toolKey,
} from "@/lib/catalog";
import { toolMetadata } from "@/lib/seo";
import { toolModules } from "@/tools/registry";
import { hasInterface } from "@/tools/keys";
import { ToolMount } from "@/tools/mounts";

export const dynamicParams = false;
const hasPage = (key: string) => Boolean(toolModules[key]) || hasInterface(key);

export function generateStaticParams() {
  return liveTools
    .filter((t) => hasPage(toolKey(t)))
    .map((t) => ({ category: getCategory(t.category)!.path, tool: t.slug }));
}

function lookup(categoryPath: string, slug: string) {
  const category = getCategoryByPath(categoryPath);
  return category ? getTool(category.slug, slug) : undefined;
}

export async function generateMetadata({
  params,
}: PageProps<"/[category]/[tool]">): Promise<Metadata> {
  const { category, tool } = await params;
  const t = lookup(category, tool);
  return t ? toolMetadata(t) : {};
}

export default async function ToolRoute({
  params,
}: PageProps<"/[category]/[tool]">) {
  const { category, tool } = await params;
  const t = lookup(category, tool);
  if (!t || !isLive(t)) notFound();
  const key = toolKey(t);

  const pageModule = toolModules[key];
  if (pageModule) {
    const { default: ToolBody } = await pageModule();
    return <ToolBody />;
  }

  if (!hasInterface(key)) notFound();
  return (
    <ToolPage slug={key} wide>
      <ToolMount id={key} />
    </ToolPage>
  );
}
