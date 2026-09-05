import { ApiError, clientKey, readJson, withHandler } from "@/lib/api";
import { toggleReaction } from "@/lib/engagement-server";
import { enforceLimit } from "@/lib/rate-limit";
import { isReactionEmoji, type ReactionCounts } from "@/lib/reactions";
import { getOrCreateViewerId, isBotRequest, viewerHash } from "@/lib/viewer";

export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * Toggle one reaction for one viewer.
 *
 * The cap on abuse is structural, not numeric: the `(card_id, viewer_hash,
 * emoji)` primary key means a browser can add at most six rows to a card, ever,
 * no matter how many times it calls this. The per-IP limit is only there so a
 * script cannot burn a cookie per request and grind through the id space.
 */
export const POST = withHandler<
  { counts: ReactionCounts; active: boolean },
  RouteContext
>(async (request, { params }) => {
  const { id } = await params;
  if (isBotRequest(request)) throw new ApiError(403, "Not available.");

  const body = await readJson(request);
  const emoji = body.emoji;
  // Validated against the shared registry, and again by a CHECK constraint in
  // the database — this value ends up as a key of `cards.reaction_counts`,
  // which every visitor renders.
  if (!isReactionEmoji(emoji)) {
    throw new ApiError(400, "That is not one of the reactions.");
  }

  await enforceLimit(`ip:${await clientKey(request)}`, "card_react");

  const viewerId = await getOrCreateViewerId();
  return toggleReaction({
    cardId: id,
    viewerHash: await viewerHash(id, viewerId),
    emoji,
  });
});
