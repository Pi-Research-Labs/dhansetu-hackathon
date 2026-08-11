-- DHANSETU v1.2 -- demo transactions for the live ledger.
-- Run AFTER 12_fo1_pottery_and_stable.sql (needs the re-segmented book) and
-- 04_live_data.sql (needs ledger_entries_live). Safe to re-run.
--
-- WHY
-- The synthetic panel stops at 2026-07-31 and holds daily totals with no
-- itemised rows behind them, so GET /enterprise/{id}/transactions -- which
-- reads only the real ledger -- was empty for every enterprise in the book.
-- A walkthrough that opens the Transactions tab sees nothing, and the
-- merchant home screen's "today" figures are all zero.
--
-- DATES ARE RELATIVE TO CURRENT_DATE, NOT HARD-CODED
-- The window is the trailing 10 days ending today, so this still produces
-- "today" whenever it is run rather than aging into a fixed past the way
-- literal dates would. It deliberately overlaps the panel's final days: those
-- are additive (see v_ledger_daily_effective), so the overlap is what
-- demonstrates live entries topping up a simulated day.
--
-- IDEMPOTENT VIA DETERMINISTIC IDS
-- entry_id is derived from (enterprise, day offset, slot) instead of
-- gen_random_uuid(), so re-running upserts the same rows rather than
-- duplicating them -- and, critically, never deletes anything. A blanket
-- "DELETE then INSERT over the window" would wipe transactions actually
-- recorded during a demo, which is exactly the data most worth keeping.
-- The 'de11'/'de12' prefix marks a row as demo-seeded, so these are
-- distinguishable from genuine captures in SQL.
--
-- Amounts are scaled from each enterprise's own baseline_turnover, and the
-- per-day variation is hashed from (enterprise_id, day) so it is stable
-- across runs while still looking irregular. Pottery gets idle days; dairy
-- does not -- the same rhythm difference 12_fo1_pottery_and_stable.sql was
-- written to preserve.

SET search_path TO dhansetu, public;

-- Remove the ad-hoc rows seeded by hand during development so this file is
-- the single source of demo ledger data. Scoped to the exact enterprise and
-- the confidence values those rows used, so genuine captures are untouched.
DELETE FROM ledger_entries_live
WHERE enterprise_id = 'ENT0031'
  AND voice_id IS NULL
  AND confidence IN (0.5, 0.9)
  AND entry_id::text NOT LIKE 'de1%';

