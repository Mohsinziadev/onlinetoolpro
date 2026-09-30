"use client";

import {
  AtSign,
  Check,
  ClipboardPaste,
  Download,
  FolderDown,
  Link2,
  Play,
} from "lucide-react";
import {
  Button,
  CountUp,
  FakeThumb,
  Field,
  Float,
  Label,
  Toast,
  Typed,
  d,
  useScramble,
  useStepper,
  type SceneProps,
} from "@/components/demos/kit";
import { cn } from "@/lib/utils";

/* Thumbnail Downloader — paste from clipboard → image develops, sizes found → cards fan into Downloads. */
export function ThumbnailDownloaderScene({ phase, reduced }: SceneProps) {
  if (phase === 0)
    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <span className="demo-toast inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 text-[12px] text-ink-2 shadow-card">
            <ClipboardPaste aria-hidden className="h-3.5 w-3.5 text-accent" />{" "}
            Link copied from YouTube
          </span>
        </div>
        <Label>Your YouTube video link</Label>
        <Field focused>
          <Link2 aria-hidden className="h-4 w-4 shrink-0 text-faint" />
          <Typed
            text="youtube.com/watch?v=aqz-KE-bpKQ"
            reduced={reduced}
            delay={450}
          />
        </Field>
      </div>
    );
  if (phase === 1)
    return (
      <div className="space-y-4">
        <FakeThumb className={cn("rounded-xl", !reduced && "demo-blur-in")} />
        <div className="flex flex-wrap gap-2">
          {["1280 × 720", "640 × 480", "480 × 360", "320 × 180"].map((s, i) => (
            <span
              key={s}
              className="demo-pop inline-flex items-center gap-1 rounded-full bg-accent-soft px-2.5 py-1 text-[12px] text-accent"
              style={d(450 + i * 120)}
            >
              <Check aria-hidden className="h-3 w-3" /> {s}
            </span>
          ))}
        </div>
      </div>
    );
  return (
    <div className="relative flex h-[250px] items-start justify-center pt-2">
      {[
        { fx: "-120px", fy: "10px", fr: "-8deg", v: 2 as const },
        { fx: "120px", fy: "10px", fr: "8deg", v: 1 as const },
        { fx: "0px", fy: "-4px", fr: "0deg", v: 0 as const },
      ].map((c, i) => (
        <div
          key={i}
          className="demo-fan absolute w-40 rounded-xl border border-line bg-surface p-1.5 shadow-raised"
          style={d(i * 120, { "--fx": c.fx, "--fy": c.fy, "--fr": c.fr })}
        >
          <FakeThumb className="rounded-lg" badge={false} variant={c.v} />
        </div>
      ))}
      <div className="absolute bottom-0 flex items-center gap-3">
        <Button press reduced={reduced}>
          <Download aria-hidden className="h-4 w-4" /> Download
        </Button>
        <span className="relative inline-flex h-10 items-center gap-2 rounded-full border border-line bg-surface px-3 text-[13px] text-ink-2">
          <FolderDown aria-hidden className="h-4 w-4 text-accent" /> Downloads
          <span
            className="demo-toast absolute -top-2 -right-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[11px] font-medium text-accent-ink"
            style={d(1000)}
          >
            1
          </span>
        </span>
      </div>
    </div>
  );
}

/* Video ID Finder — a long messy link → a highlighter sweeps it and marks the ID → the ID lifts out. */
const LONG_URL = [
  "https://www.youtube.com/watch?v=",
  "aqz-KE-bpKQ",
  "&t=42s&list=PLx9…",
];
export function VideoIdScene({ phase, reduced }: SceneProps) {
  if (phase === 0)
    return (
      <Float className="p-5">
        <Label>Any YouTube link — even a messy one</Label>
        <p className="mt-3 font-mono text-[13px] leading-relaxed break-all">
          <Typed text={LONG_URL.join("")} reduced={reduced} wrap speed={16} />
        </p>
      </Float>
    );
  if (phase === 1)
    return (
      <Float className="relative overflow-hidden p-5">
        <Label>Looking for the video ID…</Label>
        <p className="mt-3 font-mono text-[13px] leading-relaxed break-all text-muted">
          {LONG_URL[0]}
          <mark
            className="demo-highlight rounded-sm bg-transparent px-0.5 text-ink"
            style={d(650)}
          >
            {LONG_URL[1]}
          </mark>
          {LONG_URL[2]}
        </p>
        {!reduced ? (
          <div
            aria-hidden
            className="demo-sweep-x pointer-events-none absolute inset-y-0 left-0 w-full bg-[linear-gradient(90deg,transparent,var(--accent-soft),transparent)] opacity-80"
          />
        ) : null}
      </Float>
    );
  return (
    <div className="space-y-5 text-center">
      <p className="font-mono text-[12px] break-all text-faint opacity-60">
        {LONG_URL.join("")}
      </p>
      <div className="demo-toast inline-flex flex-col items-center rounded-2xl border border-accent/30 bg-surface px-8 py-5 shadow-float">
        <Label>Video ID</Label>
        <span className="mt-1 font-mono text-[28px] font-medium tracking-[-0.01em] text-ink">
          {LONG_URL[1]}
        </span>
      </div>
      <div>
        <Toast delay={450}>Copied to clipboard</Toast>
      </div>
    </div>
  );
}

