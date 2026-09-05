"use client";

import type { ReactNode } from "react";
import type { Phase, Theme } from "@/lib/theme";
import AmbientLayer from "./AmbientLayer";
import DecorLayer from "./DecorLayer";

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
  const layers = (
    <>
      <AmbientLayer ambient={theme.ambient} palette={theme.palette} />
      <DecorLayer
        decor={theme.decor}
        palette={theme.palette}
        seed={seed}
        phase={phase}
      />
    </>
  );

  if (variant === "panel") {
    return (
      <div className="relative flex min-h-105 items-center justify-center overflow-hidden rounded-3xl bg-background p-5">
        {layers}
        <div className="relative z-10 flex w-full flex-col items-center gap-6">
          {children}
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-svh relative flex items-center justify-center overflow-hidden bg-background p-4 md:p-6">
      {layers}
      <div className="z-10 w-full relative flex flex-col items-center gap-8">
        {children}
      </div>
    </main>
  );
}
