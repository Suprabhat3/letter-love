"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import type { Phase } from "@/lib/theme";
import { resolveTheme } from "@/lib/theme";
import type { PublicCard } from "@/lib/types";
import type { ReactionEmoji } from "@/lib/reactions";
import { reportOpen } from "@/lib/engagement-client";
import CardStage from "./CardStage";
import CardRenderer from "./CardRenderer";
import EnvelopeGate from "./EnvelopeGate";
import ReactionBar from "./ReactionBar";
import ReplyCta from "./ReplyCta";
import StoryShareButton from "./StoryShareButton";

/** Feeds `.ll-rise-in`'s per-node delay without a style object per call site. */
const delay = (ms: number) => ({ "--ll-delay": `${ms}ms` }) as CSSProperties;

/**
 * A whole shared card, from a stored row.
 *
 * Owns the interaction phase because both the decor (in the stage) and the
 * blocks (in the renderer) switch on it — that is what makes "rain until
 * you're forgiven, then hearts" a two-line theme config.
 *
 * It also owns `revealed`, which the envelope flips: the paced body reveal is
 * the second half of the unwrap, and starting it while the letter is still
 * sealed would waste it behind an opacity-0 layer. Since Phase 4 that same
 * flag is what releases the reaction bar, the reply button, and the view
 * beacon — nothing below the letter exists until the letter does.
 */
export default function CardView({ card }: { card: PublicCard }) {
  const { content, style } = card;
  const theme = useMemo(
    () => resolveTheme(card.templateId, style),
    [card.templateId, style],
  );

  const [phase, setPhase] = useState<Phase>(
    theme.interaction.kind === "none" ? "post" : "pre",
  );

  // A card with no envelope is revealed from the start — which is every card
  // written before the envelope shipped. See readCardStyle: a link someone has
  // already sent must not change behaviour underneath them.
  const sealed = theme.envelope.enabled;
  const [revealed, setRevealed] = useState(!sealed);

  const [counts, setCounts] = useState(card.reactionCounts);
  const [mine, setMine] = useState<readonly ReactionEmoji[]>([]);
  // Bumped when the beacon answers. The bar takes its counts as *initial*
  // state so a tap is instant, so the way to hand it the server's truth is to
  // key it — resetting from an effect inside the bar would fight the
  // optimistic update it exists to provide.
  const [sync, setSync] = useState(0);

  /**
   * Count the open exactly once, and only after a human has actually seen the
   * letter.
   *
   * The beacon lives here rather than in a `useEffect` on mount because every
   * major messenger fetches the share URL to build its link preview. Firing on
   * mount would make each card read as opened the instant the sender pasted
   * it — which turns the whole receipt feature into a lie the sender can see
   * through immediately.
   */
  // A ref, not state: it is a latch that must never be re-entered, and nothing
  // renders differently because of it. As state it would also be a synchronous
  // setState inside an effect, which React 19 rightly flags.
  const reported = useRef(false);
  const report = useCallback(() => {
    if (reported.current) return;
    reported.current = true;
    reportOpen(card.id).then((result) => {
      if (!result) return;
      setCounts(result.reactionCounts);
      setMine(result.mine);
      setSync((n) => n + 1);
    });
  }, [card.id]);

  // An unsealed card has no unwrap to wait for, so its "open" is the render.
  useEffect(() => {
    if (revealed) report();
  }, [revealed, report]);

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

      {/* Everything past this point is the loop, and none of it appears over a
          sealed envelope — a reply button on an unopened letter is noise.

          These three used to arrive together in one 400ms fade, which read as a
          single undifferentiated blob of controls. They are three different
          asks — a gesture, an invitation, a utility — so they arrive in that
          order, unhurriedly, and are spaced and weighted to match. The base
          delay lets the letter land and be looked at first: nothing should be
          asking the reader for anything while they are still taking it in.

          A CSS stagger, not a motion chain: this mounts while the paced reveal
          is still ticking through the body text on the main thread. */}
      {revealed && (
        <div className="flex w-full max-w-md flex-col items-center gap-6">
          <div className="ll-rise-in w-full" style={delay(600)}>
            <ReactionBar
              key={sync}
              cardId={card.id}
              initialCounts={counts}
              mine={mine}
            />
          </div>

          <div
            aria-hidden
            className="ll-rise-in h-px w-24 bg-foreground/10"
            style={delay(760)}
          />

          <div className="ll-rise-in" style={delay(900)}>
            <ReplyCta
              cardId={card.id}
              templateId={card.templateId}
              senderName={content.senderName}
            />
          </div>

          <div className="ll-rise-in" style={delay(1060)}>
            <StoryShareButton cardId={card.id} />
          </div>
        </div>
      )}

      <p className="text-center text-muted-foreground/50 text-xs italic font-serif">
        Made with LetterLove 💕
      </p>
    </CardStage>
  );
}