/* Channel ID Finder — @handle → radar search → the UC… ID decodes itself. */
export function ChannelIdScene({ phase, reduced }: SceneProps) {
  const id = useScramble("UCq4tH7x2kLmN8vB3zR5aW1Q", {
    reduced,
    delay: 250,
    speed: 18,
  });
  if (phase === 0)
    return (
      <div className="space-y-3">
        <Label>Channel link or @handle</Label>
        <Field focused>
          <AtSign aria-hidden className="h-4 w-4 shrink-0 text-faint" />
          <Typed text="CookingWithMaya" reduced={reduced} />
        </Field>
        <p className="text-[12.5px] text-muted">
          Tip: the @handle alone is enough.
        </p>
      </div>
    );
  if (phase === 1)
    return (
      <div className="flex h-[240px] flex-col items-center justify-center">
        <div className="relative flex h-24 w-24 items-center justify-center">
          {[0, 600, 1200].map((ms) => (
            <span
              key={ms}
              aria-hidden
              className="demo-ping absolute inset-0 rounded-full border-2 border-accent/50"
              style={d(ms)}
            />
          ))}
          <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-[var(--tint-3)] text-[22px] font-medium text-[var(--tint-ink)]">
            M
          </span>
        </div>
        <p className="mt-6 text-[13px] text-muted">
          Searching YouTube for @CookingWithMaya…
        </p>
      </div>
    );
  return (
    <div className="space-y-4">
      <div className="demo-pop flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--tint-3)] font-medium text-[var(--tint-ink)]">
          M
        </span>
        <div>
          <p className="text-[15px] font-medium text-ink">Cooking with Maya</p>
          <p className="text-[12.5px] text-muted">
            @CookingWithMaya · 248K subscribers
          </p>
        </div>
      </div>
      <div className="rounded-xl border border-line bg-surface-2 p-4">
        <Label>Channel ID</Label>
        <p className="mt-1.5 font-mono text-[17px] tracking-[0.02em] text-ink">
          {id || " "}
        </p>
      </div>
      <Toast delay={1150}>Copied</Toast>
    </div>
  );
}

/* Embed Code Generator (dark) — link + live preview → options switch on → code appears, then the player lands on a website. */
function MiniSwitch({ on }: { on: boolean }) {
  return (
    <span
      className={cn(
        "relative h-5 w-9 shrink-0 rounded-full transition-colors duration-300",
        on ? "bg-[var(--mint)]" : "bg-white/15",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-300",
          on && "translate-x-4",
        )}
      />
    </span>
  );
}
export function EmbedScene({ phase, reduced }: SceneProps) {
  const toggles = useStepper(3, { reduced, every: 380, delay: 200 });
  const lines = useStepper(5, { reduced, every: 180, delay: 100 });
  if (phase === 0)
    return (
      <div className="space-y-4">
        <div className="flex h-11 items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 text-[14px] text-white">
          <Link2 aria-hidden className="h-4 w-4 shrink-0 text-white/40" />
          <Typed
            text="youtube.com/watch?v=aqz-KE-bpKQ"
            reduced={reduced}
            className="text-white"
          />
        </div>
        <div
          className={cn(
            "relative overflow-hidden rounded-xl",
            !reduced && "demo-blur-in",
          )}
          style={d(850)}
        >
          <FakeThumb badge={false} />
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90">
              <Play aria-hidden className="h-5 w-5 fill-ink text-ink" />
            </span>
          </span>
        </div>
      </div>
    );
  if (phase === 1)
    return (
      <ul className="space-y-3">
        {["Privacy mode (no cookies)", "Start at 1:30", "Fits any screen"].map(
          (l, i) => (
            <li
              key={l}
              className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[14px] text-white/85"
            >
              {l}
              <MiniSwitch on={i < toggles} />
            </li>
          ),
        )}
      </ul>
    );
  const code = [
    '<div style="aspect-ratio:16/9">',
    "  <iframe",
    '    src="youtube-nocookie.com/',
    '      embed/aqz-KE-bpKQ?start=90"',
    "    allowfullscreen></iframe>",
  ];
  return (
    <div className="grid grid-cols-[1.2fr_1fr] gap-4">
      <pre className="font-mono text-[11.5px] leading-relaxed text-[var(--mint)]">
        {code.slice(0, lines).map((l, i) => (
          <div key={i} className="demo-pop">
            {l}
          </div>
        ))}
      </pre>
      <div className="demo-slide-r rounded-lg bg-white p-2" style={d(950)}>
        <div className="mb-1.5 flex gap-1">
          {[0, 1, 2].map((i) => (
            <span key={i} className="h-1.5 w-1.5 rounded-full bg-black/15" />
          ))}
        </div>
        <span className="mb-1.5 block h-1.5 w-2/3 rounded bg-black/15" />
        <FakeThumb className="rounded" badge={false} />
        <span className="mt-1.5 block h-1.5 w-full rounded bg-black/10" />
        <span className="mt-1 block h-1.5 w-4/5 rounded bg-black/10" />
      </div>
    </div>
  );
}

