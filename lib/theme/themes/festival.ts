// Diwali, Rakhi, Holi, Eid, Karwa Chauth, New Year.
//
// The point of the theme engine was that a new design is a config entry rather
// than a component, and this file is the proof: six genuinely different-looking
// cards, no JSX.
//
// Each of these gets its own decor glyphs and its own surface, because a
// festival that renders as "the default pink glass card with a diya emoji"
// is worse than not shipping it — it reads as a palette swap, and this
// audience can tell.

import type { ThemeDraft } from "../types";

/**
 * Diwali is light against dark. The only theme in the catalogue with a dark
 * surface, which is exactly why it stands out in the gallery grid.
 */
export const diwaliTheme: ThemeDraft = {
  id: "diwali",
  name: "Diwali Wishes",
  palette: {
    primary: "#fbbf24",
    secondary: "#fde68a",
    accent: "#f97316",
    ink: "#fdf6e3",
    paper: "#241605",
    glow: "#f59e0b",
  },
  surface: { kind: "gradient", from: "#2a1a06", to: "#120a02", angleDeg: 165 },
  frame: { kind: "stamped", radiusPx: 20, borderColor: "#b45309", shadow: "2xl" },
  layout: "centered-card",
  ambient: {
    enabled: true,
    blobs: [
      { anchor: "bottom-left", sizePx: 700, color: "accent", opacity: 0.35, durationSec: 9 },
      { anchor: "top-right", sizePx: 600, color: "primary", opacity: 0.22, durationSec: 12, delaySec: 2 },
    ],
  },
  decor: [
    {
      kind: "float",
      phase: "always",
      count: 12,
      glyphs: ["🪔", "✨", "🌟"],
      direction: "up",
      speedSec: [14, 24],
      sizeRem: 1.5,
      opacity: 0.75,
    },
    {
      kind: "burst",
      phase: "always",
      count: 16,
      colors: ["#fbbf24", "#f97316", "#fef3c7", "#ffffff"],
      shape: "circle",
      spreadPx: 540,
      repeatDelaySec: 5,
    },
  ],
  blocks: [
    { type: "eyebrow", text: "Shubh Deepavali" },
    { type: "hero", media: { kind: "emoji", value: "🪔", sizeRem: 5.5, pulse: true } },
    { type: "title", field: "recipientName", fallback: "Dear", color: "primary", size: "xl" },
    { type: "body", field: "message", fallback: "May this Diwali fill your home with light.", paced: true },
    { type: "highlight", field: "wish", emoji: "✨" },
    { type: "signature", field: "senderName", prefix: "—", fallback: "With love" },
    { type: "cta", label: "Send One Back", href: "/templates" },
  ],
  envelope: {
    enabled: true,
    sealEmoji: "🪔",
    hint: "Tap to light it",
    paperColor: "#2a1a06",
    flapColor: "#b45309",
    liningColor: "primary",
  },
  og: {
    title: "Happy Diwali",
    mainIcon: "🪔",
    decorations: "✨",
    bgGradient: "linear-gradient(135deg, #fef3c7 0%, white 50%, #f59e0b20 100%)",
    primaryColor: "#b45309",
    secondaryColor: "secondary",
  },
};

/**
 * Rakhi is a thread, so the card is one: a kraft-paper surface with a deckle
 * edge, not a glass panel.
 */
