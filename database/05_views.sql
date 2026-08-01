-- DHANSETU v1.2 — views for the demo API.
-- Run AFTER 03_constraints_indexes.sql.
SET search_path TO dhansetu, public;

-- ===========================================================================
-- 1. LEAKAGE GUARDS
-- The sim_* and drv_* columns are simulator ground truth. Point the
-- application at these views and leakage becomes structurally hard rather
-- than a matter of remembering.
-- ===========================================================================

CREATE OR REPLACE VIEW v_enterprises_safe AS
SELECT enterprise_id, proprietor_name, business_name, age, sub_type_id, sub_type,
       sector, district_id, district, state, agro_zone, block, lat, lon,
       preferred_lang, preferred_channel, literacy, shared_device, officer_id,
       shg_id, onboarded_on, baseline_turnover, digital_share_start,
       digital_share_slope, is_named_persona
FROM enterprises;

CREATE OR REPLACE VIEW v_ledger_safe AS
SELECT ledger_date_id, event_date, enterprise_id, sector, sub_type, district_id,
       district, sales_accrued, cash_inflow, outflow, input_cost,
       household_drawings, net, balance, informal_debt, surplus_deployed,
       txn_count, emi_due, emi_amount, emi_paid, loan_outstanding,
       dealer_credit_outstanding, batch_id, batch_day, upi_share, wallet_share,
       digital_share, rev_price_index, cost_price_index, thi, rain_anomaly_pct,
       festival_index, event_code
FROM daily_ledger;

-- ===========================================================================
-- 2. GET /worklist  — the officer's ranked shortlist
-- ===========================================================================

CREATE OR REPLACE VIEW v_latest_assessment AS
SELECT ra.*
FROM risk_assessments ra
JOIN (SELECT enterprise_id, MAX(as_of) AS as_of
      FROM risk_assessments GROUP BY enterprise_id) m
  USING (enterprise_id, as_of);

CREATE OR REPLACE VIEW v_officer_worklist AS
SELECT
    e.officer_id,
    o.officer_name,
    o.language              AS officer_lang,
    ra.enterprise_id,
    e.proprietor_name,
    e.sub_type,
    e.block,
    e.preferred_lang,
    e.preferred_channel,
    ra.as_of,
    ra.risk_tier,
    ROUND(ra.fused_score::numeric, 3)      AS score,
    ROUND(ra.net_buffer_days::numeric, 0)  AS net_buffer_days,
    ra.reason_1, ra.reason_2, ra.reason_3,
    ra.low_visibility,
    ra.credit_headroom,
    ra.bridge_headroom,
    al.alert_id,
    al.projected_shortfall,
    al.shortfall_week_of,
    al.deadline_date,
    -- rupees at risk: the right sort key when every name shares one cause
    ROUND(COALESCE(al.projected_shortfall, 0)::numeric, 0) AS rupees_at_risk,
    -- straight-line km from the district centroid, for route ordering
    ROUND((111.32 * sqrt(power(e.lat, 2) + power(e.lon * cos(radians(g.lat)), 2)))::numeric, 1)
                                           AS km_from_centre
FROM v_latest_assessment ra
JOIN enterprises e USING (enterprise_id)
JOIN officers o  ON o.officer_id = e.officer_id
LEFT JOIN district_geo g ON g.district_id = e.district_id
LEFT JOIN LATERAL (
    SELECT a.alert_id, a.projected_shortfall, a.shortfall_week_of, a.deadline_date
    FROM alerts a
    WHERE a.enterprise_id = ra.enterprise_id
    ORDER BY a.raised_at DESC LIMIT 1
) al ON TRUE
WHERE ra.risk_tier <> 'GREEN'
ORDER BY ra.fused_score DESC;

-- ===========================================================================
-- 3. GET /enterprise/{id}  — the detail card
-- ===========================================================================

