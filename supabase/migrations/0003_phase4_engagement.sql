-- Phase 4 — the viral loop: view receipts, reactions, replies
--
-- Safe to run against a live database ahead of the code: every column is
-- nullable or defaulted, and nothing existing changes behaviour. Unlike
-- migration 0002, this one does NOT need to land in the same deploy — old rows
-- simply read as "0 views, no reactions" until the client starts reporting.
--
-- Counters are denormalized onto `cards` so the dashboard and the share page
-- get them in the query they already run. `card_views` and `card_reactions`
-- remain the audit trail and the anti-abuse key.

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. Denormalized counters
-- ---------------------------------------------------------------------------

ALTER TABLE cards
  ADD COLUMN IF NOT EXISTS view_count        INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS unique_view_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS first_viewed_at   TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_viewed_at    TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reaction_counts   JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS reply_count       INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS reply_to_card_id  TEXT REFERENCES cards(id) ON DELETE SET NULL;

-- The dashboard asks "which of my cards have replies"; the reply itself points
-- upward, so this is the index that answers it.
CREATE INDEX IF NOT EXISTS idx_cards_reply_to ON cards(reply_to_card_id)
  WHERE reply_to_card_id IS NOT NULL;

-- ---------------------------------------------------------------------------
-- 2. Viewers
-- ---------------------------------------------------------------------------

-- One row per (card, viewer) rather than one per page load: it keeps the table
-- small, makes the unique count free, and bounds what one viewer can write.
--
-- `viewer_hash` is sha256(card_id + viewer cookie + VIEWER_SALT). Salting with
-- the card id means two cards' view rows cannot be joined to build a
-- cross-card profile of one person — a cheap privacy win that matters under
-- the DPDP Act. No raw IP is stored anywhere: `country` and `device` are
-- deliberately coarse.
CREATE TABLE IF NOT EXISTS card_views (
  card_id       TEXT NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  viewer_hash   TEXT NOT NULL,
  view_count    INTEGER NOT NULL DEFAULT 1,
  is_owner      BOOLEAN NOT NULL DEFAULT FALSE,
  country       TEXT,
  device        TEXT,
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (card_id, viewer_hash)
);

ALTER TABLE card_views ENABLE ROW LEVEL SECURITY;
-- No policies: only the service role touches this, and it bypasses RLS. An
-- anon-key client can neither read nor write it. Reads reach the owner through
-- the counters on `cards`, which is all the dashboard needs.

-- ---------------------------------------------------------------------------
-- 3. Reactions
-- ---------------------------------------------------------------------------

-- The composite primary key IS the anti-abuse story: a viewer can create at
-- most one row per emoji per card, ever — so the ceiling on inflating a card's
-- reaction counts from one browser is six.
CREATE TABLE IF NOT EXISTS card_reactions (
  card_id     TEXT NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  viewer_hash TEXT NOT NULL,
  emoji       TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (card_id, viewer_hash, emoji)
);

-- A closed set, enforced in the database as well as in the route. Every value
-- here is rendered as a key of `cards.reaction_counts` on the share page, so
-- keeping the set closed at the storage layer means no application bug can put
-- arbitrary text into that object.
ALTER TABLE card_reactions DROP CONSTRAINT IF EXISTS card_reactions_emoji_check;
ALTER TABLE card_reactions ADD CONSTRAINT card_reactions_emoji_check
  CHECK (emoji IN ('❤️', '🥹', '😂', '🔥', '🥺', '🙏'));

ALTER TABLE card_reactions ENABLE ROW LEVEL SECURITY;
-- Again no policies. A client-side insert with the anon key would be an open
-- spam endpoint; reactions go through a route handler.

-- ---------------------------------------------------------------------------
-- 4. Recording a view
-- ---------------------------------------------------------------------------

