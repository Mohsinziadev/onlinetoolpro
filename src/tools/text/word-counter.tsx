import { ToolPage } from "@/components/tool/tool-page";
import { WordCounter } from "@/components/text/word-counter";

export default function Page() {
  return (
    <ToolPage
      slug="text/word-counter"
      wide
      sections={[
        {
          id: "how-counted",
          title: "How words are counted",
          body: (
            <p>
              A word is any run of letters or numbers. Hyphenated words and contractions like <em>well-known</em> and{" "}
              <em>don&apos;t</em> count as one word. Reading time assumes about 238 words per minute, and speaking time about
              150 — typical averages for adults.
            </p>
          ),
        },
      ]}
      faqs={[
        { q: "Is my text saved or uploaded?", a: "No. Everything is counted on your device. Nothing is sent to us or stored." },
        { q: "Does it count spaces as characters?", a: "It shows both: characters with spaces and characters without spaces." },
        { q: "Is there a word limit?", a: "No practical limit — you can paste whole essays or reports." },
      ]}
    >
      <WordCounter />
    </ToolPage>
  );
}
