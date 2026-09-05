"use client";

import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { Template, CATEGORIES } from "@/lib/types";
import { Clock, Star, ArrowRight, Tag, Eye } from "lucide-react";
import { useState, type CSSProperties, type PointerEvent } from "react";
import Typewriter from "./Typewriter";

/** easeOutExpo (easings.net), as the tuple Motion takes. */
const EASE_OUT_SOFT = [0.16, 1, 0.3, 1] as const;

/**
 * Entrance delay, staggered by column rather than by index.
 *
 * Straight `index * n` makes the last card in a twenty-card grid wait for
 * everything before it. Capping that delay is worse still — every card past the
 * cap fires on the same frame, so the grid arrives as one block, which is the
 * thing a stagger exists to avoid. Keying off the column means each row
 * cascades left to right, the delay never accumulates, and the whole grid
 * reads as a diagonal sweep.
 */
const COLUMNS = 3;
const STAGGER_MS = 90;

interface TemplateCardProps {
  template: Template;
  index: number;
  onQuickView?: (template: Template) => void;
}

export default function TemplateCard({
  template,
  index,
  onQuickView,
}: TemplateCardProps) {
  const category = CATEGORIES.find((c) => c.id === template.category);
  const reduceMotion = useReducedMotion();

  /**
   * Hover, in React, only so the typewriter knows when to run.
   *
   * The visual crossfade stays in CSS (`pointer-fine:group-hover:`) so it keeps
   * running off the main thread — this state exists purely to start and stop
   * the typing, and costs two renders per hover rather than one per character.
   */
  const [hovered, setHovered] = useState(false);

  // `pointerType` rather than a hover media query: a tap on a phone fires
  // pointerenter too, and the quote should never start typing there — there is
  // no hover to reveal it under.
  const onPointerEnter = (event: PointerEvent) => {
    if (event.pointerType === "mouse") setHovered(true);
  };

  const { primary, secondary, accent } = template.colors;

  return (
    <motion.article
      // `layout` is what makes filtering legible: the cards that survive a
      // filter change glide to their new slots instead of teleporting.
      layout={reduceMotion ? false : "position"}
      transition={{ duration: 0.55, ease: EASE_OUT_SOFT }}
      exit={{ opacity: 0, transform: "scale(0.96)" }}
      onPointerEnter={onPointerEnter}
      onPointerLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      // The entrance is CSS, not a motion variant: every card in the grid
      // mounts at once while the page is still fetching fonts and painting the
      // hero, and the CSS animation is the one that survives that.
      className="ll-rise-in group relative h-full"
      style={
        {
          "--ll-delay": `${(index % COLUMNS) * STAGGER_MS}ms`,
        } as CSSProperties
      }
    >
      <div
        // Long and soft. A gallery of love letters is a browsing surface, not a
        // control panel — the lift should feel like paper being picked up, not
        // like a button acknowledging a click.
        className="relative flex h-full min-h-88 flex-col overflow-hidden rounded-3xl bg-white p-7 shadow-xs ring-1 ring-black/5 transition-[transform,box-shadow] duration-500 ease-out-soft group-active:scale-[0.99] group-active:duration-200 pointer-fine:group-hover:-translate-y-2 pointer-fine:group-hover:shadow-2xl"
        style={{
          backgroundImage: `linear-gradient(150deg, ${secondary}1f 0%, ${primary}0a 55%, transparent 100%)`,
        }}
      >
        {/* The glow. Back after I wrongly stripped it — without it the grid was
            flat white — but as a CSS keyframe rather than a motion component
            per card, so the whole grid costs nothing per frame. */}
        <div
          aria-hidden
          className="ll-card-glow pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full blur-3xl"
          style={
            {
              backgroundColor: primary,
              // Offsetting each card's cycle stops the grid from pulsing in
              // unison, which reads as a strobe rather than as ambience.
              "--ll-duration": `${9 + (index % 4)}s`,
              "--ll-delay": `${(index % 5) * 0.8}s`,
            } as CSSProperties
          }
        />

        {/* Colour wash that deepens on hover, over a pre-painted layer so no
            gradient is repainted per frame. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 pointer-fine:group-hover:opacity-100"
          style={{
            backgroundImage: `linear-gradient(150deg, ${secondary}33 0%, ${primary}14 60%, transparent 100%)`,
          }}
        />

        {/* Header: category and popularity. */}
        <div className="relative flex items-center justify-between gap-2">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide uppercase"
            style={{
              backgroundColor: `${primary}1a`,
              color: accent,
              boxShadow: `inset 0 0 0 1px ${primary}33`,
            }}
          >
            {category?.emoji} {category?.name}
          </span>

          {template.popularity && template.popularity >= 4 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-[11px] font-medium text-amber-600">
              <Star size={11} fill="currentColor" />
              Popular
            </span>
          )}
        </div>

        {/*
          The two faces of the card, turning over.

          The blur is the important part. Without it you see two distinct
          objects overlapping mid-swap — which is exactly what made the old
          crossfade read as a cheap pop. Blurring both sides while they cross
          blends them into one perceived transformation instead. The outgoing
          face also leaves faster than the incoming one arrives, so they are
          never both at full strength at the same moment.
        */}
        <div className="relative my-7 flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center text-center transition-[opacity,transform,filter] duration-400 ease-out-soft pointer-fine:group-hover:-translate-y-2 pointer-fine:group-hover:blur-[3px] pointer-fine:group-hover:opacity-0">
            <div
              className="mb-5 flex h-24 w-24 items-center justify-center rounded-full text-6xl leading-none drop-shadow-xs"
              style={{ backgroundColor: `${primary}14` }}
            >
              {template.emoji}
            </div>
            <h3 className="font-serif text-2xl font-bold text-foreground/90">
              {template.name}
            </h3>
            <p className="mt-2.5 line-clamp-2 max-w-60 text-sm leading-relaxed text-muted-foreground">
              {template.description}
            </p>
          </div>

          {/* Absolutely positioned so the turn costs no layout, and
              `aria-hidden` because a screen reader already has the name and
              description from the face above — the quote is atmosphere. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 flex translate-y-3 scale-98 flex-col items-center justify-center px-2 text-center opacity-0 blur-[3px] transition-[opacity,transform,filter] delay-100 duration-500 ease-out-soft pointer-fine:group-hover:translate-y-0 pointer-fine:group-hover:scale-100 pointer-fine:group-hover:opacity-100 pointer-fine:group-hover:blur-none"
          >
            <span
              className="font-serif text-5xl leading-none"
              style={{ color: `${primary}40` }}
            >
              &ldquo;
            </span>
            <Typewriter
              text={template.previewText}
              // Waits for the face above to be most of the way gone, so the
              // quote is never typing over the emoji it is replacing.
              active={hovered}
              startDelayMs={260}
              speedMs={20}
              resetDelayMs={520}
              className="font-handwriting text-xl leading-relaxed text-foreground/75 italic"
            />
          </div>
        </div>

        {/* Footer: meta on the left, actions on the right. They share a row
            now — the actions used to float over the meta line and cover it. */}
        <div className="relative flex items-end justify-between gap-3 border-t border-black/5 pt-5">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground/80">
            {template.estimatedTime && (
              <span className="inline-flex items-center gap-1.5">
                <Clock size={13} />
                {template.estimatedTime}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <Tag size={11} />
              {template.tags?.[0] || "Personal"}
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {onQuickView && (
              <button
                type="button"
                onClick={() => onQuickView(template)}
                aria-label={`Preview the ${template.name} template`}
                // Visible by default, and only *hidden* on fine pointers. The
                // old card faded this in on hover, which on a phone meant an
                // invisible-but-tappable button sitting on top of the card.
                className="relative z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white text-foreground/70 shadow-md ring-1 ring-black/5 transition-[opacity,transform,color] duration-400 ease-out-soft hover:text-foreground focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-pink-400 active:scale-[0.94] active:duration-150 pointer-fine:translate-x-2 pointer-fine:opacity-0 pointer-fine:group-hover:translate-x-0 pointer-fine:group-hover:opacity-100 pointer-fine:group-focus-within:translate-x-0 pointer-fine:group-focus-within:opacity-100"
              >
                <Eye size={18} />
              </button>
            )}

            <span
              aria-hidden
              className="flex h-11 w-11 items-center justify-center rounded-full bg-linear-to-br from-primary to-pink-600 text-white shadow-md transition-transform duration-400 ease-out-soft group-active:scale-[0.94] group-active:duration-150 pointer-fine:group-hover:scale-110"
            >
              <ArrowRight size={19} />
            </span>
          </div>
        </div>

        {/*
          The stretched link.

          The card used to be a `<Link>` wrapping the whole thing with a
          `<button>` nested inside it — invalid HTML, and browsers disagree on
          which of the two a click activates. An overlay anchor keeps the whole
          card clickable while leaving the quick-view button a plain sibling at
          a higher z-index.
        */}
        <Link
          href={`/templates/${template.id}`}
          className="absolute inset-0 z-10 rounded-3xl outline-none focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:ring-offset-2"
        >
          <span className="sr-only">Customize the {template.name} template</span>
        </Link>
      </div>
    </motion.article>
  );
}
