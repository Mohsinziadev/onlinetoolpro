"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRightLeft, RefreshCw } from "lucide-react";
import { Choice, ErrorNote, FieldLabel, OutputBox, Panel, Slider, TextField, Toggle, TwoPane, useMounted } from "@/components/kit";
import { CopyButton } from "@/components/tool/copy-button";
import { md5 } from "@/lib/md5";
import { cn } from "@/lib/utils";

type Direction = "encode" | "decode";

function DirectionSwitch({ value, onChange, labels = ["Encode", "Decode"] }: { value: Direction; onChange: (d: Direction) => void; labels?: [string, string] }) {
  return (
    <Choice
      label="Mode"
      value={value}
      onChange={onChange}
      options={[
        { value: "encode", label: labels[0] },
        { value: "decode", label: labels[1] },
      ]}
    />
  );
}

/** Shared shell for "paste → convert → copy" tools. */
function ConvertTool({
  mode,
  setMode,
  input,
  setInput,
  convert,
  labels,
  placeholders,
  filename,
  extra,
}: {
  mode: Direction;
  setMode: (d: Direction) => void;
  input: string;
  setInput: (v: string) => void;
  convert: (s: string, mode: Direction) => string;
  labels?: [string, string];
  placeholders: [string, string];
  filename?: string;
  extra?: React.ReactNode;
}) {
  const result = useMemo(() => {
    if (!input) return { out: "", error: "" };
    try {
      return { out: convert(input, mode), error: "" };
    } catch (e) {
      return { out: "", error: e instanceof Error ? e.message : "That input couldn't be converted." };
    }
  }, [input, mode, convert]);

  return (
    <TwoPane
      left={
        <Panel className="space-y-4">
          <DirectionSwitch value={mode} onChange={setMode} labels={labels} />
          {extra}
          <TextField label={mode === "encode" ? "Plain text" : "Encoded text"} value={input} onChange={setInput} rows={10} mono placeholder={mode === "encode" ? placeholders[0] : placeholders[1]} autoFocus />
        </Panel>
      }
      right={
        <Panel className="space-y-3">
          {result.error ? <ErrorNote>{result.error}</ErrorNote> : null}
          <OutputBox label={mode === "encode" ? "Encoded" : "Decoded"} value={result.out} rows={12} mono filename={filename} />
          <button
            type="button"
            disabled={!result.out}
            onClick={() => {
              setInput(result.out);
              setMode(mode === "encode" ? "decode" : "encode");
            }}
            className="chip disabled:opacity-50"
          >
            <ArrowRightLeft aria-hidden className="h-3.5 w-3.5" /> Use result as input
          </button>
        </Panel>
      }
    />
  );
}

/* ——— JSON formatter ——— */

function describeJsonError(text: string, err: unknown): string {
  const msg = err instanceof Error ? err.message : "Invalid JSON";
  const m = /position (\d+)/i.exec(msg);
  if (m) {
    const pos = Number(m[1]);
    const before = text.slice(0, pos);
    const line = before.split("\n").length;
    const col = pos - before.lastIndexOf("\n");
    return `${msg.replace(/ in JSON at position \d+.*/, "")} — line ${line}, column ${col}.`;
  }
  return msg;
}

function sortKeys(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(sortKeys);
  if (v && typeof v === "object") return Object.fromEntries(Object.keys(v).sort().map((k) => [k, sortKeys((v as Record<string, unknown>)[k])]));
  return v;
}

