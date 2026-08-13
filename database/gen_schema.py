"""Emit Postgres DDL + COPY statements derived from the actual CSV headers.

Hand-writing DDL for a 76-column table is how load failures happen. This reads
the real files, so column names, order and types cannot drift from the data.
"""
import os, glob, gzip, json
from pathlib import Path

import pandas as pd

# Resolved relative to this file, so `python3 gen_schema.py` works from a clone
# with no arguments. These were absolute paths on the machine the dataset was
# originally generated on, which meant the command documented in README.md could
# not run anywhere else.
#
# Override either with an environment variable to generate against a different
# dataset or write the SQL elsewhere:
#   DHANSETU_DATA_DIR=/path/to/csvs DHANSETU_SQL_OUT=/tmp/out python3 gen_schema.py
_HERE = Path(__file__).resolve().parent
SRC = os.environ.get("DHANSETU_DATA_DIR", str(_HERE / "data" / "dhansetu_v1_2"))
OUT = os.environ.get("DHANSETU_SQL_OUT", str(_HERE))
os.makedirs(OUT, exist_ok=True)

# money-like columns -> NUMERIC(16,2); everything else float -> DOUBLE PRECISION
MONEY = {
    "amount", "balance", "sales_accrued", "cash_inflow", "outflow", "input_cost",
    "household_drawings", "net", "informal_debt", "surplus_deployed", "emi_amount",
    "loan_outstanding", "dealer_credit_outstanding", "principal", "emi_scheduled",
    "subvention", "emi_payable", "interest_component", "principal_component",
    "closing_balance", "placement_cost", "feed_on_dealer_credit", "realisation",
    "credit_headroom", "suggested_max_emi", "bridge_headroom", "band_width",
    "projected_shortfall", "forecast_net_90d_p10", "forecast_net_90d_p50",
    "forecast_net_90d_p90", "value", "actual_net", "actual_net_next_90d",
    "net_30d", "net_90d", "avg_daily_inflow_30d", "noc_365d", "net90_lag12m",
    "net_next90_lag365", "baseline_seasonal_naive", "receivable_due_next_90d",
    "receivable_open_balance", "emi_scheduled_next_90d", "baseline_turnover",
    "modal_price", "realisation_price", "base_price",
}

PK = {
    "districts": ["district_id"], "sectors": ["sector"], "sub_types": ["sub_type_id"],
    "sector_seasonality": ["sector", "month"], "commodities": ["commodity_id"],
    "officers": ["officer_id"], "schemes": ["scheme_id"], "mechanisms": ["mechanism"],
    "actions": ["action_id"], "rules": ["rule_key"],
    "market_risk_cards": ["sector", "risk_type"],
    "enterprises": ["enterprise_id"],
    "daily_ledger": ["enterprise_id", "event_date"],
    "receivables": ["receivable_id"], "receivable_settlements": ["receivable_id"],
    "poultry_batches": ["batch_id"], "loans": ["loan_id"],
    "repayment_schedule": ["loan_id", "installment_no"],
    "mandi_prices": ["commodity_id", "district_id", "price_date"],
    "weather_daily": ["district_id", "obs_date"],
    "shock_events": ["event_id"], "shock_event_scope": ["event_code", "enterprise_id"],
    "feature_snapshots": ["enterprise_id", "as_of"],
    "stress_episodes": ["episode_id"],
    "rule_evaluations": ["enterprise_id", "as_of", "rule_key"],
    "risk_assessments": ["assessment_id"],
    "forecasts": ["enterprise_id", "origin_date", "horizon_days", "quantile"],
    "alerts": ["alert_id"], "recommendations": ["recommendation_id"],
    "officer_tasks": ["task_id"], "visit_outcomes": ["outcome_id"],
    "consent_artifacts": ["consent_id"], "access_grants": ["grant_id"],
    "audit_log": ["audit_id"], "merchant_entries": ["entry_id"],
    "eval_lead_time": ["episode_id"], "eval_reason_code_accuracy": ["episode_id"],
}

