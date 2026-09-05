"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { InteractionSpec } from "@/lib/theme";
import { track } from "@/lib/analytics";

type Spec = Extract<InteractionSpec, { kind: "blow-candles" }>;

/** BirthdayCard's cake, extracted. The card's own copy comes from its blocks. */
export default function BlowCandles({
  spec,
  onComplete,
}: {
  spec: Spec;
  onComplete: () => void;
}) {
  const [blown, setBlown] = useState(false);
  const reduceMotion = useReducedMotion();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const handleBlow = () => {
    if (blown) return;
    setBlown(true);
    track("reaction_added", { interaction: "blow-candles" });
    // Let the smoke play before the message takes over the card.
    timer.current = setTimeout(onComplete, reduceMotion ? 0 : spec.smokeMs);
  };

  return (
    <button
      type="button"
      aria-label="Blow out the candles"
      // Hover and press are CSS now, gated for touch. `whileHover` fires on tap
      // in several mobile browsers, which left the cake stuck at 1.05 after
      // someone had already blown the candles out.
      className="group relative cursor-pointer transition-transform duration-200 ease-out-strong active:scale-95 active:duration-100 pointer-fine:hover:scale-105"
      onClick={handleBlow}
    >
      <div className="relative z-10 text-[100px] leading-none select-none md:text-[150px]">
        🎂
      </div>

      {!blown && (
        <div className="absolute top-4.5 left-1/2 flex -translate-x-1/2 justify-center gap-2 md:top-6.25 md:gap-4">
          {Array.from({ length: spec.candles }, (_, i) => (
            <span
              key={i}
              // A CSS flicker rather than a motion loop per candle: this runs
              // forever, alongside the card's decor layer, on the phone this
              // card is most often opened on.
              className={`h-5 w-3 rounded-full bg-orange-400 blur-[2px] md:h-6 md:w-4 ${
                reduceMotion ? "" : "ll-candle"
              }`}
              style={
                {
                  boxShadow: "0 0 10px #f97316, 0 0 20px #fbbf24",
                  "--ll-delay": `${i * 0.1}s`,
                } as CSSProperties
              }
            />
          ))}
        </div>
      )}

      {blown && !reduceMotion && (
        <motion.div
          // One-shot, so a keyframe list is right — and full transform strings,
          // because the card is mid-phase-change while this plays.
          initial={{ opacity: 0, transform: "translate3d(-50%, 0, 0)" }}
          animate={{
            opacity: [0, 1, 0],
            transform: [
              "translate3d(-50%, 0, 0)",
              "translate3d(calc(-50% + 10px), -18px, 0)",
              "translate3d(calc(-50% - 10px), -36px, 0)",
              "translate3d(-50%, -50px, 0)",
            ],
          }}
          transition={{ duration: spec.smokeMs / 1000, ease: "easeOut" }}
          className="absolute top-0 left-1/2 text-4xl"
        >
          💨
        </motion.div>
      )}

      <div
        aria-hidden
        className="ll-cake-shadow absolute -bottom-4 left-1/2 z-0 h-6 w-28 rounded-[100%] bg-black/10 blur-md md:h-8 md:w-40"
        style={{ transform: "translateX(-50%)" }}
      />
    </button>
  );
}
