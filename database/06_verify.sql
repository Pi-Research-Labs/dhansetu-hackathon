-- Expected row counts from the shipped bundle.
SET search_path TO dhansetu, public;
WITH expected(t, n) AS (VALUES
  ('access_grants', 334),
  ('actions', 12),
  ('alerts', 955),
  ('audit_log', 334),
  ('commodities', 10),
  ('consent_artifacts', 252),
  ('daily_ledger', 276192),
  ('districts', 6),
  ('enterprises', 252),
  ('eval_lead_time', 9),
  ('eval_reason_code_accuracy', 192),
  ('feature_snapshots', 8316),
  ('forecasts', 149688),
  ('loans', 232),
  ('mandi_prices', 65760),
  ('market_risk_cards', 16),
  ('mechanisms', 6),
  ('merchant_entries', 102360),
  ('officer_tasks', 955),
  ('officers', 6),
  ('poultry_batches', 630),
  ('receivable_settlements', 25508),
  ('receivables', 26447),
  ('recommendations', 2770),
  ('repayment_schedule', 4439),
  ('risk_assessments', 8316),
  ('rule_evaluations', 149688),
  ('rules', 18),
  ('schemes', 6),
  ('sector_seasonality', 60),
  ('sectors', 5),
  ('shock_event_scope', 440),
  ('shock_events', 25),
  ('stress_episodes', 202),
  ('sub_types', 9),
  ('visit_outcomes', 697),
  ('weather_daily', 6576)
)
SELECT e.t AS table_name, e.n AS expected,
       (SELECT c.reltuples::bigint FROM pg_class c
         JOIN pg_namespace ns ON ns.oid=c.relnamespace
         WHERE ns.nspname='dhansetu' AND c.relname=e.t) AS loaded_estimate
FROM expected e ORDER BY e.t;
