import { createClient } from "@supabase/supabase-js";
import { SharedCard } from "./types";

// The browser client. Since migration 0002 the anon key can SELECT only rows
// the signed-in user owns, so everything here is owner-scoped: the dashboard
// list, the delete, and loading your own card into the editor.
//
// WRITES DO NOT BELONG HERE. Creating and updating cards goes through
// /api/cards (lib/cards-client.ts) so the server can rate-limit, generate an
// unguessable id, and normalise `data` before it is stored. Public share-page
// reads go through lib/cards-server.ts.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Get one of your own cards, for the editor. RLS makes this owner-scoped;
// public share reads go through lib/cards-server.ts instead.
export async function getCard(id: string): Promise<SharedCard | null> {
  const { data, error } = await supabase
    .from("cards")
    .select("id, template_id, data, user_id, created_at")
    .eq("id", id)
    .single();

  if (error || !data) {
    console.error("Error fetching card:", error);
    return null;
  }

  return data as SharedCard;
}

// Get all cards for a user, with their Phase 4 receipts.
//
// The counters are denormalized onto the row precisely so this stays one
// query — the dashboard needs no /api/me/receipts endpoint, because RLS
// already scopes this to the caller. Columns are listed explicitly rather than
// `*` so a server-side column added later (claim_token is the live example)
// cannot start arriving in the browser by accident.
export async function getUserCards(userId: string): Promise<SharedCard[]> {
  const { data, error } = await supabase
    .from("cards")
    .select(
      "id, template_id, data, user_id, created_at, view_count, unique_view_count, last_viewed_at, reaction_counts, reply_count",
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("Error fetching user cards:", error);
    return [];
  }

  return data as SharedCard[];
}

// Delete a card
export async function deleteCard(id: string, userId: string): Promise<boolean> {
  const { error } = await supabase
    .from("cards")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  return !error;
}

// Generate the full shareable URL
export function getShareUrl(cardId: string): string {
  const baseUrl = typeof window !== "undefined" 
    ? window.location.origin 
    : process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  return `${baseUrl}/share/${cardId}`;
}

