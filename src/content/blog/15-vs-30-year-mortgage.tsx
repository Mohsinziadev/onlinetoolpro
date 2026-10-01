import Link from "next/link";
import { Callout, DataTable, ToolCta } from "@/components/blog/content";
import type { PostContent } from "@/lib/blog/types";

const content: PostContent = {
  quickAnswer: (
    <p>
      A <strong>15-year mortgage</strong> has a higher monthly payment but usually a lower rate, and costs far less interest overall. A{" "}
      <strong>30-year mortgage</strong> keeps the payment lower and gives you more room in your budget. On a $300,000 loan the 15-year option
      costs about $595 more a month but saves roughly $234,000 in interest.
    </p>
  ),
  intro: (
    <>
      <p>
        This is one of the few money decisions where the math is unambiguous and the right answer still depends on you. The 15-year loan wins on
        total cost every time. The 30-year loan wins on flexibility. The question is which one matters more for your life over the next decade —
        and there&apos;s a third option most comparisons skip.
      </p>
    </>
  ),
  sections: [
    {
      id: "side-by-side",
      title: "The numbers side by side",
      body: (
        <>
          <p>
            15-year mortgages typically come with a lower rate than 30-year ones. In this example the 15-year rate is 0.75 percentage points
            lower — check current rates, but a gap of roughly half a point to a point is common.
          </p>
          <DataTable
            caption="A $300,000 loan, 30 years at 6.5% vs 15 years at 5.75%"
            head={["", "30-year at 6.5%", "15-year at 5.75%"]}
            rows={[
              ["Monthly payment", "$1,896", "$2,491"],
              ["Total interest", "$382,633", "$148,421"],
              ["Total repaid", "$682,633", "$448,421"],
              ["Mortgage-free after", "30 years", "15 years"],
            ]}
          />
          <p>
            The 15-year loan saves about $234,000 — not because of the lower rate alone, but because you&apos;re borrowing the money for half as
            long. In the early years of a 30-year mortgage, most of each payment is interest.
          </p>
          <ToolCta tool="finance/mortgage-calculator">Compare terms with your own price, deposit and rate — including taxes and insurance.</ToolCta>
        </>
      ),
    },
    {
      id: "third-option",
      title: "The third option: a 30-year loan you pay like a 15",
      body: (
        <>
          <p>
            Take the 30-year mortgage, then voluntarily pay more each month. Paying the 15-year amount ($2,491) on the 30-year loan above clears
            it in about 16 years, with around $187,000 of interest — not as cheap as the true 15-year loan (the rate is higher), but close.
          </p>
          <p>
            The difference is that the extra payment is optional. Lose a job, have a baby or face a big repair, and you can drop back to the
            $1,896 minimum without asking anyone. That safety valve is worth a lot to some people and nothing to others.
          </p>
          <Callout type="note">
            Check your mortgage allows overpayments without penalties. Most US mortgages do; in the UK many fixed-rate deals allow up to 10% a
            year before early repayment charges apply.
          </Callout>
          <p>
            Even a small extra amount helps. Adding $200 a month to the 30-year payment above pays it off about seven years early and saves
            roughly $103,000 in interest.
          </p>
        </>
      ),
    },
    {
      id: "choose-15",
      title: "A 15-year mortgage makes sense if…",
      body: (
        <ul>
          <li>The higher payment still fits comfortably, with savings left over every month.</li>
          <li>You already have a solid emergency fund and are saving for retirement.</li>
          <li>You want to be mortgage-free by a particular age — before retiring or before kids start university, for example.</li>
          <li>You know yourself: money left in your account tends to get spent rather than invested.</li>
        </ul>
      ),
    },
    {
      id: "choose-30",
      title: "A 30-year mortgage makes sense if…",
      body: (
        <ul>
          <li>The 15-year payment would stretch you, or leave nothing for emergencies.</li>
          <li>Your income is irregular — freelance, commission or seasonal.</li>
          <li>You&apos;d invest the difference consistently. Over long periods, investments have often returned more than mortgage rates, though with risk.</li>
          <li>You have higher-interest debt to clear first — paying off a 22% credit card beats overpaying a 6.5% mortgage.</li>
        </ul>
      ),
    },
    {
      id: "uk-note",
      title: "If you're not in the US",
      body: (
        <p>
          In the UK, Canada and Australia, the length of the mortgage (the term or amortization period) is separate from how long your rate is
          fixed — you might fix for two or five years on a 25-year term. The trade-off is the same, though: a shorter term means higher payments
          and much less interest. Use the <Link href="/finance-calculators/mortgage-calculator">mortgage calculator</Link> with your term in years.
        </p>
      ),
    },
  ],
  faqs: [
    { q: "Is a 15-year mortgage worth it?", a: "If the payment fits comfortably with savings left over, yes — you'll pay far less interest and own your home sooner. If it would stretch your budget, a 30-year loan with optional overpayments is safer." },
    { q: "Why are 15-year mortgage rates lower?", a: "The lender's money is tied up for less time, so there's less risk from inflation and rate changes. Lenders pass part of that on as a lower rate." },
    { q: "How much more is a 15-year mortgage payment?", a: "Often 25–35% more. On $300,000 at the rates above it's about $2,491 vs $1,896 a month." },
    { q: "Can I switch from a 30-year to a 15-year later?", a: "You can refinance into a shorter term, though that has costs. Overpaying your existing mortgage gets much of the same benefit without refinancing." },
  ],
};

export default content;
