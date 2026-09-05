// The vocabulary a card is described in.
//
// IMPORTANT: this module must stay React-free and dependency-free.
// `app/share/[id]/opengraph-image.tsx` imports from here and runs in its own
// Satori bundle, so a stray `import { motion }` or a "use client" directive
// anywhere under lib/theme/ will bloat or outright break the OG route.
// Enforced by a no-restricted-imports rule in eslint.config.mjs.

import type { FontId } from "@/lib/fonts";

/**
 * A colour is either a literal `#rrggbb` / `#rrggbbaa` string or the name of a
 * palette slot, resolved against the theme at render time by
 * `resolveColor()` in ./color. Palette references are what let a user-chosen
 * palette recolour a whole theme without touching any spec.
 */
export type ColorToken =
  | "primary"
  | "secondary"
  | "accent"
  | "ink"
  | "paper"
  | "glow";

export type ColorValue = ColorToken | (string & {});

export interface ThemePalette {
  primary: string;
  secondary: string;
  accent: string;
  /** Body text. */
  ink: string;
  /** The card surface behind the text. */
  paper: string;
  /** Ambient blobs and halos. */
  glow: string;
}

// ---------------------------------------------------------------------------
// Surface, frame, ambient
// ---------------------------------------------------------------------------

export type SurfaceSpec =
  | { kind: "glass"; tint?: ColorValue; shine?: boolean }
  | { kind: "solid"; color: ColorValue }
  | { kind: "gradient"; from: ColorValue; to: ColorValue; angleDeg?: number }
  | { kind: "paper"; texture: "linen" | "grain" | "kraft"; tint?: ColorValue };

export interface FrameSpec {
  kind: "none" | "rounded" | "deckle" | "polaroid" | "stamped";
  radiusPx?: number;
  borderColor?: ColorValue;
  /** Tailwind shadow scale, kept as a plain token so the OG route can ignore it. */
  shadow?: "none" | "md" | "xl" | "2xl";
}

export type BlobAnchor =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "center";

export interface AmbientBlob {
  anchor: BlobAnchor;
  sizePx: number;
  color: ColorValue;
  opacity: number;
  durationSec: number;
  delaySec?: number;
}

export interface AmbientSpec {
  enabled: boolean;
  blobs: AmbientBlob[];
}

// ---------------------------------------------------------------------------
// Decor
// ---------------------------------------------------------------------------

/**
 * Where something sits relative to the card's interaction.
 *
 * For decor this encodes SorryCard's "rain before forgiveness, hearts after"
 * as configuration rather than as two hand-written branches. For blocks it
 * defines the running order the renderer follows:
 *
 *   [always + pre blocks] → [the interaction widget] → [always + post blocks]
 *
 * with pre blocks dropping out and post blocks appearing once the interaction
 * completes. A theme with `interaction.kind === "none"` simply has no pre/post
 * blocks and renders as one pass.
 */
export type Phase = "pre" | "post" | "always";

interface DecorBase {
  phase: Phase;
  /** Multiplied by the viewport-derived density factor, then hard-capped. */
  count: number;
  opacity?: number;
}

export type DecorSpec =
  | (DecorBase & {
      kind: "float";
      glyphs: string[];
      direction: "up" | "down";
      /** [min, max] seconds for one traversal. */
      speedSec: [number, number];
      sizeRem?: number;
      /** "balloon" adds the tinted string-tail treatment. */
      variant?: "plain" | "balloon";
      tints?: string[];
    })
  | (DecorBase & {
      kind: "burst";
      colors: ColorValue[];
      shape: "circle" | "square";
      spreadPx: number;
      /** Seconds between repeats; omit for a one-shot burst. */
      repeatDelaySec?: number;
    });

// ---------------------------------------------------------------------------
// Media
// ---------------------------------------------------------------------------

/**
 * The `remote` kind is deliberately present but unused: Phase 8 (attachments)
 * adds ImageKit URLs here, and having the slot now means that phase needs no
 * change to this type. Any host used by `remote` must also be added to
 * next.config.ts `remotePatterns`.
 */
export type MediaSpec =
  | { kind: "emoji"; value: string; sizeRem?: number; pulse?: boolean }
  | {
      kind: "gif";
      src: string;
      alt: string;
      width: number;
      height: number;
      maxWidthPx?: number;
    }
  | { kind: "remote"; src: string; alt: string; width: number; height: number };

// ---------------------------------------------------------------------------
// Blocks — the ordered content of a card
// ---------------------------------------------------------------------------

export type BlockType =
  | "badge"
  | "hero"
  | "eyebrow"
  | "title"
  | "subtitle"
  | "body"
  | "quote"
  | "stat"
  | "highlight"
  | "signature"
  | "cta"
  | "replay"
  | "list"
  | "pack"
  | "spacer";

interface BlockBase {
  /** Which interaction phase this block belongs to. Defaults to "always". */
  phase?: Phase;
  /**
   * Render only when this content field is non-empty. Text blocks infer it
   * from their own `field`; use this for blocks whose visibility depends on a
   * different field than the one they display.
   */
  when?: string;
}

/**
 * A text-bearing block reads `field` from the card's content, falling back
 * through `fallbackFields` and finally to the literal `fallback`. `text` wins
 * over all of them and is used for fixed copy like "Happy Birthday".
 *
 * A block whose field resolves to nothing and that has no fallback removes
 * itself — that is how optional template fields (petName, years, wish) stay
 * out of the layout without a single conditional in the renderer.
 */
