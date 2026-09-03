// The service-role Supabase client. Bypasses RLS entirely.
//
// `import "server-only"` is the single highest-value line in this file: it
// turns an accidental client import into a *build* error rather than a
// service-role key shipped in a JS bundle. Never rename the key to
// NEXT_PUBLIC_*, and never import this from anything under components/.
import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let client: SupabaseClient | null = null;

/**
 * Lazily constructed so that a missing key fails on the request that needs it,
 * with a readable message, rather than at module load — which in Next would
 * surface as an opaque build failure on an unrelated page.
 */
export function supabaseAdmin(): SupabaseClient {
  if (!url || !serviceRoleKey) {
    throw new Error(
      "Supabase server client is not configured. Set SUPABASE_SERVICE_ROLE_KEY " +
        "(Project Settings → API → service_role) in .env.local and in your " +
        "deployment environment.",
    );
  }
  client ??= createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}

/** Whether the server client can be used at all. Lets callers degrade instead of throwing. */
export function hasServerCredentials(): boolean {
  return Boolean(url && serviceRoleKey);
}
