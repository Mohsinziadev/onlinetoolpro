/**
 * Catalog shapes. Categories and tools are plain data: every page, menu, card,
 * search result, sitemap entry and breadcrumb is derived from them.
 */

export type IconName =
  | "youtube"
  | "image"
  | "pdf"
  | "text"
  | "social"
  | "developer"
  | "marketing"
  | "productivity"
  | "calculator"
  | "seo"
  | "ai"
  | "download"
  | "image-down"
  | "id-card"
  | "hash"
  | "code"
  | "tags"
  | "file-search"
  | "list"
  | "scan"
  | "smartphone"
  | "type"
  | "frame"
  | "clipboard"
  | "line-chart"
  | "users"
  | "columns"
  | "message"
  | "search"
  | "dollar"
  | "gauge"
  | "badge-dollar"
  | "clock"
  | "heart"
  | "heading"
  | "pen"
  | "wand"
  | "shrink"
  | "scaling"
  | "crop"
  | "merge"
  | "scissors"
  | "file-image"
  | "letters"
  | "case"
  | "braces"
  | "link"
  | "qr"
  | "percent"
  | "at"
  | "binary"
  | "fingerprint"
  | "key"
  | "regex"
  | "palette"
  | "pipette"
  | "contrast"
  | "blend"
  | "layers"
  | "paintbrush"
  | "dices"
  | "shuffle"
  | "calendar"
  | "eraser"
  | "diff"
  | "sort"
  | "lock"
  | "timer"
  | "corner"
  | "image-plus"
  | "file-plus"
  | "file-code"
  | "minimize"
  | "copy-minus"
  | "pilcrow"
  | "swatch"
  | "file-stack"
  | "rotate"
  | "file-digit"
  | "stamp"
  | "signature"
  | "convert"
  | "scale"
  | "bank"
  | "house"
  | "piggy"
  | "graduation"
  | "receipt"
  | "flame"
  | "calendar-range"
  | "alarm"
  | "pinwheel"
  | "keyboard"
  | "ruler"
  | "globe"
  | "volume"
  | "italic"
  | "file-type"
  | "scan-text"
  | "wallet"
  | "car"
  | "trending-down"
  | "credit-card"
  | "target"
  | "palm"
  | "chart-column"
  | "building"
  | "house-plus"
  | "tag"
  | "chart-pie"
  | "receipt-text"
  | "message-circle"
  | "camera";

export type ToolStatus = "live" | "beta" | "coming-soon";

/** Quiet background patterns for tool and category headers. */
export type Pattern = "strings" | "grid" | "dots" | "rings" | "waves" | "rays" | "diagonal" | "arcs" | "plus";
/** Soft color washes from the site palette. */
export type Tint = "mint" | "sky" | "sand" | "mist" | "aqua";
export type Backdrop = { pattern: Pattern; tint: Tint };

export type Category = {
  /** Internal id, used by tools to say which category they belong to */
  slug: string;
  /** Public URL segment: /<path>, e.g. "youtube-tools". Tools live at /<path>/<tool slug>. */
  path: string;
  /** Short label used in menus and chips: "YouTube", "Images" */
  name: string;
  /** Page heading: "YouTube Tools" */
  title: string;
  /** One-line, plain-language summary for cards and menus */
  description: string;
  /** Longer intro shown under the category page heading */
  intro: string;
  icon: IconName;
  /** Lower comes first everywhere categories are listed */
  order: number;
  /** Show in the menus even before it has live tools (marked "Coming soon", not linked) */
  showInNav?: boolean;
  /**
   * Optional sub-groups used to organize "All tools" on big categories.
   * Tools reference a group by id; tools without a group fall into "Other".
   */
  groups?: { id: string; name: string }[];
  /** Header background. Defaults to "strings" in a tint chosen by order. */
  backdrop?: Partial<Backdrop>;
  /** Real questions people ask about this category, shown on the category page */
  faqs?: Faq[];
  metaTitle?: string;
  metaDescription?: string;
};

export type Faq = { q: string; a: string };

export type Tool = {
  /** URL segment inside its category: /<category path>/<slug> */
  slug: string;
  /** Category slug */
  category: string;
  /** Short name shown on cards: "Thumbnail Downloader" */
  name: string;
  /** Full page heading, when it differs: "YouTube Thumbnail Downloader" */
  title?: string;
  /**
   * The one search phrase this page is built to answer ("merge pdf"). Must be unique
   * across the site (checked by `npm run seo:check`) so pages don't compete.
   * Defaults to the lowercased title.
   */
  primaryKeyword?: string;
  /** Keep ad slots off this tool's page (for tools near ad-network policy lines). */
  noAds?: boolean;
  /** One plain-language sentence. What the user gets, not how it works. */
  description: string;
  icon: IconName;
  status: ToolStatus;
  /** Shown in Popular sections and highlighted with a badge */
  popular?: boolean;
  /** Shown first inside its category */
  featured?: boolean;
  /** ISO date the tool went live — drives "New tools" */
  addedAt?: string;
  /** Sub-group id inside the category */
  group?: string;
  /** Extra words people might type when searching */
  keywords?: string[];
  /** Three to four short steps in everyday language */
  steps?: string[];
  /** "What is this tool?" — two or three plain sentences */
  about?: string;
  /** "What can you use it for?" — real, legitimate use cases */
  useCases?: string[];
  /** ISO date the page was last meaningfully reviewed */
  updatedAt?: string;
  /** FAQs shown on the tool page (used when the tool has no page module of its own) */
  faqs?: Faq[];
  /** "Good to know" notes as plain paragraphs (used when the tool has no page module of its own) */
  guide?: { title: string; body: string[] }[];
  /** Future: some advanced tools may become paid. Everything is free today. */
  access?: "free" | "premium";
  /** Related tools as "slug" (same category) or "category/slug" */
  related?: string[];
  /** Small trust/usage notes shown under the heading */
  notes?: string[];
  /** Header background. Defaults to a pattern + tint unique to this tool. */
  backdrop?: Partial<Backdrop>;
  metaTitle?: string;
  metaDescription?: string;
};
