-- DHANSETU v1.2 -- cache for LLM-written situation summaries.
-- Run AFTER 01_schema.sql (needs enterprises). Safe to re-run.
--
-- WHY A TABLE AND NOT A VIEW
-- Everything else in this schema is derived, so a view would be the habit.
-- This can't be: the text comes from an external model call that takes ~1.4s
-- and costs tokens, which is far too slow to sit in the path of a card render
-- and too wasteful to repeat per page view.
--
-- The cache key is (enterprise_id, as_of, lang), not a TTL:
--
--   * as_of is the assessment vintage the summary describes. When a new
--     assessment lands the key changes and the summary regenerates on next
--     request, so it can never quietly describe stale numbers -- which a
--     time-based expiry would allow.
--   * lang is part of the key rather than translated after the fact. These
--     sentences are written for a field officer to read aloud, and running an
--     English summary through a translator produces something that reads like
--     a translation. The model writes each language directly.
--
-- summary is the officer-facing text; model records which model produced it,
-- so a prompt or model change is traceable rather than silently mixed in with
-- older rows.

SET search_path TO dhansetu, public;

CREATE TABLE IF NOT EXISTS enterprise_summaries (
    enterprise_id TEXT        NOT NULL REFERENCES enterprises(enterprise_id),
    as_of         DATE        NOT NULL,
    lang          TEXT        NOT NULL,
    summary       TEXT        NOT NULL,
    model         TEXT        NOT NULL,
    generated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (enterprise_id, as_of, lang)
);

COMMENT ON TABLE enterprise_summaries IS
  'LLM-written plain-language situation summaries, cached per assessment vintage and language. Descriptive only -- the recommended actions beside it stay deterministic.';

-- The app writes these on a cache miss, so it needs INSERT as well as SELECT --
-- and UPDATE, because the write is an upsert: two requests for the same
-- enterprise can race, and ON CONFLICT DO UPDATE needs UPDATE rights even
-- though the row is almost always new. Granting only SELECT+INSERT fails at
-- runtime with "permission denied", not at deploy time.
GRANT SELECT, INSERT, UPDATE ON dhansetu.enterprise_summaries TO dhansetu_user;
