// Card style lives in a namespaced slot inside the `data` JSONB, separate from
// user content. Historically the font was smuggled in as a flat `fontName` key
// alongside `recipientName`/`message`, where it could collide with a real field.
//
// SECURITY: `cards` currently allows public INSERT, so anything in `data` is
// attacker-controlled. Palette values are interpolated into inline styles and
// template strings by the renderer, so `readCardStyle` is a validation boundary,
// not tidiness: it whitelists shapes, enforces a hex regex, caps lengths, and
// DROPS everything it does not recognise. Never widen it with a raw image `src`
// without also gating on next.config.ts remotePatterns.

import { DEFAULT_FONT_ID, FontId, isFontId } from "./fonts";

export const STYLE_KEY = "_style" as const;

export interface CardStyle {
  font?: FontId;
  themeId?: string;
  palette?: { primary?: string; secondary?: string; accent?: string };
  decor?: string;
  envelope?: { enabled?: boolean; sealEmoji?: string; hint?: string };
}

export interface ResolvedCardStyle {
  font: FontId;
  themeId?: string;
  palette?: { primary?: string; secondary?: string; accent?: string };
  decor?: string;
  envelope: { enabled: boolean; sealEmoji?: string; hint?: string };
}

/** Anything stored in the `data` column. Content values are strings; `_style` is an object. */
export type StoredCardData = Record<string, unknown>;

const HEX_COLOR = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
const SAFE_ID = /^[a-z0-9][a-z0-9-]{0,47}$/;
const MAX_HINT = 80;
const MAX_SEAL = 8;

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

function hex(value: unknown): string | undefined {
  return typeof value === "string" && HEX_COLOR.test(value) ? value : undefined;
}

function safeId(value: unknown): string | undefined {
  return typeof value === "string" && SAFE_ID.test(value) ? value : undefined;
}

/**
 * Drop C0/C1 controls, zero-width joiners and bidi overrides before capping.
 * Expressed as code-point comparisons so there are no escape sequences.
 */
function stripUnsafeChars(input: string): string {
  let out = "";
  for (const ch of input) {
    const c = ch.codePointAt(0) as number;
    if (c < 32) continue;
    if (c >= 127 && c <= 159) continue;
    if (c >= 8203 && c <= 8207) continue;
    if (c >= 8232 && c <= 8238) continue;
    if (c === 65279) continue;
    out += ch;
  }
  return out;
}

function clampText(value: unknown, max: number): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = stripUnsafeChars(value).trim().slice(0, max);
  return trimmed.length > 0 ? trimmed : undefined;
}

function readPalette(
  raw: unknown,
): { primary?: string; secondary?: string; accent?: string } | undefined {
  const obj = asRecord(raw);
  if (!obj) return undefined;
  const palette = {
    primary: hex(obj.primary),
    secondary: hex(obj.secondary),
    accent: hex(obj.accent),
  };
  return palette.primary || palette.secondary || palette.accent
    ? palette
    : undefined;
}

/**
 * Read the style slot from a stored card.
 *
 * Back-compat hinge for the whole card system: every row written before the
 * `_style` split has a flat `fontName` and must keep rendering. Never read
 * `data.fontName` directly anywhere else.
 */
export function readCardStyle(data: StoredCardData | null | undefined): ResolvedCardStyle {
  const raw = asRecord(data?.[STYLE_KEY]);

  const font = isFontId(raw?.font)
    ? raw.font
    : isFontId(data?.fontName) // legacy flat key
      ? (data!.fontName as FontId)
      : DEFAULT_FONT_ID;

  const envelopeRaw = asRecord(raw?.envelope);

  return {
    font,
    themeId: safeId(raw?.themeId),
    palette: readPalette(raw?.palette),
    decor: safeId(raw?.decor),
    envelope: {
      // Legacy cards (no `_style`) stay off: a link someone already shared
      // must not change behaviour mid-flight.
      enabled: envelopeRaw?.enabled === true,
      sealEmoji: clampText(envelopeRaw?.sealEmoji, MAX_SEAL),
      hint: clampText(envelopeRaw?.hint, MAX_HINT),
    },
  };
}

/** The user-authored fields only, with style keys stripped out. */
export function readCardContent(
  data: StoredCardData | null | undefined,
): Record<string, string> {
  const out: Record<string, string> = {};
  if (!data) return out;
  for (const [key, value] of Object.entries(data)) {
    if (key === STYLE_KEY || key === "fontName") continue;
    if (typeof value === "string") out[key] = value;
  }
  return out;
}

/**
 * Compose the `data` payload to persist.
 * `mirrorLegacyFont` dual-writes the flat `fontName` for one release so a
 * rollback to the old renderer still shows the right font.
 */
export function writeCardData(
  content: Record<string, string>,
  style: CardStyle,
  { mirrorLegacyFont = true }: { mirrorLegacyFont?: boolean } = {},
): StoredCardData {
  const cleanContent: Record<string, string> = {};
  for (const [key, value] of Object.entries(content)) {
    if (key === STYLE_KEY || key === "fontName") continue;
    cleanContent[key] = value;
  }

  const out: StoredCardData = { ...cleanContent, [STYLE_KEY]: style };
  if (mirrorLegacyFont && style.font) out.fontName = style.font;
  return out;
}
