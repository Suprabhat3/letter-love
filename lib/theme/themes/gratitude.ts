// Friendship, gratitude, and congratulations.
//
// Three of the original six templates were romance-only, which quietly decided
// who LetterLove was for. These are the ones you send to people you are not in
// love with — and they need to *look* like that, or the product feels like a
// love-letter app wearing a hat.
//
// Warm and paper-ish rather than pink and glassy, on purpose.

import type { ThemeDraft } from "../types";

/**
 * A best-friend letter is a letter, not a greeting card. Kraft paper, deckle
 * edge, the years as a stat because "8 years" does more work than a paragraph.
 */
export const bestFriendTheme: ThemeDraft = {
  id: "best-friend",
  name: "Best Friend",
  palette: {
    primary: "#f97316",
    secondary: "#fed7aa",
    accent: "#c2410c",
    ink: "#42291a",
    paper: "#fffbf5",
    glow: "#fdba74",
  },
  surface: { kind: "paper", texture: "kraft", tint: "paper" },
  frame: { kind: "deckle", radiusPx: 10, shadow: "xl" },
  layout: "letter-sheet",
  ambient: {
    enabled: true,
    blobs: [
      { anchor: "top-left", sizePx: 640, color: "secondary", opacity: 0.4, durationSec: 13 },
      { anchor: "bottom-right", sizePx: 560, color: "primary", opacity: 0.16, durationSec: 16, delaySec: 3 },
    ],
  },
  decor: [
    {
      kind: "float",
      phase: "always",
      count: 8,
      glyphs: ["🫂", "☕", "✨"],
      direction: "up",
      speedSec: [20, 32],
      sizeRem: 1.25,
      opacity: 0.4,
    },
  ],
  motion: {
    intro: "fade",
    introDelayMs: 200,
    staggerMs: 140,
    reveal: "lines",
    revealStepMs: 420,
  },
  blocks: [
    { type: "eyebrow", text: "For my person" },
    { type: "stat", field: "years", label: "years of this", color: "primary" },
    { type: "title", field: "recipientName", fallback: "Best Friend", color: "accent", size: "lg" },
    { type: "body", field: "message", fallback: "You've seen the worst version of me and stayed.", paced: true },
    { type: "quote", field: "memory" },
    { type: "signature", field: "senderName", prefix: "—", fallback: "Yours, obviously" },
    { type: "cta", label: "Send One Back", href: "/templates" },
  ],
  envelope: {
    enabled: true,
    sealEmoji: "🫂",
    hint: "Tap to open",
    paperColor: "#fed7aa",
    flapColor: "primary",
    liningColor: "#fffbf5",
  },
  og: {
    title: "A Letter For",
    mainIcon: "🫂",
    decorations: "🧡",
    bgGradient: "linear-gradient(135deg, #ffedd5 0%, white 50%, #f9731620 100%)",
    primaryColor: "accent",
    secondaryColor: "secondary",
  },
};

/** Friendship Day is lighter and louder than the best-friend letter. */
export const friendshipDayTheme: ThemeDraft = {
  id: "friendship-day",
  name: "Friendship Day",
  palette: {
    primary: "#ca8a04",
    secondary: "#fef08a",
    accent: "#a16207",
    ink: "#3f3416",
    paper: "#fffef5",
    glow: "#fde047",
  },
  surface: { kind: "glass", tint: "secondary", shine: true },
  frame: { kind: "rounded", radiusPx: 26, shadow: "2xl" },
  layout: "centered-card",
  decor: [
    {
      kind: "float",
      phase: "always",
      count: 10,
      glyphs: ["🤝", "🌻", "✨", "🎈"],
      direction: "up",
      speedSec: [15, 26],
      sizeRem: 1.4,
      opacity: 0.55,
    },
  ],
  blocks: [
    { type: "badge", text: "Friendship Day", emoji: "🤝" },
    { type: "hero", media: { kind: "emoji", value: "🫱🏽‍🫲🏼", sizeRem: 4.5, pulse: true } },
    { type: "title", field: "recipientName", fallback: "Dost", color: "primary", size: "lg" },
    { type: "body", field: "message", fallback: "One day a year to say what I never say out loud.", paced: true },
    { type: "quote", field: "memory" },
    { type: "signature", field: "senderName", prefix: "—", fallback: "Your friend" },
    { type: "cta", label: "Send One Back", href: "/templates" },
  ],
  envelope: {
    enabled: true,
    sealEmoji: "🤝",
    hint: "Tap to open",
    paperColor: "#fef08a",
    flapColor: "primary",
    liningColor: "#fffef5",
  },
  og: {
    title: "Happy Friendship Day",
    mainIcon: "🤝",
    decorations: "🌻",
    bgGradient: "linear-gradient(135deg, #fef9c3 0%, white 50%, #ca8a0420 100%)",
    primaryColor: "primary",
    secondaryColor: "secondary",
  },
};

