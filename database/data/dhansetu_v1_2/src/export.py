"""
DHANSETU v1.2 — derived tables and export.

Emits one CSV per table plus a manifest, and an xlsx containing the dimension
tables and samples for eyeballing. The full daily ledger stays in CSV: a 276k-row
sheet in a single workbook is not reviewable or diffable.
"""
import hashlib
import json
import numpy as np
import pandas as pd
import refdata as R
from analyse import FEATS, LAG_FEATS, SPLIT_DATE

HORIZONS = [30, 60, 90, 120, 150, 180]
QUANTILES = [0.10, 0.50, 0.90]


# --------------------------------------------------------------------------
# multi-horizon vintage forecasts  (the M1-M6 confidence band)
# --------------------------------------------------------------------------

def build_forecasts(F, panel):
    """Direct multi-horizon quantile forecasts at monthly origins.

    Separate models per horizon, not recursion: recursive forecasting compounds
    its own error over six steps. Each row carries its origin date, so the whole
    table is a set of vintages and a backtest is a filter on origin_date.
    """
    from sklearn.ensemble import HistGradientBoostingRegressor

    panel = panel.sort_values(["enterprise_id", "date"])
    nets = {e: g.set_index("date")["net"] for e, g in panel.groupby("enterprise_id")}

    # forward actuals per horizon
    tgt = {}
    for h in HORIZONS:
        vals = []
        for eid, a in zip(F["enterprise_id"], F["as_of"]):
            s = nets[eid].loc[a + pd.Timedelta(days=1): a + pd.Timedelta(days=h)]
            vals.append(s.sum() if len(s) >= h * 0.7 else np.nan)
        tgt[h] = np.array(vals, dtype=float)

    feats = FEATS + LAG_FEATS
    X = F[feats].astype(float).replace([np.inf, -np.inf], np.nan).fillna(0.0)
    tr = (F["as_of"] <= SPLIT_DATE).to_numpy()
    cal_cut = SPLIT_DATE - pd.DateOffset(months=6)
    fit = (F["as_of"] <= cal_cut).to_numpy()
    cal = tr & ~fit

    rows = []
    diag = {}
    for h in HORIZONS:
        y = tgt[h]
        m = ~np.isnan(y)
        preds = {}
        for q in QUANTILES:
            reg = HistGradientBoostingRegressor(
                loss="quantile", quantile=q, max_depth=4, learning_rate=0.05,
                max_iter=250, l2_regularization=1.0, random_state=7)
            reg.fit(X[fit & m], y[fit & m])
            # predict for EVERY origin, not only those with a realised actual:
            # the forecast issued from the final origin has no actual by
            # construction, and that is the one the officer acts on.
            preds[q] = reg.predict(X)
        # conformal widening calibrated on a held-back in-sample slice
        cm = cal & m
        lo = (preds[0.50][cm] - y[cm]) / np.maximum(preds[0.50][cm] - preds[0.10][cm], 1.0)
        hi = (y[cm] - preds[0.50][cm]) / np.maximum(preds[0.90][cm] - preds[0.50][cm], 1.0)
        k_lo = max(float(np.nanquantile(lo, 0.90)), 1.0)
        k_hi = max(float(np.nanquantile(hi, 0.90)), 1.0)
        p10 = preds[0.50] - k_lo * (preds[0.50] - preds[0.10])
        p90 = preds[0.50] + k_hi * (preds[0.90] - preds[0.50])
        # enforce p10 <= p50 <= p90: independently fitted quantile models cross
        stacked = np.sort(np.vstack([p10, preds[0.50], p90]), axis=0)
        p10, p50m, p90 = stacked[0], stacked[1], stacked[2]
        preds[0.50] = p50m

        te = (~tr) & m
        cov = float(((y[te] >= p10[te]) & (y[te] <= p90[te])).mean())
        mae = float(np.abs(preds[0.50][te] - y[te]).mean())
        diag[h] = dict(coverage=round(cov, 3), mae=round(mae), n_test=int(te.sum()),
                       k_lo=round(k_lo, 3), k_hi=round(k_hi, 3))

        for q, arr in [(0.10, p10), (0.50, preds[0.50]), (0.90, p90)]:
            rows.append(pd.DataFrame({
                "enterprise_id": F["enterprise_id"].to_numpy(),
                "origin_date": F["as_of"].to_numpy(),
                "horizon_days": h,
                "horizon_label": f"M{HORIZONS.index(h)+1}",
                "quantile": q,
                "model_id": f"hgb_quantile_h{h}_v1.2",
                "value": np.round(arr),
                "actual_net": np.round(y),          # NaN where not yet realised
                "is_out_of_time": ~tr,
                "is_live_forecast": np.isnan(y),    # no actual = a real forward call
            }))
    return pd.concat(rows, ignore_index=True), diag


