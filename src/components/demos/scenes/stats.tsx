"use client";

import { AtSign, Camera, Crown, Link2, MessageCircle } from "lucide-react";
import {
  Button,
  CountUp,
  FakeThumb,
  Field,
  Float,
  Label,
  Typed,
  d,
  useStepper,
  vars,
  type SceneProps,
} from "@/components/demos/kit";
import { cn } from "@/lib/utils";

const compact = (n: number) =>
  n >= 1e6
    ? `${(n / 1e6).toFixed(1)}M`
    : n >= 1e3
      ? `${Math.round(n / 1e3)}K`
      : `${Math.round(n)}`;

function Avatar({
  letter,
  tone = 0,
  className,
}: {
  letter: string;
  tone?: number;
  className?: string;
}) {
  const bg = [
    "bg-[var(--tint-3)] text-[var(--tint-ink)]",
    "bg-[#f7e2c6] text-[#8a5f2c]",
    "bg-[#dde2ef] text-[#45558a]",
    "bg-[#cdfde2] text-[#1f7a58]",
  ][tone % 4];
  return (
    <span
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[14px] font-medium",
        bg,
        className,
      )}
    >
      {letter}
    </span>
  );
}

/* Channel Checker — handle → numbers count up on a profile → an upload calendar fills in. */
export function AuditScene({ phase, reduced }: SceneProps) {
  const cells = useStepper(35, { reduced, every: 36, delay: 100 });
  if (phase === 0)
    return (
      <div className="space-y-3">
        <Label>Any public channel</Label>
        <Field focused>
          <AtSign aria-hidden className="h-4 w-4 shrink-0 text-faint" />
          <Typed text="CookingWithMaya" reduced={reduced} />
        </Field>
        <div className="flex justify-end">
          <Button press reduced={reduced}>
            Check channel
          </Button>
        </div>
      </div>
    );
  if (phase === 1)
    return (
      <div>
        <div className="flex items-center gap-3">
          <Avatar letter="M" className="h-12 w-12 text-[18px]" />
          <div>
            <p className="text-[15px] font-medium text-ink">
              Cooking with Maya
            </p>
            <p className="text-[12px] text-muted">@CookingWithMaya</p>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-2">
          {(
            [
              ["Subscribers", 248000],
              ["Views", 31200000],
              ["Videos", 412],
            ] as const
          ).map(([l, v], i) => (
            <div
              key={l}
              className="rounded-xl border border-line bg-surface p-3"
            >
              <p className="text-[11.5px] text-muted">{l}</p>
              <CountUp
                to={v}
                reduced={reduced}
                delay={i * 200}
                format={compact}
                className="mt-1 block text-[20px] font-medium tracking-[-0.02em] text-ink"
              />
            </div>
          ))}
        </div>
      </div>
    );
  const on = new Set([0, 4, 8, 11, 15, 19, 22, 26, 30, 33]);
  return (
    <div>
      <Label>Uploads, last 5 weeks</Label>
      <div className="mt-3 grid max-w-[260px] grid-cols-7 gap-1">
        {Array.from({ length: 35 }, (_, i) => (
          <span
            key={i}
            className={cn(
              "aspect-square rounded-[4px] transition-colors duration-200",
              i < cells
                ? on.has(i)
                  ? "bg-accent"
                  : "bg-[var(--tint-2)]"
                : "bg-line/60",
            )}
          />
        ))}
      </div>
      <p className="mt-3 text-[13px] text-ink">
        Posts every <span className="font-medium">4 days</span> · usually on
        weekends
      </p>
    </div>
  );
}

