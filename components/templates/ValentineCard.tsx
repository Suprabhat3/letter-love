"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import Link from "next/link";
import Image from "next/image";
import { FontId, getFontClasses } from "@/lib/fonts";
import { seededSeries } from "@/lib/rand";

// Phrases that appear on the "No" button
const NO_PHRASES = [
  "No",
  "Are you sure?",
  "Think again!",
  "Please?",
  "Really?",
  "Don't do this!",
  "I'll be sad!",
  "Give me a chance!",
  "Pretty please?",
  "My heart...",
  "Think about it!",
  "Last chance!",
];

const HEART_COUNT = 14;
const CONFETTI_COUNT = 24;

interface ValentineCardProps {
  data: Record<string, string>;
  font?: FontId;
  cardId?: string;
}

export default function ValentineCard({
  data,
  font,
  cardId = "valentine",
}: ValentineCardProps) {
  const [noCount, setNoCount] = useState(0);
  const [isAccepted, setIsAccepted] = useState(false);
  const reduceMotion = useReducedMotion();
  const fontClasses = getFontClasses(font);

  const recipientName = data.recipientName || "My Love";
  const senderName = data.senderName || "Admirer";
  const reason = data.reason || "You make my world brighter every single day.";

  const yesButtonSize = noCount * 20 + 20; // Increases by 20px per 'No' click

  // Seeded so the layout is hydration-safe and stable across visits.
  const hearts = useMemo(
    () => seededSeries(`${cardId}:hearts`, HEART_COUNT, 4),
    [cardId],
  );
  const confetti = useMemo(
    () => seededSeries(`${cardId}:confetti`, CONFETTI_COUNT, 5),
    [cardId],
  );

  const handleNoClick = () => setNoCount(noCount + 1);
  const getNoText = () => NO_PHRASES[noCount % NO_PHRASES.length];

  return (
    <main className="min-h-[100svh] relative flex items-center justify-center overflow-hidden bg-background p-6">
      {/* Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none z-0">
        <motion.div
          animate={
            reduceMotion
              ? undefined
              : { scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }
          }
          transition={{ duration: 8, repeat: Infinity }}
          className="blob-bg top-[10%] left-[10%] bg-pink-300/40 w-[600px] h-[600px] opacity-40 blur-3xl rounded-full"
        />
        <motion.div
          animate={
            reduceMotion
              ? undefined
              : { scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }
          }
          transition={{ duration: 10, repeat: Infinity }}
          className="blob-bg bottom-[10%] right-[10%] bg-red-300/40 w-[500px] h-[500px] opacity-40 blur-3xl rounded-full"
        />

        {/* Floating Hearts Animation */}
        {!reduceMotion &&
          hearts.map(([x, dur, delay, rot], i) => (
            <motion.div
              key={i}
              initial={{ y: "110vh", x: `${x * 100}vw`, opacity: 0 }}
              animate={{
                y: "-10vh",
                opacity: [0, 0.6, 0],
                rotate: rot * 360,
              }}
              transition={{
                duration: 10 + dur * 10,
                repeat: Infinity,
                delay: delay * 5,
                ease: "linear",
              }}
              className="absolute text-2xl text-pink-400 opacity-30"
            >
              {["❤️", "💖", "💘", "💓", "💕"][i % 5]}
            </motion.div>
          ))}
      </div>

      <div className="z-10 w-full max-w-lg relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-8 rounded-3xl text-center relative overflow-hidden border-white/60 shadow-xl min-h-[500px] flex flex-col justify-center items-center backdrop-blur-xl bg-white/30"
        >
          {/* Decorative shine */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/60 via-transparent to-transparent pointer-events-none rounded-3xl" />

          <AnimatePresence mode="wait">
            {!isAccepted ? (
              <motion.div
                key="question"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="w-full relative z-10 flex flex-col items-center"
              >
                <motion.div
                  animate={reduceMotion ? undefined : { scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-8xl mb-6 filter drop-shadow-md"
                >
                  💝
                </motion.div>

                <h1
                  className={`text-5xl md:text-6xl text-red-500 mb-2 drop-shadow-sm p-2 ${fontClasses.header}`}
                >
                  Will you be my Valentine?
                </h1>

                <h2
                  className={`text-xl md:text-2xl font-medium text-foreground/80 mb-6 md:mb-8 ${fontClasses.header}`}
                >
                  {recipientName}
                </h2>

                <p
                  className={`text-muted-foreground text-lg mb-8 max-w-sm italic ${fontClasses.body}`}
                >
                  &ldquo;{reason}&rdquo;
                </p>

                {/* Interactive Buttons */}
                <div className="flex flex-wrap items-center justify-center gap-6 w-full min-h-[100px] relative">
                  <motion.button
                    type="button"
                    className="btn-primary rounded-xl font-bold shadow-pink-500/30 shadow-xl transition-all z-20"
                    style={{
                      fontSize: Math.min(yesButtonSize, 60),
                      padding: `${Math.min(yesButtonSize / 2, 30)}px ${Math.min(yesButtonSize + 20, 80)}px`,
                    }}
                    onClick={() => setIsAccepted(true)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    YES! 💖
                  </motion.button>

                  <motion.button
                    type="button"
                    className="px-6 py-3 rounded-xl bg-gray-100 text-gray-500 font-medium hover:bg-gray-200 transition-colors text-sm whitespace-nowrap z-10"
                    onClick={handleNoClick}
                    whileHover={{ x: (hearts[noCount % HEART_COUNT][0] - 0.5) * 50 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {getNoText()}
                  </motion.button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full relative z-10 py-12 flex flex-col items-center"
              >
                <div className="mb-6 mx-auto relative max-w-[250px] w-full">
                  <Image
                    src="https://media1.tenor.com/m/D1CAg1rBD6wAAAAC/tkthao219-bubududu.gif"
                    alt="Tkthao219 Bubududu Sticker"
                    width={250}
                    height={250}
                    className="w-full h-auto rounded-lg"
                    unoptimized
                  />
                </div>

                <h2
                  className={`text-6xl text-red-500 mb-6 ${fontClasses.header}`}
                >
                  Wooohooo!!! 💖
                </h2>

                <p
                  className={`text-xl text-foreground/80 mb-8 max-w-xs mx-auto ${fontClasses.body}`}
                >
                  I knew you&apos;d say yes! <br /> Can&apos;t wait for our
                  special day.
                </p>

                <div className="flex flex-col gap-2">
                  <Link href="/templates">
                    <button
                      type="button"
                      className="btn-primary px-8 py-3 rounded-full text-lg font-semibold shadow-lg hover:scale-105 transition-transform"
                    >
                      Ask Someone Special
                    </button>
                  </Link>
                  <p
                    className={`text-sm text-muted-foreground mt-4 ${fontClasses.header}`}
                  >
                    With endless love, <br /> {senderName}
                  </p>
                </div>

                {/* Explosion Confetti */}
                {!reduceMotion &&
                  confetti.map(([x, y, dur, rot, gap], i) => (
                    <motion.div
                      key={`confetti-${i}`}
                      className="absolute top-1/2 left-1/2 w-3 h-3 rounded-full pointer-events-none"
                      style={{
                        backgroundColor: [
                          "#ff0000",
                          "#ff69b4",
                          "#ffffff",
                          "#ff1493",
                        ][i % 4],
                      }}
                      initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
                      animate={{
                        x: (x - 0.5) * 800,
                        y: (y - 0.5) * 800,
                        opacity: [1, 1, 0],
                        scale: [0, 1, 0],
                        rotate: rot * 720,
                      }}
                      transition={{
                        duration: 2 + dur * 1.5,
                        ease: "easeOut",
                        repeat: Infinity,
                        repeatDelay: gap * 3,
                      }}
                    />
                  ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`text-center text-muted-foreground/60 text-xs mt-8 italic ${fontClasses.body}`}
        >
          Made with LetterLove
        </motion.p>
      </div>
    </main>
  );
}