export function JsonFormatter() {
  const [text, setText] = useState("");
  const [indent, setIndent] = useState<"2" | "4" | "tab" | "min">("2");
  const [sort, setSort] = useState(false);

  const result = useMemo(() => {
    if (!text.trim()) return { out: "", error: "", stats: "" };
    try {
      let value = JSON.parse(text);
      if (sort) value = sortKeys(value);
      const space = indent === "min" ? undefined : indent === "tab" ? "\t" : Number(indent);
      const out = JSON.stringify(value, null, space);
      const kind = Array.isArray(value) ? `array of ${value.length}` : value && typeof value === "object" ? `object with ${Object.keys(value).length} keys` : typeof value;
      return { out, error: "", stats: `Valid JSON · ${kind}` };
    } catch (e) {
      return { out: "", error: describeJsonError(text, e), stats: "" };
    }
  }, [text, indent, sort]);

  return (
    <TwoPane
      left={
        <Panel className="space-y-4">
          <TextField label="Your JSON" value={text} onChange={setText} rows={14} mono placeholder={'{"name":"OnlineToolPro","tools":["json","qr"]}'} autoFocus />
          <Choice
            label="Format"
            value={indent}
            onChange={setIndent}
            options={[
              { value: "2", label: "2 spaces" },
              { value: "4", label: "4 spaces" },
              { value: "tab", label: "Tabs" },
              { value: "min", label: "Minify" },
            ]}
          />
          <Toggle label="Sort keys alphabetically" checked={sort} onChange={setSort} />
        </Panel>
      }
      right={
        <Panel className="space-y-3">
          {result.error ? <ErrorNote>{result.error}</ErrorNote> : result.stats ? <p className="text-[13.5px] font-medium text-success">{result.stats}</p> : null}
          <OutputBox label="Formatted JSON" value={result.out} rows={16} mono filename="formatted.json" mime="application/json" />
        </Panel>
      }
    />
  );
}

/* ——— URL encoder ——— */

export function UrlEncoder() {
  const [mode, setMode] = useState<Direction>("encode");
  const [input, setInput] = useState("");
  const [whole, setWhole] = useState(false);
  const convert = useMemo(
    () => (s: string, m: Direction) => {
      if (m === "encode") return whole ? encodeURI(s) : encodeURIComponent(s);
      try {
        return decodeURIComponent(s.replace(/\+/g, " "));
      } catch {
        throw new Error("This text has a broken % code, so it can't be decoded.");
      }
    },
    [whole],
  );
  return (
    <ConvertTool
      mode={mode}
      setMode={setMode}
      input={input}
      setInput={setInput}
      convert={convert}
      placeholders={["search term & more", "search%20term%20%26%20more"]}
      extra={mode === "encode" ? <Toggle label="Keep a full web address readable (encode only unsafe characters)" checked={whole} onChange={setWhole} /> : null}
    />
  );
}

/* ——— Base64 ——— */

function toBase64(s: string, urlSafe: boolean) {
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  const out = btoa(bin);
  return urlSafe ? out.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "") : out;
}
function fromBase64(s: string) {
  const clean = s.trim().replace(/\s+/g, "").replace(/-/g, "+").replace(/_/g, "/");
  const padded = clean + "=".repeat((4 - (clean.length % 4)) % 4);
  let bin: string;
  try {
    bin = atob(padded);
  } catch {
    throw new Error("This isn't valid Base64 — check for missing or extra characters.");
  }
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder("utf-8", { fatal: false }).decode(bytes);
}

export function Base64Tool() {
  const [mode, setMode] = useState<Direction>("encode");
  const [input, setInput] = useState("");
  const [urlSafe, setUrlSafe] = useState(false);
  const convert = useMemo(() => (s: string, m: Direction) => (m === "encode" ? toBase64(s, urlSafe) : fromBase64(s)), [urlSafe]);
  return (
    <ConvertTool
      mode={mode}
      setMode={setMode}
      input={input}
      setInput={setInput}
      convert={convert}
      placeholders={["Hello, world!", "SGVsbG8sIHdvcmxkIQ=="]}
      extra={mode === "encode" ? <Toggle label="URL-safe (for links and tokens)" checked={urlSafe} onChange={setUrlSafe} /> : null}
    />
  );
}

/* ——— HTML entities ——— */

const ENT: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

