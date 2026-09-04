import { complete, MODEL } from "@/lib/ai/client";
import { ApiError, clientKey, readJson, withHandler } from "@/lib/api";
import { getUser } from "@/lib/auth-server";
import { buildEnhancePrompt } from "@/lib/prompts/enhance";
import { sanitizeUserText } from "@/lib/prompts/sanitize";
import { toneTemperature } from "@/lib/prompts/tones";
import { enforceLimit } from "@/lib/rate-limit";
import { getTemplateById } from "@/lib/templates";
import { readToneId } from "@/lib/tones";

export const runtime = "nodejs";
export const maxDuration = 30;

interface EnhanceResult {
  text: string;
  model: string;
}

/**
 * Polish one field.
 *
 * Stays anonymous on purpose: gating the first touch of the editor behind a
 * login is the same funnel leak that anonymous card creation just removed. The
 * spend is bounded by the per-IP daily cap instead.
 *
 * It also now runs through `withHandler`, so a failure produces a real error
 * body. The old route's habit of logging to the console and returning nothing
 * useful is precisely what made a rate-limited call indistinguishable from a
 * broken button.
 */
export const POST = withHandler<EnhanceResult>(async (request) => {
  const body = await readJson(request);

  const draft = sanitizeUserText(
    typeof body.prompt === "string" ? body.prompt : "",
  );
  if (!draft) {
    throw new ApiError(400, "Write a few words first, then tap enhance.");
  }

  const fieldType =
    typeof body.fieldType === "string"
      ? body.fieldType.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 40) || "message"
      : "message";

  // Per user when we know one, per hashed IP otherwise. Cookies and sessions
  // are both free to discard, so the IP cap is the one that actually binds.
  const user = await getUser(request);
  await enforceLimit(`ip:${await clientKey(request)}`, "ai_enhance");
  if (user) await enforceLimit(`user:${user.id}`, "ai_enhance");

  // Only an id is accepted. The name and description are looked up here —
  // taking them from the body let a crafted POST rewrite the system prompt.
  const template =
    typeof body.templateId === "string"
      ? getTemplateById(body.templateId)
      : undefined;

  const tone = readToneId(body.tone);

  const text = await complete(
    buildEnhancePrompt({ template, fieldType, tone, draft }),
    { temperature: toneTemperature(tone) },
  );

  return { text, model: MODEL };
});
