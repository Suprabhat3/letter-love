"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { Mail, Volume2, VolumeX } from "lucide-react";
import type { SceneId } from "@/lib/scenes";
import { SCENES } from "@/lib/scenes";
import { useScene, type SceneFactory, type SceneIO } from "./engine";
import { Sound } from "./sound";
import { createDiyaChain } from "./diyaChain";
import { createPhuljhari } from "./phuljhari";
import { createRangoli } from "./rangoli";
import { createLanterns } from "./lanterns";

const FACTORIES: Record<SceneId, SceneFactory> = {
  "diya-chain": createDiyaChain,
  phuljhari: createPhuljhari,
  rangoli: createRangoli,
  lanterns: createLanterns,
};

const MUTE_KEY = "ll.scene.muted";

export interface ScenePlayerProps {
  scene: SceneId;
  to: string;
  from: string;
  wish?: string;
  seed: string;
  /** The scene finished (or was skipped) and the overlay has faded out. */
  onDone: (how: "finished" | "skipped") => void;
  /** Label on the finale button. */
  readLabel?: string;
}

function SceneCanvas({ factory, io, label }: { factory: SceneFactory; io: SceneIO; label: string }) {
  const { ref, onKeyDown } = useScene(factory, io);
  return (
    <canvas
      ref={ref}
      tabIndex={0}
      aria-label={label}
      onKeyDown={onKeyDown}
      className="absolute inset-0 h-full w-full touch-none select-none outline-none"
    />
  );
}

/**
 * The full-screen stage a scene plays on, plus the only DOM it needs: a mute
 * toggle, a skip, one line of instruction, and the button that hands over to
 * the letter once the scene has had its moment.
 */
export default function ScenePlayer({ scene, to, from, wish, seed, onDone, readLabel }: ScenePlayerProps) {
  const [sound] = useState(() => new Sound());
  const [muted, setMuted] = useState(() => {
    try {
      return typeof window !== "undefined" && localStorage.getItem(MUTE_KEY) === "1";
    } catch {
      return false;
    }
  });
  const [hint, setHint] = useState("");
  const [soundTip, setSoundTip] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setSoundTip(false), 6000);
    return () => clearTimeout(t);
  }, []);
  const [finale, setFinale] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const unlocked = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    sound.setMuted(muted);
  }, [sound, muted]);

  useEffect(() => {
    // The scene owns the screen; the page underneath must not scroll.
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
      if (timer.current) clearTimeout(timer.current);
      sound.dispose();
    };
  }, [sound]);

  const leave = useCallback(
    (how: "finished" | "skipped") => {
      if (leaving) return;
      setLeaving(true);
      sound.fadeOut(0.7);
      timer.current = setTimeout(() => onDone(how), 750);
    },
    [leaving, onDone, sound],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") leave("skipped");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [leave]);

  /** Audio can only start inside a gesture, so the first touch anywhere unlocks it. */
  const unlock = () => {
    if (unlocked.current) return;
    unlocked.current = true;
    sound.unlock();
    sound.setMuted(muted);
    sound.startDrone();
  };

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    try {
      localStorage.setItem(MUTE_KEY, next ? "1" : "0");
    } catch {
      // Not worth failing over.
    }
  };

  const meta = SCENES.find((s) => s.id === scene)!;
  const io: SceneIO = {
    to,
    from,
    wish,
    seed,
    sound,
    hint: setHint,
    finale: () => setFinale(true),
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`A Diwali letter${from ? ` from ${from}` : ""}`}
      onPointerDownCapture={unlock}
      onKeyDownCapture={unlock}
      className={`fixed inset-0 z-100 overflow-hidden bg-black transition-opacity duration-700 ease-out-soft ${
        leaving ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <SceneCanvas key={scene} factory={FACTORIES[scene]} io={io} label={`${meta.name}: ${meta.blurb}`} />

      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4 md:p-6">
        <p className="ll-rise-in max-w-[60%] font-serif text-sm italic tracking-wide text-amber-100/60">
          {from ? `A Diwali letter from ${from}` : "A Diwali letter for you"}
        </p>
        <div className="pointer-events-auto relative flex items-center gap-2">
          {/* Sound is opt-in and inaudible until the first touch, so say it
              exists — briefly, under the button, then get out of the way. */}
          {soundTip && (
            <span className="ll-rise-in pointer-events-none absolute right-0 top-full mt-2 whitespace-nowrap rounded-full bg-black/40 px-3 py-1 text-[11px] tracking-wide text-amber-100/75 backdrop-blur-sm">
              {muted ? "Sound is off · tap to turn on" : "Best with sound 🔊"}
            </span>
          )}
          <button
            type="button"
            onClick={toggleMute}
            aria-pressed={!muted}
            aria-label={muted ? "Turn sound on" : "Turn sound off"}
            className="grid h-9 w-9 place-items-center rounded-full border border-amber-100/15 bg-white/5 text-amber-100/70 backdrop-blur-sm transition-[background-color,transform] duration-200 ease-out-strong hover:bg-white/10 active:scale-95"
          >
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>
      </div>

      {/* The hint, then the way out — always there, so nobody has to finish
          playing to get to their letter, but quiet until the scene has had its
          finale, when it lights up and becomes the obvious next step. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center gap-3 px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] text-center">
        {/* Keyed on the text so each new step re-enters, which is what makes
            a changed instruction noticeable rather than a silent swap. */}
        <div aria-live="polite" className="flex min-h-8 items-end justify-center">
          {hint && (
            <p
              key={hint}
              className="ll-rise-in max-w-[min(92vw,26rem)] rounded-full bg-black/40 px-4 py-1.5 text-[13px] leading-snug tracking-wide text-amber-50/90 shadow-[0_4px_20px_rgba(0,0,0,0.35)] backdrop-blur-sm sm:text-sm"
            >
              {hint}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => leave(finale ? "finished" : "skipped")}
          style={{ "--ll-delay": "1200ms" } as CSSProperties}
          className={`ll-rise-in pointer-events-auto flex items-center gap-2 rounded-full transition-[background-color,color,box-shadow,transform,padding] duration-500 ease-out-strong active:scale-[0.97] ${
            finale
              ? "ll-cta-glow bg-linear-to-r from-amber-300 via-amber-400 to-orange-400 px-7 py-3.5 text-base font-semibold text-amber-950 shadow-[0_0_44px_-6px_rgba(251,191,36,0.8)] pointer-fine:hover:scale-[1.03]"
              : "border border-amber-100/20 bg-[#1a0d06]/55 px-5 py-2.5 text-sm font-medium text-amber-100/85 backdrop-blur-md pointer-fine:hover:bg-[#1a0d06]/80"
          }`}
        >
          <Mail size={finale ? 18 : 15} aria-hidden />
          {readLabel ?? (finale ? (from ? `Open ${from}'s letter` : "Open your letter") : "Read the letter")}
        </button>
      </div>
    </div>
  );
}
