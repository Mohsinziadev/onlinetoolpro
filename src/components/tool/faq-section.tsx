import { Plus } from "lucide-react";
import { JsonLd } from "@/components/json-ld";

export type Faq = { q: string; a: string };

/** Native <details> accordion (zero JS) + FAQPage structured data. */
export function FaqSection({ faqs, title = "Frequently asked questions", withSchema = true }: { faqs: Faq[]; title?: string; withSchema?: boolean }) {
  return (
    <section aria-labelledby="faq-heading">
      <h2 id="faq-heading" className="h3 text-ink">
        {title}
      </h2>
      <div className="mt-6 divide-y divide-line rounded-2xl border border-line bg-surface">
        {faqs.map((f) => (
          <details key={f.q} className="group px-5 sm:px-6">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-[15px] font-medium text-ink [&::-webkit-details-marker]:hidden">
              {f.q}
              <Plus aria-hidden className="h-4 w-4 shrink-0 text-muted transition-transform duration-200 group-open:rotate-45" />
            </summary>
            <p className="-mt-1 pb-5 text-[14.5px] leading-relaxed text-muted">{f.a}</p>
          </details>
        ))}
      </div>
      {withSchema ? (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }}
        />
      ) : null}
    </section>
  );
}
