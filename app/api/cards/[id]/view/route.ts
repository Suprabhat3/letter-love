import { clientKey, withHandler } from "@/lib/api";
import { getUser } from "@/lib/auth-server";
import {
  getCardOwner,
  recordOpen,
  type OpenReport,
} from "@/lib/engagement-server";
import { enforceLimit } from "@/lib/rate-limit";
import {
  getOrCreateViewerId,
  isBotRequest,
  viewerContext,
  viewerHash,
} from "@/lib/viewer";

// Node, not edge: this sets a cookie and uses the service-role client.
export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/** What a request that must not be counted gets back. Shape-identical, all zero. */
const EMPTY: OpenReport = {
  viewCount: 0,
  uniqueViewCount: 0,
  reactionCounts: {},
  mine: [],
};

/**
 * Record that a human opened this card.
 *
 * This is a POST beacon fired by the client *after the unwrap completes*, and
 * that placement is the whole design. Counting during SSR — which is where it
 * would naturally go — makes every card read "opened 3 times" the moment the
 * sender pastes the link, because WhatsApp, Telegram, Facebook and X each fetch
 * the URL to build a preview. An open receipt that fires before the recipient
 * has seen the letter is worse than no open receipt.
 *
 * Two more exclusions, for the same reason: bot user agents are refused
 * outright, and the owner's own views are recorded but kept out of the public
 * counters, so a sender refreshing their card cannot manufacture the receipt
 * they are looking at.
 */
export const POST = withHandler<OpenReport, RouteContext>(
  async (request, { params }) => {
    const { id } = await params;

    // Silent, not an error: a crawler should learn nothing from the response,
    // and a bot getting a 403 here would be a signal worth probing.
    if (isBotRequest(request)) return EMPTY;

    const owner = await getCardOwner(id);

    // Generous, and fails open — see lib/rate-limit.ts. A recipient behind a
    // busy CGNAT must never be told their letter is unavailable.
    await enforceLimit(`ip:${await clientKey(request)}`, "card_view");

    const [user, viewerId] = await Promise.all([
      getUser(request),
      getOrCreateViewerId(),
    ]);
    const { country, device } = viewerContext(request);

    return recordOpen({
      cardId: id,
      viewerHash: await viewerHash(id, viewerId),
      isOwner: Boolean(user && owner && user.id === owner),
      country,
      device,
    });
  },
);
