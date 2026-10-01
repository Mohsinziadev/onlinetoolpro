"use client";

/** Unit converter and time zone converter. Plain math and the browser's Intl API. */
import { useMemo, useState } from "react";
import { ArrowLeftRight, Plus, X } from "lucide-react";
import { FieldLabel, Panel, useMounted } from "@/components/kit";
import { CopyButton } from "@/components/tool/copy-button";
import { cn } from "@/lib/utils";

const selectClass = "h-12 w-full rounded-xl border border-line bg-surface px-3 text-[15px] text-ink outline-none focus:border-accent/50 focus:ring-4 focus:ring-accent/10";

/* ——— Units ——— */

type Unit = { id: string; label: string; factor: number }; // factor = value of 1 unit in the base unit
type Category = { id: string; label: string; units: Unit[]; from: string; to: string };

const CATEGORIES: Category[] = [
  {
    id: "length", label: "Length", from: "cm", to: "in",
    units: [
      { id: "mm", label: "Millimeters (mm)", factor: 0.001 },
      { id: "cm", label: "Centimeters (cm)", factor: 0.01 },
      { id: "m", label: "Meters (m)", factor: 1 },
      { id: "km", label: "Kilometers (km)", factor: 1000 },
      { id: "in", label: "Inches (in)", factor: 0.0254 },
      { id: "ft", label: "Feet (ft)", factor: 0.3048 },
      { id: "yd", label: "Yards (yd)", factor: 0.9144 },
      { id: "mi", label: "Miles (mi)", factor: 1609.344 },
      { id: "nmi", label: "Nautical miles", factor: 1852 },
    ],
  },
  {
    id: "weight", label: "Weight", from: "kg", to: "lb",
    units: [
      { id: "mg", label: "Milligrams (mg)", factor: 0.000001 },
      { id: "g", label: "Grams (g)", factor: 0.001 },
      { id: "kg", label: "Kilograms (kg)", factor: 1 },
      { id: "t", label: "Metric tons (t)", factor: 1000 },
      { id: "oz", label: "Ounces (oz)", factor: 0.028349523125 },
      { id: "lb", label: "Pounds (lb)", factor: 0.45359237 },
      { id: "st", label: "Stones (st)", factor: 6.35029318 },
      { id: "ton", label: "US tons", factor: 907.18474 },
    ],
  },
  {
    id: "temperature", label: "Temperature", from: "c", to: "f",
    units: [
      { id: "c", label: "Celsius (°C)", factor: 1 },
      { id: "f", label: "Fahrenheit (°F)", factor: 1 },
      { id: "k", label: "Kelvin (K)", factor: 1 },
    ],
  },
  {
    id: "volume", label: "Volume", from: "l", to: "gal",
    units: [
      { id: "ml", label: "Milliliters (ml)", factor: 0.001 },
      { id: "l", label: "Liters (l)", factor: 1 },
      { id: "m3", label: "Cubic meters (m³)", factor: 1000 },
      { id: "tsp", label: "Teaspoons (US)", factor: 0.00492892159375 },
      { id: "tbsp", label: "Tablespoons (US)", factor: 0.01478676478125 },
      { id: "floz", label: "Fluid ounces (US)", factor: 0.0295735295625 },
      { id: "cup", label: "Cups (US)", factor: 0.2365882365 },
      { id: "pt", label: "Pints (US)", factor: 0.473176473 },
      { id: "qt", label: "Quarts (US)", factor: 0.946352946 },
      { id: "gal", label: "Gallons (US)", factor: 3.785411784 },
      { id: "ukgal", label: "Gallons (UK)", factor: 4.54609 },
    ],
  },
  {
    id: "area", label: "Area", from: "m2", to: "ft2",
    units: [
      { id: "cm2", label: "Square centimeters", factor: 0.0001 },
      { id: "m2", label: "Square meters (m²)", factor: 1 },
      { id: "km2", label: "Square kilometers", factor: 1_000_000 },
      { id: "ha", label: "Hectares", factor: 10_000 },
      { id: "in2", label: "Square inches", factor: 0.00064516 },
      { id: "ft2", label: "Square feet (ft²)", factor: 0.09290304 },
      { id: "yd2", label: "Square yards", factor: 0.83612736 },
      { id: "ac", label: "Acres", factor: 4046.8564224 },
      { id: "mi2", label: "Square miles", factor: 2_589_988.110336 },
    ],
  },
  {
    id: "speed", label: "Speed", from: "kmh", to: "mph",
    units: [
      { id: "ms", label: "Meters per second", factor: 1 },
      { id: "kmh", label: "Kilometers per hour", factor: 1 / 3.6 },
      { id: "mph", label: "Miles per hour", factor: 0.44704 },
      { id: "kn", label: "Knots", factor: 0.514444 },
      { id: "fts", label: "Feet per second", factor: 0.3048 },
    ],
  },
  {
    id: "time", label: "Time", from: "h", to: "min",
    units: [
      { id: "ms", label: "Milliseconds", factor: 0.001 },
      { id: "s", label: "Seconds", factor: 1 },
      { id: "min", label: "Minutes", factor: 60 },
      { id: "h", label: "Hours", factor: 3600 },
      { id: "d", label: "Days", factor: 86_400 },
      { id: "wk", label: "Weeks", factor: 604_800 },
      { id: "yr", label: "Years (365.25 days)", factor: 31_557_600 },
    ],
  },
  {
    id: "data", label: "Data", from: "MB", to: "GB",
    units: [
      { id: "b", label: "Bits", factor: 0.125 },
      { id: "B", label: "Bytes", factor: 1 },
      { id: "KB", label: "Kilobytes (KB, 1000)", factor: 1e3 },
      { id: "MB", label: "Megabytes (MB, 1000²)", factor: 1e6 },
      { id: "GB", label: "Gigabytes (GB, 1000³)", factor: 1e9 },
      { id: "TB", label: "Terabytes (TB, 1000⁴)", factor: 1e12 },
      { id: "KiB", label: "Kibibytes (KiB, 1024)", factor: 1024 },
      { id: "MiB", label: "Mebibytes (MiB, 1024²)", factor: 1024 ** 2 },
      { id: "GiB", label: "Gibibytes (GiB, 1024³)", factor: 1024 ** 3 },
    ],
  },
];

