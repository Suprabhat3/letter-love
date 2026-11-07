"use client";

import { useState, useEffect, use } from "react";
import dynamic from "next/dynamic";
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
import MemoryInterview, { type InterviewResult } from "@/components/MemoryInterview";
import ShareModal from "@/components/ShareModal";
import { interviewFor, letterFieldFor } from "@/lib/interview";
import {
  Sparkles,
  ArrowLeft,
  User,
  LayoutGrid,
  Type,
  Wand2,
  Play,
  PenLine,
  ChevronDown,
  RefreshCw,
} from "lucide-react";
import { defaultSceneFor, isSceneId, scenesForTemplate, type SceneId } from "@/lib/scenes";

const ScenePlayer = dynamic(() => import("@/components/card/scenes/ScenePlayer"), {
  ssr: false,
  loading: () => <div className="fixed inset-0 z-100 bg-black" />,
});

interface PageProps {
  params: Promise<{ id: string }>;
}

// Bumped from v1: pre-split drafts were a flat object mixing `fontName` into
// the content fields, so an old draft would restore into the wrong shape.
const draftKey = (id: string) => `template-draft-v2-${id}`;

interface Draft {
  content: Record<string, string>;
  font: FontId;
  /** "" is the classic envelope. */
  scene?: SceneId | "";
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
      scene: parsed.scene === "" || isSceneId(parsed.scene) ? parsed.scene : undefined,
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
  // The full-screen opening, for templates that have them. New cards start on
  // the template's first scene; "" means the classic envelope.
  const [scene, setScene] = useState<SceneId | "">(
    () => readDraft(id)?.scene ?? defaultSceneFor(id) ?? "",
  );
  const [previewingScene, setPreviewingScene] = useState(false);

  // The tone every AI call uses. It opens on something appropriate to the
  // template — an apology card defaulting to "Romantic" reads as the product
  // not paying attention, and most people never touch the chips.
  const [tone, setTone] = useState<ToneId>(() =>
    defaultToneForTemplate(template?.category),
  );
  // Coming back from /auth mid-interview reopens it, with the answers that
  // were saved before they left.
  const [interviewOpen, setInterviewOpen] = useState(
    () => searchParams.get("interview") === "1",
  );

  // Where a generated letter lands. Every template has one; if one ever
  // doesn't, the AI path simply doesn't render rather than dropping the letter.
  const letterField = template ? letterFieldFor(template) : undefined;

  // AI-first. A new card opens on a choice ("write it for me" / "I'll write
  // it"), not on a wall of empty fields. After the interview, the card is
  // filled and the fields are tucked behind "Edit details"; the preview is
  // what they review. Editing an existing card is always the full form.
  const [modeState, setMode] = useState<"choose" | "ai" | "manual">(() =>
    editId || !letterField ? "manual" : "choose",
  );
  const [detailsOpen, setDetailsOpen] = useState(false);

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
          // A card saved before scenes existed keeps its envelope.
          setScene(stored.scene ?? "");
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

  // A restored draft (or a loaded card) that already has a letter in it was
  // mid-edit: show the form, not the chooser.
  const hasLetter = Boolean(letterField && formData[letterField]?.trim());
  const mode = modeState === "choose" && hasLetter ? "manual" : modeState;

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * Everything the interview produced goes onto the card at once: the names
   * from its first screen, the letter, and whichever other fields the AI could
   * fill. In the full form, fields the user already typed are left alone; the
   * letter itself is always replaced, because that is what they asked for.
   */
  const applyInterview = ({ letter, names, fields }: InterviewResult) => {
    if (!letterField) return;
    const keepTyped = mode === "manual";
    setFormData((prev) => {
      const next = { ...prev };
      const put = (key: string, value: string) => {
        if (!value) return;
        if (keepTyped && prev[key]?.trim()) return;
        next[key] = value;
      };
      for (const [key, value] of Object.entries(fields)) put(key, value);
      put("recipientName", names.to);
      put("senderName", names.from);
      next[letterField] = letter;
      return next;
    });
    if (mode === "choose") setMode("ai");
    setDetailsOpen(false);
  };

  const openInterview = () => {
    // Signed out, the modal's own sign-in link leads to /auth, so the form
    // has to be parked before they can leave from it.
    if (!user) saveDraft();
    setInterviewOpen(true);
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
  const sceneOptions = scenesForTemplate(template.id);

  const questionCount = interviewFor(template.id, template.category).length;

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
      JSON.stringify({ content: formData, font, scene } satisfies Draft),
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
      // In the AI view the fields are collapsed; open them so the missing
      // one is actually visible.
      if (mode === "ai") setDetailsOpen(true);
      setError(`Please fill in: ${missing.join(", ")}`);
      return;
    }

    setIsSubmitting(true);

    const style: CardStyle = {
      font,
      envelope: { enabled: envelope },
      ...(scene ? { scene } : {}),
    };
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

  // Tone (which also drives per-field enhance) and the template's fields.
  // Shared by the full form and the AI view's "Edit details".
  const fieldsBlock = (
    <>
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
    </>
  );

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

      {previewingScene && scene && (
        <ScenePlayer
          key={scene}
          scene={scene}
          to={previewContent.recipientName ?? ""}
          from={previewContent.senderName ?? ""}
          wish={previewContent.wish}
          seed={`preview-${template.id}`}
          readLabel="Back to editing"
          onDone={() => setPreviewingScene(false)}
        />
      )}

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
          authHref={`/auth?redirect=${encodeURIComponent(`/templates/${id}?interview=1`)}`}
          initialNames={{
            to: formData.recipientName ?? "",
            from: formData.senderName ?? "",
          }}
          onApply={applyInterview}
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
            {template.description}. Answer a few small questions and the AI
            fills the whole card, or write it yourself.
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

