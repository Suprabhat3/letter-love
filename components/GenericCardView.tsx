"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import Link from "next/link";
import Image from "next/image";
import { SharedCard, Template, CATEGORIES } from "@/lib/types";
import { getFontClasses } from "@/lib/fonts";
import { readCardContent, readCardStyle } from "@/lib/cardStyle";
import { seededSeries } from "@/lib/rand";

interface GenericCardViewProps {
  card: SharedCard;
  template: Template;
}

const HERO_GIFS: Record<string, { src: string; alt: string }> = {
  "love-letter": {
    src: "https://media1.tenor.com/m/HI7GdDJ1yq0AAAAC/us-you-and-me.gif",
    alt: "Us You And Me Sticker",
  },
  "miss-you": {
    src: "https://media1.tenor.com/m/rzG9YBjxW-0AAAAC/peach-sad.gif",
    alt: "Peach Sad GIF",
  },
  anniversary: {
    src: "https://media1.tenor.com/m/K6WkauZF1ToAAAAC/happy-valentines-day-valentines-day.gif",
    alt: "Happy Valentines Day Hugs Sticker",
  },
};

const FLOATERS = ["💕", "✨", "💌", "🌸", "💗"];
const PARTICLE_COUNT = 14;
const CONFETTI_COUNT = 18;

