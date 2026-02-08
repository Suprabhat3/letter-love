"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { getTemplateById } from "@/lib/templates";
import { createCard } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { CATEGORIES } from "@/lib/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

import { Sparkles } from "lucide-react";

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
      router.push(`/share/${result.id}`);
    } catch {
      setError("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen relative overflow-hidden bg-background">
      {/* Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full blur-3xl"
          style={{ backgroundColor: `${template.colors.secondary}60` }}
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 12, repeat: Infinity, delay: 2 }}
          className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full blur-3xl"
          style={{ backgroundColor: `${template.colors.primary}40` }}
        />
      </div>

      {/* Demo Preview Modal */}
      <AnimatePresence>
        {showDemoPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-6"
            onClick={() => setShowDemoPreview(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="glass-panel p-8 rounded-3xl text-center relative overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, rgba(255,255,255,0.9) 0%, ${template.colors.secondary}40 100%)`,
                }}
              >
                {/* Demo badge */}
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 bg-amber-400 text-amber-900 text-xs font-bold rounded-full">
                    DEMO PREVIEW
                  </span>
                </div>

                <motion.div
                  className="text-7xl mb-6 filter drop-shadow-lg"
                  animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  {template.emoji}
                </motion.div>

                <h3
                  className="font-handwriting text-5xl mb-4"
                  style={{ color: template.colors.primary }}
                >
                  {formData.recipientName || "My Dear"}
                </h3>

                <p className="text-foreground/80 font-serif text-lg leading-relaxed mb-6 max-w-sm mx-auto">
                  {formData.message || formData.reason || template.previewText}
                </p>

                {(formData.memory || formData.promise) && (
                  <p className="text-foreground/60 text-sm italic border-t border-foreground/10 pt-4 mb-4">
                    "{formData.memory || formData.promise}"
                  </p>
                )}

                <p className="text-foreground/50 font-serif">
                  — {formData.senderName || "With Love"}
                </p>

                <div className="mt-8 space-y-3">
                  {user ? (
                    <button
                      onClick={(e) => {
                        setShowDemoPreview(false);
                        handleSubmit(e as any);
                      }}
                      className="w-full py-3 rounded-xl text-white font-semibold"
                      style={{
                        background: `linear-gradient(135deg, ${template.colors.primary} 0%, ${template.colors.accent} 100%)`,
                      }}
                    >
                      Save & Get Shareable Link ✨
                    </button>
                  ) : (
                    <Link
                      href="/auth"
                      className="block w-full py-3 rounded-xl text-white font-semibold text-center"
                      style={{
                        background: `linear-gradient(135deg, ${template.colors.primary} 0%, ${template.colors.accent} 100%)`,
                      }}
                    >
                      Login to Save & Share 💕
                    </Link>
                  )}
                  <button
                    onClick={() => setShowDemoPreview(false)}
                    className="w-full py-3 rounded-xl bg-white/60 text-foreground/70 font-medium"
                  >
                    Continue Editing
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 container mx-auto px-6 py-12">
        {/* Back button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8 flex justify-between items-center"
        >
          <Link
            href="/templates"
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
            Back to Templates
          </Link>

          {/* Auth status */}
          {!authLoading &&
            (user ? (
              <Link
                href="/dashboard"
                className="text-sm text-foreground/60 hover:text-primary"
              >
                My Cards →
              </Link>
            ) : (
              <Link
                href="/auth"
                className="text-sm text-pink-500 font-medium hover:text-pink-600"
              >
                Login to Save 💕
              </Link>
            ))}
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <span
            className="px-4 py-2 rounded-full text-sm font-medium mb-4 inline-block"
            style={{
              backgroundColor: `${template.colors.primary}20`,
              color: template.colors.accent,
            }}
          >
            {category?.emoji} {category?.name}
          </span>
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
            Create Your{" "}
            <span style={{ color: template.colors.primary }}>
              {template.name}
            </span>
          </h1>
          <p className="text-lg text-foreground/70 max-w-xl mx-auto">
            {template.description}
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
              className="glass-panel p-8 rounded-3xl"
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
                        className="w-full px-4 py-3 rounded-xl bg-white/60 border border-white/80 focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all"
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
            className="lg:sticky lg:top-8 self-start"
          >
            <div
              className="glass-panel p-8 rounded-3xl relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${template.colors.secondary}30 0%, ${template.colors.primary}10 100%)`,
              }}
            >
              <div
                className="absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl opacity-30"
                style={{ backgroundColor: template.colors.primary }}
              />

              <h2 className="text-xl font-medium text-foreground/60 mb-6">
                Live Preview
              </h2>

              <div className="relative z-10 text-center py-8">
                <motion.div
                  className="text-7xl mb-6 filter drop-shadow-lg"
                  animate={{ scale: [1, 1.05, 1], rotate: [0, 2, -2, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  {template.emoji}
                </motion.div>

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
