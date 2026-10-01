import Link from "next/link";
import { Callout, DataTable, ToolCta } from "@/components/blog/content";
import type { PostContent } from "@/lib/blog/types";

const content: PostContent = {
  quickAnswer: (
    <p>
      <strong>$20 an hour is $41,600 a year</strong> if you work 40 hours a week for all 52 weeks (paid holidays included). That&apos;s about{" "}
      <strong>$3,467 a month</strong> or <strong>$800 a week</strong>, before tax. The quick shortcut: double the hourly rate and add three zeros —
      $20 becomes roughly $40,000.
    </p>
  ),
  intro: (
    <>
      <p>
        Job ads love to mix units. One posting says $22 an hour, another says $46,000 a year, and a third quotes a monthly figure because it
        sounds bigger. To compare them you need everything in the same unit, and the conversion is easy once you know the one number most
        people use: <strong>2,080 hours</strong>.
      </p>
      <p>That&apos;s 40 hours × 52 weeks. Below is the full table, then the cases where 2,080 gives you the wrong answer.</p>
    </>
  ),
  sections: [
    {
      id: "table",
      title: "Hourly to yearly salary table",
      body: (
        <>
          <DataTable
            caption="Hourly pay converted at 40 hours a week, 52 weeks a year (before tax)"
            head={["Hourly", "Weekly", "Monthly", "Yearly"]}
            rows={[
              ["$15", "$600", "$2,600", "$31,200"],
              ["$17", "$680", "$2,947", "$35,360"],
              ["$18", "$720", "$3,120", "$37,440"],
              ["$20", "$800", "$3,467", "$41,600"],
              ["$22", "$880", "$3,813", "$45,760"],
              ["$25", "$1,000", "$4,333", "$52,000"],
              ["$30", "$1,200", "$5,200", "$62,400"],
              ["$35", "$1,400", "$6,067", "$72,800"],
              ["$40", "$1,600", "$6,933", "$83,200"],
              ["$45", "$1,800", "$7,800", "$93,600"],
              ["$50", "$2,000", "$8,667", "$104,000"],
            ]}
          />
          <p>
            The same math works in pounds, euros or Canadian and Australian dollars — the currency doesn&apos;t change the hours. For a rate that
            isn&apos;t in the table, the <Link href="/finance-calculators/salary-converter">hourly to salary calculator</Link> converts any amount in
            both directions.
          </p>
        </>
      ),
    },
    {
      id: "monthly-trap",
      title: "The monthly figure people get wrong",
      body: (
        <>
          <p>
            It&apos;s tempting to say a month is four weeks, so $800 a week is $3,200 a month. It isn&apos;t. A year has 52 weeks, which works out
            to about <strong>4.33 weeks per month</strong>. Using 4 quietly knocks about 8% off your monthly income — the difference between
            $3,200 and $3,467 at $20 an hour.
          </p>
          <p>
            It matters most when you&apos;re budgeting rent or checking whether a monthly salary offer matches an hourly one. Divide the yearly
            figure by 12 instead.
          </p>
        </>
      ),
    },
    {
      id: "when-2080-is-wrong",
      title: "When 2,080 hours is the wrong number",
      body: (
        <>
          <ul>
            <li>
              <strong>Your contract isn&apos;t 40 hours.</strong> Many UK jobs are 37.5 hours, and the standard full-time week in Australia is
              38. At 37.5 hours, £15 an hour is £29,250 a year, not £31,200.
            </li>
            <li>
              <strong>You don&apos;t get paid holidays.</strong> Contractors, gig workers and many hourly roles only earn for the weeks they
              actually work. Two unpaid weeks off means multiplying by 50, not 52.
            </li>
            <li>
              <strong>Your hours vary.</strong> If some weeks are 30 hours and some 45, use your average over a couple of months rather than the
              hours on paper.
            </li>
            <li>
              <strong>Overtime.</strong> Time-and-a-half hours add up fast and aren&apos;t in a basic conversion. Add them separately.
            </li>
          </ul>
          <ToolCta tool="finance/salary-converter">Set your real hours and paid weeks — see hourly, weekly, monthly and yearly pay at once.</ToolCta>
        </>
      ),
    },
    {
      id: "salaried-vs-hourly",
      title: "Comparing a salaried job with an hourly one",
      body: (
        <>
          <p>
            A $48,000 salary and $24 an hour look almost identical — $48,000 ÷ 2,080 is $23.08. But the numbers on paper only tell half the
            story:
          </p>
          <ul>
            <li>Salaried roles in many countries don&apos;t pay overtime, so a “40-hour” job that regularly runs to 48 hours is really paying less per hour.</li>
            <li>Hourly roles may not include paid holidays or sick days, which are worth several percent of the salary.</li>
            <li>Benefits — health insurance, pension or 401(k) matching — can be worth thousands a year and rarely show up in the headline number.</li>
          </ul>
          <Callout type="tip">
            To compare fairly, divide each salary by the hours you&apos;d <em>actually</em> work, including the unpaid extra ones. That&apos;s your
            real hourly rate.
          </Callout>
        </>
      ),
    },
    {
      id: "after-tax",
      title: "What about after tax?",
      body: (
        <p>
          Everything above is gross pay. Take-home pay depends on where you live — federal and state tax in the US, PAYE and National Insurance in
          the UK, and so on. As a very rough guide, many people on $40,000–$50,000 keep somewhere around 75–85% after income tax and payroll
          deductions, but your own figure can differ a lot.
        </p>
      ),
    },
  ],
  faqs: [
    { q: "How much is $20 an hour a year?", a: "$41,600 a year at 40 hours a week for 52 weeks, before tax. That's about $3,467 a month." },
    { q: "How much is $25 an hour a year?", a: "$52,000 a year at 40 hours a week, or about $4,333 a month before tax." },
    { q: "How many working hours are in a year?", a: "2,080 for a standard 40-hour week (40 × 52). At 37.5 hours a week it's 1,950." },
    { q: "How do I convert a yearly salary to hourly?", a: "Divide the salary by the hours you work in a year. $50,000 ÷ 2,080 = $24.04 an hour." },
    { q: "What's the quick way to estimate?", a: "Double the hourly rate and add three zeros. $18 an hour is roughly $36,000 a year (exactly $37,440)." },
  ],
};

export default content;
