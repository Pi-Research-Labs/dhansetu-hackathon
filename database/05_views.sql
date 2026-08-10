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
-- v_officer_worklist's definition physically lives after §11 now (below
-- v_enterprise_weekly_cashflow) — it depends on that view for the 7-week
-- trend sparkline, and Postgres resolves view dependencies at CREATE time.
-- ===========================================================================

CREATE OR REPLACE VIEW v_latest_assessment AS
SELECT ra.*
FROM risk_assessments ra
JOIN (SELECT enterprise_id, MAX(as_of) AS as_of
      FROM risk_assessments GROUP BY enterprise_id) m
  USING (enterprise_id, as_of);

-- ===========================================================================
-- 3. GET /enterprise/{id}  — the detail card
-- v_enterprise_card's definition physically lives after §4 now (below
-- v_live_forecast) — it depends on v_live_forecast for dscr_proj_180d, and
-- Postgres resolves view dependencies at CREATE time, not forward-declared.
-- ===========================================================================

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

-- §3's v_enterprise_card (declared here, not up in §3, because it depends
-- on v_live_forecast just above for dscr_proj_180d).
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
    COALESCE(ra.forecast_net_90d_p10, f90.p10)::numeric(16,2) AS forecast_net_90d_p10,
    COALESCE(ra.forecast_net_90d_p50, f90.p50)::numeric(16,2) AS forecast_net_90d_p50,
    COALESCE(ra.forecast_net_90d_p90, f90.p90)::numeric(16,2) AS forecast_net_90d_p90,
    ra.reason_1, ra.reason_2, ra.reason_3,
    ra.tier_cutoffs, ra.fusion_weights, ra.model_id, ra.rule_version,
    f.margin_gap_90d, f.cost_index_chg_90d, f.rev_index_chg_90d,
    f.dso_days, f.overdue_share, f.buyer_concentration,
    f.zero_inflow_days_30d,
    -- digital_share here is a trailing-90d average from daily_ledger, NOT
    -- feature_snapshots.digital_share (which is a single most-recent-day
    -- snapshot) - same recent_90d_digital_share pattern
    -- v_merchant_payment_mix already uses, just window-safe against ra.as_of
    -- rather than the panel's latest date, matching this view's own
    -- point-in-time discipline (see emi180 below). Kept at this exact
    -- position in the column list -- CREATE OR REPLACE VIEW can't reorder
    -- existing columns, only append new ones at the end.
    ROUND(digital90.digital_share_90d::numeric, 3)::double precision AS digital_share,
    f.informal_debt,
    f.missed_emis_90d, f.thi_anomaly_90d, f.season_drop_3m,
    -- New columns appended at the end on purpose for CREATE OR REPLACE VIEW compatibility
    ra.net_buffer_days                                  AS savings_runway_days,
    ROUND((emi180.forecast_180d_p50 / NULLIF(emi180.trailing_180d_emi, 0))::numeric, 2) AS dscr_proj_180d,
    f180.p10                                            AS forecast_net_180d_p10,
    f180.p50                                            AS forecast_net_180d_p50,
    f180.p90                                            AS forecast_net_180d_p90
FROM v_latest_assessment ra
JOIN enterprises e USING (enterprise_id)
LEFT JOIN feature_snapshots f
       ON f.enterprise_id = ra.enterprise_id AND f.as_of = ra.as_of
LEFT JOIN v_live_forecast f90
       ON f90.enterprise_id = ra.enterprise_id AND f90.horizon_days = 90
LEFT JOIN v_live_forecast f180
       ON f180.enterprise_id = ra.enterprise_id AND f180.horizon_days = 180
LEFT JOIN LATERAL (
    -- Projected DSCR pairs a forward-looking 6-month forecast numerator
    -- (from v_live_forecast) with the SAME trailing-EMI-burden convention dscr_annual uses.
    SELECT lf.p50 AS forecast_180d_p50,
           (SELECT SUM(d.emi_amount) FROM daily_ledger d
            WHERE d.enterprise_id = ra.enterprise_id AND d.emi_due
              AND d.event_date > ra.as_of - 180) AS trailing_180d_emi
    FROM v_live_forecast lf
    WHERE lf.enterprise_id = ra.enterprise_id AND lf.horizon_days = 180
) emi180 ON TRUE
LEFT JOIN LATERAL (
    SELECT AVG(d.digital_share) AS digital_share_90d
    FROM daily_ledger d
    WHERE d.enterprise_id = ra.enterprise_id
      AND d.event_date > ra.as_of - 90
      AND d.event_date <= ra.as_of
) digital90 ON TRUE;

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
-- 7B. PAYMENT MIX — UPI vs wallet vs cash, per merchant
-- daily_ledger carries upi_share/wallet_share/digital_share per day; nothing
-- rolled these up to one row per enterprise until now. cash_share is derived
-- (1 - digital_share), not stored, since digital_share is already
-- upi_share + wallet_share in the simulator.
-- ===========================================================================

