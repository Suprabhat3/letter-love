// The high-emotion specials.
//
// These exist to exercise the *layout* axis rather than the palette one. Six
// more pink glass cards would have been a bigger catalogue and the same
// product; a numbered list, a pack of separately sealed notes and a proposal
// you have to answer are the three things in here somebody screenshots.
//
// Two of them are the first users of block types added in this phase (`list`
// and `pack`); the proposal reuses the `yes-no-game` widget the Phase 1
// extraction already produced, which is the whole argument for that extraction.

import type { ThemeDraft } from "../types";

/**
 * "Reasons I Love You" — one field, split on newlines, rendered as a numbered
 * list. Left-aligned and stripped of hero art, because the list *is* the art.
 */
export const reasonsTheme: ThemeDraft = {
  id: "reasons-i-love-you",
  name: "Reasons I Love You",
  palette: {
    primary: "#e11d48",
    secondary: "#ffe4e6",
    accent: "#9f1239",
    ink: "#43222a",
    paper: "#fffafb",
    glow: "#fda4af",
  },
  surface: { kind: "paper", texture: "linen", tint: "paper" },
  frame: { kind: "deckle", radiusPx: 8, shadow: "xl" },
  layout: "list",
  ambient: {
    enabled: true,
    blobs: [
      { anchor: "top-right", sizePx: 680, color: "secondary", opacity: 0.42, durationSec: 13 },
      { anchor: "bottom-left", sizePx: 560, color: "primary", opacity: 0.15, durationSec: 16, delaySec: 3 },
    ],
  },
  decor: [
    {
      kind: "float",
      phase: "always",
      count: 9,
      glyphs: ["❤️‍🔥", "💗", "✨"],
      direction: "up",
      speedSec: [18, 30],
      sizeRem: 1.25,
      opacity: 0.4,
    },
  ],
  motion: {
    intro: "fade",
    introDelayMs: 200,
    staggerMs: 140,
    reveal: "lines",
    revealStepMs: 400,
  },
  blocks: [
    { type: "eyebrow", text: "Reasons I love you" },
    { type: "title", field: "recipientName", fallback: "You", color: "primary", size: "lg" },
    { type: "list", field: "reasons", numbered: true, max: 30 },
    { type: "body", field: "message" },
    { type: "signature", field: "senderName", prefix: "—", fallback: "Yours" },
    { type: "cta", label: "Write One Back", href: "/templates" },
  ],
  envelope: {
    enabled: true,
    sealEmoji: "❤️‍🔥",
    hint: "Tap to read the list",
    paperColor: "#ffe4e6",
    flapColor: "primary",
    liningColor: "#fffafb",
  },
  og: {
    title: "Reasons I Love You",
    mainIcon: "❤️‍🔥",
    decorations: "💗",
    bgGradient: "linear-gradient(135deg, #ffe4e6 0%, white 50%, #e11d4820 100%)",
    primaryColor: "primary",
    secondaryColor: "secondary",
  },
};

/**
 * "Open When…" — the only card in the catalogue designed to be *reopened*.
 *
 * The notes stay sealed until tapped, which is the point: this is a card
 * somebody keeps in their WhatsApp for months and comes back to on a bad
 * night. The `pack` block leaves each note closed and does not remember which
 * were read, so the card behaves the same on the fifth visit as on the first.
 */
