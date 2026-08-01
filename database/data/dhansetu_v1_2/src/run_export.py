import numpy as np, pandas as pd, pickle, sys, json, os
sys.path.insert(0, '/home/claude/dhansetu')
import refdata as R, analyse as A, export as E

OUT = "/home/claude/out/dhansetu_v1_2"
d1 = pickle.load(open('/home/claude/stage1.pkl', 'rb'))
d2 = pickle.load(open('/home/claude/stage2.pkl', 'rb'))
d3 = pickle.load(open('/home/claude/stage3.pkl', 'rb'))
d4 = pickle.load(open('/home/claude/stage4.pkl', 'rb'))

ents, panel, wx, px = d1['ents'], d1['panel'], d1['wx'], d1['px']
ev, scope, loans, sched = d1['ev'], d1['scope'], d1['loans'], d1['sched']
recv, settle, batches = d1['recv'], d1['settle'], d1['batches']
eps, F = d2['eps'], d3['F']
rule_ev, lead, rca, metrics = d3['rule_ev'], d3['lead'], d3['rca'], d3['metrics']
fc, A_, al, recs = d4['fc'], d4['A'], d4['al'], d4['recs']
tasks, outs, cons, grants, audit, me = d4['tasks'], d4['outs'], d4['cons'], d4['grants'], d4['audit'], d4['me']

# ------------------------------------------------------------- dimensions
districts = pd.DataFrame(R.DISTRICTS, columns=[
    "district_id", "district", "state", "language", "agro_zone",
    "annual_rainfall_mm", "cyclone_exposed"])
sectors = pd.DataFrame(R.SECTORS, columns=["sector", "sector_label", "failure_mode"])
sub_types = pd.DataFrame(R.SUB_TYPES, columns=[
    "sub_type_id", "sub_type", "sector", "typical_daily_turnover"])
commodities = pd.DataFrame(R.COMMODITIES, columns=[
    "commodity_id", "commodity", "unit", "base_price", "annual_trend_pct",
    "seasonal_peak_month", "seasonal_amplitude"])
officers = pd.DataFrame(R.OFFICERS, columns=[
    "officer_id", "officer_name", "age", "district_id", "language", "base_town"])
officers = officers.merge(
    ents.groupby("officer_id").size().rename("caseload").reset_index(), on="officer_id")
schemes = pd.DataFrame([(s[0], s[1], "|".join(s[2]), s[3], s[4], s[5], s[6]) for s in R.SCHEMES],
    columns=["scheme_id", "scheme", "sectors", "delta_type", "delta_value",
             "effective_from", "description"])
mechanisms = pd.DataFrame({"mechanism": R.MECHANISMS})
actions = pd.DataFrame(R.ACTIONS, columns=["action_id", "action_key", "template"])
rules = pd.DataFrame([(k, m, w) for k, m, w, _ in A.RULES],
                     columns=["rule_key", "mechanism", "weight"])
rules["rule_version"] = "rules_v1.2_18rules"
market_risks = pd.DataFrame(E.MARKET_RISKS, columns=["sector", "risk_type", "detail", "severity"])
seasonality = pd.concat([
    pd.DataFrame({"sector": s, "month": range(1, 13),
                  "inflow_index": R.SEASONALITY_INFLOW[s],
                  "outflow_index": R.SEASONALITY_OUTFLOW[s]}) for s in R.SEASONALITY_INFLOW])

# ------------------------------------------------------------- enterprises
E_out = ents.rename(columns={"_health": "sim_health_latent",
                             "_stress_script": "sim_stress_script"}).drop(columns=["_seed"])
E_out["is_named_persona"] = E_out["sim_stress_script"].notna()
E_out = E_out.merge(districts[["district_id", "language"]], on="district_id", how="left") \
             .drop(columns=["language"])

# ------------------------------------------------------------- ledger
ledger = panel.rename(columns={"date": "event_date"}).copy()
ledger.insert(0, "ledger_date_id", range(1, len(ledger) + 1))

events_out = ev.drop(columns=["price_commodities"]).copy()
events_out["price_commodities"] = ev["price_commodities"].apply(lambda x: "|".join(x))

# ------------------------------------------------------------- assessments
A_out = A_.copy()
eps_out = eps.copy()
eps_out["causal_drivers"] = eps_out["causal_drivers"].apply(json.dumps)

tables = {
    "_data_dictionary": None,          # filled below
    "districts": districts,
    "sectors": sectors,
    "sub_types": sub_types,
    "sector_seasonality": seasonality,
    "commodities": commodities,
    "officers": officers,
    "schemes": schemes,
    "mechanisms": mechanisms,
    "actions": actions,
    "rules": rules,
    "market_risk_cards": market_risks,
    "enterprises": E_out,
    "daily_ledger": ledger,
    "receivables": recv,
    "receivable_settlements": settle,
    "poultry_batches": batches,
    "loans": loans,
    "repayment_schedule": sched,
    "mandi_prices": px,
    "weather_daily": wx,
    "shock_events": events_out,
    "shock_event_scope": scope,
    "feature_snapshots": F,
    "stress_episodes": eps_out,
    "rule_evaluations": rule_ev,
    "risk_assessments": A_out,
    "forecasts": fc,
    "alerts": al,
    "recommendations": recs,
    "officer_tasks": tasks,
    "visit_outcomes": outs,
    "consent_artifacts": cons,
    "access_grants": grants,
    "audit_log": audit,
    "merchant_entries": me,
    "eval_lead_time": lead,
    "eval_reason_code_accuracy": rca,
}

