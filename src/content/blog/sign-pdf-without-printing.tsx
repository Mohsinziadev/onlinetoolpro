import Link from "next/link";
import { Callout, DataTable, Steps, ToolCta } from "@/components/blog/content";
import type { PostContent } from "@/lib/blog/types";

const content: PostContent = {
  quickAnswer: (
    <p>
      Open the PDF in a signing tool, draw or type your signature, drag it onto the signature line and save a new copy. You can do this free
      in your browser with our <Link href="/pdf-tools/sign">Sign PDF tool</Link>, in Adobe Acrobat Reader (Fill &amp; Sign), in Preview on
      a Mac, or with Markup on an iPhone. No printer or scanner needed.
    </p>
  ),
  intro: (
    <>
      <p>
        Printing a form, signing it with a pen, scanning it back in and emailing a slightly crooked, gray copy is still how a lot of people
        sign documents. It takes ten minutes and needs a printer you may not have. For most everyday paperwork — rental agreements, school
        forms, invoices, offer letters — signing on screen is quicker, looks cleaner and is accepted.
      </p>
      <p>Here&apos;s how to do it on any device, plus the part most guides skip: when a signature like this is enough, and when it isn&apos;t.</p>
    </>
  ),
  sections: [
    {
      id: "in-your-browser",
      title: "Sign a PDF in your browser (any computer or phone)",
      body: (
        <>
          <Steps
            items={[
              <>
                Open <Link href="/pdf-tools/sign">Sign PDF</Link> and drop in your document.
              </>,
              <>
                Choose <strong>Draw it</strong> and sign with your mouse, trackpad, finger or stylus — or choose <strong>Type it</strong> and
                enter your name.
              </>,
              <>Pick the page (the last page is selected for you, since that&apos;s where most signature lines are).</>,
              <>Tap the page where the signature goes, drag it into place and adjust the size.</>,
              <>Download the signed PDF.</>,
            ]}
          />
          <p>
            Everything happens on your device; the contract isn&apos;t uploaded to a server. That matters more than it sounds — the documents
            people sign usually contain addresses, salaries, bank details or ID numbers.
          </p>
          <ToolCta tool="pdf/sign">Draw or type your signature and place it on any page — the PDF never leaves your device.</ToolCta>
          <Callout type="tip" title="Make a drawn signature look natural">
            Sign bigger and slower than feels natural; it&apos;s scaled down when you place it, which smooths out wobbly lines. On a phone,
            turn it sideways for a wider signing area.
          </Callout>
        </>
      ),
    },
    {
      id: "other-ways",
      title: "Other free ways to sign",
      body: (
        <>
          <DataTable
            caption="Free signing options by device"
            head={["Device", "Built-in or free option", "Where to find it"]}
            rows={[
              ["Windows, Mac, Linux", "Any modern browser", <Link key="s" href="/pdf-tools/sign">Sign PDF</Link>],
              ["Windows or Mac", "Adobe Acrobat Reader (free)", "Fill & Sign → Sign"],
              ["Mac", "Preview", "Markup toolbar → Signature"],
              ["iPhone / iPad", "Markup", "Open the PDF in Files or Mail → Markup → + → Signature"],
              ["Android", "Browser, or a PDF app", "Sign PDF works in Chrome on Android"],
            ]}
          />
          <p>
            The built-in options are handy if you already use those apps. A browser tool is useful when you&apos;re on someone else&apos;s
            computer, on Android, or don&apos;t want to install anything.
          </p>
        </>
      ),
    },
    {
      id: "is-it-legal",
      title: "Is a signature like this legally valid?",
      body: (
        <>
          <p>
            For most everyday documents, yes. Laws such as the US ESIGN Act and UETA, the EU&apos;s eIDAS regulation and the UK&apos;s
            electronic signature rules treat an electronic signature as valid when the signer clearly intended to sign. A drawn or typed
            signature placed on a PDF is a <strong>simple electronic signature</strong>.
          </p>
          <p>There are limits, though, and they&apos;re worth knowing before you sign something important:</p>
          <ul>
            <li>
              <strong>Some documents need more.</strong> Wills, some property and court documents, and certain government filings may
              require a wet-ink signature, a witness, or a specific certified signature, depending on the country.
            </li>
            <li>
              <strong>The other party decides what they accept.</strong> A bank or government office may insist on its own signing system.
            </li>
            <li>
              <strong>A simple signature doesn&apos;t prove who signed or that nothing changed.</strong> That&apos;s fine between people who
              trust each other; for high-value contracts, a certificate-based service adds an audit trail.
            </li>
          </ul>
          <Callout type="note">This is general information, not legal advice. When the stakes are high, ask the other party what they accept.</Callout>
        </>
      ),
    },
    {
      id: "image-vs-digital",
      title: "Electronic signature vs digital signature",
      body: (
        <>
          <p>The two terms sound interchangeable but describe different things:</p>
          <DataTable
            caption="Simple electronic signature vs certificate-based digital signature"
            head={["", "Simple electronic signature", "Digital (certificate) signature"]}
            rows={[
              ["What it is", "An image of your signature, or your typed name", "A cryptographic seal tied to a verified identity"],
              ["Shows tampering?", "No", "Yes — any change after signing is flagged"],
              ["Needs an account or certificate?", "No", "Yes"],
              ["Good for", "Forms, letters, invoices, agreements between people", "Regulated contracts, official filings"],
            ]}
          />
          <p>
            Our Sign PDF tool creates a simple electronic signature. If a document asks for a “digital signature” specifically, that usually
            means the certificate kind.
          </p>
        </>
      ),
    },
    {
      id: "before-you-send",
      title: "Before you send the signed PDF",
      body: (
        <>
          <ul>
            <li>
              <strong>Check every place that needs you.</strong> Some forms want initials on every page as well as a full signature at the end.
            </li>
            <li>
              <strong>Fill in the date and other fields first.</strong> If the form has fillable boxes, complete them in your PDF reader (Acrobat Reader, Preview or your browser&apos;s PDF viewer), save, and add your signature last.
            </li>
            <li>
              <strong>Keep a copy.</strong> Save the signed version with a clear name like <code>lease-2026-signed.pdf</code>.
            </li>
            <li>
              <strong>Combine if asked.</strong> If you need to return several signed documents as one file,{" "}
              <Link href="/pdf-tools/merge">merge the PDFs</Link> after signing.
            </li>
            <li>
              <strong>Sending a picture instead?</strong> Some portals only accept images. Turn the signed page into a JPG with{" "}
              <Link href="/pdf-tools/pdf-to-jpg">PDF to JPG</Link>.
            </li>
          </ul>
        </>
      ),
    },
  ],
  faqs: [
    { q: "Can I sign a PDF on my phone?", a: "Yes. On iPhone, use Markup in the Files or Mail app, or open a browser signing tool. On Android, a browser tool like Sign PDF works in Chrome — draw your signature with your finger." },
    { q: "Is it safe to sign PDFs online?", a: "Only if you trust where the file goes. Many sites upload your document to their servers. A tool that works in your browser never sends the PDF anywhere, which is safer for contracts and forms with personal details." },
    { q: "Can someone copy my signature from the PDF?", a: "Yes — like a scanned signature, the image can be copied. That's true of any signature sent as a file. For documents where this matters, use a certificate-based signing service." },
    { q: "Do I need Adobe to sign a PDF?", a: "No. Adobe Acrobat Reader is one free option, but browser tools, Preview on Mac and Markup on iPhone all work without it." },
    { q: "Can I edit a PDF after signing it?", a: "With a simple signature, the PDF can still be edited, which is why it doesn't prove nothing changed. Add your signature last, after all other changes are done." },
  ],
};

export default content;
