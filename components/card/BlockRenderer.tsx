"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import Image from "next/image";
import type { BlockSpec, LayoutVariant, MediaSpec, Theme } from "@/lib/theme";
import { alpha, resolveColor } from "@/lib/theme";
import { track } from "@/lib/analytics";

export type CardContent = Record<string, string>;

interface Textish {
  text?: string;
  field?: string;
  fallbackFields?: string[];
  fallback?: string;
  when?: string;
}

/**
 * Resolve a text block's copy: literal `text` wins, then `field`, then each of
 * `fallbackFields`, then the literal `fallback`.
 *
 * Returning null is how optional template fields (petName, years, wish) drop
 * out of the layout — the renderer has no per-field conditionals at all.
 */
function resolveText(block: Textish, content: CardContent): string | null {
  if (block.when && !content[block.when]?.trim()) return null;
  if (block.text) return block.text;

  const fields = [block.field, ...(block.fallbackFields ?? [])];
  for (const name of fields) {
    if (!name) continue;
    const value = content[name]?.trim();
    if (value) return value;
  }
  return block.fallback?.trim() || null;
}

function decorate(
  value: string,
  block: { prefix?: string; suffix?: string },
): string {
  const prefix = block.prefix ? `${block.prefix} ` : "";
  return `${prefix}${value}${block.suffix ?? ""}`;
}

// ---------------------------------------------------------------------------

/**
 * Reveals a body line by line, or character by character.
 *
 * Always mounted and always running its own hooks — the dispatch below picks
 * between whole components, never between "call a hook or return early",
 * which is the bug class that made the old ShareCardView crash-prone.
 */
function PacedText({
  text,
  mode,
  stepMs,
  active,
  className,
  color,
}: {
  text: string;
  mode: Theme["motion"]["reveal"];
  stepMs: number;
  active: boolean;
  className?: string;
  color?: string;
}) {
  const lines = text.split("\n");
  const total = mode === "typewriter" ? text.length : lines.length;

  // A paced reveal IS motion, so reduced motion gets the whole body at once —
  // dimming or shortening it would not be respecting the setting.
  const reduceMotion = useReducedMotion();
  const running = active && !reduceMotion;

  const [shown, setShown] = useState(() => (running ? 0 : total));

  // No reset here: the caller keys this component on the text, so a change
  // remounts it with a fresh initial count. Resetting from inside the effect
  // would be the cascading-render pattern React now warns about.
  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => {
      setShown((n) => {
        if (n >= total) {
          clearInterval(timer);
          return n;
        }
        return n + 1;
      });
    }, stepMs);
    return () => clearInterval(timer);
  }, [running, total, stepMs]);

  // Nobody should be held hostage by the stagger: a tap anywhere jumps to the
  // fully revealed letter.
  useEffect(() => {
    if (!running) return;
    const finish = () => setShown(total);
    window.addEventListener("pointerdown", finish);
    return () => window.removeEventListener("pointerdown", finish);
  }, [running, total]);

  if (mode === "typewriter") {
    return (
      <p className={className} style={{ color }}>
        {text.slice(0, shown)}
      </p>
    );
  }

  return (
    <div className={className} style={{ color }}>
      {lines.map((line, i) => (
        <motion.p
          key={i}
          initial={false}
          animate={{ opacity: i < shown ? 1 : 0, y: i < shown ? 0 : 8 }}
          transition={{ duration: 0.4 }}
        >
          {line || " "}
        </motion.p>
      ))}
    </div>
  );
}

/**
 * "Open When…" — a pack of notes that are each still sealed.
 *
 * Its own component so it owns its hook unconditionally, the same reason
 * `PacedText` is one. The open set is local and deliberately not persisted:
 * this card is meant to be reopened on a different day, on whichever device
 * the recipient has to hand, and a "you already read this" state would take
 * that away.
 */
