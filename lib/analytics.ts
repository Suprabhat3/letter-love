// Thin, typed wrapper over Umami. No-ops when the script is blocked or absent
// (~30% of Indian mobile traffic runs an adblocker), so call sites never guard.

export type AnalyticsEvent =
  // create funnel
  | "template_view"
  | "editor_start"
  | "ai_enhance_click"
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
