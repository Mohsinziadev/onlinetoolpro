import Link from "next/link";
import { Callout, DataTable, ToolCta } from "@/components/blog/content";
import type { PostContent } from "@/lib/blog/types";

const content: PostContent = {
  quickAnswer: (
    <p>
      Buying usually works out cheaper <strong>only if you stay long enough</strong> — often somewhere between 5 and 10 years — to outweigh the
      costs of buying and selling. Stay a short time and renting tends to win. The break-even point depends mostly on how long you stay, local
      rents versus prices, and how fast home values grow.
    </p>
  ),
  intro: (
    <>
      <p>
        “Rent is dead money” is one of the most repeated lines in personal finance, and it&apos;s only half true. Rent buys you a place to live —
        exactly like the interest, property tax, insurance and repairs a homeowner pays, which are just as “dead”. The real question is which set
        of unrecoverable costs is smaller for you.
      </p>
    </>
  ),
  sections: [
    {
      id: "unrecoverable-costs",
      title: "Compare unrecoverable costs, not rent vs mortgage",
      body: (
        <>
          <p>
            Comparing your rent with a mortgage payment is misleading, because part of the mortgage payment is savings — it pays down the loan and
            you get it back when you sell. What you never get back is:
          </p>
          <DataTable
            caption="The costs you don't get back"
            head={["Renting", "Owning"]}
            rows={[
              ["Rent", "Mortgage interest"],
              ["Renter's insurance (small)", "Property tax, home insurance"],
              ["—", "Maintenance and repairs (often 1–2% of the value a year)"],
              ["—", "Buying costs: closing costs, stamp duty or transfer tax"],
              ["—", "Selling costs: agent fees and legal costs (often 5–6% in the US)"],
              ["Lost growth on money not invested", "Lost growth on the deposit tied up in the house"],
            ]}
          />
          <p>
            That last row is easy to forget. A $80,000 deposit sitting in a house isn&apos;t earning anything else. A renter can invest it.
          </p>
        </>
      ),
    },
    {
      id: "example",
      title: "A worked example",
      body: (
        <>
          <p>
            Take a $400,000 home with 20% down at a 6.5% mortgage rate, against renting a similar place for $2,000 a month. Assume home prices and
            rents both rise 3% a year, the renter invests the deposit at 5%, and buying and selling costs are 3% and 6%.
          </p>
          <DataTable
            caption="Net cost after leaving in year N ($400,000 home vs $2,000 rent)"
            head={["Stay for", "Net cost of buying", "Net cost of renting", "Cheaper"]}
            rows={[
              ["3 years", "$93,000", "$60,000", "Renting"],
              ["5 years", "$130,000", "$102,000", "Renting"],
              ["7 years", "$165,000", "$146,000", "Renting"],
              ["10 years", "$213,000", "$217,000", "Buying (just)"],
              ["15 years", "$283,000", "$347,000", "Buying"],
            ]}
          />
          <p>
            In this example buying pulls ahead around year 10. But nudge one assumption and the picture changes: at $2,500 rent, buying wins after
            about 5 years; at $2,800, after 4. Rent relative to price is often the single biggest factor.
          </p>
          <ToolCta tool="finance/rent-vs-buy-calculator">Enter your own price, rent and plans — it finds the year buying starts to win.</ToolCta>
        </>
      ),
    },
    {
      id: "price-to-rent",
      title: "A quick check: the price-to-rent ratio",
      body: (
        <>
          <p>Divide the home price by a year&apos;s rent for a similar place:</p>
          <ul>
            <li>
              <strong>Under about 15:</strong> buying tends to look good.
            </li>
            <li>
              <strong>15–20:</strong> it could go either way — run the full comparison.
            </li>
            <li>
              <strong>Over about 20:</strong> renting is often the cheaper way to live there.
            </li>
          </ul>
          <p>Our example is $400,000 ÷ $24,000 = 16.7 — right in the “depends” zone, which is why the answer took ten years to appear.</p>
        </>
      ),
    },
    {
      id: "not-just-money",
      title: "What the numbers can't tell you",
      body: (
        <>
          <ul>
            <li>
              <strong>Flexibility.</strong> If there&apos;s a real chance of moving for work or family within a few years, the buying and selling
              costs alone can sink the case for buying.
            </li>
            <li>
              <strong>Stability.</strong> Owning protects you from rent rises and from a landlord deciding to sell. For families settled in an
              area, that&apos;s worth something.
            </li>
            <li>
              <strong>Forced saving.</strong> Mortgage payments build equity automatically. Renters only come out ahead if they actually invest
              the difference — and many don&apos;t.
            </li>
            <li>
              <strong>Effort and risk.</strong> A new roof or boiler is the owner&apos;s problem, and it rarely arrives at a convenient time.
            </li>
          </ul>
          <Callout type="tip">
            If you&apos;re leaning towards buying, check the price range you can actually afford first with the{" "}
            <Link href="/blog/28-36-rule">28/36 rule</Link>, then come back to this comparison with a realistic price.
          </Callout>
        </>
      ),
    },
  ],
  faqs: [
    { q: "Is renting a waste of money?", a: "No more than mortgage interest, property tax and repairs are. Compare the costs you can't get back on each side, not rent against a whole mortgage payment." },
    { q: "How long do you need to stay for buying to be worth it?", a: "Commonly 5–10 years, but it varies a lot with local rents, prices and growth. The rent vs buy calculator finds the break-even year for your numbers." },
    { q: "What's a good price-to-rent ratio for buying?", a: "Below about 15 usually favors buying; above about 20 usually favors renting." },
    { q: "Does a rising housing market mean I should buy?", a: "Faster price growth helps buying, but nobody knows future prices. Test a few growth rates — if buying only wins with optimistic growth, be careful." },
  ],
};

export default content;