/**
 * Thank you: linen, teal, almost no decor. Gratitude that arrives covered in
 * confetti reads as a template; gratitude that arrives quiet reads as meant.
 */
export const thankYouTheme: ThemeDraft = {
  id: "thank-you",
  name: "Thank You",
  palette: {
    primary: "#0d9488",
    secondary: "#ccfbf1",
    accent: "#0f766e",
    ink: "#173c39",
    paper: "#fbfffe",
    glow: "#5eead4",
  },
  surface: { kind: "paper", texture: "linen", tint: "paper" },
  frame: { kind: "deckle", radiusPx: 8, shadow: "xl" },
  layout: "letter-sheet",
  ambient: {
    enabled: true,
    blobs: [
      { anchor: "center", sizePx: 820, color: "secondary", opacity: 0.3, durationSec: 18 },
    ],
  },
  decor: [
    {
      kind: "float",
      phase: "always",
      count: 6,
      glyphs: ["🙏", "🌿", "✨"],
      direction: "up",
      speedSec: [26, 40],
      sizeRem: 1.15,
      opacity: 0.32,
    },
  ],
  motion: {
    intro: "fade",
    introDelayMs: 250,
    staggerMs: 160,
    reveal: "lines",
    revealStepMs: 480,
  },
  blocks: [
    { type: "eyebrow", text: "Thank you" },
    { type: "title", field: "recipientName", fallback: "You", color: "accent", size: "lg" },
    { type: "body", field: "message", fallback: "You probably don't even remember doing it. I do.", paced: true },
    { type: "quote", field: "memory" },
    { type: "signature", field: "senderName", prefix: "—", fallback: "Gratefully" },
    { type: "cta", label: "Send One Back", href: "/templates" },
  ],
  envelope: {
    enabled: true,
    sealEmoji: "🙏",
    hint: "Tap to open",
    paperColor: "#ccfbf1",
    flapColor: "primary",
    liningColor: "#fbfffe",
  },
  og: {
    title: "Thank You",
    mainIcon: "🙏",
    decorations: "🌿",
    bgGradient: "linear-gradient(135deg, #ccfbf1 0%, white 50%, #0d948820 100%)",
    primaryColor: "accent",
    secondaryColor: "secondary",
  },
};

/** Proud of you: the achievement gets the badge, the person gets the title. */
export const proudOfYouTheme: ThemeDraft = {
  id: "proud-of-you",
  name: "Proud of You",
  palette: {
    primary: "#7c3aed",
    secondary: "#ddd6fe",
    accent: "#5b21b6",
    ink: "#2e2143",
    paper: "#fdfcff",
    glow: "#c4b5fd",
  },
  surface: { kind: "gradient", from: "#ffffff", to: "#f5f3ff", angleDeg: 160 },
  frame: { kind: "stamped", radiusPx: 22, borderColor: "#c4b5fd", shadow: "2xl" },
  layout: "centered-card",
  decor: [
    {
      kind: "float",
      phase: "always",
      count: 10,
      glyphs: ["🌟", "✨", "💜"],
      direction: "up",
      speedSec: [16, 28],
      sizeRem: 1.35,
      opacity: 0.5,
    },
  ],
  blocks: [
    { type: "eyebrow", text: "I'm proud of you" },
    { type: "badge", field: "achievement", emoji: "🌟" },
    { type: "hero", media: { kind: "emoji", value: "🌟", sizeRem: 4.5, pulse: true } },
    { type: "title", field: "recipientName", fallback: "You", color: "primary", size: "lg" },
    { type: "body", field: "message", fallback: "I've watched you do the hard version of this.", paced: true },
    { type: "highlight", field: "wish", emoji: "💜" },
    { type: "signature", field: "senderName", prefix: "—", fallback: "Always in your corner" },
    { type: "cta", label: "Send One Back", href: "/templates" },
  ],
  envelope: {
    enabled: true,
    sealEmoji: "🌟",
    hint: "Tap to open",
    paperColor: "#ddd6fe",
    flapColor: "primary",
    liningColor: "#fdfcff",
  },
  og: {
    title: "Proud of You",
    mainIcon: "🌟",
    decorations: "💜",
    bgGradient: "linear-gradient(135deg, #ede9fe 0%, white 50%, #7c3aed20 100%)",
    primaryColor: "primary",
    secondaryColor: "secondary",
  },
};

