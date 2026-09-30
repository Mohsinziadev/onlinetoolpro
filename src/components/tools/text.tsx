"use client";

import { useMemo, useState } from "react";
import { Choice, OutputBox, Panel, Slider, TextField, Toggle, TwoPane } from "@/components/kit";
import { cn } from "@/lib/utils";

const lines = (t: string) => t.split(/\r?\n/);

/* ——— Remove duplicate lines ——— */

export function RemoveDuplicateLines() {
  const [text, setText] = useState("");
  const [ignoreCase, setIgnoreCase] = useState(false);
  const [trim, setTrim] = useState(true);
  const [dropEmpty, setDropEmpty] = useState(true);

  const { out, removed } = useMemo(() => {
    const seen = new Set<string>();
    const kept: string[] = [];
    let removed = 0;
    for (const raw of lines(text)) {
      const line = trim ? raw.trim() : raw;
      if (dropEmpty && !line) continue;
      const key = ignoreCase ? line.toLocaleLowerCase() : line;
      if (seen.has(key)) {
        removed++;
        continue;
      }
      seen.add(key);
      kept.push(line);
    }
    return { out: text ? kept.join("\n") : "", removed };
  }, [text, ignoreCase, trim, dropEmpty]);

  return (
    <TwoPane
      left={
        <Panel>
          <TextField label="Your list" value={text} onChange={setText} rows={12} placeholder={"apple\nbanana\napple\ncherry"} autoFocus hint={`${text ? lines(text).length : 0} lines`} />
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
            <Toggle label="Ignore capital letters" checked={ignoreCase} onChange={setIgnoreCase} />
            <Toggle label="Trim spaces" checked={trim} onChange={setTrim} />
            <Toggle label="Remove empty lines" checked={dropEmpty} onChange={setDropEmpty} />
          </div>
        </Panel>
      }
      right={
        <Panel>
          <OutputBox label={text ? `${removed} duplicate${removed === 1 ? "" : "s"} removed` : "Result"} value={out} rows={12} filename="unique-lines.txt" />
        </Panel>
      }
    />
  );
}

/* ——— Lorem ipsum ——— */

const WORDS =
  "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure in reprehenderit voluptate velit esse cillum fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum".split(
    " ",
  );
const pick = () => WORDS[Math.floor(Math.random() * WORDS.length)];
const sentence = () => {
  const n = 6 + Math.floor(Math.random() * 10);
  const s = Array.from({ length: n }, pick).join(" ");
  return s.charAt(0).toUpperCase() + s.slice(1) + ".";
};
const paragraph = () => Array.from({ length: 4 + Math.floor(Math.random() * 4) }, sentence).join(" ");

type LoremUnit = "paragraphs" | "sentences" | "words";

export function LoremIpsumGenerator() {
  const [unit, setUnit] = useState<LoremUnit>("paragraphs");
  const [count, setCount] = useState(3);
  const [classic, setClassic] = useState(true);
  const [seed, setSeed] = useState(0);

  const out = useMemo(() => {
    void seed; // regenerate on demand
    let text =
      unit === "paragraphs"
        ? Array.from({ length: count }, paragraph).join("\n\n")
        : unit === "sentences"
          ? Array.from({ length: count }, sentence).join(" ")
          : Array.from({ length: count }, pick).join(" ");
    if (classic) text = "Lorem ipsum dolor sit amet" + (unit === "words" ? " " + text.split(" ").slice(5).join(" ") : ", " + text.charAt(0).toLowerCase() + text.slice(1));
    return unit === "words" ? text.split(" ").slice(0, count).join(" ") : text;
  }, [unit, count, classic, seed]);

  return (
    <TwoPane
      left={
        <Panel className="space-y-5">
          <Choice
            label="Generate"
            value={unit}
            onChange={(u) => {
              setUnit(u);
              setCount(u === "paragraphs" ? 3 : u === "sentences" ? 5 : 50);
            }}
            options={[
              { value: "paragraphs", label: "Paragraphs" },
              { value: "sentences", label: "Sentences" },
              { value: "words", label: "Words" },
            ]}
          />
          <Slider label={`Number of ${unit}`} value={count} onChange={setCount} min={1} max={unit === "words" ? 500 : unit === "sentences" ? 50 : 20} />
          <Toggle label="Start with “Lorem ipsum dolor sit amet”" checked={classic} onChange={setClassic} />
          <button type="button" onClick={() => setSeed((s) => s + 1)} className="chip">
            Generate new text
          </button>
        </Panel>
      }
      right={
        <Panel>
          <OutputBox label="Placeholder text" value={out} rows={14} filename="lorem-ipsum.txt" />
        </Panel>
      }
    />
  );
}

