"use client";

import Link from "next/link";
import { Clock } from "lucide-react";
import { ToolIcon } from "@/components/tool-icon";
import { useRecentTools } from "@/components/tool/tool-sidebar";
import { toolHref, toolKey } from "@/lib/catalog/lite";
import { cn } from "@/lib/utils";

/** "Pick up where you left off" chips — only for people who have opened a tool before. */
export function RecentToolChips({ className, limit = 4 }: { className?: string; limit?: number }) {
  const recent = useRecentTools().slice(0, limit);
  if (!recent.length) return null;
  return (
    <div className={cn("flex flex-wrap items-center justify-center gap-2", className)}>
      <span className="mr-1 inline-flex items-center gap-1.5 text-[14px] text-muted">
        <Clock aria-hidden className="h-3.5 w-3.5" />
        Recently used:
      </span>
      {recent.map((t) => (
        <Link key={toolKey(t)} href={toolHref(t)} className="chip">
          <ToolIcon name={t.icon} className="h-3.5 w-3.5 text-accent" />
          {t.name}
        </Link>
      ))}
    </div>
  );
}
