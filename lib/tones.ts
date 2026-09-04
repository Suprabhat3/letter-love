// The tone registry.
//
// Shared deliberately: the chips in the editor and the prompt builder on the
// server must agree on the exact same set of ids, the same way lib/reactions.ts
// is shared. What is NOT here is the prompt guidance for each tone — that lives
// in lib/prompts/tones.ts and never reaches the browser.
//
// Until now the AI route interpolated a `tone` that was hardcoded to one
// string, so the prompt supported a parameter the UI never varied. These six
// are the cheapest real win available: the field was already being sent.

export const TONES = [
  {
    id: "romantic",
    label: "Romantic",
    emoji: "💗",
    hint: "Soft, sincere, straight from the dil",
  },
  {
    id: "funny",
    label: "Funny",
    emoji: "😄",
    hint: "Teasing and light, the way you actually talk",
  },
  {
    id: "shayari",
    label: "Shayari",
    emoji: "🌙",
    hint: "Couplets with a rhyme and a sigh",
  },
  {
    id: "poetic",
    label: "Poetic",
    emoji: "🕊️",
    hint: "Imagery and rhythm, no rhyme needed",
  },
  {
    id: "apologetic",
    label: "Sorry",
    emoji: "🥺",
    hint: "Owning it, without excuses",
  },
  {
    id: "festive",
    label: "Festive",
    emoji: "✨",
    hint: "Warm wishes, celebration energy",
  },
] as const;

export type ToneId = (typeof TONES)[number]["id"];

export const DEFAULT_TONE: ToneId = "romantic";

export function isToneId(value: unknown): value is ToneId {
  return TONES.some((t) => t.id === value);
}

/** Never throws: an unknown tone falls back rather than failing a request. */
export function readToneId(value: unknown): ToneId {
  return isToneId(value) ? value : DEFAULT_TONE;
}

/**
 * The tone a template opens on.
 *
 * An apology card defaulting to "Romantic" is a small thing that reads as the
 * product not paying attention, and most people never touch the chips.
 */
export function defaultToneForTemplate(category?: string): ToneId {
  switch (category) {
    case "apology":
      return "apologetic";
    case "celebration":
      return "festive";
    case "longing":
      return "poetic";
    default:
      return DEFAULT_TONE;
  }
}