function convert(cat: Category, value: number, from: string, to: string): number {
  if (cat.id === "temperature") {
    const c = from === "c" ? value : from === "f" ? ((value - 32) * 5) / 9 : value - 273.15;
    return to === "c" ? c : to === "f" ? (c * 9) / 5 + 32 : c + 273.15;
  }
  const f = cat.units.find((u) => u.id === from)!.factor;
  const t = cat.units.find((u) => u.id === to)!.factor;
  return (value * f) / t;
}

/** Up to 10 significant digits, no exponent for everyday sizes, fixed locale. */
function show(n: number) {
  if (!Number.isFinite(n)) return "—";
  if (n !== 0 && (Math.abs(n) >= 1e15 || Math.abs(n) < 1e-6)) return n.toExponential(6);
  return new Intl.NumberFormat("en-US", { maximumSignificantDigits: 10 }).format(n);
}

export function UnitConverter() {
  const [catId, setCatId] = useState("length");
  const cat = CATEGORIES.find((c) => c.id === catId)!;
  const [from, setFrom] = useState(cat.from);
  const [to, setTo] = useState(cat.to);
  const [raw, setRaw] = useState("1");
  const value = Number(raw.replace(/,/g, ""));
  const ok = raw.trim() !== "" && Number.isFinite(value);
  const result = ok ? convert(cat, value, from, to) : NaN;
  const unitLabel = (id: string) => cat.units.find((u) => u.id === id)?.label ?? id;

  function pickCategory(id: string) {
    const c = CATEGORIES.find((x) => x.id === id)!;
    setCatId(id);
    setFrom(c.from);
    setTo(c.to);
  }

  return (
    <div className="space-y-4">
      <div role="tablist" aria-label="What to convert" className="flex flex-wrap gap-1.5">
        {CATEGORIES.map((c) => (
          <button key={c.id} type="button" role="tab" aria-selected={c.id === catId} onClick={() => pickCategory(c.id)} className={cn("chip", c.id === catId && "chip-active")}>
            {c.label}
          </button>
        ))}
      </div>
      <Panel className="space-y-5">
        <div className="grid grid-cols-1 items-end gap-3 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
          <div className="space-y-2">
            <FieldLabel htmlFor="uc-value">From</FieldLabel>
            <input id="uc-value" inputMode="decimal" value={raw} onChange={(e) => setRaw(e.target.value)} className="num h-14 w-full rounded-xl border border-line bg-surface px-4 text-[22px] text-ink outline-none focus:border-accent/50 focus:ring-4 focus:ring-accent/10" />
            <select aria-label="From unit" value={from} onChange={(e) => setFrom(e.target.value)} className={selectClass}>
              {cat.units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.label}
                </option>
              ))}
            </select>
          </div>
          <button type="button" onClick={() => { setFrom(to); setTo(from); }} aria-label="Swap units" className="mx-auto mb-1 inline-flex h-11 w-11 items-center justify-center rounded-full border border-line text-ink-2 hover:border-line-strong hover:text-ink md:mb-14">
            <ArrowLeftRight className="h-4 w-4" />
          </button>
          <div className="space-y-2">
            <FieldLabel>To</FieldLabel>
            <div className="num flex h-14 items-center justify-between gap-2 rounded-xl border border-transparent bg-accent-soft px-4 text-[22px] font-medium text-ink">
              <span className="truncate" aria-live="polite">{ok ? show(result) : "—"}</span>
              {ok ? <CopyButton value={show(result).replace(/,/g, "")} /> : null}
            </div>
            <select aria-label="To unit" value={to} onChange={(e) => setTo(e.target.value)} className={selectClass}>
              {cat.units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        {ok ? (
          <p className="text-[14px] text-muted">
            {show(value)} {unitLabel(from).replace(/\s*\(.*\)$/, "").toLowerCase()} = <span className="text-ink">{show(result)}</span> {unitLabel(to).replace(/\s*\(.*\)$/, "").toLowerCase()}
          </p>
        ) : null}
      </Panel>
      {ok ? (
        <Panel title={`${show(value)} ${unitLabel(from).replace(/\s*\(.*\)$/, "").toLowerCase()} in every ${cat.label.toLowerCase()} unit`}>
          <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {cat.units
              .filter((u) => u.id !== from)
              .map((u) => (
                <div key={u.id} className="rounded-xl border border-line px-3 py-2.5">
                  <dt className="text-[12px] text-muted">{u.label}</dt>
                  <dd className="num text-[16px] font-medium text-ink">{show(convert(cat, value, from, u.id))}</dd>
                </div>
              ))}
          </dl>
        </Panel>
      ) : null}
    </div>
  );
}

