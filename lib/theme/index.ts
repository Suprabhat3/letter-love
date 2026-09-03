// The theme registry: the single source of visual truth for a card.
//
// Replaces five: the three bespoke components under components/templates/,
// the id if-chain plus generic layout in ShareCardView, the hand-rolled mini
// card in the editor, `getThemeConfig()` in the OG route, and Template.colors.
//
// React-free — see ./types.ts.

import type { Template } from "@/lib/types";
import { getTemplateById } from "@/lib/templates";
import type { ResolvedCardStyle } from "@/lib/cardStyle";
import { FALLBACK_TEMPLATE, makeDefaultTheme } from "./defaults";
import {
  anniversaryTheme,
  loveLetterTheme,
  missYouTheme,
} from "./themes/romance";
import {
  birthdayTheme,
  sorryTheme,
  valentineTheme,
} from "./themes/interactive";
import type { Theme, ThemeDraft } from "./types";

export * from "./types";
export { resolveColor, alpha, tint } from "./color";
export { makeDefaultTheme, HERO_GIFS } from "./defaults";

/**
 * Keyed by template id. A template with no entry here renders via
 * `makeDefaultTheme`, so adding a template never requires adding a theme.
 */
const DRAFTS: Record<string, ThemeDraft> = {
  "love-letter": loveLetterTheme,
  anniversary: anniversaryTheme,
  "miss-you": missYouTheme,
  "sorry-card": sorryTheme,
  "valentine-ask": valentineTheme,
  "birthday-wish": birthdayTheme,
};

/** Every theme id a card may legitimately name in `_style.themeId`. */
export const THEME_IDS = Object.keys(DRAFTS);

function applyDraft(base: Theme, draft: ThemeDraft): Theme {
  return {
    ...base,
    ...draft,
    // Merged rather than replaced so a draft can override two palette slots
    // without restating all six.
    palette: { ...base.palette, ...draft.palette },
    fontDefaults: { ...base.fontDefaults, ...draft.fontDefaults },
    envelope: { ...base.envelope, ...draft.envelope },
    og: { ...base.og, ...draft.og },
  };
}

/** The theme for a template, before any per-card style is applied. */
export function getTemplateTheme(template: Template): Theme {
  const base = makeDefaultTheme(template);
  const draft = DRAFTS[template.id];
  return draft ? applyDraft(base, draft) : base;
}

/**
 * The theme for one specific card.
 *
 * `style` comes from `readCardStyle`, which has already validated it — but the
 * only things it is allowed to move are the palette, the decor switch and the
 * envelope. A card cannot supply arbitrary blocks, media or colours outside
 * the palette slots, because `data` is attacker-controlled under the current
 * public INSERT policy.
 */
export function resolveTheme(
  templateId: string | null | undefined,
  style?: Partial<ResolvedCardStyle>,
): Theme {
  const template = (templateId ? getTemplateById(templateId) : undefined) ??
    FALLBACK_TEMPLATE;

  // A card may name a registered theme other than its template's default;
  // anything unrecognised falls through to the template's own theme.
  const named = style?.themeId ? DRAFTS[style.themeId] : undefined;
  let theme = named
    ? applyDraft(makeDefaultTheme(template), named)
    : getTemplateTheme(template);

  if (style?.palette) {
    const { primary, secondary, accent } = style.palette;
    theme = {
      ...theme,
      palette: {
        ...theme.palette,
        ...(primary ? { primary } : {}),
        ...(secondary ? { secondary } : {}),
        ...(accent ? { accent } : {}),
      },
    };
  }

  if (style?.decor === "none") {
    theme = { ...theme, decor: [], ambient: { ...theme.ambient, enabled: false } };
  }

  if (style?.envelope) {
    theme = {
      ...theme,
      envelope: {
        ...theme.envelope,
        enabled: style.envelope.enabled ?? theme.envelope.enabled,
        ...(style.envelope.sealEmoji
          ? { sealEmoji: style.envelope.sealEmoji }
          : {}),
        ...(style.envelope.hint ? { hint: style.envelope.hint } : {}),
      },
    };
  }

  return theme;
}
