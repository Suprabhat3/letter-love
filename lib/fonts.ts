// Single source of truth for the card font picker.
// Previously duplicated verbatim in 5 files — never redeclare this array.

export type FontId = "default" | "rustic" | "lucy" | "valentine" | "valty";

export interface FontOption {
  id: FontId;
  name: string;
  headerClass: string;
  bodyClass: string;
  /** Filename under /public/fonts, or null for CSS-var fonts. Needed by next/og. */
  ogFile: string | null;
}

export const FONTS: readonly FontOption[] = [
  {
    id: "default",
    name: "Classic",
    headerClass: "font-handwriting",
    bodyClass: "font-serif",
    ogFile: null,
  },
  {
    id: "rustic",
    name: "Rustic",
    headerClass: "font-rustic",
    bodyClass: "font-rustic",
    ogFile: "RusticRoadway.otf",
  },
  {
    id: "lucy",
    name: "Lucy",
    headerClass: "font-lucy",
    bodyClass: "font-lucy",
    ogFile: "Lucy.ttf",
  },
  {
    id: "valentine",
    name: "Valentine",
    headerClass: "font-valentine",
    bodyClass: "font-valentine",
    ogFile: "ValentineCalligraph.otf",
  },
  {
    id: "valty",
    name: "Valty",
    headerClass: "font-valty",
    bodyClass: "font-valty",
    ogFile: "Valty.otf",
  },
];

export const DEFAULT_FONT_ID: FontId = "default";

export function isFontId(value: unknown): value is FontId {
  return (
    typeof value === "string" && FONTS.some((f) => f.id === (value as FontId))
  );
}

export function getFont(id?: string | null): FontOption {
  return FONTS.find((f) => f.id === id) ?? FONTS[0];
}

/** Resolve a font id to its header/body Tailwind classes, with safe fallbacks. */
export function getFontClasses(id?: string | null): {
  header: string;
  body: string;
} {
  const font = getFont(id);
  return { header: font.headerClass, body: font.bodyClass };
}
