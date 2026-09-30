import Link from "next/link";
import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";

/** Mark: a 2×2 grid of rounded tiles, one in the accent — "a set of tools". Original geometry. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 28" aria-hidden className={cn("h-7 w-7", className)}>
      <rect x="1" y="1" width="12" height="12" rx="3.5" className="fill-ink" />
      <rect x="15" y="1" width="12" height="12" rx="6" className="fill-accent" />
      <rect x="1" y="15" width="12" height="12" rx="3.5" className="fill-ink" />
      <rect x="15" y="15" width="12" height="12" rx="3.5" className="fill-ink" />
    </svg>
  );
}

/**
 * Wordmark: "OnlineTool" set tight in semibold, followed by a small "PRO" badge —
 * dark green with mint lettering (inverted in dark mode). Screen readers hear the
 * plain brand name.
 */
export function Wordmark({ className }: { className?: string }) {
  const name = siteConfig.name;
  const base = name.endsWith("Pro") ? name.slice(0, -3) : name;
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span aria-hidden className="text-[19px] leading-none font-semibold tracking-[-0.045em] text-ink">
        {base}
      </span>
      {base !== name ? (
        <span
          aria-hidden
          className="relative -top-px inline-flex h-[18px] items-center rounded-[6px] bg-[#0a2119] px-[6px] text-[10px] leading-none font-bold tracking-[0.14em] text-[#7afab2] shadow-[inset_0_1px_0_rgb(255_255_255/0.12),0_1px_2px_rgb(0_8_5/0.25)] dark:bg-[#7afab2] dark:text-[#00140c] dark:shadow-[inset_0_1px_0_rgb(255_255_255/0.4)]"
        >
          PRO
        </span>
      ) : null}
      <span className="sr-only">{name}</span>
    </span>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("inline-flex shrink-0 items-center gap-2.5 rounded-lg", className)} aria-label={`${siteConfig.name} home`}>
      <LogoMark />
      <Wordmark />
    </Link>
  );
}
