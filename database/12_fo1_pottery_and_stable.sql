-- DHANSETU v1.2 -- FO1 demo follow-ups: authentic Pottery units, and making
-- the "Stable" half of the book visible.
-- Hand-written. Run AFTER 11_fo1_demo_portfolio.sql. Safe to re-run: every
-- statement targets fixed enterprise_ids with fixed values.
--
-- Two problems left over from 11_fo1_demo_portfolio.sql.
--
-- PROBLEM 1 -- fake pottery.
-- 11 gave FO1 its missing "Pottery / Terracotta Unit" segment by relabelling
-- 3 surplus Dairy Producers. The labels changed but the *books* did not, and
-- handicraft and dairy have very different rhythms (2026 averages):
--
--     segment                    sales/day  txns/day  zero-txn days
--     Pottery / Terracotta Unit        662       3.5           6.9%
--     Dairy Producer                  1352       5.8           0.6%
--
-- The relabelled three carried dairy books -- ENT0243 worst at 2584/day over
-- 12.5 txns with zero idle days, which is not a village pottery. It also left
-- enterprises.sub_type_id at 'ST01' (Dairy Producer) on all four rows 11
-- touched, contradicting the sub_type/sector text columns beside it.
--
-- Fixed by reversing the relabel and moving 3 *genuine* pottery units into
-- Anand instead. Their ledgers, feature snapshots and assessments were all
-- simulated as pottery and stay internally consistent; only identity and
-- geography change, and those have no derived data hanging off them. The
-- reverse trade -- keeping the dairy books and repainting the labels -- is
-- what 11 did, and it corrupts the half that actually matters.
--
-- ENT0186 (Handloom Weaver) is NOT reverted: at 659 sales/day over 3.3 txns
-- it sits inside the handloom range (905 / 4.8), so that one relabel holds.
-- Only its sub_type_id is corrected.
--
-- PROBLEM 2 -- the stable half of the book was unreachable.
-- The dashboard has a "Stable" tier pill (SearchAndFilters.tsx) and a
-- "Bankable Pipeline" KPI card (PortfolioMetrics.tsx, fed by
-- `worklistItems.filter(risk_tier === 'GREEN')` in app/dashboard/page.tsx),
-- but v_officer_worklist ends in `WHERE ra.risk_tier <> 'GREEN'` -- so GREEN
-- never reached the client and both read 0 permanently, with no way to
-- demonstrate stable-vs-at-risk. That filter is dropped in 05_views.sql
-- rather than here (a view definition belongs with the other views); this
-- file only supplies the data half.

SET search_path TO dhansetu, public;
BEGIN;

-- ===========================================================================
-- PART A -- undo 11's three relabelled "pottery" units
-- ===========================================================================
-- Identity and scores both restored to their pre-11 values (captured from
-- risk_assessments before 11 ran). ENT0243 was never promoted by 11, so only
-- its labels need restoring.

UPDATE enterprises SET sub_type = 'Dairy Producer', sector = 'DAIRY', sub_type_id = 'ST01',
       business_name = 'Maa Dairy — Anand North'      WHERE enterprise_id = 'ENT0086';
UPDATE enterprises SET sub_type = 'Dairy Producer', sector = 'DAIRY', sub_type_id = 'ST01',
       business_name = 'Jai Gopal Dairy — Anand East' WHERE enterprise_id = 'ENT0030';
UPDATE enterprises SET sub_type = 'Dairy Producer', sector = 'DAIRY', sub_type_id = 'ST01',
       business_name = 'Sri Dairy — Anand Rural'      WHERE enterprise_id = 'ENT0243';

-- 11 left this at ST01 (Dairy Producer) while the text columns said Handloom.
UPDATE enterprises SET sub_type_id = 'ST03' WHERE enterprise_id = 'ENT0186';

-- Carry the restored identity back out to the tables that denormalise it --
-- 11 pushed HANDICRAFT into all four of these, so reverting `enterprises`
-- alone would leave 1096 ledger rows per enterprise still labelled pottery.
UPDATE daily_ledger dl
   SET sub_type = e.sub_type, sector = e.sector
  FROM enterprises e
 WHERE e.enterprise_id = dl.enterprise_id
   AND dl.enterprise_id IN ('ENT0086','ENT0030','ENT0243')
   AND (dl.sub_type IS DISTINCT FROM e.sub_type OR dl.sector IS DISTINCT FROM e.sector);

UPDATE feature_snapshots fs
   SET sector = e.sector
  FROM enterprises e
 WHERE e.enterprise_id = fs.enterprise_id
   AND fs.enterprise_id IN ('ENT0086','ENT0030','ENT0243')
   AND fs.sector IS DISTINCT FROM e.sector;

UPDATE risk_assessments ra
   SET sector = e.sector
  FROM enterprises e
 WHERE e.enterprise_id = ra.enterprise_id
   AND ra.enterprise_id IN ('ENT0086','ENT0030','ENT0243')
   AND ra.sector IS DISTINCT FROM e.sector;

