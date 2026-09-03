-- Phase 3 — flip the trust boundary, anonymous create, usage counters
--
-- ⚠️  DEPLOY TOGETHER OR NOT AT ALL.
-- This migration removes the public SELECT policy on `cards`. From the moment
-- it runs, the anon key can read only rows the signed-in user owns, and every
-- share link 404s UNLESS the code that reads share pages through the
-- service-role client (lib/cards-server.ts) is already deployed AND
-- SUPABASE_SERVICE_ROLE_KEY is set in the deployment environment.
--
-- Order: set the env var → deploy the code → run this → verify a share link in
-- a logged-out incognito window. Verify against a preview deploy first.

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. Anonymous cards and claiming
-- ---------------------------------------------------------------------------

-- A card created while signed out carries a random token, held by the author's
-- browser. Exchanging it for ownership happens server-side; the column is never
-- exposed to a client.
ALTER TABLE cards ADD COLUMN IF NOT EXISTS claim_token TEXT;

-- Partial: only unclaimed rows are ever looked up by token, and this also
-- enforces that a token cannot be shared between two rows.
CREATE UNIQUE INDEX IF NOT EXISTS idx_cards_claim_token
  ON cards(claim_token)
  WHERE claim_token IS NOT NULL;

-- ---------------------------------------------------------------------------
-- 2. The trust boundary
-- ---------------------------------------------------------------------------

-- Public reads now go through the service role in server code, which bypasses
-- RLS. What remains here is owner-scoped access for the dashboard and editor,
-- which use the anon key with the user's JWT attached.
DROP POLICY IF EXISTS "Cards are publicly readable" ON cards;

DROP POLICY IF EXISTS "cards_select_own" ON cards;
CREATE POLICY "cards_select_own"
  ON cards FOR SELECT
  USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 3. Usage counters (rate limiting)
-- ---------------------------------------------------------------------------

-- One row per (subject, kind, day). `subject` is a salted hash of an IP or a
-- user id — never a raw IP.
CREATE TABLE IF NOT EXISTS usage_counters (
  subject TEXT NOT NULL,
  kind    TEXT NOT NULL,
  day     DATE NOT NULL DEFAULT CURRENT_DATE,
  count   INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (subject, kind, day)
);

ALTER TABLE usage_counters ENABLE ROW LEVEL SECURITY;
-- No policies at all: only the service role touches this table, and the
-- service role bypasses RLS. An anon-key client can neither read nor write it.

-- Increment and report whether the caller is still under the cap, in ONE
-- statement. Doing this as a read-then-write from the application races: two
-- concurrent requests both read `count` below the cap and both proceed.
CREATE OR REPLACE FUNCTION bump_usage(
  p_subject TEXT,
  p_kind    TEXT,
  p_limit   INTEGER
) RETURNS TABLE (allowed BOOLEAN, used INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_count INTEGER;
BEGIN
  INSERT INTO usage_counters (subject, kind, day, count)
  VALUES (p_subject, p_kind, CURRENT_DATE, 1)
  ON CONFLICT (subject, kind, day)
  DO UPDATE SET count = usage_counters.count + 1
  RETURNING usage_counters.count INTO new_count;

  RETURN QUERY SELECT (new_count <= p_limit), new_count;
END;
$$;

REVOKE ALL ON FUNCTION bump_usage(TEXT, TEXT, INTEGER) FROM PUBLIC, anon, authenticated;

COMMIT;

-- Housekeeping: old counter rows are dead weight. Either schedule this with
-- pg_cron, or run it by hand occasionally — it is not correctness-critical.
--   DELETE FROM usage_counters WHERE day < CURRENT_DATE - INTERVAL '7 days';
