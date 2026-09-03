// Who is looking at a card, without an account and without storing anything
// that identifies a person.
import "server-only";

import { cookies } from "next/headers";

const COOKIE_NAME = "ll_vid";
/** 400 days is the maximum Chrome will honour; anything longer is silently cut. */
const COOKIE_MAX_AGE = 400 * 24 * 60 * 60;

/**
 * The viewer's opaque id, minted on first sight.
 *
 * httpOnly, so no script on the page can read it and correlate viewers itself;
 * SameSite=Lax, so it survives the navigation from a WhatsApp link, which is
 * how essentially every recipient arrives.
 *
 * Only callable from a Route Handler or Server Action — setting a cookie during
 * a page render is not allowed, and the share page deliberately does not try.
 */
export async function getOrCreateViewerId(): Promise<string> {
  const jar = await cookies();
  const existing = jar.get(COOKIE_NAME)?.value;
  if (existing && /^[0-9a-f-]{36}$/.test(existing)) return existing;

  const fresh = crypto.randomUUID();
  jar.set(COOKIE_NAME, fresh, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
  return fresh;
}

/**
 * A per-card identity for one viewer.
 *
 * The card id is mixed into the hash on purpose: it means the rows for two
 * different cards cannot be joined on `viewer_hash` to work out that the same
 * person read both. Without that, this table would quietly become a
 * cross-card profile of every recipient — which is exactly the thing India's
 * DPDP Act is about, and which we have no product reason to want.
 *
 * VIEWER_SALT must be set in production. The dev fallback is fine locally and
 * useless to an attacker who already has the database.
 */
export async function viewerHash(
  cardId: string,
  viewerId: string,
): Promise<string> {
  const salt = process.env.VIEWER_SALT ?? "letterlove-dev-salt";
  const bytes = new TextEncoder().encode(`${salt}:${cardId}:${viewerId}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// WhatsApp, Telegram, Facebook and X all fetch a shared URL to build the link
// preview. The beacon already fires from the client after the unwrap, so a
// crawler should never reach it — but "should never" is not a guarantee, and a
// card that reads "opened 3 times" the instant the sender pastes the link
// destroys the one feature this whole phase is built around.
const BOT_PATTERN =
  /bot|crawl|spider|slurp|facebookexternalhit|whatsapp|telegram|twitterbot|slackbot|discordbot|linkedinbot|embedly|quora|pinterest|redditbot|skypeuripreview|vkshare|preview|fetcher|headless|lighthouse|curl|wget|python-requests|axios|okhttp|go-http-client/i;

export function isBotRequest(request: Request): boolean {
  const ua = request.headers.get("user-agent") ?? "";
  // No user agent at all is not a browser either.
  if (ua.trim().length === 0) return true;
  return BOT_PATTERN.test(ua);
}

/**
 * Coarse, non-identifying context for a view.
 *
 * Country comes from the edge header, never from a geo-IP lookup we perform —
 * and the IP itself is never stored. "mobile" vs "desktop" is the whole of the
 * device signal; anything finer starts to fingerprint.
 */
export function viewerContext(request: Request): {
  country: string | null;
  device: "mobile" | "desktop";
} {
  const ua = request.headers.get("user-agent") ?? "";
  return {
    country:
      request.headers.get("x-vercel-ip-country") ??
      request.headers.get("cf-ipcountry") ??
      null,
    device: /mobile|android|iphone|ipad|ipod/i.test(ua) ? "mobile" : "desktop",
  };
}
