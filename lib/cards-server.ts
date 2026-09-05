// Server-side card access. This is the only place a card row is read for a
// visitor who does not own it.
//
// Since the Phase 3 migration, `cards` has no public SELECT policy: the anon
// key can read only rows the signed-in user owns. Public share pages read
// through the service-role client here instead. That flip is what makes an
// honest view count and a real time lock possible at all — a lock enforced by a
// client that holds a key able to read the row is not a lock.
import "server-only";

import { ApiError } from "./api";
import { supabaseAdmin } from "./supabase-server";
import {
  readCardContent,
  readCardStyle,
  writeCardData,
  type StoredCardData,
} from "./cardStyle";
import { readReactionCounts } from "./reactions";
import { getTemplateById } from "./templates";
import type { PublicCard } from "./types";

// `PublicCard` itself lives in lib/types.ts so client components can name it
// without importing this server-only module.
export type { PublicCard } from "./types";

interface CardRow {
  id: string;
  template_id: string;
  data: StoredCardData | null;
  user_id: string | null;
  created_at: string;
  claim_token?: string | null;
  view_count?: number | null;
  reaction_counts?: unknown;
}

const MAX_FIELDS = 64;
const MAX_FIELD_LENGTH = 5000;

/** URL-safe, unambiguous alphabet: no 0/O/I/l to mistype when read aloud. */
const ID_ALPHABET = "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomString(length: number, alphabet: string): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let out = "";
  for (const byte of bytes) out += alphabet[byte % alphabet.length];
  return out;
}

/**
 * Card ids are generated server-side with a CSPRNG.
 *
 * The old client-side generator used `Math.random()`, which is not seeded for
 * unpredictability — with public share URLs that made the id space walkable in
 * principle. 10 characters of this alphabet is ~58 bits.
 */
export function generateCardId(): string {
  return randomString(10, ID_ALPHABET);
}

export function generateClaimToken(): string {
  return randomString(
    32,
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
  );
}

// Built field by field, never by spreading the row. That is what keeps the raw
// `data` JSONB — and anything else that lands on the table later, like
// `claim_token` — out of the RSC payload entirely, rather than merely unused
// by the components.
function toPublicCard(row: CardRow): PublicCard {
  return {
    id: row.id,
    templateId: row.template_id,
    content: readCardContent(row.data),
    style: readCardStyle(row.data),
    createdAt: row.created_at,
    reactionCounts: readReactionCounts(row.reaction_counts),
    viewCount: row.view_count ?? 0,
  };
}

/** A card as a share-page visitor may see it, or null if there is no such card. */
export async function getPublicCard(id: string): Promise<PublicCard | null> {
  if (!id || id.length > 64) return null;

  const { data, error } = await supabaseAdmin()
    .from("cards")
    .select(
      "id, template_id, data, user_id, created_at, view_count, reaction_counts",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("getPublicCard failed:", error.message);
    return null;
  }
  if (!data) return null;

  return toPublicCard(data as CardRow);
}

/**
 * Normalise and bound whatever the client sent.
 *
 * Round-tripping through readCardContent/readCardStyle means the server, not
 * the browser, decides the shape of every row: unknown style keys are dropped,
 * palette values must be hex, and content is capped. See lib/cardStyle.ts —
 * that validation is a security boundary, and this is where it is enforced.
 */
export function normaliseCardData(input: unknown): StoredCardData {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new ApiError(400, "Card data must be an object.");
  }
  const raw = input as StoredCardData;
  const content = readCardContent(raw);

  const entries = Object.entries(content);
  if (entries.length > MAX_FIELDS) {
    throw new ApiError(400, "That card has too many fields.");
  }
  for (const [key, value] of entries) {
    if (value.length > MAX_FIELD_LENGTH) {
      throw new ApiError(400, `"${key}" is too long.`);
    }
  }

  return writeCardData(content, readCardStyle(raw));
}

export interface CreatedCard {
  id: string;
  /** Only returned for anonymous cards — it is what lets the author claim it later. */
  claimToken?: string;
}

export async function createCardRow(params: {
  templateId: string;
  data: StoredCardData;
  userId: string | null;
}): Promise<CreatedCard> {
  if (!getTemplateById(params.templateId)) {
    throw new ApiError(400, "Unknown template.");
  }

  const id = generateCardId();
  // Anonymous cards carry a claim token so the author can attach them to an
  // account later. An owned card needs none, and must not have one lying
  // around that would let a holder re-home it.
  const claimToken = params.userId ? null : generateClaimToken();

  const { error } = await supabaseAdmin().from("cards").insert({
    id,
    template_id: params.templateId,
    data: params.data,
    user_id: params.userId,
    claim_token: claimToken,
    created_at: new Date().toISOString(),
  });

  if (error) {
    console.error("createCardRow failed:", error.message);
    throw new ApiError(500, "Could not save your card. Please try again.");
  }

  return claimToken ? { id, claimToken } : { id };
}

export async function updateCardRow(params: {
  id: string;
  data: StoredCardData;
  userId: string;
}): Promise<void> {
  const { error, count } = await supabaseAdmin()
    .from("cards")
    .update({ data: params.data }, { count: "exact" })
    .eq("id", params.id)
    .eq("user_id", params.userId);

  if (error) {
    console.error("updateCardRow failed:", error.message);
    throw new ApiError(500, "Could not update your card.");
  }
  // Deliberately the same message whether the card is missing or belongs to
  // someone else — distinguishing them tells a prober which ids exist.
  if (count === 0) {
    throw new ApiError(404, "That card does not exist, or is not yours.");
  }
}

/**
 * Attach anonymous cards to an account.
 *
 * The token must match a row that is still unowned. A client-side UPDATE
 * setting `user_id` could not be trusted for this even before the RLS change —
 * and the Phase 0 insert policy rejects it anyway.
 */
export async function claimCards(
  userId: string,
  tokens: string[],
): Promise<{ claimed: number }> {
  const valid = tokens
    .filter((t) => typeof t === "string" && /^[A-Za-z0-9]{16,64}$/.test(t))
    .slice(0, 50);
  if (valid.length === 0) return { claimed: 0 };

  const { data, error } = await supabaseAdmin()
    .from("cards")
    .update({ user_id: userId, claim_token: null })
    .in("claim_token", valid)
    .is("user_id", null)
    .select("id");

  if (error) {
    console.error("claimCards failed:", error.message);
    throw new ApiError(500, "Could not attach your cards to this account.");
  }

  return { claimed: data?.length ?? 0 };
}
