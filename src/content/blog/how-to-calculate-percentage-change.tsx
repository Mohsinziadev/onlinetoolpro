import Link from "next/link";
import { Callout, DataTable, Steps, ToolCta } from "@/components/blog/content";
import type { PostContent } from "@/lib/blog/types";

const content: PostContent = {
  quickAnswer: (
    <>
      <p>
        <strong>Percentage change = (new value − old value) ÷ old value × 100.</strong>
      </p>
      <p>
        From 80 to 100: (100 − 80) ÷ 80 × 100 = <strong>+25%</strong>. From 100 to 80: (80 − 100) ÷ 100 × 100 = <strong>−20%</strong>. A
        positive result is an increase, a negative one a decrease. The{" "}
        <Link href="/calculators/percentage-calculator">percentage calculator</Link> does this for you and shows the working.
      </p>
    </>
  ),
  intro: (
    <>
      <p>
        The formula fits on one line, yet percentage changes are misreported constantly — in sales reports, news articles and
        &ldquo;50% off&rdquo; signs. The math is rarely the problem. The mistakes come from dividing by the wrong number, mixing up percent
        and percentage points, and assuming percentages add up. Here&apos;s the method, then the traps.
      </p>
    </>
  ),
  sections: [
    {
      id: "step-by-step",
      title: "How to calculate it, step by step",
      body: (
        <>
          <Steps
            items={[
              <>Subtract the old value from the new value. This is the change.</>,
              <>
                Divide the change by the <strong>old</strong> value — the one you started from.
              </>,
              <>Multiply by 100 to turn it into a percentage.</>,
            ]}
          />
          <p>
            Example: a website had 950 visitors last month and 1,200 this month. The change is 1,200 − 950 = 250. Divided by 950 that&apos;s
            0.263, so traffic grew by about <strong>26.3%</strong>.
          </p>
          <ToolCta tool="calculators/percentage-calculator">Percentage change, “X% of Y” and increases or decreases — with the formula shown.</ToolCta>
        </>
      ),
    },
    {
      id: "why-not-symmetric",
      title: "Why going up and coming back down aren't the same percentage",
      body: (
        <>
          <p>
            Going from 80 to 100 is +25%, but going from 100 back to 80 is −20%. Same two numbers, different percentages — because each
            calculation divides by a different starting value.
          </p>
          <p>This trips people up most with successive changes:</p>
          <DataTable
            caption="Successive percentage changes don't cancel out"
            head={["Start", "Change", "Then", "Result", "Overall"]}
            rows={[
              ["100", "+10%", "−10%", "99", "−1%"],
              ["100", "−50%", "+50%", "75", "−25%"],
              ["80", "+25%", "−20%", "80", "0%"],
            ]}
          />
          <p>
            A stock that falls 50% has to rise 100% — not 50% — to get back to where it was. To combine changes, multiply the factors instead
            of adding the percentages: +10% then −10% is 1.10 × 0.90 = 0.99, a 1% drop.
          </p>
        </>
      ),
    },
    {
      id: "percentage-points",
      title: "Percent vs percentage points",
      body: (
        <>
          <p>
            When the values are already percentages, there are two different ways to describe a change, and they give very different numbers.
            If an interest rate goes from 10% to 15%:
          </p>
          <ul>
            <li>
              It rose by <strong>5 percentage points</strong> (15 − 10).
            </li>
            <li>
              It rose by <strong>50 percent</strong> (5 ÷ 10 × 100).
            </li>
          </ul>
          <p>
            Both are correct; they answer different questions. Saying the rate &ldquo;rose 5%&rdquo; is the mistake — it&apos;s neither. Use
            &ldquo;points&rdquo; for the plain difference between two percentages and &ldquo;percent&rdquo; for the relative change.
          </p>
          <Callout type="tip">
            Small starting values make relative changes look dramatic. A rare event going from 1% to 2% is a 1-point rise but a 100% increase —
            accurate, and easily misleading. Giving both numbers is the honest way to report it.
          </Callout>
        </>
      ),
    },
    {
      id: "reverse",
      title: "Working backwards: finding the original price",
      body: (
        <>
          <p>
            A jacket costs 80 after a 20% discount. What was the original price? The tempting answer — add 20% back, 80 × 1.2 = 96 — is wrong,
            because the 20% was taken from the original price, not from 80.
          </p>
          <p>
            <strong>Original = final price ÷ (1 − discount).</strong> So 80 ÷ 0.8 = <strong>100</strong>. Check: 20% of 100 is 20, and 100 − 20 =
            80. ✓
          </p>
          <p>
            The same works for increases: if a price after a 25% rise is 150, the original was 150 ÷ 1.25 = 120. And for taxes: a total of 115
            including 15% tax means a pre-tax price of 115 ÷ 1.15 = 100.
          </p>
        </>
      ),
    },
    {
      id: "negative-and-zero",
      title: "When the old value is zero or negative",
      body: (
        <>
          <ul>
            <li>
              <strong>Old value of zero:</strong> percentage change is undefined — you can&apos;t divide by zero. Going from 0 to 40 sales is
              “up by 40”, not “up by infinity percent”. Report the actual numbers.
            </li>
            <li>
              <strong>Negative old value:</strong> a company going from a loss of −50 to a profit of +25 has clearly improved, but the plain
              formula gives (25 − (−50)) ÷ (−50) = −150%, which reads like a decline. The usual fix is to divide by the <em>absolute</em> old
              value: 75 ÷ 50 = <strong>+150%</strong>. Our calculator does this; spreadsheets don&apos;t unless you use <code>ABS()</code>.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "percent-difference",
      title: "Percentage change vs percentage difference",
      body: (
        <>
          <p>
            Percentage <em>change</em> has a direction: there&apos;s a before and an after. When you&apos;re comparing two things side by side —
            two prices, two products, two measurements — with neither being “the original”, use percentage <em>difference</em>, which divides
            by the average:
          </p>
          <p>
            <strong>Percentage difference = |a − b| ÷ ((a + b) ÷ 2) × 100</strong>
          </p>
          <p>
            For 80 and 100: 20 ÷ 90 × 100 = <strong>22.2%</strong> — the same whichever order you put them in.
          </p>
        </>
      ),
    },
    {
      id: "several-years",
      title: "Change over several years",
      body: (
        <>
          <p>
            Revenue grew from 100 to 150 over three years. The total change is +50%, but the yearly growth is <em>not</em> 50 ÷ 3 = 16.7%,
            because each year compounds on the last. The average yearly rate is the compound annual growth rate:
          </p>
          <p>
            <strong>CAGR = (end ÷ start)^(1 ÷ years) − 1</strong> → (150 ÷ 100)^(1/3) − 1 = <strong>14.5% a year</strong>.
          </p>
          <p>
            The <Link href="/finance-calculators/compound-interest-calculator">compound interest calculator</Link> shows the same effect going forward:
            how a yearly rate builds up over time.
          </p>
        </>
      ),
    },
    {
      id: "spreadsheets",
      title: "In Excel or Google Sheets",
      body: (
        <>
          <p>
            With the old value in A2 and the new value in B2, enter <code>=(B2-A2)/A2</code> and format the cell as a percentage. Leave out the
            “× 100” — the percentage format does that for you, and multiplying as well is a classic way to end up with 2,500%.
          </p>
          <p>
            To handle negative starting values, use <code>=(B2-A2)/ABS(A2)</code>, and wrap it as{" "}
            <code>=IF(A2=0, &quot;&quot;, (B2-A2)/ABS(A2))</code> to avoid divide-by-zero errors.
          </p>
        </>
      ),
    },
  ],
  faqs: [
    { q: "What is the formula for percentage change?", a: "(New value − old value) ÷ old value × 100. A positive answer is an increase; a negative answer is a decrease." },
    { q: "How do I calculate a percentage decrease?", a: "Use the same formula; the result will be negative. From 250 to 200: (200 − 250) ÷ 250 × 100 = −20%, a 20% decrease." },
    { q: "Is a 100% decrease possible?", a: "Yes — it means the value fell to zero. A decrease can't be more than 100%, but an increase can be any size: doubling is +100%, tripling is +200%." },
    { q: "What's the difference between percent and percentage points?", a: "Percentage points are the plain difference between two percentages (10% to 15% is +5 points). Percent is the relative change (10% to 15% is a 50% increase)." },
    { q: "Why does a 50% loss need a 100% gain to recover?", a: "Because the gain is calculated on the smaller, reduced amount. 100 falls 50% to 50; getting back to 100 means adding 50, which is 100% of 50." },
  ],
};

export default content;