# --------------------------------------------------------------------------
# risk assessments, alerts, recommendations, outcomes
# --------------------------------------------------------------------------

MECH_ACTIONS = {
    "margin_squeeze":          ["prebook_input", "renegotiate_buyer_terms", "reduce_drawings"],
    "climate_shock":           ["prebook_input", "request_bridge_loan", "claim_scheme"],
    "debt_overhang":           ["restructure_emi", "request_bridge_loan", "reduce_drawings"],
    "receivable_stretch":      ["collect_udhaar", "renegotiate_buyer_terms", "diversify_buyer"],
    "demand_trough":           ["stagger_batch", "sell_slow_stock", "request_bridge_loan"],
    "working_capital_erosion": ["request_bridge_loan", "defer_capex", "collect_udhaar"],
}


def build_assessments(F):
    A = F[[
        "enterprise_id", "as_of", "sector", "district_id", "prob_stress",
        "prob_missed_repayment", "rule_score", "fused_score", "risk_tier",
        "tier_cutoffs", "band_width", "low_visibility", "data_completeness",
        "buffer_days", "dscr_annual", "credit_headroom", "suggested_max_emi",
        "bridge_headroom", "net_buffer_days", "forecast_net_90d_p10", "forecast_net_90d_p50",
        "forecast_net_90d_p90", "reason_1", "reason_1_contrib", "reason_2",
        "reason_2_contrib", "reason_3", "reason_3_contrib",
    ]].copy()
    A.insert(0, "assessment_id", [f"AS{i+1:06d}" for i in range(len(A))])
    A["fusion_weights"] = json.dumps({"model": 0.45, "rule": 0.55})
    A["model_id"] = "hgb_stress_v1.2"
    A["rule_version"] = "rules_v1.2_18rules"
    return A


def build_alerts(A, ents, rng, fc=None):
    """Alerts only for AMBER/RED, each carrying a number, a cause, a deadline and
    up to three actions. An alert without all four is not a deliverable."""
    al = A[A["risk_tier"] != "GREEN"].copy()
    al = al.sort_values(["enterprise_id", "as_of"])
    # only raise when the tier worsens or a month has passed since the last alert
    keep, last = [], {}
    for i, row in al.iterrows():
        e, a = row["enterprise_id"], row["as_of"]
        if e not in last or (a - last[e]).days >= 60:
            keep.append(i); last[e] = a
    al = al.loc[keep].copy()
    al.insert(0, "alert_id", [f"AL{i+1:05d}" for i in range(len(al))])
    al["raised_at"] = al["as_of"]
    # Shortfall = the deepest point of the downside (p10) cumulative cash path,
    # and the deadline = the horizon at which that path first goes negative.
    # This is what makes an alert actionable: an amount AND a date, not a tier.
    al["projected_shortfall"] = 0.0
    al["shortfall_week_of"] = pd.NaT
    if fc is not None:
        p10 = fc[fc["quantile"] == 0.10]
        piv = p10.pivot_table(index=["enterprise_id", "origin_date"],
                              columns="horizon_days", values="value")
        for i, r in al.iterrows():
            key = (r["enterprise_id"], r["as_of"])
            if key not in piv.index:
                continue
            path = piv.loc[key]
            trough = float(path.min())
            if trough < 0:
                al.at[i, "projected_shortfall"] = round(-trough, -2)
                h = int(path.idxmin())
                al.at[i, "shortfall_week_of"] = r["as_of"] + pd.Timedelta(days=h)
    al["deadline_date"] = al["shortfall_week_of"].fillna(
        al["as_of"] + pd.to_timedelta(
            np.clip(np.round(al["net_buffer_days"].fillna(30)), 7, 120), unit="D"))
    al["expires_at"] = al["as_of"] + pd.Timedelta(days=75)
    al["merchant_visible"] = True
    al["exported_to_bureau"] = False        # never; the flag is perishable
    al["disputed_at"] = pd.NaT
    d = rng.random(len(al)) < 0.06
    al.loc[d, "disputed_at"] = al.loc[d, "as_of"] + pd.to_timedelta(
        rng.integers(1, 20, d.sum()), unit="D")

    recs = []
    ent_lang = ents.set_index("enterprise_id")["preferred_lang"].to_dict()
    for _, r in al.iterrows():
        mechs = [r["reason_1"], r["reason_2"], r["reason_3"]]
        seen = set()
        rank = 0
        for m in mechs:
            if m is None or m in seen or (isinstance(m, float) and pd.isna(m)) or m not in MECH_ACTIONS:
                continue
            seen.add(m)
            for act in MECH_ACTIONS[m][:1]:
                rank += 1
                if rank > 3:
                    break
                amt = float(max(r["projected_shortfall"], 2000))
                recs.append(dict(
                    recommendation_id=f"RC{len(recs)+1:06d}",
                    alert_id=r["alert_id"], enterprise_id=r["enterprise_id"],
                    rank=rank, mechanism=m, action_key=act,
                    params=json.dumps({"amount": round(amt, -2), "days": 30, "months": 3}),
                    audience="both" if act in ("request_bridge_loan", "restructure_emi") else "merchant",
                    rendered_lang=ent_lang.get(r["enterprise_id"], "hi"),
                ))
    return al, pd.DataFrame(recs)


