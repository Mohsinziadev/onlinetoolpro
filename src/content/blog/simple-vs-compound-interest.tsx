import Link from "next/link";
import { Callout, DataTable, ToolCta } from "@/components/blog/content";
import type { PostContent } from "@/lib/blog/types";

const content: PostContent = {
  quickAnswer: (
    <p>
      <strong>Simple interest</strong> is paid only on the original amount. <strong>Compound interest</strong> is paid on the original amount{" "}
      <em>and</em> on interest already added — so it grows faster. $10,000 at 5% for 10 years earns $5,000 with simple interest and $6,289 with
      yearly compounding. Over 30 years the gap becomes $15,000 vs $33,219.
    </p>
  ),
  intro: (
    <>
      <p>
        The difference between the two is easy to dismiss after one year — it&apos;s zero. After five years it&apos;s small. After twenty it&apos;s
        larger than the original deposit. That curve is why compound interest is the engine of long-term saving, and also why long-term debt
        gets so expensive.
      </p>
    </>
  ),
  sections: [
    {
      id: "formulas",
      title: "The two formulas",
      body: (
        <>
          <ul>
            <li>
              <strong>Simple interest:</strong> I = P × r × t. Principal times rate times time (in years).
            </li>
            <li>
              <strong>Compound interest:</strong> A = P × (1 + r/n)<sup>n×t</sup>, where n is how many times a year interest is added. Subtract P to
              get just the interest.
            </li>
          </ul>
          <p>
            With simple interest, the yearly interest never changes. With compound interest, each year&apos;s interest is a little bigger than the
            last because it&apos;s calculated on a bigger balance.
          </p>
        </>
      ),
    },
    {
      id: "over-time",
      title: "How the gap grows",
      body: (
        <>
          <DataTable
            caption="Interest earned on $10,000 at 5% a year"
            head={["Years", "Simple interest", "Compound (yearly)", "Difference"]}
            rows={[
              ["1", "$500", "$500", "$0"],
              ["5", "$2,500", "$2,763", "$263"],
              ["10", "$5,000", "$6,289", "$1,289"],
              ["20", "$10,000", "$16,533", "$6,533"],
              ["30", "$15,000", "$33,219", "$18,219"],
            ]}
          />
          <p>
            Compounding more often adds a bit more: the same $10,000 at 5% compounded monthly earns $6,470 over 10 years instead of $6,289. Time
            matters far more than frequency.
          </p>
          <ToolCta tool="finance/compound-interest-calculator">See compound growth with monthly contributions, year by year.</ToolCta>
        </>
      ),
    },
    {
      id: "where-each-is-used",
      title: "Where you'll meet each one",
      body: (
        <DataTable
          caption="Simple vs compound interest in everyday money"
          head={["Usually simple interest", "Usually compound interest"]}
          rows={[
            ["Many car loans and short personal loans", "Savings accounts"],
            ["Bonds paying a fixed coupon", "Credit cards"],
            ["Some short-term business loans", "Investments with reinvested returns"],
            ["School and exam questions", "Mortgages and most long loans (monthly)"],
          ]}
        />
      ),
    },
    {
      id: "apr-apy",
      title: "APR vs APY: compounding in the small print",
      body: (
        <>
          <p>
            Banks show compounding through two rates. <strong>APR</strong> is the yearly rate before compounding; <strong>APY</strong> (or AER in the
            UK) includes it. A savings account at 5% APR compounded monthly has an APY of about 5.12%.
          </p>
          <Callout type="tip">
            When you&apos;re saving, compare APY/AER — higher is better. When you&apos;re borrowing, remember that a card&apos;s 24% APR compounds
            too, so the real yearly cost is higher than it looks.
          </Callout>
        </>
      ),
    },
    {
      id: "use-it",
      title: "Making compounding work for you",
      body: (
        <ul>
          <li>
            <strong>Start early.</strong> Ten extra years of compounding often matters more than a higher contribution later.
          </li>
          <li>
            <strong>Reinvest returns</strong> rather than taking them out.
          </li>
          <li>
            <strong>Kill compound debt first.</strong> A credit card compounding at 20%+ undoes years of savings growth — see{" "}
            <Link href="/blog/how-credit-card-interest-is-calculated">how card interest is calculated</Link>.
          </li>
          <li>
            Check a quick simple-interest figure with the <Link href="/finance-calculators/simple-interest-calculator">simple interest calculator</Link>
            , which also shows the compound equivalent.
          </li>
        </ul>
      ),
    },
  ],
  faqs: [
    { q: "What's the difference between simple and compound interest?", a: "Simple interest is calculated only on the original amount. Compound interest is also calculated on interest already added, so it grows faster over time." },
    { q: "Which is better, simple or compound interest?", a: "For savings, compound interest earns more. For a loan, simple interest costs less." },
    { q: "What is the simple interest formula?", a: "Interest = principal × rate × time. $5,000 at 5% for 3 years is 5,000 × 0.05 × 3 = $750." },
    { q: "How often is interest compounded?", a: "It depends on the account — daily, monthly, quarterly or yearly. More frequent compounding earns slightly more; the APY or AER shows the combined effect." },
  ],
};

export default content;
