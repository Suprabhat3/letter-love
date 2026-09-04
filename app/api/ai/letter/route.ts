import { NextResponse } from "next/server";

import { streamCompletion } from "@/lib/ai/client";
import { prepareLetter } from "@/lib/ai/letter";
import { ApiError, type ApiErrorBody } from "@/lib/api";

export const runtime = "nodejs";
// Longer than enhance: this generates 120-200 words rather than polishing a
// line, and the client is watching it arrive rather than staring at a spinner.
export const maxDuration = 60;

/**
 * Write a whole letter from the interview answers, streamed.
 *
 * Not on `withHandler`, and it cannot be: that wrapper serialises a value to
 * JSON, and the point of this route is that the first words reach the reader
 * before the last ones exist. Everything that can fail with a status — auth,
 * quota, validation, a missing API key, the upstream handshake — is resolved
 * before a single byte goes out, so the only failure the stream itself can
 * express is ending early.
 *
 * The body is plain UTF-8 text, not server-sent events. There are no event
 * types to multiplex, and `response.body` with a TextDecoder is a great deal
 * less machinery on the client than an SSE parser.
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const { prompt, temperature } = await prepareLetter(request);
    const stream = await streamCompletion(prompt, { temperature });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
        // Proxies that buffer would collect the whole letter and deliver it in
        // one go, which is the blank spinner this route exists to avoid.
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json<ApiErrorBody>(
        { error: error.message, code: error.code },
        { status: error.status },
      );
    }
    console.error("Letter route failed:", error);
    return NextResponse.json<ApiErrorBody>(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
