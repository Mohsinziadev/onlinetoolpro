"use client";

/**
 * Fallback demo for tools without a bespoke scene: type the input, press the
 * button, show the result described in src/lib/catalog/demos.ts.
 */
import type { CSSProperties } from "react";
import {
  Check,
  Copy,
  Download,
  FileImage,
  Loader2,
  MousePointer2,
  UploadCloud,
} from "lucide-react";
import {
  Caret,
  FakeThumb,
  Field as FieldBox,
  d,
  useTyped,
  type SceneProps,
} from "@/components/demos/kit";
import type { Demo, DemoInput, DemoResult } from "@/lib/catalog/demos";
import { cn } from "@/lib/utils";

/* ——— step 1: enter ——— */

function TypedLine({
  text,
  reduced,
  delay,
  wrap = false,
}: {
  text: string;
  reduced: boolean;
  delay?: number;
  wrap?: boolean;
}) {
  const { typed, done } = useTyped(text, { reduced, delay });
  return (
    <span className={cn("min-w-0 text-ink", wrap ? "break-words" : "truncate")}>
      {typed}
      {!done ? <Caret /> : null}
    </span>
  );
}

function InputView({
  input,
  reduced,
  filled = false,
}: {
  input: DemoInput;
  reduced: boolean;
  filled?: boolean;
}) {
  const r = reduced || filled;
  switch (input.kind) {
    case "link":
      return (
        <FieldBox focused={!filled}>
          <span className="shrink-0 text-faint">🔗</span>
          <TypedLine text={input.value} reduced={r} />
        </FieldBox>
      );
    case "text":
      return (
        <div
          className={cn(
            "min-h-24 rounded-2xl border bg-surface p-4 text-[14px] leading-relaxed whitespace-pre-line",
            filled ? "border-line" : "border-accent/50 ring-4 ring-accent/10",
          )}
        >
          <TypedLine text={input.value} reduced={r} wrap />
        </div>
      );
    case "fields":
      return (
        <div className="space-y-2.5">
          {input.fields.map(([label, value], i) => (
            <div key={label} className="flex items-center gap-3">
              <span className="w-28 shrink-0 text-[13px] text-muted">
                {label}
              </span>
              <div className="flex-1">
                <FieldBox focused={!filled && i === 0}>
                  <TypedLine text={value} reduced={r} delay={250 + i * 900} />
                </FieldBox>
              </div>
            </div>
          ))}
        </div>
      );
    case "upload":
      return (
        <div className="relative flex h-36 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[var(--tint-3)] bg-[var(--tint-1)] text-center">
          {filled ? (
            <div className="flex items-center gap-3 rounded-xl border border-line bg-surface px-3 py-2 shadow-card">
              <FakeThumb className="w-16" badge={false} />
              <span className="text-[13px] font-medium text-ink">
                {input.file}
              </span>
              <Check aria-hidden className="h-4 w-4 text-accent" />
            </div>
          ) : (
            <>
              <UploadCloud
                aria-hidden
                className="h-6 w-6 text-[var(--tint-ink)]"
                strokeWidth={1.75}
              />
              <p className="mt-2 text-[13px] text-muted">
                Drop your image here
              </p>
              <div
                className={cn(
                  "absolute top-3 right-6 flex items-center gap-2 rounded-lg border border-line bg-surface px-2.5 py-1.5 shadow-raised",
                  !reduced && "demo-drop",
                )}
              >
                <FileImage
                  aria-hidden
                  className="h-4 w-4 text-[var(--tint-ink)]"
                />
                <span className="text-[12px] font-medium text-ink">
                  {input.file}
                </span>
              </div>
            </>
          )}
        </div>
      );
  }
}

/* ——— step 2: press ——— */

function ActionView({ demo, reduced }: { demo: Demo; reduced: boolean }) {
  return (
    <div className="space-y-4">
      <InputView input={demo.input} reduced={reduced} filled />
      <div className="relative inline-flex">
        <span
          className={cn(
            "inline-flex h-11 items-center rounded-full bg-cta px-5 text-[14px] font-medium text-cta-ink",
            !reduced && "demo-press",
          )}
        >
          {demo.action}
        </span>
        {!reduced ? (
          <MousePointer2
            aria-hidden
            className="demo-cursor absolute -right-3 -bottom-4 h-5 w-5 fill-ink text-white drop-shadow"
            strokeWidth={1.5}
          />
        ) : null}
      </div>
      <div className="demo-pop space-y-2" style={d(reduced ? 0 : 900)}>
        <p className="flex items-center gap-2 text-[13px] text-muted">
          <Loader2
            aria-hidden
            className="h-3.5 w-3.5 animate-spin text-accent"
          />{" "}
          {demo.working}
        </p>
        <div className="h-1.5 overflow-hidden rounded-full bg-line">
          <div
            className="demo-grow-x h-full rounded-full bg-accent"
            style={{ ...d(reduced ? 0 : 950), animationDuration: "1.2s" }}
          />
        </div>
      </div>
    </div>
  );
}

