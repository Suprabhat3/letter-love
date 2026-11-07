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
import SceneGate from "./scenes/SceneGate";
import { scenesForTemplate } from "@/lib/scenes";
import { getFontClasses } from "@/lib/fonts";
import ReactionBar from "./ReactionBar";
import ReplyCta from "./ReplyCta";
import StoryShareButton from "./StoryShareButton";

const NIGHT_BACKDROP =
  "radial-gradient(120% 70% at 50% 100%, #3a160c 0%, transparent 60%), linear-gradient(180deg, #05030c 0%, #120a22 55%, #1d0c14 100%)";

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

  // A full-screen opening scene, when the card was saved with one and its
  // template still offers it. Cards from before scenes have no `scene` and
  // keep their envelope.
  const scene = scenesForTemplate(card.templateId).some((s) => s.id === style.scene)
    ? style.scene
    : undefined;

  // A card with no envelope is revealed from the start — which is every card
  // written before the envelope shipped. See readCardStyle: a link someone has
  // already sent must not change behaviour underneath them.
  const sealed = Boolean(scene) || theme.envelope.enabled;
  const [revealed, setRevealed] = useState(!sealed);
  // A scene card's letter writes itself out; nothing below it should start
  // asking for reactions until the reader has reached the signature.
  const [read, setRead] = useState(!scene);

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

  // The theme's ambient blobs are tuned for its light wash; over the night
  // backdrop at full strength they mix into a muddy olive. Dimmed, they read
  // as warm glow on the horizon instead.
  const stageTheme = useMemo(
    () =>
      scene
        ? {
            ...theme,
            ambient: {
              ...theme.ambient,
              blobs: theme.ambient.blobs.map((b) => ({ ...b, opacity: b.opacity * 0.4 })),
            },
          }
        : theme,
    [scene, theme],
  );

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
    <CardStage
      theme={stageTheme}
      seed={card.id}
      phase={phase}
      // The scene ends on a night sky; the page it hands over to should too.
      backdrop={scene ? NIGHT_BACKDROP : undefined}
    >
      {scene ? (
        <SceneGate
          scene={scene}
          cardId={card.id}
          to={content.recipientName?.trim() ?? ""}
          from={content.senderName?.trim() ?? ""}
          message={content.message?.trim() || "May this Diwali fill your home with light."}
          wish={content.wish}
          bodyFont={getFontClasses(style.font ?? theme.fontDefaults.body).body}
          onOpen={() => setRevealed(true)}
          onRead={() => setRead(true)}
        />
      ) : sealed ? (
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
      {revealed && read && (
        <div
          className={`relative flex w-full max-w-md flex-col items-center gap-6 ${
            // On the night backdrop the loop sits on a dark lacquered panel
            // with the letter's double gold rule, so it reads as part of the
            // same set rather than a light-theme widget dropped on top.
            scene
              ? "ll-rise-in rounded-[22px] border border-amber-300/25 bg-[#1c0f08]/75 px-5 py-7 shadow-[0_30px_70px_-25px_rgba(0,0,0,0.8),0_0_90px_-30px_rgba(251,191,36,0.3)] backdrop-blur-md"
              : ""
          }`}
          style={scene ? delay(400) : undefined}
        >
          {scene && (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-1.5 rounded-[17px] border border-amber-300/10"
            />
          )}

          {scene && (
            <p
              className="ll-rise-in font-serif text-lg italic text-amber-100/85"
              style={delay(520)}
            >
              Send a little light back
            </p>
          )}

          <div className="ll-rise-in w-full" style={delay(600)}>
            <ReactionBar
              key={sync}
              cardId={card.id}
              initialCounts={counts}
              mine={mine}
              night={Boolean(scene)}
            />
          </div>

          {scene ? (
            <svg
              aria-hidden
              viewBox="0 0 160 12"
              className="ll-rise-in h-3 w-32"
              style={delay(760)}
              fill="none"
            >
              <path d="M2 6h60M98 6h60" stroke="#e0b44c" strokeOpacity=".45" strokeWidth="1" />
              <path d="M80 1l5 5-5 5-5-5z" fill="#e0b44c" fillOpacity=".8" />
              <circle cx="68" cy="6" r="1.6" fill="#e0b44c" fillOpacity=".7" />
              <circle cx="92" cy="6" r="1.6" fill="#e0b44c" fillOpacity=".7" />
            </svg>
          ) : (
            <div
              aria-hidden
              className="ll-rise-in h-px w-24 bg-foreground/10"
              style={delay(760)}
            />
          )}

          <div className="ll-rise-in" style={delay(900)}>
            <ReplyCta
              cardId={card.id}
              templateId={card.templateId}
              senderName={content.senderName}
              night={Boolean(scene)}
            />
          </div>

          <div className="ll-rise-in" style={delay(1060)}>
            <StoryShareButton cardId={card.id} night={Boolean(scene)} />
          </div>
        </div>
      )}

      <p
        className={`text-center text-xs italic font-serif ${
          scene ? "text-amber-100/50" : "text-muted-foreground/50"
        }`}
      >
        Made with LetterLove 💕
      </p>
    </CardStage>
  );
}
