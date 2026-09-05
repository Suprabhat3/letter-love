"use client";

// Claim tokens for cards written while signed out.
//
// These live in localStorage, not sessionStorage: someone writes a letter,
// shares it, and signs up days later on the same device. Losing the token only
// means the card stays anonymous and keeps working — it is never the only copy
// of anything.

const KEY = "ll.claims";
const MAX = 50;

function read(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((t): t is string => typeof t === "string")
      : [];
  } catch {
    return [];
  }
}

function write(tokens: string[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(tokens.slice(-MAX)));
  } catch {
    // Private mode or a full quota. The card is already saved; it simply
    // cannot be claimed later from this browser.
  }
}

export function rememberClaimToken(token: string): void {
  const tokens = read();
  if (tokens.includes(token)) return;
  write([...tokens, token]);
}

export function pendingClaimTokens(): string[] {
  return read();
}

export function clearClaimTokens(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // Nothing to do; a re-claim is harmless because a claimed row no longer
    // matches its old token.
  }
}
