-- DHANSETU v1.2 — schema, generated from the shipped CSVs.
-- Regenerate with gen_schema.py; do not hand-edit column lists.

CREATE SCHEMA IF NOT EXISTS dhansetu;
SET search_path TO dhansetu, public;

-- drop in dependency order so re-runs are clean
DROP TABLE IF EXISTS dhansetu.eval_reason_code_accuracy CASCADE;
DROP TABLE IF EXISTS dhansetu.eval_lead_time CASCADE;
DROP TABLE IF EXISTS dhansetu.audit_log CASCADE;
DROP TABLE IF EXISTS dhansetu.access_grants CASCADE;
DROP TABLE IF EXISTS dhansetu.consent_artifacts CASCADE;
DROP TABLE IF EXISTS dhansetu.visit_outcomes CASCADE;
DROP TABLE IF EXISTS dhansetu.officer_tasks CASCADE;
DROP TABLE IF EXISTS dhansetu.recommendations CASCADE;
DROP TABLE IF EXISTS dhansetu.alerts CASCADE;
DROP TABLE IF EXISTS dhansetu.forecasts CASCADE;
DROP TABLE IF EXISTS dhansetu.risk_assessments CASCADE;
DROP TABLE IF EXISTS dhansetu.rule_evaluations CASCADE;
DROP TABLE IF EXISTS dhansetu.stress_episodes CASCADE;
DROP TABLE IF EXISTS dhansetu.feature_snapshots CASCADE;
DROP TABLE IF EXISTS dhansetu.merchant_entries CASCADE;
DROP TABLE IF EXISTS dhansetu.shock_event_scope CASCADE;
DROP TABLE IF EXISTS dhansetu.shock_events CASCADE;
DROP TABLE IF EXISTS dhansetu.weather_daily CASCADE;
DROP TABLE IF EXISTS dhansetu.mandi_prices CASCADE;
DROP TABLE IF EXISTS dhansetu.repayment_schedule CASCADE;
DROP TABLE IF EXISTS dhansetu.loans CASCADE;
DROP TABLE IF EXISTS dhansetu.poultry_batches CASCADE;
DROP TABLE IF EXISTS dhansetu.receivable_settlements CASCADE;
DROP TABLE IF EXISTS dhansetu.receivables CASCADE;
DROP TABLE IF EXISTS dhansetu.daily_ledger CASCADE;
DROP TABLE IF EXISTS dhansetu.enterprises CASCADE;
DROP TABLE IF EXISTS dhansetu.market_risk_cards CASCADE;
DROP TABLE IF EXISTS dhansetu.rules CASCADE;
DROP TABLE IF EXISTS dhansetu.actions CASCADE;
DROP TABLE IF EXISTS dhansetu.mechanisms CASCADE;
DROP TABLE IF EXISTS dhansetu.schemes CASCADE;
DROP TABLE IF EXISTS dhansetu.officers CASCADE;
DROP TABLE IF EXISTS dhansetu.commodities CASCADE;
DROP TABLE IF EXISTS dhansetu.sector_seasonality CASCADE;
DROP TABLE IF EXISTS dhansetu.sub_types CASCADE;
DROP TABLE IF EXISTS dhansetu.sectors CASCADE;
DROP TABLE IF EXISTS dhansetu.districts CASCADE;

CREATE TABLE dhansetu.districts (
    "district_id" INTEGER NOT NULL,
    "district" TEXT,
    "state" TEXT,
    "language" TEXT,
    "agro_zone" TEXT,
    "annual_rainfall_mm" INTEGER,
    "cyclone_exposed" BOOLEAN,
    PRIMARY KEY ("district_id")
);

CREATE TABLE dhansetu.sectors (
    "sector" TEXT NOT NULL,
    "sector_label" TEXT,
    "failure_mode" TEXT,
    PRIMARY KEY ("sector")
);

CREATE TABLE dhansetu.sub_types (
    "sub_type_id" TEXT NOT NULL,
    "sub_type" TEXT,
    "sector" TEXT,
    "typical_daily_turnover" INTEGER,
    PRIMARY KEY ("sub_type_id")
);