-- Upsert the viewer row and roll the card's counters forward in ONE statement
-- each, inside one transaction. A read-then-write from the application races:
-- two tabs opening at once would both see the same `view_count`.
--
-- Owner views are RECORDED but EXCLUDED from the counters — otherwise a sender
-- refreshing their own card manufactures the open receipt they are looking at,
-- which makes the whole feature a lie.
CREATE OR REPLACE FUNCTION record_card_view(
  p_card_id     TEXT,
  p_viewer_hash TEXT,
  p_is_owner    BOOLEAN,
  p_country     TEXT,
  p_device      TEXT
) RETURNS TABLE (view_count INTEGER, unique_view_count INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_new_viewer  BOOLEAN;
  viewer_total   INTEGER;
BEGIN
  INSERT INTO card_views AS cv
    (card_id, viewer_hash, view_count, is_owner, country, device)
  VALUES (p_card_id, p_viewer_hash, 1, p_is_owner, p_country, p_device)
  ON CONFLICT (card_id, viewer_hash) DO UPDATE
    SET view_count   = cv.view_count + 1,
        last_seen_at = NOW()
  -- `xmax = 0` is true only for a genuinely inserted row, which is what makes
  -- the unique count exact without a second query.
  RETURNING (cv.xmax = 0), cv.view_count INTO is_new_viewer, viewer_total;

  IF p_is_owner THEN
    RETURN QUERY SELECT c.view_count, c.unique_view_count FROM cards c WHERE c.id = p_card_id;
    RETURN;
  END IF;

  -- One viewer cannot run the public number up for ever. Their own row keeps
  -- counting (the owner's receipt says "opened 4 times" from that), but past
  -- this point they stop moving the card total.
  IF viewer_total > 100 THEN
    RETURN QUERY SELECT c.view_count, c.unique_view_count FROM cards c WHERE c.id = p_card_id;
    RETURN;
  END IF;

  UPDATE cards c
     SET view_count        = c.view_count + 1,
         unique_view_count = c.unique_view_count + (CASE WHEN is_new_viewer THEN 1 ELSE 0 END),
         first_viewed_at   = COALESCE(c.first_viewed_at, NOW()),
         last_viewed_at    = NOW()
   WHERE c.id = p_card_id
  RETURNING c.view_count, c.unique_view_count INTO view_count, unique_view_count;

  RETURN NEXT;
END;
$$;

REVOKE ALL ON FUNCTION record_card_view(TEXT, TEXT, BOOLEAN, TEXT, TEXT)
  FROM PUBLIC, anon, authenticated;

-- ---------------------------------------------------------------------------
-- 5. Toggling a reaction
-- ---------------------------------------------------------------------------

-- Returns the whole counts object plus whether the reaction is now on, so the
-- client can reconcile its optimistic update against the truth in one round
-- trip. The denormalized counter is adjusted in the same transaction as the
-- audit row, so the two cannot drift.
CREATE OR REPLACE FUNCTION toggle_card_reaction(
  p_card_id     TEXT,
  p_viewer_hash TEXT,
  p_emoji       TEXT
) RETURNS TABLE (counts JSONB, active BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  delta         INTEGER;
  now_active    BOOLEAN;
  current_count INTEGER;
BEGIN
  DELETE FROM card_reactions
   WHERE card_id = p_card_id
     AND viewer_hash = p_viewer_hash
     AND emoji = p_emoji;

  IF FOUND THEN
    delta := -1;
    now_active := FALSE;
  ELSE
    INSERT INTO card_reactions (card_id, viewer_hash, emoji)
    VALUES (p_card_id, p_viewer_hash, p_emoji);
    delta := 1;
    now_active := TRUE;
  END IF;

  SELECT COALESCE((c.reaction_counts ->> p_emoji)::INTEGER, 0)
    INTO current_count
    FROM cards c WHERE c.id = p_card_id;

  UPDATE cards c
     SET reaction_counts = jsonb_set(
           COALESCE(c.reaction_counts, '{}'::jsonb),
           ARRAY[p_emoji],
           -- GREATEST guards against a negative count if the audit row and the
           -- counter ever disagree; the counter is a cache, the rows are truth.
           to_jsonb(GREATEST(0, current_count + delta))
         )
   WHERE c.id = p_card_id
  RETURNING c.reaction_counts INTO counts;

  active := now_active;
  RETURN NEXT;
END;
$$;

REVOKE ALL ON FUNCTION toggle_card_reaction(TEXT, TEXT, TEXT)
  FROM PUBLIC, anon, authenticated;

-- ---------------------------------------------------------------------------
-- 6. Replies
-- ---------------------------------------------------------------------------

-- Linking a reply and bumping the parent's counter, atomically. Returns FALSE
-- if the parent does not exist, so the route can reject a fabricated
-- `replyTo` without a separate existence check.
CREATE OR REPLACE FUNCTION link_card_reply(
  p_card_id   TEXT,
  p_parent_id TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM cards WHERE id = p_parent_id) THEN
    RETURN FALSE;
  END IF;

  UPDATE cards SET reply_to_card_id = p_parent_id WHERE id = p_card_id;
  UPDATE cards SET reply_count = reply_count + 1 WHERE id = p_parent_id;
  RETURN TRUE;
END;
$$;

REVOKE ALL ON FUNCTION link_card_reply(TEXT, TEXT) FROM PUBLIC, anon, authenticated;

COMMIT;
