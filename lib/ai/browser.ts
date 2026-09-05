"use client";

// Browser-side calls to the AI routes.
//
// Every one of these returns an error *string* rather than throwing, because
// every call site has the same job: put a sentence in front of the user. The
// old editor swallowed failures into console.error and left the button looking
// broken.

import { supabase } from "@/lib/supabase";
import { cleanOutput } from "@/lib/prompts/sanitize";
import type { ToneId } from "@/lib/tones";

const GENERIC = "Couldn't reach the AI. Check your connection and try again.";

async function authHeaders(): Promise<HeadersInit> {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session?.access_token) {
    headers.Authorization = `Bearer ${session.access_token}`;
  }
  return headers;
}

async function errorFrom(response: Response): Promise<string> {
  const payload = await response.json().catch(() => null);
  return (
    (payload as { error?: string } | null)?.error ??
    "The AI is busy right now. Try again in a moment."
  );
}

export interface EnhanceRequest {
  prompt: string;
  fieldType: string;
  templateId: string;
  tone: ToneId;
}

export async function enhanceField(
  input: EnhanceRequest,
): Promise<{ text: string } | { error: string }> {
  try {
    const response = await fetch("/api/ai/enhance", {
      method: "POST",
      headers: await authHeaders(),
      body: JSON.stringify(input),
    });
    if (!response.ok) return { error: await errorFrom(response) };
    const data = (await response.json()) as { text?: string };
    if (!data.text) return { error: "The AI came back empty. Try again." };
    return { text: data.text };
  } catch {
    return { error: GENERIC };
  }
}

export interface LetterRequest {
  templateId: string;
  tone: ToneId;
  answers: Record<string, string>;
}

/**
 * Stream a whole letter, calling `onChunk` with the text so far.
 *
 * The route sends raw model deltas, so the output guard runs here, once, when
 * the stream ends: several of its rules (a leading "Here is your letter:",
 * paired bold markers) span chunk boundaries and would corrupt a fragment if
 * applied to one. What the user watches arrive is very slightly raw; what they
 * are left with is cleaned.
 *
 * `signal` lets the modal abort on close, which stops the tokens being paid for
 * as well as the render.
 */
export async function streamLetter(
  input: LetterRequest,
  onChunk: (textSoFar: string) => void,
  signal?: AbortSignal,
): Promise<{ text: string } | { error: string }> {
  try {
    const response = await fetch("/api/ai/letter", {
      method: "POST",
      headers: await authHeaders(),
      body: JSON.stringify(input),
      signal,
    });
    if (!response.ok) return { error: await errorFrom(response) };
    if (!response.body) return { error: GENERIC };

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let text = "";

    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      // `stream: true` so a multi-byte character split across two chunks is
      // held rather than decoded into a replacement character. Hinglish uses
      // plenty of emoji, all of which are multi-byte.
      text += decoder.decode(value, { stream: true });
      onChunk(text);
    }
    text += decoder.decode();

    const cleaned = cleanOutput(text);
    // A stream that ends early looks identical to one that finished, so length
    // is the only signal that the model was cut off mid-sentence.
    if (cleaned.length < 40) {
      return { error: "The AI stopped early. Please try again." };
    }
    return { text: cleaned };
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return { error: "" };
    }
    return { error: GENERIC };
  }
}

export async function fetchLetterVariants(
  input: LetterRequest,
  signal?: AbortSignal,
): Promise<{ letters: string[] } | { error: string }> {
  try {
    const response = await fetch("/api/ai/letter/variants", {
      method: "POST",
      headers: await authHeaders(),
      body: JSON.stringify(input),
      signal,
    });
    if (!response.ok) return { error: await errorFrom(response) };
    const data = (await response.json()) as { letters?: string[] };
    if (!data.letters?.length) return { error: "The AI came back empty." };
    return { letters: data.letters };
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return { error: "" };
    }
    return { error: GENERIC };
  }
}