CREATE OR REPLACE VIEW v_merchant_payment_mix AS
SELECT
    e.enterprise_id, e.proprietor_name, e.sector, e.district, e.preferred_channel,
    ROUND(AVG(l.upi_share)::numeric, 3)                        AS avg_upi_share,
    ROUND(AVG(l.wallet_share)::numeric, 3)                     AS avg_wallet_share,
    ROUND(AVG(l.digital_share)::numeric, 3)                    AS avg_digital_share,
    ROUND((1 - AVG(l.digital_share))::numeric, 3)              AS avg_cash_share,
    ROUND(AVG(l.digital_share) FILTER (
        WHERE l.event_date > (SELECT MAX(event_date) FROM daily_ledger) - 90
    )::numeric, 3)                                             AS recent_90d_digital_share,
    ROUND((1 - AVG(l.digital_share) FILTER (
        WHERE l.event_date > (SELECT MAX(event_date) FROM daily_ledger) - 90
    ))::numeric, 3)                                            AS recent_90d_cash_share
FROM enterprises e
JOIN daily_ledger l USING (enterprise_id)
GROUP BY e.enterprise_id, e.proprietor_name, e.sector, e.district, e.preferred_channel
ORDER BY e.enterprise_id;

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
    v_ent    TEXT;
    v_status TEXT;
    v_id     TEXT;
BEGIN
    IF p_outcome NOT IN ('stress_confirmed', 'false_positive', 'unreachable') THEN
        RAISE EXCEPTION 'invalid outcome: %', p_outcome;
    END IF;
    SELECT enterprise_id, status INTO v_ent, v_status
    FROM officer_tasks WHERE task_id = p_task_id;
    IF v_ent IS NULL THEN
        RAISE EXCEPTION 'unknown task_id: %', p_task_id;
    END IF;
    -- One visit, one outcome. Without this the function happily inserted a
    -- second visit_outcomes row and re-closed an already-closed task, and
    -- nothing downstream noticed: v_alert_precision counts these rows as
    -- "visits" and derives confirm_pct from them, so a double submission
    -- quietly inflated the confirmation rate that decides whether AMBER
    -- alerts are worth an officer's petrol. Raised rather than silently
    -- ignored, so the caller learns the visit was already recorded.
    IF v_status = 'closed' THEN
        RAISE EXCEPTION 'task already closed: % (an outcome is already recorded for this visit)', p_task_id;
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

-- ===========================================================================
-- 10. DIGITAL VISIBILITY HEATMAP — daily digital_share, trailing 90d
-- Calendar-heatmap cell value. Flat {date, value} array; the frontend lays
-- it out into a grid, the server doesn't compute week/day positions. 90d
-- matches this file's existing "recent_90d" convention
-- (v_merchant_payment_mix, missed_emis_90d).
-- ===========================================================================

-- Dropped and recreated, not CREATE OR REPLACE: this view was already live
-- with digital_share/cash_share (fraction) column names from an earlier
-- deploy, and Postgres rejects renaming columns via REPLACE (same
-- restriction hit twice already on v_enterprise_card in this file).
-- Nothing else depends on this view (checked before dropping).
DROP VIEW IF EXISTS v_enterprise_digital_heatmap;
CREATE VIEW v_enterprise_digital_heatmap AS
SELECT
    l.enterprise_id,
    l.event_date,
    ROUND((l.digital_share * 100)::numeric, 1)        AS digital_share_pct,
    ROUND(((1 - l.digital_share) * 100)::numeric, 1)  AS cash_share_pct,
    (COALESCE(l.txn_count, 0) = 0)                    AS is_zero_txn_day
FROM daily_ledger l
WHERE l.event_date > (SELECT MAX(event_date) FROM daily_ledger) - 90
ORDER BY l.enterprise_id, l.event_date;

