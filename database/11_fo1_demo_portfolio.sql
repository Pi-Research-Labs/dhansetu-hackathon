-- DHANSETU v1.2 -- demo portfolio shaping for FO1 (Prakash Nair).
-- Hand-written. Run AFTER 02_load.sql / 05_views.sql (needs enterprises,
-- daily_ledger and risk_assessments populated). Safe to re-run: every
-- statement targets fixed enterprise_ids with fixed values.
--
-- WHY
-- Prakash Nair (FO1) is the field officer used for live walkthroughs. The
-- officer worklist (v_officer_worklist) deliberately shows only enterprises
-- that need action -- `WHERE risk_tier <> 'GREEN'` -- so the dashboard's
-- segment dropdown is built from the *non-GREEN* slice of the book, not the
-- whole book. Before this file FO1's book was 42 enterprises across 8 of the
-- 9 sub_types, but only 7 of them were non-GREEN and those 7 spanned just
-- 2 sub_types (Dairy Producer x6, Poultry Unit x1). Result: the demo's
-- segment filter offered 2 options out of 9.
--
-- Two separate causes, fixed in two parts below.
--
--   Part A -- FO1 had zero "Pottery / Terracotta Unit" enterprises at all
--   (that sub_type only ever generated in Bhilwara and Ganjam), so no amount
--   of risk-tier tuning could surface it. Also 18 of his 42 (43%) were Dairy
--   Producer, an unrealistic concentration for one officer's caseload.
--
--   Part B -- everything outside Dairy/Poultry scored GREEN, so it never
--   reached the worklist regardless of sub_type coverage.
--
-- WHAT THIS IS NOT
-- This does not retrain the model or re-run the rule engine; it rewrites
-- scored outputs directly for one officer's book so the demo exercises the
-- full segment filter. Values are chosen to stay internally consistent with
-- the pipeline's own conventions (see Part B header). Other officers'
-- portfolios are untouched.

SET search_path TO dhansetu, public;
BEGIN;

-- ===========================================================================
-- PART A -- re-segmentation: 4 surplus Dairy Producers -> HANDICRAFT
-- ===========================================================================
-- The 4 picked are the *lowest-scoring GREEN* dairy enterprises in FO1's
-- book, so nothing interesting is lost: all 6 AMBER dairy cases and the
-- named demo persona (ENT0031, Lakshmiben Patel) keep their sub_type.
--
-- sub_type and sector are denormalised onto daily_ledger, feature_snapshots,
-- risk_assessments and alerts, so all five tables move together or the
-- enterprise ends up with a split identity.
--
-- Business names follow the generator's own convention for this sub_type
-- ("<Prefix> Pottery Works" / "Terracotta Unit" / "Kumhar Kala", block
-- appended for uniqueness) so they read as generated data, not a patch --
-- same rule 10_dedupe_names.sql applies.
--
-- Net effect on FO1's book: Dairy 18 -> 14, Pottery 0 -> 3, Handloom 2 -> 3.

UPDATE enterprises SET sub_type = 'Pottery / Terracotta Unit', sector = 'HANDICRAFT',
       business_name = 'Maa Kumhar Kala — Anand North'      WHERE enterprise_id = 'ENT0086';
UPDATE enterprises SET sub_type = 'Pottery / Terracotta Unit', sector = 'HANDICRAFT',
       business_name = 'Jai Terracotta Unit — Anand East'   WHERE enterprise_id = 'ENT0030';
UPDATE enterprises SET sub_type = 'Pottery / Terracotta Unit', sector = 'HANDICRAFT',
       business_name = 'Shree Pottery Works — Anand Rural'  WHERE enterprise_id = 'ENT0243';
UPDATE enterprises SET sub_type = 'Handloom Weaver',           sector = 'HANDICRAFT',
       business_name = 'Nav Taant Ghar — Anand East'        WHERE enterprise_id = 'ENT0186';

-- Carry the new identity into every table that denormalises it.
UPDATE daily_ledger dl
   SET sub_type = e.sub_type, sector = e.sector
  FROM enterprises e
 WHERE e.enterprise_id = dl.enterprise_id
   AND dl.enterprise_id IN ('ENT0086','ENT0030','ENT0243','ENT0186')
   AND (dl.sub_type IS DISTINCT FROM e.sub_type OR dl.sector IS DISTINCT FROM e.sector);

UPDATE feature_snapshots fs
   SET sector = e.sector
  FROM enterprises e
 WHERE e.enterprise_id = fs.enterprise_id
   AND fs.enterprise_id IN ('ENT0086','ENT0030','ENT0243','ENT0186')
   AND fs.sector IS DISTINCT FROM e.sector;

