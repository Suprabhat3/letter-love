"use client";

// Browser-side calls to the card API.
//
// Writes go through route handlers rather than the anon-key client directly:
// the server is the only place that can rate-limit, generate an unguessable
// id, and normalise `data` before it is stored.

import { supabase } from "./supabase";
import type { StoredCardData } from "./cardStyle";
import { rememberClaimToken } from "./claim";

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

async function call<T>(
  method: string,
  path: string,
  body: unknown,
): Promise<T | { error: string }> {
  try {
    const response = await fetch(path, {
      method,
      headers: await authHeaders(),
      body: JSON.stringify(body),
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      return {
        error:
          (payload as { error?: string } | null)?.error ??
          "Something went wrong. Please try again.",
      };
    }
    return payload as T;
  } catch {
    return { error: "Couldn't reach the server. Check your connection." };
  }
}

export async function createCard(
  templateId: string,
  data: StoredCardData,
): Promise<{ id: string } | { error: string }> {
  const result = await call<{ id: string; claimToken?: string }>(
    "POST",
    "/api/cards",
    { templateId, data },
  );
  if ("error" in result) return result;

  // Anonymous card: hold the token so signing in later can attach it.
  if (result.claimToken) rememberClaimToken(result.claimToken);
  return { id: result.id };
}

export async function updateCard(
  id: string,
  data: StoredCardData,
): Promise<{ success: true } | { error: string }> {
  const result = await call<{ success: true }>("PATCH", "/api/cards", {
    id,
    data,
  });
  return "error" in result ? result : { success: true };
}

/**
 * Attach any anonymous cards this browser created to the signed-in account.
 * Safe to call on every sign-in: with no tokens it is a no-op and makes no
 * request.
 */
export async function claimPendingCards(
  tokens: string[],
): Promise<{ claimed: number }> {
  if (tokens.length === 0) return { claimed: 0 };
  const result = await call<{ claimed: number }>("POST", "/api/cards/claim", {
    tokens,
  });
  return "error" in result ? { claimed: 0 } : result;
}