CREATE TABLE dhansetu.sector_seasonality (
    "sector" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "inflow_index" DOUBLE PRECISION,
    "outflow_index" DOUBLE PRECISION,
    PRIMARY KEY ("sector", "month"),
    CHECK (month BETWEEN 1 AND 12)
);

CREATE TABLE dhansetu.commodities (
    "commodity_id" TEXT NOT NULL,
    "commodity" TEXT,
    "unit" TEXT,
    "base_price" NUMERIC(16,2),
    "annual_trend_pct" DOUBLE PRECISION,
    "seasonal_peak_month" INTEGER,
    "seasonal_amplitude" DOUBLE PRECISION,
    PRIMARY KEY ("commodity_id")
);

CREATE TABLE dhansetu.officers (
    "officer_id" TEXT NOT NULL,
    "officer_name" TEXT,
    "age" INTEGER,
    "district_id" INTEGER,
    "language" TEXT,
    "base_town" TEXT,
    "caseload" INTEGER,
    PRIMARY KEY ("officer_id")
);

CREATE TABLE dhansetu.schemes (
    "scheme_id" TEXT NOT NULL,
    "scheme" TEXT,
    "sectors" TEXT,
    "delta_type" TEXT,
    "delta_value" DOUBLE PRECISION,
    "effective_from" TEXT,
    "description" TEXT,
    PRIMARY KEY ("scheme_id")
);

CREATE TABLE dhansetu.mechanisms (
    "mechanism" TEXT NOT NULL,
    PRIMARY KEY ("mechanism")
);

CREATE TABLE dhansetu.actions (
    "action_id" TEXT NOT NULL,
    "action_key" TEXT,
    "template" TEXT,
    PRIMARY KEY ("action_id")
);

CREATE TABLE dhansetu.rules (
    "rule_key" TEXT NOT NULL,
    "mechanism" TEXT,
    "weight" DOUBLE PRECISION,
    "rule_version" TEXT,
    PRIMARY KEY ("rule_key")
);

CREATE TABLE dhansetu.market_risk_cards (
    "sector" TEXT NOT NULL,
    "risk_type" TEXT NOT NULL,
    "detail" TEXT,
    "severity" TEXT,
    PRIMARY KEY ("sector", "risk_type")
);

CREATE TABLE dhansetu.enterprises (
    "enterprise_id" TEXT NOT NULL,
    "proprietor_name" TEXT,
    "business_name" TEXT,
    "age" INTEGER,
    "sub_type_id" TEXT,
    "sub_type" TEXT,
    "sector" TEXT,
    "district_id" INTEGER,
    "district" TEXT,
    "state" TEXT,
    "agro_zone" TEXT,
    "block" TEXT,
    "lat" DOUBLE PRECISION,
    "lon" DOUBLE PRECISION,
    "preferred_lang" TEXT,
    "preferred_channel" TEXT,
    "literacy" TEXT,
    "shared_device" BOOLEAN,
    "officer_id" TEXT,
    "shg_id" TEXT,
    "onboarded_on" DATE,
    "baseline_turnover" NUMERIC(16,2),
    "sim_health_latent" TEXT,
    "digital_share_start" DOUBLE PRECISION,
    "digital_share_slope" DOUBLE PRECISION,
    "sim_stress_script" TEXT,
    "is_named_persona" BOOLEAN,
    PRIMARY KEY ("enterprise_id")
);
COMMENT ON COLUMN dhansetu.enterprises."sim_health_latent" IS 'SIMULATOR GROUND TRUTH — never use as a model feature (label leakage).';
COMMENT ON COLUMN dhansetu.enterprises."sim_stress_script" IS 'SIMULATOR GROUND TRUTH — never use as a model feature (label leakage).';

