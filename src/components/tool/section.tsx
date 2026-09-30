import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** Standard section heading: eyebrow, H2, optional supporting line and "see all" link. */
export function SectionHeader({
  id,
  eyebrow,
  title,
  description,
  link,
  className,
}: {
  id?: string;
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  link?: { href: string; label: string };
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col justify-between gap-4 sm:flex-row sm:items-end", className)}>
      <div className="max-w-2xl">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h2 id={id} className={cn("h2 text-ink", eyebrow && "mt-3")}>
          {title}
        </h2>
        {description ? <p className="mt-3 text-[16px] leading-[1.48] text-muted sm:text-[18px]">{description}</p> : null}
      </div>
      {link ? (
        <Link href={link.href} className="group inline-flex shrink-0 items-center gap-1.5 text-[15px] font-medium text-ink hover:text-accent">
          {link.label}
          <ArrowRight aria-hidden className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      ) : null}
    </div>
  );
}
