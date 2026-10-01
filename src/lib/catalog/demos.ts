/**
 * Scripts for each tool's animated "How it works" demo: what gets entered,
 * which button is pressed, and what kind of result appears. Illustrative only —
 * the numbers are examples, not live data.
 */
import type { Tool } from "@/lib/catalog/types";

export type DemoInput =
  | { kind: "link"; value: string; placeholder: string }
  | { kind: "text"; value: string; placeholder: string }
  | { kind: "upload"; file: string }
  | { kind: "fields"; fields: [label: string, value: string][] };

export type DemoResult =
  | { kind: "thumbnails" }
  | { kind: "fields"; items: [label: string, value: string][] }
  | { kind: "code"; lines: string[] }
  | { kind: "tags"; items: string[] }
  | { kind: "stats"; items: [label: string, value: string][] }
  | { kind: "bars"; items: [label: string, value: number][] }
  | { kind: "line"; label: string; value: string }
  | { kind: "checks"; items: [label: string, verdict: string][] }
  | { kind: "text"; before: string; after: string }
  | { kind: "preview" }
  | { kind: "sizes" }
  | { kind: "safe-zone" }
  | { kind: "list"; items: string[] };

export type Demo = { input: DemoInput; action: string; working: string; result: DemoResult };

const VIDEO = "youtube.com/watch?v=aqz-KE-bpKQ";
const CHANNEL = "youtube.com/@CookingWithMaya";

