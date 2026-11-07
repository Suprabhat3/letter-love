// The one place that talks to the model.
//
// OpenAI chat completions. Every AI route goes through here so the timeout, the abort handling and the error mapping exist
// once — previously the single route did all three inline and every future
// route would have re-implemented them slightly differently.
import "server-only";

import OpenAI from "openai";

import { ApiError } from "@/lib/api";
import type { PromptPair } from "@/lib/prompts/enhance";
import { cleanOutput } from "@/lib/prompts/sanitize";

/**
 * Overridable per deploy so a model change is a config edit, not a code change.
 * Runs with `reasoning_effort: "none"`: these are short creative writes where
 * thinking only adds latency, and on GPT-5.x it is also the mode in which the
 * per-tone `temperature` (and the variants' spread) is accepted.
 */
export const MODEL = process.env.OPENAI_MODEL?.trim() || "gpt-5.1";
const REASONING_EFFORT = "none" as const;

/** Comfortably inside the route's own maxDuration, so we abort before Vercel does. */
const DEFAULT_TIMEOUT_MS = 25_000;

let cached: OpenAI | null = null;

function client(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    // A real status, not a 500: "AI is not configured" is actionable for us and
    // honest to the user, and it is what an unset key on a preview deploy is.
    throw new ApiError(503, "AI is not set up on this server.", "ai_unavailable");
  }
  // The SDK's own retries cover 429s and 5xx with backoff; our AbortController
  // timeout still bounds the total wait.
  cached ??= new OpenAI({ apiKey, maxRetries: 2 });
  return cached;
}

interface CallOptions {
  temperature: number;
  maxTokens?: number;
  timeoutMs?: number;
}

/** Map a thrown SDK error onto something the user can read. */
function asApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  const aborted =
    error instanceof Error &&
    (error.name === "AbortError" || error.name === "APIUserAbortError");
  if (aborted) {
    return new ApiError(504, "The AI took too long. Please try again.", "ai_timeout");
  }
  console.error("AI call failed:", error);
  return new ApiError(502, "The AI is busy right now. Try again in a moment.", "ai_failed");
}

/** One blocking call. Returns cleaned text, or throws an ApiError. */
export async function complete(
  prompt: PromptPair,
  { temperature, maxTokens = 2000, timeoutMs = DEFAULT_TIMEOUT_MS }: CallOptions,
): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const completion = await client().chat.completions.create(
      {
        model: MODEL,
        reasoning_effort: REASONING_EFFORT,
        temperature,
        max_completion_tokens: maxTokens,
        messages: [
          { role: "system", content: prompt.system },
          { role: "user", content: prompt.user },
        ],
      },
      { signal: controller.signal },
    );

    const text = cleanOutput(completion.choices[0]?.message?.content || "");
    if (!text) {
      throw new ApiError(
        502,
        "The AI came back empty. Try adding a little more detail.",
        "ai_empty",
      );
    }
    return text;
  } catch (error) {
    throw asApiError(error);
  } finally {
    clearTimeout(timer);
  }
}

/**
 * One blocking call that returns JSON matching `schema`, via structured
 * outputs (`strict: true`), so the shape is enforced by the API rather than
 * hoped for. Values are returned raw; the caller cleans each one.
 */
export async function completeJson(
  prompt: PromptPair,
  schema: { name: string; schema: Record<string, unknown> },
  { temperature, maxTokens = 800, timeoutMs = DEFAULT_TIMEOUT_MS }: CallOptions,
): Promise<Record<string, unknown>> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const completion = await client().chat.completions.create(
      {
        model: MODEL,
        reasoning_effort: REASONING_EFFORT,
        temperature,
        max_completion_tokens: maxTokens,
        response_format: {
          type: "json_schema",
          json_schema: { name: schema.name, strict: true, schema: schema.schema },
        },
        messages: [
          { role: "system", content: prompt.system },
          { role: "user", content: prompt.user },
        ],
      },
      { signal: controller.signal },
    );

    const raw = completion.choices[0]?.message?.content ?? "";
    try {
      const parsed: unknown = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
      }
    } catch {
      // Fall through: a refusal or a truncated response is not JSON.
    }
    throw new ApiError(502, "The AI came back in the wrong shape. Try again.", "ai_bad_json");
  } catch (error) {
    throw asApiError(error);
  } finally {
    clearTimeout(timer);
  }
}

/**
 * The same call, streamed as plain UTF-8 text.
 *
 * 150 to 300 words on a Jio connection is a four to eight second blank spinner
 * that reads as broken. Streaming turns exactly the same wait into the AI
 * visibly writing to them, which is the product's magic moment and costs
 * nothing.
 *
 * Deltas are sent raw. The output guard is a set of regexes over the whole
 * text, and several of them (bold pairs, a leading "Here is your letter:")
 * cannot be applied to a fragment without corrupting it, so the client runs
 * `cleanOutput` once when the stream ends. Per-field enhance stays blocking and
 * is cleaned here.
 *
 * The upstream call is awaited before the stream is returned, so an auth,
 * quota or configuration failure still becomes a real status code. Once the
 * first byte is out the status is committed, and a mid-stream failure can only
 * end the stream early — the client treats a suspiciously short result as a
 * failure for that reason.
 */
export async function streamCompletion(
  prompt: PromptPair,
  { temperature, maxTokens = 2000, timeoutMs = DEFAULT_TIMEOUT_MS }: CallOptions,
): Promise<ReadableStream<Uint8Array>> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let stream;
  try {
    stream = await client().chat.completions.create(
      {
        model: MODEL,
        reasoning_effort: REASONING_EFFORT,
        temperature,
        max_completion_tokens: maxTokens,
        stream: true,
        messages: [
          { role: "system", content: prompt.system },
          { role: "user", content: prompt.user },
        ],
      },
      { signal: controller.signal },
    );
  } catch (error) {
    clearTimeout(timer);
    throw asApiError(error);
  }

  const encoder = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    async start(controllerOut) {
      try {
        for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta?.content;
          if (delta) controllerOut.enqueue(encoder.encode(delta));
        }
        controllerOut.close();
      } catch (error) {
        console.error("AI stream failed mid-flight:", error);
        // Closing rather than erroring: the client has already rendered part of
        // the letter, and tearing the response down loses it. A truncated
        // letter the user can see and edit beats an error over an empty box.
        controllerOut.close();
      } finally {
        clearTimeout(timer);
      }
    },
    cancel() {
      // The user closed the modal or navigated away. Stop paying for tokens.
      clearTimeout(timer);
      controller.abort();
    },
  });
}
