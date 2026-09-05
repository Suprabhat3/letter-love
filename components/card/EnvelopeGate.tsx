"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
} from "react";
import { useAnimate, useReducedMotion } from "motion/react";
import type { EnvelopeSpec, ThemePalette } from "@/lib/theme";
import { track } from "@/lib/analytics";
import Envelope from "./Envelope";

type Stage = "sealed" | "opening" | "open";

const openedKey = (cardId: string) => `ll.opened.${cardId}`;

/**
 * Whether this browser has opened this card before.
 *
 * Read through `useSyncExternalStore` rather than an effect: localStorage is an
 * external store, and this is the documented way to read one without either a
 * hydration mismatch (a lazy `useState` touching `window` during render) or the
 * cascading render of setting state from an effect body. The server snapshot is
 * always `false`, so SSR emits a sealed envelope for everyone.
 *
 * This is a UX convenience only. The authoritative open count is the
 * server-side counter in Phase 4 — localStorage is trivially cleared.
 */
const subscribeNever = () => () => {};

function makeSnapshot(cardId: string) {
  return () => {
    try {
      return localStorage.getItem(openedKey(cardId)) !== null;
    } catch {
      return false;
    }
  };
}

// The sanctioned curves, as literals — `useAnimate` takes values, not CSS vars.
// Kept in sync with the `--ease-*-strong` tokens in globals.css.
const EASE_OUT = [0.23, 1, 0.32, 1] as const;
const EASE_IN_OUT = [0.77, 0, 0.175, 1] as const;
/** easeOutExpo (easings.net) — the long, settling curve. */
const EASE_OUT_SOFT = [0.16, 1, 0.3, 1] as const;

/**
 * When the letter starts fading in, in seconds along the open timeline.
 *
 * Deliberately *before* the envelope has finished leaving. The old sequence ran
 * four `await`ed steps end to end and only then swapped in the letter, so what
 * you actually saw was one object disappearing and an unrelated one appearing
 * in its place. Overlapping them is what makes the letter read as having come
 * out of the envelope rather than out of nowhere.
 */
const REVEAL_AT_S = 0.86;

export interface EnvelopeGateProps {
  spec: EnvelopeSpec;
  palette: ThemePalette;
  cardId: string;
  senderName?: string;
  /** Fires once the letter is visible; drives the paced reveal. */
  onOpen?: () => void;
  children: ReactNode;
}

