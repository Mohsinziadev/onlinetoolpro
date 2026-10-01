"use client";

/** Stopwatch, countdown timer, spin-the-wheel and typing speed test. All run in the browser. */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Flag, Pause, Play, RotateCcw, Shuffle, Trophy, Volume2, VolumeX } from "lucide-react";
import { Choice, FieldLabel, Panel, Toggle, useMounted } from "@/components/kit";
import { cn } from "@/lib/utils";

const pad = (n: number, w = 2) => String(Math.floor(n)).padStart(w, "0");
/** 1:02:03.45 / 02:03.45 */
function clock(ms: number, hundredths = true) {
  const t = Math.max(0, ms);
  const h = Math.floor(t / 3_600_000);
  const m = Math.floor((t % 3_600_000) / 60_000);
  const s = Math.floor((t % 60_000) / 1000);
  const cs = Math.floor((t % 1000) / 10);
  return `${h ? `${h}:` : ""}${pad(m)}:${pad(s)}${hundredths ? `.${pad(cs)}` : ""}`;
}

/** Ignore shortcut keys while someone is typing in a field. */
const typing = (e: KeyboardEvent) => {
  const t = e.target as HTMLElement | null;
  return Boolean(t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT|BUTTON)$/.test(t.tagName)));
};

/** performance.now(), refreshed on every animation frame while `active`. */
function useFrameClock(active: boolean) {
  const [now, setNow] = useState(0);
  useEffect(() => {
    if (!active) return;
    let id = requestAnimationFrame(function loop(t) {
      setNow(t);
      id = requestAnimationFrame(loop);
    });
    return () => cancelAnimationFrame(id);
  }, [active]);
  return now;
}

function BigButton({ onClick, children, tone = "primary", disabled }: { onClick: () => void; children: React.ReactNode; tone?: "primary" | "secondary"; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex h-12 min-w-32 items-center justify-center gap-2 rounded-full px-6 text-[15px] font-medium transition-colors disabled:opacity-40",
        tone === "primary" ? "bg-cta text-cta-ink hover:bg-cta-hover" : "border border-line bg-surface text-ink hover:border-line-strong",
      )}
    >
      {children}
    </button>
  );
}

/* ——— Stopwatch ——— */

