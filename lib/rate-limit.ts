import "server-only";

import { ApiError } from "./api";
import { supabaseAdmin } from "./supabase-server";

/**
 * Per-subject, per-day caps.
 *
 * `anon_create` exists because card creation is now a public endpoint that
 * writes rows; without it, a loop can fill the table. The AI limits are here
 * ready for Phase 5, which moves /api/ai/enhance behind them.
 */
export const LIMITS = {
  // Deliberately generous. The subject for an anonymous caller is a hashed IP,
  // and Indian mobile carriers put very large numbers of users behind CGNAT —
  // a tight per-IP cap silently locks out a whole college hostel or office.
  // This is sized to stop a scripted loop, not to meter real people. If abuse
  // shows up, the better lever is a per-card-id cost (a proof-of-work or a
  // captcha on the create form), not a lower number here.
  anon_create: 50,
  card_create: 100,
  ai_enhance: 30,
} as const;

export type LimitKind = keyof typeof LIMITS;

/**
 * Count one use and throw 429 if the subject is over its cap.
 *
 * The increment happens in Postgres in a single statement (see `bump_usage` in
 * migration 0002), so two concurrent requests cannot both read a count below
 * the cap and both proceed.
 *
 * Fails OPEN: if the counter table is unreachable we let the request through
 * rather than taking the product down. These caps exist to stop casual abuse,
 * not to be a security control.
 */
export async function enforceLimit(
  subject: string,
  kind: LimitKind,
): Promise<void> {
  const limit = LIMITS[kind];
  const { data, error } = await supabaseAdmin().rpc("bump_usage", {
    p_subject: subject,
    p_kind: kind,
    p_limit: limit,
  });

  if (error) {
    console.error("Rate limit check failed (allowing request):", error.message);
    return;
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (row && row.allowed === false) {
    throw new ApiError(
      429,
      "You have made a lot of cards today. Please try again tomorrow.",
      "rate_limited",
    );
  }
}