/* ——— step 3: result ——— */

function ResultView({ result }: { result: DemoResult }) {
  switch (result.kind) {
    case "thumbnails":
      return (
        <div className="space-y-3">
          <div className="demo-pop overflow-hidden rounded-xl border border-line bg-surface">
            <FakeThumb className="rounded-none" />
            <div className="flex items-center justify-between px-3 py-2.5">
              <span className="text-[13px] font-medium text-ink">
                Full HD · 1280 × 720
              </span>
              <span className="inline-flex h-8 items-center gap-1.5 rounded-full bg-cta px-3 text-[12px] font-medium text-cta-ink">
                <Download aria-hidden className="h-3.5 w-3.5" /> Download
              </span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {["640 × 480", "480 × 360", "320 × 180"].map((s, i) => (
              <div
                key={s}
                className="demo-pop rounded-lg border border-line bg-surface p-1.5"
                style={d(250 + i * 120)}
              >
                <FakeThumb className="rounded-md" badge={false} />
                <p className="mt-1.5 text-center text-[11px] text-muted">{s}</p>
              </div>
            ))}
          </div>
        </div>
      );
    case "fields":
      return (
        <dl className="space-y-2">
          {result.items.map(([label, value], i) => (
            <div
              key={label}
              className="demo-pop flex items-center gap-3 rounded-xl border border-line bg-surface py-2 pr-2 pl-3.5"
              style={d(i * 140)}
            >
              <dt className="w-24 shrink-0 text-[12.5px] text-muted">
                {label}
              </dt>
              <dd className="min-w-0 flex-1 truncate font-mono text-[12.5px] text-ink">
                {value}
              </dd>
              {i === 0 ? (
                <span
                  className="demo-pop inline-flex h-7 items-center gap-1 rounded-full bg-accent-soft px-2.5 text-[11.5px] font-medium text-accent"
                  style={d(900)}
                >
                  <Check aria-hidden className="h-3 w-3" /> Copied
                </span>
              ) : (
                <Copy aria-hidden className="mr-1.5 h-3.5 w-3.5 text-faint" />
              )}
            </div>
          ))}
        </dl>
      );
    case "code":
      return (
        <div className="rounded-xl bg-night p-4 font-mono text-[12px] leading-relaxed text-[var(--mint)]">
          {result.lines.map((l, i) => (
            <div key={i} className="demo-pop whitespace-pre" style={d(i * 160)}>
              {l}
            </div>
          ))}
          <div
            className="demo-pop mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 font-sans text-[11.5px] text-white"
            style={d(result.lines.length * 160 + 200)}
          >
            <Check aria-hidden className="h-3 w-3" /> Code copied
          </div>
        </div>
      );
    case "tags":
      return (
        <div>
          <div className="flex flex-wrap gap-2">
            {result.items.map((t, i) => (
              <span
                key={t}
                className="demo-pop inline-flex items-center gap-1.5 rounded-full border border-accent/25 bg-accent-soft px-3 py-1.5 text-[13px] text-ink"
                style={d(i * 110)}
              >
                <Check aria-hidden className="h-3 w-3 text-accent" /> {t}
              </span>
            ))}
          </div>
          <span
            className="demo-pop mt-5 inline-flex h-9 items-center gap-1.5 rounded-full bg-cta px-4 text-[12.5px] font-medium text-cta-ink"
            style={d(result.items.length * 110 + 200)}
          >
            <Copy aria-hidden className="h-3.5 w-3.5" /> Copy{" "}
            {result.items.length}
          </span>
        </div>
      );
    case "stats":
      return (
        <div
          className={cn(
            "grid gap-2.5",
            result.items.length > 2 ? "grid-cols-2" : "grid-cols-2",
          )}
        >
          {result.items.map(([label, value], i) => (
            <div
              key={label}
              className="demo-pop rounded-xl border border-line bg-surface p-3.5"
              style={d(i * 140)}
            >
              <p className="text-[12px] text-muted">{label}</p>
              <p className="num mt-1 text-[22px] leading-none font-medium tracking-[-0.03em] text-ink">
                {value}
              </p>
            </div>
          ))}
        </div>
      );
    case "bars":
      return (
        <div className="space-y-3.5">
          {result.items.map(([label, value], i) => (
            <div key={label}>
              <div className="flex justify-between text-[12.5px]">
                <span className="text-ink-2">{label}</span>
                <span className="num text-muted">{value}%</span>
              </div>
              <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-line/70">
                <div
                  className={cn(
                    "demo-grow-x h-full rounded-full",
                    i === 0 ? "bg-accent" : "bg-[var(--tint-ink)] opacity-45",
                  )}
                  style={{ ...d(i * 180), width: `${value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      );
    case "line":
      return (
        <div className="rounded-xl border border-line bg-surface p-4">
          <p className="text-[12px] text-muted">{result.label}</p>
          <p className="num demo-pop mt-1 text-[22px] font-medium tracking-[-0.03em] text-accent">
            {result.value}
          </p>
          <svg viewBox="0 0 300 90" className="mt-2 h-24 w-full" aria-hidden>
            <path
              d="M0 80 C40 76 60 70 90 62 S150 50 180 40 S250 18 300 8 L300 90 L0 90Z"
              fill="var(--accent-soft)"
              className="demo-pop"
              style={d(600)}
            />
            <path
              d="M0 80 C40 76 60 70 90 62 S150 50 180 40 S250 18 300 8"
              fill="none"
              stroke="var(--accent)"
              strokeWidth={2.5}
              strokeLinecap="round"
              className="demo-draw"
              style={{ "--len": 360 } as CSSProperties}
            />
          </svg>
        </div>
      );
    case "checks":
      return (
        <ul className="space-y-2">
          {result.items.map(([label, verdict], i) => (
            <li
              key={label}
              className="demo-pop flex items-center gap-3 rounded-xl border border-line bg-surface px-3.5 py-2.5"
              style={d(i * 150)}
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-soft">
                <Check aria-hidden className="h-3 w-3 text-accent" />
              </span>
              <span className="min-w-0 flex-1 truncate text-[13px] text-ink">
                {label}
              </span>
              <span className="shrink-0 rounded-full bg-bg-subtle px-2 py-0.5 text-[11.5px] font-medium text-ink-2">
                {verdict}
              </span>
            </li>
          ))}
        </ul>
      );
    case "text":
      return (
        <div className="space-y-3">
          <p className="demo-pop rounded-xl border border-line bg-surface p-3 text-[13px] text-faint line-through">
            {result.before}
          </p>
          <p
            className="demo-pop rounded-xl border border-accent/30 bg-accent-soft p-4 text-[17px] font-medium tracking-[-0.01em] text-ink"
            style={d(350)}
          >
            {result.after}
          </p>
        </div>
      );
    case "preview":
      return (
        <div className="mx-auto w-52 rounded-[26px] border-4 border-ink/85 bg-surface p-2 shadow-raised">
          <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-line-strong" />
          {[0, 1].map((i) => (
            <div key={i} className="demo-pop mb-2.5" style={d(i * 220)}>
              <FakeThumb className="rounded-md" />
              <div className="mt-1.5 flex gap-1.5">
                <span className="h-5 w-5 shrink-0 rounded-full bg-[var(--tint-3)]" />
                <span className="flex-1 space-y-1">
                  <span className="block h-1.5 w-full rounded bg-ink/70" />
                  <span className="block h-1.5 w-2/3 rounded bg-line-strong" />
                </span>
              </div>
            </div>
          ))}
        </div>
      );
    case "sizes":
      return (
        <div className="flex items-end gap-3">
          {[100, 60, 36, 20].map((w, i) => (
            <div
              key={w}
              className="demo-pop text-center"
              style={{ ...d(i * 200), width: `${w * 0.42}%` }}
            >
              <FakeThumb className="rounded-md" badge={false} />
              <p className="mt-1.5 text-[11px] text-muted">{w}%</p>
            </div>
          ))}
        </div>
      );
    case "safe-zone":
      return (
        <div>
          <div className="relative">
            <FakeThumb className="rounded-xl" />
            <div className="pointer-events-none absolute inset-0">
              {[33.3, 66.6].map((p, i) => (
                <div
                  key={`v${p}`}
                  className="demo-grow-y absolute top-0 h-full w-px bg-white/70"
                  style={{ ...d(200 + i * 120), left: `${p}%` }}
                />
              ))}
              {[33.3, 66.6].map((p, i) => (
                <div
                  key={`h${p}`}
                  className="demo-grow-x absolute left-0 h-px w-full bg-white/70"
                  style={{ ...d(450 + i * 120), top: `${p}%` }}
                />
              ))}
              <div
                className="demo-pop absolute right-[2.5%] bottom-[4%] h-[18%] w-[20%] rounded-[4px] border-2 border-dashed border-[var(--mint)] bg-[var(--mint)]/15"
                style={d(900)}
              />
            </div>
          </div>
          <p className="demo-pop mt-3 text-[12.5px] text-muted" style={d(1100)}>
            Keep key text out of the{" "}
            <span className="font-medium text-accent">highlighted corner</span>{" "}
            — YouTube puts the video length there.
          </p>
        </div>
      );
    case "list":
      return (
        <ul className="space-y-1.5 rounded-xl border border-line bg-surface p-3 font-mono text-[12.5px]">
          {result.items.map((l, i) => (
            <li
              key={l}
              className="demo-pop flex items-center gap-2 text-ink"
              style={d(i * 150)}
            >
              <Check aria-hidden className="h-3.5 w-3.5 text-accent" /> {l}
            </li>
          ))}
        </ul>
      );
  }
}

export function GenericScene({
  phase,
  reduced,
  demo,
}: SceneProps & { demo: Demo }) {
  if (phase === 0) return <InputView input={demo.input} reduced={reduced} />;
  if (phase === 1) return <ActionView demo={demo} reduced={reduced} />;
  return <ResultView result={demo.result} />;
}