export function Stopwatch() {
  const [running, setRunning] = useState(false);
  const [base, setBase] = useState(0); // ms accumulated before the current run
  const [since, setSince] = useState(0); // performance.now() when the current run started
  const [laps, setLaps] = useState<number[]>([]);
  const frame = useFrameClock(running);
  const elapsed = base + (running ? Math.max(0, frame - since) : 0);

  const toggle = useCallback(() => {
    const now = performance.now();
    if (running) {
      setBase((b) => b + now - since);
      setRunning(false);
    } else {
      setSince(now);
      setRunning(true);
    }
  }, [running, since]);
  const lap = useCallback(() => running && setLaps((l) => [base + performance.now() - since, ...l]), [running, base, since]);
  const reset = useCallback(() => {
    setRunning(false);
    setBase(0);
    setLaps([]);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (typing(e) || e.metaKey || e.ctrlKey) return;
      if (e.code === "Space") {
        e.preventDefault();
        toggle();
      } else if (e.key.toLowerCase() === "l") lap();
      else if (e.key.toLowerCase() === "r" && !running) reset();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggle, lap, reset, running]);

  // Lap splits, newest first: each lap's own duration.
  const splits = laps.map((t, i) => t - (laps[i + 1] ?? 0));
  const fastest = splits.length > 1 ? Math.min(...splits) : null;
  const slowest = splits.length > 1 ? Math.max(...splits) : null;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
      <Panel className="flex flex-col items-center py-10 text-center">
        <p className="num text-[clamp(3rem,10vw,6rem)] leading-none font-medium tracking-[-0.03em] text-ink tabular-nums" role="timer" aria-live="off">
          {clock(elapsed)}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <BigButton onClick={toggle}>{running ? <><Pause aria-hidden className="h-4 w-4" /> Stop</> : <><Play aria-hidden className="h-4 w-4" /> {elapsed ? "Resume" : "Start"}</>}</BigButton>
          {running ? (
            <BigButton tone="secondary" onClick={lap}>
              <Flag aria-hidden className="h-4 w-4" /> Lap
            </BigButton>
          ) : (
            <BigButton tone="secondary" onClick={reset} disabled={!elapsed}>
              <RotateCcw aria-hidden className="h-4 w-4" /> Reset
            </BigButton>
          )}
        </div>
        <p className="mt-6 text-[12.5px] text-muted">Keyboard: Space start/stop · L lap · R reset</p>
      </Panel>
      <Panel title="Laps">
        {laps.length ? (
          <ol className="max-h-80 space-y-1 overflow-y-auto">
            {laps.map((t, i) => (
              <li key={laps.length - i} className="num grid grid-cols-[3.5rem_minmax(0,1fr)_auto] gap-3 rounded-lg px-2 py-1.5 text-[14px] odd:bg-bg-subtle">
                <span className="text-muted">Lap {laps.length - i}</span>
                <span className={cn(splits[i] === fastest && "text-success", splits[i] === slowest && "text-danger")}>{clock(splits[i])}</span>
                <span className="text-ink-2">{clock(t)}</span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-[14px] text-muted">Press Lap while the stopwatch runs to record split times.</p>
        )}
      </Panel>
    </div>
  );
}

/* ——— Countdown timer ——— */

/** A short three-tone alarm made with the Web Audio API (no sound files). */
function beep(ctx: AudioContext) {
  [0, 0.35, 0.7, 1.4, 1.75, 2.1].forEach((t) => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.value = 880;
    g.gain.setValueAtTime(0.0001, ctx.currentTime + t);
    g.gain.exponentialRampToValueAtTime(0.35, ctx.currentTime + t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + t + 0.28);
    o.connect(g).connect(ctx.destination);
    o.start(ctx.currentTime + t);
    o.stop(ctx.currentTime + t + 0.3);
  });
}

export function CountdownTimer() {
  const [h, setH] = useState("0");
  const [m, setM] = useState("5");
  const [s, setS] = useState("0");
  const [endAt, setEndAt] = useState<number | null>(null); // Date.now() target while running
  const [left, setLeft] = useState<number | null>(null); // remaining ms while paused
  const [done, setDone] = useState(false);
  const [planned, setPlanned] = useState(0); // length of the current countdown, for the progress bar
  const [sound, setSound] = useState(true);
  const audio = useRef<AudioContext | null>(null);
  const [now, setNow] = useState(0);
  const running = endAt !== null;

  const total = ((Number(h) || 0) * 3600 + (Number(m) || 0) * 60 + (Number(s) || 0)) * 1000;
  const remaining = running ? Math.max(0, endAt - now) : (left ?? total);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setNow(Date.now()), 100);
    return () => window.clearInterval(id);
  }, [running]);

  // Finish: stop, ring, and show it in the tab title.
  useEffect(() => {
    if (!running || remaining > 0 || !now) return;
    const id = window.setTimeout(() => {
      setEndAt(null);
      setLeft(null);
      setDone(true);
      if (sound && audio.current) beep(audio.current);
    }, 0);
    return () => window.clearTimeout(id);
  }, [running, remaining, now, sound]);

  useEffect(() => {
    const original = document.title;
    if (running) document.title = `${clock(remaining, false)} — Timer`;
    else if (done) document.title = "⏰ Time's up — Timer";
    return () => {
      document.title = original;
    };
  }, [running, remaining, done]);

  function start() {
    const ms = left ?? total;
    if (ms <= 0) return;
    if (left === null) setPlanned(ms);
    // Browsers only allow audio after a click, so create the context here.
    audio.current ??= new AudioContext();
    void audio.current.resume();
    const t = Date.now();
    setNow(t);
    setEndAt(t + ms);
    setLeft(null);
    setDone(false);
  }
  function pause() {
    setLeft(remaining);
    setEndAt(null);
  }
  function reset() {
    setEndAt(null);
    setLeft(null);
    setDone(false);
  }
  function preset(min: number) {
    reset();
    setH(String(Math.floor(min / 60)));
    setM(String(min % 60));
    setS("0");
  }
  const editable = !running && left === null;
  const field = "num h-16 w-full rounded-2xl border border-line bg-surface text-center text-[28px] font-medium text-ink outline-none focus:border-accent/50 focus:ring-4 focus:ring-accent/10 disabled:opacity-60";
  const progress = done ? 1 : (running || left !== null) && planned ? 1 - remaining / planned : 0;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
      <Panel className={cn("flex flex-col items-center py-10 text-center transition-colors", done && "bg-accent-soft")}>
        <p className={cn("num text-[clamp(3rem,10vw,6rem)] leading-none font-medium tracking-[-0.03em] tabular-nums", done ? "text-accent" : "text-ink")} role="timer" aria-live="off">
          {done ? "Time's up" : clock(remaining, false)}
        </p>
        <div className="mt-6 h-1.5 w-full max-w-md overflow-hidden rounded-full bg-bg-subtle" aria-hidden>
          <div className="h-full rounded-full bg-accent transition-[width] duration-100" style={{ width: `${Math.min(100, Math.max(0, progress * 100))}%` }} />
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {running ? (
            <BigButton onClick={pause}>
              <Pause aria-hidden className="h-4 w-4" /> Pause
            </BigButton>
          ) : (
            <BigButton onClick={start} disabled={(left ?? total) <= 0}>
              <Play aria-hidden className="h-4 w-4" /> {left !== null ? "Resume" : "Start"}
            </BigButton>
          )}
          <BigButton tone="secondary" onClick={reset} disabled={editable && !done}>
            <RotateCcw aria-hidden className="h-4 w-4" /> Reset
          </BigButton>
        </div>
        <p className="sr-only" aria-live="assertive">
          {done ? "Time's up" : ""}
        </p>
      </Panel>
      <Panel className="space-y-5">
        <div>
          <FieldLabel>Set the time</FieldLabel>
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                ["Hours", h, setH, 99],
                ["Minutes", m, setM, 59],
                ["Seconds", s, setS, 59],
              ] as const
            ).map(([label, v, set, max]) => (
              <label key={label} className="block text-center">
                <input value={v} disabled={!editable} inputMode="numeric" aria-label={label} onChange={(e) => set(String(Math.min(max, Number(e.target.value.replace(/\D/g, "").slice(-2)) || 0)))} className={field} />
                <span className="mt-1 block text-[12px] text-muted">{label}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <FieldLabel>Quick start</FieldLabel>
          <div className="flex flex-wrap gap-1.5">
            {[1, 2, 3, 5, 10, 15, 20, 25, 30, 45, 60].map((n) => (
              <button key={n} type="button" className="chip" onClick={() => preset(n)} disabled={running}>
                {n < 60 ? `${n} min` : "1 hour"}
              </button>
            ))}
          </div>
        </div>
        <button type="button" onClick={() => setSound((v) => !v)} className="chip" aria-pressed={sound}>
          {sound ? <Volume2 aria-hidden className="h-3.5 w-3.5" /> : <VolumeX aria-hidden className="h-3.5 w-3.5" />} Alarm sound {sound ? "on" : "off"}
        </button>
        <p className="text-[12.5px] text-muted">Keep this tab open. The time left also shows in the tab title, so you can switch tabs.</p>
      </Panel>
    </div>
  );
}