/** Teacher's Day: ruled-notebook blue, restrained, the subject as an eyebrow. */
export const teachersDayTheme: ThemeDraft = {
  id: "teachers-day",
  name: "Teacher's Day",
  palette: {
    primary: "#1d4ed8",
    secondary: "#dbeafe",
    accent: "#1e3a8a",
    ink: "#1b2a4a",
    paper: "#fcfdff",
    glow: "#93c5fd",
  },
  surface: { kind: "paper", texture: "grain", tint: "paper" },
  frame: { kind: "rounded", radiusPx: 14, shadow: "xl" },
  layout: "letter-sheet",
  decor: [
    {
      kind: "float",
      phase: "always",
      count: 7,
      glyphs: ["📚", "✏️", "✨"],
      direction: "up",
      speedSec: [22, 34],
      sizeRem: 1.2,
      opacity: 0.35,
    },
  ],
  motion: {
    intro: "fade",
    introDelayMs: 220,
    staggerMs: 150,
    reveal: "lines",
    revealStepMs: 460,
  },
  blocks: [
    { type: "eyebrow", text: "Happy Teacher's Day" },
    { type: "title", field: "recipientName", fallback: "Sir", color: "accent", size: "lg" },
    { type: "subtitle", field: "subject" },
    { type: "body", field: "message", fallback: "I still think about one thing you said.", paced: true },
    { type: "quote", field: "memory" },
    { type: "signature", field: "senderName", prefix: "— your student,", fallback: "A student" },
    { type: "cta", label: "Send One Back", href: "/templates" },
  ],
  envelope: {
    enabled: true,
    sealEmoji: "📚",
    hint: "Tap to open",
    paperColor: "#dbeafe",
    flapColor: "primary",
    liningColor: "#fcfdff",
  },
  og: {
    title: "Thank You, Teacher",
    mainIcon: "📚",
    decorations: "✏️",
    bgGradient: "linear-gradient(135deg, #dbeafe 0%, white 50%, #1d4ed820 100%)",
    primaryColor: "primary",
    secondaryColor: "secondary",
  },
};

/**
 * For Maa. Linen, rose, and a slow reveal — this is the one card in the
 * catalogue people read twice.
 */
export const mothersDayTheme: ThemeDraft = {
  id: "mothers-day",
  name: "For Maa",
  palette: {
    primary: "#e11d48",
    secondary: "#ffe4e6",
    accent: "#9f1239",
    ink: "#46262c",
    paper: "#fffafa",
    glow: "#fda4af",
  },
  surface: { kind: "paper", texture: "linen", tint: "paper" },
  frame: { kind: "deckle", radiusPx: 8, shadow: "xl" },
  layout: "letter-sheet",
  ambient: {
    enabled: true,
    blobs: [
      { anchor: "top-left", sizePx: 680, color: "secondary", opacity: 0.45, durationSec: 14 },
      { anchor: "bottom-right", sizePx: 560, color: "primary", opacity: 0.14, durationSec: 17, delaySec: 3 },
    ],
  },
  decor: [
    {
      kind: "float",
      phase: "always",
      count: 8,
      glyphs: ["🌷", "🤍", "✨"],
      direction: "up",
      speedSec: [22, 36],
      sizeRem: 1.25,
      opacity: 0.4,
    },
  ],
  motion: {
    intro: "fade",
    introDelayMs: 300,
    staggerMs: 170,
    reveal: "lines",
    revealStepMs: 520,
  },
  blocks: [
    { type: "eyebrow", text: "A letter I kept meaning to write" },
    { type: "hero", media: { kind: "emoji", value: "🌷", sizeRem: 4.5, pulse: false } },
    { type: "title", field: "recipientName", fallback: "Maa", color: "primary", size: "xl" },
    { type: "body", field: "message", fallback: "You never asked for thanks. That's exactly why this exists.", paced: true },
    { type: "quote", field: "memory" },
    { type: "signature", field: "senderName", prefix: "—", fallback: "Your child" },
    { type: "cta", label: "Write One Too", href: "/templates" },
  ],
  envelope: {
    enabled: true,
    sealEmoji: "🌷",
    hint: "Tap to open",
    paperColor: "#ffe4e6",
    flapColor: "primary",
    liningColor: "#fffafa",
  },
  og: {
    title: "For Maa",
    mainIcon: "🌷",
    decorations: "🤍",
    bgGradient: "linear-gradient(135deg, #ffe4e6 0%, white 50%, #e11d4820 100%)",
    primaryColor: "primary",
    secondaryColor: "secondary",
  },
};

/**
 * For Papa. Slate and teal, no florals, almost no decor — the restraint is a
 * design decision about the recipient, not a shortcut.
 */
