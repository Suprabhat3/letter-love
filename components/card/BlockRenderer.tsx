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
}: {
  text: string;
  mode: Theme["motion"]["reveal"];
  stepMs: number;
  active: boolean;
  className?: string;
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
    return <p className={className}>{text.slice(0, shown)}</p>;
  }

  return (
    <div className={className}>
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
          className={`text-sm uppercase tracking-[0.2em] text-foreground/50 ${align} ${fonts.body}`}
          style={{ color }}
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
          className={`text-xl md:text-2xl font-medium text-foreground/80 ${align} ${fonts.header}`}
          style={{ color }}
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
          className={`text-lg md:text-xl text-foreground/80 leading-relaxed whitespace-pre-line max-w-md ${
            layout === "letter-sheet" ? "" : "mx-auto"
          } ${align} ${fonts.body}`}
        />
      );

    case "quote":
      return (
        <p
          className={`text-foreground/60 italic border-t border-foreground/10 pt-5 max-w-md ${
            layout === "letter-sheet" ? "" : "mx-auto"
          } ${align} ${fonts.body}`}
          style={{ color }}
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
          <span className="text-foreground/60 ml-2">{block.label}</span>
        </div>
      );

    case "highlight":
      return (
        <div className="bg-white/40 p-4 rounded-xl w-full max-w-xs mx-auto text-center">
          {block.label && (
            <p className="text-foreground/60 uppercase tracking-widest text-[10px] mb-1">
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
          className={`text-foreground/60 ${align} ${fonts.header}`}
          style={{ color }}
        >
          {text}
        </p>
      );
  }
}
