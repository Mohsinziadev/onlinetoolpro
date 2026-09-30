"use client";

import { Check } from "lucide-react";
import {
  Button,
  CountUp,
  FakeThumb,
  Float,
  Label,
  Ring,
  Toast,
  Typed,
  d,
  useStepper,
  useTyped,
  type SceneProps,
} from "@/components/demos/kit";
import { cn } from "@/lib/utils";

/* Timestamp Generator — messy notes → each line flips into the right format while rules tick → chapters on a player bar. */
const RAW = [
  "0 intro",
  "1:30 ingredients",
  "4:05 cooking the sauce",
  "9:48 plating",
];
const CLEAN = [
  "00:00 Intro",
  "01:30 Ingredients",
  "04:05 Cooking the sauce",
  "09:48 Plating",
];
export function TimestampScene({ phase, reduced }: SceneProps) {
  const fixed = useStepper(CLEAN.length, { reduced, every: 280, delay: 150 });
  if (phase === 0)
    return (
      <div>
        <Label>Your chapter notes, any format</Label>
        <div className="mt-3 min-h-32 rounded-2xl border border-accent/50 bg-surface p-4 font-mono text-[13px] leading-relaxed whitespace-pre-line ring-4 ring-accent/10">
          <Typed text={RAW.join("\n")} reduced={reduced} wrap speed={20} />
        </div>
      </div>
    );
  if (phase === 1)
    return (
      <div className="grid grid-cols-[1.3fr_1fr] gap-4">
        <ul className="space-y-1.5 font-mono text-[12.5px]">
          {CLEAN.map((c, i) => (
            <li key={c} className="h-6 [perspective:400px]">
              {i < fixed ? (
                <span className="demo-flip block text-ink">{c}</span>
              ) : (
                <span className="block text-faint">{RAW[i]}</span>
              )}
            </li>
          ))}
        </ul>
        <ul className="space-y-2 text-[12px]">
          {["Starts at 00:00", "In order", "10 sec or longer"].map((r, i) => (
            <li
              key={r}
              className="demo-pop flex items-center gap-1.5 text-ink-2"
              style={d(300 + i * 320)}
            >
              <Check aria-hidden className="h-3.5 w-3.5 text-accent" /> {r}
            </li>
          ))}
        </ul>
      </div>
    );
  const segs = [16, 26, 38, 20];
  return (
    <div>
      <div className="relative">
        <FakeThumb className="rounded-xl" badge={false} />
        <span
          className="demo-bob absolute bottom-7 left-[30%] rounded-md bg-black/80 px-2 py-1 text-[11px] text-white"
          style={d(700)}
        >
          01:30 · Ingredients
        </span>
      </div>
      <div className="mt-3 flex gap-1">
        {segs.map((w, i) => (
          <span
            key={i}
            className="demo-grow-x h-1.5 rounded-full bg-accent"
            style={{ ...d(i * 180), width: `${w}%`, opacity: 1 - i * 0.15 }}
          />
        ))}
      </div>
      <p className="mt-3 text-[12.5px] text-muted">
        Your video now has clickable chapters.
      </p>
    </div>
  );
}

/* Word Counter — the count climbs as you type → each word lights up → the numbers land. */
const PARA =
  "Simple tools make everyday tasks faster. Paste any text and see the counts instantly.";
