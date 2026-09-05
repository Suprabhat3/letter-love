import { ApiError, readJson, withHandler } from "@/lib/api";
import { requireUser } from "@/lib/auth-server";
import { claimCards } from "@/lib/cards-server";

export const runtime = "nodejs";

/**
 * Attach cards written while signed out to the account that just signed in.
 *
 * The tokens come from the browser's own localStorage. A token only works
 * against a row that is still unowned, so replaying someone else's token — or
 * guessing one — attaches nothing: there is no way to take a card that already
 * has an owner.
 */
export const POST = withHandler(async (request) => {
  const body = await readJson(request);
  const user = await requireUser(request);

  if (!Array.isArray(body.tokens)) {
    throw new ApiError(400, 'Expected "tokens" to be an array.');
  }

  return claimCards(user.id, body.tokens as string[]);
});
