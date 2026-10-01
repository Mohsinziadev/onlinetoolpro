import Link from "next/link";
import { Callout, DataTable, ToolCta } from "@/components/blog/content";
import type { PostContent } from "@/lib/blog/types";

const content: PostContent = {
  quickAnswer: (
    <p>
      Inflation means the same money buys less over time. If prices rise 3% a year, <strong>$10,000 kept as cash buys only what about $7,440
      buys today after 10 years</strong>. Your savings only grow in real terms if the interest rate you earn — after tax — is higher than inflation.
    </p>
  ),
  intro: (
    <>
      <p>
        A savings balance that never goes down feels safe, and in one sense it is: the number on the screen doesn&apos;t drop. What drops is what
        that number can buy. Inflation is a slow, quiet cost, and because it never shows up on a statement it&apos;s easy to ignore for years.
      </p>
    </>
  ),
  sections: [
    {
      id: "real-return",
      title: "The number that matters: your real return",
      body: (
        <>
          <p>
            Your <strong>real return</strong> is roughly the interest rate minus inflation. Earn 4% while prices rise 3% and your money is only
            really growing by about 1% a year. Earn 1% while prices rise 3% and you&apos;re losing about 2% a year in buying power.
          </p>
          <DataTable
            caption="$10,000 over 10 years with 3% inflation"
            head={["Where it's kept", "Interest", "Balance after 10 years", "Worth in today's money"]}
            rows={[
              ["Cash at home", "0%", "$10,000", "$7,441"],
              ["Ordinary savings account", "1%", "$11,046", "$8,219"],
              ["Rate that matches inflation", "3%", "$13,439", "$10,000"],
            ]}
          />
          <p>
            Tax makes it a little worse: if interest is taxable where you live, compare inflation with the rate you keep <em>after</em> tax.
          </p>
          <ToolCta tool="finance/inflation-calculator">See what any amount will be worth — or cost — after any number of years.</ToolCta>
        </>
      ),
    },
    {
      id: "rule-of-70",
      title: "The rule of 70",
      body: (
        <p>
          A quick way to feel the effect: divide 70 by the inflation rate to get roughly how many years it takes prices to double. At 2%, about 35
          years. At 3%, about 23. At 7%, just 10. Over a long retirement, even “normal” inflation cuts the value of a fixed income roughly in half.
        </p>
      ),
    },
    {
      id: "what-is-normal",
      title: "What's a normal inflation rate?",
      body: (
        <>
          <p>
            Central banks in the US, UK, Canada and Australia all aim for low, steady inflation — around 2%, or 2–3% in Australia. Actual inflation
            moves around that target and occasionally far above it, as in 2021–2023. For long-term planning many people assume 2.5–3%.
          </p>
          <Callout type="note">
            Your personal inflation rate can differ from the official figure. If a large share of your budget goes on rent, energy or childcare,
            and those rise faster than average, your costs climb faster too.
          </Callout>
        </>
      ),
    },
    {
      id: "protecting-savings",
      title: "Protecting your savings from inflation",
      body: (
        <>
          <ul>
            <li>
              <strong>Short-term money</strong> (emergency fund, a deposit you&apos;ll use in a year or two) belongs in the best easy-access savings
              rate you can find. You accept a little inflation loss in exchange for safety.
            </li>
            <li>
              <strong>Long-term money</strong> (retirement, goals more than five years away) has historically beaten inflation more reliably when
              invested in a diversified mix of shares and bonds — with ups and downs along the way.
            </li>
            <li>
              <strong>Inflation-linked bonds</strong> (TIPS in the US, index-linked gilts in the UK) are designed to keep pace with official inflation.
            </li>
            <li>
              <strong>Plan in today&apos;s money.</strong> When you set a goal 20 years out, inflate it first — $100 of today&apos;s spending is about
              $185 in 25 years at 2.5%.
            </li>
          </ul>
          <p>
            The <Link href="/finance-calculators/retirement-calculator">retirement calculator</Link> shows results in today&apos;s money for exactly
            this reason, and the <Link href="/blog/how-much-emergency-fund">emergency fund guide</Link> covers where short-term cash should sit.
          </p>
        </>
      ),
    },
  ],
  faqs: [
    { q: "How does inflation affect savings?", a: "It reduces what your savings can buy. If inflation is higher than the interest you earn, your savings lose real value each year even though the balance grows." },
    { q: "Is it bad to keep money in a savings account during inflation?", a: "Not for money you need soon — safety matters more there. For long-term goals, cash usually falls behind inflation over many years." },
    { q: "What is a real interest rate?", a: "The interest rate minus inflation. 4% interest with 3% inflation is about a 1% real return." },
    { q: "How long does it take for prices to double?", a: "Divide 70 by the inflation rate. At 3% a year, about 23 years." },
  ],
};

export default content;
