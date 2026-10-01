import { ToolPage } from "@/components/tool/tool-page";
import { ToolMount } from "@/tools/mounts";

export default function Page() {
  return (
    <ToolPage
      slug="youtube/hashtag-generator"
      wide
      sections={[
        {
          id: "rules",
          title: "YouTube's hashtag rules in plain English",
          body: (
            <ul>
              <li>
                <strong>No spaces.</strong> “#easy pasta” becomes just “#easy”. Join words together: #EasyPasta.
              </li>
              <li>
                <strong>No more than 15.</strong> If a video has more than 15 hashtags, YouTube ignores all of them.
              </li>
              <li>
                <strong>The first three can show above the title</strong> when they&apos;re in the description and the title
                itself has none.
              </li>
              <li>
                <strong>Keep them relevant.</strong> YouTube&apos;s policies don&apos;t allow misleading or unrelated hashtags,
                and it may remove them.
              </li>
            </ul>
          ),
        },
        {
          id: "where",
          title: "Where to put hashtags",
          body: (
            <p>
              Most creators add them at the end of the description. You can also put one or two in the title — but then
              YouTube shows those instead of the ones from your description.
            </p>
          ),
        },
      ]}
      faqs={[
        { q: "How many hashtags should I use?", a: "There's no magic number. Three to five relevant hashtags is common. Never go above 15, or YouTube ignores them all." },
        { q: "Do hashtags help videos get more views?", a: "They can help people discover related videos through hashtag pages, but the title, thumbnail and the video itself matter far more." },
        { q: "Are hashtags the same as tags?", a: "No. Hashtags are visible and clickable. Tags are hidden keywords added in YouTube Studio and play only a small role." },
        { q: "Should I use capital letters?", a: "YouTube treats #EasyPasta and #easypasta the same. Capitals just make longer hashtags easier to read." },
      ]}
    >
      <ToolMount id="youtube/hashtag-generator" />
    </ToolPage>
  );
}
