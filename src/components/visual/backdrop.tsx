import type { Backdrop as BackdropSpec, Pattern } from "@/lib/catalog/types";
import { cn } from "@/lib/utils";

const W = 1440;
const H = 720;
const STROKE = "var(--tint-ink)";

/** Fine lines fanning in from the edges toward the centre — the MetaView hero motif. */
function Strings() {
  const n = 56;
  return (
    <g fill="none" stroke={STROKE} strokeWidth={1} opacity={0.16}>
      {Array.from({ length: n }, (_, i) => {
        const top = (i / (n - 1)) * W;
        const bottom = W / 2 + (top - W / 2) * 0.12;
        return <path key={i} d={`M${top} 0 C${top} ${H * 0.42} ${bottom} ${H * 0.58} ${bottom} ${H}`} />;
      })}
    </g>
  );
}

function Rings() {
  return (
    <g fill="none" stroke={STROKE} strokeWidth={1} opacity={0.14}>
      {Array.from({ length: 18 }, (_, i) => (
        <circle key={i} cx={W / 2} cy={-40} r={90 + i * 56} />
      ))}
    </g>
  );
}

function Arcs() {
  return (
    <g fill="none" stroke={STROKE} strokeWidth={1} opacity={0.14}>
      {Array.from({ length: 16 }, (_, i) => (
        <circle key={`r${i}`} cx={W + 60} cy={-60} r={140 + i * 52} />
      ))}
      {Array.from({ length: 9 }, (_, i) => (
        <circle key={`l${i}`} cx={-80} cy={H * 0.55} r={120 + i * 52} />
      ))}
    </g>
  );
}

function Waves() {
  return (
    <g fill="none" stroke={STROKE} strokeWidth={1} opacity={0.15}>
      {Array.from({ length: 16 }, (_, i) => {
        const y = 40 + i * 40;
        const a = 18 + (i % 3) * 6;
        return <path key={i} d={`M0 ${y} C${W * 0.25} ${y - a} ${W * 0.25} ${y + a} ${W * 0.5} ${y} S${W * 0.75} ${y - a} ${W} ${y}`} />;
      })}
    </g>
  );
}

function Rays() {
  return (
    <g fill="none" stroke={STROKE} strokeWidth={1} opacity={0.13}>
      {Array.from({ length: 44 }, (_, i) => {
        const x = -400 + (i / 43) * (W + 800);
        return <line key={i} x1={W / 2} y1={-120} x2={x} y2={H} />;
      })}
    </g>
  );
}

/** Tiled patterns. Ids are namespaced by pattern so repeated uses share one definition safely. */
function Tiled({ pattern }: { pattern: "grid" | "dots" | "diagonal" | "plus" }) {
  const id = `bd-${pattern}`;
  const size = pattern === "grid" ? 44 : pattern === "dots" ? 22 : pattern === "diagonal" ? 16 : 34;
  return (
    <>
      <defs>
        <pattern id={id} width={size} height={size} patternUnits="userSpaceOnUse" patternTransform={pattern === "diagonal" ? "rotate(45)" : undefined}>
          {pattern === "grid" ? <path d={`M${size} 0H0V${size}`} fill="none" stroke={STROKE} strokeWidth={1} opacity={0.14} /> : null}
          {pattern === "dots" ? <circle cx={size / 2} cy={size / 2} r={1.2} fill={STROKE} opacity={0.28} /> : null}
          {pattern === "diagonal" ? <line x1={0} y1={0} x2={0} y2={size} stroke={STROKE} strokeWidth={1} opacity={0.1} /> : null}
          {pattern === "plus" ? (
            <path d={`M${size / 2 - 4} ${size / 2}h8M${size / 2} ${size / 2 - 4}v8`} stroke={STROKE} strokeWidth={1.2} opacity={0.26} />
          ) : null}
        </pattern>
      </defs>
      <rect width={W} height={H} fill={`url(#${id})`} />
    </>
  );
}

function PatternArt({ pattern }: { pattern: Pattern }) {
  switch (pattern) {
    case "strings":
      return <Strings />;
    case "rings":
      return <Rings />;
    case "arcs":
      return <Arcs />;
    case "waves":
      return <Waves />;
    case "rays":
      return <Rays />;
    default:
      return <Tiled pattern={pattern} />;
  }
}

/**
 * Quiet header background: a tint wash that fades into the page, with a fine
 * line pattern on top. Purely decorative — sits behind content (-z-10) inside
 * an `isolate` parent.
 */
export function Backdrop({ spec, className, maxHeight = "max-h-[760px]" }: { spec: BackdropSpec; className?: string; maxHeight?: string }) {
  // Reaches up under the sticky header (80px) and down to the end of its section — never past it,
  // so it can't paint over the next section. Capped so tall sections don't stretch the pattern.
  return (
    <div
      aria-hidden
      className={cn(`tint-${spec.tint}`, "pointer-events-none absolute inset-x-0 -top-20 -z-10 h-[calc(100%+80px)] overflow-hidden [mask-image:linear-gradient(180deg,black_0%,black_70%,transparent_100%)]", maxHeight, className)}
    >
      <div className="absolute inset-0 bg-[linear-gradient(180deg,var(--tint-2)_0%,var(--tint-1)_55%,var(--bg)_100%)]" />
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMin slice"
        className="absolute inset-0 h-full w-full [mask-image:linear-gradient(180deg,black_0%,black_40%,transparent_92%)] dark:opacity-60"
      >
        <PatternArt pattern={spec.pattern} />
      </svg>
      {/* Soft glow, like light behind frosted glass */}
      <div className="absolute top-[38%] left-1/2 h-[360px] w-[70%] -translate-x-1/2 rounded-full bg-[var(--tint-3)] opacity-40 blur-[120px] dark:opacity-30" />
    </div>
  );
}

/** Small inline version for cards/stages: same tint + pattern, no fade to page. */
export function BackdropPanel({ spec, className, children }: { spec: BackdropSpec; className?: string; children?: React.ReactNode }) {
  return (
    <div className={cn(`tint-${spec.tint}`, "relative isolate overflow-hidden", className)}>
      <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(160deg,var(--tint-2)_0%,var(--tint-1)_70%)]" />
      <svg aria-hidden viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className="absolute inset-0 -z-10 h-full w-full dark:opacity-60">
        <PatternArt pattern={spec.pattern} />
      </svg>
      {children}
    </div>
  );
}
