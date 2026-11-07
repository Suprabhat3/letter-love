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
      "Tone: romantic, the real kind. Write like someone who is slightly shy about saying it. Lean on the small specific things from the answers (a habit, a moment, an inside joke) and let those carry the love. Allow one plain, direct line of feeling, not five. No filmy declarations, no 'meri jaan meri zindagi' stacking.",
    temperature: 0.8,
  },
  funny: {
    guidance:
      "Tone: funny, like a close friend or sibling who roasts out of love. Pull their leg about the real details in the answers, keep the jokes specific rather than generic, then drop in one short, sincere line near the end that they will not expect. Never mean, never forced punchlines.",
    temperature: 0.95,
  },
  shayari: {
    guidance:
      "Tone: shayari. Write in couplets with a real rhyme, each couplet on its own two lines, blank line between couplets. Three to five couplets. Simple Urdu-flavoured Hinglish that a normal person can read aloud, built on the real details from the answers, not stock imagery like chaand, sitaare and samandar. This is the one format where line breaks carry the meaning, so keep them.",
    temperature: 1.0,
  },
  poetic: {
    guidance:
      "Tone: quietly poetic, unrhymed. Build it from concrete everyday images taken from the answers (the chai, the last train, the terrace, the voice note) rather than abstract words. Short lines, lots of restraint. Understatement reads as depth.",
    temperature: 0.9,
  },
  apologetic: {
    guidance:
      "Tone: a real apology. Say sorry for the specific thing in the first line, with no 'but' and no 'if I hurt you'. No excuses, no explaining why it happened, no asking them to forgive you right away. Name the one thing you will actually do differently. Keep it short and a little awkward, the way real apologies are; a long polished apology reads as self-defence.",
    temperature: 0.6,
  },
  festive: {
    guidance:
      "Tone: festive but personal. Mention the festival or occasion by name and tie it to something real between the two of them (how they used to celebrate, the sweets, the family chaos, being far this year). One warm wish that is specific to this person, not a list of generic blessings. It should read like a message from someone they know, not a forward from a family group.",
    temperature: 0.85,
  },
};

export function toneGuidance(tone: ToneId): string {
  return SPECS[tone].guidance;
}

export function toneTemperature(tone: ToneId): number {
  return SPECS[tone].temperature;
}
