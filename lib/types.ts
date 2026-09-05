// Template & Card Types for LetterLove

import type { ResolvedCardStyle } from "./cardStyle";
import type { ReactionCounts } from "./reactions";

// Feeling-based categories (extensible)
//
// The first four were the whole product, and three of the original six
// templates were romance-only — which quietly capped who LetterLove is *for*.
// The last three widen it: festivals are the highest-volume moments for an
// India-first audience and recur every year, and friendship/gratitude cover
// the people someone writes to who they are not in love with.
export type TemplateCategory =
  | "love"        // 💕 Romantic feelings
  | "festival"    // 🪔 Diwali, Rakhi, Holi, Eid…
  | "celebration" // 🎉 Joyful moments
  | "friendship"  // 🫂 The people who chose you
  | "gratitude"   // 🙏 Thank you, properly
  | "apology"     // 😢 Remorseful
  | "longing";    // 💭 Missing someone

export interface TemplateField {
  name: string;
  label: string;
  placeholder: string;
  type: "text" | "textarea" | "select";
  required: boolean;
  options?: string[]; // For select type
}

export interface Template {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  emoji: string;
  fields: TemplateField[];
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  // Preview text shown in gallery
  previewText: string;
  tags?: string[];
  popularity?: number; // 1-5
  estimatedTime?: string;
}

// Data structure for user-filled card
export interface CardData {
  templateId: string;
  fields: Record<string, string>;
  createdAt: string;
}

// Stored card in Supabase.
// `data` mixes user content (string values) with the namespaced `_style` object,
// so it is deliberately `unknown`-valued — read it through lib/cardStyle.ts
// (`readCardContent` / `readCardStyle`) rather than indexing it directly.
export interface SharedCard {
  id: string;
  template_id: string;
  data: Record<string, unknown>;
  user_id?: string;
  created_at: string;

  // Phase 4 counters, denormalized onto the row so the dashboard reads them in
  // the query it already runs. Optional because a row written before migration
  // 0003 — or a query that does not ask for them — simply has none.
  view_count?: number;
  unique_view_count?: number;
  last_viewed_at?: string | null;
  reaction_counts?: unknown;
  reply_count?: number;
}

/**
 * A card as a share-page visitor may see it: content and style already parsed,
 * the raw `data` JSONB left on the server.
 *
 * Built by `getPublicCard` in lib/cards-server.ts. The type lives here rather
 * than there so client components can reference it without importing a
 * `server-only` module.
 */
export interface PublicCard {
  id: string;
  templateId: string;
  content: Record<string, string>;
  style: ResolvedCardStyle;
  createdAt: string;
  /**
   * Engagement, server-rendered so the reaction bar arrives with real numbers
   * instead of counting up from zero after hydration. The viewer's *own*
   * reactions are not here — those need the viewer cookie, which a page render
   * cannot mint, so they come back from the view beacon instead.
   */
  reactionCounts: ReactionCounts;
  viewCount: number;
}

// Category metadata for UI
export interface CategoryInfo {
  id: TemplateCategory;
  name: string;
  emoji: string;
  description: string;
}

export const CATEGORIES: CategoryInfo[] = [
  { id: "love", name: "Love", emoji: "💕", description: "Express your romantic feelings" },
  { id: "festival", name: "Festivals", emoji: "🪔", description: "Wish them for the season" },
  { id: "celebration", name: "Celebration", emoji: "🎉", description: "Celebrate joyful moments" },
  { id: "friendship", name: "Friendship", emoji: "🫂", description: "For the people who chose you" },
  { id: "gratitude", name: "Gratitude", emoji: "🙏", description: "Say thank you properly" },
  { id: "apology", name: "Apology", emoji: "😢", description: "Say sorry with heart" },
  { id: "longing", name: "Longing", emoji: "💭", description: "Tell them you miss them" },
];