/* Metadata Extractor — link → a scanner reads the video → details slide out like drawers. */
export function MetadataScene({ phase, reduced }: SceneProps) {
  if (phase === 0)
    return (
      <div className="space-y-3">
        <Label>Paste a video link</Label>
        <Field focused>
          <Link2 aria-hidden className="h-4 w-4 shrink-0 text-faint" />
          <Typed text="youtu.be/aqz-KE-bpKQ" reduced={reduced} />
        </Field>
        <div className="flex justify-end">
          <Button press reduced={reduced}>
            Get details
          </Button>
        </div>
      </div>
    );
  if (phase === 1)
    return (
      <div className="space-y-3">
        <div className="relative overflow-hidden rounded-xl">
          <FakeThumb />
          {!reduced ? (
            <div
              aria-hidden
              className="demo-scan-y absolute inset-x-0 top-0 h-full bg-[linear-gradient(180deg,transparent_40%,rgb(122_250_178/0.55)_50%,transparent_60%)]"
            />
          ) : null}
        </div>
        <p className="text-[13px] text-muted">
          Reading title, date, length and stats…
        </p>
      </div>
    );
  const rows: [string, string][] = [
    ["Title", "Easy 20-minute pasta"],
    ["Published", "12 Mar 2026"],
    ["Length", "14:32"],
    ["Views", "184,203"],
  ];
  return (
    <div className="grid grid-cols-[88px_1fr] items-start gap-3">
      <FakeThumb className="rounded-md" badge={false} />
      <div className="space-y-2">
        {rows.map(([k, v], i) => (
          <div
            key={k}
            className="demo-slide-l flex items-center justify-between gap-3 rounded-lg border border-line bg-surface px-3 py-2"
            style={d(i * 180)}
          >
            <span className="text-[12px] text-muted">{k}</span>
            <span className="truncate text-[13px] font-medium text-ink">
              {v}
            </span>
          </div>
        ))}
        <div className="pt-1">
          <Toast delay={700}>Everything copied</Toast>
        </div>
      </div>
    </div>
  );
}

/* Tag Extractor — link → the video shakes and its hidden tags fall out → tidy row, pick and copy. */
const TAGS = [
  "pasta recipe",
  "quick dinner",
  "weeknight meals",
  "easy cooking",
  "italian food",
  "one pot",
];
export function TagScene({ phase, reduced }: SceneProps) {
  if (phase === 0)
    return (
      <Float className="p-5">
        <Label>Video link</Label>
        <Field focused className="mt-3">
          <Link2 aria-hidden className="h-4 w-4 shrink-0 text-faint" />
          <Typed text="youtube.com/watch?v=aqz-KE-bpKQ" reduced={reduced} />
        </Field>
      </Float>
    );
  if (phase === 1)
    return (
      <div className="flex flex-col items-center">
        <div
          className={cn("w-48", !reduced && "demo-shake")}
          style={{ animationIterationCount: 2 }}
        >
          <FakeThumb className="rounded-xl shadow-raised" />
        </div>
        <div className="mt-5 flex max-w-sm flex-wrap justify-center gap-2">
          {TAGS.map((t, i) => (
            <span
              key={t}
              className="demo-fall rounded-full border border-line bg-surface px-3 py-1 text-[12.5px] text-ink-2 shadow-card"
              style={d(350 + i * 100, {
                "--fx": `${(i % 2 ? 1 : -1) * (20 + i * 6)}px`,
                "--fr": `${(i % 2 ? 1 : -1) * 14}deg`,
              })}
            >
              #{t}
            </span>
          ))}
        </div>
      </div>
    );
  return (
    <Float className="p-5">
      <div className="flex items-baseline justify-between">
        <p className="text-[16px] font-medium text-ink">
          {TAGS.length} tags found
        </p>
        <span className="text-[12px] text-muted">tap to leave one out</span>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {TAGS.map((t, i) => {
          const off = i === 4;
          return (
            <span
              key={t}
              className={cn(
                "demo-pop inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[12.5px]",
                off
                  ? "border-line text-faint line-through"
                  : "border-accent/25 bg-accent-soft text-ink",
              )}
              style={d(i * 90)}
            >
              {!off ? (
                <Check aria-hidden className="h-3 w-3 text-accent" />
              ) : null}
              {t}
            </span>
          );
        })}
      </div>
      <div className="mt-5 flex items-center gap-3">
        <Button press reduced={reduced}>
          Copy 5 tags
        </Button>
        <span className="text-[12px] text-muted">
          <CountUp
            to={68}
            reduced={reduced}
            format={(n) => `${Math.round(n)}`}
          />{" "}
          / 500 characters
        </span>
      </div>
    </Float>
  );
}
