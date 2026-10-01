import Link from "next/link";
import { Callout, DataTable, Steps, ToolCta } from "@/components/blog/content";
import type { PostContent } from "@/lib/blog/types";

const content: PostContent = {
  quickAnswer: (
    <p>
      Open the <Link href="/image-tools/compressor">image compressor</Link>, choose <strong>“To a file size”</strong>, type <strong>100</strong>{" "}
      and download the result. It lowers the JPG quality just enough to fit and only shrinks the picture if quality alone isn&apos;t enough.
      If you&apos;d rather do it by hand: resize the photo to about 1,000–1,200 pixels wide, then save it as JPG at 70–80% quality.
    </p>
  ),
  intro: (
    <>
      <p>
        Job portals, exam registrations, visa forms and government websites love a hard limit: <em>“Photo must be under 100 KB.”</em> Your
        phone, meanwhile, produces photos of 2–5 MB — twenty to fifty times too big. The good news is that a 100 KB photo can still look
        perfectly sharp on screen. The trick is knowing which two settings actually control file size, and which popular “fixes” do nothing.
      </p>
    </>
  ),
  sections: [
    {
      id: "what-controls-size",
      title: "The only two things that really change file size",
      body: (
        <>
          <p>A JPG&apos;s size comes down to:</p>
          <ol>
            <li>
              <strong>How many pixels it has.</strong> A 12-megapixel phone photo (about 4000 × 3000) holds 12 million pixels. Halve the width
              and height and you&apos;re down to 3 million — a quarter of the data.
            </li>
            <li>
              <strong>The compression quality.</strong> Dropping from 95% to 75% often cuts the size by more than half with no difference you
              can see at normal viewing size.
            </li>
          </ol>
          <p>
            Everything else is a minor factor. Busy, detailed scenes (grass, gravel, a patterned shirt) compress worse than a plain background,
            so two photos at the same settings can differ a lot — which is why a fixed recipe sometimes misses the target.
          </p>
          <Callout type="warning" title="Changing DPI does nothing">
            A very common suggestion is to “change the image to 72 DPI”. DPI is just a printing instruction stored in the file; it doesn&apos;t
            change the number of pixels, so the file size stays the same. Change the pixel dimensions instead.
          </Callout>
        </>
      ),
    },
    {
      id: "fastest-way",
      title: "The fastest way: compress to a target size",
      body: (
        <>
          <Steps
            items={[
              <>
                Open the <Link href="/image-tools/compressor">image compressor</Link> and drop in your photo.
              </>,
              <>
                Switch to <strong>To a file size</strong> and tap <strong>100 KB</strong> (or type your limit).
              </>,
              <>Check the preview. The tool shows the quality and dimensions it used to fit.</>,
              <>Download. The file is always under your limit — if a photo truly can&apos;t get that small, the tool tells you instead.</>,
            ]}
          />
          <p>
            It tries the highest quality first and works down, so you get the best-looking file that still fits. Only when even low quality
            is too big does it reduce the dimensions — and it tells you when that happened. Nothing is uploaded; the work happens in your
            browser.
          </p>
          <ToolCta tool="image/compressor">Enter 100 KB (or 50, 20…) and get the best quality that fits — in your browser.</ToolCta>
        </>
      ),
    },
    {
      id: "starting-points",
      title: "Good starting dimensions for common limits",
      body: (
        <>
          <p>
            If a form also asks for specific dimensions, or you prefer doing it by hand, these are sensible starting points for an ordinary
            photo saved as JPG at around 75% quality. Busy photos may need a step smaller.
          </p>
          <DataTable
            caption="Starting points for common upload limits (typical photos, JPG ~75% quality)"
            head={["Limit", "Try this width (longest side)", "Typical use"]}
            rows={[
              ["500 KB", "1,920 px", "Web pages, email attachments"],
              ["200 KB", "1,200–1,600 px", "Profile photos, document uploads"],
              ["100 KB", "1,000–1,200 px", "Job and exam application photos"],
              ["50 KB", "600–800 px", "Passport-style photos on forms"],
              ["20 KB", "300–450 px", "Signature uploads, thumbnails"],
            ]}
          />
          <p>
            Signatures are a special case: a dark scribble on a white background compresses extremely well, so a signature can stay quite
            large and still fit 20 KB. Crop away the empty paper around it first with the{" "}
            <Link href="/image-tools/cropper">image cropper</Link>.
          </p>
        </>
      ),
    },
    {
      id: "still-too-big",
      title: "Why your photo is still over the limit",
      body: (
        <>
          <ul>
            <li>
              <strong>It&apos;s a PNG.</strong> PNG is lossless and is often five to ten times bigger than a JPG of the same photo. Save photos
              as JPG.
            </li>
            <li>
              <strong>It&apos;s a screenshot of a photo.</strong> Screenshots are saved as PNG at your screen&apos;s full resolution. Use the
              original photo instead, or convert the screenshot with <Link href="/image-tools/png-to-jpg">PNG to JPG</Link>.
            </li>
            <li>
              <strong>You only changed the quality.</strong> A full 12-megapixel photo rarely gets under 100 KB without losing visible
              quality. Reduce the dimensions as well.
            </li>
            <li>
              <strong>The form counts KB differently.</strong> Some sites treat 1 KB as 1,000 bytes, others as 1,024. A file of 101,000 bytes
              is “98.6 KB” to one and “101 KB” to the other. Aim a few kilobytes under the limit, or use the target-size mode, which counts
              1 KB as 1,000 bytes so the result passes either way.
            </li>
            <li>
              <strong>Hidden extra data.</strong> Photos carry metadata (camera model, date, GPS location) and sometimes an embedded preview.
              Re-saving through the compressor drops that, which also keeps your location private.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "minimum-size",
      title: "Watch out for minimum sizes and exact dimensions",
      body: (
        <>
          <p>
            Many official forms set a <em>range</em>, like “20–50 KB”, or demand exact dimensions such as 200 × 230 pixels. Squeezing a photo to
            8 KB to be safe can get it rejected just as surely as a 2 MB one. Read the requirement carefully, then:
          </p>
          <Steps
            items={[
              <>
                <Link href="/image-tools/cropper">Crop</Link> to the required shape first (for example, a portrait photo with your face centered).
              </>,
              <>
                <Link href="/image-tools/resizer">Resize</Link> to the exact pixel dimensions if the form specifies them.
              </>,
              <>
                <Link href="/image-tools/compressor">Compress</Link> to the maximum size — the result will sit near the top of the allowed range.
              </>,
            ]}
          />
          <Callout type="tip">
            Doing it in this order matters. Cropping and resizing first throws away pixels you don&apos;t need, so the compressor can keep a
            higher quality for the pixels that remain.
          </Callout>
        </>
      ),
    },
    {
      id: "iphone-photos",
      title: "Photos from an iPhone",
      body: (
        <p>
          iPhone photos are often HEIC files, which many upload forms reject outright, whatever the size. Convert them first with the{" "}
          <Link href="/image-tools/heic-to-jpg">HEIC to JPG converter</Link>, then compress the JPG. If HEIC photos won&apos;t even open on your
          computer, see <Link href="/blog/how-to-open-heic-files-on-windows">how to open HEIC files on Windows</Link>.
        </p>
      ),
    },
  ],
  faqs: [
    { q: "How do I reduce a photo to 100 KB without losing quality?", a: "Reduce the dimensions to roughly 1,000–1,200 pixels wide and save as JPG at 70–80% quality. At normal viewing size this looks the same as the original; the detail you lose is only visible when zooming far in." },
    { q: "Can I compress an image to exactly 100 KB?", a: "You can get it just under 100 KB. JPG sizes move in small jumps as quality changes, so landing on exactly 100.0 KB isn't practical — and being slightly under is what upload forms need anyway." },
    { q: "Why does my photo look blurry after compressing?", a: "Usually the quality went too low, or the photo was made very small and then shown larger. Try a slightly lower width with a higher quality instead — for most photos that looks sharper at the same file size." },
    { q: "Should I use JPG or PNG for a 100 KB limit?", a: "JPG for photos — PNG versions are many times larger. PNG only makes sense for simple graphics like logos, and even then check the form accepts it." },
    { q: "Does reducing the file size change the photo's dimensions?", a: "Not if you only lower the quality. In target-size mode, the compressor also reduces the dimensions when quality alone can't reach the limit, and shows the new size." },
  ],
};

export default content;