export function HtmlEntities() {
  const [mode, setMode] = useState<Direction>("encode");
  const [input, setInput] = useState("");
  const [allNonAscii, setAllNonAscii] = useState(false);
  const convert = useMemo(
    () => (s: string, m: Direction) => {
      if (m === "encode") {
        const basic = s.replace(/[&<>"']/g, (c) => ENT[c]);
        return allNonAscii ? basic.replace(/[^\x00-\x7f]/gu, (c) => `&#${c.codePointAt(0)};`) : basic;
      }
      const el = document.createElement("textarea");
      el.innerHTML = s;
      return el.value;
    },
    [allNonAscii],
  );
  return (
    <ConvertTool
      mode={mode}
      setMode={setMode}
      input={input}
      setInput={setInput}
      convert={convert}
      placeholders={['<a href="/">Tom & Jerry</a>', "&lt;p&gt;Caf&#233; &amp; bar&lt;/p&gt;"]}
      extra={mode === "encode" ? <Toggle label="Also encode accents and symbols (é → &#233;)" checked={allNonAscii} onChange={setAllNonAscii} /> : null}
    />
  );
}

/* ——— Hash generator ——— */

const ALGOS = ["MD5", "SHA-1", "SHA-256", "SHA-384", "SHA-512"] as const;
type Algo = (typeof ALGOS)[number];

async function digest(algo: Algo, text: string): Promise<string> {
  if (algo === "MD5") return md5(text);
  const buf = await crypto.subtle.digest(algo, new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
}

export function HashGenerator() {
  const [text, setText] = useState("");
  const [upper, setUpper] = useState(false);
  const [hashes, setHashes] = useState<Record<Algo, string> | null>(null);

  useEffect(() => {
    let live = true;
    Promise.all(ALGOS.map((a) => digest(a, text))).then((list) => {
      if (live) setHashes(Object.fromEntries(ALGOS.map((a, i) => [a, list[i]])) as Record<Algo, string>);
    });
    return () => {
      live = false;
    };
  }, [text]);

  return (
    <div className="space-y-4">
      <Panel>
        <TextField label="Text to hash" value={text} onChange={setText} rows={5} placeholder="Type or paste text…" autoFocus />
        <div className="mt-3">
          <Toggle label="Uppercase letters" checked={upper} onChange={setUpper} />
        </div>
      </Panel>
      <Panel title="Hashes" className="space-y-3">
        {ALGOS.map((a) => {
          const v = hashes ? (upper ? hashes[a].toUpperCase() : hashes[a]) : "";
          return (
            <div key={a} className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-4">
              <span className="w-20 shrink-0 text-[13.5px] font-medium text-ink-2">{a}</span>
              <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-line bg-surface-2 py-1.5 pr-1.5 pl-3">
                <code className="min-w-0 flex-1 truncate font-mono text-[13px] text-ink">{v}</code>
                <CopyButton value={v} label={`Copy ${a}`} />
              </div>
            </div>
          );
        })}
        <p className="pt-1 text-[12.5px] text-muted">{text ? "" : "These are the hashes of empty text. "}MD5 and SHA-1 are fine for checksums but shouldn&apos;t be used to protect passwords.</p>
      </Panel>
    </div>
  );
}

/* ——— UUID generator ——— */

export function UuidGenerator() {
  const [count, setCount] = useState(5);
  const [upper, setUpper] = useState(false);
  const [hyphens, setHyphens] = useState(true);
  const [seed, setSeed] = useState(0);
  const mounted = useMounted();
  // Generated only in the browser, so the static page and the live page never disagree.
  const ids = useMemo(() => {
    void seed;
    return mounted ? Array.from({ length: count }, () => crypto.randomUUID()) : [];
  }, [mounted, count, seed]);

  const out = ids.map((id) => (hyphens ? id : id.replace(/-/g, ""))).map((id) => (upper ? id.toUpperCase() : id)).join("\n");
  return (
    <TwoPane
      left={
        <Panel className="space-y-5">
          <Slider label="How many" value={count} onChange={setCount} min={1} max={100} />
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Toggle label="Uppercase" checked={upper} onChange={setUpper} />
            <Toggle label="Include hyphens" checked={hyphens} onChange={setHyphens} />
          </div>
          <button type="button" onClick={() => setSeed((s) => s + 1)} className="chip">
            <RefreshCw aria-hidden className="h-3.5 w-3.5" /> Generate new
          </button>
          <p className="text-[13px] text-muted">Version 4 UUIDs from your browser&apos;s secure random generator.</p>
        </Panel>
      }
      right={
        <Panel>
          <OutputBox label={`${count} UUID${count === 1 ? "" : "s"}`} value={out} rows={12} mono filename="uuids.txt" />
        </Panel>
      }
    />
  );
}

/* ——— JWT decoder ——— */

function decodePart(part: string) {
  return JSON.parse(fromBase64(part));
}

export function JwtDecoder() {
  const [token, setTokenRaw] = useState("");
  // The moment the token was entered — used to say whether it has expired.
  const [checkedAt, setCheckedAt] = useState(0);
  const setToken = (v: string) => {
    setTokenRaw(v);
    setCheckedAt(Date.now());
  };
  const result = useMemo(() => {
    const t = token.trim();
    if (!t) return null;
    const parts = t.split(".");
    if (parts.length !== 3) return { error: "A JWT has three parts separated by dots (header.payload.signature)." };
    try {
      const header = decodePart(parts[0]);
      const payload = decodePart(parts[1]);
      return { header, payload, signature: parts[2] };
    } catch {
      return { error: "The header or payload isn't valid Base64-encoded JSON." };
    }
  }, [token]);

  const payload = result && "payload" in result ? (result.payload as Record<string, unknown>) : null;
  const time = (k: string) => (typeof payload?.[k] === "number" ? new Date((payload[k] as number) * 1000) : null);
  const exp = time("exp");
  const expired = exp ? exp.getTime() < checkedAt : null;

  return (
    <TwoPane
      left={
        <Panel>
          <TextField label="Your token" value={token} onChange={setToken} rows={10} mono placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9…" autoFocus />
          <p className="mt-3 text-[13px] text-muted">Decoded entirely in your browser — the token is never sent anywhere. This tool doesn&apos;t verify the signature.</p>
        </Panel>
      }
      right={
        <Panel className="space-y-4">
          {!result ? (
            <p className="text-[14px] text-muted">Paste a JSON Web Token to see its header and payload.</p>
          ) : "error" in result ? (
            <ErrorNote>{result.error}</ErrorNote>
          ) : (
            <>
              {exp ? (
                <p className={cn("rounded-xl px-3 py-2 text-[13.5px] font-medium", expired ? "bg-danger-soft text-danger" : "bg-success-soft text-success")}>
                  {expired ? "Expired" : "Not expired"} · expires {exp.toLocaleString()}
                </p>
              ) : null}
              {(["header", "payload"] as const).map((k) => (
                <div key={k}>
                  <OutputBox label={k === "header" ? "Header" : "Payload"} value={JSON.stringify(result[k], null, 2)} rows={k === "header" ? 4 : 10} mono />
                </div>
              ))}
              {["iat", "nbf"].map((k) =>
                time(k) ? (
                  <p key={k} className="text-[13px] text-muted">
                    {k === "iat" ? "Issued" : "Valid from"}: {time(k)!.toLocaleString()}
                  </p>
                ) : null,
              )}
            </>
          )}
        </Panel>
      }
    />
  );
}

/* ——— Unix timestamp converter ——— */

export function TimestampConverter() {
  const [now, setNow] = useState<number | null>(null);
  const [stamp, setStamp] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    const tick = () => setNow(Date.now());
    const first = window.setTimeout(tick, 0);
    const t = window.setInterval(tick, 1000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(t);
    };
  }, []);

  const fromStamp = useMemo(() => {
    const s = stamp.trim();
    if (!/^-?\d+(\.\d+)?$/.test(s)) return null;
    const n = Number(s);
    // 13+ digits = milliseconds; otherwise seconds.
    const ms = Math.abs(n) >= 1e12 ? n : n * 1000;
    const d = new Date(ms);
    return Number.isNaN(d.getTime()) ? null : d;
  }, [stamp]);
  const fromDate = useMemo(() => {
    if (!date) return null;
    const d = new Date(date);
    return Number.isNaN(d.getTime()) ? null : d;
  }, [date]);

  const rows = (d: Date) => [
    ["Your time zone", d.toLocaleString(undefined, { dateStyle: "full", timeStyle: "long" })],
    ["UTC", d.toUTCString()],
    ["ISO 8601", d.toISOString()],
    ["Seconds", String(Math.floor(d.getTime() / 1000))],
    ["Milliseconds", String(d.getTime())],
  ];

  return (
    <div className="space-y-4">
      <Panel>
        <p className="text-[13.5px] text-muted">Current Unix time</p>
        <div className="mt-1 flex items-center gap-3">
          <span className="num text-[30px] font-medium tracking-[-0.02em] text-ink">{now ? Math.floor(now / 1000) : "…"}</span>
          <CopyButton value={now ? String(Math.floor(now / 1000)) : ""} label="Copy current timestamp" />
        </div>
      </Panel>
      <TwoPane
        left={
          <Panel className="space-y-4">
            <div>
              <FieldLabel htmlFor="ts-in">Timestamp → date</FieldLabel>
              <input id="ts-in" value={stamp} onChange={(e) => setStamp(e.target.value)} inputMode="numeric" placeholder="1735689600" className="h-11 w-full rounded-xl border border-line bg-surface-2 px-3.5 font-mono text-[15px] text-ink outline-none focus:border-accent/50 focus:ring-4 focus:ring-accent/10" />
              <p className="mt-1.5 text-[12.5px] text-muted">Seconds or milliseconds — detected automatically.</p>
            </div>
            {stamp && !fromStamp ? <ErrorNote>Enter a whole number, like 1735689600.</ErrorNote> : null}
            {fromStamp ? <ResultRows rows={rows(fromStamp)} /> : null}
          </Panel>
        }
        right={
          <Panel className="space-y-4">
            <div>
              <FieldLabel htmlFor="date-in">Date → timestamp</FieldLabel>
              <input id="date-in" type="datetime-local" step={1} value={date} onChange={(e) => setDate(e.target.value)} className="h-11 w-full rounded-xl border border-line bg-surface-2 px-3.5 text-[15px] text-ink outline-none focus:border-accent/50 focus:ring-4 focus:ring-accent/10" />
              <p className="mt-1.5 text-[12.5px] text-muted">Uses your device&apos;s time zone.</p>
            </div>
            {fromDate ? <ResultRows rows={rows(fromDate)} /> : null}
          </Panel>
        }
      />
    </div>
  );
}

function ResultRows({ rows }: { rows: string[][] }) {
  return (
    <dl className="space-y-2">
      {rows.map(([k, v]) => (
        <div key={k} className="flex items-center gap-3 rounded-xl border border-line bg-surface px-3 py-2">
          <dt className="w-28 shrink-0 text-[12.5px] text-muted">{k}</dt>
          <dd className="min-w-0 flex-1 truncate font-mono text-[13px] text-ink">{v}</dd>
          <CopyButton value={v} label={`Copy ${k}`} />
        </div>
      ))}
    </dl>
  );
}

/* ——— Regex tester ——— */

export function RegexTester() {
  const [pattern, setPattern] = useState("");
  const [flags, setFlags] = useState({ g: true, i: false, m: false, s: false, u: true });
  const [text, setText] = useState("");
  const [replace, setReplace] = useState("");

  type RegexResult = { error: string } | { matches: RegExpExecArray[]; parts: { t: string; hit: boolean }[]; replaced: string };
  const res = useMemo((): RegexResult | null => {
    if (!pattern) return null;
    const f = Object.entries(flags)
      .filter(([, on]) => on)
      .map(([k]) => k)
      .join("");
    let re: RegExp;
    try {
      re = new RegExp(pattern, f);
    } catch (e) {
      return { error: e instanceof Error ? e.message : "Invalid pattern" };
    }
    const global = new RegExp(re.source, f.includes("g") ? f : f + "g");
    const matches = [...text.matchAll(global)].slice(0, 500) as RegExpExecArray[];
    // Highlight matches (skip empty matches to avoid endless highlighting).
    const parts: { t: string; hit: boolean }[] = [];
    let last = 0;
    for (const m of matches) {
      if (m.index === undefined || !m[0]) continue;
      parts.push({ t: text.slice(last, m.index), hit: false }, { t: m[0], hit: true });
      last = m.index + m[0].length;
    }
    parts.push({ t: text.slice(last), hit: false });
    let replaced = "";
    try {
      replaced = replace ? text.replace(re, replace) : "";
    } catch {
      replaced = "";
    }
    return { matches, parts, replaced };
  }, [pattern, flags, text, replace]);

  return (
    <div className="space-y-4">
      <Panel className="space-y-4">
        <div>
          <FieldLabel htmlFor="re-pattern">Pattern</FieldLabel>
          <div className="flex h-11 items-center rounded-xl border border-line bg-surface-2 px-3.5 font-mono text-[15px] focus-within:border-accent/50 focus-within:ring-4 focus-within:ring-accent/10">
            <span className="text-muted">/</span>
            <input id="re-pattern" value={pattern} onChange={(e) => setPattern(e.target.value)} placeholder="\b\w+@\w+\.\w+\b" spellCheck={false} autoFocus className="min-w-0 flex-1 bg-transparent px-1 text-ink outline-none" />
            <span className="text-muted">/{Object.entries(flags).filter(([, on]) => on).map(([k]) => k).join("")}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          {(
            [
              ["g", "All matches (g)"],
              ["i", "Ignore case (i)"],
              ["m", "Multi-line (m)"],
              ["s", "Dot matches newlines (s)"],
              ["u", "Unicode (u)"],
            ] as const
          ).map(([k, label]) => (
            <Toggle key={k} label={label} checked={flags[k]} onChange={(v) => setFlags((f) => ({ ...f, [k]: v }))} />
          ))}
        </div>
        {res && "error" in res ? <ErrorNote>{res.error}</ErrorNote> : null}
      </Panel>
      <TwoPane
        left={
          <Panel>
            <TextField label="Test text" value={text} onChange={setText} rows={10} placeholder="Paste the text to search…" />
            <div className="mt-4">
              <FieldLabel htmlFor="re-replace">Replace with (optional)</FieldLabel>
              <input id="re-replace" value={replace} onChange={(e) => setReplace(e.target.value)} placeholder="$1" className="h-11 w-full rounded-xl border border-line bg-surface-2 px-3.5 font-mono text-[14px] text-ink outline-none focus:border-accent/50" />
            </div>
          </Panel>
        }
        right={
          <Panel title={res && "matches" in res ? `${res.matches.length} match${res.matches.length === 1 ? "" : "es"}` : "Matches"} className="space-y-4">
            {res && "parts" in res ? (
              <>
                <pre className="max-h-64 overflow-auto rounded-2xl border border-line bg-surface-2 p-4 font-mono text-[13px] whitespace-pre-wrap text-ink-2">
                  {res.parts.map((p, i) => (p.hit ? <mark key={i} className="rounded-sm bg-[var(--mint)]/70 text-ink">{p.t}</mark> : <span key={i}>{p.t}</span>))}
                </pre>
                {res.matches.length ? (
                  <ol className="max-h-48 space-y-1 overflow-auto text-[13px]">
                    {res.matches.slice(0, 100).map((m, i) => (
                      <li key={i} className="font-mono text-ink-2">
                        <span className="text-muted">#{i + 1} at {m.index}:</span> {m[0]}
                        {m.length > 1 ? <span className="text-muted"> · groups: {m.slice(1).map((g) => JSON.stringify(g ?? null)).join(", ")}</span> : null}
                      </li>
                    ))}
                  </ol>
                ) : null}
                {replace ? <OutputBox label="After replacing" value={res.replaced} rows={5} mono /> : null}
              </>
            ) : (
              <p className="text-[14px] text-muted">Enter a pattern and some text to see matches highlighted.</p>
            )}
          </Panel>
        }
      />
    </div>
  );
}
