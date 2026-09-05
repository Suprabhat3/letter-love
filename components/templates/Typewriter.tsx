"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";

export interface TypewriterProps {
  text: string;
  /** Typing runs only while this is true. */
  active: boolean;
  /** Milliseconds per character. */
  speedMs?: number;
  /**
   * Lead-in before the first character.
   *
   * A pointer crossing the grid on its way somewhere else shouldn't leave a
   * trail of half-typed quotes behind it — the delay means a card has to be
   * dwelled on, however briefly, before it starts performing.
   */
  startDelayMs?: number;
  /** Matches the caller's fade-out, so the text isn't cleared mid-fade. */
  resetDelayMs?: number;
  className?: string;
}

/**
 * The template quote, typed out.
 *
 * Its own component for one reason: the previous version kept `typedText` in
 * `TemplateCard`, so every single character re-rendered the whole card — the
 * emoji, the badges, the footer, the `motion.article` wrapper — forty-odd times
 * per hover. Isolated here, a keystroke re-renders one paragraph.
 *
 * Driven off `requestAnimationFrame` against the clock rather than a chain of
 * `setTimeout`s. A timeout chain accumulates drift and keeps firing while the
 * tab is backgrounded; this reads elapsed time, so the cadence is even and it
 * pauses with the browser.
 */
export default function Typewriter({
  text,
  active,
  speedMs = 22,
  startDelayMs = 130,
  resetDelayMs = 320,
  className,
}: TypewriterProps) {
  const reduceMotion = useReducedMotion();
  const [shown, setShown] = useState(0);

  useEffect(() => {
    // A paced reveal *is* motion, so reduced motion gets the whole quote at
    // once — derived below during render rather than pushed through state,
    // which would be a setState cascading straight out of an effect body.
    if (!active || reduceMotion) return;

    let frame = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start - startDelayMs;
      const next =
        elapsed <= 0 ? 0 : Math.min(text.length, Math.floor(elapsed / speedMs));
      // Returning the same value lets React bail out of the render entirely,
      // so this costs one render per character rather than one per frame.
      setShown((prev) => (prev === next ? prev : next));
      if (next < text.length) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, text, speedMs, startDelayMs, reduceMotion]);

  // Clearing happens after the caller's fade has finished, never on the frame
  // the pointer leaves — otherwise the quote blinks out and *then* fades,
  // which is the single ugliest moment in the old version.
  useEffect(() => {
    if (active) return;
    const timer = setTimeout(() => setShown(0), resetDelayMs);
    return () => clearTimeout(timer);
  }, [active, resetDelayMs]);

  const visible = reduceMotion && active ? text.length : shown;
  const typing = visible > 0 && visible < text.length;

  return (
    <p className={`relative ${className ?? ""}`}>
      {/*
        The full quote, rendered invisibly, reserving the space.

        Without it the paragraph grows line by line as it types and the words
        already on screen re-wrap underneath the reader. With it, the line
        breaks are final from the first frame and only the ink arrives.
      */}
      <span className="invisible" aria-hidden>
        {text}
      </span>

      <span className="absolute inset-0">
        {text.slice(0, visible)}
        <span
          aria-hidden
          // The caret holds steady while characters are landing and blinks
          // once it is waiting — which is what a real one does, and the detail
          // that makes this read as typing rather than as text appearing.
          className={`ml-px inline-block ${typing ? "" : "ll-caret"}`}
        >
          |
        </span>
      </span>
    </p>
  );
}
