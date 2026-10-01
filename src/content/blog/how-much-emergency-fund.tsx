import Link from "next/link";
import { Callout, DataTable, Steps, ToolCta } from "@/components/blog/content";
import type { PostContent } from "@/lib/blog/types";

const content: PostContent = {
  quickAnswer: (
    <p>
      The usual guideline is <strong>three to six months of essential expenses</strong> — not your full income. If your essentials are $2,500 a
      month, that&apos;s $7,500 to $15,000. Aim for the higher end if your income is irregular, you&apos;re the only earner, or you have
      dependants.
    </p>
  ),
  intro: (
    <>
      <p>
        An emergency fund is money that exists so that a broken boiler, a vet bill or a gap between jobs doesn&apos;t become credit card debt. It
        isn&apos;t an investment, and it isn&apos;t a holiday fund. Its only job is to be there, in full, the day something goes wrong.
      </p>
      <p>Getting the size right means working out what you actually need to keep life running — which is usually less than what you earn.</p>
    </>
  ),
  sections: [
    {
      id: "essentials",
      title: "Start with essential expenses",
      body: (
        <>
          <p>In a real emergency you&apos;d cut back fast. So count only what you can&apos;t easily stop paying:</p>
          <ul>
            <li>Rent or mortgage, council tax or property tax</li>
            <li>Utilities, phone and internet</li>
            <li>Groceries (not takeaways)</li>
            <li>Insurance, transport to work, childcare</li>
            <li>Minimum payments on any debts</li>
          </ul>
          <p>Leave out eating out, subscriptions you&apos;d cancel, holidays and savings contributions.</p>
        </>
      ),
    },
    {
      id: "how-many-months",
      title: "Three months or six?",
      body: (
        <DataTable
          caption="Choosing the size of your emergency fund"
          head={["Your situation", "Aim for"]}
          rows={[
            ["Stable salaried job, two incomes in the household", "3 months"],
            ["One income, or a mortgage and children", "4–6 months"],
            ["Self-employed, commission or seasonal income", "6+ months"],
            ["Job in an industry with long hiring times", "6+ months"],
            ["Older car, older home, or health costs likely", "Lean towards the top of your range"],
          ]}
        />
      ),
    },
    {
      id: "build-it",
      title: "How to build it without stalling",
      body: (
        <>
          <Steps
            items={[
              <>Start with a <strong>starter fund</strong> of $500–$1,000. That alone covers many common surprises.</>,
              <>If you have expensive debt, clear it next while keeping the starter fund in place.</>,
              <>Then build up to your full target with an automatic transfer on payday.</>,
              <>Top it back up after you use it — that&apos;s what it&apos;s for.</>,
            ]}
          />
          <p>
            Saving $15,000 at $400 a month takes about three years. Want it sooner? The savings goal calculator works out the monthly amount for any
            deadline.
          </p>
          <ToolCta tool="finance/savings-goal-calculator">Enter your target and date — see exactly what to save each month, with interest included.</ToolCta>
        </>
      ),
    },
    {
      id: "where-to-keep",
      title: "Where to keep it",
      body: (
        <>
          <p>It needs to be safe and available within a day or two, so:</p>
          <ul>
            <li>
              <strong>Yes:</strong> an easy-access or high-yield savings account, ideally separate from your everyday account so it doesn&apos;t get
              spent by accident.
            </li>
            <li>
              <strong>Probably not:</strong> stocks or funds — they can be down 20% exactly when you need the money.
            </li>
            <li>
              <strong>No:</strong> a fixed-term account you can&apos;t get into without penalties, or a credit card you plan to “use if needed”.
            </li>
          </ul>
          <Callout type="tip">
            A good savings rate won&apos;t make you rich, but it helps the fund keep pace with prices. See{" "}
            <Link href="/blog/how-inflation-affects-savings">how inflation affects savings</Link>.
          </Callout>
        </>
      ),
    },
    {
      id: "what-counts",
      title: "What counts as an emergency?",
      body: (
        <p>
          Something urgent, necessary and unexpected: losing your job, a medical bill, an essential car or home repair. A sale, a holiday or a new
          phone because the old one is slow aren&apos;t emergencies — give those their own savings goals so they don&apos;t raid this one.
        </p>
      ),
    },
  ],
  faqs: [
    { q: "How much should be in an emergency fund?", a: "Three to six months of essential expenses. With essentials of $2,500 a month, that's $7,500–$15,000." },
    { q: "Should I save an emergency fund or pay off debt first?", a: "Many people do both in stages: a small starter fund of $500–$1,000, then clear high-interest debt, then build the full fund." },
    { q: "Is $10,000 a good emergency fund?", a: "It depends on your costs. If your essentials are around $2,000–$3,000 a month, $10,000 covers about three to five months, which is solid for most people." },
    { q: "Should my emergency fund be invested?", a: "Generally no. It should be in cash savings you can reach quickly, so it isn't down in value when you need it." },
  ],
};

export default content;
