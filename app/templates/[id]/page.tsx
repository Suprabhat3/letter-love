"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import { getTemplateById } from "@/lib/templates";
import { createCard } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { CATEGORIES } from "@/lib/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

import ShareModal from "@/components/ShareModal";
import { Sparkles, ArrowLeft, User, LayoutGrid } from "lucide-react";

export default function TemplateEditorPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const template = getTemplateById(id);

  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDemoPreview, setShowDemoPreview] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState<string | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [createdCardLink, setCreatedCardLink] = useState("");

  const handleAiEnhance = async (fieldName: string, currentValue: string) => {
    if (!currentValue?.trim()) return;

    setIsEnhancing(fieldName);
    try {
      const response = await fetch("/api/ai/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: currentValue,
          fieldType: fieldName,
          templateName: template?.name,
          templateDescription: template?.description,
          tone: "Emotional and sincere",
        }),
      });

      const data = await response.json();
      if (data.text) {
        handleInputChange(fieldName, data.text);
      }
    } catch (err) {
      console.error("AI Enhance failed", err);
    } finally {
      setIsEnhancing(null);
    }
  };

  if (!template) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-6xl mb-4">😕</p>
          <h1 className="text-2xl font-serif font-bold mb-4">
            Template Not Found
          </h1>
          <Link
            href="/templates"
            className="btn-primary px-6 py-3 rounded-full"
          >
            Browse Templates
          </Link>
        </div>
      </main>
    );
  }

  const category = CATEGORIES.find((c) => c.id === template.category);

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const missingFields = template.fields
      .filter((f) => f.required && !formData[f.name]?.trim())
      .map((f) => f.label);
    return missingFields;
  };

  const handleDemoPreview = () => {
    const missing = validateForm();
    if (missing.length > 0) {
      setError(`Please fill in: ${missing.join(", ")}`);
      return;
    }
    setError(null);
    setShowDemoPreview(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      router.push("/auth");
      return;
    }

    const missing = validateForm();
    if (missing.length > 0) {
      setError(`Please fill in: ${missing.join(", ")}`);
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createCard(template.id, formData, user.id);
      if ("error" in result) {
        setError(result.error);
        setIsSubmitting(false);
        return;
      }

      const shareUrl = `${window.location.origin}/share/${result.id}`;
      setCreatedCardLink(shareUrl);
      setShareModalOpen(true);
      // Wait for user to close modal to navigate
    } catch {
      setError("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen relative overflow-hidden bg-background">
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => router.push("/dashboard")}
        shareUrl={createdCardLink}
      />

      <div className="relative z-10 container mx-auto px-4 md:px-6 py-6 md:py-6">
        {/* Top Navigation */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 flex justify-between items-center"
        >
          <Link
            href="/templates"
            className="group flex items-center gap-2 px-4 py-2 md:px-5 md:py-2.5 rounded-full bg-white/40 backdrop-blur-md border border-white/50 shadow-sm hover:bg-white/60 hover:shadow-md transition-all text-foreground/80 font-medium text-sm md:text-base"
          >
            <ArrowLeft
              size={18}
              className="group-hover:-translate-x-1 transition-transform"
            />
            <span className="hidden md:inline">Back to Templates</span>
            <span className="inline md:hidden">Back</span>
          </Link>

          {/* Auth / My Cards */}
          {!authLoading &&
            (user ? (
              <Link
                href="/dashboard"
                className="group flex items-center gap-2 px-4 py-2 md:px-5 md:py-2.5 rounded-full bg-white/40 backdrop-blur-md border border-white/50 shadow-sm hover:bg-white/60 hover:shadow-md transition-all text-foreground/80 font-medium text-sm md:text-base"
              >
                <LayoutGrid size={18} />
                <span>My Cards</span>
                <ArrowLeft
                  size={16}
                  className="rotate-180 group-hover:translate-x-1 transition-transform opacity-50 hidden md:block"
                />
              </Link>
            ) : (
              <Link
                href="/auth"
                className="group flex items-center gap-2 px-4 py-2 md:px-5 md:py-2.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg hover:shadow-pink-500/25 hover:scale-105 transition-all font-medium text-sm md:text-base"
              >
                <User size={18} />
                <span>
                  Login<span className="hidden md:inline"> to Save</span>
                </span>
              </Link>
            ))}
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12 max-w-3xl mx-auto"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="w-20 h-20 mx-auto mb-6 text-6xl flex items-center justify-center bg-white rounded-full shadow-lg border-2"
            style={{ borderColor: template.colors.secondary }}
          >
            {template.emoji}
          </motion.div>

          <span
            className="px-4 py-1.5 rounded-full text-sm font-bold tracking-wide uppercase mb-6 inline-block bg-white/50 backdrop-blur-sm border border-white/60 shadow-sm"
            style={{
              color: template.colors.primary,
            }}
          >
            {category?.name} Template
          </span>
          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-4 text-foreground">
            Create Your{" "}
            <span
              className="italic relative inline-block"
              style={{ color: template.colors.primary }}
            >
              {template.name}
              <svg
                className="absolute w-full h-3 -bottom-1 left-0 opacity-40"
                viewBox="0 0 100 10"
                preserveAspectRatio="none"
              >
                <path
                  d="M0 5 Q 50 10 100 5"
                  stroke={template.colors.secondary}
                  strokeWidth="3"
                  fill="none"
                />
              </svg>
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            {template.description}. Fill in the details below to generate a
            beautiful, personalized card.
          </p>
        </motion.div>

        {/* Main content */}
        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <form
              onSubmit={handleSubmit}
              className="glass-panel p-8 md:p-10 rounded-3xl border border-white/60 shadow-xl bg-white/40 backdrop-blur-xl"
            >
              <h2 className="text-2xl font-serif font-bold mb-6 flex items-center gap-3">
                <span className="text-3xl">{template.emoji}</span>
                Fill in the Details
              </h2>

              <div className="space-y-5">
                {template.fields.map((field) => (
                  <div key={field.name} className="relative group">
                    <label className="block text-sm font-medium text-foreground/80 mb-2">
                      {field.label}
                      {field.required && (
                        <span className="text-pink-500 ml-1">*</span>
                      )}
                    </label>

                    {field.type === "textarea" ? (
                      <div className="relative">
                        <textarea
                          placeholder={field.placeholder}
                          value={formData[field.name] || ""}
                          onChange={(e) =>
                            handleInputChange(field.name, e.target.value)
                          }
                          className="w-full px-4 py-3 rounded-xl bg-white/60 border border-white/80 focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all resize-none pr-12"
                          style={{ minHeight: "120px" }}
                        />
                        {/* AI Enhance Button */}
                        <motion.button
                          type="button"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{
                            opacity: formData[field.name] ? 1 : 0,
                            scale: formData[field.name] ? 1 : 0.8,
                            pointerEvents: formData[field.name]
                              ? "auto"
                              : "none",
                          }}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() =>
                            handleAiEnhance(field.name, formData[field.name])
                          }
                          className="absolute bottom-3 right-3 p-2 rounded-full bg-white/90 shadow-sm text-pink-500 hover:text-pink-600 hover:shadow-md border border-pink-100 transition-colors z-10"
                          title="Enhance with AI ✨"
                        >
                          {isEnhancing === field.name ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{
                                duration: 1,
                                repeat: Infinity,
                                ease: "linear",
                              }}
                            >
                              ✨
                            </motion.div>
                          ) : (
                            <Sparkles size={16} />
                          )}
                        </motion.button>
                      </div>
                    ) : (
                      <input
                        type="text"
                        placeholder={field.placeholder}
                        value={formData[field.name] || ""}
                        onChange={(e) =>
                          handleInputChange(field.name, e.target.value)
                        }
                        className="w-full px-5 py-4 rounded-xl bg-white/50 border border-white/60 focus:outline-none focus:ring-4 focus:ring-pink-500/10 focus:border-pink-300 transition-all text-lg placeholder:text-muted-foreground/50 shadow-sm"
                      />
                    )}
                  </div>
                ))}
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-sm mt-4 p-3 bg-red-50 rounded-lg"
                >
                  {error}
                </motion.p>
              )}

              {/* Action buttons */}
              <div className="mt-6 space-y-3">
                {/* Demo Preview button - always available */}
                <motion.button
                  type="button"
                  onClick={handleDemoPreview}
                  className="w-full py-4 rounded-xl text-lg font-semibold bg-white border-2 transition-all"
                  style={{
                    borderColor: template.colors.primary,
                    color: template.colors.primary,
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  👁️ Preview Demo
                </motion.button>

                {/* Save button */}
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-xl text-lg font-semibold text-white shadow-lg transition-all disabled:opacity-50"
                  style={{
                    background: `linear-gradient(135deg, ${template.colors.primary} 0%, ${template.colors.accent} 100%)`,
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      >
                        ⏳
                      </motion.span>
                      Creating...
                    </span>
                  ) : user ? (
                    "Save & Get Shareable Link ✨"
                  ) : (
                    "Login to Save & Share 💕"
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>

          {/* Live Preview */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:sticky lg:top-24 self-start"
          >
            <div
              className="glass-panel p-8 md:p-12 rounded-3xl relative overflow-hidden border border-white/60 shadow-2xl"
              style={{
                background: `linear-gradient(135deg, rgba(255,255,255,0.8) 0%, ${template.colors.secondary}40 100%)`,
              }}
            >
              <div className="absolute top-4 right-4 z-20">
                <span className="px-3 py-1 bg-black/5 text-foreground/60 text-[10px] font-bold tracking-widest uppercase rounded-full border border-black/5">
                  Live Preview
                </span>
              </div>

              <div
                className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-40 pointer-events-none"
                style={{ backgroundColor: template.colors.primary }}
              />

              {/* Card Content Container */}
              <div className="relative z-10 text-center py-4">
                {template.id === "love-letter" ? (
                  <div className="mb-6 relative w-full max-w-[280px] mx-auto">
                    <Image
                      src="https://media1.tenor.com/m/HI7GdDJ1yq0AAAAC/us-you-and-me.gif"
                      alt="Us You And Me Sticker"
                      width={280}
                      height={280}
                      className="w-full h-auto rounded-lg"
                      unoptimized
                    />
                  </div>
                ) : template.id === "miss-you" ? (
                  <div className="mb-6 relative w-full max-w-[280px] mx-auto">
                    <Image
                      src="https://media1.tenor.com/m/rzG9YBjxW-0AAAAC/peach-sad.gif"
                      alt="Peach Sad GIF"
                      width={280}
                      height={280}
                      className="w-full h-auto rounded-lg"
                      unoptimized
                    />
                  </div>
                ) : template.id === "anniversary" ? (
                  <div className="mb-6 relative w-full max-w-[280px] overflow-hidden rounded-xl mx-auto">
                    <Image
                      src="https://media1.tenor.com/m/K6WkauZF1ToAAAAC/happy-valentines-day-valentines-day.gif"
                      alt="Happy Valentines Day Hugs Sticker"
                      width={280}
                      height={280}
                      className="w-full h-auto object-contain"
                      unoptimized
                    />
                  </div>
                ) : (
                  <motion.div
                    className="text-7xl mb-6 filter drop-shadow-lg"
                    animate={{ scale: [1, 1.05, 1], rotate: [0, 2, -2, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    {template.emoji}
                  </motion.div>
                )}

                <h3
                  className="font-handwriting text-4xl mb-4"
                  style={{ color: template.colors.primary }}
                >
                  {formData.recipientName || template.fields[0].placeholder}
                </h3>

                <p className="text-foreground/80 font-serif text-lg leading-relaxed mb-6 max-w-sm mx-auto">
                  {formData.message || formData.reason || template.previewText}
                </p>

                {(formData.memory || formData.promise) && (
                  <p className="text-foreground/60 text-sm italic border-t border-foreground/10 pt-4">
                    "{formData.memory || formData.promise}"
                  </p>
                )}

                <p className="text-foreground/50 mt-6 font-serif">
                  — {formData.senderName || template.fields[1].placeholder}
                </p>
              </div>

              <div className="text-center pt-4 border-t border-foreground/10">
                <p className="text-xs text-foreground/40 font-serif italic">
                  Made with LetterLove 💕
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
