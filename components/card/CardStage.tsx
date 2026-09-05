"use client";

import type { ReactNode } from "react";
import type { Phase, Theme } from "@/lib/theme";
import AmbientLayer from "./AmbientLayer";
import DecorLayer from "./DecorLayer";
import ScrollCue from "./ScrollCue";

/**
 * The backdrop a card sits on: ambient wash, decor, and the centring frame.
 *
 * `100svh` rather than `100vh` — on iOS the URL bar collapses on scroll and
 * `100vh` produces a visible jump, which is especially bad mid-animation
 * during the envelope reveal.
 *
 * The "panel" variant is the same stack inside a bounded box, which is what
 * makes the editor preview truthful: it is the real renderer, not a
 * hand-rolled mini-card that drifts from what actually gets sent.
 */
export default function CardStage({
  theme,
  seed,
  phase,
  variant = "page",
  children,
}: {
  theme: Theme;
  seed: string;
  phase: Phase;
  variant?: "page" | "panel";
  children: ReactNode;
}) {
  /**
   * The backdrop, pinned to whatever is currently on screen.
   *
   * A share page for a real letter is three or four screens tall, and the
   * decor layer used to be one `absolute inset-0` box spanning all of it. The
   * float animation traverses a single layer-height, so every glyph lived in
   * the top screen and the entire scroll below the first fold was a static
   * gradient — which is exactly what the letters looked like.
   *
   * `sticky` rather than `fixed` because this same stage renders inside the
   * gallery's preview modal, where a fixed layer would escape the modal and
   * paint over the whole app. Sticky pins to the nearest scroll container,
   * which is the window on a share page and the modal's own scroller in the
   * gallery — correct in both without either knowing about the other.
   *
   * The outer box deliberately carries no `overflow-hidden`: that would make
   * it the sticky child's scroll container, and a container that never scrolls
   * pins the child permanently to the top. Clipping happens on the sticky box
   * itself instead.
   */
  const layers = (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
      <div
        className={`sticky top-0 w-full overflow-hidden ${
          variant === "panel" ? "h-full" : "h-svh"
        }`}
      >
        <AmbientLayer ambient={theme.ambient} palette={theme.palette} />
        <DecorLayer
          decor={theme.decor}
          palette={theme.palette}
          seed={seed}
          phase={phase}
        />
      </div>
    </div>
  );

  // The theme's own OG wash — a soft diagonal gradient tuned per palette — so
  // the stage reads as "this card's colour" instead of the app's flat neutral
  // `bg-background` peeking out from behind the ambient blobs.
  const backdrop = { backgroundImage: theme.og.bgGradient };

  if (variant === "panel") {
    return (
      <div
        className="relative flex min-h-105 items-center justify-center overflow-hidden rounded-3xl bg-background p-5"
        style={backdrop}
      >
        {layers}
        <div className="relative z-10 flex w-full flex-col items-center gap-6">
          {children}
        </div>
      </div>
    );
  }

  return (
    // No `overflow-hidden` here: it would trap the sticky backdrop (see above).
    // The generous block padding is the fix for a letter opening flush against
    // the top edge of the screen — the first thing the recipient saw was the
    // eyebrow line jammed under the notch, which reads as a broken page rather
    // than as something someone wrote them.
    <main
      className="relative flex min-h-svh items-center justify-center bg-background px-4 py-14 md:px-6 md:py-20"
      style={backdrop}
    >
      {layers}
      <div className="relative z-10 flex w-full flex-col items-center gap-8">
        {children}
      </div>
      <ScrollCue />
    </main>
  );
}
