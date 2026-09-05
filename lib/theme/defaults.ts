// The theme every template gets for free. React-free — see ./types.ts.
//
// `makeDefaultTheme` is a faithful port of the generic card layout that lived
// in components/GenericCardView.tsx, expressed as blocks. It exists so an
// unregistered template still renders something correct and on-brand: adding a
// template to lib/templates.ts is enough, and a bespoke theme is an upgrade
// rather than a requirement.

import type { Template } from "@/lib/types";
import { CATEGORIES } from "@/lib/types";
import { DEFAULT_FONT_ID } from "@/lib/fonts";
import type {
  AmbientSpec,
  BlockSpec,
  DecorSpec,
  EnvelopeSpec,
  FrameSpec,
  MediaSpec,
  MotionSpec,
  OgSpec,
  SurfaceSpec,
  Theme,
  ThemePalette,
} from "./types";

/**
 * Hero GIFs, moved here from GenericCardView so template visuals live in
 * config. Any host added here must also be in next.config.ts `remotePatterns`.
 */
export const HERO_GIFS: Record<
  string,
  { src: string; alt: string; width: number; height: number }
> = {
  "love-letter": {
    src: "https://media1.tenor.com/m/HI7GdDJ1yq0AAAAC/us-you-and-me.gif",
    alt: "Us You And Me Sticker",
    width: 280,
    height: 280,
  },
  "miss-you": {
    src: "https://media1.tenor.com/m/rzG9YBjxW-0AAAAC/peach-sad.gif",
    alt: "Peach Sad GIF",
    width: 280,
    height: 280,
  },
  anniversary: {
    src: "https://media1.tenor.com/m/K6WkauZF1ToAAAAC/happy-valentines-day-valentines-day.gif",
    alt: "Happy Valentines Day Hugs Sticker",
    width: 280,
    height: 280,
  },
};

export const DEFAULT_INK = "#1f2937";
export const DEFAULT_PAPER = "#ffffff";

export function makeDefaultPalette(template: Template): ThemePalette {
  return {
    primary: template.colors.primary,
    secondary: template.colors.secondary,
    accent: template.colors.accent,
    ink: DEFAULT_INK,
    paper: DEFAULT_PAPER,
    glow: template.colors.secondary,
  };
}

export function makeDefaultSurface(): SurfaceSpec {
  return { kind: "glass", tint: "secondary", shine: true };
}

export function makeDefaultFrame(): FrameSpec {
  return { kind: "rounded", radiusPx: 24, shadow: "2xl" };
}

export function makeDefaultAmbient(): AmbientSpec {
  return {
    enabled: true,
    blobs: [
      {
        anchor: "top-left",
        sizePx: 800,
        color: "secondary",
        opacity: 0.31,
        durationSec: 8,
      },
      {
        anchor: "bottom-right",
        sizePx: 800,
        color: "primary",
        opacity: 0.25,
        durationSec: 10,
        delaySec: 2,
      },
    ],
  };
}

export function makeDefaultDecor(): DecorSpec[] {
  return [
    {
      kind: "float",
      phase: "always",
      count: 14,
      glyphs: ["💕", "✨", "💌", "🌸", "💗"],
      direction: "up",
      speedSec: [15, 25],
      sizeRem: 1.5,
      opacity: 0.6,
    },
    {
      kind: "burst",
      phase: "always",
      count: 18,
      colors: ["primary", "secondary", "accent", "#ffd700", "#ff69b4"],
      shape: "circle",
      spreadPx: 500,
      repeatDelaySec: 5,
    },
  ];
}

export function makeDefaultMotion(): MotionSpec {
  return {
    intro: "spring-pop",
    // The old generic view waited 500ms before showing anything. Kept, because
    // it reads as the card settling rather than as a slow page.
    introDelayMs: 500,
    staggerMs: 100,
    reveal: "lines",
    revealStepMs: 350,
  };
}

export function makeDefaultEnvelope(template: Template): EnvelopeSpec {
  return {
    // Per-card this is overridden by lib/cardStyle.ts, which defaults legacy
    // rows to false so an already-shared link never changes behaviour.
    enabled: true,
    sealEmoji: template.emoji,
    hint: "Tap to open",
    paperColor: "secondary",
    flapColor: "primary",
    liningColor: "paper",
  };
}

function makeDefaultHero(template: Template): MediaSpec {
  const gif = HERO_GIFS[template.id];
  if (gif) {
    return {
      kind: "gif",
      src: gif.src,
      alt: gif.alt,
      width: gif.width,
      height: gif.height,
      maxWidthPx: 280,
    };
  }
  return { kind: "emoji", value: template.emoji, sizeRem: 6, pulse: true };
}