NOTES = {
    "districts": "Six districts across six states; one per supported language.",
    "sectors": "Five cash-flow physics / failure modes.",
    "sub_types": "Eight business types, mapped into the five sectors.",
    "sector_seasonality": "Month-of-year inflow AND outflow multipliers. Separate curves are what make the dairy squeeze expressible.",
    "commodities": "Price drivers. Joined by (commodity_id, district_id, date) — never by persona.",
    "officers": "Six officers, 42 enterprises each, one district each.",
    "schemes": "Government schemes; deltas are asserted to have actually landed.",
    "mechanisms": "The six named stress mechanisms. Rules and reason codes share this vocabulary.",
    "actions": "Action vocabulary, deliberately DISTINCT from mechanisms.",
    "rules": "18 deterministic rules, three per mechanism, so any mechanism can rank first.",
    "market_risk_cards": "Sector risk narrative cards.",
    "enterprises": "252 enterprises. sim_* columns are simulator metadata and must NEVER be used as model features.",
    "daily_ledger": "252 x 1096 daily rows. drv_* columns are the causal driver decomposition (ground truth, not features).",
    "receivables": "Invoice-level receivables with terms, settlement and write-offs. Absent entirely from v1.1.",
    "receivable_settlements": "Cash actually received against invoices.",
    "poultry_batches": "42-day grow-out batches with dealer-credit feed financing.",
    "loans": "Loan accounts including mid-panel disbursements.",
    "repayment_schedule": "Reducing-balance amortisation. closing_balance is monotonically decreasing per loan.",
    "mandi_prices": "Commodity x district x date price series.",
    "weather_daily": "District x date weather including THI for dairy heat stress.",
    "shock_events": "Ten shocks expanded per district; scope is validated non-empty at build time.",
    "shock_event_scope": "Which enterprises each shock actually touched.",
    "feature_snapshots": "Monthly as_of snapshots. Every feature uses only data at or before as_of.",
    "stress_episodes": "GROUND TRUTH. Causal onset date and true mechanism per episode.",
    "rule_evaluations": "Every rule at every as_of, with fired flag — replayable.",
    "risk_assessments": "Fused score, tier, reason codes, headroom per enterprise per as_of.",
    "forecasts": "Vintage forecasts: origin_date x horizon x quantile. is_live_forecast marks forward calls with no actual yet.",
    "alerts": "AMBER/RED alerts with amount, cause, deadline and expiry. Never exported to a bureau.",
    "recommendations": "Up to three ranked ACTIONS per alert.",
    "officer_tasks": "Triage queue.",
    "visit_outcomes": "Field outcome — the training label that closes the loop.",
    "consent_artifacts": "DPDP-style consent, including revocations.",
    "access_grants": "Time-boxed T2 detail grants.",
    "audit_log": "Who viewed what, when, under which grant.",
    "merchant_entries": "~102k voice/IVR/assisted entries with ASR confidence, sync lag, duplicates and corrections.",
    "eval_lead_time": "Measured early-warning lead time per out-of-time episode.",
    "eval_reason_code_accuracy": "Top reason code vs the simulator's true mechanism.",
}

dd_rows = [("DHANSETU prototype dataset v1.2", "", "")]
dd_rows.append((f"252 enterprises | 6 districts / 6 states / 6 languages | 5 sectors | 8 sub-types | "
                f"1096 days ({R.PANEL_START} to {R.PANEL_END}) | seed {R.SEED}", "", ""))
dd_rows.append(("", "", ""))
dd_rows.append(("table", "rows", "description"))
for k, v in tables.items():
    if v is not None:
        dd_rows.append((k, len(v), NOTES.get(k, "")))
tables["_data_dictionary"] = pd.DataFrame(dd_rows, columns=["DHANSETU v1.2 data dictionary", "rows", "description"])

XLSX_SHEETS = ["_data_dictionary", "districts", "sectors", "sub_types", "sector_seasonality",
               "commodities", "officers", "schemes", "mechanisms", "actions", "rules",
               "market_risk_cards", "enterprises", "shock_events", "poultry_batches",
               "loans", "stress_episodes", "alerts", "recommendations", "visit_outcomes",
               "eval_lead_time", "eval_reason_code_accuracy"]

man = E.write_bundle(tables, OUT, XLSX_SHEETS,
                     "/home/claude/out/dhansetu-prototype-dataset_v1_2.xlsx", NOTES)
print(man[["table", "rows", "cols"]].to_string(index=False))
print("\ntotal bytes:", f"{man.bytes.sum():,}")
pickle.dump(dict(man=man), open('/home/claude/stage5.pkl', 'wb'))
