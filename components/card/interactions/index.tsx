"use client";

import type { InteractionSpec, ThemePalette } from "@/lib/theme";
import YesNoGame from "./YesNoGame";
import BlowCandles from "./BlowCandles";

export interface InteractionProps {
  spec: InteractionSpec;
  palette: ThemePalette;
  seed: string;
  onComplete: () => void;
}

/**
 * Dispatches to the widget for a theme's interaction.
 *
 * This is a lookup that renders whole components, never a chain of early
 * returns that skips past hooks. Each widget always mounts and always runs its
 * own hooks, so the rules-of-hooks violation that used to live in
 * ShareCardView cannot reappear here by construction.
 */
export default function Interaction({
  spec,
  palette,
  seed,
  onComplete,
}: InteractionProps) {
  switch (spec.kind) {
    case "yes-no-game":
      return (
        <YesNoGame
          spec={spec}
          palette={palette}
          seed={seed}
          onComplete={onComplete}
        />
      );
    case "blow-candles":
      return <BlowCandles spec={spec} onComplete={onComplete} />;
    case "none":
      return null;
  }
}
