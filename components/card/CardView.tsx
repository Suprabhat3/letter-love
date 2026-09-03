"use client";

import { useMemo, useState } from "react";
import type { Phase } from "@/lib/theme";
import { resolveTheme } from "@/lib/theme";
import { readCardContent, readCardStyle } from "@/lib/cardStyle";
import type { SharedCard } from "@/lib/types";
import CardStage from "./CardStage";
import CardRenderer from "./CardRenderer";

/**
 * A whole shared card, from a stored row.
 *
 * Owns the interaction phase because both the decor (in the stage) and the
 * blocks (in the renderer) switch on it — that is what makes "rain until
 * you're forgiven, then hearts" a two-line theme config.
 */
export default function CardView({ card }: { card: SharedCard }) {
  const content = useMemo(() => readCardContent(card.data), [card.data]);
  const style = useMemo(() => readCardStyle(card.data), [card.data]);
  const theme = useMemo(
    () => resolveTheme(card.template_id, style),
    [card.template_id, style],
  );

  const [phase, setPhase] = useState<Phase>(
    theme.interaction.kind === "none" ? "post" : "pre",
  );

  return (
    <CardStage theme={theme} seed={card.id} phase={phase}>
      <CardRenderer
        theme={theme}
        content={content}
        font={style.font}
        seed={card.id}
        phase={phase}
        onPhaseChange={setPhase}
      />
      <p className="text-center text-muted-foreground/50 text-xs italic font-serif">
        Made with LetterLove 💕
      </p>
    </CardStage>
  );
}
