"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { useReducedMotion } from "motion/react";
import dynamic from "next/dynamic";
import type { SceneId } from "@/lib/scenes";
import { track } from "@/lib/analytics";
import DiwaliLetter from "./DiwaliLetter";
import LetterCeremony from "./LetterCeremony";

// Loaded on demand: the canvas engine is only worth shipping to the cards
// that use it, and only once we know the scene is going to play.
const ScenePlayer = dynamic(() => import("./ScenePlayer"), {
  ssr: false,
  loading: () => <div className="fixed inset-0 z-100 bg-black" />,
});

/**
 * scene    → the interactive canvas, full screen
 * envelope → the envelope opens and the folded letter unfolds
 * stream   → the letter writes itself, word by word
 * read     → the whole letter, with the reactions and reply below it
 */
type Stage = "scene" | "envelope" | "stream" | "read";

// Shared with EnvelopeGate: "has this browser opened this card before".
// Here it only feeds analytics — every visit replays the whole experience.
const openedKey = (cardId: string) => `ll.opened.${cardId}`;
const subscribeNever = () => () => {};

export interface SceneGateProps {
  scene: SceneId;
  cardId: string;
  to: string;
  from: string;
  message: string;
  wish?: string;
  bodyFont: string;
  /** The letter is on screen (counts the open). */
  onOpen?: () => void;
  /** The letter has been read to the end; the page below can ask for things. */
  onRead?: () => void;
}

/**
 * EnvelopeGate's counterpart for cards with a full-screen opening scene.
 *
 * Unlike the envelope, a returning visitor gets the whole thing again from
 * the top: the scene is something to play with, not a gate to get past.
 * Reduced motion is the one exception — it lands straight on the full letter,
 * since fireworks and flicker are exactly what that setting asks us not to show.
 *
 * The letter is always in the DOM (crawlers, screen readers), just invisible
 * until its stage.
 */
export default function SceneGate({ scene, cardId, to, from, message, wish, bodyFont, onOpen, onRead }: SceneGateProps) {
  const reduceMotion = useReducedMotion();
  const mounted = useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );

  const [override, setOverride] = useState<Stage | null>(null);
  const stage: Stage = override ?? (reduceMotion ? "read" : "scene");
  // Bumped on every replay so the letter remounts with a fresh stream.
  const [run, setRun] = useState(0);
  const [box, setBox] = useState<{ w: number; h: number } | null>(null);
  const paperRef = useRef<HTMLDivElement>(null);
  const announced = useRef(false);
  const readAnnounced = useRef(false);

  useEffect(() => {
    let returning = false;
    try {
      returning = localStorage.getItem(openedKey(cardId)) !== null;
    } catch {
      // Private mode.
    }
    track("card_opened", { card: cardId, returning, scene });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardId]);

  const letterVisible = stage === "stream" || stage === "read";

  useEffect(() => {
    if (!mounted || !letterVisible || announced.current) return;
    announced.current = true;
    onOpen?.();
  }, [mounted, letterVisible, onOpen]);

  useEffect(() => {
    if (!mounted || stage !== "read" || readAnnounced.current) return;
    readAnnounced.current = true;
    onRead?.();
  }, [mounted, stage, onRead]);

  const sceneDone = useCallback(
    (how: "finished" | "skipped") => {
      track("envelope_opened", { card: cardId, skipped: how === "skipped", scene });
      try {
        localStorage.setItem(openedKey(cardId), String(Date.now()));
      } catch {
        // Private mode.
      }
      window.scrollTo({ top: 0 });
      // The ceremony folds a sheet the exact size of the letter, which is
      // already laid out underneath (invisible), so measure it now.
      const el = paperRef.current;
      if (el && el.offsetWidth > 0) {
        setBox({ w: el.offsetWidth, h: el.offsetHeight });
        setOverride("envelope");
      } else {
        setOverride("stream");
      }
    },
    [cardId, scene],
  );

  const ceremonyDone = useCallback(() => setOverride("stream"), []);
  const streamDone = useCallback(() => setOverride("read"), []);

  const replay = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setRun((n) => n + 1);
    setOverride("scene");
  };

  return (
    <div className="relative flex w-full max-w-xl flex-col items-center">
      <DiwaliLetter
        key={run}
        ref={paperRef}
        to={to}
        from={from}
        message={message}
        wish={wish}
        bodyFont={bodyFont}
        mode={stage === "read" ? "full" : stage === "stream" ? "stream" : "hidden"}
        onStreamEnd={streamDone}
        className={letterVisible ? "" : "invisible"}
      />

      {stage === "envelope" && box && (
        <LetterCeremony width={box.w} height={box.h} to={to} onDone={ceremonyDone} />
      )}

      {stage === "read" && !reduceMotion && (
        <button
          type="button"
          onClick={replay}
          className="ll-rise-in mt-5 rounded-full border border-amber-200/25 bg-amber-950/40 px-4 py-1.5 text-xs font-medium text-amber-100/80 shadow-sm backdrop-blur-sm transition-[background-color,transform] duration-200 ease-out-strong hover:bg-amber-950/60 active:scale-[0.97]"
        >
          Play the Diwali opening again ✨
        </button>
      )}

      {mounted &&
        stage === "scene" &&
        createPortal(
          <ScenePlayer key={run} scene={scene} to={to} from={from} wish={wish} seed={cardId} onDone={sceneDone} />,
          document.body,
        )}
    </div>
  );
}
