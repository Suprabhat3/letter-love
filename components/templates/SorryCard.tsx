"use client";
import { useState } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import Image from "next/image";
import { CardData } from "@/lib/types";

// Phrases that appear on the "No" button
const NO_PHRASES = [
  "No",
  "Are you sure?",
  "Really sure?",
  "Think again!",
  "Last chance!",
  "Surely not?",
  "You might regret this!",
  "Give me a chance!",
  "Have a heart!",
  "Don't be so cold!",
  "Change of heart?",
  "Wouldn't you reconsider?",
  "Is that your final answer?",
  "You're breaking my heart ;(",
];

interface SorryCardProps {
  data: Record<string, string>;
}

export default function SorryCard({ data }: SorryCardProps) {
  const [noCount, setNoCount] = useState(0);
  const [isForgiven, setIsForgiven] = useState(false);

  const recipientName = data.recipientName || "Dear Friend";
  const senderName = data.senderName || "Sincerely Sorry";
  const reason = data.reason || "everything";
  const promise = data.promise;

  const yesButtonSize = noCount * 20 + 16; // Increases by 20px per 'No' click

  const handleNoClick = () => {
    setNoCount(noCount + 1);
  };

  const getNoText = () => {
    return NO_PHRASES[Math.min(noCount, NO_PHRASES.length - 1)];
  };

  // Generate particles for celebration
  const particles = Array.from({ length: 50 });

  return (
    <main className="min-h-screen relative flex items-center justify-center overflow-hidden bg-background p-6">
      {/* Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none z-0">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="blob-bg top-[10%] left-[10%] bg-pink-200/40 w-[600px] h-[600px] opacity-40 blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="blob-bg bottom-[10%] right-[10%] bg-purple-200/40 w-[500px] h-[500px] opacity-40 blur-3xl"
        />

        {/* Rain/Teardrop Effect (Only when not forgiven) */}
        {!isForgiven &&
          Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={`rain-${i}`}
              initial={{ y: -50, opacity: 0 }}
              animate={{
                y: ["0vh", "100vh"],
                opacity: [0, 0.5, 0],
              }}
              transition={{
                duration: 2 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 5,
                ease: "linear",
              }}
              className="absolute text-2xl opacity-30"
              style={{ left: `${Math.random() * 100}%` }}
            >
              {i % 2 === 0 ? "💧" : "💔"}
            </motion.div>
          ))}

        {/* Floating Hearts (Only when forgiven) */}
        {isForgiven &&
          Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={`hearts-${i}`}
              initial={{ y: "100vh", opacity: 0, scale: 0.5 }}
              animate={{
                y: "-10vh",
                opacity: [0, 0.6, 0],
                scale: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 4 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: "easeOut",
              }}
              className="absolute text-3xl opacity-40"
              style={{ left: `${Math.random() * 100}%` }}
            >
              {["💖", "🥰", "✨", "🌸"][i % 4]}
            </motion.div>
          ))}
      </div>

      <div className="z-10 w-full max-w-lg relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-8 rounded-3xl text-center relative overflow-hidden border-white/60 shadow-xl min-h-[500px] flex flex-col justify-center items-center"
        >
          {/* Decorative shine */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/50 via-transparent to-transparent pointer-events-none rounded-3xl" />

          {!isForgiven ? (
            <motion.div
              key="question"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full relative z-10 flex flex-col items-center"
            >
              <motion.div
                animate={{
                  rotate: noCount % 2 === 0 ? [0, -5, 5, 0] : [0, 5, -5, 0],
                  scale: 1 + noCount * 0.02,
                }}
                transition={{ duration: 0.5 }}
                className="text-8xl mb-6 filter drop-shadow-lg"
              >
                🥺
              </motion.div>

              <h1 className="font-handwriting text-5xl md:text-6xl text-gradient mb-2 drop-shadow-sm p-3">
                I'm So Sorry
              </h1>

              <h2 className="text-xl font-medium text-foreground/80 mb-4 font-serif">
                {recipientName}
              </h2>

              <p className="text-muted-foreground font-serif text-lg mb-6 max-w-sm">
                for {reason}
              </p>

              {promise && (
                <p className="text-foreground/70 font-serif italic mb-8 max-w-sm border-t border-foreground/10 pt-4">
                  "I promise to {promise}"
                </p>
              )}

              <p className="text-foreground/80 mb-8 max-w-sm mx-auto leading-relaxed text-sm">
                Please find it in your heart to forgive me.
              </p>

              {/* Dynamic Button Game */}
              <div className="flex flex-wrap items-center justify-center gap-4 w-full min-h-[100px]">
                <motion.button
                  className="btn-primary rounded-xl font-bold shadow-pink-500/20 shadow-xl transition-all"
                  style={{
                    fontSize: Math.min(yesButtonSize, 60),
                    padding: `${Math.min(yesButtonSize / 2, 30)}px ${Math.min(yesButtonSize, 60)}px`,
                  }}
                  onClick={() => setIsForgiven(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Yes, I Forgive You
                </motion.button>

                <motion.button
                  className="px-6 py-3 rounded-xl bg-gray-100 text-gray-500 font-medium hover:bg-gray-200 transition-colors text-sm whitespace-nowrap"
                  onClick={handleNoClick}
                  whileHover={{ scale: 0.95, rotate: -2 }}
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
              <div className="mb-6 mx-auto relative w-full max-w-[250px]">
                <Image
                  src="https://media1.tenor.com/m/cOjBPqUGt4MAAAAC/bear-hug.gif"
                  alt="Bear Hug Sticker"
                  width={250}
                  height={250}
                  className="w-full h-auto rounded-lg"
                  unoptimized
                />
              </div>

              <h2 className="font-handwriting text-6xl text-pink-500 mb-6 underline-offset-8">
                Yippeee!!
              </h2>

              <p className="text-xl text-foreground/80 font-serif mb-8">
                Thank you for forgiving me! <br /> You're the absolute best.
              </p>

              <div className="flex flex-col gap-2">
                <Link href="/templates">
                  <button className="btn-primary px-8 py-3 rounded-full text-lg font-semibold shadow-lg hover:scale-105 transition-transform">
                    Send One Back
                  </button>
                </Link>
                <p className="text-sm text-muted-foreground mt-2">
                  — {senderName}
                </p>
              </div>

              {/* Confetti Particles */}
              {particles.map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full pointer-events-none"
                  style={{
                    backgroundColor: [
                      "#ff0000",
                      "#00ff00",
                      "#0000ff",
                      "#ffff00",
                      "#ff00ff",
                    ][i % 5],
                  }}
                  initial={{
                    x: 0,
                    y: 0,
                    opacity: 1,
                    scale: 0,
                  }}
                  animate={{
                    x: (Math.random() - 0.5) * 600,
                    y: (Math.random() - 0.5) * 600,
                    opacity: 0,
                    scale: [0, 1, 0],
                    rotate: Math.random() * 360,
                  }}
                  transition={{
                    duration: 2 + Math.random(),
                    ease: "easeOut",
                    repeat: Infinity,
                    repeatDelay: Math.random() * 2,
                  }}
                />
              ))}
            </motion.div>
          )}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-muted-foreground/60 text-xs mt-8 font-serif italic"
        >
          Made with LetterLove
        </motion.p>
      </div>
    </main>
  );
}