export default function GenericCardView({
  card,
  template,
}: GenericCardViewProps) {
  const [showContent, setShowContent] = useState(false);
  const reduceMotion = useReducedMotion();

  const data = useMemo(() => readCardContent(card.data), [card.data]);
  const style = useMemo(() => readCardStyle(card.data), [card.data]);
  const fontClasses = getFontClasses(style.font);
  const category = CATEGORIES.find((c) => c.id === template.category);
  const hero = HERO_GIFS[template.id];

  // Seeded from the card id: identical on server and client (no hydration
  // mismatch) and identical on every visit.
  const floaters = useMemo(
    () => seededSeries(`${card.id}:float`, PARTICLE_COUNT, 3),
    [card.id],
  );
  const confetti = useMemo(
    () => seededSeries(`${card.id}:confetti`, CONFETTI_COUNT, 6),
    [card.id],
  );

  useEffect(() => {
    const timeout = setTimeout(() => setShowContent(true), 500);
    return () => clearTimeout(timeout);
  }, []);

  const palette = {
    primary: style.palette?.primary ?? template.colors.primary,
    secondary: style.palette?.secondary ?? template.colors.secondary,
    accent: style.palette?.accent ?? template.colors.accent,
  };

  return (
    <main className="min-h-[100svh] relative flex items-center justify-center overflow-hidden bg-background p-6">
      {/* Ambient background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <motion.div
          animate={
            reduceMotion ? undefined : { scale: [1, 1.3, 1], opacity: [0.4, 0.6, 0.4] }
          }
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-[-20%] left-[-20%] w-[800px] h-[800px] rounded-full blur-3xl"
          style={{ backgroundColor: `${palette.secondary}50` }}
        />
        <motion.div
          animate={
            reduceMotion ? undefined : { scale: [1.3, 1, 1.3], opacity: [0.4, 0.6, 0.4] }
          }
          transition={{ duration: 10, repeat: Infinity, delay: 2 }}
          className="absolute bottom-[-20%] right-[-20%] w-[800px] h-[800px] rounded-full blur-3xl"
          style={{ backgroundColor: `${palette.primary}40` }}
        />
      </div>

      {/* Floating particles */}
      {!reduceMotion && (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          {floaters.map(([x, dur, delay], i) => (
            <motion.div
              key={i}
              className="absolute text-2xl"
              initial={{ x: `${x * 100}vw`, y: "110vh", opacity: 0.6 }}
              animate={{ y: "-10vh" }}
              transition={{
                duration: 15 + dur * 10,
                repeat: Infinity,
                delay: delay * 10,
                ease: "linear",
              }}
            >
              {FLOATERS[i % FLOATERS.length]}
            </motion.div>
          ))}
        </div>
      )}

      <div className="z-10 w-full max-w-lg relative flex flex-col items-center">
        <AnimatePresence>
          {showContent && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 100 }}
              className="glass-panel p-8 md:p-12 rounded-3xl text-center relative overflow-hidden w-full shadow-2xl mb-8"
              style={{
                background: `linear-gradient(135deg, rgba(255,255,255,0.9) 0%, ${palette.secondary}40 100%)`,
              }}
            >
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/60 via-transparent to-transparent pointer-events-none rounded-3xl" />

              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="relative z-10 mb-6"
              >
                <span
                  className="px-4 py-2 rounded-full text-sm font-medium inline-block shadow-sm"
                  style={{
                    backgroundColor: `${palette.primary}20`,
                    color: palette.accent,
                  }}
                >
                  {category?.emoji} {category?.name}
                </span>
              </motion.div>

              {hero ? (
                <div className="mb-6 relative w-full max-w-[280px] mx-auto z-10 overflow-hidden rounded-xl">
                  <Image
                    src={hero.src}
                    alt={hero.alt}
                    width={280}
                    height={280}
                    className="w-full h-auto rounded-lg"
                    unoptimized
                  />
                </div>
              ) : (
                <motion.div
                  className="text-8xl mb-8 filter drop-shadow-lg relative z-10 select-none"
                  animate={
                    reduceMotion
                      ? undefined
                      : { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }
                  }
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  {template.emoji}
                </motion.div>
              )}

              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className={`text-5xl md:text-6xl mb-4 relative z-10 ${fontClasses.header}`}
                style={{ color: palette.primary }}
              >
                {data.recipientName || "My Dear"}
              </motion.h1>

              {data.petName && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className={`text-foreground/60 italic mb-6 relative z-10 ${fontClasses.body}`}
                >
                  {data.petName}
                </motion.p>
              )}

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className={`text-lg md:text-xl text-foreground/80 leading-relaxed mb-8 relative z-10 max-w-md mx-auto whitespace-pre-line ${fontClasses.body}`}
              >
                {data.message || data.reason || template.previewText}
              </motion.p>

              {(data.memory || data.promise) && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="border-t border-foreground/10 pt-6 mb-6 relative z-10"
                >
                  <p
                    className={`text-foreground/60 text-sm italic ${fontClasses.body}`}
                  >
                    &ldquo;{data.memory || data.promise}&rdquo;
                  </p>
                </motion.div>
              )}

              {data.years && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6, type: "spring" }}
                  className="mb-6 relative z-10"
                >
                  <span
                    className="text-4xl font-bold font-serif"
                    style={{ color: palette.primary }}
                  >
                    {data.years}
                  </span>
                  <span className="text-foreground/60 ml-2">
                    years together
                  </span>
                </motion.div>
              )}

              {data.wish && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className={`text-foreground/70 font-medium mb-6 relative z-10 ${fontClasses.body}`}
                >
                  ✨ {data.wish}
                </motion.p>
              )}

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className={`text-foreground/60 relative z-10 ${fontClasses.header}`}
              >
                — {data.senderName || "With Love"}
              </motion.p>

              {!reduceMotion &&
                confetti.map(([x, y, dur, rot, delay, gap], i) => (
                  <motion.div
                    key={i}
                    className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full pointer-events-none"
                    style={{
                      backgroundColor: [
                        palette.primary,
                        palette.secondary,
                        palette.accent,
                        "#ffd700",
                        "#ff69b4",
                      ][i % 5],
                    }}
                    initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                    animate={{
                      x: (x - 0.5) * 500,
                      y: (y - 0.5) * 500,
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0],
                      rotate: rot * 720,
                    }}
                    transition={{
                      duration: 2 + dur * 2,
                      ease: "easeOut",
                      repeat: Infinity,
                      repeatDelay: gap * 5,
                      delay: delay * 2,
                    }}
                  />
                ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="text-center px-4 max-w-sm"
        >
          <Link
            href="/templates"
            className="btn-primary px-8 py-4 rounded-full font-bold shadow-lg shadow-pink-200/50 hover:shadow-pink-300/50 transition-all flex items-center justify-center gap-2 text-lg"
          >
            Create Your Own Card
          </Link>
          <p className="text-muted-foreground/50 text-xs mt-4 font-serif italic">
            Made with LetterLove 💕
          </p>
        </motion.div>
      </div>
    </main>
  );
}
