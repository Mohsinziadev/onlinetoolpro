import Link from "next/link";
import { Callout, DataTable, Steps, ToolCta } from "@/components/blog/content";
import type { PostContent } from "@/lib/blog/types";

const content: PostContent = {
  quickAnswer: (
    <>
      <p>
        <strong>To add 20% VAT:</strong> multiply the price by 1.2. £100 becomes £120.
      </p>
      <p>
        <strong>To remove 20% VAT:</strong> divide by 1.2 — don&apos;t take off 20%. £120 including VAT is £100 before VAT. Taking 20% off £120 gives
        £96, which is the most common VAT mistake there is.
      </p>
    </>
  ),
  intro: (
    <>
      <p>
        Adding VAT is easy. Taking it back out of a total is where people slip, because the VAT was calculated on the <em>smaller</em> pre-VAT
        price, not on the total you&apos;re looking at. Once that clicks, every VAT, GST and sales tax calculation works the same way.
      </p>
    </>
  ),
  sections: [
    {
      id: "adding",
      title: "Adding VAT to a price",
      body: (
        <>
          <p>Multiply by 1 plus the rate as a decimal:</p>
          <DataTable
            caption="Adding VAT"
            head={["Rate", "Multiply by", "£100 becomes"]}
            rows={[
              ["20% (UK standard)", "1.20", "£120.00"],
              ["5% (UK reduced)", "1.05", "£105.00"],
              ["0% (zero-rated)", "1.00", "£100.00"],
            ]}
          />
        </>
      ),
    },
    {
      id: "removing",
      title: "Removing VAT from a total",
      body: (
        <>
          <Steps
            items={[
              <>Take the price including VAT: £249.99.</>,
              <>Divide by 1.2: £249.99 ÷ 1.2 = £208.33. That&apos;s the price before VAT.</>,
              <>The VAT is the difference: £249.99 − £208.33 = £41.66.</>,
            ]}
          />
          <p>
            A shortcut for the VAT part alone: at 20%, VAT is <strong>one sixth</strong> of a VAT-inclusive price (£249.99 ÷ 6 = £41.66). At 5%, it&apos;s
            one twenty-first.
          </p>
          <ToolCta tool="finance/vat-calculator">Add or remove VAT, GST or sales tax — UK, Canadian, Australian and NZ rates built in.</ToolCta>
        </>
      ),
    },
    {
      id: "uk-rates",
      title: "UK VAT rates",
      body: (
        <>
          <DataTable
            caption="UK VAT rates and examples"
            head={["Rate", "Applies to (examples)"]}
            rows={[
              ["20% standard", "Most goods and services"],
              ["5% reduced", "Domestic energy, children's car seats, some mobility aids"],
              ["0% zero rate", "Most food, books and newspapers, children's clothes, passenger transport"],
              ["Exempt", "Things outside the VAT system, such as many financial and insurance services"],
            ]}
          />
          <Callout type="note" title="Zero-rated vs exempt">
            Both mean no VAT on the price, but they&apos;re different for businesses: zero-rated sales still count towards the VAT threshold and let you
            reclaim VAT on costs, while exempt sales generally don&apos;t.
          </Callout>
          <p>
            Businesses must register for VAT once their taxable turnover passes <strong>£90,000</strong> in any rolling 12 months — not per tax year.
          </p>
        </>
      ),
    },
    {
      id: "other-countries",
      title: "GST, HST and sales tax elsewhere",
      body: (
        <>
          <p>The method is identical; only the rate changes.</p>
          <ul>
            <li>
              <strong>Australia:</strong> GST is 10%. Remove it by dividing by 1.1, or take one eleventh of the total.
            </li>
            <li>
              <strong>New Zealand:</strong> GST is 15% — divide by 1.15.
            </li>
            <li>
              <strong>Canada:</strong> 5% GST everywhere, combined into a single HST of 13% in Ontario, 14% in Nova Scotia and 15% in New Brunswick,
              Newfoundland and Labrador and PEI. BC, Manitoba, Saskatchewan and Quebec add their own provincial tax on top of GST.
            </li>
            <li>
              <strong>United States:</strong> no VAT — instead, state and local sales taxes that vary by address and are usually added at the till,
              not included in shelf prices.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "invoices",
      title: "Invoices and pricing tips for small businesses",
      body: (
        <ul>
          <li>When quoting business customers, state prices “ex VAT” or “+ VAT” so nobody is surprised.</li>
          <li>Consumer prices in the UK must normally be shown including VAT.</li>
          <li>Round once, at the end — rounding each line of a long invoice separately can leave totals a penny or two out.</li>
          <li>
            Working out your selling price? Set the margin on the price <em>before</em> VAT — see{" "}
            <Link href="/blog/margin-vs-markup">margin vs markup</Link>.
          </li>
        </ul>
      ),
    },
  ],
  faqs: [
    { q: "How do I remove VAT from a price?", a: "Divide the VAT-inclusive price by 1.2 (for 20% VAT). £120 ÷ 1.2 = £100. Don't subtract 20% — that gives the wrong answer." },
    { q: "What is 20% VAT of £100?", a: "£20, making a total of £120." },
    { q: "How much is VAT in the UK?", a: "The standard rate is 20%. There's a 5% reduced rate and a 0% zero rate for certain goods and services." },
    { q: "How do I calculate GST in Australia?", a: "Add GST by multiplying by 1.1. Remove it by dividing by 1.1 — the GST part is one eleventh of a GST-inclusive price." },
    { q: "When do I need to register for VAT?", a: "In the UK, when your taxable turnover goes over £90,000 in any 12-month period. You can register voluntarily below that." },
  ],
};

export default content;