UPDATE alerts a
   SET sector = e.sector
  FROM enterprises e
 WHERE e.enterprise_id = a.enterprise_id
   AND a.enterprise_id IN ('ENT0086','ENT0030','ENT0243')
   AND a.sector IS DISTINCT FROM e.sector;

WITH restore(enterprise_id, prob_stress, rule_score, fused_score,
             buffer_days, credit_headroom, suggested_max_emi, bridge_headroom) AS (
    VALUES
      ('ENT0086', 0.0020500558181240237, 0.2737, 0.1515, 37.3, 63600.00, 3024.00, 22500.00),
      ('ENT0030', 0.0030045581366920340, 0.2737, 0.1519, 30.1, 55900.00, 2658.00, 22200.00)
)
UPDATE risk_assessments ra
   SET prob_stress = r.prob_stress, rule_score = r.rule_score, fused_score = r.fused_score,
       risk_tier = 'GREEN',
       buffer_days = r.buffer_days, net_buffer_days = r.buffer_days,
       credit_headroom = r.credit_headroom, suggested_max_emi = r.suggested_max_emi,
       bridge_headroom = r.bridge_headroom,
       reason_1 = 'margin_squeeze', reason_2 = NULL, reason_3 = NULL
  FROM restore r
 WHERE ra.enterprise_id = r.enterprise_id
   AND ra.as_of = (SELECT max(r2.as_of) FROM risk_assessments r2
                    WHERE r2.enterprise_id = r.enterprise_id);

-- ===========================================================================
-- PART B -- move 3 genuine Pottery units from Ganjam (FO6) to Anand (FO1)
-- ===========================================================================
-- All three are GREEN in Ganjam, so FO6's action list is unaffected; its book
-- shrinks 42 -> 39 and FO1's grows 42 -> 45 (officers.caseload updated below).
-- ENT0067 (Sunita Devi) is deliberately excluded -- named demo persona.
--
-- lat/lon are small offsets from the district centroid, not absolute
-- coordinates (see v_enterprise_locations), so they stay as-is and the units
-- simply render around Anand once district_id changes.
--
-- Names are redrawn from the same Gujarati first-name/surname pool the
-- generator uses for Anand, gender preserved, and checked for collisions --
-- the convention 10_dedupe_names.sql established. Business names follow the
-- pottery pattern with the block appended for uniqueness.

WITH moved(enterprise_id, proprietor_name, business_name, block) AS (
    VALUES
      ('ENT0072', 'Kokilaben Vaghela',  'Nav Kumhar Kala — Anand Rural',   'Anand Rural'),
      ('ENT0211', 'Jyotiben Chaudhari', 'Maa Pottery Works — Anand North', 'Anand North'),
      ('ENT0247', 'Ashokbhai Patel',    'Sri Terracotta Unit — Anand South','Anand South')
)
UPDATE enterprises e
   SET officer_id      = 'FO1',
       district_id     = 1,
       district        = 'Anand',
       state           = 'Gujarat',
       agro_zone       = 'Middle Gujarat Alluvial Plain',
       block           = m.block,
       preferred_lang  = 'gu',
       proprietor_name = m.proprietor_name,
       business_name   = m.business_name
  FROM moved m
 WHERE e.enterprise_id = m.enterprise_id;

-- district is denormalised onto the fact tables the same way sector is.
UPDATE daily_ledger      SET district_id = 1, district = 'Anand'
 WHERE enterprise_id IN ('ENT0072','ENT0211','ENT0247');
UPDATE alerts            SET district_id = 1
 WHERE enterprise_id IN ('ENT0072','ENT0211','ENT0247');
UPDATE feature_snapshots SET district_id = 1
 WHERE enterprise_id IN ('ENT0072','ENT0211','ENT0247');
UPDATE risk_assessments  SET district_id = 1
 WHERE enterprise_id IN ('ENT0072','ENT0211','ENT0247');

UPDATE officers SET caseload = 45 WHERE officer_id = 'FO1';
UPDATE officers SET caseload = 39 WHERE officer_id = 'FO6';

-- ===========================================================================
-- PART C -- put Pottery back on the action list, on its own (smaller) scale
-- ===========================================================================
-- Same invariants as 11 Part B: fused = 0.45*prob + 0.55*rule, tier from
-- 'AMBER>=0.38;RED>=0.58', suggested_max_emi ~= credit_headroom / 21.
-- Headroom is roughly a fifth of the dairy cases' because these are genuine
-- pottery units (Rs 495-971 baseline turnover, against Rs 1385-3061 for the
-- dairy rows 11 had relabelled) -- the earlier numbers were dairy-sized.
--
-- ENT0072 is left GREEN on purpose: at 0.071 it is the healthiest enterprise
-- in FO1's whole book and makes the clearest "stable" counterpart to the two
-- RED cases.

