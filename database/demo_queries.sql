-- DHANSETU — demo queries. Each block backs one screen or one deck claim.
--   psql -d dhansetu -f demo_queries.sql
SET search_path TO dhansetu, public;
\pset pager off

\echo '=== 1. GET /worklist — Prakash Nair, Anand (42 enterprises) ==='
SELECT enterprise_id, proprietor_name, sub_type, risk_tier, score,
       net_buffer_days, reason_1, rupees_at_risk, shortfall_week_of, km_from_centre
FROM v_officer_worklist
WHERE officer_id = 'FO1'
ORDER BY score DESC;

\echo '=== 1b. how much of his book is he actually reviewing? ==='
SELECT COUNT(*) FILTER (WHERE risk_tier <> 'GREEN') AS flagged,
       COUNT(*)                                     AS caseload,
       ROUND(100.0 * COUNT(*) FILTER (WHERE risk_tier <> 'GREEN') / COUNT(*), 0) AS pct_reviewed
FROM v_latest_assessment ra JOIN enterprises e USING (enterprise_id)
WHERE e.officer_id = 'FO1';

\echo '=== 2. GET /enterprise/ENT0031 — Lakshmiben Patel ==='
SELECT proprietor_name, sub_type, district, state, preferred_lang, shared_device,
       as_of, risk_tier, score, buffer_days, net_buffer_days,
       ROUND(100*margin_gap_90d::numeric,1)   AS margin_gap_pp,
       ROUND(100*cost_index_chg_90d::numeric,1) AS cost_chg_pct,
       ROUND(100*rev_index_chg_90d::numeric,1)  AS revenue_chg_pct,
       reason_1, reason_2, reason_3,
       credit_headroom, bridge_headroom, low_visibility
FROM v_enterprise_card WHERE enterprise_id = 'ENT0031';

\echo '=== 2b. which rules fired for her, and under which mechanism ==='
SELECT rule_key, mechanism, weight
FROM v_fired_rules
WHERE enterprise_id = 'ENT0031'
  AND as_of = (SELECT MAX(as_of) FROM risk_assessments WHERE enterprise_id='ENT0031');

\echo '=== 3. her live forward band (M1..M6, no actuals yet) ==='
SELECT horizon_label, horizon_days, horizon_end_date, p10, p50, p90
FROM v_live_forecast WHERE enterprise_id = 'ENT0031' ORDER BY horizon_days;

\echo '=== 3b. the shortfall: amount and the week it lands ==='
SELECT enterprise_id, origin_date, shortfall_amount, shortfall_week_of
FROM v_projected_shortfall WHERE enterprise_id = 'ENT0031';

\echo '=== 4. her alert with up to three ACTIONS (not restatements of the problem) ==='
SELECT alert_id, raised_at, risk_tier, projected_shortfall, shortfall_week_of,
       deadline_date, exported_to_bureau, jsonb_pretty(actions) AS actions
FROM v_alert_actions
WHERE enterprise_id = 'ENT0031' ORDER BY raised_at DESC LIMIT 1;

\echo '=== 5. "a bureau says rejected; we say here is the money" ==='
SELECT risk_tier, n, headroom_p25, headroom_p50, headroom_p75, bridge_p50, pct_with_headroom
FROM v_headroom_by_tier;

\echo '=== 6. the six named personas ==='
SELECT enterprise_id, proprietor_name, sub_type, district, state, preferred_lang,
       preferred_channel, risk_tier, score, low_visibility, bridge_headroom
FROM v_enterprise_card WHERE is_named_persona ORDER BY enterprise_id;

\echo '=== 7. DISTRICT EVENT WATCH — one shock, not 14 alerts ==='
SELECT as_of, district, sector, mechanism, flagged, total_in_cohort,
       pct_of_cohort, no_buffer, visit_these_three
FROM v_district_event_watch
WHERE is_district_event ORDER BY as_of DESC LIMIT 10;

\echo '=== 8. sector physics: poultry batch gap (should be ~42 days, not 2) ==='
WITH runs AS (
  SELECT enterprise_id, event_date, cash_inflow,
         SUM(CASE WHEN cash_inflow > 0 THEN 1 ELSE 0 END)
           OVER (PARTITION BY enterprise_id ORDER BY event_date) AS grp
  FROM daily_ledger WHERE sector = 'POULTRY'
)
SELECT ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY gap)::numeric,0) AS median_zero_inflow_run_days
FROM (SELECT enterprise_id, grp, COUNT(*) AS gap FROM runs
      WHERE cash_inflow = 0 GROUP BY 1,2) x;

\echo '=== 8b. dairy lean season: Apr-Sep revenue vs cost ==='
SELECT EXTRACT(MONTH FROM event_date)::int AS month,
       ROUND((100*AVG(sales_accrued)/(SELECT AVG(sales_accrued) FROM daily_ledger WHERE sector='DAIRY'))::numeric,0) AS revenue_index,
       ROUND((100*AVG(input_cost)  /(SELECT AVG(input_cost)   FROM daily_ledger WHERE sector='DAIRY'))::numeric,0) AS cost_index
FROM daily_ledger WHERE sector='DAIRY' GROUP BY 1 ORDER BY 1;

\echo '=== 9. loans actually amortise (v1.1 bug) ==='
SELECT COUNT(*) FILTER (WHERE delta < 0) AS balance_decreases,
       COUNT(*) FILTER (WHERE delta > 0) AS disbursements
FROM (SELECT loan_outstanding - LAG(loan_outstanding)
             OVER (PARTITION BY enterprise_id ORDER BY event_date) AS delta
      FROM daily_ledger) d;

\echo '=== 10. receivables: the udhaar book, by counterparty ==='
SELECT counterparty_type, COUNT(*) AS enterprises, SUM(invoices) AS invoices,
       ROUND(AVG(avg_days_to_cash),0) AS avg_days_to_cash,
       SUM(written_off) AS total_written_off
FROM v_receivables_ageing GROUP BY 1 ORDER BY avg_days_to_cash;

\echo '=== 10b. Basanti Pradhan: GREEN while losing lakhs to bad udhaar ==='
SELECT enterprise_id, counterparty_type, invoices, outstanding, written_off,
       write_off_pct, avg_days_to_cash
FROM v_receivables_ageing WHERE enterprise_id = 'ENT0224';

\echo '=== 11. EVIDENCE: forecast accuracy by horizon (out-of-time) ==='
SELECT * FROM v_forecast_accuracy;

\echo '=== 11b. EVIDENCE: reason codes vs the simulator TRUE mechanism ==='
SELECT * FROM v_reason_code_scorecard ORDER BY episodes DESC;

\echo '=== 11c. EVIDENCE: early-warning lead time ==='
SELECT * FROM v_lead_time_summary;

\echo '=== 11d. is AMBER worth the officer petrol? ==='
SELECT * FROM v_alert_precision;

\echo '=== 12. governance: T2 access is granted, time-boxed and audited ==='
SELECT a.actor_id, a.action, a.enterprise_id, a.tier_accessed, a.occurred_at,
       g.valid_from, g.valid_until, (g.valid_until - g.valid_from) AS window_days,
       a.merchant_notified
FROM audit_log a JOIN access_grants g USING (grant_id)
ORDER BY a.occurred_at DESC LIMIT 5;

\echo '=== 13. POST /outcome — closes the loop into a training label ==='
-- SELECT record_outcome('TK00900', 'stress_confirmed', 'bridge_loan_sanctioned');

\echo '=== 14. provenance: real vs simulated, per enterprise ==='
SELECT * FROM v_data_provenance WHERE voice_captures > 0 LIMIT 10;
