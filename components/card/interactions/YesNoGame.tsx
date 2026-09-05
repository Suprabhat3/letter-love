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
    <div className="flex flex-wrap items-center justify-center gap-4 w-full min-h-[100px]">
      <motion.button
        type="button"
        className="btn-primary rounded-xl font-bold shadow-xl transition-all"
        style={{
          fontSize: yesSize,
          padding: `${Math.min(yesSize / 2, 30)}px ${Math.min(yesSize, 60)}px`,
          boxShadow: `0 10px 30px ${palette.primary}33`,
        }}
        onClick={() => {
          track("reaction_added", { interaction: "yes-no-game", refusals: noCount });
          onComplete();
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {spec.yesLabel}
      </motion.button>

      <motion.button
        type="button"
        className="px-6 py-3 rounded-xl bg-gray-100 text-gray-500 font-medium hover:bg-gray-200 transition-colors text-sm whitespace-nowrap"
        onClick={() => setNoCount((n) => n + 1)}
        whileHover={
          spec.evadeNo
            ? { x: (nudge[0] - 0.5) * 60, y: (nudge[1] - 0.5) * 30 }
            : { scale: 0.95, rotate: -2 }
        }
        whileTap={{ scale: 0.9 }}
      >
        {noText}
      </motion.button>
    </div>
  );
}