/* Channel Tracker — start tracking → a camera snaps the numbers each day → the growth line draws. */
export function TrackerScene({ phase, reduced }: SceneProps) {
  const days = useStepper(7, { reduced, every: 240, delay: 100 });
  if (phase === 0)
    return (
      <Float className="flex items-center gap-2 p-3">
        <Field focused className="flex-1">
          <Link2 aria-hidden className="h-4 w-4 shrink-0 text-faint" />
          <Typed text="@CookingWithMaya" reduced={reduced} />
        </Field>
        <Button press reduced={reduced}>
          Track
        </Button>
      </Float>
    );
  if (phase === 1)
    return (
      <div>
        <div className="grid grid-cols-7 gap-1.5">
          {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
            <Float
              key={i}
              className={cn(
                "flex flex-col items-center py-3 transition-opacity",
                i < days ? "opacity-100" : "opacity-40",
              )}
            >
              <span className="text-[11px] text-muted">{day}</span>
              {i < days ? (
                <Camera
                  aria-hidden
                  className="demo-toast mt-2 h-4 w-4 text-accent"
                />
              ) : (
                <span className="mt-2 h-4 w-4" />
              )}
              <span className="num mt-1 text-[10.5px] text-ink">
                {i < days ? `${(246 + i * 0.3).toFixed(1)}K` : "—"}
              </span>
            </Float>
          ))}
        </div>
        <p className="mt-4 text-center text-[12.5px] text-muted">
          A real snapshot, saved every day.
        </p>
      </div>
    );
  return (
    <Float className="p-4">
      <Label>Subscribers, last 90 days</Label>
      <CountUp
        to={12480}
        reduced={reduced}
        format={(n) => `+${Math.round(n).toLocaleString()}`}
        className="mt-1 block text-[24px] font-medium tracking-[-0.03em] text-accent"
      />
      <svg
        viewBox="0 0 300 90"
        className="mt-2 h-24 w-full overflow-visible"
        aria-hidden
      >
        <path
          d="M0 80 C40 76 60 70 90 62 S150 50 180 40 S250 18 300 8 L300 90 L0 90Z"
          fill="var(--accent-soft)"
          className="demo-pop"
          style={d(700)}
        />
        <path
          d="M0 80 C40 76 60 70 90 62 S150 50 180 40 S250 18 300 8"
          fill="none"
          stroke="var(--accent)"
          strokeWidth={2.5}
          strokeLinecap="round"
          className="demo-draw"
          style={vars({ "--len": 360 })}
        />
        <circle
          cx="300"
          cy="8"
          r="5"
          fill="var(--accent)"
          className="demo-toast"
          style={d(1000)}
        />
      </svg>
    </Float>
  );
}