-- ===========================================================================
-- 10b. EFFECTIVE DAILY LEDGER — synthetic panel + real voice-captured entries
-- The synthetic panel (daily_ledger) and the real ledger
-- (ledger_entries_live, rolled up by v_daily_from_voice in 04_live_data.sql)
-- are ADDITIVE: a spoken transaction is a transaction the panel never knew
-- about, not a restatement of one it did. So a merchant recording a sale in
-- the app sees that day's total go up, which is the whole point of capturing
-- it. (The alternative — live overrides synthetic for that day — would make
-- speaking one small sale erase a whole simulated day.)
--
-- FULL OUTER JOIN, not LEFT: entries dated past the panel's last day
-- (2026-07-31) have no synthetic row to hang off, and "today" is always past
-- it. Those days appear as live-only rows rather than vanishing.
--
-- Only the columns the two sources share are summed. Anything the real
-- ledger cannot know — digital_share, emi_amount, balance, price indices —
-- is deliberately absent, so callers needing those keep reading daily_ledger
-- directly and do not silently get a half-populated row.
-- ===========================================================================

CREATE OR REPLACE VIEW v_ledger_daily_effective AS
SELECT
    COALESCE(d.enterprise_id, v.enterprise_id)                          AS enterprise_id,
    COALESCE(d.event_date, v.event_date)                                AS event_date,
    COALESCE(d.cash_inflow, 0)        + COALESCE(v.cash_inflow, 0)      AS cash_inflow,
    COALESCE(d.outflow, 0)            + COALESCE(v.outflow, 0)          AS outflow,
    COALESCE(d.input_cost, 0)         + COALESCE(v.input_cost, 0)       AS input_cost,
    COALESCE(d.household_drawings, 0) + COALESCE(v.household_drawings, 0) AS household_drawings,
    COALESCE(d.net, 0)                + COALESCE(v.net, 0)              AS net,
    COALESCE(d.txn_count, 0)          + COALESCE(v.txn_count, 0)        AS txn_count,
    -- the live slice on its own, so the UI can say "of which you recorded X"
    COALESCE(v.cash_inflow, 0)                                          AS live_inflow,
    COALESCE(v.outflow, 0)                                              AS live_outflow,
    COALESCE(v.txn_count, 0)                                            AS live_txn_count,
    (v.enterprise_id IS NOT NULL)                                       AS has_live_entries,
    -- How many went IN vs OUT, as opposed to how much. Counted off the live
    -- ledger only, and that is a hard limit rather than an oversight:
    -- daily_ledger carries one txn_count per day with no per-transaction
    -- direction behind it (it stores daily inflow/outflow *amounts*), so
    -- there is nothing to split on a panel day. On any date after the panel
    -- ends (2026-07-31) every transaction is live, so these equal the true
    -- totals -- which covers "today", the case the merchant home screen asks
    -- about. On earlier dates they count the live additions only, and
    -- txn_count stays the honest combined figure.
    COALESCE(c.inflow_count, 0)                                         AS inflow_count,
    COALESCE(c.outflow_count, 0)                                        AS outflow_count
FROM daily_ledger d
FULL OUTER JOIN v_daily_from_voice v
       ON v.enterprise_id = d.enterprise_id
      AND v.event_date    = d.event_date
-- Separate join rather than extra columns on v_daily_from_voice: that view
-- is the documented daily_ledger-shaped seam and gains nothing from count
-- columns daily_ledger has no counterpart for.
LEFT JOIN (
    SELECT enterprise_id, event_date,
           COUNT(*) FILTER (WHERE direction = 'inflow')  AS inflow_count,
           COUNT(*) FILTER (WHERE direction = 'outflow') AS outflow_count
    FROM v_ledger_live_effective
    GROUP BY enterprise_id, event_date
) c ON c.enterprise_id = COALESCE(d.enterprise_id, v.enterprise_id)
   AND c.event_date    = COALESCE(d.event_date, v.event_date);

-- ===========================================================================
-- 11. HISTORICAL WEEKLY CASHFLOW — inflow/outflow/net by ISO week
-- Unbounded here; the service defaults to trailing 26 weeks (6 months, to
-- line up with the forecast graph's own horizon for a continuous
-- history+forecast timeline) — full panel is ~156 weeks, unreadable as bars.
--
-- Reads the effective ledger (10b), so voice-captured entries show up in the
-- weekly graph, in v_enterprise_net_inflow_heatmap (§15, derived from this)
-- and in the worklist sparkline (§2, also derived from this) — three
-- surfaces off one repoint.
-- ===========================================================================