WITH promo(enterprise_id, prob_stress, rule_score,
           buffer_days, credit_headroom, bridge_headroom,
           reason_1, reason_2, reason_3) AS (
    VALUES
      ('ENT0247', 0.40, 0.78,  -6.0,  9000.00, 6200.00,
       'receivable_stretch', 'demand_trough', 'working_capital_erosion'),
      ('ENT0211', 0.10, 0.70,  14.0,  8500.00, 5100.00,
       'demand_trough', 'receivable_stretch', NULL)
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
       net_buffer_days   = p.buffer_days,
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
-- VERIFY
-- ===========================================================================
\echo '--> FO1 book by segment: full book vs action list (expect 9 rows, 45 total)'
SELECT e.sub_type,
       count(*)                                                AS in_book,
       count(*) FILTER (WHERE ra.risk_tier <> 'GREEN')          AS at_risk,
       count(*) FILTER (WHERE ra.risk_tier =  'GREEN')          AS stable
FROM enterprises e
JOIN v_latest_assessment ra USING (enterprise_id)
WHERE e.officer_id = 'FO1'
GROUP BY e.sub_type
ORDER BY in_book DESC, e.sub_type;

\echo '--> FO1 totals (expect 45 book / 9 segments / 18 at-risk / 27 stable)'
SELECT count(*) AS book,
       count(DISTINCT e.sub_type) AS segments,
       count(*) FILTER (WHERE ra.risk_tier <> 'GREEN') AS at_risk,
       count(*) FILTER (WHERE ra.risk_tier =  'GREEN') AS stable
FROM enterprises e JOIN v_latest_assessment ra USING (enterprise_id)
WHERE e.officer_id = 'FO1';

\echo '--> pottery now behaves like pottery (expect ~660 sales/day, ~3.5 txns, idle days > 0)'
SELECT e.enterprise_id, e.business_name,
       round(avg(dl.sales_accrued), 0) AS avg_sales_day,
       round(avg(dl.txn_count), 1)     AS avg_txns_day,
       round(avg(CASE WHEN dl.txn_count = 0 THEN 1.0 ELSE 0 END) * 100, 1) AS pct_idle_days
FROM enterprises e JOIN daily_ledger dl USING (enterprise_id)
WHERE e.officer_id = 'FO1' AND e.sub_type = 'Pottery / Terracotta Unit'
  AND dl.event_date > '2026-01-01'
GROUP BY e.enterprise_id, e.business_name ORDER BY e.enterprise_id;

\echo '--> consistency: fused/tier, sub_type_id, and denormalised sector+district (expect 0 rows)'
SELECT 'fused_or_tier' AS check, count(*) AS bad FROM v_latest_assessment
 WHERE abs(fused_score - (0.45 * prob_stress + 0.55 * rule_score)) > 0.001
    OR risk_tier <> CASE WHEN fused_score >= 0.58 THEN 'RED'
                         WHEN fused_score >= 0.38 THEN 'AMBER' ELSE 'GREEN' END
HAVING count(*) > 0
UNION ALL
SELECT 'sub_type_id', count(*) FROM enterprises e JOIN sub_types s USING (sub_type_id)
 WHERE e.sub_type IS DISTINCT FROM s.sub_type OR e.sector IS DISTINCT FROM s.sector
HAVING count(*) > 0
UNION ALL
SELECT 'ledger_sector_subtype_district', count(*) FROM daily_ledger dl JOIN enterprises e USING (enterprise_id)
 WHERE dl.sector IS DISTINCT FROM e.sector OR dl.sub_type IS DISTINCT FROM e.sub_type
    OR dl.district_id IS DISTINCT FROM e.district_id
HAVING count(*) > 0
UNION ALL
SELECT 'assessment_district', count(*) FROM risk_assessments ra JOIN enterprises e USING (enterprise_id)
 WHERE ra.district_id IS DISTINCT FROM e.district_id
HAVING count(*) > 0
UNION ALL
SELECT 'snapshot_sector', count(*) FROM feature_snapshots fs JOIN enterprises e USING (enterprise_id)
 WHERE fs.sector IS DISTINCT FROM e.sector
HAVING count(*) > 0
UNION ALL
SELECT 'assessment_sector', count(*) FROM risk_assessments ra JOIN enterprises e USING (enterprise_id)
 WHERE ra.sector IS DISTINCT FROM e.sector
HAVING count(*) > 0
UNION ALL
SELECT 'alert_sector', count(*) FROM alerts a JOIN enterprises e USING (enterprise_id)
 WHERE a.sector IS DISTINCT FROM e.sector
HAVING count(*) > 0
UNION ALL
SELECT 'duplicate_names', count(*) FROM (
   SELECT proprietor_name FROM enterprises GROUP BY proprietor_name HAVING count(*) > 1
   UNION ALL
   SELECT business_name FROM enterprises GROUP BY business_name HAVING count(*) > 1) d
HAVING count(*) > 0;