# (table, column, referenced) — applied AFTER load so one bad row can't abort it
FK = [
    ("enterprises", "district_id", "districts(district_id)"),
    ("enterprises", "sector", "sectors(sector)"),
    ("enterprises", "sub_type_id", "sub_types(sub_type_id)"),
    ("enterprises", "officer_id", "officers(officer_id)"),
    ("sub_types", "sector", "sectors(sector)"),
    ("sector_seasonality", "sector", "sectors(sector)"),
    ("officers", "district_id", "districts(district_id)"),
    ("rules", "mechanism", "mechanisms(mechanism)"),
    ("market_risk_cards", "sector", "sectors(sector)"),
    ("daily_ledger", "enterprise_id", "enterprises(enterprise_id)"),
    ("receivables", "enterprise_id", "enterprises(enterprise_id)"),
    ("receivable_settlements", "receivable_id", "receivables(receivable_id)"),
    ("poultry_batches", "enterprise_id", "enterprises(enterprise_id)"),
    ("loans", "enterprise_id", "enterprises(enterprise_id)"),
    ("repayment_schedule", "loan_id", "loans(loan_id)"),
    ("mandi_prices", "commodity_id", "commodities(commodity_id)"),
    ("mandi_prices", "district_id", "districts(district_id)"),
    ("weather_daily", "district_id", "districts(district_id)"),
    ("shock_events", "district_id", "districts(district_id)"),
    ("shock_event_scope", "enterprise_id", "enterprises(enterprise_id)"),
    ("feature_snapshots", "enterprise_id", "enterprises(enterprise_id)"),
    ("stress_episodes", "enterprise_id", "enterprises(enterprise_id)"),
    ("stress_episodes", "mechanism", "mechanisms(mechanism)"),
    ("rule_evaluations", "enterprise_id", "enterprises(enterprise_id)"),
    ("rule_evaluations", "rule_key", "rules(rule_key)"),
    ("rule_evaluations", "mechanism", "mechanisms(mechanism)"),
    ("risk_assessments", "enterprise_id", "enterprises(enterprise_id)"),
    ("forecasts", "enterprise_id", "enterprises(enterprise_id)"),
    ("alerts", "assessment_id", "risk_assessments(assessment_id)"),
    ("alerts", "enterprise_id", "enterprises(enterprise_id)"),
    ("recommendations", "alert_id", "alerts(alert_id)"),
    ("recommendations", "mechanism", "mechanisms(mechanism)"),
    ("officer_tasks", "alert_id", "alerts(alert_id)"),
    ("officer_tasks", "officer_id", "officers(officer_id)"),
    ("visit_outcomes", "task_id", "officer_tasks(task_id)"),
    ("consent_artifacts", "enterprise_id", "enterprises(enterprise_id)"),
    ("access_grants", "consent_id", "consent_artifacts(consent_id)"),
    ("access_grants", "enterprise_id", "enterprises(enterprise_id)"),
    ("audit_log", "grant_id", "access_grants(grant_id)"),
    ("merchant_entries", "enterprise_id", "enterprises(enterprise_id)"),
    ("eval_lead_time", "episode_id", "stress_episodes(episode_id)"),
    ("eval_reason_code_accuracy", "episode_id", "stress_episodes(episode_id)"),
]

CHECKS = {
    "risk_assessments": ["CHECK (risk_tier IN ('GREEN','AMBER','RED'))",
                         "CHECK (fused_score BETWEEN 0 AND 1)"],
    "alerts": ["CHECK (risk_tier IN ('AMBER','RED'))",
               "CHECK (exported_to_bureau = false)"],
    "forecasts": ["CHECK (quantile IN (0.1, 0.5, 0.9))",
                  "CHECK (horizon_days IN (30,60,90,120,150,180))"],
    "consent_artifacts": ["CHECK (tier_granted BETWEEN 0 AND 3)",
                          "CHECK (revoked_at IS NULL OR revoked_at >= granted_at)"],
    "access_grants": ["CHECK (tier BETWEEN 0 AND 3)", "CHECK (valid_until > valid_from)"],
    "recommendations": ["CHECK (rank BETWEEN 1 AND 3)"],
    "receivables": ["CHECK (due_date >= invoice_date)", "CHECK (amount > 0)"],
    "sector_seasonality": ["CHECK (month BETWEEN 1 AND 12)"],
}

COMMENTS = {
    ("enterprises", "sim_health_latent"):
        "SIMULATOR GROUND TRUTH — never use as a model feature (label leakage).",
    ("enterprises", "sim_stress_script"):
        "SIMULATOR GROUND TRUTH — never use as a model feature (label leakage).",
    ("stress_episodes", "mechanism"):
        "TRUE cause from the simulator. This is what makes reason codes scorable.",
    ("stress_episodes", "causal_drivers"):
        "JSON of driver deviation scores that produced the episode.",
    ("feature_snapshots", "as_of"):
        "Point-in-time cutoff. Every column uses only data at or before this date.",
    ("forecasts", "origin_date"):
        "Vintage. Backtesting = filtering on this column.",
    ("forecasts", "is_live_forecast"):
        "TRUE = forward call with no actual yet. This is what the officer acts on.",
    ("risk_assessments", "credit_headroom"):
        "Driven by cash flow/uncertainty/behaviour, NOT by risk_tier.",
    ("risk_assessments", "bridge_headroom"):
        "Short-tenor facility; stays positive in distress by design.",
    ("daily_ledger", "batch_id"):
        "No FK: batches in progress at panel end have no realisation row yet.",
}

