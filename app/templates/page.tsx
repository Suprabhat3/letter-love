"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { templates } from "@/lib/templates";
import { CATEGORIES, TemplateCategory, Template } from "@/lib/types";
import TemplateCard from "@/components/templates/TemplateCard";
import Navbar from "@/components/Navbar";
import {
  Search,
  Sparkles,
  Filter,
  Users,
  X,
  Heart,
  Star,
  Zap,
} from "lucide-react";
import SorryCard from "@/components/templates/SorryCard";
import BirthdayCard from "@/components/templates/BirthdayCard";
import ValentineCard from "@/components/templates/ValentineCard";

const RECIPIENTS = [
  { id: "all", label: "Anyone" },
  { id: "Partner", label: "Partner" },
  { id: "Friend", label: "Friend" },
  { id: "Family", label: "Family" },
  { id: "Spouse", label: "Spouse" },
];

export default function TemplatesPage() {
  const [activeCategory, setActiveCategory] = useState<
    TemplateCategory | "all"
  >("all");
  const [activeRecipient, setActiveRecipient] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

  const featuredTemplate = templates.find((t) => t.id === "valentine-ask");

  const filteredTemplates = templates.filter((template) => {
    // 1. Filter by Category
    const matchesCategory =
      activeCategory === "all" || template.category === activeCategory;

    // 2. Filter by Recipient (via tags)
    const matchesRecipient =
      activeRecipient === "all" || template.tags?.includes(activeRecipient);

    // 3. Filter by Search Query
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags?.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase()),
      );

    return matchesCategory && matchesRecipient && matchesSearch;
  });

  return (
    <main className="min-h-screen relative overflow-hidden bg-background">
      <Navbar />

      {/* Enhanced Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            rotate: [0, 45, 0],
          }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute top-[-10%] left-[-10%] bg-gradient-to-br from-pink-200/40 to-red-200/40 w-[800px] h-[800px] rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3],
            rotate: [0, -30, 0],
          }}
          transition={{ duration: 18, repeat: Infinity, delay: 2 }}
          className="absolute bottom-[-10%] right-[-10%] bg-gradient-to-tr from-purple-200/40 to-blue-200/40 w-[700px] h-[700px] rounded-full blur-3xl"
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] bg-white/40 blur-[100px] rounded-full pointer-events-none" />
      </div>

      <AnimatePresence>
        {previewTemplate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-md"
          >
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => setPreviewTemplate(null)}
              className="absolute top-6 right-6 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-foreground border border-white/20 shadow-lg transition-all"
            >
              <X size={24} />
            </motion.button>

            <div className="w-full h-full overflow-y-auto">
              {previewTemplate.id === "sorry-card" ? (
                <SorryCard
                  data={{
                    recipientName: "Demo Friend",
                    senderName: "You",
                    reason: "forgetting the date",
                    promise: "make it up to you",
                  }}
                />
              ) : previewTemplate.id === "birthday-wish" ? (
                <BirthdayCard
                  data={{
                    recipientName: "Birthday Star",
                    senderName: "You",
                    age: "21",
                    message: "Wishing you the happiest of birthdays!",
                    wish: "Infinite Joy",
                  }}
                />
              ) : previewTemplate.id === "valentine-ask" ? (
                <ValentineCard
                  data={{
                    recipientName: "My Crush",
                    senderName: "Secret Admirer",
                    reason: "You make my heart skip a beat!",
                  }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
                  <div className="text-9xl mb-8 animate-bounce">
                    {previewTemplate.emoji}
                  </div>
                  <h2 className="text-4xl font-serif font-bold mb-4">
                    {previewTemplate.name}
                  </h2>
                  <p className="text-xl text-muted-foreground max-w-md mb-8">
                    {previewTemplate.description}
                  </p>
                  <Link href={`/templates/${previewTemplate.id}`}>
                    <button className="btn-primary px-8 py-4 rounded-full text-lg">
                      Customize Template
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 container mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16 space-y-6 max-w-4xl mx-auto pt-16 relative">
          {/* Decorative Floating Elements */}
          <motion.div
            animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute top-20 left-10 md:left-20 text-4xl opacity-60 hidden md:block"
          >
            💌
          </motion.div>
          <motion.div
            animate={{ y: [0, 15, 0], rotate: [0, -5, 0] }}
            transition={{ duration: 5, repeat: Infinity, delay: 1 }}
            className="absolute top-32 right-10 md:right-20 text-4xl opacity-60 hidden md:block"
          >
            ✨
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 backdrop-blur-md border border-white/50 text-foreground/80 text-sm font-medium mb-4 shadow-sm"
          >
            <Sparkles size={14} className="text-primary" />
            <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent font-semibold">
              AI-Powered Templates
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-serif font-bold tracking-tight text-foreground drop-shadow-sm"
          >
            Find the Perfect <span className="text-gradient italic">Words</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-2xl mx-auto font-serif"
          >
            Browse our collection of handcrafted templates. From romantic
            letters to heartfelt apologies, let AI help you express exactly how
            you feel.
          </motion.p>
        </div>

        {/* Featured Template Banner */}
        {featuredTemplate &&
          !searchQuery &&
          activeCategory === "all" &&
          activeRecipient === "all" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="mb-16 max-w-5xl mx-auto"
            >
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none" />

                <div className="flex flex-col md:flex-row items-center p-8 md:p-12 gap-8 relative z-10">
                  <div className="flex-1 text-center md:text-left space-y-4">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider mb-2 backdrop-blur-sm border border-white/20">
                      <Star size={12} className="fill-current" /> Featured This
                      Week
                    </div>
                    <h2 className="text-3xl md:text-5xl font-serif font-bold">
                      {featuredTemplate.name}
                    </h2>
                    <p className="text-pink-100 text-lg max-w-md mx-auto md:mx-0">
                      {featuredTemplate.description}. Perfect for telling them
                      how much they mean to you.
                    </p>
                    <div className="pt-4 flex flex-wrap gap-4 justify-center md:justify-start">
                      <Link href={`/templates/${featuredTemplate.id}`}>
                        <button className="bg-white text-pink-600 px-8 py-3.5 rounded-full font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2">
                          <Zap size={18} className="fill-current" /> Create Now
                        </button>
                      </Link>
                      <button
                        onClick={() => setPreviewTemplate(featuredTemplate)}
                        className="px-6 py-3.5 rounded-full font-semibold border-2 border-white/30 hover:bg-white/10 transition-all text-white"
                      >
                        Preview Demo
                      </button>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="text-[120px] md:text-[160px] leading-none filter drop-shadow-2xl animate-float">
                      {featuredTemplate.emoji}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        {/* Search and Filters Container */}
        <div className="mb-16 space-y-10 max-w-3xl mx-auto">
          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="relative group z-20"
          >
            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
              <Search size={22} />
            </div>
            <input
              type="text"
              placeholder="Search for 'birthday', 'love', 'apology'..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-16 pr-6 py-5 rounded-full bg-white/70 backdrop-blur-xl border border-white/60 focus:outline-none focus:ring-4 focus:ring-pink-500/10 focus:border-pink-300 transition-all font-medium text-lg text-foreground placeholder:text-muted-foreground/60 shadow-xl shadow-pink-500/5 group-hover:shadow-pink-500/10"
            />
          </motion.div>

          {/* Filter Group */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            {/* Primary: Category Filter */}
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={() => setActiveCategory("all")}
                className={`px-5 py-2.5 rounded-full font-medium transition-all text-sm flex items-center gap-2 border ${
                  activeCategory === "all"
                    ? "bg-foreground text-background border-foreground shadow-lg scale-105"
                    : "bg-white/40 backdrop-blur-sm text-foreground/70 hover:bg-white/80 border-white/50 hover:border-white/80"
                }`}
              >
                All
              </button>
              {CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-5 py-2.5 rounded-full font-medium transition-all text-sm flex items-center gap-2 border active:scale-95 ${
                    activeCategory === category.id
                      ? "bg-white text-primary shadow-lg shadow-pink-200/50 border-pink-200 ring-2 ring-pink-50"
                      : "bg-white/40 backdrop-blur-sm text-foreground/70 hover:bg-white/80 border-white/50 hover:border-white/80 hover:shadow-sm"
                  }`}
                >
                  <span className="text-lg">{category.emoji}</span>{" "}
                  {category.name}
                </button>
              ))}
            </div>

            {/* Secondary: Recipient Filter */}
            <div className="flex justify-center w-full px-4">
              <div className="glass-panel rounded-full p-1.5 pl-4 backdrop-blur-md border border-white/60 shadow-sm flex flex-wrap items-center justify-center gap-1">
                <span className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest flex items-center gap-1.5 mr-2">
                  <Users size={12} /> For:
                </span>
                {RECIPIENTS.map((recipient) => (
                  <button
                    key={recipient.id}
                    onClick={() => setActiveRecipient(recipient.id)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                      activeRecipient === recipient.id
                        ? "bg-pink-100/80 text-pink-700 shadow-sm"
                        : "text-foreground/60 hover:text-foreground hover:bg-white/40"
                    }`}
                  >
                    {recipient.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTemplates.map((template, index) => (
            <TemplateCard
              key={template.id}
              template={template}
              index={index}
              onQuickView={(t) => setPreviewTemplate(t)}
            />
          ))}
        </div>

        {/* Empty state */}
        {filteredTemplates.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-white/20 backdrop-blur-sm rounded-3xl border border-white/30"
          >
            <div className="text-6xl mb-4 opacity-50">🔍</div>
            <h3 className="text-xl font-bold text-foreground mb-2">
              No templates found
            </h3>
            <p className="text-muted-foreground">
              Try adjusting your search or category filter.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setActiveCategory("all");
                setActiveRecipient("all");
              }}
              className="mt-6 text-primary font-medium hover:underline"
            >
              Clear all filters
            </button>
          </motion.div>
        )}

        {/* Footer note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-20"
        >
          <p className="text-muted-foreground/60 text-sm font-serif italic mb-4">
            More templates added weekly • Made with LetterLove 💕
          </p>
        </motion.div>
      </div>
    </main>
  );
}
