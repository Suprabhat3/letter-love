import { completeJson } from "@/lib/ai/client";
import { readLetterInput } from "@/lib/ai/letter";
import { withHandler } from "@/lib/api";
import { extraFieldsFor } from "@/lib/interview";
import { buildFieldsPrompt } from "@/lib/prompts/fields";
import { cleanOutput } from "@/lib/prompts/sanitize";
import { toneTemperature } from "@/lib/prompts/tones";

export const runtime = "nodejs";
export const maxDuration = 30;

/** Generous for a wish or a memory, far short of a second letter. */
const MAX_FIELD_CHARS = 600;

interface FieldsResult {
  fields: Record<string, string>;
}

/**
 * The card's smaller fields, filled from the interview answers.
 *
 * The client fires this at the same moment as the streamed letter, so by the
 * time the letter finishes the memory, wish, promise and so on are usually
 * already back. Before this, the AI wrote the one textarea and every other
 * field had to be typed by hand from scratch, even when the interview had
 * already asked for exactly that detail.
 *
 * Charged to the per-user enhance quota rather than the letter quota: it is a
 * short call, and billing it as a letter would halve how many letters a person
 * can write in a day.
 */
export const POST = withHandler<FieldsResult>(async (request) => {
  const input = await readLetterInput(request, { kind: "ai_enhance" });
  const fields = extraFieldsFor(input.template);
  if (fields.length === 0) return { fields: {} };

  const { schema, ...prompt } = buildFieldsPrompt({ ...input, fields });
  const raw = await completeJson(
    prompt,
    { name: "card_fields", schema },
    // Lower than the letter: these are facts pulled into shape, not prose.
    { temperature: Math.min(0.7, toneTemperature(input.tone)) },
  );

  // Only fields this template actually has, only non-empty strings. The model
  // returning "" for a field is the "no basis in the answers" signal.
  const out: Record<string, string> = {};
  for (const field of fields) {
    const value = raw[field.name];
    if (typeof value !== "string") continue;
    const cleaned = cleanOutput(value).slice(0, MAX_FIELD_CHARS);
    if (cleaned) out[field.name] = cleaned;
  }
  return { fields: out };
});
