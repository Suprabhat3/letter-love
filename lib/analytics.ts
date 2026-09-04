// Thin, typed wrapper over Umami. No-ops when the script is blocked or absent
// (~30% of Indian mobile traffic runs an adblocker), so call sites never guard.

export type AnalyticsEvent =
  // create funnel
  | "template_view"
  | "editor_start"
  | "ai_enhance_click"
  | "ai_tone_select"
  // memory interview funnel: how many people who open it reach a letter, and
  // how many of those keep it. The drop-off between the last two is the only
  // honest measure of whether the AI is any good.
  | "interview_open"
  | "interview_answer"
  | "interview_generate"
  | "interview_variants"
  | "interview_apply"
  | "card_created"
  | "share_channel_click"
  // loop funnel
  | "card_opened"
  | "envelope_opened"
  | "reaction_added"
  | "reply_click"
  | "signup_completed";

type UmamiGlobal = {
  track: (name: string, data?: Record<string, unknown>) => void;
};

export function track(
  event: AnalyticsEvent,
  props?: Record<string, string | number | boolean>,
): void {
  if (typeof window === "undefined") return;
  const umami = (window as unknown as { umami?: UmamiGlobal }).umami;
  if (!umami || typeof umami.track !== "function") return;
  try {
    umami.track(event, props);
  } catch {
    // Analytics must never break a render or a submit.
  }
}

const SOURCE_KEY = "ll.signup_source";

/**
 * Remember what sent someone toward signing up.
 *
 * The reply loop is the one feature meant to compound, and the only way to
 * know whether it does is to attribute the signups it produces. The journey
 * from "Reply with a letter" to an account crosses several pages and can span
 * days, so it cannot be carried in a URL — but it is worth one localStorage
 * key.
 *
 * First writer wins: someone who arrived via a reply and then wandered the
 * site is still a reply signup.
 */
export function markSignupSource(source: string): void {
  if (typeof window === "undefined") return;
  try {
    if (!localStorage.getItem(SOURCE_KEY)) {
      localStorage.setItem(SOURCE_KEY, source);
    }
  } catch {
    // Private mode. The signup still works; it is just unattributed.
  }
}

/** Read the source and clear it, so one signup is attributed exactly once. */
export function takeSignupSource(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const value = localStorage.getItem(SOURCE_KEY);
    if (value) localStorage.removeItem(SOURCE_KEY);
    return value;
  } catch {
    return null;
  }
}
