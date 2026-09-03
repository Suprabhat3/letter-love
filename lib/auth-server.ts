// Verifying who is calling an API route.
//
// We deliberately do NOT use @supabase/ssr here. It buys cookie-based server
// sessions but requires a middleware.ts and a rewrite of lib/auth-context.tsx.
// Sending the access token the browser already holds and verifying it
// server-side is equivalent for these routes, with zero new dependencies.
// Adopt @supabase/ssr when the dashboard needs to be server-rendered.
import "server-only";

import { ApiError } from "./api";
import { supabaseAdmin } from "./supabase-server";

export interface AuthedUser {
  id: string;
  email?: string;
}

function bearerToken(request: Request): string | null {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  const token = header.slice(7).trim();
  return token.length > 0 ? token : null;
}

/**
 * The signed-in user, or null. The token is verified against Supabase — it is
 * never merely decoded, so a forged JWT gets nowhere.
 */
export async function getUser(request: Request): Promise<AuthedUser | null> {
  const token = bearerToken(request);
  if (!token) return null;

  const { data, error } = await supabaseAdmin().auth.getUser(token);
  if (error || !data.user) return null;
  return { id: data.user.id, email: data.user.email };
}

/** As `getUser`, but a missing or invalid token is a 401. */
export async function requireUser(request: Request): Promise<AuthedUser> {
  const user = await getUser(request);
  if (!user) throw new ApiError(401, "Please sign in to continue.", "unauthorized");
  return user;
}