/* Channel Comparison — channels join the lineup → they race down their lanes → a crown lands on the leader. */
const CHANNELS: [string, string, number][] = [
  ["M", "Cooking with Maya", 82],
  ["Q", "Quick Eats", 64],
  ["H", "Home Chef Lab", 47],
];
export function CompetitorScene({ phase }: SceneProps) {
  if (phase === 0)
    return (
      <div>
        <Label>Add up to five channels</Label>
        <div className="mt-4 flex items-center gap-3">
          {CHANNELS.map(([l, name], i) => (
            <div
              key={name}
              className="demo-fall flex flex-col items-center gap-1.5"
              style={d(i * 250, { "--fx": "0px", "--fr": "0deg" })}
            >
              <Avatar letter={l} tone={i} className="h-12 w-12 text-[17px]" />
              <span className="max-w-20 truncate text-[11px] text-muted">
                {name}
              </span>
            </div>
          ))}
          <span
            className="demo-pop flex h-12 w-12 items-center justify-center rounded-full border-2 border-dashed border-line-strong text-[20px] text-faint"
            style={d(800)}
          >
            +
          </span>
        </div>
      </div>
    );
  if (phase === 1)
    return (
      <div className="space-y-3">
        {CHANNELS.map(([l, name, v], i) => (
          <div
            key={name}
            className="relative h-11 rounded-full border border-line bg-surface"
          >
            <span className="absolute inset-y-0 left-0 flex items-center pl-1.5">
              <span
                className="demo-drag inline-block"
                style={d(i * 120, { "--from": "0px", "--to": `${v * 2.6}px` })}
              >
                <Avatar letter={l} tone={i} className="h-8 w-8 text-[12px]" />
              </span>
            </span>
            <span className="absolute inset-y-0 right-3 flex items-center text-[11px] text-faint">
              🏁
            </span>
          </div>
        ))}
      </div>
    );
  return (
    <div className="space-y-4">
      {CHANNELS.map(([l, name, v], i) => (
        <div key={name} className="flex items-center gap-3">
          <span className="relative">
            <Avatar letter={l} tone={i} />
            {i === 0 ? (
              <Crown
                aria-hidden
                className="demo-swing absolute -top-3.5 left-1.5 h-5 w-5 fill-[#f5c451] text-[#c9941f]"
                style={d(900)}
              />
            ) : null}
          </span>
          <div className="flex-1">
            <div className="flex justify-between text-[12px]">
              <span className="text-ink-2">{name}</span>
              <span className="num text-muted">{v}K avg views</span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-line/70">
              <div
                className={cn(
                  "demo-grow-x h-full rounded-full",
                  i === 0 ? "bg-accent" : "bg-[var(--tint-ink)] opacity-40",
                )}
                style={{ ...d(i * 150), width: `${v}%` }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* Video Comparison — two videos slide in from each side → VS → a tug-of-war bar per stat. */
export function VideoComparisonScene({ phase, reduced }: SceneProps) {
  const cards = (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
      <div className="demo-slide-l">
        <FakeThumb className="rounded-lg" variant={0} />
        <p className="mt-1.5 truncate text-[12px] text-ink">Pasta in 20 min</p>
      </div>
      {phase === 1 ? (
        <span className="relative flex h-10 w-10 items-center justify-center">
          {!reduced ? (
            <span
              aria-hidden
              className="demo-ping absolute inset-0 rounded-full bg-accent/40"
            />
          ) : null}
          <span
            className="demo-toast relative flex h-10 w-10 items-center justify-center rounded-full bg-cta text-[12px] font-semibold text-cta-ink"
            style={d(500)}
          >
            VS
          </span>
        </span>
      ) : (
        <span className="w-4" />
      )}
      <div className="demo-slide-r">
        <FakeThumb className="rounded-lg" variant={1} />
        <p className="mt-1.5 truncate text-[12px] text-ink">Weekly meal prep</p>
      </div>
    </div>
  );
  if (phase < 2) return <Float className="p-4">{cards}</Float>;
  const stats: [string, number][] = [
    ["Views", 64],
    ["Likes", 71],
    ["Comments", 38],
  ];
  return (
    <Float className="space-y-3.5 p-4">
      {stats.map(([l, left], i) => (
        <div key={l}>
          <div className="flex justify-between text-[11.5px] text-muted">
            <span className={cn(left > 50 && "font-medium text-accent")}>
              {left}%
            </span>
            <span className="text-ink-2">{l}</span>
            <span className={cn(left < 50 && "font-medium text-accent")}>
              {100 - left}%
            </span>
          </div>
          <div className="mt-1.5 flex h-2.5 overflow-hidden rounded-full bg-line/60">
            <div
              className="demo-width h-full bg-accent"
              style={d(i * 200, { "--from-w": "50%", "--to-w": `${left}%` })}
            />
            <div className="h-full flex-1 bg-[var(--tint-ink)] opacity-30" />
          </div>
        </div>
      ))}
      <p className="pt-1 text-[12.5px] text-ink">
        <span className="font-medium">Pasta in 20 min</span> is ahead on views
        and likes.
      </p>
    </Float>
  );
}

/* Comment Summary — link → comments stream past → they cluster into the questions people repeat. */
const BUBBLES = [
  "Can you do a vegan version?",
  "What pan is that? 😍",
  "Vegan version please!",
  "Dessert next?",
  "Where's the pan from?",
  "Made this tonight!",
];
export function CommentsScene({ phase, reduced }: SceneProps) {
  if (phase === 0)
    return (
      <div className="space-y-3">
        <Label>Paste the comments, one per line</Label>
        <div className="min-h-28 rounded-2xl border border-accent/50 bg-surface p-4 text-[13.5px] leading-relaxed whitespace-pre-line ring-4 ring-accent/10">
          <Typed text={BUBBLES.slice(0, 4).join("\n")} reduced={reduced} wrap speed={18} />
        </div>
      </div>
    );
  if (phase === 1 && reduced)
    return (
      <div className="flex flex-col items-start gap-2">
        {BUBBLES.slice(0, 4).map((b) => (
          <span
            key={b}
            className="inline-flex items-center gap-1.5 rounded-2xl rounded-bl-sm border border-line bg-surface px-3 py-1.5 text-[12.5px] text-ink-2 shadow-card"
          >
            <MessageCircle aria-hidden className="h-3.5 w-3.5 text-accent" />{" "}
            {b}
          </span>
        ))}
      </div>
    );
  if (phase === 1)
    return (
      <div className="relative h-[230px] overflow-hidden">
        {BUBBLES.map((b, i) => (
          <span
            key={b}
            className={cn(
              "absolute inline-flex items-center gap-1.5 rounded-2xl rounded-bl-sm border border-line bg-surface px-3 py-1.5 text-[12.5px] text-ink-2 shadow-card",
              !reduced && "demo-float",
            )}
            style={d(i * 260, {
              left: `${(i % 3) * 22 + 2}%`,
              bottom: `${10 + (i % 2) * 18}%`,
            })}
          >
            <MessageCircle aria-hidden className="h-3.5 w-3.5 text-accent" />{" "}
            {b}
          </span>
        ))}
      </div>
    );
  const groups: [string, number][] = [
    ["Asked for a vegan version", 42],
    ["Asked about the pan", 31],
    ["Want a dessert video", 18],
  ];
  return (
    <div className="space-y-2.5">
      {groups.map(([g, n], i) => (
        <div
          key={g}
          className="demo-pop flex items-center gap-3 rounded-xl border border-line bg-surface px-3.5 py-3"
          style={d(i * 220)}
        >
          <span className="flex -space-x-2">
            {[0, 1, 2].map((k) => (
              <Avatar
                key={k}
                letter={"ABC"[k]}
                tone={k + i}
                className="h-6 w-6 border-2 border-surface text-[10px]"
              />
            ))}
          </span>
          <span className="flex-1 text-[13px] text-ink">{g}</span>
          <CountUp
            to={n}
            reduced={reduced}
            delay={i * 220}
            format={(v) => `${Math.round(v)}×`}
            className="rounded-full bg-accent-soft px-2 py-0.5 text-[12px] font-medium text-accent"
          />
        </div>
      ))}
    </div>
  );
}

/* Video Idea Finder — your topics vs theirs → two circles overlap → the topics only they cover pop out. */
export function GapScene({ phase }: SceneProps) {
  if (phase === 0)
    return (
      <div className="grid grid-cols-2 gap-3">
        {[
          ["Your channel", ["pasta", "sauces", "quick dinner"]],
          [
            "Similar channels",
            ["pasta", "air fryer", "meal prep", "budget meals"],
          ],
        ].map(([title, chips], i) => (
          <Float
            key={title as string}
            className={cn("p-3.5", i === 0 ? "demo-slide-l" : "demo-slide-r")}
          >
            <p className="text-[12.5px] font-medium text-ink">
              {title as string}
            </p>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {(chips as string[]).map((c) => (
                <span
                  key={c}
                  className="rounded-full bg-bg-subtle px-2 py-0.5 text-[11.5px] text-ink-2"
                >
                  {c}
                </span>
              ))}
            </div>
          </Float>
        ))}
      </div>
    );
  if (phase === 1)
    return (
      <div className="relative mx-auto flex h-[220px] w-full max-w-xs items-center justify-center">
        <span
          className={cn(
            "absolute left-2 h-40 w-40 rounded-full border-2 border-accent/50 bg-accent/10 demo-drag",
          )}
          style={d(0, { "--from": "-30px", "--to": "20px" })}
        />
        <span
          className={cn(
            "absolute right-2 h-40 w-40 rounded-full border-2 border-[var(--tint-ink)]/40 bg-[var(--tint-2)] demo-drag",
          )}
          style={d(0, { "--from": "30px", "--to": "-20px" })}
        />
        <span className="relative z-10 text-[11px] font-medium text-ink">
          shared
        </span>
        <span className="absolute bottom-0 left-4 text-[11px] text-muted">
          You
        </span>
        <span className="absolute right-4 bottom-0 text-[11px] text-muted">
          Them
        </span>
      </div>
    );
  return (
    <div>
      <p className="text-[15px] font-medium text-ink">
        5 topics you haven&apos;t covered
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {[
          "air fryer",
          "meal prep",
          "budget meals",
          "breakfast",
          "sourdough",
        ].map((t, i) => (
          <span
            key={t}
            className="demo-fall rounded-full border border-accent/30 bg-accent-soft px-3 py-1.5 text-[13px] text-ink"
            style={d(i * 170, {
              "--fx": "0px",
              "--fr": `${(i % 2 ? 1 : -1) * 8}deg`,
            })}
          >
            {t}
          </span>
        ))}
      </div>
      <p className="mt-4 text-[12.5px] text-muted">
        Each links to the videos it was found in.
      </p>
    </div>
  );
}