CREATE OR REPLACE VIEW v_enterprise_card AS
SELECT
    e.enterprise_id, e.proprietor_name, e.business_name, e.age, e.sub_type,
    e.sector, e.district, e.state, e.block, e.preferred_lang,
    e.preferred_channel, e.shared_device, e.literacy, e.officer_id,
    e.baseline_turnover, e.is_named_persona,
    ra.as_of, ra.risk_tier, ROUND(ra.fused_score::numeric, 3) AS score,
    ROUND(ra.prob_stress::numeric, 3)  AS model_prob_stress,
    ROUND(ra.rule_score::numeric, 3)   AS rule_score,
    ra.buffer_days, ra.net_buffer_days, ra.dscr_annual,
    ra.credit_headroom, ra.suggested_max_emi, ra.bridge_headroom,
    ra.band_width, ra.low_visibility, ra.data_completeness,
    ra.forecast_net_90d_p10, ra.forecast_net_90d_p50, ra.forecast_net_90d_p90,
    ra.reason_1, ra.reason_2, ra.reason_3,
    ra.tier_cutoffs, ra.fusion_weights, ra.model_id, ra.rule_version,
    f.margin_gap_90d, f.cost_index_chg_90d, f.rev_index_chg_90d,
    f.dso_days, f.overdue_share, f.buyer_concentration,
    f.zero_inflow_days_30d, f.digital_share, f.informal_debt,
    f.missed_emis_90d, f.thi_anomaly_90d, f.season_drop_3m
FROM v_latest_assessment ra
JOIN enterprises e USING (enterprise_id)
LEFT JOIN feature_snapshots f
       ON f.enterprise_id = ra.enterprise_id AND f.as_of = ra.as_of;

-- which rules actually fired, in plain language
CREATE OR REPLACE VIEW v_fired_rules AS
SELECT re.enterprise_id, re.as_of, re.rule_key, re.mechanism, re.weight
FROM rule_evaluations re
WHERE re.fired
ORDER BY re.enterprise_id, re.as_of, re.weight DESC;

-- ===========================================================================
-- 4. Forecast band, pivoted for charting
-- ===========================================================================

CREATE OR REPLACE VIEW v_forecast_band AS
SELECT
    enterprise_id, origin_date, horizon_days, horizon_label,
    MAX(value) FILTER (WHERE quantile = 0.1) AS p10,
    MAX(value) FILTER (WHERE quantile = 0.5) AS p50,
    MAX(value) FILTER (WHERE quantile = 0.9) AS p90,
    MAX(actual_net)                          AS actual_net,
    BOOL_OR(is_out_of_time)                  AS is_out_of_time,
    BOOL_OR(is_live_forecast)                AS is_live_forecast
FROM forecasts
GROUP BY enterprise_id, origin_date, horizon_days, horizon_label;

-- The forward call the officer acts on: latest origin, no actual yet.
CREATE OR REPLACE VIEW v_live_forecast AS
SELECT b.*,
       (origin_date + horizon_days) AS horizon_end_date
FROM v_forecast_band b
JOIN (SELECT enterprise_id, MAX(origin_date) AS origin_date
      FROM forecasts WHERE is_live_forecast GROUP BY enterprise_id) m
  USING (enterprise_id, origin_date)
ORDER BY enterprise_id, horizon_days;

-- Deepest point of the downside path = the shortfall, and the week it lands.
CREATE OR REPLACE VIEW v_projected_shortfall AS
SELECT enterprise_id, origin_date,
       -MIN(p10)                                   AS shortfall_amount,
       (origin_date + (ARRAY_AGG(horizon_days ORDER BY p10))[1]) AS shortfall_week_of
FROM v_live_forecast
GROUP BY enterprise_id, origin_date
HAVING MIN(p10) < 0;

-- ===========================================================================
-- 5. Alert + its up-to-three actions, as one row
-- ===========================================================================

CREATE OR REPLACE VIEW v_alert_actions AS
SELECT
    a.alert_id, a.enterprise_id, e.proprietor_name, e.preferred_lang,
    a.raised_at, a.risk_tier, a.projected_shortfall, a.shortfall_week_of,
    a.deadline_date, a.expires_at, a.merchant_visible, a.exported_to_bureau,
    a.disputed_at, a.reason_1, a.reason_2, a.reason_3,
    a.credit_headroom, a.bridge_headroom,
    JSONB_AGG(JSONB_BUILD_OBJECT(
        'rank', r.rank, 'mechanism', r.mechanism,
        'action_key', r.action_key, 'params', r.params::jsonb,
        'audience', r.audience, 'lang', r.rendered_lang
    ) ORDER BY r.rank) AS actions
