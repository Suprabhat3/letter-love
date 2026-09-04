import type { ToneId } from "@/lib/tones";

// Per-tone prompt guidance and sampling temperature.
//
// Server-side only by convention: lib/tones.ts carries what the chips need
// (id, label, emoji, hint) and this carries what the model needs. Shipping
// prompt text to the browser would be free reconnaissance for anyone trying to
// talk around it, and it is dead weight in the bundle either way.
//
// The temperatures are not decoration. Shayari at 0.7 comes out flat, and an
// apology at 1.0 starts inventing things the sender never did — which is the
// one tone where invention is actually harmful.

interface ToneSpec {
  /** How this tone writes. Appended to the persona. */
  guidance: string;
  temperature: number;
}

const SPECS: Record<ToneId, ToneSpec> = {
  romantic: {
    guidance:
      "Tone: romantic and sincere. Warm, direct, a little vulnerable. Say the feeling plainly rather than dressing it up. No grand declarations the sender would be embarrassed to have written.",
    temperature: 0.8,
  },
  funny: {
    guidance:
      "Tone: funny and affectionate. Tease them the way close friends do, then land one genuinely warm line at the end so it still means something. Never sarcastic at their expense.",
    temperature: 0.95,
  },
  shayari: {
    guidance:
      "Tone: shayari. Write in couplets with a real rhyme, each couplet on its own two lines, blank line between couplets. Four to six couplets. Urdu-flavoured Hinglish is welcome. This is the one format where line breaks carry the meaning, so keep them.",
    temperature: 1.0,
  },
  poetic: {
    guidance:
      "Tone: poetic but unrhymed. Lean on concrete images (chai, the last train, monsoon light) rather than abstract words like 'soul' and 'eternity'. Short lines. Restraint reads as depth.",
    temperature: 0.9,
  },
  apologetic: {
    guidance:
      "Tone: apologetic. Own the mistake in the first line without any 'but'. No excuses, no explaining why it happened, no asking for anything back. Name what you will do differently. Keep it short; a long apology reads as self-defence.",
    temperature: 0.6,
  },
  festive: {
    guidance:
      "Tone: festive and celebratory. Bright, generous, full of good wishes. Mention the occasion by name. This is meant to be read out loud in a family group chat.",
    temperature: 0.85,
  },
};

export function toneGuidance(tone: ToneId): string {
  return SPECS[tone].guidance;
}

export function toneTemperature(tone: ToneId): number {
  return SPECS[tone].temperature;
}
