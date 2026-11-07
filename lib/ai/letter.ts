// Everything the two whole-letter routes agree on.
//
// They differ only in how the result comes back — one streams, one returns
// three at once — so the auth check, the quota, the validation and the prompt
// are built here once.
import "server-only";

import { ApiError, readJson } from "@/lib/api";
import { requireUser } from "@/lib/auth-server";
import {
  interviewFor,
  pickAnswers,
  pickNames,
  type InterviewQuestion,
  type LetterNames,
} from "@/lib/interview";
import { buildLetterPrompt } from "@/lib/prompts/letter";
import type { PromptPair } from "@/lib/prompts/enhance";
import { toneTemperature } from "@/lib/prompts/tones";
import { enforceLimit, type LimitKind } from "@/lib/rate-limit";
import { getTemplateById } from "@/lib/templates";
import { readToneId, type ToneId } from "@/lib/tones";
import type { Template } from "@/lib/types";

export interface LetterRequest {
  prompt: PromptPair;
  tone: ToneId;
  temperature: number;
}

/** A validated, metered request, before any prompt is built from it. */
export interface LetterInput {
  template: Template;
  tone: ToneId;
  questions: InterviewQuestion[];
  answers: Record<string, string>;
  names: LetterNames;
}

/**
 * Validate, authorise and meter a request built from the interview.
 *
 * Login is required for every route that uses this. The interview now says so
 * on its first screen rather than after the last question, so nobody answers
 * everything before finding out.
 *
 * @param kind which daily quota to charge.
 * @param cost how many model calls this request will make, charged to the quota
 *   up front. Three variants really are three calls and are billed as three.
 */
export async function readLetterInput(
  request: Request,
  { kind = "ai_letter", cost = 1 }: { kind?: LimitKind; cost?: number } = {},
): Promise<LetterInput> {
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
    await enforceLimit(`user:${user.id}`, kind);
  }

  return {
    template,
    tone: readToneId(body.tone),
    questions,
    answers,
    names: pickNames(body.names),
  };
}

/** The whole-letter prompt, for the streaming and variants routes. */
export async function prepareLetter(
  request: Request,
  cost = 1,
): Promise<LetterRequest> {
  const input = await readLetterInput(request, { cost });
  return {
    prompt: buildLetterPrompt(input),
    tone: input.tone,
    temperature: toneTemperature(input.tone),
  };
}
