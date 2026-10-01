"use client";

import {
  AlertTriangle,
  Check,
  FileImage,
  Moon,
  Search,
  UploadCloud,
} from "lucide-react";
import {
  CountUp,
  FakeThumb,
  Ring,
  d,
  useStepper,
  vars,
  type SceneProps,
} from "@/components/demos/kit";
import { cn } from "@/lib/utils";

/** Shared first step: an image file drops into a dropzone. Each tool styles the zone differently. */
function Dropzone({
  reduced,
  round = false,
  file = "my-thumbnail.jpg",
}: {
  reduced: boolean;
  round?: boolean;
  file?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex h-40 flex-col items-center justify-center border-2 border-dashed border-[var(--tint-3)] bg-[var(--tint-1)]/80 text-center",
        round ? "rounded-[28px]" : "rounded-2xl",
      )}
    >
      <UploadCloud
        aria-hidden
        className="h-6 w-6 text-[var(--tint-ink)]"
        strokeWidth={1.75}
      />
      <p className="mt-2 text-[13px] text-muted">Drop your thumbnail here</p>
      <div
        className={cn(
          "absolute top-4 right-8 flex items-center gap-2 rounded-lg border border-line bg-surface px-2.5 py-1.5 shadow-raised",
          !reduced && "demo-drop",
        )}
      >
        <FileImage aria-hidden className="h-4 w-4 text-[var(--tint-ink)]" />
        <span className="text-[12px] font-medium text-ink">{file}</span>
      </div>
    </div>
  );
}

/* Thumbnail Checker — drop → a scan sweeps the image while a color histogram dances → three score rings fill. */
export function AnalyzerScene({ phase, reduced }: SceneProps) {
  if (phase === 0) return <Dropzone reduced={reduced} />;
  if (phase === 1)
    return (
      <div className="space-y-3">
        <div className="relative overflow-hidden rounded-xl">
          <FakeThumb variant={1} />
          <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(var(--line)_1px,transparent_1px),linear-gradient(90deg,var(--line)_1px,transparent_1px)] bg-[size:25%_33.3%] opacity-40"
          />
          {!reduced ? (
            <div
              aria-hidden
              className="demo-scan-y absolute inset-x-0 top-0 h-full bg-[linear-gradient(180deg,transparent_42%,rgb(255_255_255/0.6)_50%,transparent_58%)]"
            />
          ) : null}
        </div>
        <div className="flex h-12 items-end gap-1">
          {[40, 70, 55, 90, 65, 35, 80, 50, 75, 45, 60, 30].map((h, i) => (
            <span
              key={i}
              className="demo-grow-y flex-1 rounded-t-sm bg-[var(--tint-ink)]"
              style={{
                ...d(i * 70),
                height: `${h}%`,
                opacity: 0.35 + (i % 4) * 0.15,
              }}
            />
          ))}
        </div>
      </div>
    );
  const scores: [string, number, string][] = [
    ["Brightness", 0.72, "Good"],
    ["Contrast", 0.88, "Strong"],
    ["Text size", 0.8, "Readable"],
  ];
  return (
    <div className="grid grid-cols-3 gap-3 text-center">
      {scores.map(([label, v, verdict], i) => (
        <div
          key={label}
          className="demo-pop flex flex-col items-center"
          style={d(i * 200)}
        >
          <Ring
            value={v}
            size={80}
            delay={i * 200}
            label={
              <CountUp
                to={v * 100}
                reduced={reduced}
                delay={i * 200}
                format={(n) => `${Math.round(n)}`}
                className="text-[18px] font-medium text-ink"
              />
            }
          />
          <p className="mt-2 text-[12.5px] text-ink">{label}</p>
          <p className="text-[11.5px] text-accent">{verdict}</p>
        </div>
      ))}
    </div>
  );
}

/* Thumbnail Preview (phone) — the thumbnail drops into a feed → it's highlighted among others → the phone flips to dark mode. */
function FeedCard({
  mine = false,
  variant = 0,
  dark = false,
}: {
  mine?: boolean;
  variant?: 0 | 1 | 2;
  dark?: boolean;
}) {
  return (
    <div className={cn("rounded-md p-1", mine && "ring-2 ring-[var(--mint)]")}>
      <FakeThumb className="rounded" variant={variant} />
      <div className="mt-1 flex gap-1.5">
        <span
          className={cn(
            "h-4 w-4 shrink-0 rounded-full",
            dark ? "bg-white/20" : "bg-black/10",
          )}
        />
        <span className="flex-1 space-y-1">
          <span
            className={cn(
              "block h-1.5 w-full rounded",
              dark ? "bg-white/70" : "bg-black/60",
            )}
          />
          <span
            className={cn(
              "block h-1.5 w-2/3 rounded",
              dark ? "bg-white/25" : "bg-black/15",
            )}
          />
        </span>
      </div>
    </div>
  );
}
export function PreviewScene({ phase, reduced }: SceneProps) {
  if (phase === 0)
    return (
      <div className="space-y-2 p-1">
        <div className="rounded-md border-2 border-dashed border-[var(--tint-3)] p-1">
          <div
            className={cn(!reduced && "demo-fall")}
            style={d(200, { "--fx": "30px", "--fr": "10deg" })}
          >
            <FeedCard mine />
          </div>
        </div>
        <FeedCard variant={1} />
      </div>
    );
  if (phase === 1)
    return (
      <div className="space-y-2 p-1">
        {[1, 0, 2].map((v, i) => (
          <div key={i} className="demo-slide-r" style={d(i * 200)}>
            <FeedCard variant={v as 0 | 1 | 2} mine={i === 1} />
          </div>
        ))}
      </div>
    );
  return (
    <div className="relative -m-3 min-h-full rounded-[inherit] p-4">
      <div
        aria-hidden
        className={cn(
          "absolute inset-0 rounded-[18px] bg-[#0f0f0f]",
          !reduced && "demo-pop",
        )}
        style={d(500)}
      />
      <div className="relative space-y-2">
        <span
          className="demo-toast mb-1 inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[10.5px] text-white"
          style={d(700)}
        >
          <Moon aria-hidden className="h-3 w-3" /> Dark mode
        </span>
        <FeedCard mine dark />
        <FeedCard variant={2} dark />
      </div>
    </div>
  );
}