/* ——— Spin the wheel ——— */

const WHEEL_COLORS = ["#1f7a58", "#7afab2", "#2563eb", "#f59e0b", "#ef4444", "#8b5cf6", "#0ea5e9", "#ec4899", "#14b8a6", "#f97316"];
const INK_ON = (hex: string) => (["#7afab2", "#f59e0b", "#0ea5e9", "#14b8a6"].includes(hex) ? "#0a2119" : "#ffffff");

function secureIndex(n: number) {
  const buf = new Uint32Array(1);
  const limit = Math.floor(0x100000000 / n) * n;
  do crypto.getRandomValues(buf);
  while (buf[0] >= limit);
  return buf[0] % n;
}

export function SpinTheWheel() {
  const [text, setText] = useState("Alex\nSam\nJordan\nTaylor\nMorgan\nRiley");
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [removeWinner, setRemoveWinner] = useState(false);
  const entries = useMemo(() => text.split("\n").map((s) => s.trim()).filter(Boolean).slice(0, 100), [text]);
  const n = entries.length;
  const seg = n ? 360 / n : 360;
  const pending = useRef<number | null>(null);

  function spin() {
    if (n < 2 || spinning) return;
    const i = secureIndex(n);
    pending.current = i;
    // Land with the winner's slice under the pointer at the top, a little off-center.
    const jitter = (secureIndex(1000) / 1000 - 0.5) * seg * 0.7;
    const target = 360 - (i * seg + seg / 2 + jitter);
    const current = ((rotation % 360) + 360) % 360;
    const delta = ((target - current + 360) % 360) + 360 * 6;
    setWinner(null);
    setSpinning(true);
    setRotation((r) => r + delta);
  }
  function finish() {
    if (!spinning) return;
    setSpinning(false);
    const i = pending.current;
    if (i !== null) setWinner(entries[i]);
  }
  function drop(name: string) {
    const lines = text.split("\n");
    const at = lines.findIndex((l) => l.trim() === name);
    if (at >= 0) lines.splice(at, 1);
    setText(lines.join("\n"));
    setWinner(null);
  }

  const r = 160;
  const slice = (k: number) => {
    const a0 = ((k * seg - 90) * Math.PI) / 180;
    const a1 = (((k + 1) * seg - 90) * Math.PI) / 180;
    const large = seg > 180 ? 1 : 0;
    return `M0 0 L${r * Math.cos(a0)} ${r * Math.sin(a0)} A${r} ${r} 0 ${large} 1 ${r * Math.cos(a1)} ${r * Math.sin(a1)} Z`;
  };

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
      <Panel className="flex flex-col items-center gap-6 py-8">
        <div className="relative w-full max-w-[420px]">
          <svg aria-hidden viewBox="-12 -20 24 26" className="absolute top-0 left-1/2 z-10 w-7 -translate-x-1/2 -translate-y-2 drop-shadow">
            <path d="M-10 -18 L10 -18 L0 4 Z" className="fill-ink" />
          </svg>
          <svg
            role="img"
            aria-label={n ? `Wheel with ${n} entries` : "Empty wheel"}
            viewBox="-170 -170 340 340"
            className="w-full"
            style={{ transform: `rotate(${rotation}deg)`, transition: spinning ? "transform 5s cubic-bezier(0.12, 0.7, 0.12, 1)" : "none" }}
            onTransitionEnd={finish}
          >
            <circle r="168" className="fill-surface stroke-line" strokeWidth="4" />
            {n === 1 ? <circle r={r} fill={WHEEL_COLORS[0]} /> : null}
            {n > 1
              ? entries.map((e, k) => {
                  // Avoid the same color twice in a row where the wheel wraps around.
                  const fill = WHEEL_COLORS[k === n - 1 && n % WHEEL_COLORS.length === 1 ? 1 : k % WHEEL_COLORS.length];
                  const mid = k * seg + seg / 2 - 90;
                  return (
                    <g key={k}>
                      <path d={slice(k)} fill={fill} stroke="white" strokeWidth={n > 40 ? 0.5 : 1.5} />
                      {/* Labels on the left half are turned 180° so they never read upside down. */}
                      <text transform={`rotate(${mid}) translate(${r - 12} 0)${mid > 90 ? " rotate(180)" : ""}`} textAnchor={mid > 90 ? "start" : "end"} dominantBaseline="middle" fill={INK_ON(fill)} fontSize={Math.max(7, Math.min(16, 260 / n + 4))} fontWeight={600}>
                        {e.length > 16 ? `${e.slice(0, 15)}…` : e}
                      </text>
                    </g>
                  );
                })
              : null}
            <circle r="18" className="fill-surface stroke-line" strokeWidth="3" />
          </svg>
        </div>
        <button type="button" onClick={spin} disabled={n < 2 || spinning} className="inline-flex h-12 items-center gap-2 rounded-full bg-cta px-8 text-[16px] font-medium text-cta-ink transition-colors hover:bg-cta-hover disabled:opacity-40">
          <Shuffle aria-hidden className="h-4 w-4" /> {spinning ? "Spinning…" : "Spin the wheel"}
        </button>
        <div aria-live="polite" className="min-h-14 text-center">
          {winner ? (
            <div className="flex flex-col items-center gap-2">
              <p className="flex items-center gap-2 text-[22px] font-medium text-ink">
                <Trophy aria-hidden className="h-5 w-5 text-accent" /> {winner}
              </p>
              {removeWinner ? null : (
                <button type="button" className="text-[13px] font-medium text-accent hover:underline" onClick={() => drop(winner)}>
                  Remove {winner} from the wheel
                </button>
              )}
            </div>
          ) : null}
        </div>
      </Panel>
      <Panel className="space-y-4">
        <div>
          <FieldLabel htmlFor="wheel-entries" hint={`${n} entr${n === 1 ? "y" : "ies"}${n >= 100 ? " (max 100)" : ""}`}>
            Entries — one per line
          </FieldLabel>
          <textarea id="wheel-entries" value={text} onChange={(e) => setText(e.target.value)} disabled={spinning} rows={12} className="w-full rounded-xl border border-line bg-surface-2 p-3 text-[15px] text-ink outline-none focus:border-accent/50 focus:ring-4 focus:ring-accent/10" />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="chip"
            disabled={spinning || n < 2}
            onClick={() => {
              const a = [...entries];
              for (let i = a.length - 1; i > 0; i--) {
                const j = secureIndex(i + 1);
                [a[i], a[j]] = [a[j], a[i]];
              }
              setText(a.join("\n"));
            }}
          >
            <Shuffle aria-hidden className="h-3.5 w-3.5" /> Shuffle order
          </button>
          <button type="button" className="chip" disabled={spinning} onClick={() => setText("")}>
            Clear
          </button>
        </div>
        <Toggle
          label="Remove the winner automatically after each spin"
          checked={removeWinner}
          onChange={(v) => {
            setRemoveWinner(v);
          }}
        />
        {removeWinner && winner ? <AutoRemove name={winner} onRemove={drop} /> : null}
        <p className="text-[12.5px] text-muted">Every entry has the same chance. The result is picked with your browser&apos;s secure random generator before the wheel stops.</p>
      </Panel>
    </div>
  );
}

