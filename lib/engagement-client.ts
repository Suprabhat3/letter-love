"use client";

// Browser calls for the engagement loop.
//
// Every one of these is best-effort by design: a failed beacon or a failed
// reaction must never surface an error over someone's letter. The caller gets
// `null` and simply leaves the numbers where they were.

import { supabase } from "./supabase";
import type { ReactionCounts, ReactionEmoji } from "./reactions";

export interface OpenReport {
  viewCount: number;
  uniqueViewCount: number;
  reactionCounts: ReactionCounts;
  mine: ReactionEmoji[];
}

async function authHeaders(): Promise<HeadersInit> {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.access_token) {
      headers.Authorization = `Bearer ${session.access_token}`;
    }
  } catch {
    // A signed-out viewer is the normal case, not an error.
  }
  return headers;
}

/**
 * Tell the server a human opened this card.
 *
 * Deliberately called after the envelope finishes rather than on mount: link
 * previews fetch the share URL, so counting any earlier means the sender's own
 * paste inflates the count before the recipient has seen anything.
 *
 * The auth header matters here. It is how the server recognises the owner
 * looking at their own card and keeps that view out of the public counters.
 */
export async function reportOpen(cardId: string): Promise<OpenReport | null> {
  try {
    const response = await fetch(
      `/api/cards/${encodeURIComponent(cardId)}/view`,
      { method: "POST", headers: await authHeaders() },
    );
    if (!response.ok) return null;
    return (await response.json()) as OpenReport;
  } catch {
    return null;
  }
}

export async function sendReaction(
  cardId: string,
  emoji: ReactionEmoji,
): Promise<{ counts: ReactionCounts; active: boolean } | null> {
  try {
    const response = await fetch(
      `/api/cards/${encodeURIComponent(cardId)}/react`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emoji }),
      },
    );
    if (!response.ok) return null;
    return (await response.json()) as {
      counts: ReactionCounts;
      active: boolean;
    };
  } catch {
    return null;
  }
}

export interface ReplyContext {
  replyToSender: string;
  replyToRecipient: string;
  templateId: string;
}

export async function fetchReplyContext(
  cardId: string,
): Promise<ReplyContext | null> {
  try {
    const response = await fetch(
      `/api/cards/${encodeURIComponent(cardId)}/reply-context`,
    );
    if (!response.ok) return null;
    return (await response.json()) as ReplyContext;
  } catch {
    return null;
  }
}