/* Thumbnail Text Tester — drop → the image shrinks under a magnifier → pass/fail at each size. */
export function ReadabilityScene({ phase, reduced }: SceneProps) {
  if (phase === 0) return <Dropzone reduced={reduced} round />;
  if (phase === 1)
    return (
      <div className="flex h-[230px] flex-col items-center justify-center">
        <div className="relative w-56">
          <div
            className={cn(!reduced && "demo-shrink")}
            style={vars({ "--to": 0.3 })}
          >
            <FakeThumb className="rounded-xl shadow-raised" variant={2} />
          </div>
          <Search
            aria-hidden
            className="demo-bob absolute -right-4 -bottom-3 h-9 w-9 text-ink"
            strokeWidth={1.5}
          />
        </div>
        <p className="mt-6 text-[13px] text-muted">
          Size:{" "}
          <CountUp
            to={70}
            reduced={reduced}
            duration={1500}
            format={(n) => `${Math.round(100 - n)}%`}
            className="font-medium text-ink"
          />
        </p>
      </div>
    );
  const sizes: [number, boolean][] = [
    [100, true],
    [50, true],
    [30, true],
    [15, false],
  ];
  return (
    <div>
      <div className="flex items-end gap-3">
        {sizes.map(([w, ok], i) => (
          <div
            key={w}
            className="demo-pop text-center"
            style={{ ...d(i * 220), width: `${w * 0.42}%` }}
          >
            <FakeThumb className="rounded-md" badge={false} variant={2} />
            <p
              className={cn(
                "mt-1.5 inline-flex items-center gap-0.5 text-[11px]",
                ok ? "text-accent" : "text-warning",
              )}
            >
              {ok ? (
                <Check aria-hidden className="h-3 w-3" />
              ) : (
                <AlertTriangle aria-hidden className="h-3 w-3" />
              )}
              {w}%
            </p>
          </div>
        ))}
      </div>
      <p className="demo-pop mt-4 text-[12.5px] text-muted" style={d(800)}>
        Text gets hard to read below{" "}
        <span className="font-medium text-ink">30%</span> — try bigger words.
      </p>
    </div>
  );
}

/* Safe Zone — drop → guide lines draw → the time-label corner pulses and the title slides clear of it. */
export function SafeZoneScene({ phase, reduced }: SceneProps) {
  const lines = useStepper(4, { reduced, every: 220, delay: 200 });
  if (phase === 0) return <Dropzone reduced={reduced} />;
  const grid = (
    <div className="pointer-events-none absolute inset-0">
      {[33.3, 66.6].map((p, i) =>
        i < lines ? (
          <div
            key={`v${p}`}
            className="demo-grow-y absolute top-0 h-full w-px bg-white/75"
            style={{ left: `${p}%` }}
          />
        ) : null,
      )}
      {[33.3, 66.6].map((p, i) =>
        i + 2 < lines ? (
          <div
            key={`h${p}`}
            className="demo-grow-x absolute left-0 h-px w-full bg-white/75"
            style={{ top: `${p}%` }}
          />
        ) : null,
      )}
    </div>
  );
  if (phase === 1)
    return (
      <div className="relative">
        <FakeThumb className="rounded-xl" />
        {grid}
        <p className="mt-3 text-[12.5px] text-muted">
          Adding the thirds grid and margins…
        </p>
      </div>
    );
  return (
    <div>
      <div className="relative overflow-hidden rounded-xl bg-[linear-gradient(135deg,var(--tint-ink),#0a2119)]">
        <div className="aspect-video" />
        <div
          className="demo-drag absolute top-[18%] left-[8%] h-[16%] w-[46%] rounded-[3px] bg-white/95"
          style={d(300, { "--from": "0px", "--to": "0px" })}
        />
        <div
          className="demo-drag absolute top-[62%] right-[4%] h-[12%] w-[30%] rounded-[3px] bg-[var(--mint)]"
          style={d(400, { "--from": "0px", "--to": "-120px" })}
        />
        <div className="absolute right-[3%] bottom-[5%] h-[16%] w-[20%]">
          {!reduced ? (
            <span
              aria-hidden
              className="demo-ping absolute inset-0 rounded-md border-2 border-[var(--mint)]"
            />
          ) : null}
          <span className="absolute inset-0 flex items-center justify-center rounded-md border-2 border-dashed border-[var(--mint)] bg-black/60 font-mono text-[10px] text-white">
            12:04
          </span>
        </div>
        <div className="pointer-events-none absolute inset-0">
          {[33.3, 66.6].map((p) => (
            <div
              key={`v${p}`}
              className="absolute top-0 h-full w-px bg-white/40"
              style={{ left: `${p}%` }}
            />
          ))}
        </div>
      </div>
      <p className="mt-3 text-[12.5px] text-muted">
        Moved the green text out of the{" "}
        <span className="font-medium text-accent">time-label corner</span>.
      </p>
    </div>
  );
}