FROM alerts a
JOIN enterprises e USING (enterprise_id)
LEFT JOIN recommendations r ON r.alert_id = a.alert_id
GROUP BY a.alert_id, a.enterprise_id, e.proprietor_name, e.preferred_lang,
         a.raised_at, a.risk_tier, a.projected_shortfall, a.shortfall_week_of,
         a.deadline_date, a.expires_at, a.merchant_visible, a.exported_to_bureau,
         a.disputed_at, a.reason_1, a.reason_2, a.reason_3,
         a.credit_headroom, a.bridge_headroom;

-- ===========================================================================
-- 6. DISTRICT EVENT WATCH
-- When one shock hits a whole district, ranking 14 identical alerts by score
-- is noise. This collapses them into one district-level finding and surfaces
-- only the units with no buffer left.
-- ===========================================================================

CREATE OR REPLACE VIEW v_district_event_watch AS
WITH base AS (
    SELECT ra.as_of, e.district_id, e.district, e.sector, ra.reason_1 AS mechanism,
           COUNT(*)                                              AS flagged,
           COUNT(*) FILTER (WHERE ra.net_buffer_days < 0)         AS no_buffer,
           SUM(COALESCE(ra.credit_headroom, 0))                   AS headroom_total,
           ARRAY_AGG(ra.enterprise_id ORDER BY ra.net_buffer_days) AS worst_first
    FROM risk_assessments ra
    JOIN enterprises e USING (enterprise_id)
    WHERE ra.risk_tier <> 'GREEN' AND ra.reason_1 IS NOT NULL
    GROUP BY 1,2,3,4,5
), universe AS (
    SELECT district_id, sector, COUNT(*) AS total_in_cohort
    FROM enterprises GROUP BY 1,2
)
SELECT b.as_of, b.district, b.sector, b.mechanism, b.flagged, u.total_in_cohort,
       ROUND(100.0 * b.flagged / u.total_in_cohort, 0) AS pct_of_cohort,
       b.no_buffer,
       b.worst_first[1:3] AS visit_these_three,
       (b.flagged::numeric / u.total_in_cohort >= 0.30) AS is_district_event
FROM base b
JOIN universe u ON u.district_id = b.district_id AND u.sector = b.sector
WHERE b.flagged >= 3
ORDER BY b.as_of DESC, pct_of_cohort DESC;

-- ===========================================================================
-- 7. Receivables ageing — the udhaar book
-- ===========================================================================

CREATE OR REPLACE VIEW v_receivables_ageing AS
SELECT r.enterprise_id, e.proprietor_name, e.sector, r.counterparty_type,
       COUNT(*)                                                       AS invoices,
       SUM(r.amount)                                                  AS total,
       SUM(r.amount) FILTER (WHERE r.settled_on IS NULL AND NOT r.write_off) AS outstanding,
       SUM(r.amount) FILTER (WHERE r.write_off)                        AS written_off,
       ROUND(AVG(r.settled_on - r.invoice_date), 1)                    AS avg_days_to_cash,
       MAX(r.settled_on - r.invoice_date)                              AS worst_days_to_cash,
       ROUND(100.0 * SUM(r.amount) FILTER (WHERE r.write_off) / NULLIF(SUM(r.amount),0), 1)
                                                                       AS write_off_pct
FROM receivables r
JOIN enterprises e USING (enterprise_id)
GROUP BY 1,2,3,4;

-- ===========================================================================
-- 8. Evidence views — the deck's numbers as live queries
-- ===========================================================================

CREATE OR REPLACE VIEW v_reason_code_scorecard AS
SELECT true_mechanism,
       COUNT(*)                                            AS episodes,
       ROUND(100.0 * AVG(in_top1::int), 1)                 AS top1_pct,
       ROUND(100.0 * AVG(in_top3::int), 1)                 AS top3_pct
FROM eval_reason_code_accuracy
GROUP BY 1
UNION ALL
SELECT 'ALL', COUNT(*), ROUND(100.0*AVG(in_top1::int),1), ROUND(100.0*AVG(in_top3::int),1)
FROM eval_reason_code_accuracy;

CREATE OR REPLACE VIEW v_lead_time_summary AS
SELECT COUNT(*)                                   AS episodes,
       COUNT(*) FILTER (WHERE caught)              AS caught,
       ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY lead_days)::numeric, 0) AS median_lead_days,
       MIN(lead_days) AS min_lead_days, MAX(lead_days) AS max_lead_days