export const openWhenTheme: ThemeDraft = {
  id: "open-when",
  name: "Open When…",
  palette: {
    primary: "#7c3aed",
    secondary: "#ede9fe",
    accent: "#5b21b6",
    ink: "#2c2144",
    paper: "#fdfcff",
    glow: "#c4b5fd",
  },
  surface: { kind: "gradient", from: "#ffffff", to: "#f5f3ff", angleDeg: 160 },
  frame: { kind: "rounded", radiusPx: 24, shadow: "2xl" },
  layout: "letter-sheet",
  ambient: {
    enabled: true,
    blobs: [
      { anchor: "top-left", sizePx: 700, color: "secondary", opacity: 0.45, durationSec: 14 },
      { anchor: "bottom-right", sizePx: 560, color: "primary", opacity: 0.16, durationSec: 17, delaySec: 3 },
    ],
  },
  decor: [
    {
      kind: "float",
      phase: "always",
      count: 7,
      glyphs: ["✉️", "💜", "✨"],
      direction: "up",
      speedSec: [22, 36],
      sizeRem: 1.2,
      opacity: 0.35,
    },
  ],
  motion: {
    intro: "fade",
    introDelayMs: 250,
    staggerMs: 140,
    // The pack does its own revealing, one note at a time, so a paced body
    // reveal on top of it would be two competing pacings.
    reveal: "none",
    revealStepMs: 0,
  },
  blocks: [
    { type: "eyebrow", text: "Keep this. Open the one you need." },
    { type: "title", field: "recipientName", fallback: "You", color: "primary", size: "lg" },
    {
      type: "pack",
      items: [
        { label: "Open when you're sad", field: "whenSad", emoji: "🫂" },
        { label: "Open when you miss me", field: "whenMissMe", emoji: "💜" },
        { label: "Open when you can't sleep", field: "whenCantSleep", emoji: "🌙" },
        { label: "Open when you need a laugh", field: "whenNeedLaugh", emoji: "😄" },
      ],
    },
    { type: "signature", field: "senderName", prefix: "— always,", fallback: "Yours" },
    { type: "cta", label: "Make One Back", href: "/templates" },
  ],
  envelope: {
    enabled: true,
    sealEmoji: "📩",
    hint: "Tap to open the pack",
    paperColor: "#ede9fe",
    flapColor: "primary",
    liningColor: "#fdfcff",
  },
  og: {
    title: "Open When…",
    mainIcon: "📩",
    decorations: "💜",
    bgGradient: "linear-gradient(135deg, #ede9fe 0%, white 50%, #7c3aed20 100%)",
    primaryColor: "primary",
    secondaryColor: "secondary",
  },
};

/**
 * The proposal. Reuses the yes/no widget, with copy that stays warm rather
 * than teasing — a runaway NO button is funny on a valentine and cruel here,
 * so `evadeNo` stays off and the refusals are gentle.
 */
export const proposalTheme: ThemeDraft = {
  id: "proposal",
  name: "Will You Marry Me?",
  palette: {
    primary: "#be123c",
    secondary: "#fecdd3",
    accent: "#881337",
    ink: "#3f1a24",
    paper: "#fffafb",
    glow: "#fda4af",
  },
  surface: { kind: "glass", tint: "secondary", shine: true },
  frame: { kind: "stamped", radiusPx: 24, borderColor: "#fda4af", shadow: "2xl" },
  layout: "centered-card",
  ambient: {
    enabled: true,
    blobs: [
      { anchor: "top-left", sizePx: 640, color: "secondary", opacity: 0.45, durationSec: 11 },
      { anchor: "bottom-right", sizePx: 560, color: "primary", opacity: 0.2, durationSec: 14, delaySec: 2 },
    ],
  },
  decor: [
    {
      kind: "float",
      phase: "pre",
      count: 10,
      glyphs: ["💐", "💍", "🤍"],
      direction: "up",
      speedSec: [16, 28],
      sizeRem: 1.4,
      opacity: 0.45,
    },
    {
      kind: "burst",
      phase: "post",
      count: 24,
      colors: ["#be123c", "#fecdd3", "#facc15", "#ffffff"],
      shape: "circle",
      spreadPx: 620,
      repeatDelaySec: 2,
    },
    {
      kind: "float",
      phase: "post",
      count: 14,
      glyphs: ["🎉", "💍", "💖", "🥂"],
      direction: "up",
      speedSec: [5, 9],
      sizeRem: 1.75,
      opacity: 0.5,
    },
  ],
  motion: {
    intro: "spring-pop",
    introDelayMs: 250,
    staggerMs: 130,
    reveal: "lines",
    revealStepMs: 460,
  },
  blocks: [
    { type: "hero", phase: "pre", media: { kind: "emoji", value: "💐", sizeRem: 5.5, pulse: true } },
    { type: "title", phase: "pre", field: "recipientName", fallback: "My Love", color: "primary", size: "xl" },
    { type: "body", phase: "pre", field: "message", fallback: "I've thought about this every day for a year.", paced: true },
    { type: "quote", phase: "pre", field: "memory" },

    { type: "hero", phase: "post", media: { kind: "emoji", value: "💍", sizeRem: 6, pulse: true } },
    { type: "title", phase: "post", text: "She said yes!", color: "accent", size: "xl" },
    { type: "body", phase: "post", text: "Now go call them. Right now." },
    { type: "signature", phase: "post", field: "senderName", prefix: "— yours, forever,", fallback: "Yours" },
    { type: "cta", phase: "post", label: "Make Your Own", href: "/templates" },
  ],
  interaction: {
    kind: "yes-no-game",
    yesLabel: "Yes 💍",
    growthPx: 24,
    maxYesPx: 72,
    // Deliberately not evasive. A NO button that runs away is a joke, and this
    // is the one card in the catalogue where the answer is allowed to matter.
    evadeNo: false,
    noPhrases: [
      "Not yet",
      "Ask me again?",
      "You're serious?",
      "Say it properly",
      "One more time",
      "Okay, ask nicely",
      "I'm listening…",
    ],
  },
  envelope: {
    enabled: true,
    sealEmoji: "💐",
    hint: "Tap. Take a breath first.",
    paperColor: "#fecdd3",
    flapColor: "primary",
    liningColor: "#fffafb",
  },
  og: {
    title: "A Question For",
    mainIcon: "💐",
    decorations: "💍",
    bgGradient: "linear-gradient(135deg, #ffe4e6 0%, white 50%, #be123c20 100%)",
    primaryColor: "primary",
    secondaryColor: "secondary",
  },
};

