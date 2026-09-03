"use client";

import { useMemo, useState } from "react";
import { motion } from "motion/react";
import type { BlockSpec, Phase, Theme } from "@/lib/theme";
import { getFontClasses } from "@/lib/fonts";
import type { FontId } from "@/lib/fonts";
import BlockRenderer, { type CardContent } from "./BlockRenderer";
import Interaction from "./interactions";
import { surfaceStyles } from "./surface";

const INTRO = {
  none: { initial: false as const, animate: {} },
  fade: { initial: { opacity: 0 }, animate: { opacity: 1 } },
  rise: { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 } },
  "spring-pop": {
    initial: { opacity: 0, scale: 0.9, y: 30 },
    animate: { opacity: 1, scale: 1, y: 0 },
  },
};

const LAYOUTS: Record<Theme["layout"], { width: string; align: string }> = {
  "centered-card": { width: "max-w-lg", align: "items-center text-center" },
  "letter-sheet": { width: "max-w-xl", align: "items-stretch text-left" },
  polaroid: { width: "max-w-md", align: "items-center text-center" },
  pages: { width: "max-w-lg", align: "items-center text-center" },
  list: { width: "max-w-lg", align: "items-stretch text-left" },
};

function visibleInPhase(block: BlockSpec, phase: Phase): boolean {
  const blockPhase = block.phase ?? "always";
  return blockPhase === "always" || blockPhase === phase;
}

export interface CardRendererProps {
  theme: Theme;
  content: CardContent;
  font?: FontId;
  /** Seeds decor and interaction jitter; use the card id. */
  seed: string;
  /** Turns on the paced body reveal. Phase 2 sets this when the envelope opens. */
  paced?: boolean;
  /** Disables the interaction, for the editor preview. */
  interactive?: boolean;
  /** Lifted so DecorLayer in the stage can switch with the card. */
  phase?: Phase;
  onPhaseChange?: (phase: Phase) => void;
}

/**
 * The card panel: surface, then blocks, with the interaction widget spliced in
 * where the pre blocks end.
 */
export default function CardRenderer({
  theme,
  content,
  font,
  seed,
  paced = false,
  interactive = true,
  phase: phaseProp,
  onPhaseChange,
}: CardRendererProps) {
  const hasInteraction = theme.interaction.kind !== "none" && interactive;
  const [ownPhase, setOwnPhase] = useState<Phase>(
    hasInteraction ? "pre" : "post",
  );
  const phase = phaseProp ?? ownPhase;

  const setPhase = (next: Phase) => {
    setOwnPhase(next);
    onPhaseChange?.(next);
  };

  // A card-level font choice overrides both of the theme's defaults; without
  // one, header and body can differ per theme.
  const resolvedFonts = {
    header: getFontClasses(font ?? theme.fontDefaults.header).header,
    body: getFontClasses(font ?? theme.fontDefaults.body).body,
  };

  const surface = useMemo(
    () => surfaceStyles(theme.surface, theme.frame, theme.palette),
    [theme.surface, theme.frame, theme.palette],
  );

  // The interaction sits where the "post" content begins; if a theme has no
  // post blocks it goes last.
  const firstPostIndex = theme.blocks.findIndex((b) => b.phase === "post");
  const splitAt = firstPostIndex === -1 ? theme.blocks.length : firstPostIndex;

  const intro = INTRO[theme.motion.intro];
  const layout = LAYOUTS[theme.layout];
  const replayable =
    theme.interaction.kind !== "none" && theme.interaction.replayable;

  const renderBlocks = (from: number, to: number) =>
    theme.blocks.slice(from, to).map((block, i) => {
      if (!visibleInPhase(block, phase)) return null;
      return (
        <BlockRenderer
          key={`${from + i}-${block.type}`}
          block={block}
          content={content}
          theme={theme}
          fonts={resolvedFonts}
          layout={theme.layout}
          paced={paced}
          onReplay={replayable ? () => setPhase("pre") : undefined}
        />
      );
    });

  return (
    <motion.article
      initial={intro.initial}
      animate={intro.animate}
      transition={{
        type: theme.motion.intro === "spring-pop" ? "spring" : "tween",
        damping: 20,
        stiffness: 100,
        duration: 0.5,
        delay: theme.motion.introDelayMs / 1000,
      }}
      className={`relative w-full overflow-hidden p-8 md:p-12 ${layout.width} ${surface.className}`}
      style={{ ...surface.style, color: theme.palette.ink }}
    >
      {surface.shine && (
        <div
          aria-hidden
          className="absolute inset-0 bg-linear-to-br from-white/60 via-transparent to-transparent pointer-events-none"
          style={{ borderRadius: "inherit" }}
        />
      )}

      <div
        className={`relative z-10 flex flex-col gap-5 w-full ${layout.align}`}
      >
        {renderBlocks(0, splitAt)}

        {hasInteraction && phase === "pre" && (
          <Interaction
            spec={theme.interaction}
            palette={theme.palette}
            seed={seed}
            onComplete={() => setPhase("post")}
          />
        )}

        {renderBlocks(splitAt, theme.blocks.length)}
      </div>
    </motion.article>
  );
}
