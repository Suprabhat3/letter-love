"use client";

import { useState, useEffect, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import Link from "next/link";
import { getTemplateById } from "@/lib/templates";
import { getCard } from "@/lib/supabase";
import { createCard, updateCard } from "@/lib/cards-client";
import { useAuth } from "@/lib/auth-context";
import { CATEGORIES } from "@/lib/types";
import { FONTS, FontId } from "@/lib/fonts";
import {
  CardStyle,
  readCardContent,
  readCardStyle,
  writeCardData,
} from "@/lib/cardStyle";
import { track } from "@/lib/analytics";
import { fetchReplyContext } from "@/lib/engagement-client";
import { enhanceField } from "@/lib/ai/browser";
import { TONES, ToneId, defaultToneForTemplate } from "@/lib/tones";
import CardPreview, { demoContent } from "@/components/card/CardPreview";
import MemoryInterview from "@/components/MemoryInterview";
import ShareModal from "@/components/ShareModal";
import { Sparkles, ArrowLeft, User, LayoutGrid, Type, Wand2 } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

// Bumped from v1: pre-split drafts were a flat object mixing `fontName` into
// the content fields, so an old draft would restore into the wrong shape.
const draftKey = (id: string) => `template-draft-v2-${id}`;

interface Draft {
  content: Record<string, string>;
  font: FontId;
}

function readDraft(id: string): Draft | null {
  if (typeof window === "undefined") return null;
  try {
    const saved = sessionStorage.getItem(draftKey(id));
    if (!saved) return null;
    const parsed = JSON.parse(saved) as Partial<Draft>;
    return {
      content: parsed.content ?? {},
      font: parsed.font ?? "default",
    };
  } catch {
    return null;
  }
}

export default function TemplateEditorPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("editId");
  const replyTo = searchParams.get("replyTo");
  const { user, loading: authLoading } = useAuth();
  const template = getTemplateById(id);

  const [formData, setFormData] = useState<Record<string, string>>(
    () => readDraft(id)?.content ?? {},
  );
  // Style is held separately from content so it can never collide with a
  // template field name, and is persisted under the namespaced `_style` slot.
  const [font, setFont] = useState<FontId>(() => readDraft(id)?.font ?? "default");
  // New cards arrive sealed. Editing an existing card keeps whatever it was
  // stored with, so a link already sitting in someone's chat does not change
  // behaviour underneath them.
  const [envelope, setEnvelope] = useState(true);

  // The tone every AI call uses. It opens on something appropriate to the
  // template — an apology card defaulting to "Romantic" reads as the product
  // not paying attention, and most people never touch the chips.
  const [tone, setTone] = useState<ToneId>(() =>
    defaultToneForTemplate(template?.category),
  );
  const [interviewOpen, setInterviewOpen] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEnhancing, setIsEnhancing] = useState<string | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [createdCardLink, setCreatedCardLink] = useState("");
  /** Who this letter answers, when arriving from a "Reply with a letter" button. */
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  useEffect(() => {
    track("editor_start", { template: id });
  }, [id]);

  // Clear the auth-redirect draft once the user is back and signed in.
  useEffect(() => {
    if (user && !editId) {
      sessionStorage.removeItem(draftKey(id));
    }
  }, [user, id, editId]);

  // Load existing card data if editing
  useEffect(() => {
    async function loadCardData() {
      if (!editId) return;

      try {
        const card = await getCard(editId);
        if (card?.data) {
          // Must split: assigning the raw row to formData would pull `_style`
          // into the form, re-save it nested inside itself, and render the
          // object as a text field.
          setFormData(readCardContent(card.data));
          const stored = readCardStyle(card.data);
          setFont(stored.font);
          setEnvelope(stored.envelope.enabled);
        }
      } catch (err) {
        console.error("Failed to load card for editing:", err);
        setError("Couldn't load this card for editing.");
      }
    }

    loadCardData();
  }, [editId]);

  // Prefill a reply from the letter it answers.
  //
  // The two names are swapped: the person who wrote to you becomes the
  // recipient, and you become the sender. They are fetched by card id rather
  // than passed in the URL on purpose — a query string carrying names is a
  // link anyone could craft to put arbitrary text into someone's editor, and
  // the route deliberately returns nothing but those two names.
  useEffect(() => {
    if (!replyTo || editId) return;
    let cancelled = false;

    fetchReplyContext(replyTo).then((context) => {
      if (cancelled || !context) return;
      setReplyingTo(context.replyToSender || null);
      setFormData((prev) => ({
        ...prev,
        // Never clobber something already typed — a restored draft wins.
        recipientName: prev.recipientName?.trim() || context.replyToSender,
        senderName: prev.senderName?.trim() || context.replyToRecipient,
      }));
    });

    return () => {
      cancelled = true;
    };
  }, [replyTo, editId]);

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAiEnhance = async (fieldName: string, currentValue: string) => {
    if (!currentValue?.trim() || !template) return;

    track("ai_enhance_click", { template: template.id, field: fieldName, tone });
    setIsEnhancing(fieldName);
    setError(null);

    // Only the template *id* is sent. The route looks the name and description
    // up server-side — accepting those as strings let a crafted request rewrite
    // the system prompt.
    const result = await enhanceField({
      prompt: currentValue,
      fieldType: fieldName,
      templateId: template.id,
      tone,
    });
    setIsEnhancing(null);

    if ("error" in result) {
      setError(result.error);
      return;
    }
    handleInputChange(fieldName, result.text);
  };

  if (!template) {
    return (
      <main className="min-h-svh flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-6xl mb-4">😕</p>
          <h1 className="text-2xl font-serif font-bold mb-4">
            Template Not Found
          </h1>
          <Link href="/templates" className="btn-primary px-6 py-3 rounded-full">
            Browse Templates
          </Link>
        </div>
      </main>
    );
  }

  const category = CATEGORIES.find((c) => c.id === template.category);

  // Where a generated letter lands: the first required textarea, falling back
  // to any textarea. Every template has one; if one ever doesn't, the
  // interview button simply doesn't render rather than dropping the letter.
  const letterField =
    template.fields.find((f) => f.type === "textarea" && f.required)?.name ??
    template.fields.find((f) => f.type === "textarea")?.name;

  // Empty fields fall back to their placeholder, so the preview is a whole
  // card from the first paint rather than a scaffold that fills in as you type.
  const previewContent: Record<string, string> = demoContent(template);
  for (const [key, value] of Object.entries(formData)) {
    if (value.trim()) previewContent[key] = value;
  }

  const validateForm = () => {
    return template.fields
      .filter((f) => f.required && !formData[f.name]?.trim())
      .map((f) => f.label);
  };

  const saveDraft = () => {
    sessionStorage.setItem(
      draftKey(id),
      JSON.stringify({ content: formData, font } satisfies Draft),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // No login gate here any more. Writing a whole letter and only then being
    // bounced to /auth was the biggest leak in the funnel; the card is created
    // anonymously and the signup ask comes after the share succeeds, when it
    // reads as a benefit rather than a toll.
    const missing = validateForm();
    if (missing.length > 0) {
      setError(`Please fill in: ${missing.join(", ")}`);
      return;
    }

    setIsSubmitting(true);

    const style: CardStyle = { font, envelope: { enabled: envelope } };
    const payload = writeCardData(formData, style);

    try {
      let resultId = "";

      if (editId) {
        const result = await updateCard(editId, payload);
        if ("error" in result) {
          setError(result.error);
          setIsSubmitting(false);
          return;
        }
        resultId = editId;
      } else {
        const result = await createCard(template.id, payload, replyTo);
        if ("error" in result) {
          setError(result.error);
          setIsSubmitting(false);
          return;
        }
        resultId = result.id;
      }

      track("card_created", { template: template.id, edit: Boolean(editId) });
      setCreatedCardLink(`${window.location.origin}/share/${resultId}`);
      setShareModalOpen(true);
      setIsSubmitting(false);
      // Navigation happens when the user closes the share modal.
    } catch {
      setError("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-svh relative overflow-hidden bg-background">
      <ShareModal
        isOpen={shareModalOpen}
        // Signing up is offered once the link exists, so it buys something
        // concrete — keeping the card, and seeing when it gets opened.
        onClose={() =>
          router.push(user ? "/dashboard" : "/auth?redirect=%2Fdashboard")
        }
        shareUrl={createdCardLink}
      />

      {letterField && interviewOpen && (
        <MemoryInterview
          onClose={() => setInterviewOpen(false)}
          template={template}
          tone={tone}
          onToneChange={setTone}
          signedIn={Boolean(user)}
          // The draft was parked when the modal opened, so the round trip
          // through /auth does not cost them what they had already typed. The
          // interview answers persist on their own.
          authHref={`/auth?redirect=${encodeURIComponent(`/templates/${id}`)}`}
          onApply={(letter) => handleInputChange(letterField, letter)}
        />
      )}

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
                href={`/auth?redirect=${encodeURIComponent(`/templates/${id}`)}`}
                onClick={saveDraft}
                className="group flex items-center gap-2 px-4 py-2 md:px-5 md:py-2.5 rounded-full bg-linear-to-r from-pink-500 to-rose-500 text-white shadow-lg hover:shadow-pink-500/25 hover:scale-105 transition-all font-medium text-sm md:text-base"
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
            style={{ color: template.colors.primary }}
          >
            {category?.name} Template
          </span>
          {/* Say so out loud. Fields that fill themselves in look like a bug
              unless the page explains why. */}
          {replyingTo && (
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-pink-200 bg-pink-50 px-4 py-1.5 text-sm font-medium text-pink-700">
              💌 Writing back to {replyingTo}
            </p>
          )}
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

              {/* The interview, offered before the blank fields rather than
                  after. Someone staring at an empty "Your Message" box is
                  exactly who this is for, and once they have written it
                  themselves the offer is worth much less. */}
              {letterField && (
                <button
                  type="button"
                  onClick={() => {
                    // Signed out, the modal's own wall leads to /auth, so the
                    // form has to be parked before they can leave from it.
                    if (!user) saveDraft();
                    setInterviewOpen(true);
                  }}
                  className="mb-6 flex w-full items-center gap-3 rounded-2xl border border-pink-200 bg-linear-to-r from-pink-50 to-rose-50 p-4 text-left transition-all hover:border-pink-400 hover:shadow-md"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-pink-500 shadow-sm">
                    <Wand2 size={18} />
                  </span>
                  <span>
                    <span className="block font-semibold text-foreground">
                      Likh do mere liye ✨
                    </span>
                    <span className="block text-sm text-muted-foreground">
                      Chaar chhote sawaal, aur poora letter ready
                    </span>
                  </span>
                </button>
              )}

              {/* Tone applies to both AI paths, so it lives out here rather
                  than inside the modal alone. The prompt has always taken a
                  tone; until now the UI never varied it. */}
              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium text-foreground/80">
                  AI ka vibe
                </label>
                <div className="flex flex-wrap gap-2">
                  {TONES.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => {
                        setTone(option.id);
                        track("ai_tone_select", { tone: option.id });
                      }}
                      title={option.hint}
                      aria-pressed={tone === option.id}
                      className={`rounded-full border px-3 py-1.5 text-sm transition-all ${
                        tone === option.id
                          ? "border-pink-500 bg-pink-50 font-medium text-pink-700 ring-1 ring-pink-500/20"
                          : "border-white/80 bg-white/60 text-foreground/70 hover:border-pink-300"
                      }`}
                    >
                      {option.emoji} {option.label}
                    </button>
                  ))}
                </div>
              </div>

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
                          disabled={isEnhancing !== null}
                          className="absolute bottom-3 right-3 p-2 rounded-full bg-white/90 shadow-sm text-pink-500 hover:text-pink-600 hover:shadow-md border border-pink-100 transition-colors z-10 disabled:opacity-60"
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

              {/* Font Selector */}
              <div className="mt-8">
                <label className="text-sm font-medium text-foreground/80 mb-3 flex items-center gap-2">
                  <Type size={16} /> Choose Font Style
                </label>
                <div className="grid grid-cols-2 xs:grid-cols-3 gap-3">
                  {FONTS.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setFont(option.id)}
                      className={`px-3 py-3 rounded-xl border transition-all text-sm relative overflow-hidden group ${
                        font === option.id
                          ? "bg-pink-50 border-pink-500 text-pink-700 font-medium ring-1 ring-pink-500/20"
                          : "bg-white/60 border-white/80 hover:border-pink-300 hover:bg-white text-foreground/70"
                      }`}
                    >
                      <span
                        className={`block text-xl mb-1 ${option.headerClass}`}
                      >
                        Aa
                      </span>
                      {option.name}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-sm mt-4 p-3 bg-red-50 rounded-lg"
                  role="alert"
                >
                  {error}
                </motion.p>
              )}

              {/* Save button */}
              <div className="mt-6">
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
                  ) : editId ? (
                    "Update Card ✨"
                  ) : (
                    "Save & Get Shareable Link ✨"
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
            <div className="relative overflow-hidden rounded-3xl border border-white/60 shadow-2xl">
              <div className="absolute top-4 right-4 z-20">
                <span className="px-3 py-1 bg-black/5 text-foreground/60 text-[10px] font-bold tracking-widest uppercase rounded-full border border-black/5">
                  Live Preview
                </span>
              </div>

              {/* The real renderer, not a look-alike. What you see here is what
                  the recipient gets, minus the envelope and the paced reveal —
                  both would fight typing. */}
              <CardPreview
                templateId={template.id}
                content={previewContent}
                font={font}
                variant="panel"
                seed={template.id}
              />

              <div className="text-center py-4">
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
