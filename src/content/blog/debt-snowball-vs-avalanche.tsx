import Link from "next/link";
import { Callout, DataTable, ToolCta } from "@/components/blog/content";
import type { PostContent } from "@/lib/blog/types";

const content: PostContent = {
  quickAnswer: (
    <p>
      The <strong>avalanche</strong> method pays off your highest-interest debt first and always costs the least interest. The{" "}
      <strong>snowball</strong> method pays off your smallest balance first, giving quicker wins that help many people stick with it. In real
      plans the difference in cost is often smaller than people expect — so the best method is the one you&apos;ll actually follow.
    </p>
  ),
  intro: (
    <>
      <p>
        Both methods work the same way underneath. You pay the minimum on every debt, throw every spare dollar at one target debt, and when it&apos;s
        gone, its payment rolls onto the next. The only difference is the order. Avalanche sorts by interest rate. Snowball sorts by balance.
      </p>
      <p>That small difference has started a surprising number of arguments. Here&apos;s what it actually changes.</p>
    </>
  ),
  sections: [
    {
      id: "example",
      title: "A real comparison",
      body: (
        <>
          <p>Two credit cards, with $150 a month extra on top of the minimums:</p>
          <DataTable
            caption="Two debts, $150 a month extra"
            head={["Debt", "Balance", "APR", "Minimum"]}
            rows={[
              ["Card A", "$6,000", "27%", "$180"],
              ["Card B", "$1,200", "18%", "$40"],
            ]}
          />
          <DataTable
            caption="The result"
            head={["Method", "Pays first", "Debt-free in", "Total interest"]}
            rows={[
              ["Avalanche", "Card A (27%)", "26 months", "$2,142"],
              ["Snowball", "Card B ($1,200)", "26 months", "$2,319"],
            ]}
          />
          <p>
            Avalanche saves $177 here, and both finish in the same month. Snowball, though, clears Card B in a few months — one fewer bill, one
            visible win — while avalanche asks you to chip away at the big card for over a year before anything disappears.
          </p>
          <ToolCta tool="finance/debt-payoff-calculator">Add your own debts — it runs both methods side by side and shows your debt-free date.</ToolCta>
        </>
      ),
    },
    {
      id: "when-same",
      title: "Sometimes they're exactly the same",
      body: (
        <p>
          If your smallest debt also has the highest rate — a common pattern, since store cards tend to be small and expensive — both methods pay
          things off in the same order and give identical results. The debate only matters when your smallest balance has a lower rate than a
          bigger one.
        </p>
      ),
    },
    {
      id: "psychology",
      title: "Why the snowball works for so many people",
      body: (
        <>
          <p>
            Paying off debt takes months or years, and most plans fail because people stop, not because they chose the wrong order. Research has
            backed up what many people feel: a study published in the <em>Journal of Marketing Research</em> (Gal and McShane, 2012) found that
            people who closed out individual debts were more likely to eliminate their overall debt — the sense of progress kept them going.
          </p>
          <p>
            So if a slightly higher interest bill is the price of actually finishing, snowball can be the better choice. If you&apos;re motivated
            by numbers, avalanche is the cheapest route.
          </p>
          <Callout type="tip" title="A hybrid that works well">
            Start with snowball to knock out one or two tiny balances quickly, then switch to avalanche for the large, expensive ones.
          </Callout>
        </>
      ),
    },
    {
      id: "what-matters-more",
      title: "What matters more than the method",
      body: (
        <>
          <ul>
            <li>
              <strong>The extra amount.</strong> In the example, dropping the $150 extra to zero adds many months and far more interest than the
              choice of method ever could.
            </li>
            <li>
              <strong>Not adding new debt.</strong> Every plan assumes the cards stay in the drawer. Keep one for emergencies if you need to, but
              stop using them day to day.
            </li>
            <li>
              <strong>Minimums that cover interest.</strong> If a minimum payment is less than the interest added each month, that balance never
              shrinks. The calculator warns you when this happens.
            </li>
            <li>
              <strong>A small cushion.</strong> Even $500–$1,000 set aside stops a surprise bill from going straight back onto a card.
            </li>
          </ul>
          <p>
            For a single card, the <Link href="/finance-calculators/credit-card-payoff-calculator">credit card payoff calculator</Link> shows what to
            pay each month to clear it by a date — and our guide on{" "}
            <Link href="/blog/how-credit-card-interest-is-calculated">how card interest is calculated</Link> explains why balances fall so slowly.
          </p>
        </>
      ),
    },
  ],
  faqs: [
    { q: "Which is better, debt snowball or avalanche?", a: "Avalanche costs the least interest. Snowball gives faster early wins, which helps many people stay on track. The cost difference is often small, so pick the one you'll stick with." },
    { q: "What is the debt snowball method?", a: "Paying minimums on everything and putting all extra money toward your smallest balance first, then rolling that payment onto the next smallest." },
    { q: "What is the debt avalanche method?", a: "Paying minimums on everything and putting all extra money toward the debt with the highest interest rate first." },
    { q: "Should I include my mortgage?", a: "Usually not. Mortgages and other low-rate, long-term loans are typically left until higher-interest debts are cleared." },
  ],
};

export default content;
