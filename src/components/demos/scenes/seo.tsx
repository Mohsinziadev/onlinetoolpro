"use client";

import { CheckCircle2, CircleAlert, Link2, Loader2 } from "lucide-react";
import { Button, CountUp, FakeThumb, Field, Float, Label, Toast, Typed, d, useStepper, type SceneProps } from "@/components/demos/kit";
import { cn } from "@/lib/utils";

/* SEO Checker — link → each check spins then ticks → results sorted into "improve" and "good". */
const CHECKS: [string, boolean][] = [
  ["Title length", true],
  ["Opening line", false],
  ["Chapters", true],
  ["Hashtags", true],
  ["Captions", false],
];
export function SeoCheckerScene({ phase, reduced }: SceneProps) {
  const done = useStepper(CHECKS.length, { reduced, every: 260, delay: 150 });
  if (phase === 0)
    return (
      <div className="space-y-3">
        <Label>Any public video</Label>
        <Field focused>
          <Link2 aria-hidden className="h-4 w-4 shrink-0 text-faint" />
          <Typed text="youtube.com/watch?v=aqz-KE-bpKQ" reduced={reduced} />
        </Field>
        <div className="flex justify-end">
          <Button press reduced={reduced}>Check video</Button>
        </div>
      </div>
    );
  if (phase === 1)
    return (
      <ul className="space-y-2">
        {CHECKS.map(([label], i) => (
          <li key={label} className="flex items-center gap-3 rounded-xl border border-line bg-surface px-3.5 py-2.5 text-[13.5px]">
            {i < done ? (
              <CheckCircle2 aria-hidden className="demo-toast h-4 w-4 text-accent" />
            ) : (
              <Loader2 aria-hidden className="h-4 w-4 animate-spin text-faint" />
            )}
            <span className={i < done ? "text-ink" : "text-muted"}>{label}</span>
          </li>
        ))}
      </ul>
    );
  return (
    <div className="space-y-3">
      <div className="flex gap-2 text-[12px]">
        <span className="demo-pop rounded-full bg-warning-soft px-2.5 py-1 font-medium text-warning">2 to improve</span>
        <span className="demo-pop rounded-full bg-success-soft px-2.5 py-1 font-medium text-success" style={d(120)}>
          3 looking good
        </span>
      </div>
      {[...CHECKS].sort((a, b) => Number(a[1]) - Number(b[1])).map(([label, ok], i) => (
        <div key={label} className="demo-slide-l flex items-center gap-3 rounded-xl border border-line bg-surface px-3.5 py-2.5" style={d(200 + i * 110)}>
          {ok ? <CheckCircle2 aria-hidden className="h-4 w-4 text-success" /> : <CircleAlert aria-hidden className="h-4 w-4 text-warning" />}
          <span className="flex-1 text-[13.5px] text-ink">{label}</span>
          <span className={cn("text-[11.5px]", ok ? "text-success" : "text-warning")}>{ok ? "Looks good" : "Improve"}</span>
        </div>
      ))}
    </div>
  );
}

/* Hashtag Generator — keywords typed → each phrase flips into a hashtag → the first three sit above a video title. */
const PHRASES: [string, string][] = [
  ["easy pasta", "#EasyPasta"],
  ["weeknight dinner", "#WeeknightDinner"],
  ["italian cooking", "#ItalianCooking"],
  ["recipe", "#Recipe"],
];
export function HashtagScene({ phase, reduced }: SceneProps) {
  if (phase === 0)
    return (
      <Float className="p-5">
        <Label>Topic and keywords</Label>
        <p className="mt-3 min-h-16 text-[16px] leading-relaxed">
          <Typed text={PHRASES.map((p) => p[0]).join(", ")} reduced={reduced} wrap speed={24} />
        </p>
      </Float>
    );
  if (phase === 1)
    return (
      <div className="flex flex-wrap justify-center gap-2.5 [perspective:500px]">
        {PHRASES.map(([plain, tag], i) => (
          <span key={tag} className="relative inline-flex">
            <span className="demo-flip rounded-full border border-accent/30 bg-surface px-3.5 py-2 text-[15px] font-medium text-accent shadow-card" style={d(250 + i * 220)}>
              {tag}
            </span>
            <span className="sr-only">{plain}</span>
          </span>
        ))}
        <p className="demo-pop w-full pt-3 text-center text-[12.5px] text-muted" style={d(1200)}>
          Spaces removed · capitals kept for readability
        </p>
      </div>
    );
  return (
    <Float className="p-4">
      <FakeThumb className="rounded-lg" />
      <p className="mt-3 flex gap-2 text-[12.5px] font-medium text-[#2e6bd8] dark:text-[#8fb5ff]">
        {PHRASES.slice(0, 3).map(([, tag], i) => (
          <span key={tag} className="demo-toast" style={d(i * 160)}>
            {tag}
          </span>
        ))}
      </p>
      <p className="mt-1 text-[15px] leading-snug font-medium text-ink">Easy 20-minute pasta for busy weeknights</p>
      <p className="demo-pop mt-3 text-[12px] text-muted" style={d(700)}>
        The first three show above your title.
      </p>
    </Float>
  );
}

/* Description Generator — summary typed → blocks stack in order → preview under a video with "…more". */
const BLOCKS = ["Summary", "Details", "Chapters", "Links", "Hashtags"];
export function DescriptionScene({ phase, reduced }: SceneProps) {
  if (phase === 0)
    return (
      <div>
        <Label>What is the video about?</Label>
        <div className="mt-3 min-h-24 rounded-2xl border border-accent/50 bg-surface p-4 text-[14.5px] leading-relaxed ring-4 ring-accent/10">
          <Typed text="How to make an easy 20-minute pasta for busy weeknights." reduced={reduced} wrap speed={24} />
        </div>
      </div>
    );
  if (phase === 1)
    return (
      <div className="flex flex-col gap-2">
        {BLOCKS.map((b, i) => (
          <div
            key={b}
            className="demo-fall flex items-center justify-between rounded-xl border border-line bg-surface px-4 py-2.5 shadow-card"
            style={d(i * 170, { "--fx": "0px", "--fr": "0deg" })}
          >
            <span className="text-[13.5px] font-medium text-ink">{b}</span>
            <span className="h-1.5 rounded-full bg-line" style={{ width: `${40 + ((i * 23) % 40)}%` }} />
          </div>
        ))}
      </div>
    );
  return (
    <div className="space-y-3">
      <div className="rounded-xl bg-bg-subtle p-4 text-[13.5px] leading-[1.5] text-ink">
        <p className="text-[12px] text-muted">184K views · 2 days ago</p>
        <p className="mt-1">
          How to make an easy 20-minute pasta for busy weeknights. Everything you need is probably already in your kitchen
          <span className="font-medium"> …more</span>
        </p>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[12.5px] text-muted">
          <CountUp to={842} reduced={reduced} duration={900} format={(n) => Math.round(n).toLocaleString()} /> / 5,000 characters
        </span>
        <Toast delay={900}>Copied</Toast>
      </div>
    </div>
  );
}
