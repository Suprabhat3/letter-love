// love-letter, anniversary, miss-you.
//
// These three are the biggest visible gap in the product: today they differ
// only by a Tenor GIF URL, so three quite different feelings render as the
// same pink glass card. Each gets its own surface, frame, decor and pacing.

import { HERO_GIFS } from "../defaults";
import type { ThemeDraft } from "../types";

/**
 * A love letter should feel like paper, not like an app. Linen surface,
 * deckle edge, warm pink, and a slow line-by-line reveal.
 */
export const loveLetterTheme: ThemeDraft = {
  id: "love-letter",
  name: "Love Letter",
  palette: {
    primary: "#ec4899",
    secondary: "#f9a8d4",
    accent: "#be185d",
    ink: "#4a3340",
    paper: "#fffaf7",
    glow: "#f9a8d4",
  },
  surface: { kind: "paper", texture: "linen", tint: "paper" },
  frame: { kind: "deckle", radiusPx: 8, shadow: "xl" },
  layout: "letter-sheet",
  ambient: {
    enabled: true,
    blobs: [
      {
        anchor: "top-left",
        sizePx: 700,
        color: "secondary",
        opacity: 0.3,
        durationSec: 12,
      },
      {
        anchor: "bottom-right",
        sizePx: 600,
        color: "primary",
        opacity: 0.18,
        durationSec: 14,
        delaySec: 3,
      },
      {
        anchor: "center",
        sizePx: 840,
        color: "glow",
        opacity: 0.16,
        durationSec: 20,
        delaySec: 6,
      },
    ],
  },
  decor: [
    {
      kind: "float",
      phase: "always",
      count: 15,
      glyphs: ["💌", "💕", "🌸", "🕊️", "💗"],
      direction: "up",
      speedSec: [18, 30],
      sizeRem: 1.7,
      opacity: 0.45,
    },
    {
      kind: "float",
      phase: "always",
      count: 12,
      glyphs: ["✨", "🤍"],
      direction: "up",
      speedSec: [30, 46],
      sizeRem: 1,
      opacity: 0.28,
    },
  ],
  motion: {
    intro: "fade",
    introDelayMs: 200,
    staggerMs: 140,
    reveal: "lines",
    revealStepMs: 450,
  },
  blocks: [
    { type: "eyebrow", text: "A letter for you" },
    {
      type: "hero",
      media: {
        kind: "gif",
        ...HERO_GIFS["love-letter"],
        maxWidthPx: 240,
      },
    },
    {
      type: "title",
      field: "recipientName",
      fallback: "My Love",
      color: "primary",
      size: "xl",
    },
    { type: "subtitle", field: "petName" },
    {
      type: "body",
      field: "message",
      fallback: "Every moment with you feels like magic.",
      paced: true,
    },
    { type: "quote", field: "memory" },
    {
      type: "signature",
      field: "senderName",
      prefix: "Forever yours,",
      fallback: "Forever Yours",
    },
    { type: "cta", label: "Write One Back", href: "/templates" },
  ],
  envelope: {
    enabled: true,
    sealEmoji: "💌",
    hint: "Tap to open your letter",
    paperColor: "#fffaf7",
    flapColor: "secondary",
    liningColor: "primary",
  },
};

/**
 * An anniversary is a number before it is a message. The years are the hero:
 * a big gold stat above everything else.
 */
