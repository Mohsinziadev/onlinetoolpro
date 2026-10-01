"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { ToolIconTile } from "@/components/tool-icon";
import { BackdropPanel } from "@/components/visual/backdrop";
import { useReducedMotion, type Phase } from "@/components/demos/kit";
import { GenericScene } from "@/components/demos/generic";
import { scenes, type Frame, type Transition } from "@/components/demos/registry";
import type { Demo } from "@/lib/catalog/demos";
import type { Backdrop, IconName } from "@/lib/catalog/types";
import { cn } from "@/lib/utils";

/** How long each step stays on screen before the demo moves on. */
const STEP_MS = 2400;

const FALLBACK_FRAMES: Frame[] = ["window", "bare", "window", "dark"];
const FALLBACK_TRANSITIONS: Transition[] = ["rise", "slide", "zoom", "flip", "blur", "drop"];
/** A stable frame + transition per tool, so generic demos still differ from tool to tool. */
function fallbackLook(key: string): { frame: Frame; transition: Transition } {
  let h = 0;
  for (const ch of key) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return { frame: FALLBACK_FRAMES[h % FALLBACK_FRAMES.length], transition: FALLBACK_TRANSITIONS[(h >>> 3) % FALLBACK_TRANSITIONS.length] };
}

function phaseOf(i: number, n: number): Phase {
  if (i === 0) return 0;
  if (i === n - 1) return 2;
  return 1;
}

/** The container a scene plays in. Each tool picks one in the scene registry. */
function StageFrame({
  frame,
  icon,
  toolName,
  tint,
  children,
}: {
  frame: Frame;
  icon: IconName;
  toolName: string;
  tint: Backdrop["tint"];
  children: ReactNode;
}) {
  if (frame === "bare")
    return <div className="w-full max-w-md">{children}</div>;

  if (frame === "phone")
    return (
      <div className="w-60 rounded-[36px] border-[7px] border-ink/90 bg-surface p-3 shadow-float">
        <div className="mx-auto mb-3 h-1.5 w-14 rounded-full bg-line-strong" />
        <div className="h-[330px] overflow-hidden rounded-[18px]">
          {children}
        </div>
      </div>
    );

  // "dark" reuses the site's dark tokens inside this card, so any scene reads correctly on it.
  const dark = frame === "dark";
  return (
    <div
      className={cn(
        "w-full max-w-md overflow-hidden rounded-2xl border shadow-float",
        dark
          ? "dark border-white/10 bg-night"
          : "border-line bg-surface/95 backdrop-blur",
      )}
    >
      <div
        className={cn(
          "flex items-center gap-2.5 border-b px-4 py-3",
          dark ? "border-white/10" : "border-line",
        )}
      >
        {dark ? (
          <span className="flex gap-1.5">
            {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
              <span
                key={c}
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: c }}
              />
            ))}
          </span>
        ) : (
          <ToolIconTile name={icon} size="sm" tone="tint" tint={tint} />
        )}
        <span
          className={cn(
            "text-[13px] font-medium",
            dark ? "text-white/60" : "text-ink-2",
          )}
        >
          {toolName}
        </span>
        {!dark ? (
          <span className="ml-auto flex gap-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-line-strong"
              />
            ))}
          </span>
        ) : null}
      </div>
      <div className="min-h-[270px] p-4 sm:p-5">{children}</div>
    </div>
  );
}

/**
 * Animated walkthrough: the tool's own scene, in its own frame, on its own
 * backdrop — next to a numbered timeline. Advances automatically while on
 * screen; clicking a step jumps to it and the loop carries on from there.
 */
