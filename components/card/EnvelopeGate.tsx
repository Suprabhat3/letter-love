"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
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
  const isOpen = stage === "open";

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
    setOverride("open");
    onOpen?.();
  }, [onOpen]);

  const skip = useCallback(() => {
    openedHere.current = true;
    track("envelope_opened", { card: cardId, skipped: true });
    finish();
  }, [cardId, finish]);

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

    // One awaited chain rather than four chained onAnimationComplete
    // callbacks: it reads in order, and Skip mid-sequence simply unmounts the
    // envelope, at which point these settle harmlessly.
    try {
      await animate(
        "[data-seal]",
        { scale: [1, 1.25, 0], opacity: [1, 1, 0] },
        { duration: 0.6, ease: "easeInOut" },
      );
      await animate(
        "[data-flap]",
        { rotateX: -170, zIndex: 0 },
        { duration: 0.7, ease: "easeInOut" },
      );
      await animate(
        "[data-sheet]",
        { y: -120, scale: 1.05, opacity: 0.4 },
        { duration: 0.7, ease: "easeOut" },
      );
      if (scope.current) {
        await animate(scope.current, { opacity: 0 }, { duration: 0.3 });
      }
    } catch {
      // Aborted because the envelope unmounted (Skip). Fall through to open.
    }

    finish();
  }, [stage, cardId, reduceMotion, animate, scope, finish]);

  return (
    <div className="relative flex w-full flex-col items-center">
      {/*
        The letter is ALWAYS rendered, never gated behind the animation. That
        means crawlers and no-JS visitors get the text, a screen reader has it
        the instant Skip is pressed, and opening causes no layout thrash —
        only an opacity change.

        It is `invisible` as well as `opacity-0` while sealed: the card surface
        is a backdrop-filter, and an opacity-0 layer still composites.
        Visibility flips back instantly, so the fade-in is unaffected.
      */}
      <div
        ref={letterRef}
        tabIndex={-1}
        aria-hidden={!isOpen}
        className={`w-full outline-none transition-opacity ${
          isOpen
            ? "opacity-100 duration-500"
            : "invisible pointer-events-none opacity-0 duration-150"
        }`}
      >
        {children}
      </div>

      <div className="sr-only" aria-live="polite">
        {isOpen && openedHere.current ? "Your letter is open." : ""}
      </div>

      {/* A card you have opened before jumps straight to the letter — nobody
          wants the ceremony twice — but the ceremony is the nice part, so it
          stays one tap away. */}
      {isOpen && alreadyOpened && !openedHere.current && (
        <button
          type="button"
          onClick={() => setOverride("sealed")}
          className="mt-2 rounded-full border border-foreground/10 bg-white/60 px-4 py-1.5 text-xs font-medium text-foreground/60 shadow-sm transition-colors hover:bg-white/90"
        >
          Replay ✨
        </button>
      )}

      {!isOpen && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
          <button
            type="button"
            onClick={open}
            disabled={stage === "opening"}
            aria-label={
              senderName
                ? `Open your letter from ${senderName}`
                : "Open your letter"
            }
            className="rounded-xl outline-none focus-visible:ring-4 focus-visible:ring-white/60 disabled:cursor-default"
          >
            {/* A real button, so Enter and Space work with no key handling. */}
            <div ref={scope}>
              <Envelope spec={spec} palette={palette} />
            </div>
          </button>

          <p className="text-sm tracking-wide text-foreground/60">{spec.hint}</p>

          {/* Focusable from first paint, not revealed on hover — someone who
              needs to skip the animation must be able to reach it immediately. */}
          <button
            type="button"
            onClick={skip}
            className="rounded-full border border-foreground/10 bg-white/60 px-4 py-1.5 text-xs font-medium text-foreground/60 shadow-sm transition-colors hover:bg-white/90 focus-visible:ring-2 focus-visible:ring-foreground/30"
          >
            Skip animation
          </button>
        </div>
      )}
    </div>
  );
}