/**
 * Long distance. The days-left number is the hero, as a stat — a countdown the
 * sender types rather than one the card computes, because a live countdown
 * would have to pick a timezone and would be wrong for exactly the couples
 * this template is for.
 */
export const longDistanceTheme: ThemeDraft = {
  id: "long-distance",
  name: "Long Distance",
  palette: {
    primary: "#0284c7",
    secondary: "#bae6fd",
    accent: "#075985",
    ink: "#12384f",
    paper: "#fbfeff",
    glow: "#7dd3fc",
  },
  surface: { kind: "glass", tint: "secondary", shine: false },
  frame: { kind: "rounded", radiusPx: 28, shadow: "xl" },
  layout: "letter-sheet",
  ambient: {
    enabled: true,
    blobs: [
      { anchor: "center", sizePx: 860, color: "secondary", opacity: 0.3, durationSec: 18 },
    ],
  },
  decor: [
    {
      kind: "float",
      phase: "always",
      count: 7,
      glyphs: ["✈️", "☁️", "📍"],
      direction: "down",
      speedSec: [24, 38],
      sizeRem: 1.2,
      opacity: 0.32,
    },
  ],
  motion: {
    intro: "fade",
    introDelayMs: 250,
    staggerMs: 160,
    reveal: "typewriter",
    revealStepMs: 26,
  },
  blocks: [
    { type: "eyebrow", text: "Counting" },
    { type: "stat", field: "daysLeft", label: "days until I see you", color: "primary" },
    { type: "title", field: "recipientName", fallback: "My Love", color: "accent", size: "lg" },
    { type: "body", field: "message", fallback: "Some days it's fine. Today isn't one of them.", paced: true },
    { type: "quote", field: "memory" },
    { type: "signature", field: "senderName", prefix: "—", fallback: "Yours, from here" },
    { type: "cta", label: "Send One Back", href: "/templates" },
  ],
  envelope: {
    enabled: true,
    sealEmoji: "✈️",
    hint: "Tap to open",
    paperColor: "#bae6fd",
    flapColor: "primary",
    liningColor: "#fbfeff",
  },
  og: {
    title: "From Far Away",
    mainIcon: "✈️",
    decorations: "💙",
    bgGradient: "linear-gradient(135deg, #e0f2fe 0%, white 50%, #0284c720 100%)",
    primaryColor: "accent",
    secondaryColor: "secondary",
  },
};

/**
 * The confession. No hero art and almost no decor on purpose: this card should
 * feel like someone typing with their hands shaking, not like a greeting card.
 */
