"use client";

// The memory interview.
//
// A modal, not a route. Keeping it on the same URL means the editor's form
// state survives — sending someone to /interview and back would either lose
// what they had typed or require persisting the whole form to get it back.
//
// Five screens, one question each, in big type, every one skippable. The
// skippability is load-bearing: a required question in an emotional flow is
// where people close the tab.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Sparkles, X } from "lucide-react";

import { fetchLetterVariants, streamLetter } from "@/lib/ai/browser";
import { track } from "@/lib/analytics";
import { interviewFor, MAX_ANSWER_CHARS } from "@/lib/interview";
import { TONES, type ToneId } from "@/lib/tones";
import type { Template } from "@/lib/types";

// Mounted only while open, by the editor. That is what lets the answers load
// in a `useState` initialiser instead of an effect: this component never
// renders on the server, so there is no hydration pass to mismatch, and
// sessionStorage can be read during the first render like any other prop.
interface Props {
  onClose: () => void;
  template: Template;
  tone: ToneId;
  onToneChange: (tone: ToneId) => void;
  /** Whether a letter can actually be generated, or the wall shows instead. */
  signedIn: boolean;
  /** Where to send someone who needs to sign in first. */
  authHref: string;
  /** Hand the finished letter back to the editor. */
  onApply: (letter: string) => void;
}

type Stage = "tone" | "questions" | "writing" | "result";

const answersKey = (id: string) => `ll.interview.v1.${id}`;

function readAnswers(id: string): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(answersKey(id));
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