def build_officer_loop(al, ents, rng):
    """Tasks -> visits -> outcomes. The outcome is the training label that closes
    the loop; without this table the product is a dashboard."""
    off = ents.set_index("enterprise_id")["officer_id"].to_dict()
    tasks, outs = [], []
    for i, (_, r) in enumerate(al.iterrows()):
        tid = f"TK{i+1:05d}"
        tasks.append(dict(
            task_id=tid, alert_id=r["alert_id"], enterprise_id=r["enterprise_id"],
            officer_id=off.get(r["enterprise_id"]),
            assigned_on=r["as_of"] + pd.Timedelta(days=int(rng.integers(1, 5))),
            priority_score=round(float(r["fused_score"]), 4),
            status="closed" if rng.random() < 0.72 else "open",
        ))
        if tasks[-1]["status"] == "closed":
            visited = tasks[-1]["assigned_on"] + pd.Timedelta(days=int(rng.integers(2, 22)))
            # a genuinely stressed enterprise is usually confirmed on visit
            confirmed = rng.random() < (0.80 if r["risk_tier"] == "RED" else 0.58)
            outs.append(dict(
                outcome_id=f"OC{len(outs)+1:05d}", task_id=tid,
                enterprise_id=r["enterprise_id"], visited_on=visited,
                outcome="stress_confirmed" if confirmed else "false_positive",
                intervention=str(rng.choice(
                    ["bridge_loan_sanctioned", "emi_rescheduled", "advice_only",
                     "scheme_linkage", "no_action"],
                    p=[0.24, 0.16, 0.34, 0.14, 0.12])) if confirmed else "no_action",
                officer_note_lang=ents.set_index("enterprise_id").loc[
                    r["enterprise_id"], "preferred_lang"],
                becomes_training_label=True,
            ))
    return pd.DataFrame(tasks), pd.DataFrame(outs)


# --------------------------------------------------------------------------
# consent, grants, audit  (the T0-T3 tiers as rows, not as a slide)
# --------------------------------------------------------------------------

def build_consent(ents, tasks, rng):
    cons, grants, audit = [], [], []
    for _, e in ents.iterrows():
        cid = f"CN{e['enterprise_id'][3:]}"
        cons.append(dict(
            consent_id=cid, enterprise_id=e["enterprise_id"],
            purpose="cash_flow_monitoring_and_credit_assessment",
            tier_granted=1, granted_at=e["onboarded_on"],
            expires_at=e["onboarded_on"] + pd.DateOffset(years=2),
            revoked_at=pd.NaT, artifact_hash=hashlib.sha256(cid.encode()).hexdigest()[:32],
            basis="DPDP_2023_consent", channel=e["preferred_channel"],
        ))
    # a minority revoke, which the pipeline must handle
    rv = ents.sample(frac=0.03, random_state=3)["enterprise_id"].tolist()
    for c in cons:
        if c["enterprise_id"] in rv:
            c["revoked_at"] = c["granted_at"] + pd.DateOffset(months=int(rng.integers(6, 24)))

    # T2 detail access is explicit, time-boxed, revocable and audited
    for i, (_, t) in enumerate(tasks.sample(frac=0.35, random_state=5).iterrows()):
        gid = f"GR{i+1:05d}"
        vf = t["assigned_on"]
        grants.append(dict(
            grant_id=gid, enterprise_id=t["enterprise_id"], grantee_id=t["officer_id"],
            tier=2, valid_from=vf, valid_until=vf + pd.Timedelta(days=14),
            consent_id=f"CN{t['enterprise_id'][3:]}",
            reason="field_visit_preparation",
        ))
        audit.append(dict(
            audit_id=len(audit) + 1, actor_id=t["officer_id"], actor_role="field_officer",
            action="view_t2_detail", enterprise_id=t["enterprise_id"], tier_accessed=2,
            grant_id=gid, occurred_at=vf + pd.Timedelta(hours=int(rng.integers(1, 72))),
            merchant_notified=True,
        ))
    return pd.DataFrame(cons), pd.DataFrame(grants), pd.DataFrame(audit)