/** Removes the winner once it has been shown (when auto-remove is on). */
function AutoRemove({ name, onRemove }: { name: string; onRemove: (n: string) => void }) {
  useEffect(() => {
    const id = window.setTimeout(() => onRemove(name), 2500);
    return () => window.clearTimeout(id);
  }, [name, onRemove]);
  return <p className="text-[12.5px] text-muted">Removing {name}…</p>;
}

/* ——— Typing speed test ——— */

// Original practice passages — plain, everyday English with common punctuation.
const PASSAGES = [
  "The best way to get faster at typing is to slow down first. Keep your eyes on the screen, rest your fingers on the home row, and let accuracy come before speed. Once the movements feel natural, your speed will follow without much effort.",
  "Every morning the small bakery on the corner opens its doors at six. The smell of fresh bread drifts down the street, and a short line forms before the sun is fully up. Most people order the same thing every day, and the baker already knows their names.",
  "A good plan for a busy week starts with a short list. Write down the three things that matter most, then block time for each one before anything else fills your calendar. Small tasks can wait until the important work is done.",
  "Rivers shape the land slowly but without stopping. Over thousands of years, moving water carves valleys, carries stones toward the sea, and leaves rich soil along its banks. Many of the oldest towns in the world were built beside a river for that reason.",
  "When you learn something new, try to explain it to someone else in simple words. If you get stuck, you have found the part you do not understand yet. Go back, read it again, and try once more until the explanation feels easy.",
  "The train was quiet except for the soft hum of the wheels. Outside the window, green fields turned into small villages and then into the edge of a large city. A few passengers closed their books and began to gather their bags.",
];

