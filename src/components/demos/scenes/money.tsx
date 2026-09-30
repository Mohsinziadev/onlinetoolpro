"use client";

import { Clock, Heart, MessageCircle, Tag, Trophy } from "lucide-react";
import {
  Button,
  CountUp,
  FakeThumb,
  Field,
  Float,
  Label,
  Ring,
  Typed,
  d,
  useStepper,
  vars,
  type SceneProps,
} from "@/components/demos/kit";
import { cn } from "@/lib/utils";

const money = (n: number) => `$${Math.round(n).toLocaleString()}`;

/* Earnings Calculator — drag the views slider → coins stack up → day / month / year bars rise. */
export function RevenueScene({ phase, reduced }: SceneProps) {
  if (phase === 0)
    return (
      <div className="space-y-5">
        <div className="flex items-baseline justify-between">
          <Label>Views per day</Label>
          <CountUp
            to={25000}
            reduced={reduced}
            duration={1100}
            format={(n) => Math.round(n).toLocaleString()}
            className="text-[22px] font-medium tracking-[-0.02em] text-ink"
          />
        </div>
        <div className="relative h-2 rounded-full bg-line">
          <div
            className="demo-width absolute inset-y-0 left-0 rounded-full bg-accent"
            style={vars({
              "--from-w": "0%",
              "--to-w": "62%",
              animationDuration: "1.6s",
            })}
          />
          <span
            className={cn(
              "absolute -top-2 left-0 h-6 w-6 rounded-full border-2 border-accent bg-surface shadow-raised",
              !reduced && "demo-drag",
            )}
            style={vars({ "--from": "0px", "--to": "210px" })}
          />
        </div>
        <div className="flex gap-2">
          {["$2", "$3.50", "$6"].map((r, i) => (
            <span
              key={r}
              className={cn(
                "rounded-full border px-3 py-1 text-[12.5px]",
                i === 1
                  ? "border-cta bg-cta text-cta-ink"
                  : "border-line text-ink-2",
              )}
            >
              RPM {r}
            </span>
          ))}
        </div>
      </div>
    );
  if (phase === 1)
    return (
      <div className="flex h-[220px] items-end justify-center gap-6">
        <div className="flex flex-col-reverse items-center">
          {Array.from({ length: 7 }, (_, i) => (
            <span
              key={i}
              className="demo-fall -mt-2 h-4 w-14 rounded-[50%] border border-[#c9941f] bg-[#f5c451] shadow-[0_2px_0_#c9941f]"
              style={d(i * 180, { "--fx": "0px", "--fr": "0deg" })}
            />
          ))}
        </div>
        <div className="pb-2">
          <Label>Per day</Label>
          <CountUp
            to={87.5}
            reduced={reduced}
            duration={1100}
            format={(n) => `$${n.toFixed(2)}`}
            className="mt-1 block text-[30px] font-medium tracking-[-0.03em] text-ink"
          />
        </div>
      </div>
    );
  const bars: [string, number, number][] = [
    ["Day", 87.5, 8],
    ["Month", 2663, 36],
    ["Year", 31938, 100],
  ];
  return (
    <div className="flex h-[230px] items-end justify-around gap-4">
      {bars.map(([l, v, h], i) => (
        <div
          key={l}
          className="flex h-full w-20 flex-col items-center justify-end"
        >
          <CountUp
            to={v}
            reduced={reduced}
            delay={i * 250}
            format={money}
            className="mb-2 text-[14px] font-medium text-ink"
          />
          <div
            className="demo-grow-y w-full rounded-t-lg bg-accent"
            style={{
              ...d(i * 250),
              height: `${Math.max(h, 6) * 0.7}%`,
              opacity: 0.55 + i * 0.2,
            }}
          />
          <span className="mt-2 text-[12px] text-muted">{l}</span>
        </div>
      ))}
    </div>
  );
}