/* ——— Time zones ——— */

// A fixed list (rather than the browser's full list) so server and browser render the same options.
const ZONES: { tz: string; label: string }[] = [
  { tz: "UTC", label: "UTC" },
  { tz: "America/Los_Angeles", label: "Los Angeles, San Francisco (Pacific)" },
  { tz: "America/Denver", label: "Denver (Mountain)" },
  { tz: "America/Phoenix", label: "Phoenix (Arizona)" },
  { tz: "America/Chicago", label: "Chicago, Dallas (Central)" },
  { tz: "America/New_York", label: "New York, Toronto (Eastern)" },
  { tz: "America/Halifax", label: "Halifax (Atlantic)" },
  { tz: "America/Anchorage", label: "Anchorage (Alaska)" },
  { tz: "Pacific/Honolulu", label: "Honolulu (Hawaii)" },
  { tz: "America/Mexico_City", label: "Mexico City" },
  { tz: "America/Bogota", label: "Bogotá, Lima" },
  { tz: "America/Sao_Paulo", label: "São Paulo" },
  { tz: "America/Argentina/Buenos_Aires", label: "Buenos Aires" },
  { tz: "Europe/London", label: "London, Dublin, Lisbon" },
  { tz: "Europe/Paris", label: "Paris, Berlin, Madrid, Rome" },
  { tz: "Europe/Amsterdam", label: "Amsterdam, Brussels" },
  { tz: "Europe/Athens", label: "Athens, Helsinki, Kyiv" },
  { tz: "Europe/Istanbul", label: "Istanbul" },
  { tz: "Europe/Moscow", label: "Moscow" },
  { tz: "Africa/Lagos", label: "Lagos" },
  { tz: "Africa/Cairo", label: "Cairo" },
  { tz: "Africa/Johannesburg", label: "Johannesburg" },
  { tz: "Africa/Nairobi", label: "Nairobi" },
  { tz: "Asia/Riyadh", label: "Riyadh" },
  { tz: "Asia/Dubai", label: "Dubai, Abu Dhabi" },
  { tz: "Asia/Tehran", label: "Tehran" },
  { tz: "Asia/Karachi", label: "Karachi, Lahore, Islamabad" },
  { tz: "Asia/Kolkata", label: "India (Mumbai, Delhi)" },
  { tz: "Asia/Kathmandu", label: "Kathmandu" },
  { tz: "Asia/Dhaka", label: "Dhaka" },
  { tz: "Asia/Bangkok", label: "Bangkok, Jakarta, Hanoi" },
  { tz: "Asia/Singapore", label: "Singapore, Kuala Lumpur" },
  { tz: "Asia/Shanghai", label: "Beijing, Shanghai" },
  { tz: "Asia/Hong_Kong", label: "Hong Kong" },
  { tz: "Asia/Manila", label: "Manila" },
  { tz: "Asia/Seoul", label: "Seoul" },
  { tz: "Asia/Tokyo", label: "Tokyo" },
  { tz: "Australia/Perth", label: "Perth" },
  { tz: "Australia/Adelaide", label: "Adelaide" },
  { tz: "Australia/Sydney", label: "Sydney, Melbourne" },
  { tz: "Pacific/Auckland", label: "Auckland" },
];
const zoneLabel = (tz: string) => ZONES.find((z) => z.tz === tz)?.label ?? tz.replace(/_/g, " ");