export const anniversaryTheme: ThemeDraft = {
  id: "anniversary",
  name: "Anniversary",
  palette: {
    primary: "#a855f7",
    secondary: "#e9d5ff",
    accent: "#7c3aed",
    ink: "#332545",
    paper: "#fdfbff",
    glow: "#d8b4fe",
  },
  surface: {
    kind: "gradient",
    from: "#ffffff",
    to: "#f3e8ff",
    angleDeg: 160,
  },
  frame: { kind: "stamped", radiusPx: 20, borderColor: "#d8b4fe", shadow: "2xl" },
  layout: "centered-card",
  ambient: {
    enabled: true,
    blobs: [
      {
        anchor: "top-right",
        sizePx: 720,
        color: "secondary",
        opacity: 0.4,
        durationSec: 10,
      },
      {
        anchor: "bottom-left",
        sizePx: 640,
        color: "accent",
        opacity: 0.18,
        durationSec: 13,
        delaySec: 2,
      },
      {
        anchor: "center",
        sizePx: 860,
        color: "glow",
        opacity: 0.16,
        durationSec: 19,
        delaySec: 5,
      },
    ],
  },
  decor: [
    {
      kind: "float",
      phase: "always",
      count: 15,
      glyphs: ["🥂", "💜", "🤍", "💫", "🎼"],
      direction: "up",
      speedSec: [16, 26],
      sizeRem: 1.8,
      opacity: 0.5,
    },
    {
      kind: "float",
      phase: "always",
      count: 12,
      glyphs: ["✨", "⭐"],
      direction: "up",
      speedSec: [28, 42],
      sizeRem: 1.05,
      opacity: 0.3,
    },
    {
      kind: "burst",
      phase: "always",
      count: 20,
      colors: ["#f5d0fe", "#c084fc", "#facc15", "#ffffff"],
      shape: "square",
      spreadPx: 520,
      repeatDelaySec: 6,
    },
  ],
  motion: {
    intro: "spring-pop",
    introDelayMs: 300,
    staggerMs: 120,
    reveal: "lines",
    revealStepMs: 400,
  },
  blocks: [
    { type: "eyebrow", text: "Our anniversary" },
    { type: "stat", field: "years", label: "years together", color: "primary" },
    {
      type: "hero",
      media: { kind: "gif", ...HERO_GIFS.anniversary, maxWidthPx: 240 },
    },
    {
      type: "title",
      field: "recipientName",
      fallback: "My Love",
      color: "accent",
      size: "lg",
    },
    {
      type: "body",
      field: "message",
      fallback: "Another year of loving you has been the greatest gift.",
      paced: true,
    },
    { type: "quote", field: "memory" },
    {
      type: "signature",
      field: "senderName",
      prefix: "—",
      fallback: "Your Love",
    },
    { type: "cta", label: "Create Your Own", href: "/templates" },
  ],
  envelope: {
    enabled: true,
    sealEmoji: "💍",
    hint: "Tap to open",
    paperColor: "#f3e8ff",
    flapColor: "primary",
    liningColor: "#fdfbff",
  },
};

/**
 * Missing someone is quiet. Almost no decor, a cool palette, and a typewriter
 * reveal — people writing this one tend to write one long unbroken paragraph,
 * which a line-by-line reveal degrades to a single line.
 */
export const missYouTheme: ThemeDraft = {
  id: "miss-you",
  name: "Miss You",
  palette: {
    primary: "#06b6d4",
    secondary: "#a5f3fc",
    accent: "#0891b2",
    ink: "#173b45",
    paper: "#fbfeff",
    glow: "#a5f3fc",
  },
  surface: { kind: "glass", tint: "secondary", shine: false },
  frame: { kind: "rounded", radiusPx: 28, shadow: "xl" },
  layout: "letter-sheet",
  ambient: {
    enabled: true,
    blobs: [
      {
        anchor: "center",
        sizePx: 900,
        color: "secondary",
        opacity: 0.28,
        durationSec: 18,
      },
      {
        anchor: "top-left",
        sizePx: 640,
        color: "glow",
        opacity: 0.2,
        durationSec: 14,
        delaySec: 4,
      },
      {
        anchor: "bottom-right",
        sizePx: 580,
        color: "primary",
        opacity: 0.12,
        durationSec: 23,
        delaySec: 8,
      },
    ],
  },
  decor: [
    {
      kind: "float",
      phase: "always",
      count: 14,
      glyphs: ["💭", "☁️", "🌙", "🕰️"],
      direction: "down",
      speedSec: [24, 40],
      sizeRem: 1.6,
      opacity: 0.36,
    },
    {
      kind: "float",
      phase: "always",
      count: 12,
      glyphs: ["✨", "💧"],
      direction: "down",
      speedSec: [36, 52],
      sizeRem: 0.95,
      opacity: 0.22,
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
    { type: "eyebrow", text: "Thinking of you" },
    {
      type: "hero",
      media: { kind: "gif", ...HERO_GIFS["miss-you"], maxWidthPx: 220 },
    },
    {
      type: "title",
      field: "recipientName",
      fallback: "My Dear",
      color: "accent",
      size: "lg",
    },
    {
      type: "body",
      field: "message",
      fallback: "Distance means nothing when someone means everything.",
      paced: true,
    },
    { type: "quote", field: "memory" },
    {
      type: "signature",
      field: "senderName",
      prefix: "—",
      fallback: "Missing You",
    },
    { type: "cta", label: "Send One Back", href: "/templates" },
  ],
  envelope: {
    enabled: true,
    sealEmoji: "💭",
    hint: "Tap to open",
    paperColor: "#e0f7fb",
    flapColor: "primary",
    liningColor: "#fbfeff",
  },
};