CREATE TABLE dhansetu.daily_ledger (
    "ledger_date_id" BIGINT,
    "event_date" DATE NOT NULL,
    "enterprise_id" TEXT NOT NULL,
    "sector" TEXT,
    "sub_type" TEXT,
    "district_id" INTEGER,
    "district" TEXT,
    "sales_accrued" NUMERIC(16,2),
    "cash_inflow" NUMERIC(16,2),
    "outflow" NUMERIC(16,2),
    "input_cost" NUMERIC(16,2),
    "household_drawings" NUMERIC(16,2),
    "net" NUMERIC(16,2),
    "balance" NUMERIC(16,2),
    "informal_debt" NUMERIC(16,2),
    "surplus_deployed" NUMERIC(16,2),
    "txn_count" INTEGER,
    "emi_due" BOOLEAN,
    "emi_amount" NUMERIC(16,2),
    "emi_paid" BOOLEAN,
    "loan_outstanding" NUMERIC(16,2),
    "dealer_credit_outstanding" NUMERIC(16,2),
    "batch_id" TEXT,
    "batch_day" INTEGER,
    "upi_share" DOUBLE PRECISION,
    "wallet_share" DOUBLE PRECISION,
    "digital_share" DOUBLE PRECISION,
    "rev_price_index" DOUBLE PRECISION,
    "cost_price_index" DOUBLE PRECISION,
    "thi" DOUBLE PRECISION,
    "rain_anomaly_pct" DOUBLE PRECISION,
    "festival_index" DOUBLE PRECISION,
    "event_code" TEXT,
    "drv_seasonality" DOUBLE PRECISION,
    "drv_climate" DOUBLE PRECISION,
    "drv_price_revenue" DOUBLE PRECISION,
    "drv_price_cost" DOUBLE PRECISION,
    "drv_demand" DOUBLE PRECISION,
    "drv_event" DOUBLE PRECISION,
    PRIMARY KEY ("enterprise_id", "event_date")
);
COMMENT ON TABLE dhansetu.daily_ledger IS 'Daily cash ledger. drv_* columns are simulator internals.';
COMMENT ON COLUMN dhansetu.daily_ledger."batch_id" IS 'No FK: batches in progress at panel end have no realisation row yet.';

CREATE TABLE dhansetu.receivables (
    "receivable_id" TEXT NOT NULL,
    "enterprise_id" TEXT,
    "counterparty_ref" TEXT,
    "counterparty_type" TEXT,
    "invoice_date" DATE,
    "due_date" DATE,
    "amount" NUMERIC(16,2),
    "is_informal" BOOLEAN,
    "settled_on" DATE,
    "write_off" BOOLEAN,
    PRIMARY KEY ("receivable_id"),
    CHECK (due_date >= invoice_date),
    CHECK (amount > 0)
);

CREATE TABLE dhansetu.receivable_settlements (
    "receivable_id" TEXT NOT NULL,
    "enterprise_id" TEXT,
    "settled_on" DATE,
    "amount" NUMERIC(16,2),
    PRIMARY KEY ("receivable_id")
);

CREATE TABLE dhansetu.poultry_batches (
    "batch_id" TEXT NOT NULL,
    "enterprise_id" TEXT,
    "placed_on" DATE,
    "realised_on" DATE,
    "grow_days" INTEGER,
    "chicks_placed" INTEGER,
    "placement_cost" NUMERIC(16,2),
    "feed_on_dealer_credit" NUMERIC(16,2),
    "realisation" NUMERIC(16,2),
    "realisation_price" NUMERIC(16,2),
    PRIMARY KEY ("batch_id")
);

CREATE TABLE dhansetu.loans (
    "loan_id" TEXT NOT NULL,
    "enterprise_id" TEXT,
    "lender" TEXT,
    "principal" NUMERIC(16,2),
    "annual_rate_bps" INTEGER,
    "tenor_months" INTEGER,
    "disbursed_on" DATE,
    "scheme_id" TEXT,
    PRIMARY KEY ("loan_id")
);

CREATE TABLE dhansetu.repayment_schedule (
    "loan_id" TEXT NOT NULL,
    "enterprise_id" TEXT,
    "installment_no" INTEGER NOT NULL,
    "due_date" DATE,
    "emi_scheduled" NUMERIC(16,2),
    "subvention" NUMERIC(16,2),
    "emi_payable" NUMERIC(16,2),
    "interest_component" NUMERIC(16,2),
    "principal_component" NUMERIC(16,2),
    "closing_balance" NUMERIC(16,2),
    PRIMARY KEY ("loan_id", "installment_no")
);

CREATE TABLE dhansetu.mandi_prices (
    "commodity_id" TEXT NOT NULL,
    "district_id" INTEGER NOT NULL,
    "price_date" DATE NOT NULL,
    "modal_price" NUMERIC(16,2),
    "unit" TEXT,
    "source" TEXT,
    PRIMARY KEY ("commodity_id", "district_id", "price_date")
);

