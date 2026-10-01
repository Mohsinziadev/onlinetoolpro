"use client";

import { useEffect, useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Choice, ColorField, DownloadButton, ErrorNote, FieldLabel, OutputBox, Panel, Slider, TextField, Toggle, TwoPane, saveBlob, saveText, useMounted } from "@/components/kit";
import { CopyButton } from "@/components/tool/copy-button";
import { NumberField, ResultHero } from "@/components/calculators/calc-ui";
import { contrast, parseColor } from "@/lib/color";
import { cn } from "@/lib/utils";

const inputClass =
  "h-11 w-full rounded-xl border border-line bg-surface-2 px-3.5 text-[15px] text-ink outline-none transition-[border-color,box-shadow] placeholder:text-faint focus:border-accent/50 focus:ring-4 focus:ring-accent/10";

function Field({ label, value, onChange, placeholder, hint, type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; hint?: string; type?: string }) {
  const id = `f-${label.replace(/\W+/g, "-").toLowerCase()}`;
  return (
    <div>
      <FieldLabel htmlFor={id} hint={hint}>
        {label}
      </FieldLabel>
      <input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} spellCheck={false} className={inputClass} />
    </div>
  );
}

/** Uniform random integer in [0, max) from the secure generator (rejection sampling avoids bias). */
function randInt(max: number): number {
  const limit = Math.floor(0x100000000 / max) * max;
  const buf = new Uint32Array(1);
  do crypto.getRandomValues(buf);
  while (buf[0] >= limit);
  return buf[0] % max;
}

/* ——— QR code ——— */

type QrKind = "url" | "text" | "wifi" | "email";

