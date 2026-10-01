"use client";

/** Text to speech (the browser's built-in voices) and fancy Unicode text styles. */
import { useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play, Square } from "lucide-react";
import { ErrorNote, FieldLabel, Panel, Slider, useMounted } from "@/components/kit";
import { CopyButton } from "@/components/tool/copy-button";

const textareaClass = "w-full rounded-2xl border border-line bg-surface-2 p-4 text-[16px] leading-relaxed text-ink outline-none focus:border-accent/50 focus:ring-4 focus:ring-accent/10";

/* ——— Text to speech ——— */

/** Split into sentence-sized pieces: some browsers stop long utterances after ~15 seconds. */
function chunks(text: string, max = 220): { text: string; start: number }[] {
  const out: { text: string; start: number }[] = [];
  const re = /[^.!?。！？\n]+[.!?。！？]*[\s\n]*/g;
  let m: RegExpExecArray | null;
  let cur = "";
  let curStart = 0;
  while ((m = re.exec(text))) {
    if (cur && cur.length + m[0].length > max) {
      out.push({ text: cur, start: curStart });
      cur = "";
    }
    if (!cur) curStart = m.index;
    cur += m[0];
  }
  if (cur.trim()) out.push({ text: cur, start: curStart });
  return out.filter((c) => c.text.trim());
}

export function TextToSpeech() {
  const mounted = useMounted();
  const supported = mounted && "speechSynthesis" in window;
  const [text, setText] = useState("Paste or type any text here, choose a voice, and press Play to hear it read aloud.");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceUri, setVoiceUri] = useState("");
  const [rate, setRate] = useState(100);
  const [pitch, setPitch] = useState(100);
  const [state, setState] = useState<"idle" | "playing" | "paused">("idle");
  const [at, setAt] = useState<number | null>(null); // character being read, for highlighting
  const run = useRef(0);

  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    const load = () => setVoices(window.speechSynthesis.getVoices());
    load();
    window.speechSynthesis.addEventListener("voiceschanged", load);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", load);
      window.speechSynthesis.cancel();
    };
  }, []);

  const sorted = useMemo(() => {
    const lang = typeof navigator !== "undefined" ? navigator.language.slice(0, 2) : "en";
    return [...voices].sort((a, b) => Number(b.lang.startsWith(lang)) - Number(a.lang.startsWith(lang)) || a.lang.localeCompare(b.lang) || a.name.localeCompare(b.name));
  }, [voices]);
  const voice = sorted.find((v) => v.voiceURI === voiceUri) ?? sorted.find((v) => v.default) ?? sorted[0];

  function play() {
    const synth = window.speechSynthesis;
    if (state === "paused") {
      synth.resume();
      setState("playing");
      return;
    }
    synth.cancel();
    const id = ++run.current;
    const parts = chunks(text);
    if (!parts.length) return;
    parts.forEach((p, i) => {
      const u = new SpeechSynthesisUtterance(p.text);
      if (voice) {
        u.voice = voice;
        u.lang = voice.lang;
      }
      u.rate = rate / 100;
      u.pitch = pitch / 100;
      u.onboundary = (e) => run.current === id && setAt(p.start + e.charIndex);
      if (i === parts.length - 1)
        u.onend = () => {
          if (run.current === id) {
            setState("idle");
            setAt(null);
          }
        };
      synth.speak(u);
    });
    setState("playing");
  }
  function pause() {
    window.speechSynthesis.pause();
    setState("paused");
  }
  function stop() {
    run.current++;
    window.speechSynthesis.cancel();
    setState("idle");
    setAt(null);
  }

  // Highlight the word being read.
  const word = at !== null ? /^\S*/.exec(text.slice(at))![0] : "";

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      <Panel className="space-y-3">
        <FieldLabel htmlFor="tts-text" hint={`${text.length.toLocaleString("en-US")} characters`}>
          Text to read
        </FieldLabel>
        {state === "idle" ? (
          <textarea id="tts-text" value={text} onChange={(e) => setText(e.target.value)} rows={12} className={textareaClass} />
        ) : (
          <p className="min-h-72 rounded-2xl border border-line bg-surface-2 p-4 text-[16px] leading-relaxed whitespace-pre-wrap text-ink-2" aria-live="off">
            {at !== null ? (
              <>
                {text.slice(0, at)}
                <mark className="rounded bg-accent-soft px-0.5 text-ink">{word}</mark>
                {text.slice(at + word.length)}
              </>
            ) : (
              text
            )}
          </p>
        )}
      </Panel>
      <Panel className="space-y-5 self-start">
        {mounted && !supported ? <ErrorNote>Your browser doesn&apos;t support speech. Try Chrome, Edge or Safari.</ErrorNote> : null}
        <div>
          <FieldLabel htmlFor="tts-voice" hint={voices.length ? `${voices.length} voices on this device` : undefined}>
            Voice
          </FieldLabel>
          <select id="tts-voice" value={voice?.voiceURI ?? ""} onChange={(e) => setVoiceUri(e.target.value)} disabled={!voices.length || state !== "idle"} className="h-12 w-full rounded-xl border border-line bg-surface px-3 text-[15px] text-ink outline-none focus:border-accent/50">
            {voices.length ? (
              sorted.map((v) => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.name} ({v.lang}){v.localService ? "" : " · online"}
                </option>
              ))
            ) : (
              <option value="">{mounted ? "Loading voices…" : "Voices load in your browser"}</option>
            )}
          </select>
        </div>
        <Slider label="Speed" value={rate} onChange={setRate} min={50} max={200} step={10} unit="%" />
        <Slider label="Pitch" value={pitch} onChange={setPitch} min={50} max={150} step={10} unit="%" />
        <div className="flex flex-wrap gap-2">
          {state === "playing" ? (
            <button type="button" onClick={pause} className="inline-flex h-11 items-center gap-2 rounded-full bg-cta px-6 text-[15px] font-medium text-cta-ink hover:bg-cta-hover">
              <Pause aria-hidden className="h-4 w-4" /> Pause
            </button>
          ) : (
            <button type="button" onClick={play} disabled={!supported || !text.trim()} className="inline-flex h-11 items-center gap-2 rounded-full bg-cta px-6 text-[15px] font-medium text-cta-ink hover:bg-cta-hover disabled:opacity-40">
              <Play aria-hidden className="h-4 w-4" /> {state === "paused" ? "Resume" : "Play"}
            </button>
          )}
          <button type="button" onClick={stop} disabled={state === "idle"} className="inline-flex h-11 items-center gap-2 rounded-full border border-line px-5 text-[15px] font-medium text-ink hover:border-line-strong disabled:opacity-40">
            <Square aria-hidden className="h-3.5 w-3.5" /> Stop
          </button>
        </div>
        <p className="text-[12.5px] text-muted">Voices come from your device and browser, so they differ between Windows, Mac, Android and iPhone. Most voices work offline; ones marked “online” are provided by your browser&apos;s maker.</p>
      </Panel>
    </div>
  );
}

