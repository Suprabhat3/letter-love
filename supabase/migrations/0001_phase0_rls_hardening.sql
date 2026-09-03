-- Phase 0 — RLS hardening for `cards`
-- Run this in the Supabase SQL Editor. Safe to run against a live database:
-- it changes no data and does not affect existing share links.
--
-- Problem: INSERT was `WITH CHECK (true)`, so anyone holding the (public) anon
-- key could insert a row claiming ANY user_id — including another user's —
-- making cards appear in a stranger's dashboard. UPDATE had a USING clause but
-- no WITH CHECK, so an owner could reassign ownership of their own row.

BEGIN;

-- Allow anonymous cards (user_id IS NULL), which the anonymous-create flow
-- needs, while forbidding impersonation of a specific user.
DROP POLICY IF EXISTS "Anyone can create cards" ON cards;
CREATE POLICY "cards_insert_self_or_anon"
  ON cards FOR INSERT
  WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

-- USING gates which rows may be updated; WITH CHECK gates what they may become.
-- Without the latter, `UPDATE cards SET user_id = <someone else>` is allowed.
DROP POLICY IF EXISTS "Users can update own cards" ON cards;
CREATE POLICY "cards_update_own"
  ON cards FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

COMMIT;

-- NOTE: SELECT is deliberately left as `USING (true)` here. Flipping the trust
-- boundary (owner-only SELECT + service-role reads for public share pages) is
-- Phase 3, and must ship in the same deploy as the server-side card reader —
-- landing it alone 404s every live share link.
