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
  // "Thank you" arrived in Phase 6 and is the honest reply to a birthday wish
  // — a love letter back to whoever wished you happy birthday was never right.
  "birthday-wish": "thank-you",

  // Festivals: wish them back with the same festival. This is the one place
  // where echoing the template is correct — that is literally the custom.
  diwali: "diwali",
  rakhi: "rakhi",
  holi: "holi",
  eid: "eid",
  "karwa-chauth": "karwa-chauth",
  "new-year": "new-year",
  "friendship-day": "friendship-day",

  // Gratitude and praise are answered, not returned in kind: replying to
  // "I'm proud of you" with "I'm proud of you" is a bounce, not a reply.
  "thank-you": "best-friend",
  "proud-of-you": "thank-you",
  "teachers-day": "thank-you",
  "mothers-day": "thank-you",
  "fathers-day": "thank-you",
  congratulations: "thank-you",
  "best-friend": "best-friend",

  // The specials. A proposal and a confession both want a letter back, not
  // another question — the recipient has already answered on the card itself.
  "reasons-i-love-you": "reasons-i-love-you",
  "open-when": "open-when",
  proposal: "love-letter",
  "crush-confession": "love-letter",
  "just-because": "just-because",
  "long-distance": "long-distance",
};

const FALLBACK = "love-letter";

export function suggestReplyTemplate(templateId: string): string {
  return REPLY_TEMPLATE[templateId] ?? FALLBACK;
}
