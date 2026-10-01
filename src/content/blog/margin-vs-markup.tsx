import Link from "next/link";
import { Callout, DataTable, ToolCta } from "@/components/blog/content";
import type { PostContent } from "@/lib/blog/types";

const content: PostContent = {
  quickAnswer: (
    <p>
      <strong>Markup</strong> is profit as a percentage of <strong>cost</strong>. <strong>Margin</strong> is profit as a percentage of the{" "}
      <strong>selling price</strong>. Buy something for $30 and sell it for $50: the $20 profit is a 66.7% markup but a 40% margin. Same sale, two
      very different percentages — which is exactly why mixing them up costs businesses money.
    </p>
  ),
  intro: (
    <>
      <p>
        Here&apos;s a common way it goes wrong. A shop owner wants a 40% margin, so they add 40% to the cost. An item costing $30 goes out at $42.
        But $12 profit on a $42 price is a 28.6% margin, not 40%. Across a whole product range, that gap is the difference between a healthy
        business and one that never quite covers its bills.
      </p>
    </>
  ),
  sections: [
    {
      id: "formulas",
      title: "The formulas",
      body: (
        <>
          <ul>
            <li>
              <strong>Markup</strong> = (price − cost) ÷ cost × 100
            </li>
            <li>
              <strong>Margin</strong> = (price − cost) ÷ price × 100
            </li>
            <li>
              <strong>Price for a target margin</strong> = cost ÷ (1 − margin). For 40%: $30 ÷ 0.6 = $50.
            </li>
            <li>
              <strong>Price for a target markup</strong> = cost × (1 + markup). For 40%: $30 × 1.4 = $42.
            </li>
          </ul>
          <ToolCta tool="finance/profit-margin-calculator">Enter a cost with a price, margin or markup — get all three numbers at once.</ToolCta>
        </>
      ),
    },
    {
      id: "conversion-table",
      title: "Margin to markup conversion table",
      body: (
        <>
          <DataTable
            caption="The markup you need for each margin"
            head={["Margin you want", "Markup needed"]}
            rows={[
              ["20%", "25%"],
              ["25%", "33.3%"],
              ["30%", "42.9%"],
              ["40%", "66.7%"],
              ["50%", "100%"],
            ]}
          />
          <p>
            Margin can never reach 100% — that would mean the whole price is profit and the item cost nothing. Markup has no ceiling: a 300% markup
            just means selling at four times the cost.
          </p>
        </>
      ),
    },
    {
      id: "which-to-use",
      title: "Which one should you use?",
      body: (
        <>
          <ul>
            <li>
              <strong>Margin</strong> is what accountants, investors and most financial reports use. It answers “how much of every sale do we keep?”
              — handy when comparing with overheads, which are also measured against revenue.
            </li>
            <li>
              <strong>Markup</strong> is convenient for pricing on the shop floor: take the cost, add a percentage, done. Many retailers and trades
              price this way.
            </li>
          </ul>
          <Callout type="tip">
            Whichever you use, say which one it is. “We work on 40%” means very different prices depending on whether it&apos;s margin or markup.
          </Callout>
        </>
      ),
    },
    {
      id: "discounts",
      title: "How discounts eat margin",
      body: (
        <>
          <p>
            Discounts come off the price, so they hit margin hard. An item with a 40% margin ($30 cost, $50 price) put on a 20% sale sells for $40 —
            and the margin falls to 25%. A 40% discount would wipe the profit out entirely.
          </p>
          <p>
            Stacked discounts are another trap: “20% off, plus an extra 10% at the till” is 28% off, not 30%, because the second discount applies to
            the already-reduced price. The <Link href="/finance-calculators/discount-calculator">discount calculator</Link> handles stacking and tax,
            and our <Link href="/blog/how-to-calculate-percentage-change">percentage change guide</Link> shows how to work back to an original price.
          </p>
        </>
      ),
    },
    {
      id: "gross-vs-net",
      title: "Gross margin vs net margin",
      body: (
        <p>
          Everything above is <strong>gross</strong> margin — price minus the direct cost of the item. <strong>Net</strong> margin takes off
          everything else too: rent, wages, software, marketing and tax. A shop with a healthy 50% gross margin can still have a thin net margin once
          those are paid, so price with your overheads in mind, not just the product cost.
        </p>
      ),
    },
  ],
  faqs: [
    { q: "What's the difference between margin and markup?", a: "Markup is profit divided by cost; margin is profit divided by price. A $30 item sold for $50 has a 66.7% markup and a 40% margin." },
    { q: "Is a 50% markup a 50% margin?", a: "No. A 50% markup gives a 33.3% margin. To get a 50% margin you need a 100% markup — selling at double the cost." },
    { q: "How do I calculate the selling price from margin?", a: "Divide the cost by (1 − margin). For a 25% margin on a $60 cost: $60 ÷ 0.75 = $80." },
    { q: "What is a good profit margin?", a: "It varies hugely by industry — grocery retail can run on low single-digit net margins while software can be far higher. Compare with businesses like yours." },
  ],
};

export default content;
