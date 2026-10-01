import Link from "next/link";
import { Callout, Steps, ToolCta } from "@/components/blog/content";
import type { PostContent } from "@/lib/blog/types";

const content: PostContent = {
  quickAnswer: (
    <p>
      Most cards charge interest <strong>daily</strong>: your APR ÷ 365 gives a daily rate, which is applied to your{" "}
      <strong>average daily balance</strong> for the billing cycle. On a $3,000 balance at 22.3% APR that&apos;s about <strong>$55 a month</strong>.
      Pay your full statement balance by the due date and you usually pay no interest at all on purchases.
    </p>
  ),
  intro: (
    <>
      <p>
        Credit card statements show an APR, a balance and an interest charge, and it&apos;s rarely obvious how one turns into the other. The
        mechanics are simple once you see them — and they explain the two things that cost cardholders the most: losing the grace period, and
        paying only the minimum.
      </p>
    </>
  ),
  sections: [
    {
      id: "the-calculation",
      title: "The calculation, step by step",
      body: (
        <>
          <Steps
            items={[
              <>
                <strong>Daily rate:</strong> divide the APR by 365. At 22.3%, that&apos;s 0.0611% a day.
              </>,
              <>
                <strong>Average daily balance:</strong> add up your balance at the end of each day in the billing cycle and divide by the number of
                days. Purchases raise it from the day they post; payments lower it from the day they arrive.
              </>,
              <>
                <strong>Interest for the cycle:</strong> average daily balance × daily rate × days in the cycle. $3,000 × 0.000611 × 30 ≈ $55.
              </>,
            ]}
          />
          <p>
            Because interest is worked out daily, <em>when</em> you pay matters. A payment made on day 5 of the cycle reduces the average balance
            more than the same payment made on day 28. Paying as soon as you&apos;re paid — rather than on the due date — trims the interest a
            little every month.
          </p>
          <Callout type="note">
            Some issuers use 360 days instead of 365, or compound daily (charging interest on yesterday&apos;s interest). The difference is small,
            but it&apos;s why your statement won&apos;t always match a simple calculation to the cent.
          </Callout>
        </>
      ),
    },
    {
      id: "grace-period",
      title: "The grace period — and how you lose it",
      body: (
        <>
          <p>
            Most cards give you a <strong>grace period</strong> of around 21–25 days between the statement date and the due date. If you pay the
            full statement balance by then, new purchases cost nothing.
          </p>
          <p>
            The catch: carry <em>any</em> balance past the due date and the grace period usually disappears. From then on, new purchases start
            collecting interest from the day you make them — even the coffee you bought this morning. Getting it back typically means paying the
            balance in full, sometimes for two cycles in a row.
          </p>
          <Callout type="warning">
            “I&apos;ll pay most of it” is the expensive middle ground. Leaving even $50 unpaid can mean interest on every new purchase until you
            clear the whole thing.
          </Callout>
        </>
      ),
    },
    {
      id: "minimum-payment",
      title: "Why the minimum payment barely moves the balance",
      body: (
        <>
          <p>
            Minimum payments are usually a small percentage of the balance — often 1–3% plus that month&apos;s interest, or a flat amount for small
            balances. On a $3,000 balance at 22.3%, the interest alone is about $55. If your minimum is $90, only $35 actually reduces what you owe.
          </p>
          <p>
            Because the minimum shrinks as the balance shrinks, paying only the minimum can stretch a few thousand dollars of debt over many years.
            A fixed payment works much better: decide on an amount and keep paying it even as the minimum falls.
          </p>
          <ToolCta tool="finance/credit-card-payoff-calculator">See how long a fixed payment takes — or what to pay to clear the card by a date.</ToolCta>
        </>
      ),
    },
    {
      id: "cutting-interest",
      title: "Ways to pay less interest",
      body: (
        <ul>
          <li>
            <strong>Pay in full every month</strong> if you possibly can — the grace period makes the card free.
          </li>
          <li>
            <strong>Pay early in the cycle</strong> to lower your average daily balance.
          </li>
          <li>
            <strong>Pay a fixed amount</strong> above the minimum, and don&apos;t let it shrink.
          </li>
          <li>
            <strong>Consider a 0% balance transfer</strong> if you can clear the balance within the offer period — but check the transfer fee
            (often 3–5%) and the rate afterwards.
          </li>
          <li>
            <strong>Several cards?</strong> Our <Link href="/blog/debt-snowball-vs-avalanche">snowball vs avalanche guide</Link> explains which to
            pay first.
          </li>
        </ul>
      ),
    },
  ],
  faqs: [
    { q: "How is credit card interest calculated?", a: "Usually by applying a daily rate (APR ÷ 365) to your average daily balance for the billing cycle, then multiplying by the number of days in the cycle." },
    { q: "How much interest will I pay on $1,000 a month?", a: "At 22% APR, roughly $18 a month on a steady $1,000 balance (1,000 × 0.22 ÷ 365 × 30)." },
    { q: "Do I pay interest if I pay the full balance?", a: "Not on purchases, as long as you pay the full statement balance by the due date and didn't carry a balance the month before. Cash advances usually charge interest immediately." },
    { q: "What's the difference between APR and interest rate on a card?", a: "On credit cards they're effectively the same number — the yearly rate. The interest you actually pay depends on how it's applied daily." },
  ],
};

export default content;