export default function MemoryInterview({
  onClose,
  template,
  tone,
  onToneChange,
  signedIn,
  authHref,
  onApply,
}: Props) {
  const questions = useMemo(
    () => interviewFor(template.id, template.category),
    [template.id, template.category],
  );

  const [stage, setStage] = useState<Stage>("tone");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>(() =>
    readAnswers(template.id),
  );
  const [letter, setLetter] = useState("");
  const [variants, setVariants] = useState<string[] | null>(null);
  const [loadingVariants, setLoadingVariants] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    track("interview_open", { template: template.id });
  }, [template.id]);

  const persist = useCallback(
    (next: Record<string, string>) => {
      try {
        sessionStorage.setItem(answersKey(template.id), JSON.stringify(next));
      } catch {
        // Private mode. The interview still works for this session.
      }
    },
    [template.id],
  );

  const close = useCallback(() => {
    abortRef.current?.abort();
    onClose();
  }, [onClose]);

  // Esc closes, and aborts an in-flight generation with it — otherwise closing
  // the modal keeps paying for tokens nobody will read.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  // Moving between questions must move focus with it, or a keyboard user is
  // typing into whatever the last screen left focused.
  useEffect(() => {
    if (stage === "questions") inputRef.current?.focus();
  }, [stage, step]);

  const setAnswer = (id: string, value: string) => {
    const next = { ...answers, [id]: value.slice(0, MAX_ANSWER_CHARS) };
    setAnswers(next);
    persist(next);
  };

  const generate = async () => {
    if (!signedIn) return;
    setStage("writing");
    setLetter("");
    setVariants(null);
    setError(null);
    track("interview_generate", { template: template.id, tone });

    const controller = new AbortController();
    abortRef.current = controller;

    const result = await streamLetter(
      { templateId: template.id, tone, answers },
      setLetter,
      controller.signal,
    );

    if ("error" in result) {
      // An empty message is a deliberate abort — the modal is already closing.
      if (result.error) {
        setError(result.error);
        setStage("questions");
      }
      return;
    }
    setLetter(result.text);
    setStage("result");
  };

  const loadVariants = async () => {
    setLoadingVariants(true);
    setError(null);
    track("interview_variants", { template: template.id, tone });

    const controller = new AbortController();
    abortRef.current = controller;
    const result = await fetchLetterVariants(
      { templateId: template.id, tone, answers },
      controller.signal,
    );
    setLoadingVariants(false);

    if ("error" in result) {
      if (result.error) setError(result.error);
      return;
    }
    setVariants(result.letters);
  };

  const apply = (text: string) => {
    track("interview_apply", { template: template.id, tone });
    onApply(text);
    onClose();
  };

  const question = questions[step];
  const answered = Object.values(answers).filter((v) => v?.trim()).length;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4 backdrop-blur-sm"
        onClick={close}
        role="dialog"
        aria-modal="true"
        aria-label="Write my letter with AI"
      >
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-white dark:bg-gray-900 p-6 sm:p-8 shadow-2xl max-h-[92svh] overflow-y-auto"
        >
          {/* The progress bar and the close button share one row instead of
              the button floating absolutely over it — that's what makes
              "don't overlap" true at every width instead of a padding value
              tuned for one. */}
          <div className="flex items-center gap-3">
            {stage === "questions" && question ? (
              <div className="flex flex-1 items-center gap-1.5">
                {questions.map((q, i) => (
                  <span
                    key={q.id}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      i <= step ? "bg-pink-500" : "bg-border"
                    }`}
                  />
                ))}
              </div>
            ) : (
              <div className="flex-1" />
            )}

            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="shrink-0 rounded-full p-2 text-muted-foreground hover:bg-muted"
            >
              <X size={18} />
            </button>
          </div>

          {stage === "tone" && (
            <div>
              <h2 className="font-serif text-2xl font-bold">
                Kaise likhein? ✨
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Pick a vibe. Phir bas {questions.length} chhote sawaal, aur
                letter ready.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                {TONES.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => {
                      onToneChange(option.id);
                      track("ai_tone_select", { tone: option.id });
                    }}
                    className={`rounded-2xl border p-3 text-left transition-all ${
                      tone === option.id
                        ? "border-pink-500 bg-pink-50 ring-1 ring-pink-500/20 dark:bg-pink-950/30"
                        : "border-border hover:border-pink-300"
                    }`}
                  >
                    <span className="text-lg">{option.emoji}</span>
                    <span className="ml-2 font-medium">{option.label}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {option.hint}
                    </span>
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setStage("questions")}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-pink-500 to-rose-500 py-3.5 font-semibold text-white shadow-lg"
              >
                Shuru karein <ArrowRight size={18} />
              </button>
            </div>
          )}

          {stage === "questions" && question && (
            <div>
              <h2 className="mt-6 font-serif text-2xl font-bold leading-snug">
                {question.prompt}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {question.hint}
              </p>

              <textarea
                ref={inputRef}
                value={answers[question.id] ?? ""}
                onChange={(e) => setAnswer(question.id, e.target.value)}
                placeholder={question.placeholder}
                rows={3}
                maxLength={MAX_ANSWER_CHARS}
                className="mt-4 w-full resize-none rounded-xl border border-border bg-muted/40 p-4 text-lg outline-none focus:ring-2 focus:ring-pink-300"
              />

              {error && (
                <p role="alert" className="mt-3 text-sm text-red-500">
                  {error}
                </p>
              )}

              <div className="mt-5 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() =>
                    step === 0 ? setStage("tone") : setStep(step - 1)
                  }
                  className="flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted"
                >
                  <ArrowLeft size={16} /> Back
                </button>

                {step < questions.length - 1 ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setStep(step + 1)}
                      className="rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted"
                    >
                      Skip
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (answers[question.id]?.trim()) {
                          track("interview_answer", { step: step + 1 });
                        }
                        setStep(step + 1);
                      }}
                      className="flex items-center gap-2 rounded-xl bg-foreground px-5 py-2.5 font-medium text-background"
                    >
                      Next <ArrowRight size={16} />
                    </button>
                  </div>
                ) : signedIn ? (
                  <button
                    type="button"
                    onClick={generate}
                    disabled={answered === 0}
                    className="flex items-center gap-2 rounded-xl bg-linear-to-r from-pink-500 to-rose-500 px-5 py-2.5 font-semibold text-white shadow-lg disabled:opacity-50"
                  >
                    <Sparkles size={16} /> Letter likho
                  </button>
                ) : (
                  // The wall lands here rather than at the top of the flow: the
                  // ask is worth something now, because the answers are already
                  // saved and waiting on the other side of it.
                  <Link
                    href={authHref}
                    className="flex items-center gap-2 rounded-xl bg-linear-to-r from-pink-500 to-rose-500 px-5 py-2.5 font-semibold text-white shadow-lg"
                  >
                    <Sparkles size={16} /> Sign in to write
                  </Link>
                )}
              </div>
            </div>
          )}

          {stage === "writing" && (
            <div>
              <h2 className="flex items-center gap-2 font-serif text-xl font-bold">
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  ✨
                </motion.span>
                Likh rahe hain...
              </h2>
              <p className="mt-4 whitespace-pre-wrap font-serif text-lg leading-relaxed">
                {letter}
                <span className="ml-0.5 inline-block h-5 w-0.5 animate-pulse bg-pink-500 align-middle" />
              </p>
            </div>
          )}

          {stage === "result" && (
            <div>
              <h2 className="font-serif text-2xl font-bold">Yeh raha 💌</h2>

              {variants ? (
                <div className="mt-4 space-y-3">
                  {[letter, ...variants].map((text, i) => (
                    <div
                      key={i}
                      className="rounded-2xl border border-border p-4"
                    >
                      <p className="whitespace-pre-wrap font-serif leading-relaxed">
                        {text}
                      </p>
                      <button
                        type="button"
                        onClick={() => apply(text)}
                        className="mt-3 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background"
                      >
                        Use this one
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 whitespace-pre-wrap font-serif text-lg leading-relaxed">
                  {letter}
                </p>
              )}

              {error && (
                <p role="alert" className="mt-3 text-sm text-red-500">
                  {error}
                </p>
              )}

              {!variants && (
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => apply(letter)}
                    className="flex-1 rounded-xl bg-linear-to-r from-pink-500 to-rose-500 py-3.5 font-semibold text-white shadow-lg"
                  >
                    Use this letter
                  </button>
                  <button
                    type="button"
                    onClick={loadVariants}
                    disabled={loadingVariants}
                    className="rounded-xl border border-border px-5 py-3.5 font-medium disabled:opacity-60"
                  >
                    {loadingVariants ? "Soch rahe hain..." : "3 aur versions"}
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  setStage("questions");
                  setStep(questions.length - 1);
                }}
                className="mt-3 w-full rounded-xl py-2 text-sm text-muted-foreground hover:bg-muted"
              >
                Answers badalna hai
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
}
