"use client";

import { forwardRef, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { FastForward } from "lucide-react";

/**
 * The letter a Diwali scene hands over to: handmade paper, gold foil border,
 * a printed letterhead — and the words themselves arriving one at a time.
 *
 * Every word is in the DOM from the first render (opacity 0 until its turn),
 * so the paper is already its final size before the stream starts: nothing
 * reflows while someone is reading, and the envelope ceremony can measure the
 * sheet it has to fold.
 */

export type LetterMode = "hidden" | "stream" | "full";

const INK = "#4a1d12";
const GOLD = "#b8860b";

/**
 * Pacing. ~380ms a word is ≈2.6 words/s on paper, but the pauses below land
 * on almost every sentence, so a real letter streams at about two words a
 * second — slow enough to read along with, never a wall of text in a blink.
 */
const WORD_MS = 380;
const COMMA_MS = 220;
const STOP_MS = 520;
const BLOCK_MS = 750;
const START_MS = 500;

interface Block {
  kind: "salutation" | "para" | "wish" | "closing" | "signature";
  words: string[];
  start: number;
}

function buildBlocks(to: string, message: string, wish: string | undefined, from: string): Block[] {
  const raw: Omit<Block, "start">[] = [];
  const words = (s: string) => s.split(/\s+/).filter(Boolean);

  raw.push({ kind: "salutation", words: words(to ? `Dear ${to},` : "Dear you,") });
  for (const para of message.split(/\n\s*\n|\n/)) {
    const w = words(para);
    if (w.length) raw.push({ kind: "para", words: w });
  }
  if (wish?.trim()) raw.push({ kind: "wish", words: words(wish) });
  raw.push({ kind: "closing", words: words("With love and light,") });
  raw.push({ kind: "signature", words: words(from || "Someone who loves you") });

  let start = 0;
  return raw.map((b) => {
    const block = { ...b, start };
    start += b.words.length;
    return block;
  });
}

/** How long to wait *after* word `i` before showing the next one. */
function pauseAfter(word: string, endsBlock: boolean): number {
  if (endsBlock) return BLOCK_MS;
  if (/[.!?…।]["'”’)]*$/.test(word)) return WORD_MS + STOP_MS;
  if (/[,;:—–-]["'”’)]*$/.test(word)) return WORD_MS + COMMA_MS;
  return WORD_MS;
}

export interface DiwaliLetterProps {
  to: string;
  from: string;
  message: string;
  wish?: string;
  /** Body font class from the card's font choice. */
  bodyFont: string;
  mode: LetterMode;
  /** The stream reached the last word (or the reader asked for all of it). */
  onStreamEnd?: () => void;
  className?: string;
  style?: CSSProperties;
}

const DiwaliLetter = forwardRef<HTMLDivElement, DiwaliLetterProps>(function DiwaliLetter(
  { to, from, message, wish, bodyFont, mode, onStreamEnd, className = "", style },
  ref,
) {
  const blocks = useMemo(() => buildBlocks(to, message, wish, from), [to, message, wish, from]);
  const total = blocks.reduce((n, b) => n + b.words.length, 0);
  const flat = useMemo(() => blocks.flatMap((b) => b.words.map((w, i) => ({ w, end: i === b.words.length - 1 }))), [blocks]);

  // `shown` only matters while streaming; "full" and "hidden" ignore it, and
  // the parent remounts this component (via `key`) for every fresh stream.
  const [shown, setShown] = useState(0);
  const [skipped, setSkipped] = useState(false);
  const streaming = mode === "stream" && !skipped && shown < total;
  const visible = mode === "full" || skipped ? total : mode === "stream" ? shown : 0;

  const caretRef = useRef<HTMLSpanElement>(null);
  const userScrolledAt = useRef(0);
  const ended = useRef(false);

  useEffect(() => {
    if (!streaming) return;
    const prev = shown === 0 ? null : flat[shown - 1];
    const wait = prev ? pauseAfter(prev.w, prev.end) : START_MS;
    const t = setTimeout(() => setShown((n) => n + 1), wait);
    return () => clearTimeout(t);
  }, [streaming, shown, flat]);

  useEffect(() => {
    if (mode !== "stream" || ended.current) return;
    if (visible >= total) {
      ended.current = true;
      onStreamEnd?.();
    }
  }, [mode, visible, total, onStreamEnd]);

  // Follow the words down the page, but never fight the reader: any scroll
  // they make themselves pauses the follow for a few seconds.
  useEffect(() => {
    if (!streaming) return;
    const mark = () => (userScrolledAt.current = Date.now());
    window.addEventListener("wheel", mark, { passive: true });
    window.addEventListener("touchmove", mark, { passive: true });
    window.addEventListener("keydown", mark);
    return () => {
      window.removeEventListener("wheel", mark);
      window.removeEventListener("touchmove", mark);
      window.removeEventListener("keydown", mark);
    };
  }, [streaming]);

  useEffect(() => {
    if (!streaming || !caretRef.current) return;
    if (Date.now() - userScrolledAt.current < 3500) return;
    const r = caretRef.current.getBoundingClientRect();
    const limit = window.innerHeight * 0.72;
    if (r.bottom > limit) window.scrollBy({ top: r.bottom - window.innerHeight * 0.5, behavior: "smooth" });
  }, [shown, streaming]);

  const renderWords = (b: Block) =>
    b.words.map((w, i) => {
      const idx = b.start + i;
      const on = idx < visible;
      const isLast = streaming && idx === visible - 1;
      return (
        <span key={idx}>
          <span className={on ? "ll-word-in" : "inline-block opacity-0"}>{w}</span>
          {isLast && (
            <span ref={caretRef} aria-hidden className="relative inline-block w-0">
              <span className="ll-stream-caret absolute -right-3 bottom-[0.3em] h-2 w-2 rounded-full" />
            </span>
          )}{" "}
        </span>
      );
    });

  const plain = blocks.map((b) => b.words.join(" ")).join("\n\n");

  return (
    <div className={`relative w-full ${className}`} style={style}>
      <div
        ref={ref}
        className="relative w-full overflow-hidden rounded-[14px] shadow-[0_30px_80px_-24px_rgba(0,0,0,0.75),0_0_140px_-30px_rgba(251,191,36,0.45)]"
      >
        <PaperBackground />

        {/* The text a screen reader gets, whole, from the start. */}
        <p className="sr-only">{plain}</p>

        <div
          aria-hidden
          className={`relative px-7 pb-16 pt-[148px] text-[17px] leading-[1.85] sm:px-12 sm:text-lg ${bodyFont}`}
          style={{ color: INK }}
        >
          {blocks.map((b, bi) => {
            switch (b.kind) {
              case "salutation":
                return (
                  <p key={bi} className="mb-5 font-handwriting text-[1.9rem] leading-tight sm:text-4xl" style={{ color: "#8a2a12" }}>
                    {renderWords(b)}
                  </p>
                );
              case "para":
                return (
                  <p key={bi} className="mb-4 text-pretty">
                    {renderWords(b)}
                  </p>
                );
              case "wish":
                return (
                  <div key={bi} className="relative my-8 rounded-xl px-5 py-4 text-center" style={{ background: "rgba(184,134,11,0.09)", boxShadow: `inset 0 0 0 1px rgba(184,134,11,0.35)` }}>
                    <p
                      className={`mb-1 font-sans text-[10px] font-semibold uppercase tracking-[0.28em] transition-opacity duration-700 ${visible > b.start ? "opacity-100" : "opacity-0"}`}
                      style={{ color: GOLD }}
                    >
                      ✦ My wish for you ✦
                    </p>
                    <p className="font-serif text-lg italic sm:text-xl" style={{ color: "#7a3b08" }}>
                      {renderWords(b)}
                    </p>
                  </div>
                );
              case "closing":
                return (
                  <p key={bi} className="mt-8 text-right italic opacity-80">
                    {renderWords(b)}
                  </p>
                );
              case "signature":
                return (
                  <p key={bi} className="text-right font-handwriting text-[2rem] leading-tight sm:text-4xl" style={{ color: "#8a2a12" }}>
                    {renderWords(b)}
                  </p>
                );
            }
          })}
        </div>
      </div>

      {streaming && (
        <button
          type="button"
          onClick={() => setSkipped(true)}
          className="ll-rise-in fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full border border-amber-200/25 bg-[#1a0d06]/80 px-4 py-2 text-xs font-medium tracking-wide text-amber-100/85 shadow-lg backdrop-blur-md transition-[background-color,transform] duration-200 ease-out-strong hover:bg-[#1a0d06]/95 active:scale-[0.97]"
          style={{ "--ll-delay": "1500ms" } as CSSProperties}
        >
          <FastForward size={14} />
          Show the whole letter
        </button>
      )}
    </div>
  );
});

export default DiwaliLetter;

// ---------------------------------------------------------------------------

const NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.45 0 0 0 0 0.3 0 0 0 0 0.1 0 0 0 0.22 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

/**
 * The stationery: everything on the sheet that is not the letter itself.
 * Shared with the envelope ceremony, which slices it into fold panels — so it
 * must depend on nothing but the box it fills.
 */
export function PaperBackground({ back = false }: { back?: boolean }) {
  if (back) {
    return (
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage: `${NOISE}, linear-gradient(180deg, #ecd9b0, #e2c994)`,
        }}
      />
    );
  }
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `${NOISE}, radial-gradient(130% 70% at 50% 0%, #fffaf0 0%, #fbf0d9 45%, #f1dfba 100%)`,
        }}
      />
      {/* Warm vignette, like lamplight falling off at the edges. */}
      <div className="absolute inset-0" style={{ boxShadow: "inset 0 0 90px rgba(150,90,20,0.22)" }} />

      {/* Double gold rule. */}
      <div className="absolute inset-3 rounded-[10px] border-[1.5px]" style={{ borderColor: "rgba(184,134,11,0.75)" }} />
      <div className="absolute inset-[18px] rounded-[7px] border" style={{ borderColor: "rgba(184,134,11,0.35)" }} />

      <Corner className="left-2 top-2" />
      <Corner className="right-2 top-2" style={{ transform: "scaleX(-1)" }} />
      <Corner className="bottom-2 left-2" style={{ transform: "scaleY(-1)" }} />
      <Corner className="bottom-2 right-2" style={{ transform: "scale(-1)" }} />

      {/* Letterhead. */}
      <div className="absolute inset-x-0 top-8 flex flex-col items-center">
        <Diya size={44} />
        <p className="mt-1 text-[13px] leading-none tracking-wide" style={{ color: "#8a2a12" }} lang="hi">
          शुभ दीपावली
        </p>
        <p className="mt-1.5 font-sans text-[9px] font-semibold uppercase tracking-[0.42em]" style={{ color: GOLD }}>
          Shubh Deepavali
        </p>
        <Divider className="mt-3" />
      </div>

      {/* Footer flourish. */}
      <div className="absolute inset-x-0 bottom-7 flex justify-center">
        <Divider />
      </div>
    </div>
  );
}