export default function EnvelopeGate({
  spec,
  palette,
  cardId,
  senderName,
  onOpen,
  children,
}: EnvelopeGateProps) {
  const reduceMotion = useReducedMotion();
  const [scope, animate] = useAnimate();
  const letterRef = useRef<HTMLDivElement>(null);
  /** True only when the user opened it in this session — gates focus stealing. */
  const openedHere = useRef(false);

  const alreadyOpened = useSyncExternalStore(
    subscribeNever,
    makeSnapshot(cardId),
    () => false,
  );

  const [override, setOverride] = useState<Stage | null>(null);
  const stage: Stage = override ?? (alreadyOpened ? "open" : "sealed");

  /**
   * The letter's visibility, tracked apart from the stage.
   *
   * These used to be the same flag, which is precisely what forced the
   * envelope to be completely gone before the letter could start arriving.
   * Splitting them lets the two cross over: `letterIn` flips mid-timeline while
   * the envelope overlay, still mounted at stage "opening", finishes fading out
   * on top of it.
   */
  const [letterIn, setLetterIn] = useState(false);
  const isOpen = stage === "open" || letterIn;

  /** Set on unmount so an in-flight sequence stops touching state. */
  const cancelled = useRef(false);
  useEffect(() => {
    cancelled.current = false;
    return () => {
      cancelled.current = true;
    };
  }, []);

  useEffect(() => {
    track("card_opened", { card: cardId, returning: alreadyOpened });
    // Only on first mount; `alreadyOpened` cannot change without a reload.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardId]);

  // Move focus to the letter, but only when this session did the opening.
  // Doing it on every mount would yank focus and scroll position on a card
  // that simply reopens straight to the letter.
  useEffect(() => {
    if (!isOpen || !openedHere.current) return;
    letterRef.current?.focus();
  }, [isOpen]);

  const finish = useCallback(() => {
    setLetterIn(true);
    setOverride("open");
    onOpen?.();
  }, [onOpen]);

  const skip = useCallback(() => {
    openedHere.current = true;
    track("envelope_opened", { card: cardId, skipped: true });
    finish();
  }, [cardId, finish]);

  const replay = useCallback(() => {
    setLetterIn(false);
    setOverride("sealed");
  }, []);

  const open = useCallback(async () => {
    if (stage !== "sealed") return;
    openedHere.current = true;
    track("envelope_opened", { card: cardId, skipped: false });

    try {
      localStorage.setItem(openedKey(cardId), String(Date.now()));
    } catch {
      // Private mode or blocked storage: the animation still runs, the card
      // just re-seals on the next visit. Not worth failing over.
    }

    if (reduceMotion) {
      finish();
      return;
    }

    setOverride("opening");

    // One timeline with absolute `at` offsets, rather than four chained
    // awaits. The overlaps are the whole point and cannot be expressed by
    // sequential awaits: the flap starts while the seal is still shrinking,
    // and the sheet starts to rise before the flap has finished swinging.
    //
    // The old version's 2.3s was four dead steps waiting on each other. This is
    // ~1.6s of continuous, overlapping motion — longer than any UI budget, and
    // correctly so: this is the one moment the whole product exists for, and
    // it happens once per letter. Time spent here is the experience, not a
    // delay in front of it.
    //
    // Every value is a full transform string, not Motion's `scale`/`y`
    // shorthands — the shorthands run on the main thread, and this plays at
    // the exact moment the letter's fonts and decor are still loading.
    const playback = animate([
      [
        "[data-seal]",
        // A beat of anticipation before it gives: the seal swells, holds, then
        // breaks. Never `scale(0)` — it ends small and transparent, not gone.
        {
          transform: [
            "scale(1)",
            "scale(1.14)",
            "scale(1.1)",
            "scale(0.42) rotate(-12deg)",
          ],
          opacity: [1, 1, 1, 0],
        },
        { duration: 0.72, ease: EASE_OUT, at: 0, times: [0, 0.35, 0.5, 1] },
      ],
      [
        "[data-flap]",
        {
          transform: ["rotateX(0deg)", "rotateX(-168deg)"],
          zIndex: [40, 0],
        },
        // On-screen movement, so ease-in-out — the flap is hinged, it does not
        // enter or leave. Starts before the seal has finished falling away.
        { duration: 0.78, ease: EASE_IN_OUT, at: 0.42 },
      ],
      [
        "[data-sheet]",
        {
          transform: [
            "translate3d(0, 0, 0) scale(1)",
            "translate3d(0, -52%, 0) scale(1.05)",
          ],
          opacity: [1, 0.28],
        },
        // The long, settling curve: the letter leaves the envelope quickly and
        // then drifts, which is what sells it as being lifted out.
        { duration: 0.82, ease: EASE_OUT_SOFT, at: 0.78 },
      ],
      [
        "[data-shell]",
        {
          transform: [
            "translate3d(0, 0, 0) scale(1)",
            "translate3d(0, 16px, 0) scale(0.97)",
          ],
          opacity: [1, 0],
        },
        // Settles downward as it goes: the envelope is being set down, and the
        // letter is what rises. Opposite directions read as one exchange.
        { duration: 0.6, ease: EASE_OUT_SOFT, at: 1.0 },
      ],
    ]);

    // Hand the letter over mid-flight. `playback` keeps running underneath.
    await new Promise((resolve) => setTimeout(resolve, REVEAL_AT_S * 1000));
    if (cancelled.current) return;
    setLetterIn(true);
    onOpen?.();

    try {
      await playback;
    } catch {
      // Aborted because the overlay unmounted (Skip). Fall through to open.
    }
    if (cancelled.current) return;
    setOverride("open");
  }, [stage, cardId, reduceMotion, animate, finish, onOpen]);

  const opening = stage === "opening";

  return (
    <div className="relative flex w-full flex-col items-center">
      {/*
        The letter is ALWAYS rendered, never gated behind the animation. That
        means crawlers and no-JS visitors get the text, a screen reader has it
        the instant Skip is pressed, and opening causes no layout thrash —
        only opacity and a transform.

        It is `invisible` as well as `opacity-0` while sealed: the card surface
        is a backdrop-filter, and an opacity-0 layer still composites.
        Visibility flips back instantly, so the fade-in is unaffected.

        The transform is the second half of the handover — the letter arrives
        rising and settling, on the same axis the envelope's sheet just left on.
        `motion-reduce` drops the movement and keeps the fade, which is what
        "fewer and gentler" means here.
      */}
      <div
        ref={letterRef}
        tabIndex={-1}
        aria-hidden={!isOpen}
        className={`w-full outline-none transition-[opacity,transform,filter] ease-out-soft ${
          isOpen
            ? "translate-y-0 scale-100 opacity-100 blur-none duration-1000"
            : "invisible pointer-events-none translate-y-8 scale-[0.96] opacity-0 blur-[6px] duration-200"
        } motion-reduce:translate-y-0 motion-reduce:scale-100 motion-reduce:blur-none`}
      >
        {children}
      </div>

      <div className="sr-only" aria-live="polite">
        {isOpen && openedHere.current ? "Your letter is open." : ""}
      </div>

      {/* A card you have opened before jumps straight to the letter — nobody
          wants the ceremony twice — but the ceremony is the nice part, so it
          stays one tap away. */}
      {stage === "open" && alreadyOpened && !openedHere.current && (
        <button
          type="button"
          onClick={replay}
          className="mt-2 rounded-full border border-foreground/10 bg-white/60 px-4 py-1.5 text-xs font-medium text-foreground/60 shadow-sm transition-[background-color,transform] duration-200 ease-out-strong hover:bg-white/90 active:scale-[0.97]"
        >
          Replay the envelope ✨
        </button>
      )}

      {stage !== "open" && (
        // `pointer-events-none` on the container, re-enabled on the controls:
        // the overlay spans the whole letter, and during the crossover the
        // letter underneath is already live — including PacedText's
        // tap-to-finish listener, which this would otherwise swallow.
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-6 px-4">
          {senderName?.trim() && (
            <p
              className={`font-serif text-sm italic tracking-wide text-foreground/45 transition-opacity duration-150 ${
                opening ? "opacity-0" : "opacity-100"
              }`}
            >
              from {senderName.trim()}
            </p>
          )}

          <button
            type="button"
            onClick={open}
            disabled={opening}
            aria-label={
              senderName
                ? `Open your letter from ${senderName}`
                : "Open your letter"
            }
            // The press and hover live on this trigger, and the idle float
            // lives on the shell inside — two elements so the two transforms
            // compose instead of overwriting one another.
            className="ll-envelope-trigger pointer-events-auto rounded-xl outline-none focus-visible:ring-4 focus-visible:ring-white/60 disabled:cursor-default"
            style={
              {
                "--ll-envelope-w": "min(320px, 78vw)",
              } as CSSProperties
            }
          >
            {/* A real button, so Enter and Space work with no key handling. */}
            <div ref={scope}>
              <Envelope spec={spec} palette={palette} />
            </div>
          </button>

          {/* Both fall away the moment the seal breaks: an instruction and an
              escape hatch are noise once the thing is already happening. */}
          <div
            className={`flex flex-col items-center gap-4 transition-opacity duration-150 ${
              opening ? "pointer-events-none opacity-0" : "pointer-events-auto opacity-100"
            }`}
          >
            <p className="text-sm tracking-wide text-foreground/60">
              {spec.hint}
            </p>

            {/* Focusable from first paint, not revealed on hover — someone who
                needs to skip the animation must be able to reach it immediately. */}
            <button
              type="button"
              onClick={skip}
              className="rounded-full px-4 py-1.5 text-xs font-medium text-foreground/45 underline decoration-foreground/20 underline-offset-4 transition-colors duration-200 hover:text-foreground/70 focus-visible:ring-2 focus-visible:ring-foreground/30"
            >
              Skip animation
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