CREATE TABLE dhansetu.weather_daily (
    "district_id" INTEGER NOT NULL,
    "obs_date" DATE NOT NULL,
    "rainfall_mm" DOUBLE PRECISION,
    "temp_max_c" DOUBLE PRECISION,
    "humidity_pct" DOUBLE PRECISION,
    "thi" DOUBLE PRECISION,
    "rain_30d" DOUBLE PRECISION,
    "rain_anomaly_pct" DOUBLE PRECISION,
    "source" TEXT,
    PRIMARY KEY ("district_id", "obs_date")
);

CREATE TABLE dhansetu.shock_events (
    "event_id" TEXT NOT NULL,
    "event_code" TEXT,
    "event_type" TEXT,
    "district_id" INTEGER,
    "start_date" DATE,
    "end_date" DATE,
    "duration_days" INTEGER,
    "sectors" TEXT,
    "inflow_mult" DOUBLE PRECISION,
    "outflow_mult" DOUBLE PRECISION,
    "price_mult" DOUBLE PRECISION,
    "severity" TEXT,
    "description" TEXT,
    "price_commodities" TEXT,
    PRIMARY KEY ("event_id")
);

CREATE TABLE dhansetu.shock_event_scope (
    "event_code" TEXT NOT NULL,
    "enterprise_id" TEXT NOT NULL,
    PRIMARY KEY ("event_code", "enterprise_id")
);

CREATE TABLE dhansetu.merchant_entries (
    "entry_id" TEXT NOT NULL,
    "enterprise_id" TEXT,
    "entry_date" DATE,
    "recorded_at" DATE,
    "synced_at" DATE,
    "sync_lag_days" INTEGER,
    "entry_type" TEXT,
    "amount" NUMERIC(16,2),
    "note_text" TEXT,
    "note_lang" TEXT,
    "source" TEXT,
    "asr_confidence" DOUBLE PRECISION,
    "is_household" BOOLEAN,
    "corrects_entry_id" TEXT,
    "is_suspected_duplicate" BOOLEAN,
    PRIMARY KEY ("entry_id")
);
COMMENT ON TABLE dhansetu.merchant_entries IS 'Voice/IVR/assisted capture log with ASR confidence and sync lag.';

