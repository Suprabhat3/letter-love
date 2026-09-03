// The reaction set, in one place.
//
// Deliberately not server-only and deliberately free of React: the bar renders
// it, the route validates against it, and migration 0003 has the same list as a
// CHECK constraint. Three copies is two too many, but the database one has to
// be literal — so this file is the source the other two are checked against.
//
// Six, not more. A long strip of emoji on a 360px screen turns a one-tap
// gesture into a decision, and the composite primary key means six is also the
// ceiling on what one browser can ever add to a card.

export const REACTIONS = [
  { emoji: "❤️", label: "Love it" },
  { emoji: "🥹", label: "This got me" },
  { emoji: "😂", label: "Made me laugh" },
  { emoji: "🔥", label: "So good" },
  { emoji: "🥺", label: "Miss you too" },
  { emoji: "🙏", label: "Thank you" },
] as const;

export type ReactionEmoji = (typeof REACTIONS)[number]["emoji"];

const ALLOWED: ReadonlySet<string> = new Set(REACTIONS.map((r) => r.emoji));

export function isReactionEmoji(value: unknown): value is ReactionEmoji {
  return typeof value === "string" && ALLOWED.has(value);
}

/** Counts as stored in `cards.reaction_counts`, with unknown keys dropped. */
export type ReactionCounts = Partial<Record<ReactionEmoji, number>>;

/**
 * Read a `reaction_counts` JSONB blob into a bounded, typed object.
 *
 * The column is JSONB, so its shape is whatever was last written there. Every
 * value reaches the client, so it is filtered on the way out rather than
 * trusted: unknown keys are dropped and non-finite numbers become 0.
 */
export function readReactionCounts(value: unknown): ReactionCounts {
  const out: ReactionCounts = {};
  if (!value || typeof value !== "object" || Array.isArray(value)) return out;

  for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
    if (!isReactionEmoji(key)) continue;
    const n = typeof raw === "number" ? raw : Number(raw);
    if (Number.isFinite(n) && n > 0) out[key] = Math.floor(n);
  }
  return out;
}

export function totalReactions(counts: ReactionCounts): number {
  return Object.values(counts).reduce((sum, n) => sum + (n ?? 0), 0);
}
