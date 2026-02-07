"use client";

import { use, useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { getCard } from "@/lib/supabase";
import { getTemplateById } from "@/lib/templates";
import { SharedCard, Template, CATEGORIES } from "@/lib/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function SharePage({ params }: PageProps) {
  const { id } = use(params);
  const [card, setCard] = useState<SharedCard | null>(null);
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    async function loadCard() {
      const cardData = await getCard(id);
      if (cardData) {
        setCard(cardData);
        const tmpl = getTemplateById(cardData.template_id);
        setTemplate(tmpl || null);
      }
      setLoading(false);

      // Delay showing content for entrance animation
      setTimeout(() => setShowContent(true), 500);
    }
    loadCard();
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="text-6xl"
        >
          💕
        </motion.div>
      </main>
    );
  }

  if (!card || !template) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel p-12 rounded-3xl text-center max-w-md"
        >
          <p className="text-6xl mb-6">😕</p>
          <h1 className="text-2xl font-serif font-bold mb-4">Card Not Found</h1>
          <p className="text-foreground/70 mb-8">
            This card may have expired or the link is incorrect.
          </p>
          <Link
            href="/templates"
            className="btn-primary px-8 py-4 rounded-full inline-block font-semibold"
          >
            Create Your Own 💕
          </Link>
        </motion.div>
      </main>
    );
  }

  const category = CATEGORIES.find((c) => c.id === template.category);
  const data = card.data;

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

      <div className="z-10 w-full max-w-lg relative">
        <AnimatePresence>
          {showContent && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 100 }}
              className="glass-panel p-8 md:p-12 rounded-3xl text-center relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, rgba(255,255,255,0.8) 0%, ${template.colors.secondary}30 100%)`,
              }}
            >
              {/* Decorative shine */}
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/60 via-transparent to-transparent pointer-events-none rounded-3xl" />

              {/* Category badge */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="relative z-10 mb-6"
              >
                <span
                  className="px-4 py-2 rounded-full text-sm font-medium inline-block"
                  style={{
                    backgroundColor: `${template.colors.primary}20`,
                    color: template.colors.accent,
                  }}
                >
                  {category?.emoji} {category?.name}
                </span>
              </motion.div>

              {/* Main emoji */}
              <motion.div
                className="text-8xl mb-8 filter drop-shadow-lg relative z-10"
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                {template.emoji}
              </motion.div>

              {/* Recipient name */}
              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="font-handwriting text-5xl md:text-6xl mb-4 relative z-10"
                style={{ color: template.colors.primary }}
              >
                {data.recipientName || "My Dear"}
              </motion.h1>

              {/* Pet name if exists */}
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

              {/* Main message */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-lg md:text-xl text-foreground/80 font-serif leading-relaxed mb-8 relative z-10 max-w-md mx-auto"
              >
                {data.message || data.reason || template.previewText}
              </motion.p>

              {/* Memory / Promise section */}
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

              {/* Years together (for anniversary) */}
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

              {/* Special wish (for birthday) */}
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

              {/* Sender */}
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
          className="text-center mt-8"
        >
          <Link
            href="/templates"
            className="btn-primary px-8 py-4 rounded-full inline-block font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            Create Your Own Card 💕
          </Link>
          <p className="text-muted-foreground/50 text-xs mt-4 font-serif italic">
            Made with LetterLove
          </p>
        </motion.div>
      </div>
    </main>
  );
}