function Corner({ className, style }: { className: string; style?: CSSProperties }) {
  return (
    <svg aria-hidden viewBox="0 0 64 64" className={`absolute h-14 w-14 ${className}`} style={style} fill="none">
      <path d="M6 62V24Q6 6 24 6h38" stroke={GOLD} strokeWidth="1.6" />
      <path d="M12 62V27q0-15 15-15h35" stroke={GOLD} strokeOpacity=".5" strokeWidth="1" />
      <path d="M22 31c-7 0-8-10-1-14s12 6 6 10c-2 1-3 2-5 4Z" fill={GOLD} fillOpacity=".75" />
      <circle cx="38" cy="18" r="1.6" fill={GOLD} />
      <circle cx="46" cy="18" r="1.2" fill={GOLD} fillOpacity=".7" />
      <circle cx="18" cy="38" r="1.6" fill={GOLD} />
      <circle cx="18" cy="46" r="1.2" fill={GOLD} fillOpacity=".7" />
    </svg>
  );
}

function Divider({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 160 12" className={`h-3 w-40 ${className}`} fill="none">
      <path d="M2 6h60M98 6h60" stroke={GOLD} strokeOpacity=".6" strokeWidth="1" />
      <path d="M80 1l5 5-5 5-5-5z" fill={GOLD} />
      <circle cx="68" cy="6" r="1.6" fill={GOLD} />
      <circle cx="92" cy="6" r="1.6" fill={GOLD} />
    </svg>
  );
}

export function Diya({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 48 48" width={size} height={size} className={className}>
      <defs>
        <radialGradient id="ll-diya-flame" cx="50%" cy="70%" r="60%">
          <stop offset="0%" stopColor="#fffbe6" />
          <stop offset="45%" stopColor="#fcd34d" />
          <stop offset="100%" stopColor="#f97316" />
        </radialGradient>
        <linearGradient id="ll-diya-bowl" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c2410c" />
          <stop offset="100%" stopColor="#7c2d12" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="22" r="13" fill="#fbbf24" opacity=".18" className="ll-diya-halo" />
      <g className="ll-diya-flame" style={{ transformOrigin: "24px 30px" }}>
        <path d="M24 12c4 6 6 10 4 14-1 3-7 3-8 0-2-4 0-8 4-14Z" fill="url(#ll-diya-flame)" />
      </g>
      <path d="M8 30h32c-2 8-9 12-16 12S10 38 8 30Z" fill="url(#ll-diya-bowl)" />
      <path d="M8 30h32" stroke="#fcd34d" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M14 35h20" stroke="#fcd34d" strokeOpacity=".5" strokeWidth="1" strokeDasharray="1 3" strokeLinecap="round" />
    </svg>
  );
}