TABLE_COMMENTS = {
    "stress_episodes": "GROUND TRUTH labels. Causal onset date and true mechanism.",
    "feature_snapshots": "Point-in-time feature store, monthly as_of snapshots.",
    "forecasts": "Vintage quantile forecasts: origin x horizon x quantile.",
    "daily_ledger": "Daily cash ledger. drv_* columns are simulator internals.",
    "merchant_entries": "Voice/IVR/assisted capture log with ASR confidence and sync lag.",
    "audit_log": "Append-only. Who viewed what, when, under which grant.",
}

DROP_ORDER = [
    "eval_reason_code_accuracy", "eval_lead_time", "audit_log", "access_grants",
    "consent_artifacts", "visit_outcomes", "officer_tasks", "recommendations",
    "alerts", "forecasts", "risk_assessments", "rule_evaluations", "stress_episodes",
    "feature_snapshots", "merchant_entries", "shock_event_scope", "shock_events",
    "weather_daily", "mandi_prices", "repayment_schedule", "loans", "poultry_batches",
    "receivable_settlements", "receivables", "daily_ledger", "enterprises",
    "market_risk_cards", "rules", "actions", "mechanisms", "schemes", "officers",
    "commodities", "sector_seasonality", "sub_types", "sectors", "districts",
]


def pg_type(table, col, dtype, sample):
    if col == "batch_id" and table == "daily_ledger":
        return "TEXT"
    if dtype == "bool":
        return "BOOLEAN"
    low = col.lower()
    is_temporal = (low.endswith(("_date", "_on", "_at")) or low in
                   ("as_of", "obs_date", "month_end", "onboarded_on", "granted_at"))
    if is_temporal and dtype in ("object", "str", "string"):
        return "TIMESTAMPTZ" if (isinstance(sample, str) and ":" in sample) else "DATE"
    if dtype.startswith("int"):
        return "BIGINT" if low in ("audit_id", "ledger_date_id") else "INTEGER"
    if dtype.startswith("float"):
        return f"NUMERIC(16,2)" if low in MONEY else "DOUBLE PRECISION"
    return "TEXT"


def read_head(p):
    return pd.read_csv(p, nrows=6000, low_memory=False)