export function HowItWorksDemo({
  toolKey,
  steps,
  demo,
  backdrop,
  toolName,
  icon,
  title,
  className,
}: {
  /** "category/slug" — picks the scene */
  toolKey: string;
  steps: string[];
  /** Used by the generic scene when a tool has no bespoke one */
  demo: Demo;
  backdrop: Backdrop;
  toolName: string;
  icon: IconName;
  /** Section heading; defaults to "How to use the <tool>" */
  title?: string;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [run, setRun] = useState(0);
  const [visible, setVisible] = useState(false);
  // Hovering the steps with a mouse pauses the demo and its progress bar.
  const [paused, setPaused] = useState(false);
  // Time already spent on the current step, so a pause resumes where it left off.
  const elapsed = useRef<{ key: string; ms: number }>({ key: "", ms: 0 });
  const spec = scenes[toolKey];
  // Tools without a bespoke scene still get their own frame and step transition.
  const fallback = fallbackLook(toolKey);
  const stepKey = `${active}-${run}`;
  const running = visible && !paused;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Any part on screen counts — on phones the section can be taller than the viewport.
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), {
      threshold: 0,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Advances on its own while on screen and not paused (with reduced motion too — just
  // without the micro-animations). Pausing banks the time spent so resuming continues the step.
  useEffect(() => {
    if (!running) return;
    const already = elapsed.current.key === stepKey ? elapsed.current.ms : 0;
    const start = performance.now();
    const t = window.setTimeout(
      () => {
        setActive((a) => (a + 1) % steps.length);
        setRun((r) => r + 1);
      },
      Math.max(0, STEP_MS - already),
    );
    return () => {
      window.clearTimeout(t);
      elapsed.current = {
        key: stepKey,
        ms: already + performance.now() - start,
      };
    };
  }, [running, stepKey, steps.length]);

  function select(i: number) {
    setActive(i);
    setRun((r) => r + 1);
  }

  const phase = phaseOf(active, steps.length);
  const still = reduced || !visible;
  // Remount the scene on every step (and on first arrival) so its animations replay from the start.
  const stageKey = `${active}-${run}-${visible ? 1 : 0}`;
  const scene = spec ? (
    <spec.Scene phase={phase} reduced={still} />
  ) : (
    <GenericScene phase={phase} reduced={still} demo={demo} />
  );

  return (
    <section ref={ref} aria-labelledby="how-heading" className={className}>
      <p className="eyebrow">How it works</p>
      <h2 id="how-heading" className="h2 mt-3 text-ink">
        {title ?? `How to use the ${toolName}`}
      </h2>
      <p className="lead mt-3 text-muted">
        {steps.length} simple steps. No experience needed.
      </p>

      <div className="mt-12 grid grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-16">
        <BackdropPanel
          spec={backdrop}
          className="flex min-h-[420px] items-center justify-center rounded-3xl border border-line p-4 sm:min-h-[460px] sm:p-10"
        >
          <div aria-hidden className="flex w-full justify-center">
            <StageFrame
              frame={spec?.frame ?? fallback.frame}
              icon={icon}
              toolName={toolName}
              tint={backdrop.tint}
            >
              <div
                key={stageKey}
                className={cn(!still && `stage-${spec?.transition ?? fallback.transition}`)}
              >
                {scene}
              </div>
            </StageFrame>
          </div>
        </BackdropPanel>

        <ol
          className="relative"
          // Mouse only: on touch screens a tap would otherwise leave it paused.
          onPointerEnter={(e) => e.pointerType === "mouse" && setPaused(true)}
          onPointerLeave={(e) => e.pointerType === "mouse" && setPaused(false)}
        >
          {steps.map((s, i) => {
            const on = i === active;
            return (
              <li key={s} className="relative pb-2 last:pb-0">
                {i < steps.length - 1 ? (
                  <span
                    aria-hidden
                    className="absolute top-12 bottom-0 left-[17px] w-px bg-line"
                  />
                ) : null}
                <button
                  type="button"
                  onClick={() => select(i)}
                  aria-current={on ? "step" : undefined}
                  className="group flex w-full items-start gap-5 rounded-2xl py-3 text-left"
                >
                  <span
                    className={cn(
                      "num relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-[14px] font-medium transition-colors duration-300",
                      on
                        ? "border-cta bg-cta text-cta-ink"
                        : "border-line-strong bg-bg text-muted group-hover:text-ink",
                    )}
                  >
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1 pt-1.5">
                    {/* Shrink-wraps the text so the progress bar below is exactly as wide as it. */}
                    <span className="inline-flex max-w-full flex-col">
                      <span
                        className={cn(
                          "block text-[18px] leading-snug tracking-[-0.01em] transition-colors duration-300",
                          on
                            ? "font-medium text-ink"
                            : "text-muted group-hover:text-ink-2",
                        )}
                      >
                        {s}
                      </span>
                      <span
                        className={cn(
                          "mt-3 block h-0.5 w-full overflow-hidden rounded-full",
                          on && visible ? "bg-line" : "bg-transparent",
                        )}
                      >
                        {on ? (
                          <span
                            key={stepKey}
                            className="demo-progress block h-full bg-accent"
                            // The bar and the step timer pause and resume together.
                            style={
                              {
                                "--dur": `${STEP_MS}ms`,
                                animationPlayState: running
                                  ? "running"
                                  : "paused",
                              } as CSSProperties
                            }
                          />
                        ) : null}
                      </span>
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
