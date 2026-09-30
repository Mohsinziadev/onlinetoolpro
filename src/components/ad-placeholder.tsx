import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";

export type AdSlot = "top-banner" | "in-content" | "sidebar" | "bottom";

const slotStyles: Record<AdSlot, string> = {
  "top-banner": "h-[90px] max-w-[728px] mx-auto",
  "in-content": "h-[250px] max-w-[728px] mx-auto",
  sidebar: "h-[600px] w-full",
  bottom: "h-[250px] max-w-[970px] mx-auto",
};

/**
 * Reserved ad slot. Renders nothing in production until ads are enabled,
 * so no empty boxes ship. Set NEXT_PUBLIC_SHOW_AD_SLOTS=true to see the
 * reserved space while designing layouts. When AdSense is added, render the
 * ad unit here — dimensions are already reserved to avoid layout shift.
 */
export function AdPlaceholder({ slot, className }: { slot: AdSlot; className?: string }) {
  if (!siteConfig.showAdSlots) return null;
  return (
    <aside
      aria-label="Advertisement placeholder"
      data-ad-slot={slot}
      className={cn(
        "flex w-full items-center justify-center rounded-xl border border-dashed border-line-strong bg-bg-subtle text-[11px] tracking-wider text-faint uppercase",
        slotStyles[slot],
        className,
      )}
    >
      Ad slot · {slot}
    </aside>
  );
}