export function makeDefaultBlocks(template: Template): BlockSpec[] {
  const category = CATEGORIES.find((c) => c.id === template.category);
  return [
    {
      type: "badge",
      text: category ? `${category.emoji} ${category.name}` : template.emoji,
    },
    { type: "hero", media: makeDefaultHero(template) },
    {
      type: "title",
      field: "recipientName",
      fallback: "My Dear",
      color: "primary",
      size: "xl",
    },
    { type: "subtitle", field: "petName" },
    {
      type: "body",
      field: "message",
      fallbackFields: ["reason"],
      fallback: template.previewText,
      paced: true,
    },
    { type: "quote", field: "memory", fallbackFields: ["promise"] },
    { type: "stat", field: "years", label: "years together" },
    { type: "highlight", field: "wish", emoji: "✨" },
    {
      type: "signature",
      field: "senderName",
      prefix: "—",
      fallback: "With Love",
    },
    { type: "cta", label: "Create Your Own Card", href: "/templates" },
  ];
}

/**
 * A port of `getThemeConfig()` from app/share/[id]/opengraph-image.tsx,
 * branch for branch, so unifying the OG route produces pixel-identical PNGs.
 *
 * Note the quirk this preserves: the id/category chain is evaluated in order,
 * so `valentine-ask` and `anniversary` fall into the `category === "love"`
 * branch and render 💌 rather than their own 💝 / 💍. That is how the shipped
 * images already look. Fixing it is a deliberate design change — make it in
 * the per-theme `og` spec, not here, or every existing preview shifts at once.
 */
export function makeDefaultOg(template: Template): OgSpec {
  const base: OgSpec = {
    bgGradient: "linear-gradient(135deg, #fce7f3 0%, white 50%, #ec489920 100%)",
    // Palette tokens rather than literals, so a per-card palette override
    // recolours the link preview and the card together.
    primaryColor: "primary",
    secondaryColor: "secondary",
    mainIcon: template.emoji,
    decorations: "💕",
    title: "A Letter For",
  };

  const { id, category } = template;

  if (id === "birthday-wish" || category === "celebration") {
    return {
      ...base,
      bgGradient:
        "linear-gradient(135deg, #fef3c7 0%, white 50%, #f59e0b20 100%)",
      mainIcon: "🎂",
      decorations: "🎈",
      title: "Happy Birthday",
    };
  }
  if (id === "sorry-card" || category === "apology") {
    return {
      ...base,
      bgGradient:
        "linear-gradient(135deg, #dbeafe 0%, white 50%, #3b82f620 100%)",
      mainIcon: "🥺",
      decorations: "💙",
      title: "Note of Apology",
    };
  }
  if (id === "miss-you" || category === "longing") {
    return {
      ...base,
      bgGradient:
        "linear-gradient(135deg, #cffafe 0%, white 50%, #06b6d420 100%)",
      mainIcon: "💭",
      decorations: "✨",
      title: "Thinking of You",
    };
  }
  // Phase 6 categories. Appending rather than reordering: none of these can
  // shift an existing preview, because no card in the table has one of these
  // categories. Every Phase 6 template also sets `og` in its own theme, so
  // these only ever apply to a future template that has no theme yet.
  if (category === "festival") {
    return {
      ...base,
      bgGradient:
        "linear-gradient(135deg, #fef3c7 0%, white 50%, #f59e0b20 100%)",
      decorations: "✨",
      title: "Wishes For",
    };
  }
  if (category === "friendship") {
    return {
      ...base,
      bgGradient:
        "linear-gradient(135deg, #ffedd5 0%, white 50%, #f9731620 100%)",
      decorations: "🧡",
      title: "A Letter For",
    };
  }
  if (category === "gratitude") {
    return {
      ...base,
      bgGradient:
        "linear-gradient(135deg, #ccfbf1 0%, white 50%, #0d948820 100%)",
      decorations: "🌿",
      title: "Thank You",
    };
  }
  if (id === "love-letter" || category === "love") {
    return {
      ...base,
      bgGradient:
        "linear-gradient(135deg, #fce7f3 0%, white 50%, #ec489920 100%)",
      mainIcon: "💌",
      decorations: "💖",
      title: "A Love Letter For",
    };
  }
  return base;
}

export function makeDefaultTheme(template: Template): Theme {
  return {
    id: `default:${template.id}`,
    name: template.name,
    palette: makeDefaultPalette(template),
    surface: makeDefaultSurface(),
    frame: makeDefaultFrame(),
    ambient: makeDefaultAmbient(),
    decor: makeDefaultDecor(),
    motion: makeDefaultMotion(),
    layout: "centered-card",
    fontDefaults: { header: DEFAULT_FONT_ID, body: DEFAULT_FONT_ID },
    blocks: makeDefaultBlocks(template),
    interaction: { kind: "none" },
    envelope: makeDefaultEnvelope(template),
    og: makeDefaultOg(template),
  };
}

/** The theme used when even the template is unknown (a deleted template id). */
export const FALLBACK_TEMPLATE: Template = {
  id: "unknown",
  name: "A Letter",
  description: "A letter from someone who cares",
  category: "love",
  emoji: "💌",
  previewText: "Someone wrote you something.",
  colors: { primary: "#ec4899", secondary: "#fce7f3", accent: "#be185d" },
  fields: [],
};