export const crushTheme: ThemeDraft = {
  id: "crush-confession",
  name: "Finally Saying It",
  palette: {
    primary: "#f43f5e",
    secondary: "#ffe4e6",
    accent: "#be123c",
    ink: "#41212a",
    paper: "#fffafb",
    glow: "#fda4af",
  },
  surface: { kind: "paper", texture: "grain", tint: "paper" },
  frame: { kind: "rounded", radiusPx: 16, shadow: "xl" },
  layout: "letter-sheet",
  ambient: {
    enabled: true,
    blobs: [
      { anchor: "center", sizePx: 760, color: "secondary", opacity: 0.35, durationSec: 16 },
    ],
  },
  decor: [
    {
      kind: "float",
      phase: "always",
      count: 5,
      glyphs: ["💗", "✨"],
      direction: "up",
      speedSec: [26, 42],
      sizeRem: 1.1,
      opacity: 0.3,
    },
  ],
  motion: {
    intro: "fade",
    introDelayMs: 350,
    staggerMs: 180,
    reveal: "typewriter",
    revealStepMs: 30,
  },
  blocks: [
    { type: "eyebrow", text: "Drafted eleven times. Sent once." },
    { type: "title", field: "recipientName", fallback: "You", color: "primary", size: "lg" },
    { type: "subtitle", field: "since", prefix: "Since", suffix: "." },
    { type: "body", field: "message", fallback: "I've typed and deleted this so many times.", paced: true },
    { type: "signature", field: "senderName", prefix: "—", fallback: "Me" },
    { type: "cta", label: "Say Something Back", href: "/templates" },
  ],
  envelope: {
    enabled: true,
    sealEmoji: "🫣",
    hint: "Tap. It took a lot to send this.",
    paperColor: "#ffe4e6",
    flapColor: "primary",
    liningColor: "#fffafb",
  },
  og: {
    title: "Something To Tell You",
    mainIcon: "💌",
    decorations: "💗",
    bgGradient: "linear-gradient(135deg, #ffe4e6 0%, white 50%, #f43f5e20 100%)",
    primaryColor: "primary",
    secondaryColor: "secondary",
  },
};

/** Just because: sunlight, short, and no occasion badge — that is the concept. */
export const justBecauseTheme: ThemeDraft = {
  id: "just-because",
  name: "Just Because",
  palette: {
    primary: "#f59e0b",
    secondary: "#fef3c7",
    accent: "#b45309",
    ink: "#42320f",
    paper: "#fffdf6",
    glow: "#fcd34d",
  },
  surface: { kind: "gradient", from: "#ffffff", to: "#fffbeb", angleDeg: 155 },
  frame: { kind: "rounded", radiusPx: 26, shadow: "xl" },
  layout: "centered-card",
  ambient: {
    enabled: true,
    blobs: [
      { anchor: "top-right", sizePx: 620, color: "glow", opacity: 0.35, durationSec: 12 },
    ],
  },
  decor: [
    {
      kind: "float",
      phase: "always",
      count: 7,
      glyphs: ["☀️", "🌼", "✨"],
      direction: "up",
      speedSec: [20, 32],
      sizeRem: 1.25,
      opacity: 0.4,
    },
  ],
  blocks: [
    { type: "eyebrow", text: "No occasion" },
    { type: "hero", media: { kind: "emoji", value: "☀️", sizeRem: 4.5, pulse: true } },
    { type: "title", field: "recipientName", fallback: "You", color: "accent", size: "lg" },
    { type: "body", field: "message", fallback: "No birthday, no fight, no reason. Just thinking about you.", paced: true },
    { type: "signature", field: "senderName", prefix: "—", fallback: "Me" },
    { type: "cta", label: "Send One Back", href: "/templates" },
  ],
  envelope: {
    enabled: true,
    sealEmoji: "☀️",
    hint: "Tap to open",
    paperColor: "#fef3c7",
    flapColor: "primary",
    liningColor: "#fffdf6",
  },
  og: {
    title: "Just Because",
    mainIcon: "☀️",
    decorations: "🌼",
    bgGradient: "linear-gradient(135deg, #fef3c7 0%, white 50%, #f59e0b20 100%)",
    primaryColor: "accent",
    secondaryColor: "secondary",
  },
};
