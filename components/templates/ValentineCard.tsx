"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import Image from "next/image";

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

const FONTS = [
  {
    id: "default",
    name: "Classic",
    headerClass: "font-handwriting",
    bodyClass: "font-serif",
  },
  {
    id: "rustic",
    name: "Rustic",
    headerClass: "font-rustic",
    bodyClass: "font-rustic",
  },
  {
    id: "lucy",
    name: "Lucy",
    headerClass: "font-lucy",
    bodyClass: "font-lucy",
  },
  {
    id: "valentine",
    name: "Valentine",
    headerClass: "font-valentine",
    bodyClass: "font-valentine",
  },
  {
    id: "valty",
    name: "Valty",
    headerClass: "font-valty",
    bodyClass: "font-valty",
  },
];

interface ValentineCardProps {
  data: Record<string, string>;
}

export default function ValentineCard({ data }: ValentineCardProps) {
  const [noCount, setNoCount] = useState(0);
  const [isAccepted, setIsAccepted] = useState(false);

  const recipientName = data.recipientName || "My Love";
  const senderName = data.senderName || "Admirer";
  const reason = data.reason || "You make my world brighter every single day.";

  const yesButtonSize = noCount * 20 + 20; // Increases by 20px per 'No' click

  const handleNoClick = () => {
    setNoCount(noCount + 1);
  };

  const getNoText = () => {
    return NO_PHRASES[noCount % NO_PHRASES.length];
  };

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
          className="blob-bg top-[10%] left-[10%] bg-pink-300/40 w-[600px] h-[600px] opacity-40 blur-3xl rounded-full"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="blob-bg bottom-[10%] right-[10%] bg-red-300/40 w-[500px] h-[500px] opacity-40 blur-3xl rounded-full"
        />

        {/* Floating Hearts Animation */}
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: "110vh", x: Math.random() * 100 + "vw", opacity: 0 }}
            animate={{
              y: "-10vh",
              opacity: [0, 0.6, 0],
              rotate: Math.random() * 360,
            }}
            transition={{
              duration: 10 + Math.random() * 10,
              repeat: Infinity,
              delay: Math.random() * 5,
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
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-8xl mb-6 filter drop-shadow-md"
                >
                  💝
                </motion.div>

                <h1
                  className={`text-5xl md:text-6xl text-red-500 mb-2 drop-shadow-sm p-2 ${
                    FONTS.find((f) => f.id === (data.fontName || "default"))
                      ?.headerClass || "font-handwriting"
                  }`}
                >
                  Will you be my Valentine?
                </h1>

                <h2
                  className={`text-xl md:text-2xl font-medium text-foreground/80 mb-6 md:mb-8 ${
                    FONTS.find((f) => f.id === (data.fontName || "default"))
                      ?.headerClass || "font-serif"
                  }`}
                >
                  {recipientName}
                </h2>

                <p
                  className={`text-muted-foreground text-lg mb-8 max-w-sm italic ${
                    FONTS.find((f) => f.id === (data.fontName || "default"))
                      ?.bodyClass || "font-serif"
                  }`}
                >
                  "{reason}"
                </p>

                {/* Interactive Buttons */}
                <div className="flex flex-wrap items-center justify-center gap-6 w-full min-h-[100px] relative">
                  <motion.button
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
                    className="px-6 py-3 rounded-xl bg-gray-100 text-gray-500 font-medium hover:bg-gray-200 transition-colors text-sm whitespace-nowrap z-10"
                    onClick={handleNoClick}
                    // onMouseEnter={handleNoClick} // Moves away/shrinks on desktop hover for fun
                    whileHover={{ x: (Math.random() - 0.5) * 50 }}
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
                  className={`text-6xl text-red-500 mb-6 ${
                    FONTS.find((f) => f.id === (data.fontName || "default"))
                      ?.headerClass || "font-handwriting"
                  }`}
                >
                  Wooohooo!!! 💖
                </h2>

                <p
                  className={`text-xl text-foreground/80 mb-8 max-w-xs mx-auto ${
                    FONTS.find((f) => f.id === (data.fontName || "default"))
                      ?.bodyClass || "font-serif"
                  }`}
                >
                  I knew you'd say yes! <br /> Can't wait for our special day.
                </p>

                <div className="flex flex-col gap-2">
                  <Link href="/templates">
                    <button className="btn-primary px-8 py-3 rounded-full text-lg font-semibold shadow-lg hover:scale-105 transition-transform">
                      Ask Someone Special
                    </button>
                  </Link>
                  <p
                    className={`text-sm text-muted-foreground mt-4 ${
                      FONTS.find((f) => f.id === (data.fontName || "default"))
                        ?.headerClass || "font-serif"
                    }`}
                  >
                    With endless love, <br /> {senderName}
                  </p>
                </div>

                {/* Explosion Confetti */}
                {Array.from({ length: 50 }).map((_, i) => (
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
                      x: (Math.random() - 0.5) * 800,
                      y: (Math.random() - 0.5) * 800,
                      opacity: [1, 1, 0],
                      scale: [0, 1, 0],
                      rotate: Math.random() * 720,
                    }}
                    transition={{
                      duration: 2 + Math.random() * 1.5,
                      ease: "easeOut",
                      repeat: Infinity,
                      repeatDelay: Math.random() * 3,
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
          className={`text-center text-muted-foreground/60 text-xs mt-8 italic ${
            FONTS.find((f) => f.id === (data.fontName || "default"))
              ?.bodyClass || "font-serif"
          }`}
        >
          Made with LetterLove
        </motion.p>
      </div>
    </main>
  );
}