# --------------------------------------------------------------------------
# merchant voice entries — code-mixed, messy, multi-month
# --------------------------------------------------------------------------

NOTE_TEMPLATES = {
    "gu": ["aaje {n} nu doodh bharyu", "feed na {n} apya", "bachat {n}", "hapto {n} bharyo",
           "{n} nu ghas kharidyu", "dukan ma {n} vechan"],
    "hi": ["aaj {n} ka maal becha", "mitti aur bhatta {n}", "bachat {n} jama",
           "kista {n} diya", "{n} ka udhaar diya", "{n} ka saman laya"],
    "te": ["ee roju {n} ammakam", "dana {n} kotti", "podupu {n}", "vaddi {n} kattanu",
           "{n} pillala kharchu", "batch ki {n} feed"],
    "mr": ["aaj {n} cha vikri", "gul {n} la ghetla", "bachat {n}", "hapta {n} bharla",
           "{n} cha kachcha maal", "dukanat {n} vikle"],
    "as": ["aji {n} bikri hol", "suta {n} tot kinilo", "sonchoi {n}", "kisti {n} dilo",
           "{n} tokar kapor", "haator {n} kaam"],
    "or": ["aaji {n} bikri", "chaula {n} kinili", "sanchaya {n}", "kisti {n} dela",
           "{n} udhaar dela", "dukanare {n} bikri"],
}
ENTRY_TYPES = ["income", "expense", "savings_deposit", "loan_repayment", "receivable_collected"]


def build_merchant_entries(panel, ents, rng, months=14):
    """A realistic voice/assisted entry log: gaps, duplicates, corrections and
    low-confidence transcriptions — the conditions the reconciliation logic has
    to survive. v1.1 had four rows per enterprise, all in the last three weeks."""
    rows = []
    end = panel["date"].max()
    start = end - pd.DateOffset(months=months)
    sub = panel[panel["date"] >= start]
    for eid, g in sub.groupby("enterprise_id"):
        e = ents.set_index("enterprise_id").loc[eid]
        lang = e["preferred_lang"]
        # cash-heavy / IVR users record less often — that IS the visibility gap
        p_record = {"app": 0.62, "assisted": 0.24, "ivr": 0.16}[e["preferred_channel"]]
        src = {"app": "voice", "assisted": "assisted", "ivr": "ivr"}[e["preferred_channel"]]
        gg = g.sort_values("date")
        for _, d in gg.iterrows():
            if rng.random() > p_record:
                continue
            if d["cash_inflow"] > 0:
                amt = float(d["cash_inflow"]) * rng.uniform(0.82, 1.06)
                rows.append(_entry(eid, d["date"], "income", amt, lang, src, rng))
            if d["outflow"] > 0 and rng.random() < 0.72:
                amt = float(d["input_cost"]) * rng.uniform(0.8, 1.1)
                rows.append(_entry(eid, d["date"], "expense", amt, lang, src, rng))
            if d["emi_due"] and d["emi_paid"]:
                rows.append(_entry(eid, d["date"], "loan_repayment",
                                   float(d["emi_amount"]), lang, src, rng))
    M = pd.DataFrame(rows)
    # inject duplicates and corrections — the offline-sync conflict cases
    dup = M.sample(frac=0.012, random_state=11).copy()
    dup["entry_id"] = [f"ME-DUP{i:05d}" for i in range(len(dup))]
    dup["is_suspected_duplicate"] = True
    corr = M.sample(frac=0.02, random_state=12).copy()
    corr["entry_id"] = [f"ME-COR{i:05d}" for i in range(len(corr))]
    corr["corrects_entry_id"] = M.sample(frac=0.02, random_state=12)["entry_id"].to_numpy()
    corr["amount"] = (corr["amount"] * np.random.default_rng(13).uniform(0.6, 1.4, len(corr))).round(0)
    out = pd.concat([M, dup, corr], ignore_index=True)
    out["is_suspected_duplicate"] = out["is_suspected_duplicate"].fillna(False)
    return out.sort_values(["enterprise_id", "entry_date"]).reset_index(drop=True)