/* ——— Whitespace remover ——— */

export function WhitespaceRemover() {
  const [text, setText] = useState("");
  const [spaces, setSpaces] = useState(true);
  const [trim, setTrim] = useState(true);
  const [empty, setEmpty] = useState(true);
  const [tabs, setTabs] = useState(true);
  const [breaks, setBreaks] = useState(false);

  const out = useMemo(() => {
    let t = text;
    if (tabs) t = t.replace(/\t/g, " ");
    if (spaces) t = t.replace(/[  ]{2,}/g, " ");
    let ls = lines(t);
    if (trim) ls = ls.map((l) => l.trim());
    if (empty) ls = ls.filter((l) => l.trim());
    return breaks ? ls.join(" ").replace(/ {2,}/g, " ").trim() : ls.join("\n");
  }, [text, spaces, trim, empty, tabs, breaks]);

  const saved = text.length - out.length;
  return (
    <TwoPane
      left={
        <Panel>
          <TextField label="Messy text" value={text} onChange={setText} rows={12} placeholder="Paste text with extra spaces, tabs or blank lines…" autoFocus />
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <Toggle label="Collapse repeated spaces" checked={spaces} onChange={setSpaces} />
            <Toggle label="Trim each line" checked={trim} onChange={setTrim} />
            <Toggle label="Remove blank lines" checked={empty} onChange={setEmpty} />
            <Toggle label="Turn tabs into spaces" checked={tabs} onChange={setTabs} />
            <Toggle label="Join into one line" checked={breaks} onChange={setBreaks} />
          </div>
        </Panel>
      }
      right={
        <Panel>
          <OutputBox label={text ? `Clean text · ${saved.toLocaleString()} characters removed` : "Clean text"} value={text ? out : ""} rows={12} filename="clean-text.txt" />
        </Panel>
      }
    />
  );
}

/* ——— Line sorter ——— */

type SortMode = "az" | "za" | "natural" | "length" | "reverse" | "shuffle";

export function LineSorter() {
  const [text, setText] = useState("");
  const [mode, setMode] = useState<SortMode>("az");
  const [ignoreCase, setIgnoreCase] = useState(true);
  const [dropEmpty, setDropEmpty] = useState(true);
  const [seed, setSeed] = useState(0);

  const out = useMemo(() => {
    void seed;
    let ls = lines(text);
    if (dropEmpty) ls = ls.filter((l) => l.trim());
    const collator = new Intl.Collator(undefined, { sensitivity: ignoreCase ? "base" : "variant", numeric: mode === "natural" });
    switch (mode) {
      case "az":
      case "natural":
        return [...ls].sort(collator.compare).join("\n");
      case "za":
        return [...ls].sort((a, b) => collator.compare(b, a)).join("\n");
      case "length":
        return [...ls].sort((a, b) => a.length - b.length || collator.compare(a, b)).join("\n");
      case "reverse":
        return [...ls].reverse().join("\n");
      case "shuffle": {
        const a = [...ls];
        for (let i = a.length - 1; i > 0; i--) {
          const j = crypto.getRandomValues(new Uint32Array(1))[0] % (i + 1);
          [a[i], a[j]] = [a[j], a[i]];
        }
        return a.join("\n");
      }
    }
  }, [text, mode, ignoreCase, dropEmpty, seed]);

  return (
    <TwoPane
      left={
        <Panel className="space-y-4">
          <TextField label="Lines to sort" value={text} onChange={setText} rows={11} placeholder={"banana\nApple\ncherry\nitem 10\nitem 2"} autoFocus />
          <Choice
            label="Sort by"
            value={mode}
            onChange={(m) => {
              setMode(m);
              if (m === "shuffle") setSeed((s) => s + 1);
            }}
            options={[
              { value: "az", label: "A → Z" },
              { value: "za", label: "Z → A" },
              { value: "natural", label: "Numbers in order" },
              { value: "length", label: "Shortest first" },
              { value: "reverse", label: "Reverse" },
              { value: "shuffle", label: "Shuffle" },
            ]}
          />
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Toggle label="Ignore capital letters" checked={ignoreCase} onChange={setIgnoreCase} />
            <Toggle label="Remove empty lines" checked={dropEmpty} onChange={setDropEmpty} />
          </div>
        </Panel>
      }
      right={
        <Panel>
          <OutputBox label="Sorted" value={text ? out : ""} rows={14} filename="sorted.txt" />
        </Panel>
      }
    />
  );
}

