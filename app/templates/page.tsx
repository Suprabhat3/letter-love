"use client";

import { useState } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { templates, getTemplatesByCategory } from "@/lib/templates";
import { CATEGORIES, TemplateCategory } from "@/lib/types";
import TemplateCard from "@/components/templates/TemplateCard";

export default function TemplatesPage() {
  const [activeCategory, setActiveCategory] = useState<
    TemplateCategory | "all"
  >("all");
  const filteredTemplates = getTemplatesByCategory(activeCategory);

  return (
    <main className="min-h-screen relative overflow-hidden bg-background">
      {/* Background blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute top-[-10%] left-[-10%] bg-pink-200/30 w-[600px] h-[600px] rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 12, repeat: Infinity, delay: 2 }}
          className="absolute bottom-[-10%] right-[-10%] bg-purple-200/30 w-[600px] h-[600px] rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10 container mx-auto px-6 py-12">
        {/* Back button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Link
            href="/"
            className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors gap-2 font-medium"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m12 19-7-7 7-7" />
              <path d="M19 12H5" />
            </svg>
            Back Home
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-serif font-bold mb-4">
            Choose Your <span className="text-gradient">Feeling</span>
          </h1>
          <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
            Select a template that matches what you want to express. Each one is
            crafted with love and beautiful animations.
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-6 py-3 rounded-full font-medium transition-all ${
              activeCategory === "all"
                ? "btn-primary shadow-lg"
                : "bg-white/60 backdrop-blur-sm text-foreground/70 hover:bg-white/80 border border-white/50"
            }`}
          >
            ✨ All Templates
          </button>
          {CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-6 py-3 rounded-full font-medium transition-all ${
                activeCategory === category.id
                  ? "btn-primary shadow-lg"
                  : "bg-white/60 backdrop-blur-sm text-foreground/70 hover:bg-white/80 border border-white/50"
              }`}
            >
              {category.emoji} {category.name}
            </button>
          ))}
        </motion.div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template, index) => (
            <TemplateCard key={template.id} template={template} index={index} />
          ))}
        </div>

        {/* Empty state */}
        {filteredTemplates.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className="text-6xl mb-4">🔍</p>
            <p className="text-xl text-foreground/60">
              No templates found in this category yet.
            </p>
          </motion.div>
        )}

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-muted-foreground/60 text-sm mt-16 font-serif italic"
        >
          More templates coming soon • Made with LetterLove 💕
        </motion.p>
      </div>
    </main>
  );
}
