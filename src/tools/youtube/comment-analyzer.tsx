import { ToolPage } from "@/components/tool/tool-page";
import { ToolMount } from "@/tools/mounts";

const SLUG = "youtube/comment-analyzer";

export default function Page() {
  return (
    <ToolPage
      slug={SLUG}
      sections={[
        { id: "what-it-finds", title: "What the comment analyzer finds", body: <p>It groups repeated questions and requests, surfaces common two- and three-word topics, counts frequently mentioned terms and gives an estimated sentiment split — so you can see what your audience is discussing without reading every comment.</p> },
        { id: "how-it-works", title: "How it works", body: <p>Public top-level comments are fetched from the YouTube Data API (or pasted by you). Analysis runs in your browser: questions are detected by punctuation and question words, similar ones are grouped by word overlap, requests are matched by patterns like “can you make…”, and sentiment uses a small word lexicon with negation handling.</p> },
        { id: "limitations", title: "Limitations", body: <ul><li>Estimated sentiment misses sarcasm, slang and context.</li><li>Only up to 300 top-level comments are analyzed; replies are excluded.</li><li>English-language patterns only.</li></ul> },
      ]}
      faqs={[
        { q: "Are pasted comments stored?", a: "No. Pasted comments are analyzed in your browser and never uploaded." },
        { q: "Is the sentiment result accurate?", a: "It's an estimate from a word lexicon. Use it as a rough guide alongside the grouped questions and examples, not as a verdict." },
      ]}
    >
      <ToolMount id="youtube/comment-analyzer" />
    </ToolPage>
  );
}
