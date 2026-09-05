"use client";

import { useEffect, useRef, useState } from "react";

/** How much taller than the scrollport the letter must be to earn a cue. */
const OVERFLOW_THRESHOLD_PX = 96;

/** Scrolled at least this far and the reader clearly knows; the cue retires. */
const DISMISS_AFTER_PX = 40;

/**
 * The nearest ancestor that actually scrolls.
 *
 * This component renders on a share page, where that is the document, and
 * inside the gallery's preview modal, where it is the modal's own column.
 * Reading `window.scrollY` unconditionally would leave the cue stuck on
 * forever in the modal — the window there never moves.
 */
function scrollParent(node: HTMLElement): HTMLElement {
  for (let el = node.parentElement; el; el = el.parentElement) {
    const { overflowY } = getComputedStyle(el);
    if (
      (overflowY === "auto" || overflowY === "scroll") &&
      el.scrollHeight > el.clientHeight
    ) {
      return el;
    }
  }
  return document.scrollingElement instanceof HTMLElement
    ? document.scrollingElement
    : document.documentElement;
}

/**
 * A quiet "there's more" marker at the bottom of a letter that runs past the
 * fold.
 *
 * The letters people actually write are two or three screens long, and with
 * the card's own reveal finishing inside the first screen there was nothing
 * telling the reader the message continued — several of them end on a
 * mid-sentence line break, which reads as the whole letter.
 *
 * It measures rather than guesses, so a short card and a sealed envelope never
 * see it, and it appears on its own once the envelope opens and the body
 * pushes the page past the fold.
 */
export default function ScrollCue() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // The stage itself: the box whose height grows when the envelope opens and
    // the letter unfolds, which is the moment the cue becomes relevant.
    const stage = node.parentElement;
    if (!stage) return;

    const container = scrollParent(node);
    // `dismissed` is a closure latch rather than state: once the reader has
    // scrolled, the cue must not come back when the paced reveal grows the
    // page again a second later.
    let dismissed = false;

    const measure = () => {
      if (dismissed) return;
      setVisible(
        stage.scrollHeight > container.clientHeight + OVERFLOW_THRESHOLD_PX,
      );
    };

    const onScroll = () => {
      const scrolled =
        container === document.scrollingElement
          ? window.scrollY
          : container.scrollTop;
      if (scrolled < DISMISS_AFTER_PX) return;
      dismissed = true;
      setVisible(false);
    };

    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    measure();

    const target = container === document.scrollingElement ? window : container;
    target.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      observer.disconnect();
      target.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    // Same sticky-inside-absolute shape the backdrop uses, and for the same
    // reason: `fixed` would break out of the preview modal.
    <div
      aria-hidden
      ref={ref}
      className="pointer-events-none absolute inset-0 z-20"
    >
      <div className="sticky top-0 flex h-svh items-end justify-center pb-6">
        <span
          className={`ll-scroll-cue rounded-full border border-black/5 bg-white/70 px-3.5 py-2 text-[11px] font-semibold tracking-widest text-foreground/45 uppercase shadow-sm backdrop-blur-md transition-opacity duration-500 ${
            visible ? "opacity-100" : "opacity-0"
          }`}
        >
          Scroll
        </span>
      </div>
    </div>
  );
}