const demos: Record<string, Demo> = {
  "youtube/thumbnail-downloader": {
    input: { kind: "link", value: VIDEO, placeholder: "Paste your YouTube video link" },
    action: "Get thumbnails",
    working: "Finding every size…",
    result: { kind: "thumbnails" },
  },
  "youtube/video-id-finder": {
    input: { kind: "link", value: "https://youtu.be/aqz-KE-bpKQ?t=42", placeholder: "Paste YouTube links" },
    action: "Find IDs",
    working: "Reading the link…",
    result: {
      kind: "fields",
      items: [
        ["Video ID", "aqz-KE-bpKQ"],
        ["Watch link", "youtube.com/watch?v=aqz-KE-bpKQ"],
        ["Embed link", "youtube.com/embed/aqz-KE-bpKQ"],
      ],
    },
  },
  "youtube/channel-id-finder": {
    input: { kind: "link", value: "@CookingWithMaya", placeholder: "Paste a channel link or @handle" },
    action: "Find channel ID",
    working: "Looking up the channel…",
    result: {
      kind: "fields",
      items: [
        ["Channel ID", "UCq4tH7x2kLmN8vB3zR5aW1Q"],
        ["Channel link", "youtube.com/channel/UCq4tH7x…"],
        ["Handle", "@CookingWithMaya"],
      ],
    },
  },
  "youtube/embed-generator": {
    input: { kind: "link", value: VIDEO, placeholder: "Paste your YouTube video link" },
    action: "Create code",
    working: "Building your embed…",
    result: {
      kind: "code",
      lines: [
        '<div style="aspect-ratio:16/9">',
        '  <iframe src="https://www.youtube-',
        '    nocookie.com/embed/aqz-KE-bpKQ"',
        "    allowfullscreen></iframe>",
        "</div>",
      ],
    },
  },
  "youtube/metadata-extractor": {
    input: { kind: "link", value: VIDEO, placeholder: "Paste your YouTube video link" },
    action: "Get details",
    working: "Getting the video details…",
    result: {
      kind: "fields",
      items: [
        ["Title", "Easy 20-minute pasta for weeknights"],
        ["Published", "12 March 2026"],
        ["Length", "14:32"],
        ["Views", "184,203"],
      ],
    },
  },
  "youtube/tag-extractor": {
    input: { kind: "link", value: VIDEO, placeholder: "Paste your YouTube video link" },
    action: "Get tags",
    working: "Finding the tags…",
    result: { kind: "tags", items: ["pasta recipe", "quick dinner", "weeknight meals", "easy cooking", "italian food", "20 minute meals", "one pot"] },
  },
  "youtube/timestamp-generator": {
    input: { kind: "text", value: "0 intro\n1:30 ingredients\n4:05 cooking the sauce", placeholder: "Type your chapters" },
    action: "Format",
    working: "Checking YouTube's rules…",
    result: { kind: "list", items: ["00:00 Intro", "01:30 Ingredients", "04:05 Cooking the sauce", "09:48 Plating up"] },
  },
  "youtube/thumbnail-analyzer": {
    input: { kind: "upload", file: "my-thumbnail.jpg" },
    action: "Check thumbnail",
    working: "Measuring your image…",
    result: {
      kind: "checks",
      items: [
        ["Brightness", "Good"],
        ["Contrast", "Strong"],
        ["Text size", "Readable"],
        ["Main colors", "3 bold colors"],
      ],
    },
  },
  "youtube/thumbnail-preview": {
    input: { kind: "upload", file: "my-thumbnail.jpg" },
    action: "Show preview",
    working: "Placing it on YouTube…",
    result: { kind: "preview" },
  },
  "youtube/thumbnail-readability": {
    input: { kind: "upload", file: "my-thumbnail.jpg" },
    action: "Test text",
    working: "Shrinking step by step…",
    result: { kind: "sizes" },
  },
  "youtube/thumbnail-safe-zone": {
    input: { kind: "upload", file: "my-thumbnail.jpg" },
    action: "Show safe zone",
    working: "Adding the guides…",
    result: { kind: "safe-zone" },
  },
  "youtube/channel-audit": {
    input: { kind: "link", value: CHANNEL, placeholder: "Paste a channel link or @handle" },
    action: "Check channel",
    working: "Reading the channel…",
    result: {
      kind: "stats",
      items: [
        ["Subscribers", "248K"],
        ["Total views", "31.2M"],
        ["Videos", "412"],
        ["Posts every", "4 days"],
      ],
    },
  },
  "youtube/channel-tracker": {
    input: { kind: "link", value: CHANNEL, placeholder: "Paste a channel link or @handle" },
    action: "Track",
    working: "Saving today's numbers…",
    result: { kind: "line", label: "Subscribers, last 90 days", value: "+12,480" },
  },
  "youtube/competitor-tracker": {
    input: { kind: "link", value: "@CookingWithMaya, @QuickEats", placeholder: "Add up to five channels" },
    action: "Compare",
    working: "Lining them up…",
    result: {
      kind: "bars",
      items: [
        ["Cooking with Maya", 82],
        ["Quick Eats", 64],
        ["Home Chef Lab", 47],
      ],
    },
  },
  "youtube/video-comparison": {
    input: { kind: "link", value: "2 video links added", placeholder: "Paste two or more video links" },
    action: "Compare",
    working: "Comparing videos…",
    result: {
      kind: "bars",
      items: [
        ["Pasta in 20 min", 91],
        ["Weekly meal prep", 58],
      ],
    },
  },
  "youtube/comment-analyzer": {
    input: { kind: "link", value: VIDEO, placeholder: "Paste a video link" },
    action: "Analyze",
    working: "Reading comments…",
    result: {
      kind: "checks",
      items: [
        ["“Can you do a vegan version?”", "42×"],
        ["“What pan is that?”", "31×"],
        ["“Please do a dessert next”", "18×"],
      ],
    },
  },
  "youtube/content-gap-finder": {
    input: { kind: "link", value: "@CookingWithMaya + 3 channels", placeholder: "Your channel and similar ones" },
    action: "Find topics",
    working: "Comparing video topics…",
    result: { kind: "tags", items: ["air fryer", "meal prep", "budget meals", "breakfast", "sourdough"] },
  },
  "youtube/revenue-calculator": {
    input: { kind: "fields", fields: [["Views per day", "25,000"], ["RPM", "$3.50"]] },
    action: "Calculate",
    working: "Doing the maths…",
    result: {
      kind: "stats",
      items: [
        ["Per day", "$87.50"],
        ["Per month", "$2,663"],
        ["Per year", "$31,938"],
      ],
    },
  },
  "youtube/rpm-calculator": {
    input: { kind: "fields", fields: [["Revenue", "$850"], ["Views", "210,000"]] },
    action: "Calculate",
    working: "Doing the maths…",
    result: { kind: "stats", items: [["Your RPM", "$4.05"], ["Per view", "$0.004"]] },
  },
  "youtube/cpm-calculator": {
    input: { kind: "fields", fields: [["Ad revenue", "$1,240"], ["Ad impressions", "180,000"]] },
    action: "Calculate",
    working: "Doing the maths…",
    result: { kind: "stats", items: [["Your CPM", "$6.89"], ["Per ad view", "$0.007"]] },
  },
  "youtube/watch-time-calculator": {
    input: { kind: "fields", fields: [["Views", "48,000"], ["Average watch", "6:20"]] },
    action: "Calculate",
    working: "Adding it up…",
    result: { kind: "stats", items: [["Hours watched", "5,067"], ["Minutes", "304,000"]] },
  },
  "youtube/engagement-calculator": {
    input: { kind: "fields", fields: [["Views", "92,000"], ["Likes", "4,100"], ["Comments", "380"]] },
    action: "Calculate",
    working: "Doing the maths…",
    result: { kind: "stats", items: [["Like rate", "4.46%"], ["Comment rate", "0.41%"], ["Engagement", "4.87%"]] },
  },
  "text/word-counter": {
    input: { kind: "text", value: "Simple tools make everyday tasks faster. Paste any text and see the counts instantly.", placeholder: "Type or paste your text" },
    action: "Count",
    working: "Counting…",
    result: { kind: "stats", items: [["Words", "14"], ["Characters", "86"], ["Sentences", "2"], ["Reading time", "4 sec"]] },
  },
  "text/case-converter": {
    input: { kind: "text", value: "the quick guide to better titles", placeholder: "Type or paste your text" },
    action: "Title Case",
    working: "Changing case…",
    result: { kind: "text", before: "the quick guide to better titles", after: "The Quick Guide to Better Titles" },
  },

  // ——— browser tools ———
  "text/remove-duplicate-lines": { input: { kind: "text", value: "apple\nbanana\napple\ncherry\nbanana", placeholder: "Your list" }, action: "Remove duplicates", working: "Finding repeats…", result: { kind: "list", items: ["apple", "banana", "cherry", "2 duplicates removed"] } },
  "text/sort-lines": { input: { kind: "text", value: "item 10\nbanana\nApple\nitem 2", placeholder: "Lines to sort" }, action: "Sort A → Z", working: "Sorting…", result: { kind: "list", items: ["Apple", "banana", "item 2", "item 10"] } },
  "text/whitespace-remover": { input: { kind: "text", value: "Too   many    spaces\n\n\n   here  ", placeholder: "Messy text" }, action: "Clean up", working: "Removing extra spaces…", result: { kind: "text", before: "Too   many    spaces   here", after: "Too many spaces here" } },
  "text/text-diff": { input: { kind: "text", value: "Draft one\nDraft two", placeholder: "Two versions" }, action: "Compare", working: "Comparing lines…", result: { kind: "checks", items: [["+ New intro paragraph", "added"], ["− Old closing line", "removed"], ["Everything else", "same"]] } },
  "text/lorem-ipsum-generator": { input: { kind: "fields", fields: [["Paragraphs", "3"]] }, action: "Generate", working: "Writing placeholder text…", result: { kind: "text", before: "3 paragraphs", after: "Lorem ipsum dolor sit amet, consectetur adipiscing elit…" } },

  "image/compressor": { input: { kind: "upload", file: "holiday-photo.jpg" }, action: "Compress", working: "Re-saving at 75% quality…", result: { kind: "stats", items: [["Before", "4.2 MB"], ["After", "610 KB"], ["Saved", "85%"]] } },
  "image/resizer": { input: { kind: "upload", file: "banner.png" }, action: "Resize", working: "Resizing to 1280 × 720…", result: { kind: "sizes" } },
  "image/cropper": { input: { kind: "upload", file: "profile.jpg" }, action: "Crop square", working: "Cropping…", result: { kind: "safe-zone" } },
  "image/converter": { input: { kind: "upload", file: "image.webp" }, action: "Convert to JPG", working: "Converting…", result: { kind: "fields", items: [["From", "WebP"], ["To", "JPG"], ["Size", "1920 × 1080"]] } },
  "image/color-extractor": { input: { kind: "upload", file: "logo.png" }, action: "Get colors", working: "Grouping pixels…", result: { kind: "tags", items: ["#1F7A58", "#7AFAB2", "#0A2119", "#F7FFFB", "#E3F6FF"] } },
  "image/image-to-base64": { input: { kind: "upload", file: "icon.png" }, action: "Convert", working: "Encoding…", result: { kind: "code", lines: ["data:image/png;base64,", "iVBORw0KGgoAAAANSUhEUgAA", "AAEAAAABCAYAAAAfFcSJAAAA", "DUlEQVR42mNk+M9QDwADhgGA…"] } },
  "image/svg-to-png": { input: { kind: "upload", file: "logo.svg" }, action: "Make PNG (2×)", working: "Drawing the SVG…", result: { kind: "fields", items: [["Size", "2×"], ["PNG", "1024 × 1024"], ["Background", "Transparent"]] } },

  "pdf/merge": { input: { kind: "upload", file: "invoice-march.pdf" }, action: "Merge", working: "Combining 3 files…", result: { kind: "stats", items: [["Files", "3"], ["Pages", "14"], ["Result", "merged.pdf"]] } },
  "pdf/split": { input: { kind: "fields", fields: [["Pages to keep", "1-3, 5"]] }, action: "Extract", working: "Copying pages…", result: { kind: "list", items: ["Page 1", "Page 2", "Page 3", "Page 5"] } },
  "pdf/images-to-pdf": { input: { kind: "upload", file: "receipt-photo.jpg" }, action: "Create PDF", working: "Placing images on A4 pages…", result: { kind: "stats", items: [["Images", "4"], ["Pages", "4"], ["Size", "A4"]] } },

  "developer/json-formatter": { input: { kind: "text", value: '{"name":"OnlineToolPro","tools":["json","qr"]}', placeholder: "Your JSON" }, action: "Format", working: "Parsing…", result: { kind: "code", lines: ["{", '  "name": "OnlineToolPro",', '  "tools": [', '    "json",', '    "qr"', "  ]", "}"] } },
  "developer/url-encoder": { input: { kind: "text", value: "search term & more", placeholder: "Text" }, action: "Encode", working: "Encoding…", result: { kind: "text", before: "search term & more", after: "search%20term%20%26%20more" } },
  "developer/base64": { input: { kind: "text", value: "Hello, world!", placeholder: "Text" }, action: "Encode", working: "Encoding…", result: { kind: "text", before: "Hello, world!", after: "SGVsbG8sIHdvcmxkIQ==" } },
  "developer/html-entities": { input: { kind: "text", value: "<p>Tom & Jerry</p>", placeholder: "HTML" }, action: "Encode", working: "Escaping…", result: { kind: "text", before: "<p>Tom & Jerry</p>", after: "&lt;p&gt;Tom &amp; Jerry&lt;/p&gt;" } },
  "developer/hash-generator": { input: { kind: "text", value: "hello", placeholder: "Text to hash" }, action: "Hash", working: "Hashing…", result: { kind: "fields", items: [["MD5", "5d41402abc4b2a76b9719d911017c592"], ["SHA-1", "aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d"], ["SHA-256", "2cf24dba5fb0a30e26e83b2ac5b9e29e…"]] } },
  "developer/uuid-generator": { input: { kind: "fields", fields: [["How many", "3"]] }, action: "Generate", working: "Generating…", result: { kind: "list", items: ["9b2f6c1e-4a7d-4c1b-8e2f-3a9d5b7c1e40", "c41e8a02-7f3b-4d9e-a1c5-6b2d8e4f0a17", "5e7a9c3b-1d4f-4b8a-9c2e-7f1a3d5b9c62"] } },
  "developer/jwt-decoder": { input: { kind: "text", value: "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI0MiJ9…", placeholder: "Token" }, action: "Decode", working: "Decoding…", result: { kind: "code", lines: ["{", '  "sub": "42",', '  "name": "Ada",', '  "exp": 1893456000', "}"] } },
  "developer/timestamp-converter": { input: { kind: "fields", fields: [["Timestamp", "1735689600"]] }, action: "Convert", working: "Converting…", result: { kind: "fields", items: [["UTC", "Wed, 01 Jan 2025 00:00:00"], ["ISO", "2025-01-01T00:00:00.000Z"], ["Milliseconds", "1735689600000"]] } },
  "developer/regex-tester": { input: { kind: "fields", fields: [["Pattern", "\\d{4}"], ["Text", "Born 1990, moved 2014"]] }, action: "Test", working: "Matching…", result: { kind: "tags", items: ["1990", "2014"] } },

  "color/color-converter": { input: { kind: "fields", fields: [["Color", "#1F7A58"]] }, action: "Convert", working: "Converting…", result: { kind: "fields", items: [["RGB", "rgb(31, 122, 88)"], ["HSL", "hsl(158, 59%, 30%)"], ["CMYK", "cmyk(75%, 0%, 28%, 52%)"]] } },
  "color/contrast-checker": { input: { kind: "fields", fields: [["Text", "#1C2622"], ["Background", "#E8FFF4"]] }, action: "Check", working: "Measuring contrast…", result: { kind: "checks", items: [["Normal text · AA", "Pass"], ["Normal text · AAA", "Pass"], ["Large text · AA", "Pass"]] } },
  "color/shades-generator": { input: { kind: "fields", fields: [["Base color", "#1F7A58"]] }, action: "Generate", working: "Mixing tints and shades…", result: { kind: "bars", items: [["100", 92], ["300", 72], ["Base", 50], ["700", 32], ["900", 14]] } },

  "css/gradient-generator": { input: { kind: "fields", fields: [["From", "#7AFAB2"], ["To", "#1F7A58"]] }, action: "Copy CSS", working: "Building the gradient…", result: { kind: "code", lines: ["background: linear-gradient(", "  135deg,", "  #7afab2 0%,", "  #1f7a58 100%", ");"] } },
  "css/box-shadow-generator": { input: { kind: "fields", fields: [["Blur", "32px"], ["Opacity", "25%"]] }, action: "Copy CSS", working: "Rendering shadow…", result: { kind: "code", lines: ["box-shadow:", "  0 12px 32px -8px", "  rgba(10, 33, 25, 0.25);"] } },
  "css/border-radius-generator": { input: { kind: "fields", fields: [["All corners", "24px"]] }, action: "Copy CSS", working: "Rounding corners…", result: { kind: "code", lines: [".card {", "  border-radius: 24px;", "}"] } },
  "css/minifier": { input: { kind: "text", value: ".card {\n  padding: 16px; /* spacing */\n}", placeholder: "Your CSS" }, action: "Minify", working: "Removing comments and spaces…", result: { kind: "stats", items: [["Before", "4.8 KB"], ["After", "3.1 KB"], ["Smaller", "35%"]] } },

  "productivity/qr-code-generator": { input: { kind: "link", value: "https://example.com/menu", placeholder: "Link" }, action: "Create QR code", working: "Drawing the code…", result: { kind: "fields", items: [["Content", "example.com/menu"], ["Formats", "PNG and SVG"], ["Expires", "Never"]] } },
  "productivity/password-generator": { input: { kind: "fields", fields: [["Length", "20"], ["Symbols", "On"]] }, action: "Generate", working: "Using secure randomness…", result: { kind: "fields", items: [["Password", "k7#Qm2!vRz9@Lp4&Wx6^"], ["Strength", "Very strong"]] } },
  "productivity/list-randomizer": { input: { kind: "text", value: "Alice\nBen\nChloe\nDev", placeholder: "Names" }, action: "Pick a winner", working: "Shuffling…", result: { kind: "tags", items: ["🏆 Chloe"] } },
  "productivity/random-number-generator": { input: { kind: "fields", fields: [["Min", "1"], ["Max", "100"]] }, action: "Generate", working: "Rolling…", result: { kind: "stats", items: [["Your number", "47"]] } },

  "calculators/percentage-calculator": { input: { kind: "fields", fields: [["Percentage", "20%"], ["Of", "150"]] }, action: "Calculate", working: "Doing the maths…", result: { kind: "stats", items: [["Answer", "30"], ["Formula", "20 ÷ 100 × 150"]] } },
  "calculators/age-calculator": { input: { kind: "fields", fields: [["Date of birth", "1994-06-15"]] }, action: "Calculate", working: "Counting days…", result: { kind: "stats", items: [["Years", "32"], ["Months", "3"], ["Days", "15"], ["Next birthday", "258 days"]] } },

  "seo/meta-tag-generator": { input: { kind: "fields", fields: [["Title", "Free Online Tools"], ["Description", "Simple tools…"]] }, action: "Generate", working: "Building tags…", result: { kind: "code", lines: ["<title>Free Online Tools</title>", '<meta name="description" …>', '<meta property="og:title" …>', '<meta name="twitter:card" …>'] } },
  "seo/slug-generator": { input: { kind: "text", value: "How to Download a YouTube Thumbnail (2026)", placeholder: "Title" }, action: "Make slug", working: "Cleaning up…", result: { kind: "text", before: "How to Download a YouTube Thumbnail (2026)", after: "how-to-download-a-youtube-thumbnail-2026" } },
  "marketing/utm-builder": { input: { kind: "fields", fields: [["Source", "newsletter"], ["Campaign", "spring_sale"]] }, action: "Build link", working: "Adding parameters…", result: { kind: "code", lines: ["https://example.com/?", "utm_source=newsletter", "&utm_medium=email", "&utm_campaign=spring_sale"] } },
};

/** The tool's demo script; tools without one get a sensible generic demo. */
export function getDemo(tool: Tool): Demo {
  return (
    demos[`${tool.category}/${tool.slug}`] ?? {
      input: { kind: "text", value: "Your input", placeholder: "Add your input" },
      action: "Go",
      working: "Working…",
      result: { kind: "checks", items: [["Done", "Ready"]] },
    }
  );
}