CREATE TABLE dhansetu.feature_snapshots (
    "enterprise_id" TEXT NOT NULL,
    "as_of" DATE NOT NULL,
    "sector" TEXT,
    "district_id" INTEGER,
    "receivable_due_next_90d" INTEGER,
    "receivable_open_balance" INTEGER,
    "emi_scheduled_next_90d" INTEGER,
    "rain_anomaly_90d" DOUBLE PRECISION,
    "season_drop_3m" DOUBLE PRECISION,
    "inflow_trend_90d" DOUBLE PRECISION,
    "balance" INTEGER,
    "buffer_days" DOUBLE PRECISION,
    "net_buffer_days" DOUBLE PRECISION,
    "net_30d" INTEGER,
    "net_90d" INTEGER,
    "avg_daily_inflow_30d" INTEGER,
    "zero_inflow_days_30d" INTEGER,
    "inflow_cv_90d" DOUBLE PRECISION,
    "outflow_inflow_30d" DOUBLE PRECISION,
    "outflow_inflow_90d" DOUBLE PRECISION,
    "cost_index_chg_90d" DOUBLE PRECISION,
    "rev_index_chg_90d" DOUBLE PRECISION,
    "margin_gap_90d" DOUBLE PRECISION,
    "dso_days" DOUBLE PRECISION,
    "overdue_share" DOUBLE PRECISION,
    "receivable_aged_90d_share" DOUBLE PRECISION,
    "buyer_concentration" DOUBLE PRECISION,
    "loan_outstanding" INTEGER,
    "emi_burden_365d" DOUBLE PRECISION,
    "missed_emis_90d" INTEGER,
    "missed_emis_365d" INTEGER,
    "dscr_annual" DOUBLE PRECISION,
    "informal_debt" INTEGER,
    "noc_365d" INTEGER,
    "dscr_annual_raw" DOUBLE PRECISION,
    "season_index_now" DOUBLE PRECISION,
    "season_index_fwd3" DOUBLE PRECISION,
    "thi_90d" DOUBLE PRECISION,
    "thi_anomaly_90d" DOUBLE PRECISION,
    "digital_share" DOUBLE PRECISION,
    "data_completeness" DOUBLE PRECISION,
    "event_days_90d" INTEGER,
    "actual_net_next_90d" NUMERIC(16,2),
    "stress_within_90d" INTEGER,
    "days_to_onset" DOUBLE PRECISION,
    "missed_repayment_within_90d" INTEGER,
    "days_to_missed_repayment" DOUBLE PRECISION,
    "net_next90_lag365" NUMERIC(16,2),
    "buffer_days_lag3m" DOUBLE PRECISION,
    "buffer_days_delta_3m" DOUBLE PRECISION,
    "net90_lag12m" NUMERIC(16,2),
    "sales_yoy" DOUBLE PRECISION,
    "dso_delta_3m" DOUBLE PRECISION,
    "prob_stress" DOUBLE PRECISION,
    "prob_missed_repayment" DOUBLE PRECISION,
    "model_prob" DOUBLE PRECISION,
    "model_prob_default" DOUBLE PRECISION,
    "forecast_net_90d_p10" NUMERIC(16,2),
    "forecast_net_90d_p50" NUMERIC(16,2),
    "forecast_net_90d_p90" NUMERIC(16,2),
    "baseline_seasonal_naive" NUMERIC(16,2),
    "rule_score" DOUBLE PRECISION,
    "fused_score" DOUBLE PRECISION,
    "risk_tier" TEXT,
    "tier_cutoffs" TEXT,
    "band_width" NUMERIC(16,2),
    "low_visibility" BOOLEAN,
    "reason_1" TEXT,
    "reason_1_contrib" DOUBLE PRECISION,
    "reason_2" TEXT,
    "reason_2_contrib" DOUBLE PRECISION,
    "reason_3" TEXT,
    "reason_3_contrib" DOUBLE PRECISION,
    "credit_headroom" NUMERIC(16,2),
    "suggested_max_emi" NUMERIC(16,2),
    "bridge_headroom" NUMERIC(16,2),
    PRIMARY KEY ("enterprise_id", "as_of")
);
COMMENT ON TABLE dhansetu.feature_snapshots IS 'Point-in-time feature store, monthly as_of snapshots.';
COMMENT ON COLUMN dhansetu.feature_snapshots."as_of" IS 'Point-in-time cutoff. Every column uses only data at or before this date.';

CREATE TABLE dhansetu.stress_episodes (
    "episode_id" TEXT NOT NULL,
    "enterprise_id" TEXT,
    "onset_date" DATE,
    "resolution_date" DATE,
    "first_missed_repayment" TEXT,
    "duration_days" INTEGER,
    "mechanism" TEXT,
    "severity" TEXT,
    "min_buffer_days" DOUBLE PRECISION,
    "causal_drivers" TEXT,
    "label_source" TEXT,
    PRIMARY KEY ("episode_id")
);
COMMENT ON TABLE dhansetu.stress_episodes IS 'GROUND TRUTH labels. Causal onset date and true mechanism.';
COMMENT ON COLUMN dhansetu.stress_episodes."mechanism" IS 'TRUE cause from the simulator. This is what makes reason codes scorable.';
COMMENT ON COLUMN dhansetu.stress_episodes."causal_drivers" IS 'JSON of driver deviation scores that produced the episode.';

CREATE TABLE dhansetu.rule_evaluations (
    "enterprise_id" TEXT NOT NULL,
    "as_of" DATE NOT NULL,
    "rule_key" TEXT NOT NULL,
    "mechanism" TEXT,
    "weight" DOUBLE PRECISION,
    "fired" BOOLEAN,
    PRIMARY KEY ("enterprise_id", "as_of", "rule_key")
);

