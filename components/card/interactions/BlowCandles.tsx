"use client";

import { useEffect, useRef, useState } from "react";
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
    <motion.button
      type="button"
      aria-label="Blow out the candles"
      className="relative cursor-pointer group"
      onClick={handleBlow}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="text-[100px] md:text-[150px] leading-none select-none relative z-10">
        🎂
      </div>

      {!blown && (
        <div className="absolute top-[18px] md:top-[25px] left-1/2 -translate-x-1/2 flex gap-2 md:gap-4 justify-center">
          {Array.from({ length: spec.candles }, (_, i) => (
            <motion.span
              key={i}
              animate={
                reduceMotion
                  ? undefined
                  : { scale: [1, 1.2, 1], rotate: [-5, 5, -5] }
              }
              transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
              className="w-3 h-5 md:w-4 md:h-6 bg-orange-400 rounded-full blur-[2px]"
              style={{ boxShadow: "0 0 10px #f97316, 0 0 20px #fbbf24" }}
            />
          ))}
        </div>
      )}

      {blown && !reduceMotion && (
        <motion.div
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: [0, 1, 0], y: -50, x: [0, 10, -10, 0] }}
          transition={{ duration: spec.smokeMs / 1000 }}
          className="absolute top-0 left-1/2 -translate-x-1/2 text-4xl"
        >
          💨
        </motion.div>
      )}

      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-28 md:w-40 h-6 md:h-8 bg-black/10 rounded-[100%] blur-md z-0 group-hover:w-36 md:group-hover:w-48 transition-all duration-300" />
    </motion.button>
  );
}
