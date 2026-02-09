"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import Script from "next/script";

interface BirthdayCardProps {
  data: Record<string, string>;
}

export default function BirthdayCard({ data }: BirthdayCardProps) {
  const [candlesBlown, setCandlesBlown] = useState(false);
  const [showMessage, setShowMessage] = useState(false);

  const recipientName = data.recipientName || "Friend";
  const senderName = data.senderName || "Your Friend";
  const age = data.age;
  const message = data.message || "Wishing you a wonderful day!";
  const wish = data.wish;

  // Generate random balloons
  const balloons = Array.from({ length: 15 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 5,
    color: ["#ff718d", "#fdb66d", "#71e5ff", "#9d71ff", "#ffeb71"][i % 5],
  }));

  const handleBlowCandles = () => {
    if (candlesBlown) return;
    setCandlesBlown(true);

    // Delay for the smoke/magic effect before showing the message
    setTimeout(() => {
      setShowMessage(true);
    }, 1500);
  };

  return (
    <main className="min-h-screen relative flex items-center justify-center overflow-hidden bg-background p-6">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute top-[-10%] left-[-10%] bg-blue-300/30 w-[600px] h-[600px] rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 12, repeat: Infinity, delay: 2 }}
          className="absolute bottom-[-10%] right-[-10%] bg-purple-300/30 w-[600px] h-[600px] rounded-full blur-3xl"
        />
      </div>

      {/* Floating Balloons */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {balloons.map((b) => (
          <motion.div
            key={b.id}
            initial={{ y: "110vh", x: `${b.x}vw` }}
            animate={{ y: "-20vh" }}
            transition={{
              duration: 15 + Math.random() * 10,
              repeat: Infinity,
              delay: b.delay,
              ease: "linear",
            }}
            className="absolute text-6xl opacity-60"
            style={{
              left: `${b.x}%`,
              filter: `drop-shadow(0 4px 6px ${b.color})`,
            }}
          >
            <div style={{ color: b.color }} className="relative">
              🎈
              <div
                className="absolute top-full left-1/2 w-[1px] h-12 bg-gray-400/50 -translate-x-1/2"
                style={{ transformOrigin: "top" }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="z-10 w-full max-w-lg relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel min-h-[500px] p-8 rounded-3xl text-center relative overflow-hidden border-white/60 shadow-2xl flex flex-col items-center justify-center"
        >
          {/* Decorative shine */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/50 via-transparent to-transparent pointer-events-none rounded-3xl" />

          <AnimatePresence mode="wait">
            {!showMessage ? (
              <motion.div
                key="cake-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex flex-col items-center z-10"
              >
                <motion.h1
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="font-handwriting text-5xl text-foreground mb-4"
                >
                  Make a Wish!
                </motion.h1>
                <p className="text-muted-foreground mb-12 font-serif italic">
                  Tap the cake to blow out the candles
                </p>

                {/* Interactive Cake */}
                <motion.div
                  className="relative cursor-pointer group"
                  onClick={handleBlowCandles}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="text-[150px] leading-none select-none relative z-10">
                    🎂
                  </div>

                  {/* Flames */}
                  {!candlesBlown && (
                    <div className="absolute top-[25px] left-1/2 -translate-x-1/2 flex gap-4 w-[60px] justify-center">
                      {[1, 2, 3].map((i) => (
                        <motion.div
                          key={i}
                          animate={{
                            scale: [1, 1.2, 1],
                            rotate: [-5, 5, -5],
                          }}
                          transition={{
                            duration: 0.5,
                            repeat: Infinity,
                            delay: i * 0.1,
                          }}
                          className="w-4 h-6 bg-orange-400 rounded-full blur-[2px] absolute"
                          style={{
                            left: i === 1 ? "5px" : i === 2 ? "22px" : "40px",
                            top: i === 2 ? "-5px" : "0px",
                            boxShadow: "0 0 10px #f97316, 0 0 20px #fbbf24",
                          }}
                        />
                      ))}
                    </div>
                  )}

                  {/* Smoke Effect when blown */}
                  {candlesBlown && (
                    <motion.div
                      initial={{ opacity: 0, y: 0 }}
                      animate={{
                        opacity: [0, 1, 0],
                        y: -50,
                        x: [0, 10, -10, 0],
                      }}
                      transition={{ duration: 1.5 }}
                      className="absolute top-0 left-1/2 -translate-x-1/2 text-4xl"
                    >
                      💨
                    </motion.div>
                  )}

                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-40 h-8 bg-black/10 rounded-[100%] blur-md z-0 group-hover:w-48 transition-all duration-300" />
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="msg-view"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center z-10 w-full"
              >
                <div className="mb-6 relative w-full max-w-[280px]">
                  <div
                    className="tenor-gif-embed"
                    data-postid="26751018"
                    data-share-method="host"
                    data-aspect-ratio="1"
                    data-width="100%"
                  >
                    <a href="https://tenor.com/view/happy-birthday-gif-26751018">
                      Happy Birthday GIF
                    </a>
                    from{" "}
                    <a href="https://tenor.com/search/happy+birthday-gifs">
                      Happy Birthday GIFs
                    </a>
                  </div>
                  <Script
                    type="text/javascript"
                    async
                    src="https://tenor.com/embed.js"
                  />
                  {age && (
                    <span className="absolute -bottom-2 -right-2 bg-pink-500 text-white text-lg font-bold px-2 py-1 rounded-full shadow-md rotate-12">
                      {age}
                    </span>
                  )}
                </div>

                <h1 className="font-handwriting text-5xl md:text-6xl text-gradient mb-2 leading-tight py-2">
                  Happy Birthday
                </h1>
                <h2 className="font-serif text-2xl text-foreground.80 mb-6">
                  {recipientName}!
                </h2>

                <p className="text-xl text-foreground/80 font-serif mb-6 max-w-xs mx-auto leading-relaxed">
                  {message}
                </p>

                {wish && (
                  <div className="bg-white/40 p-4 rounded-xl mb-8 w-full max-w-xs mx-auto backdrop-blur-sm">
                    <p className="text-sm text-foreground/60 uppercase tracking-widest text-[10px] mb-1">
                      A Special Wish
                    </p>
                    <p className="text-lg font-medium text-pink-600 font-handwriting">
                      "{wish}"
                    </p>
                  </div>
                )}

                <div className="flex gap-4 mt-2">
                  <Link href="/templates">
                    <button className="btn-primary px-8 py-3 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                      Send One Too
                    </button>
                  </Link>
                  <button
                    onClick={() => {
                      setCandlesBlown(false);
                      setShowMessage(false);
                    }}
                    className="bg-white/50 hover:bg-white/80 text-foreground px-6 py-3 rounded-full font-medium transition-all backdrop-blur-sm shadow-sm hover:scale-105"
                  >
                    Replay
                  </button>
                </div>

                <p className="text-sm text-muted-foreground mt-6 font-serif">
                  — {senderName}
                </p>

                {/* Confetti Particles */}
                {Array.from({ length: 40 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute top-1/2 left-1/2 w-3 h-3 rounded-sm pointer-events-none"
                    style={{
                      backgroundColor: [
                        "#ff0000",
                        "#00ff00",
                        "#0000ff",
                        "#ffff00",
                        "#ff00ff",
                      ][i % 5],
                    }}
                    initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
                    animate={{
                      x: (Math.random() - 0.5) * 800,
                      y: (Math.random() - 0.5) * 800,
                      opacity: [1, 1, 0],
                      scale: [0, 1, 0],
                      rotate: Math.random() * 720,
                    }}
                    transition={{
                      duration: 2 + Math.random() * 2,
                      ease: "easeOut",
                      repeat: Infinity,
                      repeatDelay: Math.random() * 3,
                      delay: 0.5,
                    }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <p className="text-center text-muted-foreground/40 text-xs mt-8 font-serif italic">
          Make a Wish • Blow the Candles
        </p>
      </div>
    </main>
  );
}
