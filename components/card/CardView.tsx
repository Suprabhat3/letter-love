"use client";

import { useMemo, useState } from "react";
import type { Phase } from "@/lib/theme";
import { resolveTheme } from "@/lib/theme";
import { readCardContent, readCardStyle } from "@/lib/cardStyle";
import type { SharedCard } from "@/lib/types";
import CardStage from "./CardStage";
import CardRenderer from "./CardRenderer";
import EnvelopeGate from "./EnvelopeGate";

/**
 * A whole shared card, from a stored row.
 *
 * Owns the interaction phase because both the decor (in the stage) and the
 * blocks (in the renderer) switch on it — that is what makes "rain until
 * you're forgiven, then hearts" a two-line theme config.
 *
 * It also owns `revealed`, which the envelope flips: the paced body reveal is
 * the second half of the unwrap, and starting it while the letter is still
 * sealed would waste it behind an opacity-0 layer.
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

  // A card with no envelope is revealed from the start — which is every card
  // written before the envelope shipped. See readCardStyle: a link someone has
  // already sent must not change behaviour underneath them.
  const sealed = theme.envelope.enabled;
  const [revealed, setRevealed] = useState(!sealed);

  const letter = (
    <CardRenderer
      theme={theme}
      content={content}
      font={style.font}
      seed={card.id}
      paced={revealed}
      phase={phase}
      onPhaseChange={setPhase}
    />
  );

  return (
    <CardStage theme={theme} seed={card.id} phase={phase}>
      {sealed ? (
        <EnvelopeGate
          spec={theme.envelope}
          palette={theme.palette}
          cardId={card.id}
          senderName={content.senderName}
          onOpen={() => setRevealed(true)}
        >
          {letter}
        </EnvelopeGate>
      ) : (
        letter
      )}
      <p className="text-center text-muted-foreground/50 text-xs italic font-serif">
        Made with LetterLove 💕
      </p>
    </CardStage>
  );
}
