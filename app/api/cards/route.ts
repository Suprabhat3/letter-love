import { ApiError, clientKey, readJson, withHandler } from "@/lib/api";
import { getUser, requireUser } from "@/lib/auth-server";
import {
  createCardRow,
  normaliseCardData,
  updateCardRow,
} from "@/lib/cards-server";
import { linkReply } from "@/lib/engagement-server";
import { enforceLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

function requireString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new ApiError(400, `Missing "${field}".`);
  }
  return value.trim();
}

/**
 * Create a card.
 *
 * Signing in is no longer a toll gate on the way to a share link: writing a
 * whole letter and only then being bounced to /auth was the biggest leak in
 * the funnel. An anonymous card is created with `user_id = NULL` and a claim
 * token, and the signup ask moves to after the share succeeds, where it reads
 * as a benefit rather than a tax.
 */
export const POST = withHandler(async (request) => {
  const body = await readJson(request);
  const user = await getUser(request);

  await enforceLimit(
    user ? `user:${user.id}` : `ip:${await clientKey(request)}`,
    user ? "card_create" : "anon_create",
  );

  const created = await createCardRow({
    templateId: requireString(body.templateId, "templateId"),
    data: normaliseCardData(body.data),
    userId: user?.id ?? null,
  });

  // Linked after the fact, and never allowed to fail the create. A reply that
  // saved but did not link is a slightly poorer dashboard row; a reply lost
  // because the parent id was stale is someone's letter gone.
  if (typeof body.replyTo === "string" && body.replyTo.length > 0) {
    await linkReply(created.id, body.replyTo);
  }

  return created;
});

/** Update a card you own. Anonymous cards must be claimed before they can be edited. */
export const PATCH = withHandler(async (request) => {
  const body = await readJson(request);
  const user = await requireUser(request);

  await updateCardRow({
    id: requireString(body.id, "id"),
    data: normaliseCardData(body.data),
    userId: user.id,
  });

  return { success: true };
});
