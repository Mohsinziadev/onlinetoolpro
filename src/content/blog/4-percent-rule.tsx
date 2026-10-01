import Link from "next/link";
import { Callout, DataTable, ToolCta } from "@/components/blog/content";
import type { PostContent } from "@/lib/blog/types";

const content: PostContent = {
  quickAnswer: (
    <p>
      The <strong>4% rule</strong> says you can withdraw <strong>4% of your retirement savings in the first year</strong>, then raise that amount
      each year with inflation, and your money would historically have lasted about 30 years. $1,000,000 supports $40,000 in year one. Flip it
      around and you need roughly <strong>25 times</strong> the yearly income you want from savings.
    </p>
  ),
  intro: (
    <>
      <p>
        Few rules of thumb are quoted as often as this one, and few are as misunderstood. It isn&apos;t a promise, it isn&apos;t a law, and
        it was never meant to be the last word. It&apos;s a starting estimate — a very useful one, as long as you know where it came from and where
        it breaks down.
      </p>
    </>
  ),
  sections: [
    {
      id: "where-it-came-from",
      title: "Where the 4% rule came from",
      body: (
        <p>
          In 1994 financial planner William Bengen tested withdrawal rates against US stock and bond returns going back to 1926. He found that
          starting at about 4% of a balanced portfolio and increasing the amount with inflation would have lasted at least 30 years in every
          historical period he tested — including the Great Depression and the 1970s. A 1998 paper known as the Trinity study reached similar
          conclusions and made the idea famous.
        </p>
      ),
    },
    {
      id: "how-to-use-it",
      title: "How to use it",
      body: (
        <>
          <p>Work out the yearly income you want from savings (on top of any state pension or Social Security), then multiply by 25.</p>
          <DataTable
            caption="Savings needed at a 4% withdrawal rate"
            head={["Income wanted from savings", "Savings needed (× 25)"]}
            rows={[
              ["$20,000 a year", "$500,000"],
              ["$30,000 a year", "$750,000"],
              ["$40,000 a year", "$1,000,000"],
              ["$60,000 a year", "$1,500,000"],
            ]}
          />
          <ToolCta tool="finance/retirement-calculator">Project your savings in today&apos;s money and see the income they could support at any withdrawal rate.</ToolCta>
        </>
      ),
    },
    {
      id: "the-debate",
      title: "Is 4% still the right number?",
      body: (
        <>
          <p>It depends who you ask — and the experts genuinely disagree:</p>
          <ul>
            <li>
              Bengen himself has since revised his number <strong>up, to about 4.7%</strong>, after testing more diversified portfolios.
            </li>
            <li>
              Morningstar&apos;s research put a safe starting rate for new retirees <strong>lower, at around 3.7%</strong>, based on expected returns
              rather than history.
            </li>
            <li>
              Researchers including Wade Pfau have pointed out that in most countries other than the US, historical safe withdrawal rates fell
              <strong> below 4%</strong> — the US had an unusually good century.
            </li>
          </ul>
          <p>
            On $1,000,000 that&apos;s the difference between $37,000 and $47,000 a year. Treat 3.5–4.5% as a sensible range rather than a single
            magic number.
          </p>
        </>
      ),
    },
    {
      id: "limits",
      title: "What the 4% rule doesn't account for",
      body: (
        <>
          <ul>
            <li>
              <strong>Retiring early.</strong> It was tested over 30 years. If you retire at 50, your money may need to last 40+ years — many people
              use 3–3.5% instead.
            </li>
            <li>
              <strong>Taxes and fees.</strong> The original research ignored both. A 1% yearly fee takes a big bite out of a 4% withdrawal.
            </li>
            <li>
              <strong>Real spending.</strong> Most retirees don&apos;t raise spending in a straight line — it often dips in the middle years and
              rises again with care costs later.
            </li>
            <li>
              <strong>Bad timing.</strong> A big market fall in the first few years of retirement (sequence risk) does far more damage than one
              later on.
            </li>
          </ul>
          <Callout type="tip" title="A flexible approach often works better">
            Many planners suggest being willing to cut spending a little after a bad year. Even small adjustments make savings last much longer than a
            rigid 4% rule assumes.
          </Callout>
        </>
      ),
    },
    {
      id: "getting-there",
      title: "Getting from here to your number",
      body: (
        <p>
          If the target looks far away, two levers matter most: how much you save each month and how many years it has to grow. The{" "}
          <Link href="/finance-calculators/compound-interest-calculator">compound interest calculator</Link> shows the effect of starting earlier,
          and the <Link href="/finance-calculators/inflation-calculator">inflation calculator</Link> helps keep future figures in today&apos;s money.
        </p>
      ),
    },
  ],
  faqs: [
    { q: "What is the 4% rule in simple terms?", a: "Withdraw 4% of your savings in your first year of retirement, then increase that amount with inflation each year. Historically, that lasted about 30 years." },
    { q: "How much do I need to retire using the 4% rule?", a: "About 25 times the yearly income you want from savings. $40,000 a year needs roughly $1,000,000." },
    { q: "Is the 4% rule safe?", a: "It's a reasonable starting point, not a guarantee. It's based on US history over 30 years and ignores fees and taxes. Many experts suggest 3.5–4.5% depending on your situation." },
    { q: "Does the 4% rule work in the UK, Canada or Australia?", a: "The idea works anywhere, but research suggests safe rates outside the US have historically been somewhat lower than 4%." },
  ],
};

export default content;
