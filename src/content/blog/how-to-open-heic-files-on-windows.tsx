import Link from "next/link";
import { Callout, DataTable, Steps, ToolCta } from "@/components/blog/content";
import type { PostContent } from "@/lib/blog/types";

const content: PostContent = {
  quickAnswer: (
    <p>
      Windows can&apos;t open iPhone photos (.heic) until it has Microsoft&apos;s HEIF and HEVC extensions. If you only need a few photos,
      the fastest fix is to <Link href="/image-tools/heic-to-jpg">convert them to JPG in your browser</Link>. If you deal with iPhone
      photos all the time, install the extensions — or change one iPhone setting so your photos arrive as JPG to begin with.
    </p>
  ),
  intro: (
    <>
      <p>
        You copy photos from an iPhone to a Windows PC, double-click one, and get an error — or a blank thumbnail, or an app asking you to
        buy something. Nothing is wrong with the photos. Since iOS 11, iPhones save pictures as <strong>HEIC</strong> (High Efficiency Image
        Container), a format that takes about half the space of a JPG at similar quality. Windows simply doesn&apos;t include the decoder for
        it on every PC.
      </p>
      <p>There are four ways around it. Which one is right depends on whether this is a one-off or something you&apos;ll hit every week.</p>
    </>
  ),
  sections: [
    {
      id: "which-fix",
      title: "Which fix should you use?",
      body: (
        <>
          <DataTable
            caption="Pick the fix that matches your situation"
            head={["Situation", "Best fix", "Time"]}
            rows={[
              ["A few photos, need them now (an upload form, an email)", "Convert them to JPG", "1 minute"],
              ["You open iPhone photos on this PC regularly", "Install the Windows extensions", "5 minutes, once"],
              ["You transfer photos from your iPhone with a cable", "Turn on automatic transfer conversion", "30 seconds, once"],
              ["You never need HEIC's smaller files", "Make the iPhone shoot JPG", "30 seconds, once"],
            ]}
          />
          <p>
            The last two options fix the problem at the source, so you won&apos;t have to think about it again. The first two help with the
            photos you already have.
          </p>
        </>
      ),
    },
    {
      id: "convert-heic-to-jpg",
      title: "Fix 1: Convert HEIC photos to JPG",
      body: (
        <>
          <p>
            This is the quickest route when a website, job portal or older program refuses HEIC. You end up with ordinary JPG files that open
            everywhere.
          </p>
          <Steps
            items={[
              <>
                Open the <Link href="/image-tools/heic-to-jpg">HEIC to JPG converter</Link>.
              </>,
              <>Drag in your .heic files — you can drop a whole batch at once.</>,
              <>Leave the quality around 90% (it looks identical to the original for photos) and press convert.</>,
              <>One photo downloads as a JPG; several download together in a ZIP file.</>,
            ]}
          />
          <p>
            The conversion runs inside your browser, so your photos aren&apos;t uploaded anywhere — worth caring about when the pictures are
            of your family, your ID or your home. Expect a few seconds per photo, because HEIC takes real work to decode.
          </p>
          <ToolCta tool="image/heic-to-jpg">Convert iPhone photos to JPG in your browser — several at once, nothing uploaded.</ToolCta>
          <Callout type="tip" title="Need the JPG to be small as well?">
            Upload forms often cap files at 100 KB or 200 KB, and a converted iPhone photo is usually 1–4 MB. Run the JPG through the{" "}
            <Link href="/image-tools/compressor">image compressor</Link> and choose “To a file size”. Our guide on{" "}
            <Link href="/blog/reduce-image-size-to-100kb">getting a photo under 100 KB</Link> explains the details.
          </Callout>
        </>
      ),
    },
    {
      id: "install-extensions",
      title: "Fix 2: Teach Windows to open HEIC",
      body: (
        <>
          <p>
            If you&apos;ll keep receiving iPhone photos, it&apos;s worth letting Windows read them directly. Two pieces from the Microsoft
            Store are involved:
          </p>
          <ul>
            <li>
              <strong>HEIF Image Extensions</strong> — free, and already installed on many Windows 11 PCs.
            </li>
            <li>
              <strong>HEVC Video Extensions</strong> — the part that actually decodes iPhone photos, because HEIC images are compressed with
              the HEVC codec. Some PCs have it from the manufacturer; on others Microsoft charges a small fee for it.
            </li>
          </ul>
          <p>
            Once both are installed (and the Photos app restarted), HEIC files open in Photos, show thumbnails in File Explorer and can be
            opened in Paint and saved as JPG.
          </p>
          <Callout type="note">
            If photos still show as blank thumbnails after installing the HEIF extension alone, the HEVC part is almost always the missing
            piece.
          </Callout>
        </>
      ),
    },
    {
      id: "iphone-transfer-setting",
      title: "Fix 3: Let the iPhone convert photos when you copy them",
      body: (
        <>
          <p>
            iPhones can convert photos to JPG on the fly while they&apos;re being copied to a computer with a cable. It&apos;s usually on by
            default, but worth checking if you&apos;re getting .heic files:
          </p>
          <Steps
            items={[
              <>
                On the iPhone, open <strong>Settings → Photos</strong>.
              </>,
              <>
                Scroll to <strong>Transfer to Mac or PC</strong> and choose <strong>Automatic</strong>.
              </>,
            ]}
          />
          <p>
            “Keep Originals” copies the HEIC files exactly as they are; “Automatic” hands Windows a compatible JPG instead. Your photos stay as
            HEIC on the phone, so you keep the space savings there.
          </p>
          <p>
            This setting only applies to cable transfers. Photos that reach your PC through iCloud, some cloud-storage apps or chat apps may
            still arrive as HEIC.
          </p>
        </>
      ),
    },
    {
      id: "shoot-jpg",
      title: "Fix 4: Make the iPhone save photos as JPG",
      body: (
        <>
          <p>If you&apos;d rather never see HEIC again, switch the camera format:</p>
          <Steps
            items={[
              <>
                Open <strong>Settings → Camera → Formats</strong>.
              </>,
              <>
                Choose <strong>Most Compatible</strong>.
              </>,
            ]}
          />
          <p>
            New photos are saved as JPG from then on. The trade-off is space: each picture takes roughly twice as much storage, which adds up
            quickly if your iCloud or phone storage is nearly full. Photos you took earlier stay as HEIC — convert those with Fix 1.
          </p>
          <Callout type="warning" title="Some camera features need HEIC">
            Some options on recent iPhones — such as 48-megapixel “HEIF Max” photos and some high-frame-rate video modes — only work with
            “High Efficiency”. If a camera option disappears after switching, that&apos;s why.
          </Callout>
        </>
      ),
    },
    {
      id: "what-you-lose",
      title: "What changes when HEIC becomes JPG?",
      body: (
        <>
          <ul>
            <li>
              <strong>File size goes up.</strong> A JPG at the same visual quality is usually larger — often around double.
            </li>
            <li>
              <strong>Live Photos become stills.</strong> The motion part of a Live Photo is a separate video; converting gives you the still
              frame.
            </li>
            <li>
              <strong>Picture quality is effectively the same</strong> at 85–95% JPG quality. You&apos;d need to zoom far in to spot a
              difference.
            </li>
            <li>
              <strong>HDR and wide color</strong> may look slightly flatter as JPG on very good screens; on most monitors you won&apos;t notice.
            </li>
          </ul>
        </>
      ),
    },
  ],
  faqs: [
    { q: "Why does my iPhone save photos as HEIC?", a: "Because HEIC files are roughly half the size of JPG at similar quality, so your phone and iCloud storage go further. Apple made it the default in iOS 11." },
    { q: "Can Windows 11 open HEIC files?", a: "Yes, once the HEIF Image Extensions and HEVC Video Extensions are installed from the Microsoft Store. Many PCs have the first one already; the HEVC part is often the one that's missing." },
    { q: "Is it safe to convert HEIC to JPG online?", a: "It depends on the site. Many converters upload your photos to their servers. A converter that runs in your browser, like ours, never sends the files anywhere — check for that before converting personal photos." },
    { q: "Does converting HEIC to JPG lose quality?", a: "Slightly in theory, since JPG is also a lossy format, but at 85–95% quality the difference isn't visible in normal viewing." },
    { q: "How do I convert many HEIC photos at once?", a: "Drop them all into the HEIC to JPG converter together. They're converted one after another and download as a single ZIP file." },
  ],
};

export default content;