export const rakhiTheme: ThemeDraft = {
  id: "rakhi",
  name: "Raksha Bandhan",
  palette: {
    primary: "#dc2626",
    secondary: "#fecaca",
    accent: "#b45309",
    ink: "#43201d",
    paper: "#fffaf5",
    glow: "#fca5a5",
  },
  surface: { kind: "paper", texture: "kraft", tint: "paper" },
  frame: { kind: "deckle", radiusPx: 10, shadow: "xl" },
  layout: "letter-sheet",
  decor: [
    {
      kind: "float",
      phase: "always",
      count: 9,
      glyphs: ["🪢", "🌺", "🍬"],
      direction: "up",
      speedSec: [18, 30],
      sizeRem: 1.3,
      opacity: 0.5,
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
    { type: "eyebrow", text: "Raksha Bandhan" },
    { type: "hero", media: { kind: "emoji", value: "🪢", sizeRem: 5, pulse: false } },
    { type: "title", field: "recipientName", fallback: "Bhai", color: "primary", size: "lg" },
    { type: "body", field: "message", fallback: "Distance can't undo a thread this old.", paced: true },
    { type: "quote", field: "promise" },
    { type: "signature", field: "senderName", prefix: "—", fallback: "Always yours" },
    { type: "cta", label: "Send One Back", href: "/templates" },
  ],
  envelope: {
    enabled: true,
    sealEmoji: "🪢",
    hint: "Tap to untie",
    paperColor: "#fecaca",
    flapColor: "primary",
    liningColor: "#fffaf5",
  },
  og: {
    title: "Happy Rakhi",
    mainIcon: "🪢",
    decorations: "🌺",
    bgGradient: "linear-gradient(135deg, #fee2e2 0%, white 50%, #dc262620 100%)",
    primaryColor: "primary",
    secondaryColor: "secondary",
  },
};

/** Holi is the loudest card in the catalogue, and should be. */
export const holiTheme: ThemeDraft = {
  id: "holi",
  name: "Holi Hai!",
  palette: {
    primary: "#db2777",
    secondary: "#fbcfe8",
    accent: "#7c3aed",
    ink: "#3b1f3d",
    paper: "#fffdfe",
    glow: "#f0abfc",
  },
  surface: { kind: "glass", tint: "secondary", shine: true },
  frame: { kind: "rounded", radiusPx: 28, shadow: "2xl" },
  layout: "centered-card",
  ambient: {
    enabled: true,
    blobs: [
      { anchor: "top-left", sizePx: 640, color: "#22c55e", opacity: 0.3, durationSec: 8 },
      { anchor: "top-right", sizePx: 600, color: "#eab308", opacity: 0.3, durationSec: 9, delaySec: 1 },
      { anchor: "bottom-left", sizePx: 620, color: "accent", opacity: 0.28, durationSec: 11, delaySec: 2 },
    ],
  },
  decor: [
    {
      kind: "burst",
      phase: "always",
      count: 22,
      colors: ["#db2777", "#22c55e", "#eab308", "#3b82f6", "#a855f7"],
      shape: "circle",
      spreadPx: 620,
      repeatDelaySec: 3,
    },
    {
      kind: "float",
      phase: "always",
      count: 8,
      glyphs: ["🎨", "💦", "🌈"],
      direction: "down",
      speedSec: [12, 20],
      sizeRem: 1.5,
      opacity: 0.6,
    },
  ],
  motion: {
    intro: "spring-pop",
    introDelayMs: 200,
    staggerMs: 90,
    reveal: "lines",
    revealStepMs: 300,
  },
  blocks: [
    { type: "badge", text: "Bura na maano", emoji: "🎨" },
    { type: "hero", media: { kind: "emoji", value: "🎨", sizeRem: 5.5, pulse: true } },
    { type: "title", field: "recipientName", fallback: "Dost", color: "primary", size: "xl" },
    { type: "body", field: "message", fallback: "Holi hai!", paced: true },
    { type: "quote", field: "memory" },
    { type: "signature", field: "senderName", prefix: "—", fallback: "Rangeen" },
    { type: "cta", label: "Send One Back", href: "/templates" },
  ],
  envelope: {
    enabled: true,
    sealEmoji: "🎨",
    hint: "Tap — careful, it's wet",
    paperColor: "#fbcfe8",
    flapColor: "primary",
    liningColor: "accent",
  },
  og: {
    title: "Happy Holi",
    mainIcon: "🎨",
    decorations: "🌈",
    bgGradient: "linear-gradient(135deg, #fce7f3 0%, white 45%, #a855f720 100%)",
    primaryColor: "primary",
    secondaryColor: "accent",
  },
};

/** Eid: green, geometric, and quiet. No confetti — the restraint is the point. */
export const eidTheme: ThemeDraft = {
  id: "eid",
  name: "Eid Mubarak",
  palette: {
    primary: "#059669",
    secondary: "#a7f3d0",
    accent: "#b48a3c",
    ink: "#12332a",
    paper: "#fbfffd",
    glow: "#6ee7b7",
  },
  surface: { kind: "gradient", from: "#ffffff", to: "#ecfdf5", angleDeg: 155 },
  frame: { kind: "stamped", radiusPx: 22, borderColor: "#b48a3c", shadow: "xl" },
  layout: "centered-card",
  ambient: {
    enabled: true,
    blobs: [
      { anchor: "top-right", sizePx: 700, color: "secondary", opacity: 0.4, durationSec: 14 },
      { anchor: "bottom-left", sizePx: 560, color: "accent", opacity: 0.14, durationSec: 16, delaySec: 3 },
    ],
  },
  decor: [
    {
      kind: "float",
      phase: "always",
      count: 8,
      glyphs: ["🌙", "⭐", "✨"],
      direction: "up",
      speedSec: [22, 36],
      sizeRem: 1.2,
      opacity: 0.45,
    },
  ],
  motion: {
    intro: "fade",
    introDelayMs: 250,
    staggerMs: 150,
    reveal: "lines",
    revealStepMs: 450,
  },
  blocks: [
    { type: "eyebrow", text: "Eid Mubarak" },
    { type: "hero", media: { kind: "emoji", value: "🌙", sizeRem: 5, pulse: true } },
    { type: "title", field: "recipientName", fallback: "Dear", color: "primary", size: "lg" },
    { type: "body", field: "message", fallback: "Eid Mubarak — may this one be gentle and full.", paced: true },
    { type: "highlight", field: "wish", emoji: "🌙" },
    { type: "signature", field: "senderName", prefix: "—", fallback: "With warmth" },
    { type: "cta", label: "Send One Back", href: "/templates" },
  ],
  envelope: {
    enabled: true,
    sealEmoji: "🌙",
    hint: "Tap to open",
    paperColor: "#a7f3d0",
    flapColor: "primary",
    liningColor: "#fbfffd",
  },
  og: {
    title: "Eid Mubarak",
    mainIcon: "🌙",
    decorations: "⭐",
    bgGradient: "linear-gradient(135deg, #d1fae5 0%, white 50%, #05966920 100%)",
    primaryColor: "primary",
    secondaryColor: "secondary",
  },
};

/**
 * Karwa Chauth is one moment: the moon arriving after a long day. Deep red,
 * a single ambient glow standing in for the moon, and a typewriter reveal
 * because this is a card people write in one long unbroken breath.
 */
export const karwaChauthTheme: ThemeDraft = {
  id: "karwa-chauth",
  name: "Karwa Chauth",
  palette: {
    primary: "#b91c1c",
    secondary: "#fecdd3",
    accent: "#d4a017",
    ink: "#f7e9e4",
    paper: "#2b0f12",
    glow: "#fca5a5",
  },
  surface: { kind: "gradient", from: "#3d1418", to: "#1a0709", angleDeg: 170 },
  frame: { kind: "stamped", radiusPx: 24, borderColor: "#d4a017", shadow: "2xl" },
  layout: "letter-sheet",
  ambient: {
    enabled: true,
    blobs: [
      { anchor: "top-right", sizePx: 420, color: "#fef9c3", opacity: 0.4, durationSec: 20 },
      { anchor: "bottom-left", sizePx: 700, color: "primary", opacity: 0.3, durationSec: 15, delaySec: 2 },
    ],
  },
  decor: [
    {
      kind: "float",
      phase: "always",
      count: 7,
      glyphs: ["🌕", "✨", "🌹"],
      direction: "up",
      speedSec: [24, 40],
      sizeRem: 1.3,
      opacity: 0.5,
    },
  ],
  motion: {
    intro: "fade",
    introDelayMs: 300,
    staggerMs: 170,
    reveal: "typewriter",
    revealStepMs: 28,
  },
  blocks: [
    { type: "eyebrow", text: "Karwa Chauth" },
    { type: "hero", media: { kind: "emoji", value: "🌕", sizeRem: 5, pulse: true } },
    { type: "title", field: "recipientName", fallback: "My Love", color: "accent", size: "lg" },
    { type: "body", field: "message", fallback: "The moon took its time tonight. So did I.", paced: true },
    { type: "quote", field: "memory" },
    { type: "signature", field: "senderName", prefix: "—", fallback: "Yours" },
    { type: "cta", label: "Write One Back", href: "/templates" },
  ],
  envelope: {
    enabled: true,
    sealEmoji: "🌕",
    hint: "Tap when the moon is up",
    paperColor: "#3d1418",
    flapColor: "primary",
    liningColor: "accent",
  },
  og: {
    title: "Karwa Chauth",
    mainIcon: "🌕",
    decorations: "🌹",
    bgGradient: "linear-gradient(135deg, #ffe4e6 0%, white 50%, #b91c1c20 100%)",
    primaryColor: "primary",
    secondaryColor: "secondary",
  },
};

/** New Year: midnight, indigo, and fireworks that actually repeat. */
export const newYearTheme: ThemeDraft = {
  id: "new-year",
  name: "New Year Wish",
  palette: {
    primary: "#818cf8",
    secondary: "#c7d2fe",
    accent: "#facc15",
    ink: "#eef2ff",
    paper: "#101031",
    glow: "#6366f1",
  },
  surface: { kind: "gradient", from: "#1a1a4b", to: "#0a0a20", angleDeg: 160 },
  frame: { kind: "rounded", radiusPx: 26, shadow: "2xl" },
  layout: "centered-card",
  ambient: {
    enabled: true,
    blobs: [
      { anchor: "top-left", sizePx: 660, color: "primary", opacity: 0.35, durationSec: 10 },
      { anchor: "bottom-right", sizePx: 620, color: "accent", opacity: 0.18, durationSec: 13, delaySec: 2 },
    ],
  },
  decor: [
    {
      kind: "burst",
      phase: "always",
      count: 20,
      colors: ["#facc15", "#818cf8", "#f472b6", "#ffffff"],
      shape: "circle",
      spreadPx: 600,
      repeatDelaySec: 3,
    },
    {
      kind: "float",
      phase: "always",
      count: 8,
      glyphs: ["🎆", "✨", "🥂"],
      direction: "up",
      speedSec: [16, 26],
      sizeRem: 1.4,
      opacity: 0.6,
    },
  ],
  blocks: [
    { type: "eyebrow", text: "Happy New Year" },
    { type: "stat", field: "years", label: "let's go", color: "accent" },
    { type: "hero", media: { kind: "emoji", value: "🎆", sizeRem: 5, pulse: true } },
    { type: "title", field: "recipientName", fallback: "You", color: "primary", size: "lg" },
    { type: "body", field: "message", fallback: "Same me, same you, better year.", paced: true },
    { type: "highlight", field: "wish", emoji: "✨" },
    { type: "signature", field: "senderName", prefix: "—", fallback: "Yours" },
    { type: "cta", label: "Send One Back", href: "/templates" },
  ],
  envelope: {
    enabled: true,
    sealEmoji: "🎆",
    hint: "Tap at midnight",
    paperColor: "#1a1a4b",
    flapColor: "primary",
    liningColor: "accent",
  },
  og: {
    title: "Happy New Year",
    mainIcon: "🎆",
    decorations: "✨",
    bgGradient: "linear-gradient(135deg, #e0e7ff 0%, white 50%, #6366f120 100%)",
    primaryColor: "#4338ca",
    secondaryColor: "secondary",
  },
};