CREATE TABLE dhansetu.risk_assessments (
    "assessment_id" TEXT NOT NULL,
    "enterprise_id" TEXT,
    "as_of" DATE,
    "sector" TEXT,
    "district_id" INTEGER,
    "prob_stress" DOUBLE PRECISION,
    "prob_missed_repayment" DOUBLE PRECISION,
    "rule_score" DOUBLE PRECISION,
    "fused_score" DOUBLE PRECISION,
    "risk_tier" TEXT,
    "tier_cutoffs" TEXT,
    "band_width" NUMERIC(16,2),
    "low_visibility" BOOLEAN,
    "data_completeness" DOUBLE PRECISION,
    "buffer_days" DOUBLE PRECISION,
    "dscr_annual" DOUBLE PRECISION,
    "credit_headroom" NUMERIC(16,2),
    "suggested_max_emi" NUMERIC(16,2),
    "bridge_headroom" NUMERIC(16,2),
    "net_buffer_days" DOUBLE PRECISION,
    "forecast_net_90d_p10" NUMERIC(16,2),
    "forecast_net_90d_p50" NUMERIC(16,2),
    "forecast_net_90d_p90" NUMERIC(16,2),
    "reason_1" TEXT,
    "reason_1_contrib" DOUBLE PRECISION,
    "reason_2" TEXT,
    "reason_2_contrib" DOUBLE PRECISION,
    "reason_3" TEXT,
    "reason_3_contrib" DOUBLE PRECISION,
    "fusion_weights" TEXT,
    "model_id" TEXT,
    "rule_version" TEXT,
    PRIMARY KEY ("assessment_id"),
    CHECK (risk_tier IN ('GREEN','AMBER','RED')),
    CHECK (fused_score BETWEEN 0 AND 1)
);
COMMENT ON COLUMN dhansetu.risk_assessments."credit_headroom" IS 'Driven by cash flow/uncertainty/behaviour, NOT by risk_tier.';
COMMENT ON COLUMN dhansetu.risk_assessments."bridge_headroom" IS 'Short-tenor facility; stays positive in distress by design.';

CREATE TABLE dhansetu.forecasts (
    "enterprise_id" TEXT NOT NULL,
    "origin_date" DATE NOT NULL,
    "horizon_days" INTEGER NOT NULL,
    "horizon_label" TEXT,
    "quantile" DOUBLE PRECISION NOT NULL,
    "model_id" TEXT,
    "value" NUMERIC(16,2),
    "actual_net" NUMERIC(16,2),
    "is_out_of_time" BOOLEAN,
    "is_live_forecast" BOOLEAN,
    PRIMARY KEY ("enterprise_id", "origin_date", "horizon_days", "quantile"),
    CHECK (quantile IN (0.1, 0.5, 0.9)),
    CHECK (horizon_days IN (30,60,90,120,150,180))
);
COMMENT ON TABLE dhansetu.forecasts IS 'Vintage quantile forecasts: origin x horizon x quantile.';
COMMENT ON COLUMN dhansetu.forecasts."origin_date" IS 'Vintage. Backtesting = filtering on this column.';
COMMENT ON COLUMN dhansetu.forecasts."is_live_forecast" IS 'TRUE = forward call with no actual yet. This is what the officer acts on.';

CREATE TABLE dhansetu.alerts (
    "alert_id" TEXT NOT NULL,
    "assessment_id" TEXT,
    "enterprise_id" TEXT,
    "as_of" DATE,
    "sector" TEXT,
    "district_id" INTEGER,
    "prob_stress" DOUBLE PRECISION,
    "prob_missed_repayment" DOUBLE PRECISION,
    "rule_score" DOUBLE PRECISION,
    "fused_score" DOUBLE PRECISION,
    "risk_tier" TEXT,
    "tier_cutoffs" TEXT,
    "band_width" NUMERIC(16,2),
    "low_visibility" BOOLEAN,
    "data_completeness" DOUBLE PRECISION,
    "buffer_days" DOUBLE PRECISION,
    "dscr_annual" DOUBLE PRECISION,
    "credit_headroom" NUMERIC(16,2),
    "suggested_max_emi" NUMERIC(16,2),
    "bridge_headroom" NUMERIC(16,2),
    "net_buffer_days" DOUBLE PRECISION,
    "forecast_net_90d_p10" NUMERIC(16,2),
    "forecast_net_90d_p50" NUMERIC(16,2),
    "forecast_net_90d_p90" NUMERIC(16,2),
    "reason_1" TEXT,
    "reason_1_contrib" DOUBLE PRECISION,
    "reason_2" TEXT,
    "reason_2_contrib" DOUBLE PRECISION,
    "reason_3" TEXT,
    "reason_3_contrib" DOUBLE PRECISION,
    "fusion_weights" TEXT,
    "model_id" TEXT,
    "rule_version" TEXT,
    "raised_at" DATE,
    "projected_shortfall" NUMERIC(16,2),
    "shortfall_week_of" TEXT,
    "deadline_date" DATE,
    "expires_at" DATE,
    "merchant_visible" BOOLEAN,
    "exported_to_bureau" BOOLEAN,
    "disputed_at" DATE,
    PRIMARY KEY ("alert_id"),
    CHECK (risk_tier IN ('AMBER','RED')),
    CHECK (exported_to_bureau = false)
);

