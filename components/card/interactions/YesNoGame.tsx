"use client";

import { useMemo, useState } from "react";
import { motion } from "motion/react";
import type { InteractionSpec, ThemePalette } from "@/lib/theme";
import { seededSeries } from "@/lib/rand";
import { track } from "@/lib/analytics";

type Spec = Extract<InteractionSpec, { kind: "yes-no-game" }>;

/**
 * The growing-YES / stubborn-NO game.
 *
 * SorryCard and ValentineCard each carried their own copy of this with their
 * own NO_PHRASES array — the same ~170 lines twice. The only real differences
 * were the phrases and the button copy, which are now theme config.
 */
export default function YesNoGame({
  spec,
  palette,
  seed,
  onComplete,
}: {
  spec: Spec;
  palette: ThemePalette;
  seed: string;
  onComplete: () => void;
}) {
  const [noCount, setNoCount] = useState(0);

  // Seeded so the NO button dodges the same way on every visit rather than
  // re-randomising mid-interaction.
  const jitter = useMemo(
    () => seededSeries(`${seed}:evade`, Math.max(spec.noPhrases.length, 1), 2),
    [seed, spec.noPhrases.length],
  );

  const yesSize = Math.min(noCount * spec.growthPx + 16, spec.maxYesPx);
  const noText = spec.noPhrases[noCount % spec.noPhrases.length];
  const nudge = jitter[noCount % jitter.length];

  return (
    <div className="flex flex-wrap items-center justify-center gap-4 w-full min-h-25">
      {/* The growth is font-size and padding, not a transform, and that is
          deliberate: the YES button getting physically bigger is what shoves
          the NO button around, and a scale transform would leave the layout —
          and the joke — exactly where it was. Both are named explicitly rather
          than left to `transition-all`, which was also animating the box-shadow
          and the background on every refusal.

          Hover and press come from `.btn-primary`, which already gates hover
          behind a fine pointer. The old `whileHover` did not, so on a phone the
          YES button stayed stuck at 1.05 after the first tap. */}
      <button
        type="button"
        className="btn-primary rounded-xl font-bold shadow-xl"
        style={{
          fontSize: yesSize,
          padding: `${Math.min(yesSize / 2, 30)}px ${Math.min(yesSize, 60)}px`,
          boxShadow: `0 10px 30px ${palette.primary}33`,
          transition:
            "font-size 220ms var(--ease-out-strong), padding 220ms var(--ease-out-strong), transform 160ms var(--ease-out-strong)",
        }}
        onClick={() => {
          track("reaction_added", { interaction: "yes-no-game", refusals: noCount });
          onComplete();
        }}
      >
        {spec.yesLabel}
      </button>

      <motion.button
        type="button"
        className="px-6 py-3 rounded-xl bg-gray-100 text-gray-500 font-medium hover:bg-gray-200 transition-colors text-sm whitespace-nowrap"
        onClick={() => setNoCount((n) => n + 1)}
        // A dodge is a playful, interruptible gesture — the pointer can chase
        // it and reverse mid-flight — so it is the one place here that earns a
        // spring. Full transform strings, and a little bounce, because this is
        // the interaction that is meant to feel alive.
        whileHover={
          spec.evadeNo
            ? {
                transform: `translate3d(${(nudge[0] - 0.5) * 60}px, ${
                  (nudge[1] - 0.5) * 30
                }px, 0)`,
              }
            : { transform: "scale(0.95) rotate(-2deg)" }
        }
        whileTap={{ transform: "scale(0.92)" }}
        transition={{ type: "spring", duration: 0.5, bounce: 0.25 }}
      >
        {noText}
      </motion.button>
    </div>
  );
}
