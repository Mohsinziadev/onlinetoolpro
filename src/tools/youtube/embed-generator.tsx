import { ToolPage } from "@/components/tool/tool-page";
import { ToolMount } from "@/tools/mounts";

export default function Page() {
  return (
    <ToolPage
      slug="youtube/embed-generator"
      wide
      sections={[
        {
          id: "options",
          title: "What the options do",
          body: (
            <ul>
              <li><strong>Privacy mode</strong> uses youtube-nocookie.com, so YouTube doesn&apos;t set tracking cookies until someone presses play.</li>
              <li><strong>Start at</strong> jumps straight to a moment in the video.</li>
              <li><strong>Autoplay</strong> starts the video on page load. Browsers require it to start muted.</li>
              <li><strong>Fits any screen</strong> makes the player resize nicely on phones, tablets and computers.</li>
            </ul>
          ),
        },
        {
          id: "where",
          title: "Where do I paste the code?",
          body: (
            <p>
              Most website builders (WordPress, Squarespace, Wix, Webflow) have an <strong>HTML</strong>, <strong>Code</strong>{" "}
              or <strong>Embed</strong> block. Add one where you want the video and paste the code into it.
            </p>
          ),
        },
      ]}
      faqs={[
        { q: "Is it free to embed YouTube videos?", a: "Yes. YouTube lets anyone embed public videos unless the creator has turned embedding off." },
        { q: "Why doesn't autoplay work with sound?", a: "Browsers block videos that play sound automatically. Autoplay only works when the video starts muted." },
        { q: "Why does the video say it's unavailable?", a: "The creator may have disabled embedding, or the video is private or age-restricted." },
      ]}
    >
      <ToolMount id="youtube/embed-generator" />
    </ToolPage>
  );
}
