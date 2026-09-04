// Everything the two whole-letter routes agree on.
//
// They differ only in how the result comes back — one streams, one returns
// three at once — so the auth check, the quota, the validation and the prompt
// are built here once.
import "server-only";

import { ApiError, readJson } from "@/lib/api";
import { requireUser } from "@/lib/auth-server";
import { interviewFor, pickAnswers } from "@/lib/interview";
import { buildLetterPrompt } from "@/lib/prompts/letter";
import type { PromptPair } from "@/lib/prompts/enhance";
import { toneTemperature } from "@/lib/prompts/tones";
import { enforceLimit } from "@/lib/rate-limit";
import { getTemplateById } from "@/lib/templates";
import { readToneId, type ToneId } from "@/lib/tones";

export interface LetterRequest {
  prompt: PromptPair;
  tone: ToneId;
  temperature: number;
}

/**
 * Validate, authorise and meter a whole-letter request.
 *
 * Login is required here and nowhere else in the AI surface. Two reasons, and
 * the second is the better one: this is the expensive call, and it is also the
 * single best signup moment the product will ever get — someone who has just
 * answered five questions about a person they love is more willing to make an
 * account than they will be at any other point.
 *
 * @param cost how many model calls this request will make, charged to the quota
 *   up front. Three variants really are three calls and are billed as three.
 */
export async function prepareLetter(
  request: Request,
  cost = 1,
): Promise<LetterRequest> {
  const user = await requireUser(request);
  const body = await readJson(request);

  const templateId = typeof body.templateId === "string" ? body.templateId : "";
  const template = getTemplateById(templateId);
  if (!template) throw new ApiError(400, "Unknown template.");

  // The question list is re-derived from the template rather than trusted from
  // the body, so the answer map can only contain keys we actually asked for.
  const questions = interviewFor(template.id, template.category);
  const answers = pickAnswers(questions, body.answers);
  if (Object.keys(answers).length === 0) {
    throw new ApiError(400, "Answer at least one question first.");
  }

  for (let i = 0; i < cost; i++) {
    await enforceLimit(`user:${user.id}`, "ai_letter");
  }

  const tone = readToneId(body.tone);
  return {
    prompt: buildLetterPrompt({ template, tone, questions, answers }),
    tone,
    temperature: toneTemperature(tone),
  };
}
