// Template & Card Types for LetterLove

// Feeling-based categories (extensible)
export type TemplateCategory = 
  | "love"        // 💕 Romantic feelings
  | "celebration" // 🎉 Joyful moments
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
}

// Data structure for user-filled card
export interface CardData {
  templateId: string;
  fields: Record<string, string>;
  createdAt: string;
}

// Stored card in Supabase
export interface SharedCard {
  id: string;
  template_id: string;
  data: Record<string, string>;
  user_id?: string;
  created_at: string;
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
  { id: "celebration", name: "Celebration", emoji: "🎉", description: "Celebrate joyful moments" },
  { id: "apology", name: "Apology", emoji: "😢", description: "Say sorry with heart" },
  { id: "longing", name: "Longing", emoji: "💭", description: "Tell them you miss them" },
];
