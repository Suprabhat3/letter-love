"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { SharedCard, Template, CATEGORIES } from "@/lib/types";

interface ShareCardViewProps {
  card: SharedCard;
  template: Template;
}

export default function ShareCardView({ card, template }: ShareCardViewProps) {
  const [showContent, setShowContent] = useState(false);

  const category = CATEGORIES.find((c) => c.id === template.category);
  const data = card.data;

  useEffect(() => {
    setTimeout(() => setShowContent(true), 500);
  }, []);

  return (
    <main className="min-h-screen relative flex items-center justify-center overflow-hidden bg-background p-6">
      {/* Animated background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-[-20%] left-[-20%] w-[800px] h-[800px] rounded-full blur-3xl"
          style={{ backgroundColor: `${template.colors.secondary}50` }}
        />
        <motion.div
          animate={{ scale: [1.3, 1, 1.3], opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 10, repeat: Infinity, delay: 2 }}
          className="absolute bottom-[-20%] right-[-20%] w-[800px] h-[800px] rounded-full blur-3xl"
          style={{ backgroundColor: `${template.colors.primary}40` }}
        />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-2xl"
            initial={{
              x: `${Math.random() * 100}vw`,
              y: "110vh",
              opacity: 0.6,
            }}
            animate={{ y: "-10vh" }}
            transition={{
              duration: 15 + Math.random() * 10,
              repeat: Infinity,
              delay: Math.random() * 10,
              ease: "linear",
            }}
          >
            {["💕", "✨", "💌", "🌸", "💗"][i % 5]}
          </motion.div>
        ))}
      </div>

      <div className="z-10 w-full max-w-lg relative flex flex-col items-center">
        {/* Card Content */}
        <AnimatePresence>
          {showContent && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 100 }}
              className="glass-panel p-8 md:p-12 rounded-3xl text-center relative overflow-hidden w-full shadow-2xl mb-8"
              style={{
                background: `linear-gradient(135deg, rgba(255,255,255,0.9) 0%, ${template.colors.secondary}40 100%)`,
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
                    backgroundColor: `${template.colors.primary}20`,
                    color: template.colors.accent,
                  }}
                >
                  {category?.emoji} {category?.name}
                </span>
              </motion.div>

              <motion.div
                className="text-8xl mb-8 filter drop-shadow-lg relative z-10 select-none"
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                {template.emoji}
              </motion.div>

              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="font-handwriting text-5xl md:text-6xl mb-4 relative z-10"
                style={{ color: template.colors.primary }}
              >
                {data.recipientName || "My Dear"}
              </motion.h1>

              {data.petName && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-foreground/60 font-serif italic mb-6 relative z-10"
                >
                  {data.petName}
                </motion.p>
              )}

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-lg md:text-xl text-foreground/80 font-serif leading-relaxed mb-8 relative z-10 max-w-md mx-auto whitespace-pre-line"
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
                  <p className="text-foreground/60 text-sm italic font-serif">
                    "{data.memory || data.promise}"
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
                    style={{ color: template.colors.primary }}
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
                  className="text-foreground/70 font-medium mb-6 relative z-10"
                >
                  ✨ {data.wish}
                </motion.p>
              )}

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-foreground/60 font-serif relative z-10"
              >
                — {data.senderName || "With Love"}
              </motion.p>

              {/* Confetti particles */}
              {Array.from({ length: 30 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full pointer-events-none"
                  style={{
                    backgroundColor: [
                      template.colors.primary,
                      template.colors.secondary,
                      template.colors.accent,
                      "#ffd700",
                      "#ff69b4",
                    ][i % 5],
                  }}
                  initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                  animate={{
                    x: (Math.random() - 0.5) * 500,
                    y: (Math.random() - 0.5) * 500,
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                    rotate: Math.random() * 720,
                  }}
                  transition={{
                    duration: 2 + Math.random() * 2,
                    ease: "easeOut",
                    repeat: Infinity,
                    repeatDelay: Math.random() * 5,
                    delay: Math.random() * 2,
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
          <div className="">
            {/* <p className="text-foreground/70 font-medium mb-4">
              Inspired? Send one too!
            </p> */}
            <Link
              href="/templates"
              className="btn-primary px-8 py-4 rounded-full font-bold shadow-lg shadow-pink-200/50 hover:shadow-pink-300/50 transition-all flex items-center justify-center gap-2 text-lg"
            >
              Create Your Own Card 
            </Link>
            <p className="text-muted-foreground/50 text-xs mt-4 font-serif italic">
              Made with LetterLove 💕
            </p>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
