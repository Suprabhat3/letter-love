// Full-screen "opening scenes" — the canvas experiences that replace the
// envelope for templates that have them.
//
// React-free and dependency-free so lib/cardStyle.ts (which the server uses to
// validate every stored row) can import the whitelist without pulling canvas
// code into the server bundle.

export type SceneId = "diya-chain" | "phuljhari" | "rangoli" | "lanterns";

export interface SceneOption {
  id: SceneId;
  name: string;
  emoji: string;
  /** One line for the editor picker, written to the sender. */
  blurb: string;
}

export const SCENES: readonly SceneOption[] = [
  {
    id: "diya-chain",
    name: "Diya Chain",
    emoji: "🪔",
    blurb: "They carry your flame from diya to diya, then the sky spells their name in fireworks.",
  },
  {
    id: "phuljhari",
    name: "Phuljhari",
    emoji: "🎇",
    blurb: "In the dark, they hold a sparkler and write their own name in light.",
  },
  {
    id: "rangoli",
    name: "Rangoli",
    emoji: "🌸",
    blurb: "They light one diya and a rangoli made just for them pours itself around it.",
  },
  {
    id: "lanterns",
    name: "Sky Lanterns",
    emoji: "🏮",
    blurb: "Each lantern they release carries part of your wish into the sky, until the whole sky glows.",
  },
];

/** Which templates offer scenes. Keyed by template id. */
const TEMPLATE_SCENES: Record<string, readonly SceneId[]> = {
  diwali: SCENES.map((s) => s.id),
};

export function isSceneId(value: unknown): value is SceneId {
  return typeof value === "string" && SCENES.some((s) => s.id === value);
}

export function scenesForTemplate(templateId: string): readonly SceneOption[] {
  const ids = TEMPLATE_SCENES[templateId];
  return ids ? SCENES.filter((s) => ids.includes(s.id)) : [];
}

/** The scene a fresh card of this template starts on, if any. */
export function defaultSceneFor(templateId: string): SceneId | undefined {
  return TEMPLATE_SCENES[templateId]?.[0];
}
