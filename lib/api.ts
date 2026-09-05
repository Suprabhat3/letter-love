// Route-handler plumbing: one error type and one wrapper, so every API route
// returns the same shape and an unexpected throw can never leak a stack trace
// or a Postgres error string to the client.
import "server-only";

import { NextResponse } from "next/server";

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    /** Machine-readable, for the client to branch on. */
    readonly code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export interface ApiErrorBody {
  error: string;
  code?: string;
}

// The second argument is Next's route context — `{ params: Promise<…> }` for a
// dynamic segment, and unused by the static routes, which simply ignore it.
type Handler<T, C> = (request: Request, context: C) => Promise<T>;

/**
 * Wrap a route handler.
 *
 * An `ApiError` becomes its own status and message — those are written for the
 * user. Anything else becomes a generic 500: the AI route's current habit of
 * `console.error` and a silent failure is what makes a rate-limited call
 * indistinguishable from a broken button, but the fix is a real error *body*,
 * not the raw exception.
 */
export function withHandler<T, C = unknown>(handler: Handler<T, C>) {
  return async (request: Request, context: C): Promise<NextResponse> => {
    try {
      return NextResponse.json((await handler(request, context)) as object);
    } catch (err) {
      if (err instanceof ApiError) {
        return NextResponse.json<ApiErrorBody>(
          { error: err.message, code: err.code },
          { status: err.status },
        );
      }
      console.error("Unhandled API error:", err);
      return NextResponse.json<ApiErrorBody>(
        { error: "Something went wrong. Please try again." },
        { status: 500 },
      );
    }
  };
}

/** Parse a JSON body, rejecting anything that is not an object. */
export async function readJson(
  request: Request,
): Promise<Record<string, unknown>> {
  let parsed: unknown;
  try {
    parsed = await request.json();
  } catch {
    throw new ApiError(400, "Expected a JSON body.");
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new ApiError(400, "Expected a JSON object.");
  }
  return parsed as Record<string, unknown>;
}

/**
 * A stable, non-identifying key for the caller, for rate limiting.
 *
 * Hashed with a server-side salt and never stored raw — a raw IP is personal
 * data under the DPDP Act, and we have no reason to hold one.
 */
export async function clientKey(request: Request): Promise<string> {
  const forwarded = request.headers.get("x-forwarded-for") ?? "";
  const ip = forwarded.split(",")[0]?.trim() || "unknown";
  const salt = process.env.VIEWER_SALT ?? "letterlove-dev-salt";
  const bytes = new TextEncoder().encode(`${salt}:${ip}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest).slice(0, 16))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