/* RPM Calculator — two figures → formula tiles snap together → a gauge needle swings to the answer. */
export function RpmScene({ phase, reduced }: SceneProps) {
  if (phase === 0)
    return (
      <div className="grid grid-cols-2 gap-3">
        {[
          ["You earned", "$850"],
          ["Your views", "210,000"],
        ].map(([l, v], i) => (
          <Float key={l} className="p-4">
            <Label>{l}</Label>
            <p className="mt-2 text-[24px] font-medium tracking-[-0.02em] text-ink">
              <Typed text={v} reduced={reduced} delay={200 + i * 600} />
            </p>
          </Float>
        ))}
      </div>
    );
  if (phase === 1)
    return (
      <div className="flex h-[200px] flex-wrap items-center justify-center gap-2 font-mono text-[15px]">
        {[
          ["$850", "demo-slide-l", 0],
          ["÷", "demo-pop", 300],
          ["210,000", "demo-slide-r", 150],
          ["×", "demo-pop", 600],
          ["1,000", "demo-slide-r", 450],
          ["=", "demo-pop", 1000],
          ["?", "demo-toast", 1300],
        ].map(([t, cls, delay]) => (
          <span
            key={t as string}
            className={cn(
              cls as string,
              t === "?"
                ? "rounded-xl bg-cta px-3 py-2 text-cta-ink"
                : /[÷×=]/.test(t as string)
                  ? "px-1 text-muted"
                  : "rounded-xl border border-line bg-surface px-3 py-2 text-ink shadow-card",
            )}
            style={d(delay as number)}
          >
            {t}
          </span>
        ))}
      </div>
    );
  return (
    <div className="flex flex-col items-center">
      <div className="relative h-28 w-56 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-56 rounded-full border-[14px] border-line" />
        <div className="absolute inset-x-0 top-0 h-56 rounded-full border-[14px] border-transparent border-t-accent border-l-accent/60" />
        <div
          className="demo-needle absolute bottom-0 left-1/2 h-24 w-1 -translate-x-1/2 rounded-full bg-ink"
          style={vars({ "--from": "-90deg", "--to": "25deg" })}
        />
        <span className="absolute bottom-0 left-1/2 h-4 w-4 -translate-x-1/2 translate-y-1/2 rounded-full bg-ink" />
      </div>
      <CountUp
        to={4.05}
        reduced={reduced}
        format={(n) => `$${n.toFixed(2)}`}
        className="mt-4 text-[34px] font-medium tracking-[-0.03em] text-ink"
      />
      <p className="text-[12.5px] text-muted">earned per 1,000 views</p>
    </div>
  );
}

/* CPM Calculator — enter the figures → a grid of ad views fills in, block by block → the price tag swings in. */
export function CpmScene({ phase, reduced }: SceneProps) {
  const dots = useStepper(100, { reduced, every: 11, delay: 100 });
  if (phase === 0)
    return (
      <div className="space-y-3">
        {[
          ["Ad revenue", "$1,240"],
          ["Ad views", "180,000"],
        ].map(([l, v], i) => (
          <div key={l} className="flex items-center gap-3">
            <span className="w-24 shrink-0 text-[13px] text-muted">{l}</span>
            <Field focused={i === 0} className="flex-1">
              <Typed text={v} reduced={reduced} delay={200 + i * 550} />
            </Field>
          </div>
        ))}
        <div className="flex justify-end pt-1">
          <Button press reduced={reduced}>
            Calculate
          </Button>
        </div>
      </div>
    );
  if (phase === 1)
    return (
      <div className="flex items-center gap-5">
        <div className="grid grid-cols-10 gap-1">
          {Array.from({ length: 100 }, (_, i) => (
            <span
              key={i}
              className={cn(
                "h-3 w-3 rounded-[3px] transition-colors duration-150",
                i < dots ? "bg-accent" : "bg-line/70",
              )}
            />
          ))}
        </div>
        <p className="text-[13px] leading-snug text-muted">
          Each block is
          <br />
          <span className="font-medium text-ink">1,000 ad views</span>
        </p>
      </div>
    );
  return (
    <div className="flex items-center justify-around">
      <div
        className="demo-swing relative flex flex-col items-center"
        style={d(100)}
      >
        <span className="h-8 w-px bg-line-strong" />
        <span className="relative flex items-center gap-2 rounded-xl bg-cta py-3 pr-5 pl-4 text-cta-ink shadow-float">
          <Tag aria-hidden className="h-5 w-5 text-[var(--mint)]" />
          <span>
            <span className="block text-[11px] opacity-70">Your CPM</span>
            <span className="block text-[26px] leading-none font-medium tracking-[-0.03em]">
              $6.89
            </span>
          </span>
        </span>
      </div>
      <div className="w-32 space-y-2 text-[12px]">
        {[
          ["CPM", 100, "bg-accent"],
          ["RPM", 58, "bg-[var(--tint-ink)] opacity-40"],
        ].map(([l, w, c], i) => (
          <div key={l as string}>
            <span className="text-muted">{l}</span>
            <div className="mt-1 h-2 rounded-full bg-line/60">
              <div
                className={cn("demo-grow-x h-full rounded-full", c as string)}
                style={{ ...d(600 + i * 200), width: `${w}%` }}
              />
            </div>
          </div>
        ))}
        <p className="pt-1 text-[11.5px] leading-snug text-muted">
          RPM is usually lower — it&apos;s after YouTube&apos;s share.
        </p>
      </div>
    </div>
  );
}

