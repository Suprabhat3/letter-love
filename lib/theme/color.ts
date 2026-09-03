// Colour resolution for theme specs. React-free — see ./types.ts.

import type { ColorValue, ThemePalette } from "./types";

const TOKENS = [
  "primary",
  "secondary",
  "accent",
  "ink",
  "paper",
  "glow",
] as const;

const HEX = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

/**
 * Turn a spec colour into a literal CSS colour.
 *
 * Anything that is neither a palette token nor a hex literal resolves to the
 * palette's primary. That is not defensiveness for its own sake: `_style`
 * arrives from a public INSERT and these values are interpolated into inline
 * `style` objects, so an unrecognised string must never reach the DOM.
 * (lib/cardStyle.ts validates on read as well; this is the second gate.)
 */
export function resolveColor(
  value: ColorValue | undefined,
  palette: ThemePalette,
  fallback: keyof ThemePalette = "primary",
): string {
  if (!value) return palette[fallback];
  if ((TOKENS as readonly string[]).includes(value)) {
    return palette[value as keyof ThemePalette];
  }
  if (HEX.test(value)) return value;
  return palette[fallback];
}

/** Expand `#abc` to `#aabbcc`; pass longer forms through. */
function expand(hex: string): string {
  if (hex.length !== 4) return hex;
  return `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
}

/**
 * Append an alpha channel to a hex colour.
 *
 * The codebase already leans on `${color}20` string concatenation in a dozen
 * places, which silently produces garbage for `#abc` or an rgb() string. This
 * does the same job correctly and returns the colour untouched when it cannot.
 */
export function alpha(color: string, amount: number): string {
  if (!HEX.test(color)) return color;
  const base = expand(color).slice(0, 7);
  const clamped = Math.max(0, Math.min(1, amount));
  const channel = Math.round(clamped * 255)
    .toString(16)
    .padStart(2, "0");
  return `${base}${channel}`;
}

/** Convenience: resolve then apply alpha in one step. */
export function tint(
  value: ColorValue | undefined,
  palette: ThemePalette,
  amount: number,
  fallback: keyof ThemePalette = "primary",
): string {
  return alpha(resolveColor(value, palette, fallback), amount);
}
