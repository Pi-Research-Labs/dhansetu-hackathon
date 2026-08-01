-- Load all tables. Run from the data directory:
--   cd dhansetu_v1_2 && psql -d dhansetu -v ON_ERROR_STOP=1 -f ../dhansetu_db/02_load.sql
SET search_path TO dhansetu, public;

\echo 'loading districts (6 rows)'
\copy dhansetu.districts ("district_id", "district", "state", "language", "agro_zone", "annual_rainfall_mm", "cyclone_exposed") FROM 'districts.csv' WITH (FORMAT csv, HEADER true, NULL '')
\echo 'loading sectors (5 rows)'
\copy dhansetu.sectors ("sector", "sector_label", "failure_mode") FROM 'sectors.csv' WITH (FORMAT csv, HEADER true, NULL '')
\echo 'loading sub_types (9 rows)'
\copy dhansetu.sub_types ("sub_type_id", "sub_type", "sector", "typical_daily_turnover") FROM 'sub_types.csv' WITH (FORMAT csv, HEADER true, NULL '')
\echo 'loading sector_seasonality (60 rows)'
\copy dhansetu.sector_seasonality ("sector", "month", "inflow_index", "outflow_index") FROM 'sector_seasonality.csv' WITH (FORMAT csv, HEADER true, NULL '')
\echo 'loading commodities (10 rows)'
\copy dhansetu.commodities ("commodity_id", "commodity", "unit", "base_price", "annual_trend_pct", "seasonal_peak_month", "seasonal_amplitude") FROM 'commodities.csv' WITH (FORMAT csv, HEADER true, NULL '')
\echo 'loading officers (6 rows)'
\copy dhansetu.officers ("officer_id", "officer_name", "age", "district_id", "language", "base_town", "caseload") FROM 'officers.csv' WITH (FORMAT csv, HEADER true, NULL '')
\echo 'loading schemes (6 rows)'
\copy dhansetu.schemes ("scheme_id", "scheme", "sectors", "delta_type", "delta_value", "effective_from", "description") FROM 'schemes.csv' WITH (FORMAT csv, HEADER true, NULL '')
\echo 'loading mechanisms (6 rows)'
\copy dhansetu.mechanisms ("mechanism") FROM 'mechanisms.csv' WITH (FORMAT csv, HEADER true, NULL '')
\echo 'loading actions (12 rows)'
\copy dhansetu.actions ("action_id", "action_key", "template") FROM 'actions.csv' WITH (FORMAT csv, HEADER true, NULL '')
\echo 'loading rules (18 rows)'
\copy dhansetu.rules ("rule_key", "mechanism", "weight", "rule_version") FROM 'rules.csv' WITH (FORMAT csv, HEADER true, NULL '')
\echo 'loading market_risk_cards (16 rows)'
\copy dhansetu.market_risk_cards ("sector", "risk_type", "detail", "severity") FROM 'market_risk_cards.csv' WITH (FORMAT csv, HEADER true, NULL '')
\echo 'loading enterprises (252 rows)'
\copy dhansetu.enterprises ("enterprise_id", "proprietor_name", "business_name", "age", "sub_type_id", "sub_type", "sector", "district_id", "district", "state", "agro_zone", "block", "lat", "lon", "preferred_lang", "preferred_channel", "literacy", "shared_device", "officer_id", "shg_id", "onboarded_on", "baseline_turnover", "sim_health_latent", "digital_share_start", "digital_share_slope", "sim_stress_script", "is_named_persona") FROM 'enterprises.csv' WITH (FORMAT csv, HEADER true, NULL '')
\echo 'loading daily_ledger (276,192 rows)'
\copy dhansetu.daily_ledger ("ledger_date_id", "event_date", "enterprise_id", "sector", "sub_type", "district_id", "district", "sales_accrued", "cash_inflow", "outflow", "input_cost", "household_drawings", "net", "balance", "informal_debt", "surplus_deployed", "txn_count", "emi_due", "emi_amount", "emi_paid", "loan_outstanding", "dealer_credit_outstanding", "batch_id", "batch_day", "upi_share", "wallet_share", "digital_share", "rev_price_index", "cost_price_index", "thi", "rain_anomaly_pct", "festival_index", "event_code", "drv_seasonality", "drv_climate", "drv_price_revenue", "drv_price_cost", "drv_demand", "drv_event") FROM 'daily_ledger.csv' WITH (FORMAT csv, HEADER true, NULL '')
\echo 'loading receivables (26,447 rows)'
\copy dhansetu.receivables ("receivable_id", "enterprise_id", "counterparty_ref", "counterparty_type", "invoice_date", "due_date", "amount", "is_informal", "settled_on", "write_off") FROM 'receivables.csv' WITH (FORMAT csv, HEADER true, NULL '')
\echo 'loading receivable_settlements (25,508 rows)'
\copy dhansetu.receivable_settlements ("receivable_id", "enterprise_id", "settled_on", "amount") FROM 'receivable_settlements.csv' WITH (FORMAT csv, HEADER true, NULL '')
\echo 'loading poultry_batches (630 rows)'
\copy dhansetu.poultry_batches ("batch_id", "enterprise_id", "placed_on", "realised_on", "grow_days", "chicks_placed", "placement_cost", "feed_on_dealer_credit", "realisation", "realisation_price") FROM 'poultry_batches.csv' WITH (FORMAT csv, HEADER true, NULL '')
\echo 'loading loans (232 rows)'
\copy dhansetu.loans ("loan_id", "enterprise_id", "lender", "principal", "annual_rate_bps", "tenor_months", "disbursed_on", "scheme_id") FROM 'loans.csv' WITH (FORMAT csv, HEADER true, NULL '')
\echo 'loading repayment_schedule (4,439 rows)'
\copy dhansetu.repayment_schedule ("loan_id", "enterprise_id", "installment_no", "due_date", "emi_scheduled", "subvention", "emi_payable", "interest_component", "principal_component", "closing_balance") FROM 'repayment_schedule.csv' WITH (FORMAT csv, HEADER true, NULL '')
\echo 'loading mandi_prices (65,760 rows)'
\copy dhansetu.mandi_prices ("commodity_id", "district_id", "price_date", "modal_price", "unit", "source") FROM 'mandi_prices.csv' WITH (FORMAT csv, HEADER true, NULL '')
\echo 'loading weather_daily (6,576 rows)'
\copy dhansetu.weather_daily ("district_id", "obs_date", "rainfall_mm", "temp_max_c", "humidity_pct", "thi", "rain_30d", "rain_anomaly_pct", "source") FROM 'weather_daily.csv' WITH (FORMAT csv, HEADER true, NULL '')
\echo 'loading shock_events (25 rows)'
\copy dhansetu.shock_events ("event_id", "event_code", "event_type", "district_id", "start_date", "end_date", "duration_days", "sectors", "inflow_mult", "outflow_mult", "price_mult", "severity", "description", "price_commodities") FROM 'shock_events.csv' WITH (FORMAT csv, HEADER true, NULL '')
\echo 'loading shock_event_scope (440 rows)'
\copy dhansetu.shock_event_scope ("event_code", "enterprise_id") FROM 'shock_event_scope.csv' WITH (FORMAT csv, HEADER true, NULL '')
\echo 'loading merchant_entries (102,360 rows)'
\copy dhansetu.merchant_entries ("entry_id", "enterprise_id", "entry_date", "recorded_at", "synced_at", "sync_lag_days", "entry_type", "amount", "note_text", "note_lang", "source", "asr_confidence", "is_household", "corrects_entry_id", "is_suspected_duplicate") FROM 'merchant_entries.csv' WITH (FORMAT csv, HEADER true, NULL '')
\echo 'loading feature_snapshots (8,316 rows)'
\copy dhansetu.feature_snapshots ("enterprise_id", "as_of", "sector", "district_id", "receivable_due_next_90d", "receivable_open_balance", "emi_scheduled_next_90d", "rain_anomaly_90d", "season_drop_3m", "inflow_trend_90d", "balance", "buffer_days", "net_buffer_days", "net_30d", "net_90d", "avg_daily_inflow_30d", "zero_inflow_days_30d", "inflow_cv_90d", "outflow_inflow_30d", "outflow_inflow_90d", "cost_index_chg_90d", "rev_index_chg_90d", "margin_gap_90d", "dso_days", "overdue_share", "receivable_aged_90d_share", "buyer_concentration", "loan_outstanding", "emi_burden_365d", "missed_emis_90d", "missed_emis_365d", "dscr_annual", "informal_debt", "noc_365d", "dscr_annual_raw", "season_index_now", "season_index_fwd3", "thi_90d", "thi_anomaly_90d", "digital_share", "data_completeness", "event_days_90d", "actual_net_next_90d", "stress_within_90d", "days_to_onset", "missed_repayment_within_90d", "days_to_missed_repayment", "net_next90_lag365", "buffer_days_lag3m", "buffer_days_delta_3m", "net90_lag12m", "sales_yoy", "dso_delta_3m", "prob_stress", "prob_missed_repayment", "model_prob", "model_prob_default", "forecast_net_90d_p10", "forecast_net_90d_p50", "forecast_net_90d_p90", "baseline_seasonal_naive", "rule_score", "fused_score", "risk_tier", "tier_cutoffs", "band_width", "low_visibility", "reason_1", "reason_1_contrib", "reason_2", "reason_2_contrib", "reason_3", "reason_3_contrib", "credit_headroom", "suggested_max_emi", "bridge_headroom") FROM 'feature_snapshots.csv' WITH (FORMAT csv, HEADER true, NULL '')
\echo 'loading stress_episodes (202 rows)'
\copy dhansetu.stress_episodes ("episode_id", "enterprise_id", "onset_date", "resolution_date", "first_missed_repayment", "duration_days", "mechanism", "severity", "min_buffer_days", "causal_drivers", "label_source") FROM 'stress_episodes.csv' WITH (FORMAT csv, HEADER true, NULL '')
\echo 'loading rule_evaluations (149,688 rows)'
\copy dhansetu.rule_evaluations ("enterprise_id", "as_of", "rule_key", "mechanism", "weight", "fired") FROM 'rule_evaluations.csv' WITH (FORMAT csv, HEADER true, NULL '')
\echo 'loading risk_assessments (8,316 rows)'
\copy dhansetu.risk_assessments ("assessment_id", "enterprise_id", "as_of", "sector", "district_id", "prob_stress", "prob_missed_repayment", "rule_score", "fused_score", "risk_tier", "tier_cutoffs", "band_width", "low_visibility", "data_completeness", "buffer_days", "dscr_annual", "credit_headroom", "suggested_max_emi", "bridge_headroom", "net_buffer_days", "forecast_net_90d_p10", "forecast_net_90d_p50", "forecast_net_90d_p90", "reason_1", "reason_1_contrib", "reason_2", "reason_2_contrib", "reason_3", "reason_3_contrib", "fusion_weights", "model_id", "rule_version") FROM 'risk_assessments.csv' WITH (FORMAT csv, HEADER true, NULL '')
\echo 'loading forecasts (149,688 rows)'
\copy dhansetu.forecasts ("enterprise_id", "origin_date", "horizon_days", "horizon_label", "quantile", "model_id", "value", "actual_net", "is_out_of_time", "is_live_forecast") FROM 'forecasts.csv' WITH (FORMAT csv, HEADER true, NULL '')
\echo 'loading alerts (955 rows)'
\copy dhansetu.alerts ("alert_id", "assessment_id", "enterprise_id", "as_of", "sector", "district_id", "prob_stress", "prob_missed_repayment", "rule_score", "fused_score", "risk_tier", "tier_cutoffs", "band_width", "low_visibility", "data_completeness", "buffer_days", "dscr_annual", "credit_headroom", "suggested_max_emi", "bridge_headroom", "net_buffer_days", "forecast_net_90d_p10", "forecast_net_90d_p50", "forecast_net_90d_p90", "reason_1", "reason_1_contrib", "reason_2", "reason_2_contrib", "reason_3", "reason_3_contrib", "fusion_weights", "model_id", "rule_version", "raised_at", "projected_shortfall", "shortfall_week_of", "deadline_date", "expires_at", "merchant_visible", "exported_to_bureau", "disputed_at") FROM 'alerts.csv' WITH (FORMAT csv, HEADER true, NULL '')
\echo 'loading recommendations (2,770 rows)'
\copy dhansetu.recommendations ("recommendation_id", "alert_id", "enterprise_id", "rank", "mechanism", "action_key", "params", "audience", "rendered_lang") FROM 'recommendations.csv' WITH (FORMAT csv, HEADER true, NULL '')
\echo 'loading officer_tasks (955 rows)'
\copy dhansetu.officer_tasks ("task_id", "alert_id", "enterprise_id", "officer_id", "assigned_on", "priority_score", "status") FROM 'officer_tasks.csv' WITH (FORMAT csv, HEADER true, NULL '')
\echo 'loading visit_outcomes (697 rows)'
\copy dhansetu.visit_outcomes ("outcome_id", "task_id", "enterprise_id", "visited_on", "outcome", "intervention", "officer_note_lang", "becomes_training_label") FROM 'visit_outcomes.csv' WITH (FORMAT csv, HEADER true, NULL '')
\echo 'loading consent_artifacts (252 rows)'
\copy dhansetu.consent_artifacts ("consent_id", "enterprise_id", "purpose", "tier_granted", "granted_at", "expires_at", "revoked_at", "artifact_hash", "basis", "channel") FROM 'consent_artifacts.csv' WITH (FORMAT csv, HEADER true, NULL '')
\echo 'loading access_grants (334 rows)'
\copy dhansetu.access_grants ("grant_id", "enterprise_id", "grantee_id", "tier", "valid_from", "valid_until", "consent_id", "reason") FROM 'access_grants.csv' WITH (FORMAT csv, HEADER true, NULL '')
\echo 'loading audit_log (334 rows)'
\copy dhansetu.audit_log ("audit_id", "actor_id", "actor_role", "action", "enterprise_id", "tier_accessed", "grant_id", "occurred_at", "merchant_notified") FROM 'audit_log.csv' WITH (FORMAT csv, HEADER true, NULL '')
\echo 'loading eval_lead_time (9 rows)'
\copy dhansetu.eval_lead_time ("episode_id", "enterprise_id", "first_missed_repayment", "first_flag", "lead_days", "caught") FROM 'eval_lead_time.csv' WITH (FORMAT csv, HEADER true, NULL '')
\echo 'loading eval_reason_code_accuracy (192 rows)'
\copy dhansetu.eval_reason_code_accuracy ("episode_id", "true_mechanism", "predicted_1", "in_top1", "in_top3") FROM 'eval_reason_code_accuracy.csv' WITH (FORMAT csv, HEADER true, NULL '')
