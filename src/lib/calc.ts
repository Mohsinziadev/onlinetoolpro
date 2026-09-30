/** Pure creator-calculator formulas and input parsing. Client-safe. */

/** "12,500" → 12500; "" or invalid → null. */
export function parseNumber(input: string): number | null {
  const cleaned = input.replace(/[,\s$£€]/g, "");
  if (cleaned === "") return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

/** "1:02:03", "4:05", "45" or "4m 5s" → seconds. null when invalid. */
export function parseDuration(input: string): number | null {
  const s = input.trim().toLowerCase();
  if (!s) return null;
  const unit = /^(?:(\d+(?:\.\d+)?)\s*h)?\s*(?:(\d+(?:\.\d+)?)\s*m(?:in)?)?\s*(?:(\d+(?:\.\d+)?)\s*s(?:ec)?)?$/.exec(s);
  if (unit && (unit[1] || unit[2] || unit[3])) {
    return Number(unit[1] ?? 0) * 3600 + Number(unit[2] ?? 0) * 60 + Number(unit[3] ?? 0);
  }
  if (!/^\d+(?::\d{1,2}){0,2}(?:\.\d+)?$/.test(s)) return null;
  const parts = s.split(":").map(Number);
  if (parts.slice(1).some((p) => p >= 60)) return null;
  return parts.reduce((acc, p) => acc * 60 + p, 0);
}

export const DAYS_PER_YEAR = 365;
export const MONTHS_PER_YEAR = 12;

/** Revenue = views ÷ 1,000 × RPM */
export function revenueFromViews(views: number, rpm: number): number {
  return (views / 1000) * rpm;
}

export function revenueBreakdown(monthlyViews: number, rpm: number) {
  const monthly = revenueFromViews(monthlyViews, rpm);
  const yearly = monthly * MONTHS_PER_YEAR;
  const daily = yearly / DAYS_PER_YEAR;
  return { daily, weekly: daily * 7, monthly, yearly };
}

/** RPM = revenue ÷ views × 1,000 */
export function rpm(revenue: number, views: number): number | null {
  return views > 0 ? (revenue / views) * 1000 : null;
}

/** CPM = ad revenue ÷ monetized impressions × 1,000 */
export function cpm(adRevenue: number, impressions: number): number | null {
  return impressions > 0 ? (adRevenue / impressions) * 1000 : null;
}

export function watchTime(views: number, avgSeconds: number) {
  const totalSeconds = views * avgSeconds;
  return { minutes: totalSeconds / 60, hours: totalSeconds / 3600 };
}

export function engagement(views: number, likes: number | null, comments: number | null) {
  const pct = (n: number | null) => (n === null || views <= 0 ? null : (n / views) * 100);
  return {
    likeRate: pct(likes),
    commentRate: pct(comments),
    engagementRate: views > 0 && (likes !== null || comments !== null) ? (((likes ?? 0) + (comments ?? 0)) / views) * 100 : null,
    likesPerComment: likes !== null && comments ? likes / comments : null,
    commentsPer1000: comments !== null && views > 0 ? (comments / views) * 1000 : null,
  };
}