def main():
    files = {}
    for p in sorted(glob.glob(f"{SRC}/*.csv")) + sorted(glob.glob(f"{SRC}/*.csv.gz")):
        base = os.path.basename(p).replace(".csv.gz", "").replace(".csv", "")
        if base.startswith("_"):
            continue
        files[base] = p

    ddl = ["-- DHANSETU v1.2 — schema, generated from the shipped CSVs.",
           "-- Regenerate with gen_schema.py; do not hand-edit column lists.", "",
           "CREATE SCHEMA IF NOT EXISTS dhansetu;", "SET search_path TO dhansetu, public;", ""]
    ddl.append("-- drop in dependency order so re-runs are clean")
    for t in DROP_ORDER:
        ddl.append(f"DROP TABLE IF EXISTS dhansetu.{t} CASCADE;")
    ddl.append("")

    copy_stmts, counts, colmap = [], {}, {}
    order = [t for t in reversed(DROP_ORDER) if t in files]
    order += [t for t in files if t not in order]

    for t in order:
        p = files[t]
        df = read_head(p)
        colmap[t] = list(df.columns)
        n = sum(1 for _ in (gzip.open(p, "rt") if p.endswith(".gz") else open(p))) - 1
        counts[t] = n
        lines = []
        for c in df.columns:
            s = df[c].dropna()
            sample = s.iloc[0] if len(s) else None
            typ = pg_type(t, c, str(df[c].dtype), sample)
            notnull = " NOT NULL" if df[c].isna().sum() == 0 and c in PK.get(t, []) else ""
            lines.append(f'    "{c}" {typ}{notnull}')
        if t in PK:
            cols = ", ".join(f'"{c}"' for c in PK[t])
            lines.append(f"    PRIMARY KEY ({cols})")
        for ch in CHECKS.get(t, []):
            lines.append(f"    {ch}")
        ddl.append(f"CREATE TABLE dhansetu.{t} (")
        ddl.append(",\n".join(lines))
        ddl.append(");")
        if t in TABLE_COMMENTS:
            ddl.append(f"COMMENT ON TABLE dhansetu.{t} IS {sql_str(TABLE_COMMENTS[t])};")
        for (tt, cc), txt in COMMENTS.items():
            if tt == t:
                ddl.append(f'COMMENT ON COLUMN dhansetu.{t}."{cc}" IS {sql_str(txt)};')
        ddl.append("")

        cols = ", ".join(f'"{c}"' for c in df.columns)
        fname = os.path.basename(p).replace(".gz", "")
        copy_stmts.append(
            f"\\echo 'loading {t} ({n:,} rows)'\n"
            f"\\copy dhansetu.{t} ({cols}) FROM '{fname}' "
            f"WITH (FORMAT csv, HEADER true, NULL '')")

    open(f"{OUT}/01_schema.sql", "w").write("\n".join(ddl))

    load = ["-- Load all tables. Run from the data directory:",
            "--   cd dhansetu_v1_2 && psql -d dhansetu -v ON_ERROR_STOP=1 -f ../dhansetu_db/02_load.sql",
            "SET search_path TO dhansetu, public;", ""] + copy_stmts
    open(f"{OUT}/02_load.sql", "w").write("\n".join(load) + "\n")

    con = ["-- Foreign keys and indexes. Run AFTER 02_load.sql.",
           "-- Kept separate so a single bad row cannot abort the whole load.",
           "SET search_path TO dhansetu, public;", ""]
    for t, c, ref in FK:
        if t in files:
            con.append(f'ALTER TABLE dhansetu.{t} ADD CONSTRAINT fk_{t}_{c} '
                       f'FOREIGN KEY ("{c}") REFERENCES dhansetu.{ref};')
    con.append("")
    idx = [
        ("daily_ledger", '("enterprise_id", "event_date")'),
        ("daily_ledger", '("event_date")'),
        ("daily_ledger", '("district_id", "event_date")'),
        ("feature_snapshots", '("as_of")'),
        ("risk_assessments", '("as_of", "risk_tier")'),
        ("risk_assessments", '("enterprise_id", "as_of" DESC)'),
        ("forecasts", '("enterprise_id", "origin_date", "horizon_days")'),
        ("forecasts", '("origin_date") WHERE "is_live_forecast"'),
        ("alerts", '("enterprise_id", "raised_at" DESC)'),
        ("alerts", '("risk_tier", "raised_at" DESC)'),
        ("recommendations", '("alert_id", "rank")'),
        ("officer_tasks", '("officer_id", "status")'),
        ("rule_evaluations", '("enterprise_id", "as_of") WHERE "fired"'),
        ("receivables", '("enterprise_id", "due_date")'),
        ("merchant_entries", '("enterprise_id", "entry_date")'),
        ("stress_episodes", '("enterprise_id", "onset_date")'),
        ("mandi_prices", '("commodity_id", "district_id", "price_date" DESC)'),
    ]
    for i, (t, cols) in enumerate(idx):
        if t in files:
            con.append(f"CREATE INDEX IF NOT EXISTS ix_{t}_{i} ON dhansetu.{t} {cols};")
    con += ["", "ANALYZE;"]
    open(f"{OUT}/03_constraints_indexes.sql", "w").write("\n".join(con) + "\n")

    ver = ["-- Expected row counts from the shipped bundle.",
           "SET search_path TO dhansetu, public;",
           "WITH expected(t, n) AS (VALUES"]
    ver.append(",\n".join(f"  ('{t}', {n})" for t, n in sorted(counts.items())))
    ver += [")", "SELECT e.t AS table_name, e.n AS expected,",
            "       (SELECT c.reltuples::bigint FROM pg_class c",
            "         JOIN pg_namespace ns ON ns.oid=c.relnamespace",
            "         WHERE ns.nspname='dhansetu' AND c.relname=e.t) AS loaded_estimate",
            "FROM expected e ORDER BY e.t;"]
    open(f"{OUT}/05_verify.sql", "w").write("\n".join(ver) + "\n")

    json.dump({"counts": counts, "columns": colmap},
              open(f"{OUT}/_schema_manifest.json", "w"), indent=1)
    print(f"tables: {len(files)}  total rows: {sum(counts.values()):,}")
    for t in order:
        print(f"  {t:28s} {counts[t]:>8,} rows, {len(colmap[t]):>2} cols")


def sql_str(s):
    return "'" + s.replace("'", "''") + "'"


if __name__ == "__main__":
    main()
