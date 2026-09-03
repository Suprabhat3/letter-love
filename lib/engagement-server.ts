// Views, reactions and replies — the server half of the loop.
//
// Everything here writes through the service-role client for the same reason
// share reads do (see lib/cards-server.ts): since migration 0002 the anon key
// cannot even see a card it does not own, and `card_views` / `card_reactions`
// have no policies at all. A client-side insert into either would be an open
// spam endpoint.
import "server-only";

import { ApiError } from "./api";
import { supabaseAdmin } from "./supabase-server";
import { readCardContent } from "./cardStyle";
import {
  readReactionCounts,
  type ReactionCounts,
  type ReactionEmoji,
} from "./reactions";

export interface OpenReport {
  viewCount: number;
  uniqueViewCount: number;
  reactionCounts: ReactionCounts;
  /** Which reactions this viewer already has on, so the bar renders correctly. */
  mine: ReactionEmoji[];
}

/** The owner's user id, or null for an anonymous card. Throws if there is no card. */
export async function getCardOwner(cardId: string): Promise<string | null> {
  const { data, error } = await supabaseAdmin()
    .from("cards")
    .select("user_id")
    .eq("id", cardId)
    .maybeSingle();

  if (error) {
    console.error("getCardOwner failed:", error.message);
    throw new ApiError(500, "Could not read that card.");
  }
  if (!data) throw new ApiError(404, "No such card.");
  return (data as { user_id: string | null }).user_id;
}

/**
 * Record one open and return everything the share page needs to settle.
 *
 * Called from the beacon after the envelope finishes — never during SSR. A
 * crawler building a link preview must not be able to move these numbers, and
 * the only way to be sure of that is to count on an action a human took.
 */
export async function recordOpen(params: {
  cardId: string;
  viewerHash: string;
  isOwner: boolean;
  country: string | null;
  device: string;
}): Promise<OpenReport> {
  const admin = supabaseAdmin();

  const { data, error } = await admin.rpc("record_card_view", {
    p_card_id: params.cardId,
    p_viewer_hash: params.viewerHash,
    p_is_owner: params.isOwner,
    p_country: params.country,
    p_device: params.device,
  });

  if (error) {
    console.error("record_card_view failed:", error.message);
    throw new ApiError(500, "Could not record that view.");
  }

  const row = (Array.isArray(data) ? data[0] : data) as
    | { view_count: number; unique_view_count: number }
    | undefined;

  const [counts, mine] = await Promise.all([
    readCardReactions(params.cardId),
    viewerReactions(params.cardId, params.viewerHash),
  ]);

  return {
    viewCount: row?.view_count ?? 0,
    uniqueViewCount: row?.unique_view_count ?? 0,
    reactionCounts: counts,
    mine,
  };
}

export async function readCardReactions(
  cardId: string,
): Promise<ReactionCounts> {
  const { data, error } = await supabaseAdmin()
    .from("cards")
    .select("reaction_counts")
    .eq("id", cardId)
    .maybeSingle();

  if (error || !data) return {};
  return readReactionCounts((data as { reaction_counts: unknown }).reaction_counts);
}

async function viewerReactions(
  cardId: string,
  viewerHash: string,
): Promise<ReactionEmoji[]> {
  const { data, error } = await supabaseAdmin()
    .from("card_reactions")
    .select("emoji")
    .eq("card_id", cardId)
    .eq("viewer_hash", viewerHash);

  if (error || !data) return [];
  // The emoji column is constrained to the closed set in the database, so this
  // cast is safe — but see readReactionCounts for why the counts blob is not
  // trusted the same way: it is a JSONB cache, this is a checked column.
  return (data as { emoji: string }[]).map((r) => r.emoji as ReactionEmoji);
}

export async function toggleReaction(params: {
  cardId: string;
  viewerHash: string;
  emoji: ReactionEmoji;
}): Promise<{ counts: ReactionCounts; active: boolean }> {
  const { data, error } = await supabaseAdmin().rpc("toggle_card_reaction", {
    p_card_id: params.cardId,
    p_viewer_hash: params.viewerHash,
    p_emoji: params.emoji,
  });

  if (error) {
    console.error("toggle_card_reaction failed:", error.message);
    throw new ApiError(500, "Could not save that reaction.");
  }

  const row = (Array.isArray(data) ? data[0] : data) as
    | { counts: unknown; active: boolean }
    | undefined;

  return {
    counts: readReactionCounts(row?.counts),
    active: Boolean(row?.active),
  };
}

export interface ReplyContext {
  /** The person who wrote the card being replied to — the reply's recipient. */
  replyToSender: string;
  /** Who that card was addressed to — the person now writing the reply. */
  replyToRecipient: string;
  templateId: string;
}

/**
 * The two names needed to prefill a reply, and nothing else.
 *
 * Emphatically NOT the letter body. This endpoint is reachable by anyone with a
 * card id, so it returns only what is already printed on the envelope: who it
 * was from and who it was for. Leaking the message here would undo both the
 * envelope and any future time lock.
 */
export async function getReplyContext(
  cardId: string,
): Promise<ReplyContext | null> {
  const { data, error } = await supabaseAdmin()
    .from("cards")
    .select("template_id, data")
    .eq("id", cardId)
    .maybeSingle();

  if (error || !data) return null;

  const row = data as { template_id: string; data: Record<string, unknown> };
  const content = readCardContent(row.data);

  return {
    replyToSender: (content.senderName ?? "").slice(0, 60),
    replyToRecipient: (content.recipientName ?? "").slice(0, 60),
    templateId: row.template_id,
  };
}

/**
 * Attach a new card to the one it answers.
 *
 * Runs after the card exists, and tolerates failure: a reply that saved but did
 * not link is a slightly worse dashboard row, not a lost letter. Losing the
 * whole letter because the parent id was mistyped would be the wrong trade.
 */
export async function linkReply(
  cardId: string,
  parentId: string,
): Promise<void> {
  if (!/^[A-Za-z0-9]{4,64}$/.test(parentId)) return;

  const { error } = await supabaseAdmin().rpc("link_card_reply", {
    p_card_id: cardId,
    p_parent_id: parentId,
  });

  if (error) console.error("link_card_reply failed:", error.message);
}
