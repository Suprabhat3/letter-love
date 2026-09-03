"use client";

import type { ReactNode } from "react";
import type { Phase, Theme } from "@/lib/theme";
import AmbientLayer from "./AmbientLayer";
import DecorLayer from "./DecorLayer";

/**
 * The full-viewport backdrop a card sits on: ambient wash, decor, and the
 * centring frame.
 *
 * `100svh` rather than `100vh` — on iOS the URL bar collapses on scroll and
 * `100vh` produces a visible jump, which is especially bad mid-animation once
 * the Phase 2 envelope lands.
 */
export default function CardStage({
  theme,
  seed,
  phase,
  children,
}: {
  theme: Theme;
  seed: string;
  phase: Phase;
  children: ReactNode;
}) {
  return (
    <main className="min-h-[100svh] relative flex items-center justify-center overflow-hidden bg-background p-4 md:p-6">
      <AmbientLayer ambient={theme.ambient} palette={theme.palette} />
      <DecorLayer
        decor={theme.decor}
        palette={theme.palette}
        seed={seed}
        phase={phase}
      />
      <div className="z-10 w-full relative flex flex-col items-center gap-8">
        {children}
      </div>
    </main>
  );
}
