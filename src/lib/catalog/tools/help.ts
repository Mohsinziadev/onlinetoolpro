/**
 * Long-form help for tools without a custom page module (see src/tools/keys.ts):
 * the "Good to know" notes and extra FAQs shown under each tool. Keyed by
 * "category/slug". Merged into the catalog in ../index.ts — a tool's own `guide`
 * wins, and FAQs here are added after the tool's own.
 *
 * Rules: say only what the tool really does, answer questions people actually
 * ask, and never repeat the same paragraph across tools.
 */
import type { Faq, Tool } from "@/lib/catalog/types";

export type ToolHelp = { guide?: NonNullable<Tool["guide"]>; faqs?: Faq[] };

export const toolHelp: Record<string, ToolHelp> = {
  /* ——— Text ——— */
  "text/remove-duplicate-lines": {
    guide: [
      { title: "What counts as a duplicate", body: ["Two lines are duplicates when they match exactly. Turn on “Ignore capital letters” to treat “Apple” and “apple” as the same line, and “Trim spaces” so a stray space at the start or end doesn't make a line look unique.", "Empty lines are kept by default. Turn on “Remove empty lines” to drop them too."] },
      { title: "Common uses", body: ["Cleaning email lists before an import, removing repeated keywords from a spreadsheet column, or de-duplicating log lines. Paste straight from Excel or Google Sheets — each cell in a column becomes one line."] },
    ],
  },
  "text/sort-lines": {
    guide: [
      { title: "Alphabetical vs natural sorting", body: ["Plain alphabetical sorting compares text character by character, so “file10” comes before “file2”. The “Numbers in order” option reads numbers by their value instead, giving file1, file2 … file10 — usually what people expect for numbered items, versions and file names."] },
      { title: "Other ways to order a list", body: ["Sort by length to find the shortest or longest entries, reverse the current order, or shuffle the list randomly. Empty lines can be removed before sorting so they don't collect at the top."] },
    ],
    faqs: [{ q: "Can I sort a column from Excel?", a: "Yes. Copy the column, paste it here — each cell becomes a line — sort it, then paste the result back." }],
  },
  "text/whitespace-remover": {
    guide: [
      { title: "What each option cleans", body: ["“Collapse repeated spaces” turns runs of spaces into one. “Trim each line” removes spaces at the start and end of lines. “Remove blank lines” deletes empty lines, “Turn tabs into spaces” replaces tab characters, and “Join into one line” removes line breaks entirely."] },
      { title: "Fixing text copied from PDFs", body: ["PDFs store text as positioned lines, so copying often adds a line break at the end of every visual line. Join everything into one line first, then add paragraph breaks back where they belong."] },
    ],
    faqs: [{ q: "Does it change anything besides spaces?", a: "No. Letters, punctuation and numbers are left exactly as they are — only spaces, tabs and line breaks are affected." }],
  },
  "text/text-diff": {
    guide: [
      { title: "How to read the result", body: ["Lines that exist only in the new text are marked as added, lines that exist only in the original are marked as removed, and everything else is unchanged. When a line was edited, you'll see the old version removed and the new version added right next to each other."] },
      { title: "Ignoring changes that don't matter", body: ["Turn on “Ignore spacing” when text was re-indented or re-wrapped, and “Ignore capitals” when only the letter case changed. That leaves just the edits you actually care about."] },
    ],
    faqs: [{ q: "Can I compare code?", a: "Yes. Any plain text works — code, config files, CSV rows or document drafts. It compares line by line, the way code review tools do." }],
  },
  "text/lorem-ipsum-generator": {
    guide: [
      { title: "When to use placeholder text", body: ["Lorem ipsum fills a layout while the real words are still being written, so a design can be reviewed for spacing and hierarchy without readers getting distracted by the content. Replace it before publishing — search engines and readers see it as unfinished."] },
    ],
    faqs: [{ q: "Paragraphs, sentences or words — which should I choose?", a: "Paragraphs for articles and page bodies, sentences for cards and descriptions, and an exact word count when a field has a limit." }],
  },

  /* ——— Image ——— */
  "image/compressor": {
    guide: [
      { title: "JPG or WebP?", body: ["Both are lossy formats built for photos. WebP is usually smaller at the same visual quality and is supported by every current browser. Choose JPG when the image is going somewhere older, like some email clients, print services or upload forms that only accept JPG."] },
      { title: "Getting the smallest file", body: ["Quality is the biggest lever: 70–80% is usually indistinguishable from the original. If the image is much larger than it will be displayed, reduce its dimensions too — halving the width and height cuts the pixel count to a quarter."] },
      { title: "Supported files", body: ["You can drop JPG, PNG, WebP, GIF, BMP or AVIF images. The result is saved as JPG or WebP. Animated GIFs are saved as a single still frame."] },
    ],
    faqs: [
      { q: "How do I get an image under 100 KB (or 50 KB, 20 KB)?", a: "Choose “To a file size” and enter the limit. The tool finds the highest quality that fits and only makes the picture smaller if quality alone isn't enough. It counts 1 KB as 1,000 bytes, so the file also fits forms that count 1 KB as 1,024 bytes." },
      { q: "Does compressing remove photo metadata?", a: "Yes, whenever the image is re-saved: the new file is drawn without the original EXIF data, such as camera details and GPS location. (If a photo is already under your target size, the original is kept unchanged.)" },
    ],
  },
  "image/resizer": {
    guide: [
      { title: "Keeping proportions", body: ["With proportions locked, changing the width updates the height automatically so the image isn't squashed. Unlock it only when a form demands exact dimensions — the picture will stretch to fit."] },
      { title: "Choosing a format", body: ["The resizer keeps your original format by default. Save as JPG or WebP for photos you want small, or PNG for screenshots, logos and anything with transparency."] },
    ],
    faqs: [{ q: "How do I resize an image for a profile picture?", a: "Crop it to a square with the image cropper first, then resize it here to the size the site asks for — 400 × 400 px is a common choice." }],
  },
  "image/cropper": {
    guide: [
      { title: "Choosing an aspect ratio", body: ["1:1 suits profile pictures and many social posts, 16:9 fits YouTube thumbnails, slides and widescreen video, 4:3 matches most phone photos and classic presentations, and 9:16 is the full-screen story and Shorts format. Use Free to crop any shape."] },
      { title: "Precise cropping", body: ["Drag the box to move it and the corner handles to resize it. For exact placement, type pixel values for the position and size, or select the crop box and nudge it with the arrow keys."] },
    ],
    faqs: [{ q: "Which format should I save a crop in?", a: "PNG keeps every pixel and any transparency. JPG or WebP give a much smaller file for photos." }],
  },
  "image/converter": {
    guide: [
      { title: "Which format to pick", body: ["PNG is lossless and keeps transparency — best for screenshots, logos and graphics. JPG is small and universally supported — best for photos. WebP gives smaller files than both and supports transparency, but a few older apps can't open it."] },
      { title: "Supported input formats", body: ["JPG, PNG, WebP, GIF, BMP and AVIF. Animated GIFs are converted as a single still frame."] },
    ],
    faqs: [{ q: "How do I convert WebP to JPG?", a: "Drop the WebP file here, choose JPG, adjust the quality if you like and download. Any transparent areas become white." }],
  },
  "image/color-extractor": {
    guide: [
      { title: "Main colors vs picked colors", body: ["The palette shows the most common color groups in the whole image and what share each covers — useful for building a color scheme from a photo. Clicking the image picks the exact color of that single pixel, like an eyedropper."] },
      { title: "Using the colors elsewhere", body: ["Every color is shown with a code you can copy. Paste it into the color converter to get RGB, HSL or CMYK, or check two of them together in the contrast checker."] },
    ],
    faqs: [{ q: "Why don't I see a color I expected?", a: "Small details can be outnumbered by bigger areas. Increase the number of main colors, or click the detail directly to pick it." }],
  },
  "image/image-to-base64": {
    guide: [
      { title: "Data URI or plain Base64?", body: ["A data URI starts with something like data:image/png;base64, and can be used directly as an image source in HTML or a url() in CSS. Plain Base64 is just the encoded data, which APIs and JSON fields often expect."] },
      { title: "When not to use Base64", body: ["Base64 images can't be cached separately and make the page that contains them larger. Keep it for small icons and email templates; link larger images as normal files."] },
    ],
    faqs: [
      { q: "Which image formats work?", a: "PNG, JPG, WebP, GIF, BMP, AVIF, SVG and ICO." },
      { q: "How do I use it in CSS?", a: "Copy the data URI and use it as background-image: url(\"data:image/png;base64,…\")." },
    ],
  },
  "image/svg-to-png": {
    guide: [
      { title: "Choosing a size", body: ["SVGs are drawn fresh at any size, so you can export a crisp PNG at 1×, 2× or up to 4× the SVG's own dimensions. Use 2× or more for images shown on high-resolution phone and laptop screens."] },
      { title: "Transparent or solid background", body: ["Keep the background transparent for logos and icons you'll place on other colors. Turn it off to get a solid background, which some apps and upload forms need."] },
    ],
    faqs: [{ q: "Is my SVG uploaded?", a: "No. The SVG is drawn and converted inside your browser, so the file never leaves your device." }],
  },

  /* ——— PDF ——— */
  "pdf/merge": {
    guide: [
      { title: "Putting files in order", body: ["Files are merged top to bottom in the order shown. Use the arrows to move a file up or down before merging — for example to put a cover letter before a CV, or chapters in sequence."] },
      { title: "What stays the same", body: ["Pages are copied as they are, so text stays selectable and images keep their quality. Nothing is re-compressed or watermarked."] },
    ],
  },
  "pdf/split": {
    guide: [
      { title: "Two ways to split", body: ["“Pick pages into one PDF” builds a single new file from the pages you list — ideal for pulling out a chapter or a signed page. The other option saves every page as its own PDF."] },
      { title: "Writing page ranges", body: ["Use commas between parts and a hyphen for ranges: “1-3, 5, 8-” means pages 1 to 3, page 5, and page 8 to the end. Pages are counted from the first page of the file, regardless of any numbers printed on them."] },
    ],
    faqs: [{ q: "Does splitting reduce quality?", a: "No. Pages are copied exactly as they are into the new file." }],
  },
  "pdf/images-to-pdf": {
    guide: [
      { title: "Page size options", body: ["A4 is the standard paper size in most countries, US Letter is used in the US and Canada, and “Same as image” makes each page exactly the size of its picture — best when the PDF will only be read on screen. Each image is scaled to fit its page without cropping."] },
      { title: "Scanning documents with a phone", body: ["Take photos in good light, crop each one with the image cropper, then combine them here in page order. Compress the photos first if the PDF needs to be small enough to email."] },
    ],
    faqs: [{ q: "Can I change the order of the images?", a: "Yes. Move images up or down in the list before creating the PDF — the list order becomes the page order." }],
  },

  /* ——— Developer ——— */
  "developer/json-formatter": {
    guide: [
      { title: "Common JSON errors", body: ["The most frequent problems are trailing commas after the last item, single quotes instead of double quotes, keys without quotes and comments. The error message shows the line and column so you can jump straight to the problem."] },
      { title: "Formatting options", body: ["Choose 2 spaces, 4 spaces or tabs for readable output, or minify to remove all whitespace for the smallest payload. Sorting keys alphabetically makes two JSON files much easier to compare."] },
    ],
    faqs: [{ q: "How do I compare two JSON files?", a: "Format both with “Sort keys alphabetically” turned on, then paste them into the text compare tool to see exactly what changed." }],
  },
  "developer/url-encoder": {
    guide: [
      { title: "Encoding a value vs a whole URL", body: ["When you put text into a single query parameter — a search term or a redirect address — every special character must be encoded, including / ? & and =. When you encode a complete address, those characters must stay as they are so the URL still works. The two modes handle each case."] },
      { title: "Reading a messy link", body: ["Decoding turns codes like %20 (space), %2F (/) and %26 (&) back into readable characters, which helps when checking tracking links or debugging redirects."] },
    ],
    faqs: [
      { q: "Why is a space sometimes + and sometimes %20?", a: "Both mean a space. + is used in HTML form data, while %20 works everywhere in a URL, so %20 is the safer choice." },
      { q: "Can it decode emoji and accented letters?", a: "Yes. They're encoded as UTF-8 bytes (é becomes %C3%A9) and decoded back to the original characters." },
    ],
  },
  "developer/base64": {
    guide: [
      { title: "Where Base64 is used", body: ["Base64 appears in email attachments, data URIs for images, HTTP Basic authentication headers, JSON Web Tokens and API payloads that need to carry binary data as text."] },
      { title: "Text with emoji and accents", body: ["Text is converted to UTF-8 before encoding, so emoji, accented letters and non-Latin scripts round-trip correctly. Some simpler tools fail on these characters."] },
    ],
    faqs: [
      { q: "Why does my Base64 end with = signs?", a: "They're padding. Base64 works in groups of three bytes, and = fills the gap when the input doesn't divide evenly." },
      { q: "Can I decode an image from Base64 here?", a: "This tool decodes text. To turn an image into Base64, use the image to Base64 tool." },
    ],
  },
  "developer/html-entities": {
    guide: [
      { title: "When you need to encode", body: ["Encode text before placing it inside HTML when it might contain < > & or quotes — for example code samples in a blog post, or user-written text. Otherwise the browser may read it as markup."] },
      { title: "Named and numeric entities", body: ["Named entities like &amp;copy; are easy to read. Numeric entities like &amp;#169; work for any character. The decoder understands both."] },
    ],
    faqs: [
      { q: "Is encoding enough to prevent XSS?", a: "Encoding text placed between HTML tags is an important part of it, but safe output also depends on where the text goes — attributes, URLs and scripts each need their own handling. Use your framework's built-in escaping in real applications." },
      { q: "What does &nbsp; mean?", a: "A non-breaking space: a space that doesn't let the line wrap at that point." },
    ],
  },
  "developer/hash-generator": {
    guide: [
      { title: "Which algorithm to use", body: ["SHA-256 is the everyday choice for checksums, signatures and data integrity. SHA-384 and SHA-512 give longer outputs. MD5 and SHA-1 are broken for security purposes but still common for quick checksums and legacy systems."] },
      { title: "Checking a download", body: ["Many downloads publish a SHA-256 checksum. If the hash of the text you have matches the published one exactly, the content is identical — one changed character gives a completely different hash."] },
    ],
    faqs: [{ q: "Why is the hash of the same text different on another site?", a: "Usually hidden differences: a trailing space, a line break at the end, or different letter case. Hashes change completely with any difference." }],
  },
  "developer/uuid-generator": {
    guide: [
      { title: "UUID vs GUID", body: ["They're the same thing. GUID is Microsoft's name for a UUID. Both are 128-bit identifiers written as 32 hexadecimal characters, usually in five hyphen-separated groups."] },
      { title: "When to use version 4", body: ["Version 4 UUIDs are completely random, so they reveal nothing about when or where they were created. They're ideal for database keys, file names and request IDs."] },
    ],
    faqs: [
      { q: "How many UUIDs can I generate at once?", a: "Up to 100 at a time, with or without hyphens. Copy them or download them as a text file." },
      { q: "Are they safe to use as secret tokens?", a: "They come from a cryptographically secure generator, but UUIDs are designed as identifiers. For secrets, use a dedicated token generator with more randomness." },
    ],
  },
  "developer/jwt-decoder": {
    guide: [
      { title: "The three parts of a JWT", body: ["A JWT looks like xxxxx.yyyyy.zzzzz. The first part (header) says which algorithm signed it, the second (payload) holds the claims — user ID, roles, expiry — and the third is the signature. The first two are Base64URL-encoded JSON, which is why anyone can read them."] },
      { title: "Reading the standard claims", body: ["exp is the expiry time, iat is when it was issued, nbf is the time it becomes valid, sub is the subject (usually the user), iss is the issuer and aud is the intended audience. Times are Unix timestamps; the decoder shows them as readable dates."] },
    ],
    faqs: [{ q: "Why shouldn't I put secrets in a JWT?", a: "Because the payload is only encoded, not encrypted — anyone with the token can read it, as this tool shows." }],
  },
  "developer/timestamp-converter": {
    guide: [
      { title: "Time zones", body: ["A Unix timestamp is always in UTC — it's the same number everywhere in the world. The converter shows the date both in UTC and in your device's local time zone."] },
      { title: "The year 2038 problem", body: ["Older systems store timestamps as a signed 32-bit number, which runs out on 19 January 2038. Modern systems use 64-bit numbers and aren't affected."] },
    ],
    faqs: [
      { q: "What is the current Unix timestamp?", a: "The tool shows the live current timestamp in seconds, updating as you watch." },
      { q: "Can a timestamp be negative?", a: "Yes — negative values are dates before 1 January 1970." },
    ],
  },
  "developer/regex-tester": {
    guide: [
      { title: "The flags", body: ["g finds every match instead of only the first, i ignores letter case, m makes ^ and $ match at the start and end of each line, s lets . match line breaks, and u enables full Unicode support."] },
      { title: "Testing replacements", body: ["In the replacement field, $1, $2 and so on insert capture groups, and $& inserts the whole match. For example, replacing (\\w+)@(\\w+) with $2 at $1 swaps the parts around the @."] },
    ],
    faqs: [
      { q: "Will my regex work in Python or PHP?", a: "Most everyday patterns work the same. Differences appear with lookbehinds, named groups syntax and some flags, so test in your target language too." },
      { q: "Why does my pattern match an empty string?", a: "Patterns like a* can match zero characters. Use + instead of * if at least one character is required." },
    ],
  },

  /* ——— Color ——— */
  "color/color-converter": {
    guide: [
      { title: "Which format to use where", body: ["HEX (#1f7a58) is the standard on the web and in design tools. RGB is used in CSS and code. HSL (hue, saturation, lightness) is the easiest to adjust by hand — change the lightness to get lighter or darker versions. CMYK is for print."] },
      { title: "Accepted inputs", body: ["Paste HEX (3 or 6 digits), rgb() and rgba(), hsl() and hsla(), or any CSS color name such as teal or tomato. All other formats update at once."] },
    ],
    faqs: [{ q: "How do I convert HEX to RGB?", a: "Paste the HEX code — the RGB value appears instantly, ready to copy." }],
  },
  "color/contrast-checker": {
    guide: [
      { title: "Why contrast matters", body: ["Text that's too close in brightness to its background is hard to read in sunlight, on cheap screens and for people with low vision. The WCAG guidelines set minimum contrast ratios that many organizations use as their accessibility standard."] },
      { title: "Fixing a failing pair", body: ["Darken the text or lighten the background (or the other way round in dark mode) until the ratio passes. Changing the hue alone rarely helps — contrast is about lightness."] },
    ],
    faqs: [{ q: "Do icons and buttons need contrast too?", a: "Yes. WCAG asks for at least 3:1 for icons, input borders and other interface parts people need to see." }],
  },
  "color/shades-generator": {
    guide: [
      { title: "Building a color scale", body: ["Design systems use a scale of one color from very light to very dark — for backgrounds, borders, hover states and text. Choose how many tints and shades you want on each side of your base color (from 2 to 9), then copy the HEX codes or CSS variables."] },
      { title: "Tint, shade and tone", body: ["A tint is a color mixed with white, a shade is mixed with black, and a tone is mixed with gray. This tool generates tints and shades in even steps."] },
    ],
    faqs: [{ q: "How do I use the CSS variables?", a: "Paste them into your stylesheet's :root block, then use them anywhere with var(--name)." }],
  },

  /* ——— CSS ——— */
  "css/gradient-generator": {
    guide: [
      { title: "Linear and radial gradients", body: ["A linear gradient blends colors along a straight line at the angle you choose — 90° runs left to right, 180° top to bottom. A radial gradient spreads outward from the center."] },
      { title: "Color positions", body: ["Each color has a position from 0% to 100%. Moving two colors close together gives a sharp edge; spreading them apart makes a soft blend."] },
    ],
    faqs: [{ q: "Can I use the gradient as a background image?", a: "Yes. The generated background-image code works on any element and can be layered with other backgrounds." }],
  },
  "css/box-shadow-generator": {
    guide: [
      { title: "What each setting does", body: ["Horizontal and vertical offset move the shadow, blur softens its edge, spread grows or shrinks it, and opacity controls how dark it is. Inset puts the shadow inside the box, as if the surface were pressed in."] },
      { title: "Realistic shadows", body: ["Real shadows are soft and fall downward. A small vertical offset, a large blur, a slightly negative spread and low opacity look natural; heavy, dark shadows tend to look dated."] },
    ],
    faqs: [{ q: "Do box shadows slow a page down?", a: "Not noticeably for normal use. Very large blurs on many elements that animate can affect scrolling on slow phones." }],
  },
  "css/border-radius-generator": {
    guide: [
      { title: "Same or different corners", body: ["Link the corners to round them all equally, or unlink them to set each one between 0 and 200 px — useful for tabs, chat bubbles and cards attached to one edge."] },
      { title: "Making circles and pills", body: ["On a square element, a radius of half its width makes a circle. On a wide element, a radius at least half its height gives pill-shaped ends."] },
    ],
    faqs: [{ q: "Why is the output sometimes a single value?", a: "When all four corners are equal, one value is the shortest correct CSS. Different corners need two to four values." }],
  },
  "css/minifier": {
    guide: [
      { title: "What gets removed", body: ["Comments, line breaks, indentation and spaces around symbols like { } : ; are removed, as is the last semicolon in each block. Values, selectors and the order of rules stay exactly the same."] },
      { title: "Do you still need it?", body: ["Most build tools minify CSS automatically. This is handy for hand-written stylesheets, snippets pasted into a CMS, and quick checks of how much space minifying would save."] },
    ],
    faqs: [{ q: "Can I un-minify CSS?", a: "Minifying removes formatting permanently, so keep your original file. Comments can't be recovered." }],
  },

  /* ——— Productivity ——— */
  "productivity/qr-code-generator": {
    guide: [
      { title: "What a QR code can open", body: ["A website link, plain text, a Wi-Fi network (scanning connects the phone without typing the password) or a new email with the address and subject filled in."] },
      { title: "Printing QR codes", body: ["Keep strong contrast — dark code on a light background — and leave the quiet margin around it. A higher error-correction level lets the code survive scratches or a small logo on top, at the cost of a denser pattern. Always test-scan before printing."] },
    ],
  },
  "productivity/password-generator": {
    guide: [
      { title: "What makes a password strong", body: ["Length matters most. Each extra character multiplies the number of possible passwords, so a 16-character password is vastly harder to guess than an 8-character one. Mixing lowercase, uppercase, numbers and symbols adds more possibilities per character."] },
      { title: "Avoiding look-alike characters", body: ["Letters like I and l, and O and 0, are easy to confuse when a password has to be typed by hand. Turn on “Avoid look-alikes” to leave them out."] },
    ],
    faqs: [{ q: "Should I use a different password for every account?", a: "Yes. If one site leaks its passwords, a unique password means none of your other accounts are exposed. A password manager makes this easy." }],
  },
  "productivity/list-randomizer": {
    guide: [
      { title: "Running a fair giveaway", body: ["Paste every entry, one per line, remove duplicate entries first with the duplicate line remover, then pick the number of winners you need. Screenshot the result if you want a record of the draw."] },
      { title: "Shuffle or pick", body: ["Shuffle puts the whole list in a random order — useful for presentation order, turns or seating. Pick chooses a set number of different winners from the list."] },
    ],
    faqs: [
      { q: "Can the same name be picked twice?", a: "Not in one draw — each winner is a different line. If a name appears twice in your list, it has two chances." },
      { q: "Is there a limit to the list size?", a: "No practical limit. Thousands of entries work fine." },
    ],
  },
  "productivity/random-number-generator": {
    guide: [
      { title: "No repeats", body: ["With “No repeats” on, each number can come up only once — like drawing raffle tickets. You can't ask for more unique numbers than the range contains."] },
      { title: "Uses", body: ["Raffles and prize draws, choosing a random page or question, picking lottery-style numbers, dice rolls (1 to 6) and sampling rows from a spreadsheet."] },
    ],
    faqs: [
      { q: "How random is it?", a: "It uses your browser's cryptographically secure random generator, so every number in the range is equally likely." },
      { q: "Can I use negative numbers?", a: "Yes. Any whole numbers work as the minimum and maximum." },
    ],
  },

  /* ——— Calculators ——— */
  "calculators/percentage-calculator": {
    guide: [
      { title: "The four calculations", body: ["X% of Y: multiply Y by X and divide by 100 (15% of 80 = 12). X is what percent of Y: divide X by Y and multiply by 100 (12 of 80 = 15%). Percentage change: (new − old) ÷ old × 100. Increase or decrease: multiply by (1 ± X ÷ 100)."] },
      { title: "A common mistake", body: ["A 20% increase followed by a 20% decrease doesn't bring you back to the start: 100 → 120 → 96. Each percentage is taken from a different starting number."] },
    ],
    faqs: [
      { q: "How do I work out a discount?", a: "Use “Increase or decrease X by Y%”: 60 decreased by 25% gives 45 — the price after a 25% discount." },
      { q: "What is the difference between percent and percentage points?", a: "Going from 10% to 12% is a rise of 2 percentage points, but a 20% increase in the rate itself." },
    ],
  },
  "calculators/age-calculator": {
    guide: [
      { title: "Checking an age on a specific date", body: ["Change the “age on” date to find out how old someone was — or will be — on any day, for example on an application deadline, a school cut-off date or a past event."] },
      { title: "Leap-year birthdays", body: ["For people born on 29 February, most places treat the birthday as 28 February or 1 March in non-leap years. The tool counts full calendar months and days, so the result stays consistent either way."] },
    ],
    faqs: [
      { q: "How many days old am I?", a: "Enter your date of birth — the total number of days lived is shown alongside your age." },
      { q: "Does it use my time zone?", a: "Yes. Today's date comes from your device, so the result matches your local calendar." },
    ],
  },

  /* ——— SEO ——— */
  "seo/meta-tag-generator": {
    guide: [
      { title: "The tags that matter most", body: ["The title tag and meta description shape how the page looks in search results. The canonical link tells search engines which URL is the main version. Open Graph and X card tags control the image, title and description shown when the page is shared."] },
      { title: "Writing a good title", body: ["Put the main topic first, describe the page honestly, and keep it short enough not to be cut off. Each page on a site should have its own title."] },
    ],
    faqs: [{ q: "Where do I put the generated tags?", a: "Inside the page's <head> section. Most CMSs and site builders have SEO fields that create these tags for you." }],
  },
  "seo/slug-generator": {
    guide: [
      { title: "What makes a good slug", body: ["Short, lowercase, hyphen-separated, and describing the page: /image-compressor is easier to read, share and remember than /page?id=123 or /the-best-free-online-image-compressor-tool-2026."] },
      { title: "Changing existing URLs", body: ["If a page is already published, changing its slug breaks existing links. Set up a 301 redirect from the old address to the new one whenever you change it."] },
    ],
    faqs: [
      { q: "Should I remove words like “the” and “of”?", a: "Often, yes — it keeps slugs short. Keep them when removing them changes the meaning." },
      { q: "What happens to accents?", a: "Accented letters are converted to their plain versions (é becomes e) so the slug works everywhere." },
    ],
  },

  /* ——— Marketing ——— */
  "marketing/utm-builder": {
    guide: [
      { title: "The five UTM parameters", body: ["utm_source is where the visit comes from (newsletter, facebook), utm_medium is the channel type (email, social, cpc), utm_campaign names the campaign, utm_term records paid keywords and utm_content tells apart links in the same message."] },
      { title: "Keeping reports clean", body: ["Analytics treats Email and email as different values. Pick a naming convention, stick to lowercase and write it down so everyone on the team tags links the same way."] },
    ],
    faqs: [{ q: "Do UTM tags affect SEO?", a: "No. They only label visits in your analytics. Use them on links you share elsewhere, not on internal links." }],
  },
};