CREATE OR REPLACE VIEW v_enterprise_weekly_cashflow AS
SELECT
    l.enterprise_id,
    date_trunc('week', l.event_date)::date            AS week_start,
    (date_trunc('week', l.event_date)::date + 6)       AS week_end,
    SUM(l.cash_inflow)                                 AS inflow,
    SUM(l.outflow)                                     AS outflow,
    SUM(l.net)                                         AS net,
    COUNT(*) FILTER (WHERE l.cash_inflow = 0 AND l.outflow = 0) AS zero_txn_days
FROM v_ledger_daily_effective l
GROUP BY l.enterprise_id, date_trunc('week', l.event_date)
ORDER BY l.enterprise_id, week_start;

-- §2's v_officer_worklist (declared here, not up in §2, because it depends
-- on v_enterprise_weekly_cashflow just above for the 7-week trend sparkline).
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
                                           AS km_from_centre,
    -- 7-week net-cashflow sparkline, same "week" definition as
    -- v_enterprise_weekly_cashflow/v_enterprise_net_inflow_heatmap. Just the
    -- net line (not inflow/outflow bars) - this is a scannable list, the
    -- full weekly-cashflow graph lives on the per-enterprise detail page.
    trend.weekly_trend
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
LEFT JOIN LATERAL (
    SELECT JSONB_AGG(JSONB_BUILD_OBJECT(
               'week_start', wc.week_start, 'week_end', wc.week_end, 'net', wc.net
           ) ORDER BY wc.week_start) AS weekly_trend
    FROM (
        SELECT week_start, week_end, net FROM v_enterprise_weekly_cashflow
        WHERE enterprise_id = ra.enterprise_id
        ORDER BY week_start DESC
        LIMIT 7
    ) wc
) trend ON TRUE
-- No tier filter: the officer's whole book, highest score first, so the
-- cases needing action sort to the top on their own. GREEN used to be
-- excluded here, but the dashboard reads this one endpoint for both halves
-- of the portfolio — the "Stable" tier pill (SearchAndFilters.tsx) and the
-- "Bankable Pipeline" KPI (PortfolioMetrics.tsx) are both counted off it —
-- so filtering GREEN out server-side pinned both to 0 with no way to show
-- stable-vs-at-risk. Tier filtering is the client's job.
ORDER BY ra.fused_score DESC;

-- ===========================================================================
-- 12. FORECAST WITH CONFIDENCE — v_live_forecast + a heuristic score
-- explaining WHY the p10/p90 band is wide, not just that it is. Weighted
-- formula (0.5 data completeness / 0.3 zero-inflow days / 0.2 digital-share
-- steadiness), not a trained model — a hackathon-scale heuristic, not
-- tuned or validated. confidence_score is constant across all 6 horizon
-- points of one vintage (only p10/p90 widen with horizon) since there's no
-- horizon-varying uncertainty signal available to add.
-- ===========================================================================

CREATE OR REPLACE VIEW v_enterprise_cashflow_forecast AS
WITH vol AS (
    SELECT enterprise_id, STDDEV_SAMP(digital_share) AS digital_share_stddev_90d
    FROM daily_ledger
    WHERE event_date > (SELECT MAX(event_date) FROM daily_ledger) - 90
    GROUP BY enterprise_id
),
scored AS (
    SELECT
        lf.enterprise_id, lf.origin_date, lf.horizon_days, lf.horizon_label,
        lf.horizon_end_date, lf.p10, lf.p50, lf.p90,
        1 - LEAST(1, GREATEST(0,
              0.5 * (1 - COALESCE(f.data_completeness, 0))
            + 0.3 * (COALESCE(f.zero_inflow_days_30d, 0) / 30.0)
            + 0.2 * LEAST(1, COALESCE(v.digital_share_stddev_90d, 0) * 5)
        )) AS confidence_raw
    FROM v_live_forecast lf
    JOIN v_latest_assessment ra USING (enterprise_id)
    LEFT JOIN feature_snapshots f
           ON f.enterprise_id = ra.enterprise_id AND f.as_of = ra.as_of
    LEFT JOIN vol v ON v.enterprise_id = lf.enterprise_id
)
SELECT
    enterprise_id, origin_date, horizon_days, horizon_label, horizon_end_date,
    p10, p50, p90,
    ROUND(confidence_raw::numeric, 3)                                    AS confidence_score,
    CASE WHEN confidence_raw >= 0.7 THEN 'high'
         WHEN confidence_raw >= 0.4 THEN 'medium'
         ELSE 'low' END                                                  AS confidence_label
