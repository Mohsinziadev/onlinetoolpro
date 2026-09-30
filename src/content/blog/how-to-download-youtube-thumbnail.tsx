import Link from "next/link";
import {
  Callout,
  DataTable,
  Steps,
  ThumbnailSizesVisual,
  ThumbnailUrlDiagram,
  ToolCta,
} from "@/components/blog/content";
import type { PostContent } from "@/lib/blog/types";

const content: PostContent = {
  quickAnswer: (
    <>
      <p>
        Copy the video&apos;s link, paste it into a{" "}
        <Link href="/youtube-tools/thumbnail-downloader">
          YouTube thumbnail downloader
        </Link>
        , and save the largest size offered. The biggest version YouTube can
        provide is <strong>1280 × 720 pixels</strong> — but only if the creator
        uploaded an image that large. If not, the next best is 640 × 480.
      </p>
      <p>
        You can also do it by hand: open{" "}
        <code>https://i.ytimg.com/vi/VIDEO_ID/maxresdefault.jpg</code>,
        replacing <code>VIDEO_ID</code> with the 11-character ID from the
        video&apos;s link.
      </p>
    </>
  ),
  intro: (
    <>
      <p>
        Maybe you lost the original file for your own video&apos;s thumbnail.
        Maybe you want to put a video&apos;s cover image in a blog post, or
        study how the channels you admire design theirs. Whatever the reason,
        YouTube doesn&apos;t give you a download button — but every thumbnail is
        a normal image file sitting at a public address.
      </p>
      <p>
        This guide shows the quickest way to save one, how the addresses work if
        you&apos;d rather do it yourself, which size to pick, and what to do
        when something goes wrong.
      </p>
    </>
  ),
  sections: [
    {
      id: "what-is-a-thumbnail",
      title: "What Is a YouTube Thumbnail?",
      body: (
        <>
          <p>
            A thumbnail is the still image that represents a video before anyone
            presses play. It appears on the home page, in search results, next
            to other videos and when a link is shared. Along with the title,
            it&apos;s the main thing people use to decide whether to watch.
          </p>
          <p>
            Creators either pick one of three frames YouTube suggests from the
            video, or upload their own custom image. YouTube asks for custom
            thumbnails to be <strong>1280 × 720 pixels</strong> (at least 640
            pixels wide), in a 16:9 shape, as a JPG, PNG or GIF under 2 MB.
            Custom thumbnails are only available to verified accounts.
          </p>
        </>
      ),
    },
    {
      id: "what-is-a-downloader",
      title: "What Is a YouTube Thumbnail Downloader?",
      body: (
        <>
          <p>
            A thumbnail downloader is a simple tool that reads a video link,
            works out the video&apos;s ID, and fetches the thumbnail images
            YouTube has stored for it. A good one shows you every size that
            exists and lets you save each with one click.
          </p>
          <p>
            It doesn&apos;t create anything new or improve the image. You get
            exactly the files YouTube serves — which is why the maximum quality
            depends on what the creator uploaded, not on the tool.
          </p>
        </>
      ),
    },
    {
      id: "how-to-download",
      title: "How to Download a YouTube Thumbnail",
      body: (
        <>
          <p>
            This works the same on a computer, phone or tablet, and for normal
            videos, Shorts and live streams.
          </p>
          <Steps
            items={[
              <>
                <strong>Copy the video&apos;s link.</strong> On a computer, copy
                it from the address bar. In the YouTube app, tap <em>Share</em>{" "}
                → <em>Copy link</em>. Any format works:{" "}
                <code>youtube.com/watch?v=…</code>, <code>youtu.be/…</code> or{" "}
                <code>youtube.com/shorts/…</code>.
              </>,
              <>
                <strong>Paste it into the downloader</strong> and press{" "}
                <em>Get thumbnails</em>.
              </>,
              <>
                <strong>Pick a size.</strong> The largest available one is shown
                first. Sizes the video doesn&apos;t have are marked as
                unavailable.
              </>,
              <>
                <strong>Press Download.</strong> The image saves as a JPG to
                your usual downloads folder.
              </>,
            ]}
          />
          <ToolCta tool="youtube/thumbnail-downloader" label="Get a thumbnail">
            Paste any YouTube link to see every thumbnail size the video has,
            and download the one you need. Free, no sign-up.
          </ToolCta>
        </>
      ),
    },
    {
      id: "thumbnail-urls",
      title: "How YouTube Thumbnail URLs Work",
      body: (
        <>
          <p>
            You don&apos;t need a tool at all if you&apos;re comfortable editing
            a web address. Every thumbnail lives on YouTube&apos;s image server
            at a predictable address made of the video ID and a size name:
          </p>
          <ThumbnailUrlDiagram />
          <p>
            The video ID is the 11 characters after <code>v=</code> in a normal
            link, or after <code>youtu.be/</code> in a short one. In{" "}
            <code>https://www.youtube.com/watch?v=aqz-KE-bpKQ&amp;t=42s</code>,
            the ID is <code>aqz-KE-bpKQ</code> — everything after the{" "}
            <code>&amp;</code> is extra information you can ignore. If a link
            looks messy, a{" "}
            <Link href="/youtube-tools/video-id-finder">video ID finder</Link>{" "}
            will pull the ID out for you.
          </p>
          <p>To download by hand:</p>
          <ol>
            <li>
              Put the ID into this address:{" "}
              <code>https://i.ytimg.com/vi/VIDEO_ID/maxresdefault.jpg</code>
            </li>
            <li>
              Open it in your browser. If you see the image, right-click (or
              long-press on a phone) and save it.
            </li>
            <li>
              If you get a small grey placeholder instead, that size
              doesn&apos;t exist for this video. Replace{" "}
              <code>maxresdefault</code> with <code>sddefault</code>, then{" "}
              <code>hqdefault</code>.
            </li>
          </ol>
          <p>
            Two other details are worth knowing. The older address{" "}
            <code>img.youtube.com/vi/…</code> serves the same images. And
            YouTube also keeps WebP copies — a smaller, modern image format — at{" "}
            <code>https://i.ytimg.com/vi_webp/VIDEO_ID/maxresdefault.webp</code>
            .
          </p>
        </>
      ),
    },
    {
      id: "sizes",
      title: "YouTube Thumbnail Sizes and Resolutions",
      body: (
        <>
          <p>
            YouTube creates up to five standard sizes for each video.
            Here&apos;s what each one is:
          </p>
          <DataTable
            caption="The five standard YouTube thumbnail sizes. The largest two only exist when the creator's image was big enough."
            nowrapFirst
            head={[
              "Size name",
              "Dimensions",
              "Shape",
              "Always available?",
              "Good for",
            ]}
            rows={[
              [
                <code key="a">maxresdefault</code>,
                "1280 × 720",
                "16:9",
                "No",
                "Anything where quality matters",
              ],
              [
                <code key="b">sddefault</code>,
                "640 × 480",
                "4:3 (black bars)",
                "Usually",
                "Fallback when full HD is missing",
              ],
              [
                <code key="c">hqdefault</code>,
                "480 × 360",
                "4:3 (black bars)",
                "Yes",
                "Previews, the most reliable option",
              ],
              [
                <code key="d">mqdefault</code>,
                "320 × 180",
                "16:9",
                "Yes",
                "Small previews and lists — no black bars",
              ],
              [
                <code key="e">default</code>,
                "120 × 90",
                "4:3 (black bars)",
                "Yes",
                "Tiny icons only",
              ],
            ]}
          />
          <ThumbnailSizesVisual />
          <p>
            The 4:3 sizes are the ones that surprise people. Because most videos
            are 16:9 — wider than 4:3 — YouTube fits the image inside by adding
            black bars above and below. If you need a clean 16:9 image and the
            full-HD version doesn&apos;t exist, <code>mqdefault</code> has no
            bars but is small; for anything bigger, crop the bars off{" "}
            <code>sddefault</code> or <code>hqdefault</code>.
          </p>
          <p>
            You may also find files named <code>1.jpg</code>, <code>2.jpg</code>{" "}
            and <code>3.jpg</code>. These are tiny frames YouTube picked from
            the video automatically, and they&apos;re rarely useful.
          </p>
        </>
      ),
    },
    {
      id: "which-quality",
      title: "Which Thumbnail Quality Should You Choose?",
      body: (
        <>
          <p>
            In almost every case: <strong>the largest one available</strong>.
            You can always make an image smaller without losing quality, but
            never bigger.
          </p>
          <ul>
            <li>
              <strong>For a website, document or presentation</strong> — full HD
              (1280 × 720). If it&apos;s missing, use 640 × 480 and crop off the
              black bars.
            </li>
            <li>
              <strong>For a small preview or a list of links</strong> — 320 ×
              180 is enough and has no black bars.
            </li>
            <li>
              <strong>To recover your own lost thumbnail</strong> — full HD if
              it exists. It&apos;s a compressed copy of what you uploaded, so it
              won&apos;t be quite as sharp as your original file.
            </li>
          </ul>
          <Callout
            type="note"
            title="There's no way to get a bigger image than YouTube has"
          >
            If a video only has a 480 × 360 thumbnail, that&apos;s the largest
            that exists. Any website offering an “HD” or “4K” version of it is
            simply stretching the small image.
          </Callout>
        </>
      ),
    },
    {
      id: "mobile",
      title: "Can You Download a YouTube Thumbnail on Mobile?",
      body: (
        <>
          <p>
            Yes. Use your phone&apos;s browser rather than the YouTube app,
            which has no option for it.
          </p>
          <ul>
            <li>
              <strong>iPhone and iPad:</strong> in the YouTube app, tap{" "}
              <em>Share</em> → <em>Copy link</em>. Paste the link into the
              downloader in Safari and tap <em>Download</em>. The image goes to
              the Files app, in the Downloads folder. To put it in Photos, open
              the image, press and hold it, and choose <em>Save to Photos</em>.
            </li>
            <li>
              <strong>Android:</strong> copy the link the same way, paste it
              into the downloader in Chrome and tap <em>Download</em>. The image
              lands in your Downloads folder and usually appears in your gallery
              app too.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "shorts",
      title: "Can You Download YouTube Thumbnails From Shorts?",
      body: (
        <>
          <p>
            Yes. Shorts have thumbnail images at the same addresses as normal
            videos, and a <code>youtube.com/shorts/…</code> link works in the
            downloader like any other.
          </p>
          <p>
            Expect them to look different, though. Shorts are vertical, but the
            standard thumbnail sizes are horizontal, so the image usually shows
            the video in the middle with dark areas on either side. The full-HD
            size is often missing for Shorts too, so you may only get 480 × 360.
          </p>
        </>
      ),
    },
    {
      id: "why-thumbnails-matter",
      title: "Why YouTube Thumbnails Matter",
      body: (
        <>
          <p>
            On most screens, a video is just a thumbnail and a title until
            someone clicks. That&apos;s why creators put so much work into them
            — and why looking at thumbnails closely is useful:
          </p>
          <ul>
            <li>
              <strong>They&apos;re seen small.</strong> In a phone&apos;s list
              of suggested videos, a thumbnail can be well under 200 pixels
              wide. Text that looks bold in a design app can become unreadable.
              You can test yours with a{" "}
              <Link href="/youtube-tools/thumbnail-readability">
                thumbnail text tester
              </Link>
              .
            </li>
            <li>
              <strong>Something is always covered.</strong> YouTube places the
              video length in the bottom-right corner, so important details
              there get hidden.
            </li>
            <li>
              <strong>They set expectations.</strong> A thumbnail that promises
              something the video doesn&apos;t deliver may get clicks, but
              viewers leave quickly — and YouTube notices.
            </li>
          </ul>
          <p>
            Downloading thumbnails from videos in your niche is a good way to
            study what works: lay a handful side by side and look for patterns
            in colour, text and faces. You can then{" "}
            <Link href="/youtube-tools/thumbnail-preview">
              preview your own design next to them
            </Link>{" "}
            before publishing.
          </p>
        </>
      ),
    },
    {
      id: "common-problems",
      title: "Common Problems When Downloading YouTube Thumbnails",
      body: (
        <DataTable
          caption="Most download problems come down to the size not existing or the link not being a video link."
          head={["Problem", "Why it happens", "What to do"]}
          rows={[
            [
              "You get a small grey image",
              "That size wasn't generated for this video — usually full HD.",
              "Try the next size down (sddefault, then hqdefault).",
            ],
            [
              "The image has black bars",
              "4:3 sizes add bars around 16:9 videos.",
              "Use the full-HD size, or crop the bars off.",
            ],
            [
              "The link isn't recognised",
              "It's a channel, playlist or search link, not a single video.",
              "Open the video itself and copy its link.",
            ],
            [
              "You see the old thumbnail",
              "The creator changed it recently and an older copy is cached.",
              "Wait a while and try again, or open the image in a private window.",
            ],
            [
              "Nothing loads at all",
              "The video is private, deleted or restricted in some way.",
              "Only public and unlisted videos have reachable thumbnails.",
            ],
            [
              "The download opens in a new tab",
              "Some browsers show images instead of saving them.",
              "Right-click or long-press the image and choose Save.",
            ],
          ]}
        />
      ),
    },
    {
      id: "using-thumbnails",
      title: "Using Someone Else's Thumbnail",
      body: (
        <>
          <p>
            Downloading a thumbnail is easy; reusing it is a different question.
            A thumbnail belongs to whoever made it, usually the video&apos;s
            creator. Saving one to study, to reference in a review, or to link
            to the video from your own site is common practice. Publishing
            someone else&apos;s thumbnail as your own, or using it in an advert,
            generally needs their permission.
          </p>
          <Callout type="warning">
            What counts as acceptable use depends on the country you&apos;re in
            and what you&apos;re using the image for. This isn&apos;t legal
            advice — if in doubt, ask the creator.
          </Callout>
        </>
      ),
    },
    {
      id: "conclusion",
      title: "Conclusion",
      body: (
        <>
          <p>
            Every YouTube thumbnail is a public image at a predictable address,
            so saving one takes seconds: copy the video link, paste it into a{" "}
            <Link href="/youtube-tools/thumbnail-downloader">
              thumbnail downloader
            </Link>
            , and pick the largest size. Expect 1280 × 720 at best, 640 × 480 or
            480 × 360 when the creator didn&apos;t upload a large image, and
            black bars on the 4:3 sizes.
          </p>
          <p>
            If you&apos;re downloading thumbnails to improve your own, the next
            step is to check your design the way viewers will actually see it —
            small, on a phone, next to other videos.
          </p>
        </>
      ),
    },
  ],
  faqs: [
    {
      q: "What is the highest quality YouTube thumbnail I can download?",
      a: "1280 × 720 pixels (the “maxresdefault” size). It only exists when the creator uploaded a thumbnail at least that large. Nothing bigger is stored.",
    },
    {
      q: "Why does the full-size thumbnail show a grey image?",
      a: "That size wasn't created for the video, usually because the uploaded image was smaller. Use the 640 × 480 or 480 × 360 version instead.",
    },
    {
      q: "How do I get a YouTube thumbnail URL?",
      a: "Use https://i.ytimg.com/vi/VIDEO_ID/maxresdefault.jpg, replacing VIDEO_ID with the 11-character ID from the video link. Swap maxresdefault for sddefault, hqdefault, mqdefault or default for other sizes.",
    },
    {
      q: "Is it free to download YouTube thumbnails?",
      a: "Yes. Thumbnails are public images, and downloading one with our tool costs nothing and needs no account.",
    },
    {
      q: "Can I download the thumbnail of a private video?",
      a: "No. Private videos aren't publicly accessible, so their thumbnails can't be fetched. Unlisted videos work if you have the link.",
    },
    {
      q: "What format are YouTube thumbnails?",
      a: "JPG. YouTube also serves WebP versions at a slightly different address (i.ytimg.com/vi_webp/…/maxresdefault.webp), which are smaller files.",
    },
    {
      q: "Can I use a downloaded thumbnail on my own channel?",
      a: "Not someone else's without permission — thumbnails are the creator's work. Your own thumbnails are yours to reuse.",
    },
  ],
};

export default content;
