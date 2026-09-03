import { ApiError, withHandler } from "@/lib/api";
import { getReplyContext, type ReplyContext } from "@/lib/engagement-server";

export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * The names needed to prefill a reply — and only those.
 *
 * Anyone with a card id can call this, so it deliberately returns nothing that
 * is not already on the public link preview: who wrote the card and who it was
 * for. The message body never appears here. Returning it would hand out a
 * spoiler-free way to read any letter, defeating both the envelope and any
 * future time lock.
 */
export const GET = withHandler<ReplyContext, RouteContext>(
  async (_request, { params }) => {
    const { id } = await params;
    const context = await getReplyContext(id);
    if (!context) throw new ApiError(404, "No such card.");
    return context;
  },
);