/* ——— Fancy text ——— */

type Style = { id: string; name: string; map: (s: string) => string };

const A = 65;
const a = 97;
const ZERO = 48;
const cp = (n: number) => String.fromCodePoint(n);

/** Map A–Z, a–z (and 0–9 when given) to a Unicode block, with per-letter exceptions. */
function alpha(upper: number, lower: number | null, digits: number | null, holes: Record<string, number> = {}) {
  return (s: string) =>
    Array.from(s)
      .map((ch) => {
        if (holes[ch]) return cp(holes[ch]);
        const c = ch.codePointAt(0)!;
        if (c >= A && c <= 90) return cp(upper + c - A);
        if (c >= a && c <= 122) return lower === null ? cp(upper + c - a) : cp(lower + c - a);
        if (digits !== null && c >= ZERO && c <= 57) return cp(digits + c - ZERO);
        return ch;
      })
      .join("");
}

const table = (from: string, to: string) => {
  const src = Array.from(from);
  const dst = Array.from(to);
  return (s: string) => Array.from(s).map((ch) => dst[src.indexOf(ch)] ?? ch).join("");
};

const LOWER = "abcdefghijklmnopqrstuvwxyz";
const small = table(LOWER + LOWER.toUpperCase(), "ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢ".repeat(2));
const flipMap = table("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,!?'\"()[]{}<>&_", "ɐqɔpǝɟƃɥᴉɾʞlɯuodbɹsʇnʌʍxʎz∀ꓭƆꓷƎℲ⅁HIſꓘ˥WNOԀꝹꓤSꓕՈΛMX⅄Z0⇂ᘔƐㄣϛ9ㄥ86˙'¡¿,„)(][}{><⅋‾");
const circled = (s: string) =>
  Array.from(s)
    .map((ch) => {
      const c = ch.codePointAt(0)!;
      if (c >= A && c <= 90) return cp(0x24b6 + c - A);
      if (c >= a && c <= 122) return cp(0x24d0 + c - a);
      if (c === ZERO) return cp(0x24ea);
      if (c > ZERO && c <= 57) return cp(0x2460 + c - ZERO - 1);
      return ch;
    })
    .join("");