/** Minutes the zone is ahead of UTC at instant `t`. */
function offsetMinutes(t: number, tz: string): number {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: tz, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" }).formatToParts(new Date(t));
  const get = (k: string) => Number(parts.find((p) => p.type === k)?.value);
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
  return Math.round((asUtc - Math.floor(t / 1000) * 1000) / 60_000);
}

/** The instant when the wall clock in `tz` shows this date and time (handles DST changes). */
function zonedToInstant(date: string, time: string, tz: string): number | null {
  const d = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  const t = /^(\d{2}):(\d{2})$/.exec(time);
  if (!d || !t) return null;
  const guess = Date.UTC(+d[1], +d[2] - 1, +d[3], +t[1], +t[2]);
  let instant = guess - offsetMinutes(guess, tz) * 60_000;
  const second = offsetMinutes(instant, tz);
  instant = guess - second * 60_000;
  return instant;
}

const gmt = (mins: number) => `GMT${mins >= 0 ? "+" : "−"}${Math.floor(Math.abs(mins) / 60)}${Math.abs(mins) % 60 ? `:${String(Math.abs(mins) % 60).padStart(2, "0")}` : ""}`;

export function TimeZoneConverter() {
  const mounted = useMounted();
  // The visitor's zone and "now" are only known in the browser, so they're filled in after hydration.
  const localTz = mounted ? Intl.DateTimeFormat().resolvedOptions().timeZone : "UTC";
  const [fromTz, setFromTz] = useState<string | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [targets, setTargets] = useState(["UTC", "America/New_York", "Europe/London", "Asia/Dubai", "Asia/Kolkata", "Asia/Tokyo"]);
  const [adding, setAdding] = useState("Australia/Sydney");

  const source = fromTz ?? localTz;
  const nowParts = useMemo(() => {
    if (!mounted) return { d: "", t: "" };
    const p = new Intl.DateTimeFormat("en-CA", { timeZone: source, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).formatToParts(new Date());
    const g = (k: string) => p.find((x) => x.type === k)?.value ?? "";
    return { d: `${g("year")}-${g("month")}-${g("day")}`, t: `${g("hour")}:${g("minute")}` };
  }, [mounted, source]);
  const d = date ?? nowParts.d;
  const t = time ?? nowParts.t;
  const instant = mounted ? zonedToInstant(d, t, source) : null;
  const sourceDay = instant !== null ? new Date(instant + offsetMinutes(instant, source) * 60_000).getUTCDate() : 0;
  const zoneOptions = ZONES.some((z) => z.tz === localTz) ? ZONES : [{ tz: localTz, label: `${localTz.replace(/_/g, " ")} (your time zone)` }, ...ZONES];

  return (
    <div className="space-y-4">
      <Panel className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,0.8fr)]">
        <div>
          <FieldLabel htmlFor="tz-from">Time zone</FieldLabel>
          <select id="tz-from" value={source} onChange={(e) => setFromTz(e.target.value)} className={selectClass}>
            {zoneOptions.map((z) => (
              <option key={z.tz} value={z.tz}>
                {z.label}
                {mounted && z.tz === localTz ? " — your time zone" : ""}
              </option>
            ))}
          </select>
        </div>
        <div>
          <FieldLabel htmlFor="tz-date">Date</FieldLabel>
          <input id="tz-date" type="date" value={d} onChange={(e) => setDate(e.target.value)} className={selectClass} />
        </div>
        <div>
          <FieldLabel htmlFor="tz-time">Time</FieldLabel>
          <input id="tz-time" type="time" value={t} onChange={(e) => setTime(e.target.value)} className={selectClass} />
        </div>
        <div className="md:col-span-3">
          <button type="button" className="chip" onClick={() => { setDate(null); setTime(null); }}>
            Use the current time
          </button>
        </div>
      </Panel>
      <Panel title="Same moment in other time zones">
        <ul className="divide-y divide-line">
          {targets.map((tz) => {
            let text = "—";
            let off = "";
            let dayNote = "";
            if (instant !== null) {
              const mins = offsetMinutes(instant, tz);
              off = gmt(mins);
              text = new Intl.DateTimeFormat("en-US", { timeZone: tz, weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(instant));
              const day = new Date(instant + mins * 60_000).getUTCDate();
              if (day !== sourceDay) dayNote = new Date(instant + mins * 60_000).getTime() > new Date(instant + offsetMinutes(instant, source) * 60_000).getTime() ? "next day" : "previous day";
            }
            return (
              <li key={tz} className="flex items-center gap-3 py-3">
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14.5px] font-medium text-ink">{zoneLabel(tz)}</span>
                  <span className="block text-[12.5px] text-muted">{off}</span>
                </span>
                <span className="text-right">
                  <span className="num block text-[16px] font-medium text-ink">{text}</span>
                  {dayNote ? <span className="block text-[12px] text-accent">{dayNote}</span> : null}
                </span>
                <button type="button" onClick={() => setTargets((ts) => ts.filter((x) => x !== tz))} aria-label={`Remove ${zoneLabel(tz)}`} className="rounded-full p-1.5 text-muted hover:bg-bg-subtle hover:text-ink">
                  <X className="h-4 w-4" />
                </button>
              </li>
            );
          })}
        </ul>
        <div className="mt-4 flex flex-col gap-2 border-t border-line pt-4 sm:flex-row">
          <select aria-label="Time zone to add" value={adding} onChange={(e) => setAdding(e.target.value)} className={selectClass}>
            {ZONES.filter((z) => !targets.includes(z.tz)).map((z) => (
              <option key={z.tz} value={z.tz}>
                {z.label}
              </option>
            ))}
          </select>
          <button type="button" className="chip h-12 shrink-0 justify-center" onClick={() => !targets.includes(adding) && setTargets((ts) => [...ts, adding])} disabled={targets.includes(adding)}>
            <Plus aria-hidden className="h-3.5 w-3.5" /> Add
          </button>
        </div>
      </Panel>
    </div>
  );
}