FROM scored
ORDER BY enterprise_id, horizon_days;

-- ===========================================================================
-- 13. NET INFLOW HEATMAP — net cash flow per ISO week, capped to a trailing
-- 100-DAY pool here (~14 weeks + a few days' margin at the boundary — NOT
-- 100 weeks; week_start rows are 7 days apart, so the cutoff is in days,
-- not weeks. A prior version of this comment said "49-week pool" for a
-- `- 49` cutoff, which was actually a 49-DAY / 7-week cap — silently
-- capping the 14-week aggregate view to 7 rows). The API's `weeks` param
-- (7 or 14 — the heatmap's two aggregate views) does the real windowing
-- via LIMIT in get_net_inflow_heatmap, same pattern as
-- v_enterprise_weekly_cashflow's caller-supplied window; this cap just
-- needs to be wide enough to have 14 weeks available to LIMIT from. Built
-- on top of v_enterprise_weekly_cashflow rather than daily_ledger
-- directly, so "a week" means the same thing in both places. Flat
-- {week, value} array, frontend lays it out.
-- ===========================================================================

CREATE OR REPLACE VIEW v_enterprise_net_inflow_heatmap AS
SELECT enterprise_id, week_start, week_end, net AS net_inflow
FROM v_enterprise_weekly_cashflow
WHERE week_start > (SELECT MAX(week_start) FROM v_enterprise_weekly_cashflow) - 100
ORDER BY enterprise_id, week_start;

-- ===========================================================================
-- 14. ABSOLUTE ENTERPRISE LOCATIONS — enterprises.lat/lon are small WGS84
-- degree offsets from the district centroid (district_geo), not usable as
-- a real-world point on their own (same convention v_officer_worklist's
-- km_from_centre and app/services/maps.get_enterprise_location rely on,
-- the latter doing this exact sum for one enterprise at a time). This view
-- does it for every enterprise: absolute lat/lon = district centroid +
-- offset, in WGS84 decimal degrees, ready to plot directly.
-- ===========================================================================

CREATE OR REPLACE VIEW v_enterprise_locations AS
SELECT
    e.enterprise_id,
    e.proprietor_name,
    e.business_name,
    e.district_id,
    e.district,
    e.state,
    g.lat + e.lat AS lat,
    g.lon + e.lon AS lon
FROM v_enterprises_safe e
LEFT JOIN district_geo g ON g.district_id = e.district_id;

-- ===========================================================================
-- 15. MARKET INTELLIGENCE VIEWS
-- Category dropdown, sector-level risk cards, commodity price series, and weather rainfall.
-- ===========================================================================

CREATE OR REPLACE VIEW v_market_intelligence_categories AS
SELECT sub_type_id, sub_type, sector, typical_daily_turnover
FROM sub_types
ORDER BY sub_type_id;

CREATE OR REPLACE VIEW v_market_risk_cards AS
SELECT sector, risk_type, detail, severity
FROM market_risk_cards
ORDER BY sector, severity DESC;

-- Dynamic 12-month trailing chart data combining monthly commodity price index and rainfall
CREATE OR REPLACE VIEW v_market_intelligence_chart AS
WITH trailing_months AS (
    SELECT 
        i AS seq,
        (CURRENT_DATE - (11 - i) * INTERVAL '1 month')::date AS month_date,
        EXTRACT(MONTH FROM (CURRENT_DATE - (11 - i) * INTERVAL '1 month'))::int AS month_num,
        TO_CHAR(CURRENT_DATE - (11 - i) * INTERVAL '1 month', 'MM-YYYY') AS month
    FROM generate_series(0, 11) AS i
),
weather_m AS (
    SELECT EXTRACT(MONTH FROM obs_date)::int AS month_num,
           ROUND(AVG(rainfall_mm)::numeric, 1) AS avg_rainfall_mm
    FROM weather_daily
    GROUP BY EXTRACT(MONTH FROM obs_date)
),
price_m AS (
    SELECT c.commodity_id,
           EXTRACT(MONTH FROM p.price_date)::int AS month_num,
           ROUND(AVG(p.modal_price)::numeric, 1) AS avg_price_index
    FROM mandi_prices p
    JOIN commodities c USING (commodity_id)
    GROUP BY c.commodity_id, EXTRACT(MONTH FROM p.price_date)
)
SELECT
    st.sub_type_id,
    st.sub_type,
    st.sector,
    tm.seq AS month_num,
    tm.month,
    COALESCE(pm.avg_price_index, ROUND((c.base_price * (1 + c.seasonal_amplitude * SIN((tm.month_num - c.seasonal_peak_month) * 0.5236)))::numeric, 1)) AS price_index,
    COALESCE(wm.avg_rainfall_mm, 0) AS rainfall_mm
FROM sub_types st
CROSS JOIN trailing_months tm
LEFT JOIN commodities c ON (
    (st.sector = 'DAIRY' AND c.commodity_id = 'CM01') OR
    (st.sector = 'POULTRY' AND c.commodity_id = 'CM03') OR
    (st.sector = 'HANDICRAFT' AND c.commodity_id = 'CM05') OR
    (st.sector = 'FOODPROC' AND c.commodity_id = 'CM06') OR
    (st.sector = 'RETAIL' AND c.commodity_id = 'CM08')
)
LEFT JOIN price_m pm ON pm.commodity_id = c.commodity_id AND pm.month_num = tm.month_num
LEFT JOIN weather_m wm ON wm.month_num = tm.month_num
ORDER BY st.sub_type_id, tm.seq;

-- Dynamic market intelligence detail per sub_type
CREATE OR REPLACE VIEW v_market_intelligence_detail AS
SELECT
    st.sub_type_id,
    st.sub_type,
    st.sector,
    COALESCE(c.commodity || ' (' || c.unit || ')', st.sub_type || ' price index') AS tracked_commodity,
    COALESCE(c.annual_trend_pct, 4.0) AS price_trend_12m_pct,
    COALESCE(sec.failure_mode, 'Sector risk monitoring active') AS productivity_outlook,
    'Peak seasonal demand in month ' || COALESCE(c.seasonal_peak_month, 10)::text || '; monsoon dip in Jul-Aug.' AS seasonal_pattern
FROM sub_types st
LEFT JOIN sectors sec ON sec.sector = st.sector
LEFT JOIN commodities c ON (
    (st.sector = 'DAIRY' AND c.commodity_id = 'CM01') OR
    (st.sector = 'POULTRY' AND c.commodity_id = 'CM03') OR
    (st.sector = 'HANDICRAFT' AND c.commodity_id = 'CM05') OR
    (st.sector = 'FOODPROC' AND c.commodity_id = 'CM06') OR
    (st.sector = 'RETAIL' AND c.commodity_id = 'CM08')
);



-- ===========================================================================
-- 16. ENTERPRISE TRANSACTIONS — the itemised real ledger
-- One row per live entry (voice, IVR, assisted, manual, UPI feed), carrying
-- the utterance that produced it so the app can show "you said: ..." beside
-- the amount. Reads v_ledger_live_effective, so superseded corrections and
-- voided rows are already gone — an edited entry appears once, at its
-- corrected value.
--
-- Deliberately NOT merged with daily_ledger: the synthetic panel has no
-- itemised transactions to show, only daily totals. This view is the real
-- entries only; v_ledger_daily_effective (10b) is where the two combine.
-- Ordering and paging are the service's job.
-- ===========================================================================

CREATE OR REPLACE VIEW v_enterprise_transactions AS
SELECT
    l.entry_id,
    l.enterprise_id,
    l.event_date,
    l.recorded_at,
    l.direction,
    l.amount,
    l.category,
    l.tender,
    l.is_household,
    l.source,
    l.confidence,
    l.voice_id,
    v.transcript,
    v.detected_lang,
    v.channel
FROM v_ledger_live_effective l
LEFT JOIN voice_entries v ON v.voice_id = l.voice_id;

-- ===========================================================================
-- 17. DAILY TOTALS — one day's inflow/expense for the merchant home screen
-- Wraps v_ledger_daily_effective (10b) so the mobile landing page is a
-- single indexed lookup rather than a client-side sum over a transaction
-- list. Days with no activity simply have no row; the service substitutes
-- zeros so a quiet day renders as Rs 0 rather than an error.
-- ===========================================================================

CREATE OR REPLACE VIEW v_enterprise_daily_totals AS
SELECT
    enterprise_id,
    event_date,
    cash_inflow            AS total_inflow,
    outflow                AS total_expenses,
    net,
    txn_count,
    live_inflow,
    live_outflow,
    live_txn_count,
    has_live_entries,
    inflow_count,
    outflow_count
FROM v_ledger_daily_effective;