export function TypingTest() {
  const mounted = useMounted();
  const [duration, setDuration] = useState<"30" | "60" | "120">("60");
  const [order, setOrder] = useState(0);
  const [typed, setTyped] = useState("");
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [finishedAt, setFinishedAt] = useState<number | null>(null);
  const [now, setNow] = useState(0);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  // Three passages in a row so fast typists never run out of text.
  const target = useMemo(() => [0, 1, 2].map((k) => PASSAGES[(order + k) % PASSAGES.length]).join(" "), [order]);
  const limit = Number(duration) * 1000;
  const running = startedAt !== null && finishedAt === null;

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setNow(Date.now()), 200);
    return () => window.clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (!running || !startedAt || now - startedAt < limit) return;
    const id = window.setTimeout(() => setFinishedAt(startedAt + limit), 0);
    return () => window.clearTimeout(id);
  }, [running, now, startedAt, limit]);

  const elapsed = startedAt ? Math.min(limit, (finishedAt ?? now) - startedAt) : 0;
  let correct = 0;
  for (let i = 0; i < typed.length; i++) if (typed[i] === target[i]) correct++;
  const minutes = elapsed / 60_000;
  const wpm = minutes > 0.05 ? correct / 5 / minutes : 0;
  const accuracy = typed.length ? (correct / typed.length) * 100 : 100;
  const done = finishedAt !== null;

  function onType(v: string) {
    if (done) return;
    const t = Date.now();
    if (!startedAt && v.length) {
      setStartedAt(t);
      setNow(t);
    }
    setTyped(v.slice(0, target.length));
    if (v.length >= target.length) setFinishedAt(t);
  }
  function restart(next = false) {
    setTyped("");
    setStartedAt(null);
    setFinishedAt(null);
    if (next) setOrder((o) => (o + 1) % PASSAGES.length);
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  // Show a window of text around the caret so long passages don't fill the page.
  const from = Math.max(0, target.lastIndexOf(" ", Math.max(0, typed.length - 60)) + 1);
  const to = Math.min(target.length, from + 260);

  return (
    <div className="space-y-4">
      <Panel className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <Choice label="Test length" value={duration} onChange={(v) => { setDuration(v); restart(); }} options={[{ value: "30", label: "30 seconds" }, { value: "60", label: "1 minute" }, { value: "120", label: "2 minutes" }]} />
          <dl className="flex gap-6 text-right">
            <div>
              <dt className="text-[12px] text-muted">Time left</dt>
              <dd className="num text-[22px] font-medium text-ink">{Math.ceil((limit - elapsed) / 1000)}s</dd>
            </div>
            <div>
              <dt className="text-[12px] text-muted">WPM</dt>
              <dd className="num text-[22px] font-medium text-ink">{Math.round(wpm)}</dd>
            </div>
            <div>
              <dt className="text-[12px] text-muted">Accuracy</dt>
              <dd className="num text-[22px] font-medium text-ink">{Math.round(accuracy)}%</dd>
            </div>
          </dl>
        </div>
        <p aria-hidden className="rounded-2xl border border-line bg-bg-subtle p-5 font-mono text-[18px] leading-[1.75] break-words text-muted sm:text-[20px]">
          {from > 0 ? "… " : null}
          {target.slice(from, to).split("").map((ch, k) => {
            const i = from + k;
            const state = i < typed.length ? (typed[i] === ch ? "ok" : "bad") : i === typed.length ? "cur" : "todo";
            return (
              <span key={i} className={cn(state === "ok" && "text-ink", state === "bad" && "rounded-sm bg-danger/15 text-danger", state === "cur" && "border-b-2 border-accent text-ink")}>
                {ch}
              </span>
            );
          })}
        </p>
        <label className="block">
          <span className="sr-only">Type the text shown above</span>
          <textarea
            ref={inputRef}
            value={typed}
            onChange={(e) => onType(e.target.value)}
            onPaste={(e) => e.preventDefault()}
            disabled={done || !mounted}
            rows={3}
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="off"
            autoComplete="off"
            placeholder={startedAt ? "" : "Start typing here — the timer starts with your first key."}
            className="w-full rounded-2xl border border-line bg-surface p-4 font-mono text-[16px] text-ink outline-none focus:border-accent/50 focus:ring-4 focus:ring-accent/10 disabled:opacity-60"
          />
        </label>
        <p className="sr-only" aria-live="polite">
          {done ? `Finished. ${Math.round(wpm)} words per minute, ${Math.round(accuracy)} percent accuracy.` : ""}
        </p>
      </Panel>
      {done ? (
        <Panel className="flex flex-col items-center gap-4 py-8 text-center">
          <p className="text-[14px] text-muted">Your result</p>
          <p className="num text-[56px] leading-none font-medium tracking-tight text-ink">{Math.round(wpm)} WPM</p>
          <p className="text-[15px] text-ink-2">
            {Math.round(accuracy)}% accuracy · {correct} correct characters in {Math.round(elapsed / 1000)} seconds
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <BigButton onClick={() => restart(true)}>New text</BigButton>
            <BigButton tone="secondary" onClick={() => restart()}>
              <RotateCcw aria-hidden className="h-4 w-4" /> Same text again
            </BigButton>
          </div>
        </Panel>
      ) : startedAt ? (
        <button type="button" className="chip" onClick={() => restart()}>
          <RotateCcw aria-hidden className="h-3.5 w-3.5" /> Restart
        </button>
      ) : null}
    </div>
  );
}