/* ——— Text compare (line diff) ——— */

type DiffRow = { type: "same" | "add" | "del"; text: string };

/** Classic longest-common-subsequence line diff. Fine for documents up to a few thousand lines. */
function diffLines(a: string[], b: string[], norm: (s: string) => string): DiffRow[] {
  const n = a.length;
  const m = b.length;
  const na = a.map(norm);
  const nb = b.map(norm);
  const dp: Uint32Array[] = Array.from({ length: n + 1 }, () => new Uint32Array(m + 1));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) dp[i][j] = na[i] === nb[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const rows: DiffRow[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (na[i] === nb[j]) {
      rows.push({ type: "same", text: b[j] });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) rows.push({ type: "del", text: a[i++] });
    else rows.push({ type: "add", text: b[j++] });
  }
  while (i < n) rows.push({ type: "del", text: a[i++] });
  while (j < m) rows.push({ type: "add", text: b[j++] });
  return rows;
}

export function TextDiff() {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [ignoreSpace, setIgnoreSpace] = useState(true);
  const [ignoreCase, setIgnoreCase] = useState(false);

  const rows = useMemo(() => {
    if (!a && !b) return [];
    const norm = (s: string) => {
      let t = ignoreSpace ? s.replace(/\s+/g, " ").trim() : s;
      if (ignoreCase) t = t.toLocaleLowerCase();
      return t;
    };
    return diffLines(lines(a), lines(b), norm);
  }, [a, b, ignoreSpace, ignoreCase]);
  const added = rows.filter((r) => r.type === "add").length;
  const removed = rows.filter((r) => r.type === "del").length;

  return (
    <div className="space-y-4">
      <TwoPane
        left={
          <Panel>
            <TextField label="Original text" value={a} onChange={setA} rows={10} placeholder="Paste the first version…" autoFocus />
          </Panel>
        }
        right={
          <Panel>
            <TextField label="Changed text" value={b} onChange={setB} rows={10} placeholder="Paste the second version…" />
          </Panel>
        }
      />
      <Panel
        title={rows.length ? (added || removed ? `${added} line${added === 1 ? "" : "s"} added · ${removed} removed` : "No differences") : "Differences"}
        actions={
          <>
            <Toggle label="Ignore spacing" checked={ignoreSpace} onChange={setIgnoreSpace} />
            <Toggle label="Ignore capitals" checked={ignoreCase} onChange={setIgnoreCase} />
          </>
        }
      >
        {rows.length ? (
          <ol className="max-h-[480px] overflow-auto rounded-2xl border border-line font-mono text-[13px]">
            {rows.map((r, k) => (
              <li
                key={k}
                className={cn(
                  "flex gap-3 px-3 py-1 whitespace-pre-wrap",
                  r.type === "add" && "bg-success-soft text-ink",
                  r.type === "del" && "bg-danger-soft text-ink line-through decoration-danger/40",
                  r.type === "same" && "text-muted",
                )}
              >
                <span aria-hidden className="w-3 shrink-0 select-none">
                  {r.type === "add" ? "+" : r.type === "del" ? "−" : " "}
                </span>
                <span className="sr-only">{r.type === "add" ? "Added: " : r.type === "del" ? "Removed: " : ""}</span>
                {r.text || " "}
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-[14px] text-muted">Paste two versions above to see what changed, line by line.</p>
        )}
      </Panel>
    </div>
  );
}
