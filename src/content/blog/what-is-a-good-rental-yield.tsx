import Link from "next/link";
import { Callout, DataTable, Steps, ToolCta } from "@/components/blog/content";
import type { PostContent } from "@/lib/blog/types";

const content: PostContent = {
  quickAnswer: (
    <p>
      A <strong>gross rental yield of around 5–8%</strong> is often treated as healthy, but the number that really matters is the{" "}
      <strong>net yield</strong> — after costs, empty months and buying costs — which is commonly 1.5–3 points lower. Yield also has to be weighed
      against how much the property might grow in value: high-yield areas often grow more slowly.
    </p>
  ),
  intro: (
    <>
      <p>
        Rental yield is the first number any landlord or investor looks at, and also the most quoted out of context. A listing that says “8%
        yield!” is almost always giving you the gross figure — rent divided by price — which ignores every cost of actually owning the place. Here&apos;s
        how to work out both, and how to judge what you see.
      </p>
    </>
  ),
  sections: [
    {
      id: "gross-vs-net",
      title: "Gross vs net yield",
      body: (
        <>
          <ul>
            <li>
              <strong>Gross yield</strong> = yearly rent ÷ property price × 100. Quick, useful for comparing listings, and flattering.
            </li>
            <li>
              <strong>Net yield</strong> = (rent you actually collect − running costs) ÷ (price + buying costs) × 100. Slower to work out, and the
              one that tells you whether the property pays.
            </li>
          </ul>
          <p>Neither includes mortgage interest or income tax — yield measures the property, not your financing.</p>
        </>
      ),
    },
    {
      id: "example",
      title: "Worked example",
      body: (
        <>
          <p>A flat costs £250,000 and rents for £1,250 a month.</p>
          <Steps
            items={[
              <>Gross yield: £1,250 × 12 = £15,000 a year. £15,000 ÷ £250,000 = <strong>6.0%</strong>.</>,
              <>Allow for 5% vacancy (about two and a half weeks empty a year): £15,000 × 0.95 = £14,250 collected.</>,
              <>Subtract running costs — letting agent, insurance, repairs, service charge — say £3,000: £11,250.</>,
              <>Add buying costs to the price — stamp duty, legal fees, a few fixes — say £9,000: £259,000.</>,
              <>Net yield: £11,250 ÷ £259,000 = <strong>4.3%</strong>.</>,
            ]}
          />
          <p>The advertised 6% became 4.3% before a single pound of mortgage interest. That gap is normal.</p>
          <ToolCta tool="finance/rental-yield-calculator">Enter the price, rent, costs and vacancy — get gross and net yield in seconds.</ToolCta>
        </>
      ),
    },
    {
      id: "running-costs",
      title: "Running costs people forget",
      body: (
        <DataTable
          caption="Typical yearly costs for a rental property"
          head={["Cost", "Rough guide"]}
          rows={[
            ["Letting / management agent", "8–15% of rent, if you use one"],
            ["Maintenance and repairs", "Often budgeted at around 1% of the property value a year"],
            ["Landlord insurance", "A few hundred a year"],
            ["Service charge / ground rent (flats)", "Can be thousands — check before buying"],
            ["Safety certificates and compliance", "Gas, electrical and similar checks, depending on the country"],
            ["Vacancy between tenants", "Two to four weeks a year is a common allowance"],
          ]}
        />
      ),
    },
    {
      id: "what-is-good",
      title: "So what's a good yield?",
      body: (
        <>
          <p>There&apos;s no single answer, because yield is only half of the return. The other half is capital growth:</p>
          <ul>
            <li>
              <strong>Expensive, popular cities</strong> often have low yields (3–5% gross) because prices are high relative to rents — investors
              accept that in the hope of stronger growth.
            </li>
            <li>
              <strong>Cheaper towns</strong> can show 7–10% gross, but prices may grow slowly, tenants may be harder to find, and costs eat a
              bigger share of a smaller rent.
            </li>
          </ul>
          <Callout type="tip">
            A useful sanity check: if the net yield is lower than the interest rate on your mortgage, the property costs you money every month
            unless rents rise. That can still work out with growth — but go in knowing it.
          </Callout>
          <p>
            To see the return on <em>your</em> money once a mortgage is involved, combine the{" "}
            <Link href="/finance-calculators/mortgage-calculator">mortgage calculator</Link> with the{" "}
            <Link href="/finance-calculators/roi-calculator">ROI calculator</Link>.
          </p>
        </>
      ),
    },
  ],
  faqs: [
    { q: "How do you calculate rental yield?", a: "Gross yield is yearly rent ÷ property price × 100. Net yield is (rent collected − running costs) ÷ (price + buying costs) × 100." },
    { q: "What is a good rental yield in the UK?", a: "Many investors look for 5–8% gross, but it varies widely by area. Net yields are usually 1.5–3 points lower." },
    { q: "Is a higher rental yield always better?", a: "Not necessarily. Very high yields often come with slower price growth, higher vacancies or bigger maintenance bills." },
    { q: "Does rental yield include mortgage costs?", a: "No. Yield measures the property itself. Mortgage interest and tax affect your personal return, not the yield." },
  ],
};

export default content;
