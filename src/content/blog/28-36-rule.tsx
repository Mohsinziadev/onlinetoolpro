import Link from "next/link";
import { Callout, DataTable, Steps, ToolCta } from "@/components/blog/content";
import type { PostContent } from "@/lib/blog/types";

const content: PostContent = {
  quickAnswer: (
    <p>
      The <strong>28/36 rule</strong> says your housing costs should be no more than <strong>28%</strong> of your gross monthly income, and all
      your debt payments together no more than <strong>36%</strong>. On a $90,000 salary that&apos;s $2,100 a month for housing and $2,700 for
      everything you owe, including the mortgage.
    </p>
  ),
  intro: (
    <>
      <p>
        “How much house can I afford?” has two answers: what a lender will approve, and what you can comfortably live with. The 28/36 rule is
        the lender&apos;s starting point in the US — a quick test of whether a mortgage fits your income before they look at anything else.
        Understanding it tells you roughly where your budget will land before you ever speak to a bank.
      </p>
    </>
  ),
  sections: [
    {
      id: "the-two-numbers",
      title: "The two numbers, explained",
      body: (
        <>
          <ul>
            <li>
              <strong>28% — the “front-end” ratio.</strong> Housing costs only: mortgage principal and interest, property tax, home insurance, and
              any HOA fee. Lenders call this PITI.
            </li>
            <li>
              <strong>36% — the “back-end” ratio.</strong> Housing <em>plus</em> every other monthly debt: car loans, student loans, personal
              loans and credit card minimums. Groceries, utilities and subscriptions don&apos;t count.
            </li>
          </ul>
          <p>
            Both use <strong>gross</strong> income — before tax. That&apos;s the detail that catches people out, and it&apos;s why a budget that
            passes the rule can still feel tight.
          </p>
        </>
      ),
    },
    {
      id: "worked-example",
      title: "A worked example",
      body: (
        <>
          <p>Say a household earns $90,000 a year and pays $400 a month on a car loan.</p>
          <Steps
            items={[
              <>Monthly gross income: $90,000 ÷ 12 = $7,500.</>,
              <>Front-end limit: 28% × $7,500 = $2,100 for housing.</>,
              <>Back-end limit: 36% × $7,500 = $2,700 for all debts. Minus the $400 car loan leaves $2,300 for housing.</>,
              <>The lower of the two wins: $2,100 a month for housing.</>,
            ]}
          />
          <p>
            Turning that $2,100 into a house price depends on the mortgage rate, your deposit, and local property tax. With $40,000 down, a 6.5%
            30-year rate, 1.1% property tax and $1,500 a year of insurance, it works out to a home of roughly $308,000.
          </p>
          <ToolCta tool="finance/mortgage-affordability-calculator">Put in your own income, debts and rate — it applies both ratios and shows which one limits you.</ToolCta>
        </>
      ),
    },
    {
      id: "what-limits-you",
      title: "Which number usually limits you?",
      body: (
        <>
          <p>
            If you have little other debt, the 28% housing limit decides your budget. Once car and student loans pass about 8% of your income, the
            36% total takes over — every $100 a month of other debt cuts your housing budget by $100. That&apos;s why paying off a car loan before
            applying can raise what you&apos;re approved for by more than you&apos;d expect.
          </p>
          <DataTable
            caption="How other debt changes the housing budget ($90,000 income)"
            head={["Other monthly debts", "Housing budget", "Limited by"]}
            rows={[
              ["$0", "$2,100", "28% rule"],
              ["$400", "$2,100", "28% rule"],
              ["$800", "$1,900", "36% rule"],
              ["$1,200", "$1,500", "36% rule"],
            ]}
          />
        </>
      ),
    },
    {
      id: "other-countries",
      title: "How lenders outside the US decide",
      body: (
        <>
          <ul>
            <li>
              <strong>UK:</strong> lenders start from an income multiple. Most cap borrowing at around <strong>4–4.5 times</strong> your annual
              income, with a smaller number going to 5–6 times for high earners or certain professions. They then run their own affordability
              checks on your spending.
            </li>
            <li>
              <strong>Canada:</strong> lenders use similar debt-service ratios and a mortgage stress test, checking you could still pay at a higher
              rate than the one you&apos;re offered.
            </li>
            <li>
              <strong>Australia:</strong> banks assess “serviceability” — your income against living costs and debts — using a buffer rate above
              the actual loan rate.
            </li>
          </ul>
          <p>
            The affordability calculator shows your loan-to-income multiple alongside the result, so you can sanity-check it against the UK-style
            rule too.
          </p>
        </>
      ),
    },
    {
      id: "comfortable-not-maximum",
      title: "Approved isn't the same as comfortable",
      body: (
        <>
          <p>
            The 28/36 rule describes a ceiling, not a target. It doesn&apos;t know about childcare, a long commute, or the fact that you&apos;d
            like to save for retirement. A few checks worth doing before you commit to the top of your range:
          </p>
          <ul>
            <li>Work the payment out against your <em>take-home</em> pay. Many people are comfortable when housing is 25–30% of net income.</li>
            <li>Budget 1–2% of the home&apos;s value a year for maintenance; it won&apos;t show up in any lender&apos;s ratio.</li>
            <li>Keep an emergency fund after the deposit and closing costs — not instead of them.</li>
          </ul>
          <Callout type="tip">
            Running the numbers at a rate 1–2 points higher than today&apos;s is a cheap way to see whether you&apos;d cope if rates rose when
            you remortgage or refinance.
          </Callout>
          <p>
            Once you have a price range, the <Link href="/finance-calculators/mortgage-calculator">mortgage calculator</Link> shows the full
            monthly cost, and <Link href="/blog/is-it-better-to-rent-or-buy">rent vs buy</Link> helps decide whether buying now makes sense at all.
          </p>
        </>
      ),
    },
  ],
  faqs: [
    { q: "What is the 28/36 rule?", a: "A guideline lenders use: housing costs within 28% of gross monthly income, and all debt payments within 36%." },
    { q: "Does the 28/36 rule use gross or net income?", a: "Gross income — before tax. That's why it can feel tighter than it sounds." },
    { q: "Can I get a mortgage above 36%?", a: "Often, yes. Many US loan programs allow higher debt-to-income ratios — sometimes into the 40s — especially with good credit or a larger deposit. It doesn't mean it's wise." },
    { q: "How much house can I afford on $60,000 a year?", a: "The 28% limit is $1,400 a month for housing. With few other debts, a 6.5% 30-year rate, 1.1% property tax and a $10,000–$30,000 deposit, that works out to a home of roughly $185,000–$200,000." },
  ],
};

export default content;