UPDATE risk_assessments ra
   SET sector = e.sector
  FROM enterprises e
 WHERE e.enterprise_id = ra.enterprise_id
   AND ra.enterprise_id IN ('ENT0086','ENT0030','ENT0243','ENT0186')
   AND ra.sector IS DISTINCT FROM e.sector;

UPDATE alerts a
   SET sector = e.sector
  FROM enterprises e
 WHERE e.enterprise_id = a.enterprise_id
   AND a.enterprise_id IN ('ENT0086','ENT0030','ENT0243','ENT0186')
   AND a.sector IS DISTINCT FROM e.sector;

-- ===========================================================================
-- PART B -- risk variability: promote 12 latest assessments
-- ===========================================================================
-- Only the LATEST assessment row per enterprise is rewritten -- that is the
-- only one the app reads (v_latest_assessment; there is no score-history
-- endpoint). The 32 older vintages are left alone, so each promoted case
-- reads as a business that deteriorated recently, which is what a field
-- officer's action list should be full of.
--
-- Consistency rules preserved from the pipeline (verified against the
-- untouched rows):
--   * fused_score  = 0.45 * prob_stress + 0.55 * rule_score  (fusion_weights)
--   * risk_tier    from tier_cutoffs 'AMBER>=0.38;RED>=0.58'
--   * suggested_max_emi ~= credit_headroom / 21
--   * reason codes drawn only from the 5 the rule engine emits, all of which
--     have en/hi/te/mr translations in web/utils/translations/dictionary.ts
--
-- buffer_days / credit_headroom / bridge_headroom are pulled down alongside
-- the score: an AMBER case still showing 142 days of runway and Rs 5.1L of
-- headroom on the card is the kind of internal contradiction that gets
-- noticed in a walkthrough. Reasons are matched to each enterprise's real
-- feature_snapshot (high overdue_share/dso -> receivable_stretch, non-zero
-- margin_gap_90d -> margin_squeeze, EMI burden -> debt_overhang).
--
-- Resulting FO1 worklist: 18 items, all 9 segments, 2 RED + 16 AMBER,
-- scores 0.381 -> 0.618.

WITH promo(enterprise_id, prob_stress, rule_score,
           buffer_days, net_buffer_days, credit_headroom, bridge_headroom,
           reason_1, reason_2, reason_3) AS (
    VALUES
    -- Dairy Producer -- deepest negative runway in the book; already carries
    -- an EMI, so debt_overhang is the honest third reason. Only RED dairy.
      ('ENT0198', 0.42, 0.78,  13.0, -63.0,   8000.00,  35300.00,
       'margin_squeeze', 'working_capital_erosion', 'debt_overhang'),
      ('ENT0199', 0.10, 0.66,  16.0, -13.0,   8400.00,  18800.00,
       'margin_squeeze', 'working_capital_erosion', NULL),
    -- Pottery / Terracotta (re-segmented in Part A) -- handicraft sells into
    -- long-dated buyer credit, so receivable_stretch + demand_trough.
      ('ENT0086', 0.40, 0.76,  -8.0,  -8.0,  12000.00,   9500.00,
       'receivable_stretch', 'demand_trough', 'working_capital_erosion'),
      ('ENT0030', 0.12, 0.70,   9.0,   9.0,  21000.00,  12400.00,
       'demand_trough', 'receivable_stretch', NULL),
    -- Handloom Weaver -- 79-day DSO and 82% overdue receivables already.
      ('ENT0147', 0.06, 0.72,  16.0,  16.0,  28000.00,  15600.00,
       'receivable_stretch', 'demand_trough', NULL),
    -- Kirana Store -- margin_gap_90d 0.22 with fully overdue book.
      ('ENT0128', 0.05, 0.74,  18.0,  18.0,  46000.00,  21800.00,
       'margin_squeeze', 'receivable_stretch', NULL),
      ('ENT0056', 0.02, 0.70,  24.0,  24.0,  71000.00,  30500.00,
       'margin_squeeze', 'receivable_stretch', NULL),
    -- FPO / Agri Aggregator -- 51-day DSO, buyer credit concentrated.
      ('ENT0251', 0.03, 0.71,  21.0,  21.0,  96000.00,  68000.00,
       'receivable_stretch', 'working_capital_erosion', NULL),
    -- SHG Food Processing Unit -- 50-day DSO, fully overdue.
      ('ENT0179', 0.04, 0.69,  26.0,  26.0,  17500.00,  11200.00,
       'receivable_stretch', 'working_capital_erosion', NULL),
    -- Tailoring Unit -- 74-day DSO; sits just over the AMBER line (0.383).
      ('ENT0014', 0.02, 0.68,  29.0,  29.0,  10800.00,   5400.00,
       'receivable_stretch', 'demand_trough', NULL),
    -- Vegetable Vendor -- thin margins, fast-spoiling stock.
      ('ENT0187', 0.06, 0.73,  12.0,  12.0,  31000.00,   9800.00,
       'margin_squeeze', 'receivable_stretch', NULL),
      ('ENT0215', 0.01, 0.69,  27.0,  27.0,  38000.00,  13500.00,
       'margin_squeeze', NULL, NULL)
)
UPDATE risk_assessments ra
   SET prob_stress       = p.prob_stress,
       rule_score        = p.rule_score,
       fused_score       = round((0.45 * p.prob_stress + 0.55 * p.rule_score)::numeric, 3)::double precision,
       risk_tier         = CASE
                             WHEN 0.45 * p.prob_stress + 0.55 * p.rule_score >= 0.58 THEN 'RED'
                             WHEN 0.45 * p.prob_stress + 0.55 * p.rule_score >= 0.38 THEN 'AMBER'
                             ELSE 'GREEN'
                           END,
       buffer_days       = p.buffer_days,
       net_buffer_days   = p.net_buffer_days,
       credit_headroom   = p.credit_headroom,
       bridge_headroom   = p.bridge_headroom,
       suggested_max_emi = round(p.credit_headroom / 21.0, 0),
       reason_1          = p.reason_1,
       reason_2          = p.reason_2,
       reason_3          = p.reason_3
  FROM promo p
 WHERE ra.enterprise_id = p.enterprise_id
   AND ra.as_of = (SELECT max(r2.as_of) FROM risk_assessments r2
                    WHERE r2.enterprise_id = p.enterprise_id);

