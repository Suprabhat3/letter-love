import { createClient } from "@supabase/supabase-js";
import { SharedCard } from "./types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Generate a short unique ID for shareable URLs
export function generateCardId(): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Create a new card in Supabase
export async function createCard(
  templateId: string,
  data: Record<string, string>,
  userId?: string
): Promise<{ id: string } | { error: string }> {
  const id = generateCardId();
  
  const cardData: {
    id: string;
    template_id: string;
    data: Record<string, string>;
    created_at: string;
    user_id?: string;
  } = {
    id,
    template_id: templateId,
    data,
    created_at: new Date().toISOString(),
  };

  // Only add user_id if provided (logged in user)
  if (userId) {
    cardData.user_id = userId;
  }

  const { error } = await supabase.from("cards").insert(cardData);

  if (error) {
    console.error("Error creating card:", error);
    return { error: error.message };
  }

  return { id };
}

// Get a card by ID from Supabase
export async function getCard(id: string): Promise<SharedCard | null> {
  const { data, error } = await supabase
    .from("cards")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    console.error("Error fetching card:", error);
    return null;
  }

  return data as SharedCard;
}

// Get all cards for a user
export async function getUserCards(userId: string): Promise<SharedCard[]> {
  const { data, error } = await supabase
    .from("cards")
    .select("*")
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
