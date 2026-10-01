import Link from "next/link";
import { Callout, DataTable, Steps, ToolCta } from "@/components/blog/content";
import type { PostContent } from "@/lib/blog/types";

const content: PostContent = {
  quickAnswer: (
    <p>
      <strong>ROI = (final value − amount invested) ÷ amount invested × 100.</strong> Invest $10,000, end up with $13,500, and your ROI is{" "}
      <strong>35%</strong>. To compare investments held for different lengths of time, convert it to an <strong>annualized</strong> return: 35% over
      three years is about 10.5% a year.
    </p>
  ),
  intro: (
    <>
      <p>
        ROI — return on investment — is the simplest way to answer “was it worth it?” It works for shares, property, a new piece of equipment or an
        ad campaign. It&apos;s also easy to misuse, because the basic version ignores time, and time changes everything.
      </p>
    </>
  ),
  sections: [
    {
      id: "basic",
      title: "The basic calculation",
      body: (
        <>
          <Steps
            items={[
              <>Work out the gain: final value − what you put in. $13,500 − $10,000 = $3,500.</>,
              <>Divide by what you put in: $3,500 ÷ $10,000 = 0.35.</>,
              <>Multiply by 100: <strong>35% ROI</strong>.</>,
            ]}
          />
          <p>
            “Final value” should include everything you got back — sale proceeds plus any dividends, rent or interest received — minus fees, commissions
            and other costs. Leave those out and ROI looks better than it was.
          </p>
          <ToolCta tool="finance/roi-calculator">Enter what you invested and what you got back — see ROI and the annualized return.</ToolCta>
        </>
      ),
    },
    {
      id: "time-matters",
      title: "Why you need the annualized return",
      body: (
        <>
          <p>Which is better?</p>
          <DataTable
            caption="Same money, different holding periods"
            head={["", "Investment A", "Investment B"]}
            rows={[
              ["Invested", "$10,000", "$10,000"],
              ["Final value", "$13,500", "$12,500"],
              ["Held for", "3 years", "18 months"],
              ["ROI", "35%", "25%"],
              ["Annualized return", "10.5% a year", "16.0% a year"],
            ]}
          />
          <p>
            A has the bigger ROI, but B earned its return twice as fast. Annualizing puts both on a yearly footing:{" "}
            <strong>(final ÷ invested)<sup>1 ÷ years</sup> − 1</strong>. This is the same idea as CAGR, the compound annual growth rate.
          </p>
          <Callout type="warning">
            Don&apos;t just divide total ROI by the number of years. 35% ÷ 3 = 11.7% overstates the yearly return because it ignores compounding.
          </Callout>
        </>
      ),
    },
    {
      id: "marketing-roi",
      title: "ROI for marketing and business decisions",
      body: (
        <>
          <p>
            The same formula works: (revenue gained − cost) ÷ cost. A campaign that costs $2,000 and brings $5,000 of extra <em>profit</em> has a 150%
            ROI. Use profit, not revenue — $5,000 of sales on a product with a 30% margin is only $1,500 of profit, which would be a loss.
          </p>
          <p>
            The <Link href="/finance-calculators/profit-margin-calculator">profit margin calculator</Link> helps turn sales into profit before you
            calculate ROI.
          </p>
        </>
      ),
    },
    {
      id: "what-roi-misses",
      title: "What ROI doesn't tell you",
      body: (
        <ul>
          <li>
            <strong>Risk.</strong> A 10% return from a savings account and 10% from a single speculative stock are very different achievements.
          </li>
          <li>
            <strong>Borrowed money.</strong> With a mortgage, return on <em>your</em> cash can be much higher (or lower) than the property&apos;s own
            return. See <Link href="/blog/what-is-a-good-rental-yield">rental yield</Link> for the property side.
          </li>
          <li>
            <strong>Inflation.</strong> A 5% yearly return with 3% inflation is about 2% in real terms.
          </li>
          <li>
            <strong>Your time.</strong> A side business with a great ROI may still pay less than minimum wage per hour.
          </li>
        </ul>
      ),
    },
  ],
  faqs: [
    { q: "How do you calculate ROI?", a: "ROI = (final value − amount invested) ÷ amount invested × 100. $10,000 that becomes $13,500 is a 35% ROI." },
    { q: "What is a good ROI?", a: "It depends on the risk and time. Over long periods, broad stock markets have historically returned somewhere around 7–10% a year before inflation, which is a common benchmark for investments." },
    { q: "What's the difference between ROI and annualized return?", a: "ROI is the total return over the whole period. Annualized return is the equivalent steady yearly rate, which lets you compare investments held for different lengths of time." },
    { q: "Can ROI be negative?", a: "Yes. If the final value is less than what you put in, ROI is negative — a loss." },
  ],
};

export default content;
