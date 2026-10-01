/**
 * Parse page ranges like "1-3, 5, 8-" (8- means "to the end") into 0-based page
 * indexes, in the order written, without duplicates. Returns an error message
 * string when the input can't be used.
 */
export function parseRanges(input: string, max: number): number[] | string {
  const out: number[] = [];
  for (const part of input.split(",").map((p) => p.trim()).filter(Boolean)) {
    const m = /^(\d+)?\s*(-)?\s*(\d+)?$/.exec(part);
    if (!m || (!m[1] && !m[3])) return `“${part}” isn't a page or range.`;
    const a = m[1] ? Number(m[1]) : 1;
    const b = m[2] ? (m[3] ? Number(m[3]) : max) : a;
    if (a < 1 || b > max || a > b) return `“${part}” is outside pages 1–${max}.`;
    for (let i = a; i <= b; i++) if (!out.includes(i - 1)) out.push(i - 1);
  }
  return out.length ? out : "Enter at least one page.";
}
