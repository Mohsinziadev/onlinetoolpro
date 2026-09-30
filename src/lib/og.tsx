import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site";
import type { Tint } from "@/lib/catalog/types";

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

const TINTS: Record<Tint, { bg: string; bg2: string; ink: string }> = {
  mint: { bg: "#f7fffb", bg2: "#cdfde2", ink: "#1f7a58" },
  sky: { bg: "#f5fbff", bg2: "#c3eafe", ink: "#2268b4" },
  sand: { bg: "#fdfbf8", bg2: "#efe2cf", ink: "#8a5f2c" },
  mist: { bg: "#f8f9fc", bg2: "#dde2ef", ink: "#45558a" },
  aqua: { bg: "#f5fdff", bg2: "#c9f3fd", ink: "#0b7f99" },
};

/**
 * The branded social card used for every page type: eyebrow, title, a short line,
 * and the site mark — in the page's own tint. Rendered at build time.
 */
export function ogImage({ eyebrow, title, subtitle, tint = "mint" }: { eyebrow: string; title: string; subtitle?: string; tint?: Tint }) {
  const t = TINTS[tint];
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: `linear-gradient(160deg, ${t.bg2} 0%, ${t.bg} 55%, #ffffff 100%)`,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", flexWrap: "wrap", width: 44, height: 44, gap: 4 }}>
            <div style={{ width: 20, height: 20, borderRadius: 6, background: "#0a2119" }} />
            <div style={{ width: 20, height: 20, borderRadius: 10, background: "#1f7a58" }} />
            <div style={{ width: 20, height: 20, borderRadius: 6, background: "#0a2119" }} />
            <div style={{ width: 20, height: 20, borderRadius: 6, background: "#0a2119" }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ fontSize: 32, fontWeight: 700, color: "#000805", letterSpacing: -0.5 }}>{siteConfig.name.replace(/Pro$/, "")}</div>
            {siteConfig.name.endsWith("Pro") ? (
              <div style={{ display: "flex", fontSize: 16, fontWeight: 700, letterSpacing: 2.5, color: "#7afab2", background: "#0a2119", borderRadius: 8, padding: "5px 9px 4px" }}>PRO</div>
            ) : null}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 26, fontWeight: 600, color: t.ink, textTransform: "uppercase", letterSpacing: 3 }}>{eyebrow}</div>
          <div style={{ fontSize: title.length > 60 ? 58 : 70, fontWeight: 700, color: "#000805", lineHeight: 1.08 }}>{title}</div>
          {subtitle ? <div style={{ fontSize: 30, color: "#5f6763", lineHeight: 1.35 }}>{subtitle}</div> : null}
        </div>
        <div style={{ display: "flex", gap: 14 }}>
          {["100% free", "No sign-up"].map((x) => (
            <div key={x} style={{ fontSize: 24, color: "#1c2622", background: "#ffffff", border: "2px solid #e6ebe8", borderRadius: 999, padding: "8px 22px" }}>
              {x}
            </div>
          ))}
        </div>
      </div>
    ),
    ogSize,
  );
}