FROM eval_lead_time;

CREATE OR REPLACE VIEW v_forecast_accuracy AS
SELECT horizon_days,
       COUNT(*)                                                    AS n,
       ROUND(AVG(ABS(p50 - actual_net))::numeric, 0)               AS mae,
       ROUND(100.0 * AVG(((actual_net BETWEEN p10 AND p90))::int), 1) AS coverage_pct
FROM v_forecast_band
WHERE actual_net IS NOT NULL AND is_out_of_time
GROUP BY 1 ORDER BY 1;

-- Proof that headroom is not a restatement of the tier.
CREATE OR REPLACE VIEW v_headroom_by_tier AS
SELECT risk_tier, COUNT(*) AS n,
       ROUND(PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY credit_headroom)::numeric,0) AS headroom_p25,
       ROUND(PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY credit_headroom)::numeric,0) AS headroom_p50,
       ROUND(PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY credit_headroom)::numeric,0) AS headroom_p75,
       ROUND(PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY bridge_headroom)::numeric,0) AS bridge_p50,
       ROUND(100.0*AVG((credit_headroom > 0)::int),1) AS pct_with_headroom
FROM risk_assessments GROUP BY 1
ORDER BY CASE risk_tier WHEN 'GREEN' THEN 1 WHEN 'AMBER' THEN 2 ELSE 3 END;

CREATE OR REPLACE VIEW v_sector_seasonality_observed AS
SELECT sector,
       EXTRACT(MONTH FROM event_date)::int AS month,
       ROUND((100 * AVG(sales_accrued) /
              NULLIF(AVG(AVG(sales_accrued)) OVER (PARTITION BY sector), 0))::numeric, 0) AS index_100
FROM daily_ledger
GROUP BY sector, EXTRACT(MONTH FROM event_date)
ORDER BY sector, month;

-- ===========================================================================
-- 9. Write-back: POST /outcome closes the loop into a training label
-- ===========================================================================

CREATE OR REPLACE FUNCTION record_outcome(
    p_task_id      TEXT,
    p_outcome      TEXT,
    p_intervention TEXT DEFAULT NULL,
    p_note_lang    TEXT DEFAULT NULL
) RETURNS TEXT
LANGUAGE plpgsql
SET search_path = dhansetu, public
AS $$
DECLARE
    v_ent  TEXT;
    v_id   TEXT;
BEGIN
    IF p_outcome NOT IN ('stress_confirmed', 'false_positive', 'unreachable') THEN
        RAISE EXCEPTION 'invalid outcome: %', p_outcome;
    END IF;
    SELECT enterprise_id INTO v_ent FROM officer_tasks WHERE task_id = p_task_id;
    IF v_ent IS NULL THEN
        RAISE EXCEPTION 'unknown task_id: %', p_task_id;
    END IF;
    v_id := 'OC' || LPAD((COALESCE(
        (SELECT MAX(SUBSTRING(outcome_id FROM 3)::int) FROM visit_outcomes), 0) + 1)::text, 5, '0');

    INSERT INTO visit_outcomes (outcome_id, task_id, enterprise_id, visited_on,
                                outcome, intervention, officer_note_lang,
                                becomes_training_label)
    VALUES (v_id, p_task_id, v_ent, CURRENT_DATE, p_outcome,
            COALESCE(p_intervention, 'no_action'),
            COALESCE(p_note_lang, (SELECT preferred_lang FROM enterprises
                                   WHERE enterprise_id = v_ent)), TRUE);

    UPDATE officer_tasks SET status = 'closed' WHERE task_id = p_task_id;
    RETURN v_id;
END $$;

-- Confirmation rate by tier: is AMBER worth the officer's petrol?
CREATE OR REPLACE VIEW v_alert_precision AS
SELECT a.risk_tier,
       COUNT(*)                                                         AS visits,
       COUNT(*) FILTER (WHERE vo.outcome = 'stress_confirmed')           AS confirmed,
       ROUND(100.0 * AVG((vo.outcome = 'stress_confirmed')::int), 1)     AS confirm_pct
FROM visit_outcomes vo
JOIN officer_tasks t USING (task_id)
JOIN alerts a ON a.alert_id = t.alert_id
GROUP BY 1;