CREATE TABLE dhansetu.recommendations (
    "recommendation_id" TEXT NOT NULL,
    "alert_id" TEXT,
    "enterprise_id" TEXT,
    "rank" INTEGER,
    "mechanism" TEXT,
    "action_key" TEXT,
    "params" TEXT,
    "audience" TEXT,
    "rendered_lang" TEXT,
    PRIMARY KEY ("recommendation_id"),
    CHECK (rank BETWEEN 1 AND 3)
);

CREATE TABLE dhansetu.officer_tasks (
    "task_id" TEXT NOT NULL,
    "alert_id" TEXT,
    "enterprise_id" TEXT,
    "officer_id" TEXT,
    "assigned_on" DATE,
    "priority_score" DOUBLE PRECISION,
    "status" TEXT,
    PRIMARY KEY ("task_id")
);

CREATE TABLE dhansetu.visit_outcomes (
    "outcome_id" TEXT NOT NULL,
    "task_id" TEXT,
    "enterprise_id" TEXT,
    "visited_on" DATE,
    "outcome" TEXT,
    "intervention" TEXT,
    "officer_note_lang" TEXT,
    "becomes_training_label" BOOLEAN,
    PRIMARY KEY ("outcome_id")
);

CREATE TABLE dhansetu.consent_artifacts (
    "consent_id" TEXT NOT NULL,
    "enterprise_id" TEXT,
    "purpose" TEXT,
    "tier_granted" INTEGER,
    "granted_at" DATE,
    "expires_at" DATE,
    "revoked_at" DATE,
    "artifact_hash" TEXT,
    "basis" TEXT,
    "channel" TEXT,
    PRIMARY KEY ("consent_id"),
    CHECK (tier_granted BETWEEN 0 AND 3),
    CHECK (revoked_at IS NULL OR revoked_at >= granted_at)
);

CREATE TABLE dhansetu.access_grants (
    "grant_id" TEXT NOT NULL,
    "enterprise_id" TEXT,
    "grantee_id" TEXT,
    "tier" INTEGER,
    "valid_from" TEXT,
    "valid_until" TEXT,
    "consent_id" TEXT,
    "reason" TEXT,
    PRIMARY KEY ("grant_id"),
    CHECK (tier BETWEEN 0 AND 3),
    CHECK (valid_until > valid_from)
);

CREATE TABLE dhansetu.audit_log (
    "audit_id" BIGINT NOT NULL,
    "actor_id" TEXT,
    "actor_role" TEXT,
    "action" TEXT,
    "enterprise_id" TEXT,
    "tier_accessed" INTEGER,
    "grant_id" TEXT,
    "occurred_at" TIMESTAMPTZ,
    "merchant_notified" BOOLEAN,
    PRIMARY KEY ("audit_id")
);
COMMENT ON TABLE dhansetu.audit_log IS 'Append-only. Who viewed what, when, under which grant.';

CREATE TABLE dhansetu.eval_lead_time (
    "episode_id" TEXT NOT NULL,
    "enterprise_id" TEXT,
    "first_missed_repayment" TEXT,
    "first_flag" TEXT,
    "lead_days" INTEGER,
    "caught" BOOLEAN,
    PRIMARY KEY ("episode_id")
);

CREATE TABLE dhansetu.eval_reason_code_accuracy (
    "episode_id" TEXT NOT NULL,
    "true_mechanism" TEXT,
    "predicted_1" TEXT,
    "in_top1" BOOLEAN,
    "in_top3" BOOLEAN,
    PRIMARY KEY ("episode_id")
);