WITH demo_enterprises(enterprise_id, seq, inflow_category, outflow_category, idle_every) AS (
    VALUES
      -- idle_every gives the handicraft units days with no sale at all;
      -- dairy and retail trade daily.
      --
      -- Two traps in the idle test, both hit while writing this. A plain
      -- (ago % idle_every) makes ago=0 idle for EVERY enterprise, so today
      -- would be silent on every run -- structurally, not by chance. Adding
      -- seq to stagger it fixed nothing either, because seq happened to be a
      -- multiple of idle_every for all three handicraft rows (3%3, 4%4, 8%2).
      -- So today (ago = 0) is now unconditionally a trading day, and the
      -- staggering only varies the quiet days behind it.
      ('ENT0031', 1, 'milk_sale',   'feed',        0),   -- Dairy, AMBER, named persona
      ('ENT0198', 2, 'milk_sale',   'feed',        0),   -- Dairy, RED
      ('ENT0247', 3, 'pottery_sale','clay_glaze',  3),   -- Pottery, RED
      ('ENT0072', 4, 'pottery_sale','clay_glaze',  4),   -- Pottery, GREEN
      ('ENT0128', 5, 'shop_sale',   'stock_purchase', 0),-- Kirana, AMBER
      ('ENT0113', 6, 'bird_sale',   'feed',        0),   -- Poultry, AMBER
      ('ENT0187', 7, 'vegetable_sale','stock_purchase', 0), -- Vegetable, AMBER
      ('ENT0147', 8, 'cloth_sale',  'yarn',        2)    -- Handloom, AMBER
),
days AS (SELECT generate_series(0, 9) AS ago),
base AS (
    SELECT d.enterprise_id, d.seq, d.inflow_category, d.outflow_category, d.idle_every,
           dy.ago,
           (CURRENT_DATE - dy.ago) AS event_date,
           e.baseline_turnover::numeric AS turnover,
           -- stable pseudo-random in [0,1) from the pair, so re-runs produce
           -- identical amounts
           (abs(hashtext(d.enterprise_id || dy.ago::text)) % 1000)::numeric / 1000 AS r1,
           (abs(hashtext(dy.ago::text || d.enterprise_id)) % 1000)::numeric / 1000 AS r2
    FROM demo_enterprises d
    CROSS JOIN days dy
    JOIN enterprises e USING (enterprise_id)
),
rows_to_write AS (
    -- one sale and one cost per active day
    SELECT enterprise_id, event_date, 'inflow' AS direction,
           ROUND(turnover * (0.55 + r1 * 0.9), 0) AS amount,
           inflow_category AS category,
           CASE WHEN r1 < 0.45 THEN 'upi' WHEN r1 < 0.60 THEN 'wallet' ELSE 'cash' END AS tender,
           FALSE AS is_household,
           CASE WHEN r2 < 0.5 THEN 'voice' ELSE 'manual' END AS source,
           ('de11' || lpad(seq::text, 4, '0') || '-0000-4000-8000-' || lpad(ago::text, 12, '0'))::uuid AS entry_id
    FROM base
    WHERE ago = 0 OR idle_every = 0 OR ((ago + seq) % idle_every) <> 0
    UNION ALL
    SELECT enterprise_id, event_date, 'outflow',
           ROUND(turnover * (0.18 + r2 * 0.35), 0),
           outflow_category,
           CASE WHEN r2 < 0.35 THEN 'upi' ELSE 'cash' END,
           -- roughly one cost in six is household drawings, not a business cost
           (r1 > 0.83),
           CASE WHEN r1 < 0.4 THEN 'voice' ELSE 'manual' END,
           ('de12' || lpad(seq::text, 4, '0') || '-0000-4000-8000-' || lpad(ago::text, 12, '0'))::uuid
    FROM base
    WHERE ago = 0 OR idle_every = 0 OR ((ago + seq) % idle_every) <> 0
)
INSERT INTO ledger_entries_live
    (entry_id, enterprise_id, event_date, recorded_at, direction, amount,
     category, tender, is_household, source, voice_id, confidence)
SELECT entry_id, enterprise_id, event_date,
       -- recorded during the working day, not all at midnight
       event_date + TIME '09:30' + (random() * INTERVAL '8 hours'),
       direction, amount, category, tender, is_household, source, NULL,
       -- typed and confirmed entries are certain; nothing here was guessed
       1.0
FROM rows_to_write
ON CONFLICT (entry_id) DO UPDATE
    SET event_date = EXCLUDED.event_date,
        amount     = EXCLUDED.amount,
        category   = EXCLUDED.category,
        tender     = EXCLUDED.tender,
        is_household = EXCLUDED.is_household,
        source     = EXCLUDED.source;

-- ===========================================================================
-- VERIFY
-- ===========================================================================
\echo '--> demo ledger coverage (expect 8 enterprises, ending today)'
SELECT enterprise_id,
       COUNT(*)                              AS entries,
       MIN(event_date)                       AS from_,
       MAX(event_date)                       AS to_,
       COUNT(*) FILTER (WHERE direction = 'inflow')  AS sales,
       COUNT(*) FILTER (WHERE direction = 'outflow') AS costs
FROM ledger_entries_live
WHERE entry_id::text LIKE 'de1%'
GROUP BY enterprise_id ORDER BY enterprise_id;

\echo '--> today has activity (expect one row per enterprise trading today)'
SELECT event_date, COUNT(*) AS entries, COUNT(DISTINCT enterprise_id) AS enterprises,
       SUM(amount) FILTER (WHERE direction = 'inflow')  AS money_in,
       SUM(amount) FILTER (WHERE direction = 'outflow') AS money_out
FROM ledger_entries_live
WHERE event_date = CURRENT_DATE
GROUP BY event_date;

\echo '--> amounts stayed plausible against each book (ratio should sit near 1)'
SELECT l.enterprise_id, e.sub_type,
       ROUND(AVG(l.amount) FILTER (WHERE l.direction = 'inflow'), 0) AS avg_sale,
       ROUND(e.baseline_turnover, 0)                                 AS daily_turnover
FROM ledger_entries_live l
JOIN enterprises e USING (enterprise_id)
WHERE l.entry_id::text LIKE 'de1%'
GROUP BY l.enterprise_id, e.sub_type, e.baseline_turnover
ORDER BY l.enterprise_id;