export function WordCounterScene({ phase, reduced }: SceneProps) {
  const { typed } = useTyped(PARA, { reduced, delay: 150, speed: 20 });
  const words = PARA.split(" ");
  const lit = useStepper(words.length, { reduced, every: 95, delay: 100 });
  if (phase === 0) {
    const live = typed.trim() ? typed.trim().split(/\s+/).length : 0;
    return (
      <Float className="relative p-5">
        <span className="absolute -top-3 right-4 rounded-full bg-cta px-3 py-1 text-[12px] font-medium text-cta-ink shadow-raised">
          <span className="num">{live}</span> words
        </span>
        <p className="min-h-24 text-[15px] leading-relaxed text-ink">
          {typed}
          <span className="demo-caret ml-px inline-block h-4 w-px translate-y-0.5 bg-ink" />
        </p>
      </Float>
    );
  }
  if (phase === 1)
    return (
      <Float className="p-5">
        <p className="text-[15px] leading-[1.9]">
          {words.map((w, i) => (
            <span
              key={i}
              className={cn(
                "rounded px-0.5 transition-colors duration-200",
                i < lit ? "bg-[var(--mint)]/60 text-ink" : "text-muted",
              )}
            >
              {w}{" "}
            </span>
          ))}
        </p>
        <p className="mt-3 text-right text-[13px] text-muted">
          Word <span className="num font-medium text-ink">{lit}</span> of{" "}
          {words.length}
        </p>
      </Float>
    );
  const stats: [string, number, (n: number) => string][] = [
    ["Words", 14, (n) => `${Math.round(n)}`],
    ["Characters", 86, (n) => `${Math.round(n)}`],
    ["Sentences", 2, (n) => `${Math.round(n)}`],
  ];
  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-4">
      <div className="grid gap-2.5">
        {stats.map(([l, v, f], i) => (
          <Float
            key={l}
            className="demo-slide-l flex items-center justify-between px-4 py-3"
            style={d(i * 160)}
          >
            <span className="text-[13px] text-muted">{l}</span>
            <CountUp
              to={v}
              reduced={reduced}
              format={f}
              delay={i * 160}
              className="text-[20px] font-medium tracking-[-0.02em] text-ink"
            />
          </Float>
        ))}
      </div>
      <Ring
        value={0.72}
        size={104}
        delay={300}
        label={
          <span className="text-[12px] leading-tight text-muted">
            Read in
            <br />
            <span className="text-[16px] font-medium text-ink">4 sec</span>
          </span>
        }
      />
    </div>
  );
}

/* Case Converter — lowercase text → press Title Case and letters flip one by one → compare every style. */
const LOWER = "the quick guide to better titles";
const TITLE = "The Quick Guide to Better Titles";
export function CaseScene({ phase, reduced }: SceneProps) {
  if (phase === 0)
    return (
      <div>
        <Label>Your text</Label>
        <div className="mt-3 rounded-2xl border border-accent/50 bg-surface p-4 text-[16px] ring-4 ring-accent/10">
          <Typed text={LOWER} reduced={reduced} wrap />
        </div>
      </div>
    );
  if (phase === 1)
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {["UPPERCASE", "lowercase"].map((b) => (
            <span
              key={b}
              className="rounded-full border border-line px-3 py-1.5 text-[12.5px] text-ink-2"
            >
              {b}
            </span>
          ))}
          <Button press reduced={reduced} className="h-8 px-3 text-[12.5px]">
            Title Case
          </Button>
        </div>
        <p className="rounded-2xl border border-line bg-surface p-4 text-[18px] font-medium tracking-[-0.01em] [perspective:500px]">
          {TITLE.split("").map((ch, i) =>
            ch !== LOWER[i] ? (
              <span
                key={i}
                className="demo-flip inline-block text-accent"
                style={d(650 + i * 25)}
              >
                {ch}
              </span>
            ) : (
              <span key={i} className="text-ink">
                {ch === " " ? " " : ch}
              </span>
            ),
          )}
        </p>
      </div>
    );
  const rows: [string, string, boolean][] = [
    ["UPPERCASE", LOWER.toUpperCase(), false],
    ["Title Case", TITLE, true],
    ["Sentence case", "The quick guide to better titles", false],
  ];
  return (
    <div className="space-y-2">
      {rows.map(([name, text, chosen], i) => (
        <div
          key={name}
          className={cn(
            "demo-slide-r flex items-center gap-3 rounded-xl border px-3.5 py-2.5",
            chosen
              ? "border-accent/40 bg-accent-soft"
              : "border-line bg-surface",
          )}
          style={d(i * 160)}
        >
          <span className="w-24 shrink-0 text-[11.5px] text-muted">{name}</span>
          <span
            className={cn(
              "truncate text-[13.5px]",
              chosen ? "font-medium text-ink" : "text-ink-2",
            )}
          >
            {text}
          </span>
        </div>
      ))}
      <div className="pt-2">
        <Toast delay={550}>Copied</Toast>
      </div>
    </div>
  );
}
