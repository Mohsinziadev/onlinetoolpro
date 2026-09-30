"use client";

/**
 * Building blocks for the animated "How it works" scenes. Every hook takes
 * `reduced` and returns its final value immediately when motion is reduced.
 * Scenes are remounted on every step, so hooks always start from zero.
 */
import {
  useEffect,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
} from "react";
import { Check, MousePointer2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type Phase = 0 | 1 | 2;
export type SceneProps = { phase: Phase; reduced: boolean };

/* ——— motion preference ——— */

function subscribeReduced(cb: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}
export function useReducedMotion() {
  return useSyncExternalStore(
    subscribeReduced,
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
}

/** Stagger helper for CSS animations: style={d(200)} → animation-delay 200ms. */
export const d = (ms: number, extra?: Record<string, string | number>) =>
  ({ "--d": `${ms}ms`, ...extra }) as CSSProperties;
export const vars = (v: Record<string, string | number>) => v as CSSProperties;

/* ——— hooks ——— */

/** Types `text` one character at a time. */
export function useTyped(
  text: string,
  {
    reduced,
    delay = 250,
    speed = 34,
  }: { reduced: boolean; delay?: number; speed?: number },
) {
  const [n, setN] = useState(reduced ? text.length : 0);
  useEffect(() => {
    if (reduced) return;
    let id: number | undefined;
    const start = window.setTimeout(() => {
      id = window.setInterval(() => {
        setN((v) => {
          if (v >= text.length) window.clearInterval(id);
          return Math.min(v + 1, text.length);
        });
      }, speed);
    }, delay);
    return () => {
      window.clearTimeout(start);
      window.clearInterval(id);
    };
  }, [text, reduced, delay, speed]);
  return { typed: text.slice(0, n), done: n >= text.length, count: n };
}

/** Counts from 0 to `to` with an ease-out curve. */
export function useCount(
  to: number,
  {
    reduced,
    duration = 1400,
    delay = 0,
  }: { reduced: boolean; duration?: number; delay?: number },
) {
  const [v, setV] = useState(reduced ? to : 0);
  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    const startAt = performance.now() + delay;
    const tick = (now: number) => {
      const t = Math.min(Math.max((now - startAt) / duration, 0), 1);
      setV(to * (1 - Math.pow(1 - t, 3)));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, reduced, duration, delay]);
  return v;
}

const GLYPHS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz0123456789";
/** Reveals `text` left to right out of random glyphs, like a decoder. */
export function useScramble(
  text: string,
  {
    reduced,
    delay = 0,
    speed = 40,
  }: { reduced: boolean; delay?: number; speed?: number },
) {
  const [out, setOut] = useState(reduced ? text : "");
  useEffect(() => {
    if (reduced) return;
    let frame = 0;
    let id: number | undefined;
    const start = window.setTimeout(() => {
      id = window.setInterval(() => {
        frame++;
        const settled = Math.floor(frame / 2);
        const s = text
          .split("")
          .map((ch, i) =>
            i < settled ? ch : GLYPHS[(i * 7 + frame * 3) % GLYPHS.length],
          )
          .join("");
        setOut(s);
        if (settled >= text.length) window.clearInterval(id);
      }, speed);
    }, delay);
    return () => {
      window.clearTimeout(start);
      window.clearInterval(id);
    };
  }, [text, reduced, delay, speed]);
  return out;
}

/** Reveals items one by one: returns how many are visible (0…total). */
export function useStepper(
  total: number,
  {
    reduced,
    every = 300,
    delay = 0,
  }: { reduced: boolean; every?: number; delay?: number },
) {
  const [n, setN] = useState(reduced ? total : 0);
  useEffect(() => {
    if (reduced) return;
    let id: number | undefined;
    const start = window.setTimeout(() => {
      setN(1);
      id = window.setInterval(() => {
        setN((v) => {
          if (v >= total) window.clearInterval(id);
          return Math.min(v + 1, total);
        });
      }, every);
    }, delay);
    return () => {
      window.clearTimeout(start);
      window.clearInterval(id);
    };
  }, [total, reduced, every, delay]);
  return n;
}

/* ——— primitives ——— */

/** An abstract thumbnail: tint gradient, a headline block and a "face". No real imagery. */
export function FakeThumb({
  className,
  badge = true,
  variant = 0,
}: {
  className?: string;
  badge?: boolean;
  variant?: 0 | 1 | 2;
}) {
  const bg = [
    "bg-[linear-gradient(135deg,var(--tint-ink)_0%,#0a2119_100%)]",
    "bg-[linear-gradient(135deg,#f0b35b_0%,#b4532a_100%)]",
    "bg-[linear-gradient(135deg,#6d7cf0_0%,#26305e_100%)]",
  ][variant];
  return (
    <div
      className={cn(
        "relative aspect-video overflow-hidden rounded-lg",
        bg,
        className,
      )}
    >
      <div className="absolute top-[18%] left-[8%] h-[16%] w-[46%] rounded-[3px] bg-white/95" />
      <div className="absolute top-[40%] left-[8%] h-[12%] w-[32%] rounded-[3px] bg-[var(--mint)]" />
      <div className="absolute right-[10%] bottom-0 h-[70%] w-[30%] rounded-t-full bg-white/35" />
      {badge ? (
        <div className="absolute right-[4%] bottom-[6%] h-[12%] w-[16%] rounded-[2px] bg-black/75" />
      ) : null}
    </div>
  );
}

export function Field({
  children,
  focused,
  className,
}: {
  children: ReactNode;
  focused?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex h-11 items-center gap-2 rounded-full border bg-surface px-4 text-[14px] transition-[border-color,box-shadow]",
        focused ? "border-accent/50 ring-4 ring-accent/10" : "border-line",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Caret() {
  return (
    <span className="demo-caret ml-px inline-block h-4 w-px translate-y-0.5 bg-ink" />
  );
}

/** A line of text that types itself. */
export function Typed({
  text,
  reduced,
  delay,
  speed,
  wrap = false,
  className,
}: {
  text: string;
  reduced: boolean;
  delay?: number;
  speed?: number;
  wrap?: boolean;
  className?: string;
}) {
  const { typed, done } = useTyped(text, { reduced, delay, speed });
  return (
    <span
      className={cn(
        "min-w-0 text-ink",
        wrap ? "break-words" : "truncate",
        className,
      )}
    >
      {typed}
      {!done ? <Caret /> : null}
    </span>
  );
}

/** A number that counts up, formatted by `format`. */
export function CountUp({
  to,
  reduced,
  format,
  duration,
  delay,
  className,
}: {
  to: number;
  reduced: boolean;
  format: (n: number) => string;
  duration?: number;
  delay?: number;
  className?: string;
}) {
  const v = useCount(to, { reduced, duration, delay });
  return <span className={cn("num", className)}>{format(v)}</span>;
}

export function Button({
  children,
  press = false,
  reduced,
  className,
}: {
  children: ReactNode;
  press?: boolean;
  reduced: boolean;
  className?: string;
}) {
  return (
    <span className="relative inline-flex">
      <span
        className={cn(
          "inline-flex h-10 items-center gap-1.5 rounded-full bg-cta px-4 text-[13.5px] font-medium text-cta-ink",
          press && !reduced && "demo-press",
          className,
        )}
      >
        {children}
      </span>
      {press && !reduced ? (
        <MousePointer2
          aria-hidden
          className="demo-cursor absolute -right-3 -bottom-4 h-5 w-5 fill-ink text-white drop-shadow"
          strokeWidth={1.5}
        />
      ) : null}
    </span>
  );
}

export function Toast({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "demo-toast inline-flex items-center gap-1.5 rounded-full bg-cta px-3 py-1.5 text-[12px] font-medium text-cta-ink shadow-raised",
        className,
      )}
      style={d(delay)}
    >
      <Check aria-hidden className="h-3.5 w-3.5 text-[var(--mint)]" />{" "}
      {children}
    </span>
  );
}

export function Label({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "text-[12px] font-medium tracking-[0.01em] text-muted",
        className,
      )}
    >
      {children}
    </p>
  );
}

/** Card surface used by "bare" scenes that float directly on the backdrop. */
export function Float({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-line bg-surface/95 shadow-raised backdrop-blur",
        className,
      )}
      style={style}
    >
      {children}
    </div>
  );
}

/** Radial gauge from 0 to 1 drawn with a stroke animation. */
export function Ring({
  value,
  size = 84,
  label,
  className,
  delay = 0,
}: {
  value: number;
  size?: number;
  label?: ReactNode;
  className?: string;
  delay?: number;
}) {
  const r = 34;
  const c = 2 * Math.PI * r;
  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 80 80"
        className="absolute inset-0 -rotate-90"
        aria-hidden
      >
        <circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          stroke="var(--line)"
          strokeWidth="7"
        />
        <circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={`${c * value} ${c}`}
          className="demo-ring"
          style={{ "--len": c * value, "--d": `${delay}ms` } as CSSProperties}
        />
      </svg>
      {label ? <span className="relative text-center">{label}</span> : null}
    </div>
  );
}