export function QrCodeGenerator() {
  const [kind, setKind] = useState<QrKind>("url");
  const [text, setText] = useState("https://");
  const [ssid, setSsid] = useState("");
  const [pass, setPass] = useState("");
  const [sec, setSec] = useState<"WPA" | "WEP" | "nopass">("WPA");
  const [hidden, setHidden] = useState(false);
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [fg, setFg] = useState("#0a2119");
  const [bg, setBg] = useState("#ffffff");
  const [level, setLevel] = useState<"L" | "M" | "Q" | "H">("M");
  const [size, setSize] = useState(512);
  const [png, setPng] = useState("");
  const [svg, setSvg] = useState("");
  const [err, setErr] = useState("");

  const esc = (s: string) => s.replace(/([\\;,:"])/g, "\\$1");
  const payload =
    kind === "wifi"
      ? ssid
        ? `WIFI:T:${sec};S:${esc(ssid)};${sec === "nopass" ? "" : `P:${esc(pass)};`}${hidden ? "H:true;" : ""};`
        : ""
      : kind === "email"
        ? email
          ? `mailto:${email}${subject ? `?subject=${encodeURIComponent(subject)}` : ""}`
          : ""
        : text.trim() === "https://"
          ? ""
          : text.trim();

  useEffect(() => {
    if (!payload) return;
    let live = true;
    import("qrcode").then(async (QR) => {
      try {
        const opts = { errorCorrectionLevel: level, margin: 2, color: { dark: fg, light: bg } };
        const [p, s] = await Promise.all([QR.toDataURL(payload, { ...opts, width: size }), QR.toString(payload, { ...opts, type: "svg" })]);
        if (!live) return;
        setPng(p);
        setSvg(s);
        setErr("");
      } catch {
        if (live) setErr("That's too much content for a QR code. Try something shorter.");
      }
    });
    return () => {
      live = false;
    };
  }, [payload, fg, bg, level, size]);

  const fgc = parseColor(fg);
  const bgc = parseColor(bg);
  const lowContrast = fgc && bgc ? contrast(fgc, bgc) < 4 : false;

  return (
    <TwoPane
      left={
        <Panel className="space-y-5">
          <Choice label="What should it open?" value={kind} onChange={setKind} options={[{ value: "url", label: "Website link" }, { value: "text", label: "Text" }, { value: "wifi", label: "Wi-Fi" }, { value: "email", label: "Email" }]} />
          {kind === "url" || kind === "text" ? (
            kind === "url" ? <Field label="Link" value={text} onChange={setText} placeholder="https://example.com" type="url" /> : <TextField label="Text" value={text === "https://" ? "" : text} onChange={setText} rows={4} />
          ) : kind === "wifi" ? (
            <div className="space-y-4">
              <Field label="Network name (SSID)" value={ssid} onChange={setSsid} />
              <Choice label="Security" value={sec} onChange={setSec} options={[{ value: "WPA", label: "WPA/WPA2/WPA3" }, { value: "WEP", label: "WEP" }, { value: "nopass", label: "No password" }]} />
              {sec !== "nopass" ? <Field label="Password" value={pass} onChange={setPass} /> : null}
              <Toggle label="Hidden network (doesn't broadcast its name)" checked={hidden} onChange={setHidden} />
            </div>
          ) : (
            <div className="space-y-4">
              <Field label="Email address" value={email} onChange={setEmail} type="email" />
              <Field label="Subject (optional)" value={subject} onChange={setSubject} />
            </div>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ColorField label="Code color" value={fg} onChange={setFg} />
            <ColorField label="Background" value={bg} onChange={setBg} />
          </div>
          <Choice label="Error correction" value={level} onChange={setLevel} options={[{ value: "L", label: "Low" }, { value: "M", label: "Medium" }, { value: "Q", label: "High" }, { value: "H", label: "Highest" }]} />
          <Slider label="PNG size" value={size} onChange={setSize} min={128} max={2048} step={64} unit=" px" />
        </Panel>
      }
      right={
        <Panel className="space-y-4">
          {err ? <ErrorNote>{err}</ErrorNote> : null}
          {payload && png && !err ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={png} alt="Your QR code" className="mx-auto w-full max-w-[320px] rounded-2xl border border-line" />
              {lowContrast ? <p className="text-[13px] text-warning">The colors are quite close — some phones may struggle to scan it. Dark code on a light background works best.</p> : null}
              <div className="flex flex-wrap gap-2">
                <DownloadButton onClick={() => fetch(png).then((r) => r.blob()).then((b) => saveBlob(b, "qr-code.png"))}>PNG</DownloadButton>
                <DownloadButton onClick={() => saveText(svg, "qr-code.svg", "image/svg+xml")}>SVG</DownloadButton>
              </div>
              <p className="text-[12.5px] text-muted">Test the code with your own phone before printing it. This QR code never expires — it contains your content directly.</p>
            </>
          ) : (
            <p className="text-[14px] text-muted">Your QR code will appear here.</p>
          )}
        </Panel>
      }
    />
  );
}

/* ——— Password generator ——— */

const SETS = { lower: "abcdefghijklmnopqrstuvwxyz", upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ", digits: "0123456789", symbols: "!@#$%^&*()-_=+[]{};:,.?/" };
const AMBIGUOUS = /[Il1O0o]/g;

export function PasswordGenerator() {
  const [length, setLength] = useState(20);
  const [use, setUse] = useState({ lower: true, upper: true, digits: true, symbols: true });
  const [noAmbiguous, setNoAmbiguous] = useState(false);
  const [count, setCount] = useState(1);
  const [seed, setSeed] = useState(0);
  const mounted = useMounted();

  const pool = (Object.keys(SETS) as (keyof typeof SETS)[]).filter((k) => use[k]).map((k) => (noAmbiguous ? SETS[k].replace(AMBIGUOUS, "") : SETS[k]));
  const all = pool.join("");
  const passwords = useMemo(() => {
    void seed;
    if (!mounted || !all) return [];
    return Array.from({ length: count }, () => {
      // One character from each chosen set, the rest from all, then shuffle.
      const chars = pool.map((set) => set[randInt(set.length)]);
      while (chars.length < length) chars.push(all[randInt(all.length)]);
      for (let i = chars.length - 1; i > 0; i--) {
        const j = randInt(i + 1);
        [chars[i], chars[j]] = [chars[j], chars[i]];
      }
      return chars.slice(0, length).join("");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, all, length, count, seed]);

  const bits = all ? Math.round(length * Math.log2(all.length)) : 0;
  const strength = bits >= 100 ? ["Very strong", "text-success"] : bits >= 70 ? ["Strong", "text-success"] : bits >= 50 ? ["Fair", "text-warning"] : ["Weak", "text-danger"];

  return (
    <TwoPane
      left={
        <Panel className="space-y-5">
          <Slider label="Length" value={length} onChange={setLength} min={6} max={64} />
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Toggle label="Lowercase (a–z)" checked={use.lower} onChange={(v) => setUse((u) => ({ ...u, lower: v }))} />
            <Toggle label="Uppercase (A–Z)" checked={use.upper} onChange={(v) => setUse((u) => ({ ...u, upper: v }))} />
            <Toggle label="Numbers (0–9)" checked={use.digits} onChange={(v) => setUse((u) => ({ ...u, digits: v }))} />
            <Toggle label="Symbols (!@#…)" checked={use.symbols} onChange={(v) => setUse((u) => ({ ...u, symbols: v }))} />
            <Toggle label="Avoid look-alikes (I, l, 1, O, 0)" checked={noAmbiguous} onChange={setNoAmbiguous} />
          </div>
          <Slider label="How many" value={count} onChange={setCount} min={1} max={20} />
          {!all ? <ErrorNote>Choose at least one type of character.</ErrorNote> : null}
        </Panel>
      }
      right={
        <Panel className="space-y-4">
          <p className="text-[14px] text-muted">
            Strength: <span className={cn("font-medium", strength[1])}>{strength[0]}</span> · about {bits} bits
          </p>
          <ul className="space-y-2">
            {passwords.map((p, i) => (
              <li key={i} className="flex items-center gap-2 rounded-xl border border-line bg-surface-2 py-1.5 pr-1.5 pl-3.5">
                <code className="min-w-0 flex-1 truncate font-mono text-[15px] text-ink">{p}</code>
                <CopyButton value={p} label="Copy password" />
              </li>
            ))}
          </ul>
          <button type="button" onClick={() => setSeed((s) => s + 1)} className="chip">
            <RefreshCw aria-hidden className="h-3.5 w-3.5" /> Generate again
          </button>
          <p className="text-[12.5px] text-muted">Created with your browser&apos;s secure random generator. Nothing is sent or saved.</p>
        </Panel>
      }
    />
  );
}

/* ——— List randomizer ——— */

export function ListRandomizer() {
  const [text, setText] = useState("");
  const [pick, setPick] = useState(1);
  const [mode, setMode] = useState<"shuffle" | "pick">("shuffle");
  const [seed, setSeed] = useState(0);
  const mounted = useMounted();
  const items = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  const result = useMemo(() => {
    void seed;
    if (!mounted) return [];
    const a = [...items];
    for (let i = a.length - 1; i > 0; i--) {
      const j = randInt(i + 1);
      [a[i], a[j]] = [a[j], a[i]];
    }
    return mode === "pick" ? a.slice(0, Math.min(pick, a.length)) : a;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, text, mode, pick, seed]);

  return (
    <TwoPane
      left={
        <Panel className="space-y-4">
          <TextField label="Your list — one item per line" value={text} onChange={setText} rows={10} placeholder={"Alice\nBen\nChloe\nDev"} autoFocus hint={`${items.length} items`} />
          <Choice label="What to do" value={mode} onChange={setMode} options={[{ value: "shuffle", label: "Shuffle the list" }, { value: "pick", label: "Pick winners" }]} />
          {mode === "pick" ? <Slider label="How many to pick" value={pick} onChange={setPick} min={1} max={Math.max(1, items.length)} /> : null}
          <button type="button" onClick={() => setSeed((s) => s + 1)} className="chip" disabled={!items.length}>
            <RefreshCw aria-hidden className="h-3.5 w-3.5" /> Randomize again
          </button>
        </Panel>
      }
      right={
        <Panel>
          {items.length ? (
            mode === "pick" ? (
              <div className="space-y-2">
                <p className="text-[14px] text-muted">{result.length === 1 ? "The winner is" : "The winners are"}</p>
                {result.map((r, i) => (
                  <p key={i} className="rounded-2xl border border-accent/25 bg-accent-soft px-4 py-3 text-[20px] font-medium text-ink">
                    {r}
                  </p>
                ))}
              </div>
            ) : (
              <OutputBox label="Shuffled list" value={result.join("\n")} rows={12} />
            )
          ) : (
            <p className="text-[14px] text-muted">Add a few items to shuffle or pick from.</p>
          )}
        </Panel>
      }
    />
  );
}

/* ——— Random number ——— */

export function RandomNumberGenerator() {
  const [min, setMin] = useState("1");
  const [max, setMax] = useState("100");
  const [count, setCount] = useState(1);
  const [unique, setUnique] = useState(true);
  const [seed, setSeed] = useState(0);
  const mounted = useMounted();
  const lo = Math.ceil(Number(min));
  const hi = Math.floor(Number(max));
  const valid = Number.isFinite(lo) && Number.isFinite(hi) && hi >= lo && hi - lo < 1e9;
  const range = hi - lo + 1;
  const tooMany = unique && count > range;

  const numbers = useMemo(() => {
    void seed;
    if (!mounted || !valid || tooMany) return [];
    const out = new Set<number>();
    const list: number[] = [];
    while (list.length < count) {
      const n = lo + randInt(range);
      if (unique) {
        if (out.has(n)) continue;
        out.add(n);
      }
      list.push(n);
    }
    return list;
  }, [mounted, valid, tooMany, lo, range, count, unique, seed]);

  return (
    <TwoPane
      left={
        <Panel className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <NumberField label="Minimum" value={min} onChange={setMin} inputMode="numeric" />
            <NumberField label="Maximum" value={max} onChange={setMax} inputMode="numeric" />
          </div>
          <Slider label="How many numbers" value={count} onChange={setCount} min={1} max={100} />
          <Toggle label="No repeats" checked={unique} onChange={setUnique} />
          {!valid ? <ErrorNote>The maximum must be bigger than the minimum.</ErrorNote> : tooMany ? <ErrorNote>There are only {range} different numbers in that range.</ErrorNote> : null}
          <button type="button" onClick={() => setSeed((s) => s + 1)} className="chip">
            <RefreshCw aria-hidden className="h-3.5 w-3.5" /> Generate again
          </button>
        </Panel>
      }
      right={
        <Panel>
          {count === 1 && numbers.length ? (
            <ResultHero label="Your number" value={<span className="num">{numbers[0]}</span>} />
          ) : (
            <OutputBox label="Your numbers" value={numbers.join(", ")} rows={8} />
          )}
        </Panel>
      }
    />
  );
}

/* ——— Percentage calculator ——— */

const num = (s: string) => (s.trim() === "" ? NaN : Number(s.replace(/,/g, "")));
const fmt = (n: number) => (Number.isFinite(n) ? n.toLocaleString(undefined, { maximumFractionDigits: 4 }) : "—");

function Calc({ title, a, b, setA, setB, labels, result, formula }: { title: string; a: string; b: string; setA: (v: string) => void; setB: (v: string) => void; labels: [string, string]; result: string; formula: string }) {
  return (
    <Panel title={title}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <NumberField label={labels[0]} value={a} onChange={setA} />
        <NumberField label={labels[1]} value={b} onChange={setB} />
        <div className="rounded-xl bg-accent-soft px-4 py-3 text-right sm:min-w-36">
          <p className="text-[12px] text-muted">Answer</p>
          <p className="num text-[20px] font-medium text-ink">{result}</p>
        </div>
      </div>
      <p className="mt-2 font-mono text-[12.5px] text-muted">{formula}</p>
    </Panel>
  );
}

export function PercentageCalculator() {
  const [a1, setA1] = useState("20");
  const [b1, setB1] = useState("150");
  const [a2, setA2] = useState("30");
  const [b2, setB2] = useState("120");
  const [a3, setA3] = useState("80");
  const [b3, setB3] = useState("100");
  const [a4, setA4] = useState("250");
  const [b4, setB4] = useState("15");
  const r1 = (num(a1) / 100) * num(b1);
  const r2 = (num(a2) / num(b2)) * 100;
  const r3 = ((num(b3) - num(a3)) / Math.abs(num(a3))) * 100;
  const r4 = num(a4) * (1 + num(b4) / 100);
  const r4b = num(a4) * (1 - num(b4) / 100);
  return (
    <div className="space-y-4">
      <Calc title="What is X% of Y?" a={a1} b={b1} setA={setA1} setB={setB1} labels={["Percentage (%)", "Of the number"]} result={fmt(r1)} formula={`${a1 || "X"} ÷ 100 × ${b1 || "Y"}`} />
      <Calc title="X is what percent of Y?" a={a2} b={b2} setA={setA2} setB={setB2} labels={["Number", "Of the total"]} result={`${fmt(r2)}%`} formula={`${a2 || "X"} ÷ ${b2 || "Y"} × 100`} />
      <Calc title="Percentage change from X to Y" a={a3} b={b3} setA={setA3} setB={setB3} labels={["From", "To"]} result={`${Number.isFinite(r3) && r3 > 0 ? "+" : ""}${fmt(r3)}%`} formula={`(${b3 || "Y"} − ${a3 || "X"}) ÷ |${a3 || "X"}| × 100`} />
      <Calc title="Increase or decrease X by Y%" a={a4} b={b4} setA={setA4} setB={setB4} labels={["Number", "Percentage (%)"]} result={`${fmt(r4)} / ${fmt(r4b)}`} formula={`Increase: X × (1 + Y ÷ 100) · Decrease: X × (1 − Y ÷ 100)`} />
    </div>
  );
}

/* ——— Age calculator ——— */

function diffYMD(from: Date, to: Date) {
  let y = to.getFullYear() - from.getFullYear();
  let m = to.getMonth() - from.getMonth();
  let d = to.getDate() - from.getDate();
  if (d < 0) {
    m--;
    d += new Date(to.getFullYear(), to.getMonth(), 0).getDate();
  }
  if (m < 0) {
    y--;
    m += 12;
  }
  return { y, m, d };
}
const parseDay = (s: string) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null;
};
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export function AgeCalculator() {
  const mounted = useMounted();
  const [birth, setBirth] = useState("");
  const [asOfRaw, setAsOf] = useState("");
  const asOf = asOfRaw || (mounted ? iso(new Date()) : "");
  const b = parseDay(birth);
  const t = parseDay(asOf);
  const ok = b && t && b <= t;
  const age = ok ? diffYMD(b, t) : null;
  const days = ok ? Math.round((t.getTime() - b.getTime()) / 86_400_000) : 0;
  let next: Date | null = null;
  if (b && t) {
    next = new Date(t.getFullYear(), b.getMonth(), b.getDate());
    if (next < t) next = new Date(t.getFullYear() + 1, b.getMonth(), b.getDate());
  }
  const untilNext = next && t ? Math.round((next.getTime() - t.getTime()) / 86_400_000) : 0;

  return (
    <TwoPane
      left={
        <Panel className="space-y-4">
          <Field label="Date of birth" value={birth} onChange={setBirth} type="date" />
          <Field label="Age on this date" value={asOf} onChange={setAsOf} type="date" hint="Today by default" />
          {birth && t && b && b > t ? <ErrorNote>The birth date is after the other date.</ErrorNote> : null}
        </Panel>
      }
      right={
        <Panel className="space-y-4">
          {age ? (
            <>
              <ResultHero label="Age" value={`${age.y} years, ${age.m} months, ${age.d} days`} />
              <dl className="grid grid-cols-2 gap-2">
                {[
                  ["Total months", (age.y * 12 + age.m).toLocaleString()],
                  ["Total weeks", Math.floor(days / 7).toLocaleString()],
                  ["Total days", days.toLocaleString()],
                  ["Next birthday", untilNext === 0 ? "Today! 🎉" : `in ${untilNext} days`],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-2xl border border-line p-3">
                    <dt className="text-[12px] text-muted">{k}</dt>
                    <dd className="num text-[17px] font-medium text-ink">{v}</dd>
                  </div>
                ))}
              </dl>
            </>
          ) : (
            <p className="text-[14px] text-muted">Enter a date of birth to see the exact age.</p>
          )}
        </Panel>
      }
    />
  );
}

/* ——— Meta tag generator ——— */

const escAttr = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

export function MetaTagGenerator() {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [url, setUrl] = useState("");
  const [image, setImage] = useState("");
  const [site, setSite] = useState("");
  const [twitter, setTwitter] = useState("");
  const [type, setType] = useState<"website" | "article">("website");

  const tags = [
    title && `<title>${escAttr(title)}</title>`,
    desc && `<meta name="description" content="${escAttr(desc)}" />`,
    url && `<link rel="canonical" href="${escAttr(url)}" />`,
    "",
    `<meta property="og:type" content="${type}" />`,
    title && `<meta property="og:title" content="${escAttr(title)}" />`,
    desc && `<meta property="og:description" content="${escAttr(desc)}" />`,
    url && `<meta property="og:url" content="${escAttr(url)}" />`,
    image && `<meta property="og:image" content="${escAttr(image)}" />`,
    site && `<meta property="og:site_name" content="${escAttr(site)}" />`,
    "",
    `<meta name="twitter:card" content="${image ? "summary_large_image" : "summary"}" />`,
    title && `<meta name="twitter:title" content="${escAttr(title)}" />`,
    desc && `<meta name="twitter:description" content="${escAttr(desc)}" />`,
    image && `<meta name="twitter:image" content="${escAttr(image)}" />`,
    twitter && `<meta name="twitter:site" content="${escAttr(twitter.startsWith("@") ? twitter : "@" + twitter)}" />`,
  ]
    .filter((t): t is string => typeof t === "string")
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  const host = (() => {
    try {
      return url ? new URL(url).hostname.replace(/^www\./, "") : "example.com";
    } catch {
      return "example.com";
    }
  })();

  return (
    <div className="space-y-4">
      <TwoPane
        left={
          <Panel className="space-y-4">
            <Field label="Page title" value={title} onChange={setTitle} hint={`${title.length} / about 60`} placeholder="Free Online Tools for Everyday Tasks" />
            <div>
              <TextField label="Description" value={desc} onChange={setDesc} rows={3} hint={`${desc.length} / about 155`} placeholder="What the page offers, in one or two sentences." />
            </div>
            <Field label="Page URL" value={url} onChange={setUrl} placeholder="https://example.com/page" type="url" />
            <Field label="Share image URL (1200 × 630 recommended)" value={image} onChange={setImage} placeholder="https://example.com/og.png" type="url" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Site name" value={site} onChange={setSite} />
              <Field label="X / Twitter handle" value={twitter} onChange={setTwitter} placeholder="@yoursite" />
            </div>
            <Choice label="Page type" value={type} onChange={setType} options={[{ value: "website", label: "Website" }, { value: "article", label: "Article" }]} />
          </Panel>
        }
        right={
          <div className="space-y-4">
            <Panel title="Google result preview">
              <div className="rounded-2xl border border-line bg-white p-4 text-left dark:bg-[#202124]">
                <p className="truncate text-[13px] text-[#4d5156] dark:text-[#bdc1c6]">{host}</p>
                <p className="mt-1 line-clamp-1 text-[19px] text-[#1a0dab] dark:text-[#8ab4f8]">{title || "Your page title"}</p>
                <p className="mt-1 line-clamp-2 text-[14px] leading-[1.45] text-[#4d5156] dark:text-[#bdc1c6]">{desc || "Your description appears here. Google may show different text if it thinks another part of the page answers the search better."}</p>
              </div>
              {title.length > 60 ? <p className="mt-2 text-[13px] text-warning">Titles longer than about 60 characters are often cut off.</p> : null}
              {desc.length > 160 ? <p className="mt-1 text-[13px] text-warning">Descriptions longer than about 155–160 characters are often cut off.</p> : null}
            </Panel>
            <Panel title="Social share preview">
              <div className="overflow-hidden rounded-2xl border border-line">
                {image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={image} alt="" className="aspect-[1.91/1] w-full bg-bg-subtle object-cover" />
                ) : (
                  <div className="flex aspect-[1.91/1] items-center justify-center bg-bg-subtle text-[13px] text-muted">No share image</div>
                )}
                <div className="bg-surface-2 p-3">
                  <p className="text-[12px] text-muted uppercase">{host}</p>
                  <p className="line-clamp-1 text-[15px] font-medium text-ink">{title || "Your page title"}</p>
                  <p className="line-clamp-1 text-[13px] text-muted">{desc}</p>
                </div>
              </div>
            </Panel>
          </div>
        }
      />
      <Panel>
        <OutputBox label="Paste these into your page's <head>" value={title || desc ? tags : ""} rows={14} mono filename="meta-tags.html" mime="text/html" />
      </Panel>
    </div>
  );
}

/* ——— Slug generator ——— */

const STOP = new Set("a an and are as at be but by for from in into is it of on or the to with".split(" "));

export function slugify(s: string, { sep = "-", dropStop = false, max = 0 }: { sep?: string; dropStop?: boolean; max?: number } = {}) {
  let words = s
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (dropStop && words.length > 2) words = words.filter((w) => !STOP.has(w));
  let slug = words.join(sep);
  if (max && slug.length > max) slug = slug.slice(0, max).replace(new RegExp(`\\${sep}[^\\${sep}]*$`), "") || slug.slice(0, max);
  return slug;
}

export function SlugGenerator() {
  const [text, setText] = useState("");
  const [sep, setSep] = useState<"-" | "_">("-");
  const [dropStop, setDropStop] = useState(false);
  const [short, setShort] = useState(false);
  const out = text
    .split(/\r?\n/)
    .map((l) => (l.trim() ? slugify(l, { sep, dropStop, max: short ? 60 : 0 }) : ""))
    .join("\n")
    .trim();
  return (
    <TwoPane
      left={
        <Panel className="space-y-4">
          <TextField label="Titles — one per line" value={text} onChange={setText} rows={8} placeholder={"How to Download a YouTube Thumbnail (2026 Guide)\nCafé & Bar Menu Ideas"} autoFocus />
          <Choice label="Separator" value={sep} onChange={setSep} options={[{ value: "-", label: "Hyphens (recommended)" }, { value: "_", label: "Underscores" }]} />
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Toggle label="Remove small words (a, the, of…)" checked={dropStop} onChange={setDropStop} />
            <Toggle label="Keep it under 60 characters" checked={short} onChange={setShort} />
          </div>
        </Panel>
      }
      right={
        <Panel>
          <OutputBox label="URL slugs" value={out} rows={10} mono />
        </Panel>
      }
    />
  );
}

/* ——— UTM builder ——— */

export function UtmBuilder() {
  const [url, setUrl] = useState("");
  const [f, setF] = useState({ source: "", medium: "", campaign: "", term: "", content: "" });
  const [lower, setLower] = useState(true);
  const set = (k: keyof typeof f) => (v: string) => setF((p) => ({ ...p, [k]: v }));

  let built = "";
  let err = "";
  if (url.trim()) {
    try {
      const u = new URL(/^https?:\/\//i.test(url.trim()) ? url.trim() : `https://${url.trim()}`);
      (Object.entries(f) as [keyof typeof f, string][]).forEach(([k, v]) => {
        const val = lower ? v.trim().toLowerCase().replace(/\s+/g, "_") : v.trim();
        if (val) u.searchParams.set(`utm_${k}`, val);
        else u.searchParams.delete(`utm_${k}`);
      });
      built = u.toString();
    } catch {
      err = "That doesn't look like a web address.";
    }
  }
  const missing = url && (!f.source || !f.medium || !f.campaign);

  return (
    <TwoPane
      left={
        <Panel className="space-y-4">
          <Field label="Website URL" value={url} onChange={setUrl} placeholder="https://example.com/landing-page" type="url" />
          <Field label="Source (required)" value={f.source} onChange={set("source")} placeholder="newsletter, google, facebook" hint="Where the traffic comes from" />
          <Field label="Medium (required)" value={f.medium} onChange={set("medium")} placeholder="email, cpc, social" hint="The type of link" />
          <Field label="Campaign (required)" value={f.campaign} onChange={set("campaign")} placeholder="spring_sale" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Term (optional)" value={f.term} onChange={set("term")} placeholder="running+shoes" />
            <Field label="Content (optional)" value={f.content} onChange={set("content")} placeholder="header_button" />
          </div>
          <Toggle label="Lowercase and replace spaces (keeps reports tidy)" checked={lower} onChange={setLower} />
        </Panel>
      }
      right={
        <Panel className="space-y-3">
          {err ? <ErrorNote>{err}</ErrorNote> : null}
          {missing ? <p className="text-[13px] text-warning">Source, medium and campaign are needed for analytics tools to group the visit properly.</p> : null}
          <OutputBox label="Your tracking link" value={built} rows={6} mono />
        </Panel>
      }
    />
  );
}