const combine = (mark: string) => (s: string) => Array.from(s).map((ch) => (ch === " " || ch === "\n" ? ch : ch + mark)).join("");

const STYLES: Style[] = [
  { id: "bold", name: "Bold", map: alpha(0x1d400, 0x1d41a, 0x1d7ce) },
  { id: "italic", name: "Italic", map: alpha(0x1d434, 0x1d44e, null, { h: 0x210e }) },
  { id: "bold-italic", name: "Bold italic", map: alpha(0x1d468, 0x1d482, null) },
  { id: "script", name: "Script", map: alpha(0x1d49c, 0x1d4b6, null, { B: 0x212c, E: 0x2130, F: 0x2131, H: 0x210b, I: 0x2110, L: 0x2112, M: 0x2133, R: 0x211b, e: 0x212f, g: 0x210a, o: 0x2134 }) },
  { id: "bold-script", name: "Bold script", map: alpha(0x1d4d0, 0x1d4ea, null) },
  { id: "fraktur", name: "Gothic (Fraktur)", map: alpha(0x1d504, 0x1d51e, null, { C: 0x212d, H: 0x210c, I: 0x2111, R: 0x211c, Z: 0x2128 }) },
  { id: "bold-fraktur", name: "Bold gothic", map: alpha(0x1d56c, 0x1d586, null) },
  { id: "double", name: "Double-struck", map: alpha(0x1d538, 0x1d552, 0x1d7d8, { C: 0x2102, H: 0x210d, N: 0x2115, P: 0x2119, Q: 0x211a, R: 0x211d, Z: 0x2124 }) },
  { id: "sans-bold", name: "Sans bold", map: alpha(0x1d5d4, 0x1d5ee, 0x1d7ec) },
  { id: "sans-italic", name: "Sans italic", map: alpha(0x1d608, 0x1d622, null) },
  { id: "mono", name: "Monospace", map: alpha(0x1d670, 0x1d68a, 0x1d7f6) },
  { id: "small-caps", name: "Small caps", map: small },
  { id: "circled", name: "Circled", map: circled },
  { id: "squared", name: "Squared", map: alpha(0x1f130, null, null) },
  { id: "neg-squared", name: "Black squares", map: alpha(0x1f170, null, null) },
  { id: "fullwidth", name: "Wide (fullwidth)", map: (s) => Array.from(s).map((ch) => { const c = ch.codePointAt(0)!; return c === 32 ? "　" : c > 32 && c < 127 ? cp(c + 0xfee0) : ch; }).join("") },
  { id: "upside-down", name: "Upside down", map: (s) => Array.from(flipMap(s)).reverse().join("") },
  { id: "strike", name: "Strikethrough", map: combine("̶") },
  { id: "underline", name: "Underline", map: combine("̲") },
];

export function FancyTextGenerator() {
  const [text, setText] = useState("Fancy Text Generator");
  const input = text.slice(0, 500);
  return (
    <div className="space-y-4">
      <Panel>
        <FieldLabel htmlFor="fancy-text" hint="Letters A–Z and numbers change; other characters stay as they are">
          Your text
        </FieldLabel>
        <textarea id="fancy-text" value={text} onChange={(e) => setText(e.target.value)} rows={3} maxLength={500} className={textareaClass} />
      </Panel>
      <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {STYLES.map((st) => {
          const out = st.map(input);
          return (
            <li key={st.id} className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-4">
              <span className="min-w-0 flex-1">
                <span className="block text-[12px] text-muted">{st.name}</span>
                <span className="mt-0.5 block truncate text-[19px] text-ink">{out || " "}</span>
              </span>
              <CopyButton value={out} label={`Copy ${st.name}`} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
