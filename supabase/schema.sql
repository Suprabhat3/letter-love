-- LetterLove Supabase Schema
-- Run this in the Supabase SQL Editor to create the required tables

-- Cards table for storing shareable cards
CREATE TABLE cards (
  id TEXT PRIMARY KEY,                           -- Short unique ID (e.g., "aB3xY8kL")
  template_id TEXT NOT NULL,                     -- Template used (e.g., "love-letter", "birthday-wish")
  data JSONB NOT NULL DEFAULT '{}',              -- User's filled fields (recipientName, message, etc.)
  user_id UUID REFERENCES auth.users(id),        -- Optional: owner of the card (NULL for anonymous)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX idx_cards_template_id ON cards(template_id);
CREATE INDEX idx_cards_user_id ON cards(user_id);
CREATE INDEX idx_cards_created_at ON cards(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read cards (for shareable links)
CREATE POLICY "Cards are publicly readable"
  ON cards FOR SELECT
  USING (true);

-- Policy: Anyone can insert cards (including anonymous users)
CREATE POLICY "Anyone can create cards"
  ON cards FOR INSERT
  WITH CHECK (true);

-- Policy: Only card owner can update their cards
CREATE POLICY "Users can update own cards"
  ON cards FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Only card owner can delete their cards
CREATE POLICY "Users can delete own cards"
  ON cards FOR DELETE
  USING (auth.uid() = user_id);
