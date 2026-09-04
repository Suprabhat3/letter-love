import { complete } from "@/lib/ai/client";
import { prepareLetter } from "@/lib/ai/letter";
import { ApiError, withHandler } from "@/lib/api";

export const runtime = "nodejs";
export const maxDuration = 60;

const VARIANT_COUNT = 3;

/**
 * How far the three calls spread around the tone's own temperature.
 *
 * None of them is 0, because the client shows these alongside the letter it
 * already streamed at exactly that temperature — a variant identical to the
 * one above it is a wasted call and a worse choice.
 */
const SPREAD = [-0.25, 0.15, 0.35];

interface VariantsResult {
  letters: string[];
}

/**
 * Three letters to choose from.
 *
 * Three parallel calls, deliberately not one call asked to return a JSON array
 * of three. Gemini's OpenAI-compatibility layer has patchy `response_format`
 * support, and with a single call one bad parse loses all three letters;
 * `Promise.allSettled` means two good letters still reach the user when the
 * third fails. Genuinely different temperatures also produce genuinely
 * different letters, which asking one call for "three varied versions" does
 * not — it tends to return the same letter with the adjectives swapped. Flash
 * is cheap enough that 3x tokens is noise.
 *
 * Variants exist only for the whole letter. Three versions of a single field
 * is decision fatigue in a two-minute flow.
 */
export const POST = withHandler<VariantsResult>(async (request) => {
  const { prompt, temperature } = await prepareLetter(request, VARIANT_COUNT);

  const settled = await Promise.allSettled(
    SPREAD.map((offset) =>
      complete(prompt, {
        temperature: Math.min(1.2, Math.max(0.2, temperature + offset)),
      }),
    ),
  );

  const letters = settled
    .filter((r): r is PromiseFulfilledResult<string> => r.status === "fulfilled")
    .map((r) => r.value);

  if (letters.length === 0) {
    // Every one failed, so this is not a flaky call — surface the real reason
    // from the first rejection rather than a generic message.
    const first = settled.find((r) => r.status === "rejected");
    const reason = first && "reason" in first ? first.reason : undefined;
    throw reason instanceof ApiError
      ? reason
      : new ApiError(502, "The AI is busy right now. Try again in a moment.");
  }

  return { letters };
});