COMMIT;

-- ===========================================================================
-- VERIFY -- FO1 must end up with 9 selectable segments
-- ===========================================================================
\echo '--> FO1 worklist by segment (expect 9 rows)'
SELECT sub_type,
       count(*)                                    AS items,
       count(*) FILTER (WHERE risk_tier = 'RED')   AS red,
       count(*) FILTER (WHERE risk_tier = 'AMBER') AS amber,
       round(min(score), 3)                        AS min_score,
       round(max(score), 3)                        AS max_score
FROM v_officer_worklist
WHERE officer_id = 'FO1'
GROUP BY sub_type
ORDER BY items DESC, sub_type;

\echo '--> FO1 totals (expect 9 segments / 18 items, and 9 sub_types in the full book)'
SELECT count(*)                  AS worklist_items,
       count(DISTINCT sub_type)  AS selectable_segments,
       (SELECT count(DISTINCT sub_type) FROM enterprises WHERE officer_id = 'FO1') AS segments_in_book
FROM v_officer_worklist
WHERE officer_id = 'FO1';

\echo '--> internal consistency (expect 0 rows: fused = 0.45p + 0.55r, tier matches cutoffs)'
SELECT enterprise_id, prob_stress, rule_score, fused_score, risk_tier
FROM v_latest_assessment
WHERE abs(fused_score - (0.45 * prob_stress + 0.55 * rule_score)) > 0.001
   OR risk_tier <> CASE WHEN fused_score >= 0.58 THEN 'RED'
                        WHEN fused_score >= 0.38 THEN 'AMBER'
                        ELSE 'GREEN' END;

\echo '--> sub_type/sector agreement across denormalised tables (expect 0 rows)'
SELECT 'daily_ledger' AS tbl, count(*) AS mismatched FROM daily_ledger dl
  JOIN enterprises e USING (enterprise_id)
 WHERE dl.sub_type IS DISTINCT FROM e.sub_type OR dl.sector IS DISTINCT FROM e.sector
HAVING count(*) > 0
UNION ALL
SELECT 'feature_snapshots', count(*) FROM feature_snapshots fs
  JOIN enterprises e USING (enterprise_id)
 WHERE fs.sector IS DISTINCT FROM e.sector
HAVING count(*) > 0
UNION ALL
SELECT 'risk_assessments', count(*) FROM risk_assessments ra
  JOIN enterprises e USING (enterprise_id)
 WHERE ra.sector IS DISTINCT FROM e.sector
HAVING count(*) > 0;
