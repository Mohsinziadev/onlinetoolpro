import Link from "next/link";
import { Callout, DataTable, ToolCta } from "@/components/blog/content";
import type { PostContent } from "@/lib/blog/types";

const content: PostContent = {
  quickAnswer: (
    <p>
      Aim for <strong>60 months (5 years) or less</strong> if the payment fits — 48 months is better still. Longer loans lower the monthly payment
      but cost thousands more in interest and leave you owing more than the car is worth for longer. In the US the average new-car loan is now
      around <strong>69 months</strong>, which is a big part of why so many people end up “underwater”.
    </p>
  ),
  intro: (
    <>
      <p>
        At the dealership, the conversation is almost always about the monthly payment. “What payment are you comfortable with?” sounds helpful,
        but it&apos;s the question that makes 72 and 84-month loans feel reasonable. Stretch the term and nearly any car fits nearly any budget —
        you just pay a lot more for it.
      </p>
    </>
  ),
  sections: [
    {
      id: "what-term-costs",
      title: "What each loan length really costs",
      body: (
        <>
          <DataTable
            caption="Borrowing $35,000 at 7% APR"
            head={["Term", "Monthly payment", "Total interest"]}
            rows={[
              ["48 months (4 years)", "$838", "$5,230"],
              ["60 months (5 years)", "$693", "$6,583"],
              ["72 months (6 years)", "$597", "$7,963"],
              ["84 months (7 years)", "$528", "$9,372"],
            ]}
          />
          <p>
            Going from 48 to 84 months cuts the payment by $310 — and adds $4,142 in interest. And that&apos;s at the same rate; in practice,
            lenders usually charge <em>higher</em> rates for longer loans, so the real gap is bigger.
          </p>
          <ToolCta tool="finance/auto-loan-calculator">Compare loan lengths with your price, trade-in, down payment and sales tax.</ToolCta>
        </>
      ),
    },
    {
      id: "underwater",
      title: "The real problem with long loans: being underwater",
      body: (
        <>
          <p>
            A new car loses value fastest in its first few years, while a long loan pays down the balance slowly at the start. For a good chunk of a
            72 or 84-month loan, you can owe more than the car is worth — negative equity.
          </p>
          <p>That matters the moment something changes:</p>
          <ul>
            <li>If the car is written off, insurance pays its value, not your loan balance — you can be left owing money on a car you no longer have (unless you have gap insurance).</li>
            <li>If you want to sell or trade in early, you have to cover the shortfall — and dealers happily roll it into the next loan, which starts that one underwater too.</li>
          </ul>
          <Callout type="warning">
            If you already owe more than your current car is worth, the auto loan calculator shows the shortfall being added to a new loan. It&apos;s
            often better to keep the car a little longer.
          </Callout>
        </>
      ),
    },
    {
      id: "20-4-10",
      title: "The 20/4/10 rule (and why few people follow it)",
      body: (
        <>
          <p>A classic guideline for buying a car:</p>
          <ul>
            <li>
              <strong>20%</strong> down payment,
            </li>
            <li>
              a loan of no more than <strong>4</strong> years,
            </li>
            <li>
              and total car costs — payment, insurance, fuel, maintenance — under <strong>10%</strong> of gross income.
            </li>
          </ul>
          <p>
            With average new-car prices where they are, most buyers don&apos;t come close: typical down payments are nearer 13–14% and terms nearer
            five and a half to six years. That doesn&apos;t make the rule wrong — it&apos;s a useful sign that the car might be more than the budget
            can really carry. A cheaper or used car that fits 20/4/10 usually beats a new one that needs seven years to pay off.
          </p>
        </>
      ),
    },
    {
      id: "when-longer-is-ok",
      title: "When a longer loan can make sense",
      body: (
        <ul>
          <li>You&apos;re offered a 0% or very low promotional rate, so the extra months cost little or nothing.</li>
          <li>You plan to keep the car for many years beyond the loan, and you&apos;ll overpay when you can.</li>
          <li>The lower payment frees money to clear higher-interest debt — though that&apos;s a short-term fix, not a plan.</li>
        </ul>
      ),
    },
    {
      id: "before-you-sign",
      title: "Before you sign",
      body: (
        <ul>
          <li>Negotiate the price of the car first, then talk financing. Mixing them makes it easy to hide costs in the term.</li>
          <li>Get a loan quote from your bank or credit union before visiting the dealer, so you can compare.</li>
          <li>Ask for the total amount payable, not just the monthly figure.</li>
          <li>Check for early repayment fees in case you want to pay it off sooner.</li>
          <li>
            If you&apos;re juggling other debts too, the <Link href="/blog/debt-snowball-vs-avalanche">debt payoff guide</Link> helps decide what to
            clear first.
          </li>
        </ul>
      ),
    },
  ],
  faqs: [
    { q: "Is a 72-month car loan a bad idea?", a: "It's risky. The payment is lower, but you pay more interest and are likely to owe more than the car is worth for several years. Choose a cheaper car or a shorter loan if you can." },
    { q: "What is the average car loan length?", a: "In the US, new-car loans averaged about 69 months in early 2026, according to Experian data." },
    { q: "Is it better to have a lower payment or a shorter loan?", a: "A shorter loan almost always costs less overall. Only stretch the term if the shorter payment genuinely doesn't fit your budget." },
    { q: "Can I pay off a car loan early?", a: "Usually yes, and it saves interest. Check your agreement for early repayment fees first." },
  ],
};

export default content;