interface TextBlockBase extends BlockBase {
  text?: string;
  field?: string;
  fallbackFields?: string[];
  fallback?: string;
  color?: ColorValue;
  /** Literal copy wrapped around the resolved value, e.g. "I promise to …". */
  prefix?: string;
  suffix?: string;
}

export type BlockSpec =
  | (TextBlockBase & { type: "badge"; emoji?: string })
  | (BlockBase & { type: "hero"; media: MediaSpec })
  | (TextBlockBase & { type: "eyebrow" })
  | (TextBlockBase & { type: "title"; size?: "md" | "lg" | "xl" })
  | (TextBlockBase & { type: "subtitle" })
  | (TextBlockBase & {
      type: "body";
      /** Split on newlines and reveal line by line (see MotionSpec.reveal). */
      paced?: boolean;
    })
  | (TextBlockBase & { type: "quote" })
  | (TextBlockBase & { type: "stat"; label: string })
  | (TextBlockBase & { type: "highlight"; label?: string; emoji?: string })
  | (TextBlockBase & { type: "signature" })
  | (BlockBase & {
      type: "cta";
      label: string;
      href: string;
      variant?: "primary" | "ghost";
    })
  | (BlockBase & { type: "replay"; label?: string })
  /**
   * One content field split on newlines and rendered as items — the
   * "Reasons I Love You" layout. A list is one field rather than N fields
   * because the sender should be able to write four reasons or fourteen
   * without the form deciding for them.
   */
  | (BlockBase & {
      type: "list";
      field: string;
      numbered?: boolean;
      bullet?: string;
      /** Hard cap, so a pasted essay cannot become a 200-item card. */
      max?: number;
    })
  /**
   * A pack of separately sealed notes — "Open When…". Each item is its own
   * content field and stays hidden until tapped, which is the entire point:
   * the recipient is meant to come back to this card on a different day.
   */
  | (BlockBase & {
      type: "pack";
      items: { label: string; field: string; emoji?: string }[];
    })
  | (BlockBase & { type: "spacer"; size?: "sm" | "md" | "lg" });

// ---------------------------------------------------------------------------
// Motion
// ---------------------------------------------------------------------------

export interface MotionSpec {
  intro: "none" | "fade" | "rise" | "spring-pop";
  introDelayMs: number;
  /** Milliseconds between consecutive blocks entering. */
  staggerMs: number;
  /**
   * How the paced body is revealed once the envelope is open.
   * "typewriter" is the better preset for one-unbroken-paragraph writers,
   * for whom "lines" degrades to a single line.
   */
  reveal: "none" | "lines" | "typewriter";
  revealStepMs: number;
}

export type LayoutVariant =
  | "centered-card"
  | "letter-sheet"
  | "polaroid"
  | "pages"
  | "list";

// ---------------------------------------------------------------------------
// Interaction
// ---------------------------------------------------------------------------

interface InteractionBase {
  /** Renders a `replay` block after completion. Preserves BirthdayCard's button. */
  replayable?: boolean;
}

export type InteractionSpec =
  | (InteractionBase & { kind: "none" })
  | (InteractionBase & {
      kind: "yes-no-game";
      yesLabel: string;
      /** Cycled through on each refusal. */
      noPhrases: string[];
      /** Pixels the YES button grows per refusal. */
      growthPx: number;
      maxYesPx: number;
      /** Make the NO button dodge the cursor on hover. */
      evadeNo?: boolean;
    })
  | (InteractionBase & {
      kind: "blow-candles";
      candles: number;
      hint: string;
      /** How long the smoke plays before the message appears. */
      smokeMs: number;
    });

export type InteractionKind = InteractionSpec["kind"];

// ---------------------------------------------------------------------------
// Envelope
// ---------------------------------------------------------------------------

export interface EnvelopeSpec {
  /**
   * Legacy cards resolve to `false` (see lib/cardStyle.ts): a card someone has
   * already shared must not change behaviour mid-flight.
   */
  enabled: boolean;
  sealEmoji: string;
  /** Shown under the seal, e.g. "Tap to open". */
  hint: string;
  paperColor: ColorValue;
  flapColor: ColorValue;
  liningColor: ColorValue;
}

// ---------------------------------------------------------------------------
// Open Graph
// ---------------------------------------------------------------------------

/**
 * Plain serializable values only — Satori is not a browser. It supports no
 * grid, no backdrop-filter and no animation, and needs `display: flex` on
 * every multi-child div, so the OG route shares this *config* with the
 * renderer rather than sharing components.
 */
export interface OgSpec {
  /** The pill above the icon, e.g. "A Love Letter For". */
  title: string;
  mainIcon: string;
  decorations: string;
  bgGradient: string;
  primaryColor: ColorValue;
  secondaryColor: ColorValue;
}

// ---------------------------------------------------------------------------
// Theme
// ---------------------------------------------------------------------------

export interface Theme {
  id: string;
  name: string;
  palette: ThemePalette;
  surface: SurfaceSpec;
  frame: FrameSpec;
  ambient: AmbientSpec;
  decor: DecorSpec[];
  motion: MotionSpec;
  layout: LayoutVariant;
  fontDefaults: { header: FontId; body: FontId };
  blocks: BlockSpec[];
  interaction: InteractionSpec;
  envelope: EnvelopeSpec;
  og: OgSpec;
}

/**
 * A theme as authored: everything optional except the identity, with
 * `makeDefaultTheme(template)` supplying the rest. Keeping the authoring type
 * separate is what makes a new template a ~20-line config entry.
 */
export type ThemeDraft = Partial<Omit<Theme, "id" | "name">> & {
  id: string;
  name: string;
};
