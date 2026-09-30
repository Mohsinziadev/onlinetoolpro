import type { ReactNode } from "react";

export function PageIntro({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <header className="max-w-2xl">
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="mt-3 text-[2.5rem] leading-[1.02] font-medium tracking-[-0.04em] text-ink sm:text-[3.25rem]">{title}</h1>
      {children ? <div className="mt-4 text-[17px] leading-relaxed text-muted">{children}</div> : null}
    </header>
  );
}
