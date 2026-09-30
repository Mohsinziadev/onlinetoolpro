import { cn } from "@/lib/utils";

/** Numbered, plain-language steps. Content comes from the tool's `steps` in the catalog. */
export function HowItWorks({ steps, title = "How it works", className }: { steps: string[]; title?: string; className?: string }) {
  return (
    <section aria-labelledby="how-heading" className={className}>
      <h2 id="how-heading" className="h2 text-ink">
        {title}
      </h2>
      <ol className={cn("mt-10 grid gap-3", steps.length >= 4 ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-3")}>
        {steps.map((s, i) => (
          <li key={s} className="rounded-2xl border border-line bg-surface p-6">
            <span className="num inline-flex h-7 w-7 items-center justify-center rounded-full bg-accent-soft text-[13px] font-medium text-accent">
              {i + 1}
            </span>
            <p className="mt-5 text-[16px] leading-[1.48] text-ink-2">{s}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
