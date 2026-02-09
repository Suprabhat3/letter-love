import { Template } from "./types";

export const templates: Template[] = [
  // 💝 VALENTINE Category
  {
    id: "valentine-ask",
    name: "Be My Valentine?",
    description: "Ask the big question differently",
    category: "love",
    emoji: "💝",
    tags: ["Romantic", "Propose", "Valentine", "Crush", "Partner"],
    popularity: 5,
    estimatedTime: "2 min",
    previewText: "I've been wanting to ask you this for a while...",
    colors: {
      primary: "#e11d48",
      secondary: "#fecdd3",
      accent: "#be123c",
    },
    fields: [
      { name: "recipientName", label: "Their Name", placeholder: "My Crush", type: "text", required: true },
      { name: "senderName", label: "Your Name", placeholder: "Secret Admirer", type: "text", required: true },
       { name: "reason", label: "Why them?", placeholder: "You make me smile every day...", type: "textarea", required: true },
    ],
  },

  // 💕 LOVE Category
  {
    id: "love-letter",
    name: "Love Letter",
    description: "Pour your heart out with a romantic letter",
    category: "love",
    emoji: "💌",
    tags: ["Romantic", "Classic", "Letter", "Partner", "Her", "Him"],
    popularity: 5,
    estimatedTime: "5 min",
    previewText: "My dearest, every moment with you feels like magic...",
    colors: {
      primary: "#ec4899",
      secondary: "#f9a8d4",
      accent: "#be185d",
    },
    fields: [
      { name: "recipientName", label: "Their Name", placeholder: "My Love", type: "text", required: true },
      { name: "senderName", label: "Your Name", placeholder: "Forever Yours", type: "text", required: true },
      { name: "petName", label: "Pet Name", placeholder: "Sweetheart", type: "text", required: false },
      { name: "message", label: "Your Message", placeholder: "Write from your heart...", type: "textarea", required: true },
      { name: "memory", label: "Favorite Memory Together", placeholder: "That day when we...", type: "textarea", required: false },
    ],
  },
  {
    id: "anniversary",
    name: "Anniversary",
    description: "Celebrate your special milestone",
    category: "love",
    emoji: "💍",
    tags: ["Milestone", "Romantic", "Celebration", "Partner", "Spouse"],
    popularity: 4,
    estimatedTime: "3 min",
    previewText: "Another year of loving you has been the greatest gift...",
    colors: {
      primary: "#a855f7",
      secondary: "#e9d5ff",
      accent: "#7c3aed",
    },
    fields: [
      { name: "recipientName", label: "Partner's Name", placeholder: "My Love", type: "text", required: true },
      { name: "senderName", label: "Your Name", placeholder: "Your Love", type: "text", required: true },
      { name: "years", label: "Years Together", placeholder: "5", type: "text", required: false },
      { name: "message", label: "Anniversary Message", placeholder: "Celebrating our journey...", type: "textarea", required: true },
    ],
  },

  // 🎉 CELEBRATION Category
  {
    id: "birthday-wish",
    name: "Birthday Wish",
    description: "Make their birthday extra special",
    category: "celebration",
    emoji: "🎂",
    tags: ["Birthday", "Fun", "Friends", "Friend", "Family", "Partner"],
    popularity: 5,
    estimatedTime: "2 min",
    previewText: "Wishing you a day filled with love, laughter, and cake!",
    colors: {
      primary: "#f59e0b",
      secondary: "#fde68a",
      accent: "#d97706",
    },
    fields: [
      { name: "recipientName", label: "Birthday Person", placeholder: "Amazing Person", type: "text", required: true },
      { name: "senderName", label: "Your Name", placeholder: "Your Friend", type: "text", required: true },
      { name: "age", label: "Turning (optional)", placeholder: "25", type: "text", required: false },
      { name: "message", label: "Birthday Message", placeholder: "Wishing you the happiest birthday...", type: "textarea", required: true },
      { name: "wish", label: "Special Wish", placeholder: "May all your dreams come true!", type: "text", required: false },
    ],
  },

  // 😢 APOLOGY Category
  {
    id: "sorry-card",
    name: "I'm Sorry",
    description: "Apologize with sincerity and heart",
    category: "apology",
    emoji: "🥺",
    tags: ["Sincere", "Forgiveness", "Heartfelt", "Partner", "Friend"],
    popularity: 3,
    estimatedTime: "4 min",
    previewText: "I know I messed up, and I'm truly sorry...",
    colors: {
      primary: "#3b82f6",
      secondary: "#bfdbfe",
      accent: "#1d4ed8",
    },
    fields: [
      { name: "recipientName", label: "Their Name", placeholder: "Dear Friend", type: "text", required: true },
      { name: "senderName", label: "Your Name", placeholder: "Sincerely Sorry", type: "text", required: true },
      { name: "reason", label: "What happened", placeholder: "I'm sorry for...", type: "textarea", required: true },
      { name: "promise", label: "Your Promise", placeholder: "I promise to...", type: "textarea", required: false },
    ],
  },

  // 💭 LONGING Category
  {
    id: "miss-you",
    name: "Miss You",
    description: "Tell someone you're thinking of them",
    category: "longing",
    emoji: "💭",
    tags: ["Distance", "Love", "Thinking of You", "Partner", "Family"],
    popularity: 4,
    estimatedTime: "3 min",
    previewText: "Distance means nothing when someone means everything...",
    colors: {
      primary: "#06b6d4",
      secondary: "#a5f3fc",
      accent: "#0891b2",
    },
    fields: [
      { name: "recipientName", label: "Who You Miss", placeholder: "My Dear", type: "text", required: true },
      { name: "senderName", label: "Your Name", placeholder: "Missing You", type: "text", required: true },
      { name: "message", label: "Your Message", placeholder: "I think about you every day...", type: "textarea", required: true },
      { name: "memory", label: "A Memory", placeholder: "I keep thinking about when we...", type: "textarea", required: false },
    ],
  },
];

export function getTemplateById(id: string): Template | undefined {
  return templates.find((t) => t.id === id);
}

export function getTemplatesByCategory(category: string): Template[] {
  if (category === "all") return templates;
  return templates.filter((t) => t.category === category);
}