_ME_N = [0]


def _entry(eid, dt, etype, amt, lang, src, rng):
    _ME_N[0] += 1
    amt = round(amt, 0)
    tmpl = rng.choice(NOTE_TEMPLATES[lang])
    conf = round(float(np.clip(rng.normal(0.88 if src == "voice" else 0.79, 0.09), 0.35, 0.99)), 2)
    # late sync: offline queues drain on reconnect, sometimes days later
    lag = int(rng.choice([0, 0, 0, 1, 2, 4, 9, 21], p=[.52, .14, .09, .09, .07, .05, .03, .01]))
    return dict(
        entry_id=f"ME{_ME_N[0]:07d}", enterprise_id=eid,
        entry_date=dt, recorded_at=dt, synced_at=dt + pd.Timedelta(days=lag),
        sync_lag_days=lag, entry_type=etype, amount=amt,
        note_text=tmpl.format(n=int(amt)), note_lang=lang,
        source=src, asr_confidence=conf,
        is_household=bool(rng.random() < 0.08),
        corrects_entry_id=None, is_suspected_duplicate=False,
    )


# --------------------------------------------------------------------------
# market risk cards (sector-level, replaces v1.1's persona-keyed price table)
# --------------------------------------------------------------------------

MARKET_RISKS = [
    ("DAIRY", "climate", "Heat stress above THI 78 cuts yield 8-14% in Apr-Jun", "high"),
    ("DAIRY", "margin", "Fodder cost peaks exactly when yield troughs; procurement price is sticky", "high"),
    ("DAIRY", "counterparty", "Single co-operative buyer — settlement cadence sets the cash cycle", "medium"),
    ("POULTRY", "cycle", "42-day grow-out means no inflow for six weeks; feed is on dealer credit", "high"),
    ("POULTRY", "demand", "Shrawan and Navratri collapse local demand by 30-40%", "high"),
    ("POULTRY", "disease", "Avian influenza scares halt sales district-wide for weeks", "high"),
    ("POULTRY", "input", "Maize-soya price shocks pass straight through to feed cost", "medium"),
    ("HANDICRAFT", "counterparty", "One exporter or agent can be 70%+ of the order book", "high"),
    ("HANDICRAFT", "receivable", "55-95 day terms; a cancelled festival order is existential", "high"),
    ("HANDICRAFT", "seasonality", "Apr-Jun trough before the festival order cycle", "medium"),
    ("FOODPROC", "receivable", "42-62 day retailer credit locks up working capital", "high"),
    ("FOODPROC", "input", "Procurement is harvest-linked; cash goes out before it comes in", "high"),
    ("FOODPROC", "logistics", "Mandi strikes and fuel spikes hit transport-heavy margins", "medium"),
    ("RETAIL", "receivable", "Informal udhaar is invisible until it is uncollectable; ~7% written off", "high"),
    ("RETAIL", "visibility", "Cash-dominant records mean observed inflow understates true sales", "high"),
    ("RETAIL", "demand", "Festival concentration means one bad October compounds all year", "medium"),
]


# --------------------------------------------------------------------------
# manifest
# --------------------------------------------------------------------------

def write_bundle(tables, outdir, xlsx_tables, xlsx_path, notes):
    import os
    os.makedirs(outdir, exist_ok=True)
    man = []
    for name, df in tables.items():
        p = f"{outdir}/{name}.csv"
        df.to_csv(p, index=False)
        h = hashlib.sha256(open(p, "rb").read()).hexdigest()[:16]
        man.append(dict(table=name, rows=len(df), cols=df.shape[1],
                        bytes=os.path.getsize(p), sha256_16=h,
                        description=notes.get(name, "")))
    M = pd.DataFrame(man).sort_values("table")
    M.to_csv(f"{outdir}/_manifest.csv", index=False)

    with pd.ExcelWriter(xlsx_path, engine="openpyxl") as xw:
        M.to_excel(xw, sheet_name="_manifest", index=False)
        for name in xlsx_tables:
            df = tables[name]
            (df if len(df) <= 20000 else df.head(20000)).to_excel(
                xw, sheet_name=name[:31], index=False)
    return M