export const fathersDayTheme: ThemeDraft = {
  id: "fathers-day",
  name: "For Papa",
  palette: {
    primary: "#0f766e",
    secondary: "#cbd5e1",
    accent: "#334155",
    ink: "#20303a",
    paper: "#fcfdfd",
    glow: "#94a3b8",
  },
  surface: { kind: "paper", texture: "grain", tint: "paper" },
  frame: { kind: "rounded", radiusPx: 12, shadow: "xl" },
  layout: "letter-sheet",
  ambient: {
    enabled: true,
    blobs: [
      { anchor: "center", sizePx: 780, color: "secondary", opacity: 0.28, durationSec: 20 },
    ],
  },
  decor: [
    {
      kind: "float",
      phase: "always",
      count: 5,
      glyphs: ["⌚", "🛵", "☕"],
      direction: "up",
      speedSec: [28, 44],
      sizeRem: 1.1,
      opacity: 0.28,
    },
  ],
  motion: {
    intro: "fade",
    introDelayMs: 300,
    staggerMs: 170,
    reveal: "lines",
    revealStepMs: 520,
  },
  blocks: [
    { type: "eyebrow", text: "Things I never said out loud" },
    { type: "title", field: "recipientName", fallback: "Papa", color: "primary", size: "lg" },
    { type: "body", field: "message", fallback: "You never said much. I understood most of it anyway.", paced: true },
    { type: "quote", field: "memory" },
    { type: "signature", field: "senderName", prefix: "—", fallback: "Your child" },
    { type: "cta", label: "Write One Too", href: "/templates" },
  ],
  envelope: {
    enabled: true,
    sealEmoji: "👔",
    hint: "Tap to open",
    paperColor: "#cbd5e1",
    flapColor: "primary",
    liningColor: "#fcfdfd",
  },
  og: {
    title: "For Papa",
    mainIcon: "👔",
    decorations: "🤝",
    bgGradient: "linear-gradient(135deg, #e2e8f0 0%, white 50%, #0f766e20 100%)",
    primaryColor: "primary",
    secondaryColor: "accent",
  },
};

/**
 * Congratulations needs its own `og`: the default chain maps every
 * `celebration` template to the birthday preview, so without this a promotion
 * card would show up in WhatsApp as "Happy Birthday 🎂".
 */
export const congratulationsTheme: ThemeDraft = {
  id: "congratulations",
  name: "Congratulations!",
  palette: {
    primary: "#16a34a",
    secondary: "#bbf7d0",
    accent: "#15803d",
    ink: "#1c3b28",
    paper: "#fbfffc",
    glow: "#86efac",
  },
  surface: { kind: "glass", tint: "secondary", shine: true },
  frame: { kind: "rounded", radiusPx: 26, shadow: "2xl" },
  layout: "centered-card",
  decor: [
    {
      kind: "burst",
      phase: "always",
      count: 20,
      colors: ["#16a34a", "#facc15", "#38bdf8", "#ffffff"],
      shape: "square",
      spreadPx: 580,
      repeatDelaySec: 4,
    },
    {
      kind: "float",
      phase: "always",
      count: 9,
      glyphs: ["🎊", "🎉", "🥂"],
      direction: "up",
      speedSec: [14, 24],
      sizeRem: 1.4,
      opacity: 0.6,
    },
  ],
  motion: {
    intro: "spring-pop",
    introDelayMs: 250,
    staggerMs: 100,
    reveal: "lines",
    revealStepMs: 340,
  },
  blocks: [
    { type: "eyebrow", text: "Congratulations" },
    { type: "badge", field: "achievement", emoji: "🎊" },
    { type: "hero", media: { kind: "emoji", value: "🎊", sizeRem: 5, pulse: true } },
    { type: "title", field: "recipientName", fallback: "You", color: "primary", size: "lg" },
    { type: "body", field: "message", fallback: "You did it. Everyone else is surprised. I'm not.", paced: true },
    { type: "highlight", field: "wish", emoji: "🥂" },
    { type: "signature", field: "senderName", prefix: "—", fallback: "Cheering loudest" },
    { type: "cta", label: "Send One Back", href: "/templates" },
  ],
  envelope: {
    enabled: true,
    sealEmoji: "🎊",
    hint: "Tap to open",
    paperColor: "#bbf7d0",
    flapColor: "primary",
    liningColor: "#fbfffc",
  },
  og: {
    title: "Congratulations",
    mainIcon: "🎊",
    decorations: "🎉",
    bgGradient: "linear-gradient(135deg, #dcfce7 0%, white 50%, #16a34a20 100%)",
    primaryColor: "accent",
    secondaryColor: "secondary",
  },
};
