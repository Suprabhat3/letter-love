-- LetterLove Migration: Add user_id to existing cards table
-- Run this in Supabase SQL Editor if you already have the cards table

-- Step 1: Add user_id column to existing cards table
ALTER TABLE cards 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Step 2: Create index for faster user lookups
CREATE INDEX IF NOT EXISTS idx_cards_user_id ON cards(user_id);

-- Step 3: Add RLS policies for authenticated users (if not already added)
-- First, drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can update own cards" ON cards;
DROP POLICY IF EXISTS "Users can delete own cards" ON cards;

-- Create new policies
CREATE POLICY "Users can update own cards"
  ON cards FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cards"
  ON cards FOR DELETE
  USING (auth.uid() = user_id);

-- Done! Your existing cards will have user_id = NULL (anonymous cards)
-- New cards created by logged-in users will have their user_id set
