"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { templates } from "@/lib/templates";
import { CATEGORIES, TemplateCategory, Template } from "@/lib/types";
import TemplateCard from "@/components/templates/TemplateCard";
import { Search, Sparkles, ArrowLeft, Filter, Users, X } from "lucide-react";
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
        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8 flex justify-between items-center"
        >
          <Link
            href="/"
            className="group inline-flex items-center text-muted-foreground hover:text-primary transition-colors gap-2 font-medium"
          >
            <div className="p-2 rounded-full bg-white/50 group-hover:bg-white transition-colors border border-transparent group-hover:border-white/50 shadow-sm">
              <ArrowLeft size={16} />
            </div>
            <span>Back Home</span>
          </Link>
        </motion.div>

        {/* Header Section */}
        <div className="text-center mb-12 space-y-6 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/40 backdrop-blur-md border border-white/50 text-foreground/80 text-sm font-medium mb-4 shadow-sm"
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
            className="text-5xl md:text-7xl font-serif font-bold tracking-tight text-foreground"
          >
            Find the Perfect <span className="text-gradient italic">Words</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto"
          >
            Browse our collection of handcrafted templates. From romantic
            letters to heartfelt apologies, let AI help you express exactly how
            you feel.
          </motion.p>
        </div>

        {/* Search and Filters Container */}
        <div className="mb-16 space-y-8 max-w-2xl mx-auto">
          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="relative group"
          >
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
              <Search size={22} />
            </div>
            <input
              type="text"
              placeholder="Search for 'birthday', 'love', 'sorry'..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-6 py-5 rounded-2xl bg-white/50 backdrop-blur-xl border border-white/60 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:bg-white/80 transition-all font-medium text-lg text-foreground placeholder:text-muted-foreground/60 shadow-lg shadow-primary/5"
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
                  className={`px-5 py-2.5 rounded-full font-medium transition-all text-sm flex items-center gap-2 border ${
                    activeCategory === category.id
                      ? "bg-white text-primary shadow-lg border-primary/20 scale-105"
                      : "bg-white/40 backdrop-blur-sm text-foreground/70 hover:bg-white/80 border-white/50 hover:border-white/80"
                  }`}
                >
                  <span>{category.emoji}</span> {category.name}
                </button>
              ))}
            </div>

            {/* Secondary: Recipient Filter */}
            <div className="flex justify-center w-full px-4">
              <div className="flex flex-wrap items-center justify-center gap-2 bg-white/30 p-2 pl-4 rounded-3xl backdrop-blur-sm border border-white/40 shadow-sm">
                <span className="text-xs font-semibold text-muted-foreground/80 uppercase tracking-widest flex items-center gap-1.5 mr-1 bg-white/40 px-2 py-1 rounded-md">
                  <Users size={12} /> For
                </span>
                {RECIPIENTS.map((recipient) => (
                  <button
                    key={recipient.id}
                    onClick={() => setActiveRecipient(recipient.id)}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                      activeRecipient === recipient.id
                        ? "bg-white shadow-sm text-primary font-semibold"
                        : "text-foreground/60 hover:text-foreground hover:bg-white/50"
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
