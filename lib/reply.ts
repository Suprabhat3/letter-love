// Which template to open when someone replies to a letter.
//
// React-free and dependency-free so both the share page and the editor can
// import it. Kept as an explicit map rather than "reply with the same
// template", because replying to "Be My Valentine?" with another yes/no game
// is nonsense — the reply is an answer, not an echo.

const REPLY_TEMPLATE: Record<string, string> = {
  "valentine-ask": "love-letter",
  "love-letter": "love-letter",
  anniversary: "anniversary",
  "sorry-card": "love-letter",
  "miss-you": "miss-you",
  // Phase 6 adds a "thank you" template, which is the right target for this
  // one and for `sorry-card`. Until then a love letter is the closest fit.
  "birthday-wish": "love-letter",
};

const FALLBACK = "love-letter";

export function suggestReplyTemplate(templateId: string): string {
  return REPLY_TEMPLATE[templateId] ?? FALLBACK;
}
