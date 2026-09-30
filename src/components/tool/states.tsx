import type { ReactNode } from "react";
import { AlertTriangle, FlaskConical, Inbox, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

export function LoadingState({ label = "Loading…", rows = 3, className }: { label?: string; rows?: number; className?: string }) {
  return (
    <div role="status" aria-live="polite" className={cn("rounded-2xl border border-line bg-surface p-6", className)}>
      <div className="flex items-center gap-2 text-sm text-muted">
        <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
        {label}
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
      <div className="mt-4 space-y-2.5">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className={cn("h-4", i % 2 ? "w-4/6" : "w-5/6")} />
        ))}
      </div>
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  description,
  action,
  className,
}: {
  title?: string;
  description: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div role="alert" className={cn("flex gap-3 rounded-2xl border border-danger/25 bg-danger-soft p-4 sm:p-5", className)}>
      <AlertTriangle aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
      <div className="min-w-0 text-sm">
        <p className="font-medium text-ink">{title}</p>
        <div className="mt-1 text-ink-2">{description}</div>
        {action ? <div className="mt-3">{action}</div> : null}
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: {
  title: string;
  description?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center rounded-2xl border border-dashed border-line-strong px-6 py-12 text-center", className)}>
      <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-surface text-muted shadow-card">
        {icon ?? <Inbox aria-hidden className="h-5 w-5" strokeWidth={1.75} />}
      </span>
      <p className="mt-4 text-[15px] font-medium text-ink">{title}</p>
      {description ? <p className="mt-1.5 max-w-md text-sm text-muted">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

/** Shown whenever a response was served from the development mock layer. */
export function MockDataBanner({ className }: { className?: string }) {
  return (
    <div
      role="note"
      className={cn("flex items-start gap-2.5 rounded-xl border border-warning/30 bg-warning-soft px-4 py-3 text-[13px] text-ink-2", className)}
    >
      <FlaskConical aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
      <p>
        <strong className="font-semibold text-ink">Development mock data — not real YouTube data.</strong> The YouTube API
        key is not configured and <code className="font-mono text-xs">YOUTUBE_MOCK=true</code> is set. Add{" "}
        <code className="font-mono text-xs">YOUTUBE_API_KEY</code> to see real public statistics.
      </p>
    </div>
  );
}