              {/* Chooser: a new card opens on two doors, not a wall of empty
                  fields. The AI door is first because that is what someone
                  staring at a blank "Your Message" box actually wants. */}
              {mode === "choose" && letterField && (
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={openInterview}
                    className="flex w-full items-center gap-4 rounded-2xl border border-pink-200 bg-linear-to-r from-pink-50 to-rose-50 p-5 text-left transition-all hover:border-pink-400 hover:shadow-md"
                  >
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-pink-500 shadow-sm">
                      <Wand2 size={20} />
                    </span>
                    <span>
                      <span className="block text-lg font-semibold text-foreground">
                        Likh do mere liye ✨
                      </span>
                      <span className="block text-sm text-muted-foreground">
                        Naam + {questionCount} chhote sawaal, aur poora card ready
                      </span>
                      {!user && !authLoading && (
                        <span className="mt-1 block text-xs font-medium text-amber-700">
                          Sign in chahiye hoga
                        </span>
                      )}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMode("manual");
                      track("editor_manual");
                    }}
                    className="flex w-full items-center gap-4 rounded-2xl border border-white/80 bg-white/60 p-5 text-left transition-all hover:border-pink-300 hover:bg-white"
                  >
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-foreground/60 shadow-sm">
                      <PenLine size={20} />
                    </span>
                    <span>
                      <span className="block text-lg font-semibold text-foreground">
                        Khud likhunga
                      </span>
                      <span className="block text-sm text-muted-foreground">
                        Saare fields khud bharo
                      </span>
                    </span>
                  </button>
                </div>
              )}

              {/* After the interview: the preview is what they review, so the
                  fields stay folded away unless they want to tweak one. */}
              {mode === "ai" && (
                <div>
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                    <p className="font-semibold text-emerald-900">Card ready ✨</p>
                    <p className="mt-1 text-sm text-emerald-800/80">
                      Preview mein dekh lo. Kuch badalna ho toh details edit karo.
                    </p>
                    <button
                      type="button"
                      onClick={openInterview}
                      className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-white px-3 py-1.5 text-sm font-medium text-emerald-800 hover:bg-emerald-100"
                    >
                      <RefreshCw size={14} /> Dobara likhwao
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setDetailsOpen((open) => !open)}
                    aria-expanded={detailsOpen}
                    className="mt-4 flex w-full items-center justify-between rounded-xl border border-white/80 bg-white/60 px-4 py-3 text-sm font-medium text-foreground/80 hover:border-pink-300"
                  >
                    Edit details
                    <ChevronDown
                      size={18}
                      className={`transition-transform ${detailsOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {detailsOpen && <div className="mt-5">{fieldsBlock}</div>}
                </div>
              )}

              {mode === "manual" && (
                <>
                  {letterField && (
                    <button
                      type="button"
                      onClick={openInterview}
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
                          Naam + {questionCount} chhote sawaal. Jo tumne likha hai woh rahega.
                        </span>
                      </span>
                    </button>
                  )}
                  {fieldsBlock}
                </>
              )}

              {mode !== "choose" && (
                <>
              {/* Opening experience — only for templates that have scenes. */}
              {sceneOptions.length > 0 && (
                <div className="mt-8">
                  <label className="mb-1 flex items-center gap-2 text-sm font-medium text-foreground/80">
                    <Sparkles size={16} /> How should it open?
                  </label>
                  <p className="mb-3 text-xs text-muted-foreground">
                    A full-screen moment they play through before reading your letter.
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {sceneOptions.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => {
                          setScene(option.id);
                          track("scene_select", { scene: option.id });
                        }}
                        aria-pressed={scene === option.id}
                        className={`flex items-start gap-3 rounded-2xl border p-3.5 text-left transition-[background-color,border-color,box-shadow] duration-200 ${
                          scene === option.id
                            ? "border-amber-500 bg-linear-to-br from-amber-50 to-orange-50 ring-1 ring-amber-500/30 shadow-md"
                            : "border-white/80 bg-white/60 hover:border-amber-300 hover:bg-white"
                        }`}
                      >
                        <span className="text-2xl leading-none">{option.emoji}</span>
                        <span>
                          <span className="block text-sm font-semibold text-foreground">
                            {option.name}
                          </span>
                          <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
                            {option.blurb}
                          </span>
                        </span>
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setScene("")}
                      aria-pressed={scene === ""}
                      className={`flex items-center gap-3 rounded-2xl border p-3.5 text-left transition-[background-color,border-color] duration-200 sm:col-span-2 ${
                        scene === ""
                          ? "border-pink-500 bg-pink-50 ring-1 ring-pink-500/20"
                          : "border-white/80 bg-white/60 hover:border-pink-300 hover:bg-white"
                      }`}
                    >
                      <span className="text-2xl leading-none">💌</span>
                      <span className="text-sm font-medium text-foreground/80">
                        Classic envelope
                      </span>
                    </button>
                  </div>
                  {scene && (
                    <button
                      type="button"
                      onClick={() => setPreviewingScene(true)}
                      className="mt-3 inline-flex items-center gap-2 rounded-full bg-neutral-950 px-4 py-2 text-sm font-medium text-amber-100 shadow-md transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <Play size={14} /> Preview the opening
                    </button>
                  )}
                </div>
              )}

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

                </>
              )}

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
              {mode !== "choose" && (
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
              )}
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
