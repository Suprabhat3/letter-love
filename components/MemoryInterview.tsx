"use client";

// The memory interview.
//
// A modal, not a route. Keeping it on the same URL means the editor's form
// state survives — sending someone to /interview and back would either lose
// what they had typed or require persisting the whole form to get it back.
//
// A names screen (which also carries the tone), then three questions, one per
// screen, in big type, every one skippable. The skippability is load-bearing:
// a required question in an emotional flow is where people close the tab.
//
// The names screen writes straight into the card's name fields, and a second
// small call fills the card's other fields while the letter streams, so
// applying the result leaves nothing to retype in the editor.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Lock,
  PenLine,
  RefreshCw,
  Sparkles,
  X,
} from "lucide-react";

import {
  fetchLetterFields,
  fetchLetterVariants,
  streamLetter,
  type LetterRequest,
} from "@/lib/ai/browser";
import { track } from "@/lib/analytics";
import {
  extraFieldsFor,
  interviewFor,
  MAX_ANSWER_CHARS,
  MAX_NAME_CHARS,
  recipientQuestionFor,
  type LetterNames,
} from "@/lib/interview";
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
  /** Names already in the editor (a restored draft, or a reply), to start from. */
  initialNames: LetterNames;
  /** Hand the finished card back to the editor. */
  onApply: (result: InterviewResult) => void;
}

export interface InterviewResult {
  letter: string;
  names: LetterNames;
  /** The card's other fields, keyed by field name. Only the ones the AI could fill. */
  fields: Record<string, string>;
}

type Stage = "names" | "questions" | "writing" | "result";

const answersKey = (id: string) => `ll.interview.v1.${id}`;
const namesKey = (id: string) => `ll.interview.names.v1.${id}`;

function readStored<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? { ...fallback, ...(JSON.parse(raw) as T) } : fallback;
  } catch {
    return fallback;
  }
}

function writeStored(key: string, value: unknown) {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Private mode. The interview still works for this session.
  }
}

