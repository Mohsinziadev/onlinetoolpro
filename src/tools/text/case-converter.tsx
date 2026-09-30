import { ToolPage } from "@/components/tool/tool-page";
import { CaseConverter } from "@/components/text/case-converter";

export default function Page() {
  return (
    <ToolPage
      slug="text/case-converter"
      sections={[
        {
          id: "styles",
          title: "Which style should I use?",
          body: (
            <ul>
              <li><strong>Sentence case</strong> — normal writing. Only the first letter of each sentence is capital.</li>
              <li><strong>Title Case</strong> — headlines and titles. Small words like &ldquo;and&rdquo; and &ldquo;of&rdquo; stay lowercase.</li>
              <li><strong>Capitalized Case</strong> — every word starts with a capital letter.</li>
              <li><strong>UPPERCASE</strong> — for short labels and emphasis.</li>
            </ul>
          ),
        },
      ]}
      faqs={[
        { q: "Is my text uploaded anywhere?", a: "No. The conversion happens instantly on your device." },
        { q: "Can I undo a change?", a: "Press Ctrl+Z (or ⌘Z on a Mac) in the text box, or pick another style." },
      ]}
    >
      <CaseConverter />
    </ToolPage>
  );
}
