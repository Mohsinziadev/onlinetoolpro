import Link from "next/link";
import { Callout, DataTable, Steps, ToolCta } from "@/components/blog/content";
import type { PostContent } from "@/lib/blog/types";

const content: PostContent = {
  quickAnswer: (
    <p>
      <strong>Pro-rata salary = full-time salary × your hours ÷ full-time hours.</strong> A £30,000 job at 37.5 hours a week, worked for 22.5
      hours, pays £30,000 × 22.5 ÷ 37.5 = <strong>£18,000 a year</strong>. Your holiday is pro-rated the same way: 5.6 weeks of whatever your
      working week is.
    </p>
  ),
  intro: (
    <>
      <p>
        Part-time job adverts in the UK often show two numbers: “£30,000 pro rata” and a line further down saying the role is three days a
        week. The £30,000 is what the job would pay <em>if</em> you worked full time. What lands in your account is a share of it, in proportion
        to your hours — that&apos;s all “pro rata” means.
      </p>
    </>
  ),
  sections: [
    {
      id: "how-to-work-it-out",
      title: "How to work it out",
      body: (
        <>
          <Steps
            items={[
              <>Find the full-time hours for the role. It&apos;s usually in the advert or contract — 35, 37.5 and 40 are the common ones.</>,
              <>Divide your weekly hours by the full-time hours. 22.5 ÷ 37.5 = 0.6, so you work 60% of full time.</>,
              <>Multiply the full-time salary by that figure. £30,000 × 0.6 = £18,000.</>,
            ]}
          />
          <p>
            Working in days instead? Use days: three days out of five is also 0.6. Just don&apos;t mix them — if your days are longer or shorter
            than a full-time day, go by hours.
          </p>
          <p>
            Paid by the hour instead? <Link href="/blog/how-much-is-20-an-hour-a-year">Our hourly to salary table</Link> shows what common hourly
            rates add up to over a year.
          </p>
          <ToolCta tool="finance/salary-converter">The salary calculator has a pro-rata section: enter the full-time salary and both sets of hours.</ToolCta>
        </>
      ),
    },
    {
      id: "examples",
      title: "Pro-rata salary examples",
      body: (
        <DataTable
          caption="Pro-rata pay for a £30,000 full-time salary on a 37.5-hour week"
          head={["Your hours a week", "Share of full time", "Pro-rata salary", "Per month"]}
          rows={[
            ["30 (4 days)", "80%", "£24,000", "£2,000"],
            ["22.5 (3 days)", "60%", "£18,000", "£1,500"],
            ["18.75 (half time)", "50%", "£15,000", "£1,250"],
            ["15 (2 days)", "40%", "£12,000", "£1,000"],
          ]}
        />
      ),
    },
    {
      id: "holiday",
      title: "Pro-rata holiday entitlement",
      body: (
        <>
          <p>
            In the UK almost everyone is entitled to <strong>5.6 weeks of paid holiday</strong> a year. Part-time workers get the same 5.6 weeks —
            but a week for them is shorter. So the formula is simply 5.6 × the days (or hours) you work in a week:
          </p>
          <DataTable
            caption="Statutory holiday for part-time workers"
            head={["Days worked a week", "Holiday a year"]}
            rows={[
              ["1", "5.6 days"],
              ["2", "11.2 days"],
              ["3", "16.8 days"],
              ["4", "22.4 days"],
              ["5", "28 days (the maximum)"],
            ]}
          />
          <Callout type="note" title="What about bank holidays?">
            The 5.6 weeks can include bank holidays — employers don&apos;t have to give them on top. Part-time staff who don&apos;t normally work
            on Mondays still get the pro-rata entitlement; it shouldn&apos;t be reduced just because many bank holidays fall on their day off.
          </Callout>
          <p>
            Employers who give more than the legal minimum — say 25 days plus bank holidays — must pro-rate the extra for part-timers too.
          </p>
        </>
      ),
    },
    {
      id: "check-these",
      title: "Things to check in a part-time offer",
      body: (
        <ul>
          <li>
            <strong>Which full-time hours they used.</strong> £30,000 pro rata on a 35-hour week pays more per hour than the same figure on a
            40-hour week.
          </li>
          <li>
            <strong>Whether overtime is paid at the overtime rate.</strong> Part-timers often only get enhanced rates once they go past full-time
            hours, not their own contracted hours.
          </li>
          <li>
            <strong>Pension and benefits.</strong> Workplace pension contributions are a percentage of what you actually earn, so they&apos;re
            pro-rated automatically.
          </li>
          <li>
            <strong>Tax.</strong> A lower salary may fall under the personal allowance or a lower band, so your take-home pay drops by less than
            your hours do. Check the GOV.UK estimate for your figure.
          </li>
        </ul>
      ),
    },
  ],
  faqs: [
    { q: "What does pro rata mean in a salary?", a: "It means the advertised salary is the full-time amount. You'll be paid a share of it in proportion to the hours you work." },
    { q: "How do I calculate pro rata salary for 3 days a week?", a: "Multiply the full-time salary by 3 and divide by 5 (if full time is five days of the same length). £30,000 becomes £18,000." },
    { q: "How many days holiday do I get working 3 days a week?", a: "16.8 days a year under UK law: 5.6 weeks × 3 days. Many employers round up to 17." },
    { q: "Is my hourly rate lower on a pro rata salary?", a: "No. Pro rata pay keeps the same hourly rate as the full-time job — you're just paid for fewer hours." },
  ],
};

export default content;
