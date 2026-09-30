"use client";

import { useMemo, useState } from "react";
import { ArrowRightLeft, Plus, X } from "lucide-react";
import { Choice, ColorField, ErrorNote, FieldLabel, OutputBox, Panel, Slider, TextField, Toggle, TwoPane } from "@/components/kit";
import { CopyButton } from "@/components/tool/copy-button";
import { BLACK, WHITE, contrast, hexWithAlpha, mix, parseColor, rgbToCmyk, rgbToHex, rgbToHsl, rgbToHsv, type RGB } from "@/lib/color";
import { cn } from "@/lib/utils";

function CopyRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-line bg-surface px-3 py-2">
      <span className="w-14 shrink-0 text-[12.5px] font-medium text-muted">{label}</span>
      <code className="min-w-0 flex-1 truncate font-mono text-[14px] text-ink">{value}</code>
      <CopyButton value={value} label={`Copy ${label}`} />
    </div>
  );
}

/* ——— Colour converter ——— */

export function ColorConverter() {
  const [input, setInput] = useState("#1f7a58");
  const rgb = useMemo(() => parseColor(input), [input]);

  const rows: [string, string][] = rgb
    ? (() => {
        const [h, s, l] = rgbToHsl(rgb);
        const [hv, sv, v] = rgbToHsv(rgb);
        const [c, m, y, k] = rgbToCmyk(rgb);
        return [
          ["HEX", rgbToHex(rgb).toUpperCase()],
          ["RGB", `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`],
          ["HSL", `hsl(${h}, ${s}%, ${l}%)`],
          ["HSV", `hsv(${hv}, ${sv}%, ${v}%)`],
          ["CMYK", `cmyk(${c}%, ${m}%, ${y}%, ${k}%)`],
        ];
      })()
    : [];

  return (
    <TwoPane
      left={
        <Panel className="space-y-4">
          <div>
            <FieldLabel htmlFor="cc-in">Any colour</FieldLabel>
            <input
              id="cc-in"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="#1f7a58, rgb(31,122,88), hsl(158,59%,30%) or teal"
              spellCheck={false}
              autoFocus
              className="h-12 w-full rounded-xl border border-line bg-surface-2 px-4 font-mono text-[15px] text-ink outline-none focus:border-accent/50 focus:ring-4 focus:ring-accent/10"
            />
          </div>
          <ColorField label="Or pick one" value={rgb ? rgbToHex(rgb) : "#000000"} onChange={setInput} />
          {input && !rgb ? <ErrorNote>That doesn&apos;t look like a colour. Try #ff8800, rgb(255, 136, 0) or a name like “orange”.</ErrorNote> : null}
        </Panel>
      }
      right={
        <Panel className="space-y-3">
          <div className="h-28 rounded-2xl border border-line" style={{ background: rgb ? rgbToHex(rgb) : "transparent" }} aria-label="Colour preview" role="img" />
          {rows.map(([k, v]) => (
            <CopyRow key={k} label={k} value={v} />
          ))}
        </Panel>
      }
    />
  );
}

/* ——— Contrast checker ——— */

export function ContrastChecker() {
  const [fg, setFg] = useState("#1c2622");
  const [bg, setBg] = useState("#e8fff4");
  const a = parseColor(fg) ?? BLACK;
  const b = parseColor(bg) ?? WHITE;
  const ratio = contrast(a, b);
  const checks = [
    { label: "Normal text · AA", need: 4.5 },
    { label: "Normal text · AAA", need: 7 },
    { label: "Large text · AA", need: 3 },
    { label: "Large text · AAA", need: 4.5 },
    { label: "Icons & UI parts · AA", need: 3 },
  ];

  return (
    <TwoPane
      left={
        <Panel className="space-y-4">
          <ColorField label="Text colour" value={rgbToHex(a)} onChange={setFg} />
          <ColorField label="Background colour" value={rgbToHex(b)} onChange={setBg} />
          <button
            type="button"
            onClick={() => {
              setFg(rgbToHex(b));
              setBg(rgbToHex(a));
            }}
            className="chip"
          >
            <ArrowRightLeft aria-hidden className="h-3.5 w-3.5" /> Swap colours
          </button>
          <div className="rounded-2xl border border-line p-6" style={{ background: rgbToHex(b), color: rgbToHex(a) }}>
            <p className="text-[26px] leading-tight font-semibold">Large text preview</p>
            <p className="mt-2 text-[15px] leading-relaxed">Normal body text looks like this. Can you read it comfortably?</p>
          </div>
        </Panel>
      }
      right={
        <Panel className="space-y-4">
          <div>
            <p className="text-[13.5px] text-muted">Contrast ratio</p>
            <p className="num text-[44px] leading-none font-medium tracking-[-0.03em] text-ink">{ratio.toFixed(2)}:1</p>
          </div>
          <ul className="space-y-2">
            {checks.map((c) => {
              const pass = ratio >= c.need;
              return (
                <li key={c.label} className="flex items-center justify-between rounded-xl border border-line bg-surface px-3.5 py-2.5 text-[14px]">
                  <span className="text-ink-2">
                    {c.label} <span className="text-muted">(needs {c.need}:1)</span>
                  </span>
                  <span className={cn("rounded-full px-2.5 py-0.5 text-[12.5px] font-medium", pass ? "bg-success-soft text-success" : "bg-danger-soft text-danger")}>{pass ? "Pass" : "Fail"}</span>
                </li>
              );
            })}
          </ul>
          <p className="text-[12.5px] text-muted">Large text means at least 24px, or 18.5px bold. Thresholds from WCAG 2.</p>
        </Panel>
      }
    />
  );
}

/* ——— Shades generator ——— */

export function ShadesGenerator() {
  const [base, setBase] = useState("#1f7a58");
  const [steps, setSteps] = useState(5);
  const rgb = parseColor(base) ?? { r: 31, g: 122, b: 88 };

  const tints = Array.from({ length: steps }, (_, i) => mix(rgb, WHITE, (steps - i) / (steps + 1)));
  const shades = Array.from({ length: steps }, (_, i) => mix(rgb, BLACK, (i + 1) / (steps + 1)));
  // Lightest tint = 100, … base in the middle, … darkest shade last.
  const scale: { name: string; rgb: RGB }[] = [...tints, rgb, ...shades].map((c, i) => ({ name: i === steps ? "base" : String((i + 1) * 100), rgb: c }));
  const css = scale.map((s) => `  --color-${s.name}: ${rgbToHex(s.rgb)};`).join("\n");

  return (
    <div className="space-y-4">
      <Panel className="grid gap-5 sm:grid-cols-2">
        <ColorField label="Base colour" value={rgbToHex(rgb)} onChange={setBase} />
        <Slider label="Tints and shades on each side" value={steps} onChange={setSteps} min={2} max={9} />
      </Panel>
      <Panel title="Your palette">
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
          {scale.map((s) => {
            const hex = rgbToHex(s.rgb);
            const dark = contrast(s.rgb, WHITE) > 4.5;
            return (
              <li key={s.name + hex} className="overflow-hidden rounded-2xl border border-line">
                <div className={cn("flex h-20 items-end p-2.5 text-[12px] font-medium", dark ? "text-white" : "text-[#0a0c0b]")} style={{ background: hex }}>
                  {s.name === "base" ? "Base" : s.name}
                </div>
                <div className="flex items-center justify-between gap-1 bg-surface px-2 py-1.5">
                  <code className="font-mono text-[12px] text-ink uppercase">{hex}</code>
                  <CopyButton value={hex} label={`Copy ${hex}`} className="h-7 w-7" />
                </div>
              </li>
            );
          })}
        </ul>
      </Panel>
      <Panel>
        <OutputBox label="CSS variables" value={`:root {\n${css}\n}`} rows={Math.min(scale.length + 2, 14)} mono filename="palette.css" mime="text/css" />
      </Panel>
    </div>
  );
}

/* ——— CSS gradient ——— */

type Stop = { color: string; pos: number };

export function GradientGenerator() {
  const [type, setType] = useState<"linear" | "radial">("linear");
  const [angle, setAngle] = useState(135);
  const [stops, setStops] = useState<Stop[]>([
    { color: "#7afab2", pos: 0 },
    { color: "#1f7a58", pos: 100 },
  ]);
  const list = [...stops].sort((a, b) => a.pos - b.pos).map((s) => `${s.color} ${s.pos}%`).join(", ");
  const value = type === "linear" ? `linear-gradient(${angle}deg, ${list})` : `radial-gradient(circle, ${list})`;
  const css = `background: ${stops[0].color};\nbackground: ${value};`;

  return (
    <TwoPane
      left={
        <Panel className="space-y-5">
          <Choice label="Type" value={type} onChange={setType} options={[{ value: "linear", label: "Linear" }, { value: "radial", label: "Radial" }]} />
          {type === "linear" ? <Slider label="Angle" value={angle} onChange={setAngle} min={0} max={360} unit="°" /> : null}
          <div className="space-y-3">
            {stops.map((s, i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_auto] items-end gap-3">
                <ColorField label={`Colour ${i + 1}`} value={s.color} onChange={(c) => setStops((st) => st.map((x, k) => (k === i ? { ...x, color: c } : x)))} />
                <Slider label="Position" value={s.pos} onChange={(p) => setStops((st) => st.map((x, k) => (k === i ? { ...x, pos: p } : x)))} min={0} max={100} unit="%" />
                <button type="button" disabled={stops.length <= 2} onClick={() => setStops((st) => st.filter((_, k) => k !== i))} aria-label={`Remove colour ${i + 1}`} className="mb-1 rounded-full p-2 text-muted hover:bg-bg-subtle hover:text-ink disabled:opacity-30">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            {stops.length < 5 ? (
              <button type="button" onClick={() => setStops((st) => [...st, { color: "#2268b4", pos: 50 }])} className="chip">
                <Plus aria-hidden className="h-3.5 w-3.5" /> Add colour
              </button>
            ) : null}
          </div>
        </Panel>
      }
      right={
        <Panel className="space-y-4">
          <div className="h-56 rounded-2xl border border-line" style={{ background: value }} role="img" aria-label="Gradient preview" />
          <OutputBox label="CSS" value={css} rows={4} mono />
        </Panel>
      }
    />
  );
}

/* ——— Box shadow ——— */

export function BoxShadowGenerator() {
  const [x, setX] = useState(0);
  const [y, setY] = useState(12);
  const [blur, setBlur] = useState(32);
  const [spread, setSpread] = useState(-8);
  const [color, setColor] = useState("#0a2119");
  const [opacity, setOpacity] = useState(25);
  const [inset, setInset] = useState(false);
  const shadow = `${inset ? "inset " : ""}${x}px ${y}px ${blur}px ${spread}px ${hexWithAlpha(color, opacity / 100)}`;

  return (
    <TwoPane
      left={
        <Panel className="space-y-4">
          <Slider label="Horizontal offset" value={x} onChange={setX} min={-60} max={60} unit="px" />
          <Slider label="Vertical offset" value={y} onChange={setY} min={-60} max={60} unit="px" />
          <Slider label="Blur" value={blur} onChange={setBlur} min={0} max={120} unit="px" />
          <Slider label="Spread" value={spread} onChange={setSpread} min={-40} max={40} unit="px" />
          <ColorField label="Shadow colour" value={color} onChange={setColor} />
          <Slider label="Opacity" value={opacity} onChange={setOpacity} min={0} max={100} unit="%" />
          <Toggle label="Inner shadow (inset)" checked={inset} onChange={setInset} />
        </Panel>
      }
      right={
        <Panel className="space-y-4">
          <div className="flex h-64 items-center justify-center rounded-2xl bg-bg-subtle">
            <div className="h-32 w-44 rounded-2xl bg-surface" style={{ boxShadow: shadow }} />
          </div>
          <OutputBox label="CSS" value={`box-shadow: ${shadow};`} rows={3} mono />
        </Panel>
      }
    />
  );
}

/* ——— Border radius ——— */

export function BorderRadiusGenerator() {
  const [linked, setLinked] = useState(true);
  const [r, setR] = useState({ tl: 24, tr: 24, br: 24, bl: 24 });
  const set = (k: keyof typeof r) => (v: number) => setR((p) => (linked ? { tl: v, tr: v, br: v, bl: v } : { ...p, [k]: v }));
  const value = new Set(Object.values(r)).size === 1 ? `${r.tl}px` : `${r.tl}px ${r.tr}px ${r.br}px ${r.bl}px`;

  return (
    <TwoPane
      left={
        <Panel className="space-y-4">
          <Toggle label="Same radius on every corner" checked={linked} onChange={setLinked} />
          <Slider label={linked ? "All corners" : "Top left"} value={r.tl} onChange={set("tl")} min={0} max={200} unit="px" />
          {!linked ? (
            <>
              <Slider label="Top right" value={r.tr} onChange={set("tr")} min={0} max={200} unit="px" />
              <Slider label="Bottom right" value={r.br} onChange={set("br")} min={0} max={200} unit="px" />
              <Slider label="Bottom left" value={r.bl} onChange={set("bl")} min={0} max={200} unit="px" />
            </>
          ) : null}
        </Panel>
      }
      right={
        <Panel className="space-y-4">
          <div className="flex h-64 items-center justify-center rounded-2xl bg-bg-subtle">
            <div className="h-40 w-56 bg-[linear-gradient(135deg,#7afab2,#1f7a58)]" style={{ borderRadius: value }} />
          </div>
          <OutputBox label="CSS" value={`border-radius: ${value};`} rows={2} mono />
        </Panel>
      }
    />
  );
}

/* ——— CSS minifier ——— */

function minifyCss(css: string): string {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    // Not "+": calc(1px + 2px) needs its spaces.
    .replace(/\s*([{}:;,>~])\s*/g, "$1")
    .replace(/;}/g, "}")
    // "0px" → "0" (not "0%": that would break keyframe selectors)
    .replace(/(^|[^\w.-])0(?:px|em|rem)\b/g, "$10")
    .trim();
}

export function CssMinifier() {
  const [css, setCss] = useState("");
  const out = useMemo(() => (css ? minifyCss(css) : ""), [css]);
  const saved = css.length ? Math.round((1 - out.length / css.length) * 100) : 0;
  return (
    <TwoPane
      left={
        <Panel>
          <TextField label="Your CSS" value={css} onChange={setCss} rows={14} mono placeholder={".card {\n  padding: 16px;\n  margin: 0px auto; /* centred */\n}"} autoFocus />
        </Panel>
      }
      right={
        <Panel>
          <OutputBox label={css ? `Minified · ${saved}% smaller` : "Minified CSS"} value={out} rows={14} mono filename="styles.min.css" mime="text/css" />
        </Panel>
      }
    />
  );
}
