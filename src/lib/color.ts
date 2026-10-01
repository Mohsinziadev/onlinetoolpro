/** Client-safe color maths: parsing, conversion, WCAG contrast and mixing. */

export type RGB = { r: number; g: number; b: number };

const clamp = (n: number, lo = 0, hi = 255) => Math.min(hi, Math.max(lo, n));

export function hexToRgb(hex: string): RGB | null {
  let h = hex.trim().replace(/^#/, "");
  if (/^[0-9a-f]{3}$/i.test(h)) h = h.split("").map((c) => c + c).join("");
  if (/^[0-9a-f]{8}$/i.test(h)) h = h.slice(0, 6);
  if (!/^[0-9a-f]{6}$/i.test(h)) return null;
  const n = parseInt(h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export const rgbToHex = ({ r, g, b }: RGB) => "#" + [r, g, b].map((v) => Math.round(clamp(v)).toString(16).padStart(2, "0")).join("");

export function rgbToHsl({ r, g, b }: RGB): [number, number, number] {
  const R = r / 255, G = g / 255, B = b / 255;
  const max = Math.max(R, G, B), min = Math.min(R, G, B);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, Math.round(l * 100)];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h = max === R ? (G - B) / d + (G < B ? 6 : 0) : max === G ? (B - R) / d + 2 : (R - G) / d + 4;
  return [Math.round(h * 60), Math.round(s * 100), Math.round(l * 100)];
}

export function hslToRgb(h: number, s: number, l: number): RGB {
  const S = s / 100, L = l / 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = S * Math.min(L, 1 - L);
  const f = (n: number) => L - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return { r: Math.round(f(0) * 255), g: Math.round(f(8) * 255), b: Math.round(f(4) * 255) };
}

export function rgbToHsv({ r, g, b }: RGB): [number, number, number] {
  const R = r / 255, G = g / 255, B = b / 255;
  const max = Math.max(R, G, B), min = Math.min(R, G, B), d = max - min;
  const h = d === 0 ? 0 : max === R ? ((G - B) / d) % 6 : max === G ? (B - R) / d + 2 : (R - G) / d + 4;
  return [Math.round(((h * 60) + 360) % 360), Math.round(max === 0 ? 0 : (d / max) * 100), Math.round(max * 100)];
}

export function rgbToCmyk({ r, g, b }: RGB): [number, number, number, number] {
  const R = r / 255, G = g / 255, B = b / 255;
  const k = 1 - Math.max(R, G, B);
  if (k === 1) return [0, 0, 0, 100];
  return [(1 - R - k) / (1 - k), (1 - G - k) / (1 - k), (1 - B - k) / (1 - k), k].map((v) => Math.round(v * 100)) as [number, number, number, number];
}

/** Parse HEX, rgb()/rgba(), hsl()/hsla() or a CSS color name (via the browser). */
export function parseColor(input: string): RGB | null {
  const s = input.trim().toLowerCase();
  if (!s) return null;
  const hex = hexToRgb(s);
  if (hex) return hex;
  const rgb = /^rgba?\(\s*(\d{1,3})[\s,]+(\d{1,3})[\s,]+(\d{1,3})/.exec(s);
  if (rgb) return { r: clamp(+rgb[1]), g: clamp(+rgb[2]), b: clamp(+rgb[3]) };
  const hsl = /^hsla?\(\s*(-?\d+(?:\.\d+)?)(?:deg)?[\s,]+(\d+(?:\.\d+)?)%[\s,]+(\d+(?:\.\d+)?)%/.exec(s);
  if (hsl) return hslToRgb(((+hsl[1] % 360) + 360) % 360, clamp(+hsl[2], 0, 100), clamp(+hsl[3], 0, 100));
  if (typeof document !== "undefined" && /^[a-z]+$/.test(s)) {
    const el = document.createElement("canvas").getContext("2d");
    if (el) {
      el.fillStyle = "#010203";
      el.fillStyle = s;
      if (el.fillStyle !== "#010203") return hexToRgb(el.fillStyle);
    }
  }
  return null;
}

/** WCAG 2 relative luminance and contrast ratio. */
export function luminance({ r, g, b }: RGB): number {
  const f = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
export function contrast(a: RGB, b: RGB): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

export const mix = (a: RGB, b: RGB, t: number): RGB => ({ r: a.r + (b.r - a.r) * t, g: a.g + (b.g - a.g) * t, b: a.b + (b.b - a.b) * t });
export const WHITE: RGB = { r: 255, g: 255, b: 255 };
export const BLACK: RGB = { r: 0, g: 0, b: 0 };

export function hexWithAlpha(hex: string, alpha: number): string {
  const c = hexToRgb(hex) ?? BLACK;
  return alpha >= 1 ? rgbToHex(c) : `rgba(${c.r}, ${c.g}, ${c.b}, ${Math.round(alpha * 100) / 100})`;
}