/* Watch Time Calculator — views × average watch → the clock spins → a goal bar fills past 4,000 hours. */
export function WatchTimeScene({ phase, reduced }: SceneProps) {
  if (phase === 0)
    return (
      <div className="flex items-center justify-center gap-3">
        <Float className="p-4 text-center">
          <Label>Views</Label>
          <p className="mt-1 text-[22px] font-medium text-ink">
            <Typed text="48,000" reduced={reduced} />
          </p>
        </Float>
        <span className="text-[22px] text-muted">×</span>
        <Float className="p-4 text-center">
          <Label>Avg. watch</Label>
          <p className="mt-1 text-[22px] font-medium text-ink">
            <Typed text="6:20" reduced={reduced} delay={650} />
          </p>
        </Float>
      </div>
    );
  if (phase === 1)
    return (
      <div className="flex h-[220px] flex-col items-center justify-center">
        <div className="relative flex h-32 w-32 items-center justify-center rounded-full border-[6px] border-line bg-surface shadow-raised">
          {Array.from({ length: 12 }, (_, i) => (
            <span
              key={i}
              className="absolute top-1.5 left-1/2 h-2 w-0.5 -translate-x-1/2 bg-line-strong"
              style={{
                transform: `rotate(${i * 30}deg)`,
                transformOrigin: "50% 58px",
              }}
            />
          ))}
          <span
            className={cn(
              "absolute bottom-1/2 left-1/2 h-11 w-1 -translate-x-1/2 rounded-full bg-accent",
              !reduced && "demo-spin",
            )}
            style={vars({ transformOrigin: "50% 100%", "--dur": "1.2s" })}
          />
          <span
            className={cn(
              "absolute bottom-1/2 left-1/2 h-8 w-1 -translate-x-1/2 rounded-full bg-ink",
              !reduced && "demo-spin",
            )}
            style={vars({ transformOrigin: "50% 100%", "--dur": "6s" })}
          />
          <span className="h-3 w-3 rounded-full bg-ink" />
        </div>
        <p className="mt-4 flex items-center gap-1.5 text-[13px] text-muted">
          <Clock aria-hidden className="h-3.5 w-3.5" /> Adding up every minute
          watched…
        </p>
      </div>
    );
  return (
    <div>
      <CountUp
        to={5067}
        reduced={reduced}
        format={(n) => `${Math.round(n).toLocaleString()} hours`}
        className="block text-[32px] font-medium tracking-[-0.03em] text-ink"
      />
      <p className="text-[12.5px] text-muted">watched in total</p>
      <div className="relative mt-6 h-3 rounded-full bg-line/70">
        <div
          className="demo-width absolute inset-y-0 left-0 rounded-full bg-accent"
          style={vars({ "--from-w": "0%", "--to-w": "100%" })}
        />
        <span className="absolute top-1/2 left-[79%] h-6 w-0.5 -translate-y-1/2 bg-ink" />
        <span className="absolute top-5 left-[79%] -translate-x-1/2 text-[11px] text-muted">
          4,000 h goal
        </span>
      </div>
      <span
        className="demo-toast mt-10 inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1.5 text-[12.5px] font-medium text-accent"
        style={d(1000)}
      >
        <Trophy aria-hidden className="h-3.5 w-3.5" /> Goal passed
      </span>
    </div>
  );
}

/* Engagement Calculator — views, likes, comments → hearts and comments float off the video → two rate rings fill. */
export function EngagementScene({ phase, reduced }: SceneProps) {
  if (phase === 0)
    return (
      <div className="grid grid-cols-3 gap-2">
        {[
          ["Views", "92,000"],
          ["Likes", "4,100"],
          ["Comments", "380"],
        ].map(([l, v], i) => (
          <div key={l}>
            <Label>{l}</Label>
            <Field focused={i === 0} className="mt-1.5 px-3">
              <Typed text={v} reduced={reduced} delay={150 + i * 450} />
            </Field>
          </div>
        ))}
      </div>
    );
  if (phase === 1)
    return (
      <div className="relative mx-auto h-[230px] max-w-xs">
        <FakeThumb className="absolute inset-x-6 bottom-0 rounded-xl shadow-raised" />
        {Array.from({ length: 8 }, (_, i) => {
          const Icon = i % 3 === 2 ? MessageCircle : Heart;
          return (
            <Icon
              key={i}
              aria-hidden
              className={cn(
                "absolute h-6 w-6",
                i % 3 === 2
                  ? "text-[var(--tint-ink)]"
                  : "fill-[#f06b8a] text-[#f06b8a]",
                !reduced && "demo-float",
              )}
              style={d(i * 180, {
                left: `${12 + ((i * 37) % 76)}%`,
                bottom: reduced ? `${66 + (i % 3) * 9}%` : "30%",
              })}
            />
          );
        })}
      </div>
    );
  return (
    <div className="flex items-center justify-around">
      {[
        [0.446, "4.46%", "Like rate"],
        [0.041, "0.41%", "Comment rate"],
      ].map(([v, text, label], i) => (
        <div
          key={label as string}
          className="demo-pop flex flex-col items-center"
          style={d(i * 250)}
        >
          <Ring
            value={Math.max(v as number, 0.06) * 1.6}
            size={104}
            delay={i * 250}
            label={
              <span className="text-[17px] font-medium text-ink">{text}</span>
            }
          />
          <p className="mt-2 text-[12.5px] text-muted">{label}</p>
        </div>
      ))}
    </div>
  );
}