function LetterPack({
  items,
  content,
  palette,
  fonts,
}: {
  items: { label: string; field: string; emoji?: string }[];
  content: CardContent;
  palette: Theme["palette"];
  fonts: { header: string; body: string };
}) {
  const [open, setOpen] = useState<string | null>(null);

  const filled = items.filter((item) => content[item.field]?.trim());
  if (filled.length === 0) return null;

  return (
    <div className="w-full flex flex-col gap-3">
      {filled.map((item) => {
        const isOpen = open === item.field;
        return (
          <div
            key={item.field}
            className="rounded-2xl overflow-hidden border transition-colors"
            style={{
              borderColor: alpha(palette.primary, 0.25),
              backgroundColor: alpha(palette.primary, isOpen ? 0.06 : 0.1),
            }}
          >
            <button
              type="button"
              // A real button, so the pack is operable by keyboard and
              // announced as expandable rather than as decorative text.
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : item.field)}
              className={`w-full flex items-center gap-3 px-5 py-4 text-left ${fonts.header}`}
              style={{ color: palette.accent }}
            >
              <span className="text-2xl leading-none">
                {item.emoji ?? (isOpen ? "📖" : "✉️")}
              </span>
              <span className="flex-1 text-base md:text-lg">{item.label}</span>
              <span className="text-xs uppercase tracking-widest opacity-60">
                {isOpen ? "Close" : "Open"}
              </span>
            </button>
            <motion.div
              initial={false}
              animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
              transition={{ duration: 0.35 }}
              className="overflow-hidden"
            >
              <p
                className={`px-5 pb-5 text-base md:text-lg leading-relaxed whitespace-pre-line ${fonts.body}`}
                style={{ color: alpha(palette.ink, 0.85) }}
              >
                {content[item.field]}
              </p>
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------

const TITLE_SIZES = {
  md: "text-3xl md:text-4xl",
  lg: "text-4xl md:text-5xl",
  xl: "text-5xl md:text-6xl",
} as const;

function HeroMedia({ media }: { media: MediaSpec }) {
  if (media.kind === "emoji") {
    return (
      <div
        className="filter drop-shadow-lg select-none leading-none"
        style={{ fontSize: `${media.sizeRem ?? 5}rem` }}
      >
        {media.value}
      </div>
    );
  }
  return (
    <div
      className="relative w-full mx-auto overflow-hidden rounded-xl"
      style={{ maxWidth: media.kind === "gif" ? (media.maxWidthPx ?? 280) : 280 }}
    >
      <Image
        src={media.src}
        alt={media.alt}
        width={media.width}
        height={media.height}
        className="w-full h-auto rounded-lg"
        unoptimized
      />
    </div>
  );
}

export interface BlockRendererProps {
  block: BlockSpec;
  content: CardContent;
  theme: Theme;
  fonts: { header: string; body: string };
  layout: LayoutVariant;
  /** Drives the paced reveal. Phase 2 turns this on when the envelope opens. */
  paced: boolean;
  onReplay?: () => void;
}

export default function BlockRenderer({
  block,
  content,
  theme,
  fonts,
  layout,
  paced,
  onReplay,
}: BlockRendererProps) {
  const { palette } = theme;
  const align = layout === "letter-sheet" ? "text-left" : "text-center";

  // Text colour comes from `palette.ink`, never from the global `--foreground`.
  // Those were the same thing while every theme sat on a near-white surface,
  // and stopped being the same thing the moment a theme wanted a dark one:
  // a Tailwind `text-foreground` class beats the inherited colour CardRenderer
  // sets on the article, so a dark card rendered dark text on a dark surface.
  const ink = (opacity: number) => alpha(palette.ink, opacity);

  switch (block.type) {
    case "spacer":
      return (
        <div
          className={
            block.size === "lg" ? "h-10" : block.size === "sm" ? "h-2" : "h-5"
          }
        />
      );

    case "hero":
      if (block.when && !content[block.when]?.trim()) return null;
      return (
        <div className="flex justify-center w-full">
          <HeroMedia media={block.media} />
        </div>
      );

    case "cta":
      return (
        <Link
          href={block.href}
          onClick={() => track("reply_click", { href: block.href })}
          className={
            block.variant === "ghost"
              ? "bg-white/60 hover:bg-white/90 text-foreground px-8 py-3 rounded-full font-medium transition-all shadow-sm"
              : "btn-primary px-8 py-3 rounded-full text-lg font-semibold shadow-lg hover:scale-105 transition-transform inline-block"
          }
        >
          {block.label}
        </Link>
      );

    case "replay":
      // Preserved deliberately: BirthdayCard's Replay button is a real feature
      // that would otherwise vanish silently in this refactor.
      if (!onReplay) return null;
      return (
        <button
          type="button"
          onClick={onReplay}
          className="bg-white/50 hover:bg-white/80 text-foreground px-6 py-3 rounded-full font-medium transition-all shadow-sm hover:scale-105"
        >
          {block.label ?? "Replay"}
        </button>
      );

    case "pack":
      return (
        <LetterPack
          items={block.items}
          content={content}
          palette={palette}
          fonts={fonts}
        />
      );

    case "list": {
      const raw = content[block.field]?.trim();
      if (!raw) return null;
      // Split on newlines, drop blanks, and strip any numbering the sender
      // typed themselves — otherwise "1. because" renders as "1. 1. because".
      const items = raw
        .split("\n")
        .map((line) => line.replace(/^\s*(?:\d+[.)]|[-•*])\s*/, "").trim())
        .filter(Boolean)
        .slice(0, block.max ?? 30);
      if (items.length === 0) return null;

      return (
        <ol className="w-full flex flex-col gap-3 text-left">
          {items.map((item, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: Math.min(i * 0.07, 1.2), duration: 0.35 }}
              className="flex items-baseline gap-3"
            >
              <span
                className="shrink-0 text-sm font-bold tabular-nums"
                style={{ color: palette.primary }}
              >
                {block.numbered === false
                  ? (block.bullet ?? "•")
                  : `${String(i + 1).padStart(2, "0")}`}
              </span>
              <span
                className={`text-base md:text-lg leading-relaxed ${fonts.body}`}
                style={{ color: ink(0.85) }}
              >
                {item}
              </span>
            </motion.li>
          ))}
        </ol>
      );
    }
  }

  // Every non-text case above returns, so `block` is narrowed to the
  // text-bearing members of the union from here down.
  const value = resolveText(block, content);
  if (!value) return null;
  const text = decorate(value, block);
  const color = block.color
    ? resolveColor(block.color, palette)
    : undefined;

  switch (block.type) {
    case "badge":
      return (
        <span
          className="px-4 py-2 rounded-full text-sm font-medium inline-block shadow-sm"
          style={{
            backgroundColor: alpha(palette.primary, 0.12),
            color: color ?? palette.accent,
          }}
        >
          {block.emoji ? `${block.emoji} ${text}` : text}
        </span>
      );

    case "eyebrow":
      return (
        <p
          className={`text-sm uppercase tracking-[0.2em] ${align} ${fonts.body}`}
          style={{ color: color ?? ink(0.55) }}
        >
          {text}
        </p>
      );

    case "title":
      return (
        <h1
          className={`${TITLE_SIZES[block.size ?? "lg"]} leading-tight ${align} ${fonts.header}`}
          style={{ color: color ?? palette.primary }}
        >
          {text}
        </h1>
      );

    case "subtitle":
      return (
        <h2
          className={`text-xl md:text-2xl font-medium ${align} ${fonts.header}`}
          style={{ color: color ?? ink(0.85) }}
        >
          {text}
        </h2>
      );

    case "body":
      return (
        <PacedText
          // Remounting on a text change is the reset for the reveal counter.
          key={`${text}:${paced}`}
          text={text}
          mode={block.paced ? theme.motion.reveal : "none"}
          stepMs={theme.motion.revealStepMs}
          active={Boolean(block.paced) && paced && theme.motion.reveal !== "none"}
          className={`text-lg md:text-xl leading-relaxed whitespace-pre-line max-w-md ${
            layout === "letter-sheet" ? "" : "mx-auto"
          } ${align} ${fonts.body}`}
          color={color ?? ink(0.85)}
        />
      );

    case "quote":
      return (
        <p
          className={`italic border-t pt-5 max-w-md ${
            layout === "letter-sheet" ? "" : "mx-auto"
          } ${align} ${fonts.body}`}
          style={{ color: color ?? ink(0.62), borderColor: ink(0.12) }}
        >
          &ldquo;{text}&rdquo;
        </p>
      );

    case "stat":
      return (
        <div className={align}>
          <span
            className="text-5xl font-bold font-serif"
            style={{ color: color ?? palette.primary }}
          >
            {text}
          </span>
          <span className="ml-2" style={{ color: ink(0.62) }}>
            {block.label}
          </span>
        </div>
      );

    case "highlight":
      return (
        <div
          className="p-4 rounded-xl w-full max-w-xs mx-auto text-center"
          // An ink wash rather than `bg-white/40`: ink is light on a dark theme
          // and dark on a light one, so the same value reads correctly on both.
          style={{ backgroundColor: ink(0.07) }}
        >
          {block.label && (
            <p
              className="uppercase tracking-widest text-[10px] mb-1"
              style={{ color: ink(0.62) }}
            >
              {block.label}
            </p>
          )}
          <p
            className={`text-base md:text-lg font-medium ${fonts.header}`}
            style={{ color: color ?? palette.accent }}
          >
            {block.emoji ? `${block.emoji} ${text}` : `“${text}”`}
          </p>
        </div>
      );

    case "signature":
      return (
        <p
          className={`${align} ${fonts.header}`}
          style={{ color: color ?? ink(0.62) }}
        >
          {text}
        </p>
      );
  }
}
