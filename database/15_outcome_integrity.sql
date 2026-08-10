-- DHANSETU v1.2 -- one visit, one outcome.
-- Run AFTER 02_load.sql (needs visit_outcomes populated) and 05_views.sql
-- (which defines record_outcome). Safe to re-run.
--
-- WHY
-- An officer could submit the same field-visit outcome repeatedly. Two things
-- allowed it: record_outcome never checked officer_tasks.status before
-- inserting (fixed in 05_views.sql), and visit_outcomes' only key is
-- outcome_id, so the table itself had no opinion on a task appearing twice.
--
-- This is not a cosmetic duplicate. v_alert_precision counts visit_outcomes
-- rows as "visits" and derives confirm_pct from them -- the number that answers
-- "is AMBER worth the officer's petrol?" -- so every double submission quietly
-- moved a headline evidence metric.
--
-- The function guard is the usable error message; this index is the guarantee.
-- Application-layer checks are racy (two submits in flight both read 'open'
-- before either writes), and there will be other writers eventually. Belt and
-- braces on purpose.

SET search_path TO dhansetu, public;

-- The seeded panel already contains a duplicate (TK00758 has two outcomes), so
-- the index cannot be created until it is resolved. Keep the FIRST outcome per
-- task -- it is the visit that actually closed the task; anything after it is
-- the double submission this file exists to prevent.
DELETE FROM visit_outcomes vo
USING (
    SELECT task_id, MIN(outcome_id) AS keep_id
    FROM visit_outcomes
    GROUP BY task_id
    HAVING COUNT(*) > 1
) dup
WHERE vo.task_id = dup.task_id
  AND vo.outcome_id <> dup.keep_id;

CREATE UNIQUE INDEX IF NOT EXISTS ux_visit_outcomes_task
    ON visit_outcomes (task_id);

COMMENT ON INDEX ux_visit_outcomes_task IS
  'One outcome per visit task. record_outcome also rejects a closed task, but that check is racy on concurrent submits -- this is the guarantee.';

-- ===========================================================================
-- VERIFY
-- ===========================================================================
\echo '--> duplicates remaining (expect 0 rows)'
SELECT task_id, COUNT(*) AS outcomes
FROM visit_outcomes GROUP BY task_id HAVING COUNT(*) > 1;

\echo '--> the unique index is in place'
SELECT indexname FROM pg_indexes
WHERE schemaname = 'dhansetu' AND indexname = 'ux_visit_outcomes_task';