export default function MemoryInterview({
  onClose,
  template,
  tone,
  onToneChange,
  signedIn,
  authHref,
  initialNames,
  onApply,
}: Props) {
  const questions = useMemo(
    () => interviewFor(template.id, template.category),
    [template.id, template.category],
  );
  const recipientQuestion = useMemo(
    () => recipientQuestionFor(template.id, template.category),
    [template.id, template.category],
  );
  const extraFields = useMemo(() => extraFieldsFor(template), [template]);

  const [stage, setStage] = useState<Stage>("names");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>(() =>
    readStored<Record<string, string>>(answersKey(template.id), {}),
  );
  // What is already in the editor wins over what was stored, because the
  // editor is what they last looked at.
  const [names, setNames] = useState<LetterNames>(() => {
    const stored = readStored<LetterNames>(namesKey(template.id), {
      to: "",
      from: "",
    });
    return {
      to: initialNames.to.trim() || stored.to,
      from: initialNames.from.trim() || stored.from,
    };
  });
  const [letter, setLetter] = useState("");
  /** null while the fields call is in flight. */
  const [extras, setExtras] = useState<Record<string, string> | null>(null);
  const [variants, setVariants] = useState<string[] | null>(null);
  const [loadingVariants, setLoadingVariants] = useState(false);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Every in-flight request, so closing the modal stops paying for all of them.
  const controllersRef = useRef<AbortController[]>([]);
  const extrasRef = useRef<Promise<Record<string, string>> | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const nameRef = useRef<HTMLInputElement | null>(null);
  const bodyRef = useRef<HTMLDivElement | null>(null);

  // Keep the cursor in view while the letter streams in, and start each new
  // screen at the top.
  useEffect(() => {
    const body = bodyRef.current;
    if (!body) return;
    body.scrollTop = stage === "writing" ? body.scrollHeight : 0;
  }, [stage, letter, variants]);

  useEffect(() => {
    track("interview_open", { template: template.id });
  }, [template.id]);

  const close = useCallback(() => {
    controllersRef.current.forEach((c) => c.abort());
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

  // Moving between screens must move focus with it, or a keyboard user is
  // typing into whatever the last screen left focused.
  useEffect(() => {
    if (stage === "questions") inputRef.current?.focus();
    if (stage === "names") nameRef.current?.focus();
  }, [stage, step]);

  const newController = () => {
    const controller = new AbortController();
    controllersRef.current.push(controller);
    return controller;
  };

  const setAnswer = (id: string, value: string) => {
    const next = { ...answers, [id]: value.slice(0, MAX_ANSWER_CHARS) };
    setAnswers(next);
    writeStored(answersKey(template.id), next);
  };

  const setName = (key: keyof LetterNames, value: string) => {
    const next = { ...names, [key]: value.slice(0, MAX_NAME_CHARS) };
    setNames(next);
    writeStored(namesKey(template.id), next);
  };

  const trimmedNames = (): LetterNames => ({
    to: names.to.trim(),
    from: names.from.trim(),
  });

  const request = (): LetterRequest => ({
    templateId: template.id,
    tone,
    answers,
    names: trimmedNames(),
  });

  const generate = async () => {
    if (!signedIn) return;
    setStage("writing");
    setLetter("");
    setVariants(null);
    setError(null);
    track("interview_generate", { template: template.id, tone });

    const controller = newController();
    const input = request();

    // Fired at the same moment as the stream, so it costs no extra wait. A
    // failure here is silent: those fields just stay for the user to fill.
    if (extraFields.length > 0) {
      setExtras(null);
      extrasRef.current = fetchLetterFields(input, controller.signal).then(
        (result) => {
          const fields = "fields" in result ? result.fields : {};
          setExtras(fields);
          return fields;
        },
      );
    } else {
      setExtras({});
      extrasRef.current = Promise.resolve({});
    }

    const result = await streamLetter(input, setLetter, controller.signal);

    if ("error" in result) {
      // An empty message is a deliberate abort — the modal is already closing.
      if (result.error) {
        controller.abort();
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

    const controller = newController();
    const result = await fetchLetterVariants(request(), controller.signal);
    setLoadingVariants(false);

    if ("error" in result) {
      if (result.error) setError(result.error);
      return;
    }
    setVariants(result.letters);
  };

  const apply = async (text: string) => {
    // The fields call almost always lands before the stream finishes; if it
    // has not, waiting a moment beats applying a half-filled card.
    setApplying(true);
    const fields = (await extrasRef.current) ?? {};
    track("interview_apply", { template: template.id, tone });
    onApply({ letter: text, names: trimmedNames(), fields });
    onClose();
  };

  const question = questions[step];
  const answered = Object.values(answers).filter((v) => v?.trim()).length;
  const filledLabels = extras
    ? extraFields.filter((f) => extras[f.name]).map((f) => f.label)
    : [];
  // The names screen is step 0 of the bar, so it reads as part of the flow.
  const progress = stage === "names" ? 0 : step + 1;
  const showProgress = stage === "names" || (stage === "questions" && question);
  const toneOption = TONES.find((t) => t.id === tone);

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
        {/* Header, scrolling body, pinned footer. Scrolling the whole panel
            pushed the actions below the fold and put the scrollbar outside
            the rounded corner; only the body scrolls now. */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="relative flex max-h-[92svh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl dark:bg-gray-900"
        >
          {/* The progress bar and the close button share one row instead of
              the button floating absolutely over it — that's what makes
              "don't overlap" true at every width instead of a padding value
              tuned for one. */}
          <div className="flex shrink-0 items-center gap-3 px-6 pt-5 sm:px-8">
            {showProgress ? (
              <div className="flex flex-1 items-center gap-1.5">
                {[null, ...questions].map((q, i) => (
                  <span
                    key={q?.id ?? "names"}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      i <= progress ? "bg-pink-500" : "bg-border"
                    }`}
                  />
                ))}
              </div>
            ) : stage === "result" || stage === "writing" ? (
              <div className="flex-1">
                <h2 className="flex items-center gap-2 font-serif text-xl font-bold">
                  {stage === "writing" ? (
                    <>
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        aria-hidden
                      >
                        ✨
                      </motion.span>
                      Likh rahe hain...
                    </>
                  ) : variants ? (
                    "Ek chuno 💌"
                  ) : (
                    "Yeh raha 💌"
                  )}
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {toneOption ? `${toneOption.emoji} ${toneOption.label} · ` : ""}
                  Card pe baad mein bhi edit kar sakte ho
                </p>
              </div>
            ) : (
              <div className="flex-1" />
            )}

            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="shrink-0 self-start rounded-full p-2 text-muted-foreground hover:bg-muted"
            >
              <X size={18} />
            </button>
          </div>

          <div
            ref={bodyRef}
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pb-6 [scrollbar-width:thin] sm:px-8"
          >
            {stage === "names" && (
              <form
                id="names-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (names.to.trim() || names.from.trim()) {
                    track("interview_answer", { step: 0 });
                  }
                  setStage("questions");
                  setStep(0);
                }}
              >
                {/* Said on the first screen, not after the last question.
                    Nobody should answer everything and only then meet a wall. */}
                {!signedIn && (
                  <div className="mt-4 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-3.5 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
                    <Lock size={16} className="mt-0.5 shrink-0" />
                    <p className="flex-1">
                      AI letter ke liye sign in zaroori hai. Abhi jawab de sakte
                      ho, woh save rahenge.{" "}
                      <Link href={authHref} className="font-semibold underline">
                        Sign in karo
                      </Link>
                    </p>
                  </div>
                )}

                <h2 className="mt-6 font-serif text-2xl font-bold leading-snug">
                  {recipientQuestion.prompt}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {recipientQuestion.hint}
                </p>
                <input
                  ref={nameRef}
                  value={names.to}
                  onChange={(e) => setName("to", e.target.value)}
                  placeholder={recipientQuestion.placeholder}
                  maxLength={MAX_NAME_CHARS}
                  aria-label="Their name"
                  className="mt-4 w-full rounded-xl border border-border bg-muted/40 px-4 py-3 text-lg outline-none focus:ring-2 focus:ring-pink-300"
                />

                <label className="mt-5 block text-sm font-medium text-foreground/80">
                  Aur tumhara naam?
                  <span className="ml-1 font-normal text-muted-foreground">
                    (card pe neeche aayega)
                  </span>
                </label>
                <input
                  value={names.from}
                  onChange={(e) => setName("from", e.target.value)}
                  placeholder="Tumhara naam"
                  maxLength={MAX_NAME_CHARS}
                  aria-label="Your name"
                  className="mt-2 w-full rounded-xl border border-border bg-muted/40 px-4 py-3 text-lg outline-none focus:ring-2 focus:ring-pink-300"
                />

                <p className="mt-5 text-sm font-medium text-foreground/80">Vibe</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {TONES.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      title={option.hint}
                      aria-pressed={tone === option.id}
                      onClick={() => {
                        onToneChange(option.id);
                        track("ai_tone_select", { tone: option.id });
                      }}
                      className={`rounded-full border px-3 py-1.5 text-sm transition-all ${
                        tone === option.id
                          ? "border-pink-500 bg-pink-50 font-medium text-pink-700 ring-1 ring-pink-500/20 dark:bg-pink-950/30 dark:text-pink-200"
                          : "border-border text-foreground/70 hover:border-pink-300"
                      }`}
                    >
                      {option.emoji} {option.label}
                    </button>
                  ))}
                </div>
              </form>
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
              </div>
            )}

            {stage === "writing" && (
              <div className="mt-4 rounded-2xl border border-rose-100 bg-rose-50/40 p-5 dark:border-rose-900/40 dark:bg-rose-950/20">
                <p className="whitespace-pre-wrap font-serif text-[17px] leading-relaxed">
                  {letter}
                  <span className="ml-0.5 inline-block h-5 w-0.5 animate-pulse bg-pink-500 align-middle" />
                </p>
              </div>
            )}

            {stage === "result" && (
              <div>
                {variants ? (
                  <div className="mt-4 space-y-3">
                    {[letter, ...variants].map((text, i) => (
                      <div
                        key={i}
                        className="rounded-2xl border border-border p-4 transition-colors hover:border-pink-300"
                      >
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Version {i + 1}
                        </p>
                        <p className="whitespace-pre-wrap font-serif leading-relaxed">
                          {text}
                        </p>
                        <button
                          type="button"
                          onClick={() => apply(text)}
                          disabled={applying}
                          className="mt-3 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-60"
                        >
                          Use this one
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-4 rounded-2xl border border-rose-100 bg-rose-50/40 p-5 dark:border-rose-900/40 dark:bg-rose-950/20">
                    <p className="whitespace-pre-wrap font-serif text-[17px] leading-relaxed">
                      {letter}
                    </p>
                  </div>
                )}

                {/* What else lands on the card, so "Use this letter" is not a
                    leap of faith. */}
                {extraFields.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-medium text-muted-foreground">
                      {extras === null
                        ? "Card ki baaki details bhar rahe hain..."
                        : filledLabels.length > 0
                          ? "Card pe yeh bhi bhar diya"
                          : "Baaki details card pe khud add kar sakte ho"}
                    </p>
                    {filledLabels.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {filledLabels.map((label) => (
                          <span
                            key={label}
                            className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                          >
                            <Check size={12} /> {label}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {error && (
                  <p role="alert" className="mt-3 text-sm text-red-500">
                    {error}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Pinned footer: the next action is always on screen, however long
              the letter is. */}
          {stage !== "writing" && (
            <div className="shrink-0 border-t border-border bg-white px-6 py-4 sm:px-8 dark:bg-gray-900">
              {stage === "names" && (
                <button
                  type="submit"
                  form="names-form"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-pink-500 to-rose-500 py-3.5 font-semibold text-white shadow-lg"
                >
                  Aage — bas {questions.length} sawaal <ArrowRight size={18} />
                </button>
              )}

              {stage === "questions" && question && (
                <>
                  <div className="flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        step === 0 ? setStage("names") : setStep(step - 1)
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
                      // Already announced on the first screen; the answers are
                      // saved and waiting on the other side of the sign-in.
                      <Link
                        href={authHref}
                        className="flex items-center gap-2 rounded-xl bg-linear-to-r from-pink-500 to-rose-500 px-5 py-2.5 font-semibold text-white shadow-lg"
                      >
                        <Sparkles size={16} /> Sign in to write
                      </Link>
                    )}
                  </div>
                  {step === questions.length - 1 && answered === 0 && (
                    <p className="mt-2 text-right text-xs text-muted-foreground">
                      Kam se kam ek sawaal ka jawab chahiye
                    </p>
                  )}
                </>
              )}

              {stage === "result" && (
                <>
                  {!variants && (
                    <button
                      type="button"
                      onClick={() => apply(letter)}
                      disabled={applying}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-pink-500 to-rose-500 py-3.5 font-semibold text-white shadow-lg disabled:opacity-70"
                    >
                      {applying ? "Bas ek second..." : (
                        <>
                          <Check size={18} /> Use this letter
                        </>
                      )}
                    </button>
                  )}
                  <div className="mt-2 flex items-center justify-center gap-1">
                    {!variants && (
                      <button
                        type="button"
                        onClick={loadVariants}
                        disabled={loadingVariants || applying}
                        className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-muted disabled:opacity-60"
                      >
                        <RefreshCw
                          size={14}
                          className={loadingVariants ? "animate-spin" : ""}
                        />
                        {loadingVariants ? "Soch rahe hain..." : "3 aur versions"}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setStage("questions");
                        setStep(questions.length - 1);
                      }}
                      className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted"
                    >
                      <PenLine size={14} /> Answers badlo
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
}
