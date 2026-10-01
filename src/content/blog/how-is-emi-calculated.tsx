import Link from "next/link";
import { Callout, DataTable, Steps, ToolCta } from "@/components/blog/content";
import type { PostContent } from "@/lib/blog/types";

const content: PostContent = {
  quickAnswer: (
    <>
      <p>
        <strong>EMI = P × r × (1 + r)ⁿ ÷ ((1 + r)ⁿ − 1)</strong>, where P is the loan amount, r is the <em>monthly</em> interest rate (yearly rate ÷
        12 ÷ 100) and n is the number of monthly payments.
      </p>
      <p>
        Borrowing 20,000 at 8% a year for 5 years gives an EMI of <strong>405.53</strong> a month, and 4,331.80 in total interest.
      </p>
    </>
  ),
  intro: (
    <>
      <p>
        EMI — equated monthly instalment — is the fixed payment that repays a loan in full over its term. Each payment covers that month&apos;s
        interest plus a slice of the loan itself. Early on, most of it is interest; by the end, almost all of it is principal. Understanding that
        split is what lets you judge a loan offer properly — and spot the “flat rate” trick that makes some loans look far cheaper than they are.
      </p>
    </>
  ),
  sections: [
    {
      id: "step-by-step",
      title: "Working it out step by step",
      body: (
        <>
          <p>Loan of 20,000 at 8% a year for 5 years:</p>
          <Steps
            items={[
              <>Monthly rate: r = 8 ÷ 12 ÷ 100 = 0.006667.</>,
              <>Number of payments: n = 5 × 12 = 60.</>,
              <>(1 + r)ⁿ = 1.006667⁶⁰ ≈ 1.4898.</>,
              <>EMI = 20,000 × 0.006667 × 1.4898 ÷ (1.4898 − 1) ≈ 405.53.</>,
              <>Total paid: 405.53 × 60 = 24,331.80, so the interest is 4,331.80.</>,
            ]}
          />
          <ToolCta tool="finance/loan-calculator">Enter any amount, rate and term — see the EMI, total interest and the year-by-year breakdown.</ToolCta>
        </>
      ),
    },
    {
      id: "where-it-goes",
      title: "Where each payment goes",
      body: (
        <>
          <p>
            In month one, interest is 20,000 × 0.006667 ≈ 133.33, so only about 272 of the 405.53 pays down the loan. As the balance falls, the
            interest part shrinks and the principal part grows — the EMI stays the same.
          </p>
          <p>
            That&apos;s why paying extra early in a loan saves so much: every bit of principal you clear stops attracting interest for all the
            remaining months.
          </p>
        </>
      ),
    },
    {
      id: "flat-rate",
      title: "The flat-rate trap",
      body: (
        <>
          <p>
            Some lenders — especially for cars, consumer goods and personal loans in some countries — quote a <strong>flat rate</strong>. It
            calculates interest on the <em>original</em> amount for the whole term, even though you&apos;re paying it back every month.
          </p>
          <DataTable
            caption="20,000 over 5 years: 8% reducing vs 8% flat"
            head={["", "8% reducing balance", "8% flat"]}
            rows={[
              ["Interest", "4,331.80", "8,000.00"],
              ["Monthly payment", "405.53", "466.67"],
              ["Equivalent reducing rate", "8%", "about 14.1%"],
            ]}
          />
          <p>
            Same headline number, nearly double the interest. When comparing offers, always ask for the rate on a <strong>reducing balance</strong>{" "}
            (or the APR), not a flat rate.
          </p>
          <Callout type="warning">
            A flat rate of X% is roughly equivalent to a reducing rate of nearly 2X% on a typical loan. If an offer looks unusually cheap, check
            which kind of rate it is.
          </Callout>
        </>
      ),
    },
    {
      id: "prepayment",
      title: "Paying extra: lower EMI or shorter loan?",
      body: (
        <>
          <p>When you make a part-prepayment, many lenders let you choose:</p>
          <ul>
            <li>
              <strong>Keep the EMI, shorten the term</strong> — saves the most interest, because the balance falls faster.
            </li>
            <li>
              <strong>Keep the term, lower the EMI</strong> — eases your monthly budget but saves less overall.
            </li>
          </ul>
          <p>
            If the current payment is comfortable, shortening the term is usually the better deal. Check for prepayment charges first, especially on
            fixed-rate loans.
          </p>
        </>
      ),
    },
    {
      id: "check-offer",
      title: "Checking a loan offer",
      body: (
        <ul>
          <li>Compare the total amount payable, not only the EMI — a longer term always lowers the EMI.</li>
          <li>Add up processing fees and insurance bundled into the loan; they raise the true cost.</li>
          <li>Confirm the rate is on a reducing balance and whether it&apos;s fixed or floating.</li>
          <li>
            For home loans, the <Link href="/finance-calculators/mortgage-calculator">mortgage calculator</Link> includes taxes and insurance; for cars,
            the <Link href="/finance-calculators/auto-loan-calculator">auto loan calculator</Link> handles trade-ins and sales tax.
          </li>
        </ul>
      ),
    },
  ],
  faqs: [
    { q: "What is the EMI formula?", a: "EMI = P × r × (1 + r)ⁿ ÷ ((1 + r)ⁿ − 1), with P the loan amount, r the monthly interest rate and n the number of months." },
    { q: "Does a longer tenure reduce EMI?", a: "Yes, but it increases the total interest you pay, sometimes by a lot." },
    { q: "Is EMI the same every month?", a: "For a fixed-rate loan, yes. With a floating rate, the EMI or the term changes when the rate changes." },
    { q: "What's the difference between flat and reducing interest?", a: "Flat interest is charged on the original loan amount for the whole term; reducing interest is charged only on what you still owe. Reducing is much cheaper at the same headline rate." },
  ],
};

export default content;
