"""
DHANSETU — feature store, causal labels, rule engine, backtest.

Two things v1.1 could not do, and this module exists to make possible:

1. LABELS. `stress_episodes` is derived from the simulator's own state, so every
   episode has a true onset date and a true mechanism. Reason codes can then be
   scored for correctness, not merely for plausibility.

2. POINT-IN-TIME CORRECTNESS. Features carry an `as_of` date and are built only
   from data at or before it. A backtest is a filter on as_of, which makes
   leakage structurally hard rather than a matter of discipline.
"""
import numpy as np
import pandas as pd
import refdata as R

MECH = R.MECHANISMS


# --------------------------------------------------------------------------
# 1. ground truth: causal stress episodes
# --------------------------------------------------------------------------

def build_stress_episodes(panel, recv):
    """An episode is a genuine liquidity failure, dated from the simulator.

    Definition: buffer below 15 days of typical outflow AND negative 30-day
    rolling net cash, sustained at least 21 consecutive days. Onset is the first
    day of that run. Burn-in: the first 120 days of the panel are excluded so
    that opening-balance choices cannot manufacture episodes.
    """
    eps = []
    burn_in = panel["date"].min() + pd.Timedelta(days=120)

    for eid, g in panel.groupby("enterprise_id", sort=False):
        g = g.sort_values("date").reset_index(drop=True)
        out30 = g["outflow"].rolling(30, min_periods=10).mean()
        net30 = g["net"].rolling(30, min_periods=10).sum()
        buffer_days = g["balance"] / out30.replace(0, np.nan)
        qual = ((buffer_days < 15) & (net30 < 0) & (g["date"] >= burn_in)).fillna(False).to_numpy()

        # find runs of >= 21 days
        i = 0
        n = len(qual)
        while i < n:
            if not qual[i]:
                i += 1
                continue
            j = i
            while j + 1 < n and qual[j + 1]:
                j += 1
            if j - i + 1 >= 21:
                onset = g.loc[i, "date"]
                # resolution: buffer back above 45 days for 14 straight days
                res = None
                k = j
                good = 0
                while k < n:
                    if (buffer_days.iloc[k] > 45) and (net30.iloc[k] > 0):
                        good += 1
                        if good >= 14:
                            res = g.loc[k, "date"]
                            break
                    else:
                        good = 0
                    k += 1
                sub = g[(g["date"] >= onset)]
                miss = sub[(sub["emi_due"]) & (~sub["emi_paid"])]
                first_miss = miss["date"].min() if len(miss) else pd.NaT

                mech, drivers = attribute_cause(g, i, recv, eid)
                eps.append(dict(
                    enterprise_id=eid, onset_date=onset,
                    resolution_date=res, first_missed_repayment=first_miss,
                    duration_days=int((res - onset).days) if res is not None else
                                  int((g["date"].max() - onset).days),
                    mechanism=mech,
                    severity=("high" if buffer_days.iloc[i:j + 1].min() < 3 else
                              "medium" if buffer_days.iloc[i:j + 1].min() < 8 else "low"),
                    min_buffer_days=round(float(buffer_days.iloc[i:j + 1].min()), 1),
                    causal_drivers=drivers,
                    label_source="simulator",
                ))
                i = j + 120  # refractory: one prolonged crisis is ONE episode
            else:
                i = j + 1
    df = pd.DataFrame(eps)
    if len(df):
        df["episode_id"] = [f"EP{i+1:04d}" for i in range(len(df))]
        df = df[["episode_id"] + [c for c in df.columns if c != "episode_id"]]
    return df


def attribute_cause(g, idx, recv, eid):
    """Which driver actually moved in the 60 days before onset.

    Compares each candidate mechanism's signal in the pre-onset window against
    that enterprise's own trailing baseline, then returns the largest
    standardised deviation. Because the simulator produced these drivers, the
    winner is the true cause, not an inferred one.
    """
    lo, hi = max(0, idx - 60), idx
    base_lo = max(0, idx - 400)
    pre = g.iloc[lo:hi]
    base = g.iloc[base_lo:lo]
    if len(pre) < 10 or len(base) < 30:
        return "working_capital_erosion", {}

    def dev(col, invert=False):
        b, p = base[col].mean(), pre[col].mean()
        if b == 0 or np.isnan(b):
            return 0.0
        d = (p - b) / abs(b)
        return -d if invert else d

    scores = {}
    # margin squeeze: cost index up relative to revenue index
    cost_up = dev("cost_price_index")
    rev_up = dev("rev_price_index")
    scores["margin_squeeze"] = max(0.0, cost_up - rev_up) * 3.2
    # climate shock: climate driver suppressed
    scores["climate_shock"] = max(0.0, dev("drv_climate", invert=True)) * 4.0
    # demand trough: only the UNFORECASTABLE component. A seasonal trough is
    # printed on a calendar months in advance, so it cannot be the surprise
    # cause of a failure — being unable to survive a known trough is a
    # working-capital failure, and is attributed as such below.
    scores["demand_trough"] = max(0.0, dev("drv_demand", invert=True)) * 5.0
    seasonal_dip = max(0.0, dev("drv_seasonality", invert=True))
    # debt overhang: EMI burden relative to inflow, plus misses
    emi_share_pre = pre["emi_amount"].sum() / max(pre["cash_inflow"].sum(), 1)
    emi_share_base = base["emi_amount"].sum() / max(base["cash_inflow"].sum(), 1)
    misses = int((pre["emi_due"] & ~pre["emi_paid"]).sum())
    scores["debt_overhang"] = max(0.0, emi_share_pre - emi_share_base) * 6.0 + 0.30 * misses
    # receivable stretch: gap between accrued sales and cash received
    acc = pre["sales_accrued"].sum(); cash = pre["cash_inflow"].sum()
    acc_b = base["sales_accrued"].sum(); cash_b = base["cash_inflow"].sum()
    if acc > 0 and acc_b > 0:
        gap = (1 - cash / acc) - (1 - cash_b / acc_b)
        scores["receivable_stretch"] = max(0.0, gap) * 4.5
    else:
        scores["receivable_stretch"] = 0.0
    # working capital erosion: the residual — balance sliding with flat sales
    scores["working_capital_erosion"] = (max(0.0, dev("balance", invert=True)) * 0.9
                                        + seasonal_dip * 1.6)

    # event exposure reinforces climate/demand attribution
    if pre["event_code"].notna().any():
        ecodes = pre["event_code"].dropna().unique().tolist()
        for c in ecodes:
            etype = next((e[1] for e in R.SHOCK_EVENTS if e[0] == c), "")
            if etype in ("heatwave", "flood", "cyclone"):
                scores["climate_shock"] += 0.9
            elif etype in ("avian_influenza", "mandi_strike"):
                scores["demand_trough"] += 0.9
            elif etype in ("export_order_cancellation",):
                scores["receivable_stretch"] += 1.1
            elif etype in ("feed_price_shock", "fuel_spike", "milk_price_freeze"):
                scores["margin_squeeze"] += 1.1

    if max(scores.values()) < 0.06:
        # nothing moved enough to attribute — this is a buffer failure, not a
        # shock. Returning the first dict key here was a bug in the first pass.
        return "working_capital_erosion", {}
    winner = max(scores, key=scores.get)
    drivers = {k: round(float(v), 3) for k, v in sorted(scores.items(), key=lambda x: -x[1]) if v > 0.05}
    return winner, drivers


# --------------------------------------------------------------------------
# 2. point-in-time feature snapshots (monthly as_of)
# --------------------------------------------------------------------------

def build_features(panel, recv, ents, sched):
    """Monthly as_of snapshots. Every feature uses only rows at or before as_of."""
    panel = panel.sort_values(["enterprise_id", "date"])
    recv = recv.copy()
    for c in ("invoice_date", "due_date", "settled_on"):
        recv[c] = pd.to_datetime(recv[c])

    as_ofs = pd.date_range(panel["date"].min() + pd.Timedelta(days=119),
                           panel["date"].max(), freq="ME")
    ent_meta = ents.set_index("enterprise_id")
    recv_by = {e: g for e, g in recv.groupby("enterprise_id")}
    sched = sched.copy()
    sched["due_date"] = pd.to_datetime(sched["due_date"])
    sched_by = {e: g for e, g in sched.groupby("enterprise_id")}

    rows = []
    for eid, g in panel.groupby("enterprise_id", sort=False):
        g = g.set_index("date")
        rv = recv_by.get(eid)
        meta = ent_meta.loc[eid]
        sec = meta["sector"]
        seas_in = np.array(R.SEASONALITY_INFLOW[sec])

        for a in as_ofs:
            h = g.loc[:a]
            if len(h) < 100:
                continue
            w30, w90, w180, w365 = h.tail(30), h.tail(90), h.tail(180), h.tail(365)
            out30 = w30["outflow"].mean()
            bal = float(h["balance"].iloc[-1])

            # --- lens 1: liquidity
            buffer_days = bal / out30 if out30 > 0 else 0.0
            informal_now = float(h["informal_debt"].iloc[-1])
            net_buffer_days = (bal - informal_now) / out30 if out30 > 0 else 0.0
            net30, net90 = w30["net"].sum(), w90["net"].sum()
            zero_in_30 = int((w30["cash_inflow"] == 0).sum())
            inflow_cv = (w90["cash_inflow"].std() / max(w90["cash_inflow"].mean(), 1))

            # --- lens 2: margin
            oi30 = w30["outflow"].sum() / max(w30["cash_inflow"].sum(), 1)
            oi90 = w90["outflow"].sum() / max(w90["cash_inflow"].sum(), 1)
            cost_idx_chg = (w90["cost_price_index"].mean() /
                            max(w365["cost_price_index"].mean(), 1e-9) - 1)
            rev_idx_chg = (w90["rev_price_index"].mean() /
                           max(w365["rev_price_index"].mean(), 1e-9) - 1)
            margin_gap = cost_idx_chg - rev_idx_chg

            # --- lens 3: receivables
            dso = overdue_share = conc = 0.0
            aged_90 = 0.0
            if rv is not None:
                open_inv = rv[(rv["invoice_date"] <= a) &
                              ((rv["settled_on"].isna()) | (rv["settled_on"] > a))]
                closed = rv[(rv["settled_on"].notna()) & (rv["settled_on"] <= a)].tail(40)
                if len(closed):
                    dso = float((closed["settled_on"] - closed["invoice_date"]).dt.days.mean())
                if len(open_inv):
                    total = open_inv["amount"].sum()
                    overdue_share = float(open_inv.loc[open_inv["due_date"] < a, "amount"].sum()
                                          / max(total, 1))
                    aged = open_inv[(a - open_inv["invoice_date"]).dt.days > 90]
                    aged_90 = float(aged["amount"].sum() / max(total, 1))
                    byc = open_inv.groupby("counterparty_ref")["amount"].sum()
                    conc = float(byc.max() / max(byc.sum(), 1))

            # --- lens 4: debt
            loan_out = float(h["loan_outstanding"].iloc[-1])
            emi_due_90 = h.tail(90)
            missed_90 = int((emi_due_90["emi_due"] & ~emi_due_90["emi_paid"]).sum())
            missed_365 = int((w365["emi_due"] & ~w365["emi_paid"]).sum())
            annual_inflow = max(w365["cash_inflow"].sum(), 1)
            emi_burden = w365["emi_amount"].sum() / annual_inflow
            # DSCR on ANNUAL debt service against net operating cash flow
            noc = w365["cash_inflow"].sum() - w365["input_cost"].sum()
            debt_service = max(w365["emi_amount"].sum(), 1)
            dscr = noc / debt_service if w365["emi_amount"].sum() > 0 else np.nan
            informal = float(h["informal_debt"].iloc[-1])

            # --- lens 5: context
            month_pos = seas_in[a.month - 1]
            fwd3 = seas_in[[(a.month - 1 + k) % 12 for k in (1, 2, 3)]].mean()
            thi90 = float(w90["thi"].mean())
            # climatological THI for the same calendar months, from history only
            wmonths = set(w90.index.month.tolist())
            hist_same = h[h.index.month.isin(wmonths)]
            thi_norm = float(hist_same["thi"].mean()) if len(hist_same) > 30 else thi90
            thi_anom = thi90 - thi_norm
            rain_hist = hist_same["rain_anomaly_pct"].mean() if len(hist_same) > 30 else 0.0
            digital = float(h["digital_share"].iloc[-1])
            # completeness: cash-dominant records are genuinely less observable
            completeness = float(np.clip(0.35 + 0.65 * digital, 0, 1))
            ev90 = int(w90["event_code"].notna().sum())

            # Contractually-known forward cash: invoices already raised with a
            # due date inside the horizon, and EMIs already scheduled. A
            # seasonal-naive baseline cannot use either, which is where a real
            # forecast should earn its improvement.
            recv_due_90 = recv_open_bal = 0.0
            if rv is not None:
                oi = rv[(rv["invoice_date"] <= a) &
                        ((rv["settled_on"].isna()) | (rv["settled_on"] > a))]
                recv_open_bal = float(oi["amount"].sum())
                recv_due_90 = float(oi.loc[oi["due_date"] <= a + pd.Timedelta(days=90),
                                           "amount"].sum())
            sc_e = sched_by.get(eid)
            emi_next_90 = 0.0
            if sc_e is not None:
                emi_next_90 = float(sc_e.loc[(sc_e["due_date"] > a) &
                                             (sc_e["due_date"] <= a + pd.Timedelta(days=90)),
                                             "emi_payable"].sum())
            # observable weather, not the simulator's hidden climate state
            rain_an_90 = float(w90["rain_anomaly_pct"].mean())
            season_drop = float(fwd3 / month_pos - 1) if month_pos else 0.0
            x = np.arange(len(w90))
            inflow_trend = float(np.polyfit(x, w90["cash_inflow"].to_numpy(), 1)[0]) if len(w90) > 10 else 0.0

            rows.append(dict(
                enterprise_id=eid, as_of=a, sector=sec, district_id=int(meta["district_id"]),
                receivable_due_next_90d=round(recv_due_90),
                receivable_open_balance=round(recv_open_bal),
                emi_scheduled_next_90d=round(emi_next_90),
                rain_anomaly_90d=round(rain_an_90, 1),
                season_drop_3m=round(season_drop, 4),
                inflow_trend_90d=round(inflow_trend, 2),
                balance=round(bal), buffer_days=round(buffer_days, 1),
                net_buffer_days=round(net_buffer_days, 1),
                net_30d=round(net30), net_90d=round(net90),
                avg_daily_inflow_30d=round(w30["cash_inflow"].mean()),
                zero_inflow_days_30d=zero_in_30, inflow_cv_90d=round(inflow_cv, 3),
                outflow_inflow_30d=round(oi30, 3), outflow_inflow_90d=round(oi90, 3),
                cost_index_chg_90d=round(cost_idx_chg, 4),
                rev_index_chg_90d=round(rev_idx_chg, 4),
                margin_gap_90d=round(margin_gap, 4),
                dso_days=round(dso, 1), overdue_share=round(overdue_share, 3),
                receivable_aged_90d_share=round(aged_90, 3),
                buyer_concentration=round(conc, 3),
                loan_outstanding=round(loan_out), emi_burden_365d=round(emi_burden, 4),
                missed_emis_90d=missed_90, missed_emis_365d=missed_365,
                dscr_annual=round(dscr, 2) if not np.isnan(dscr) else np.nan,
                informal_debt=round(informal),
                noc_365d=round(float(noc)),
                dscr_annual_raw=round(float(noc / debt_service), 3) if w365["emi_amount"].sum() > 0 else np.nan,
                season_index_now=round(float(month_pos), 3),
                season_index_fwd3=round(float(fwd3), 3),
                thi_90d=round(thi90, 2),
                thi_anomaly_90d=round(thi_anom, 2),
                digital_share=round(digital, 3),
                data_completeness=round(completeness, 3),
                event_days_90d=ev90,
                # forward target for the cash forecast (filled in later, never a feature)
                actual_net_next_90d=np.nan,
            ))
    F = pd.DataFrame(rows)

    # forward actuals for forecast evaluation — computed here, used only as y
    fwd = []
    for eid, g in panel.groupby("enterprise_id", sort=False):
        s = g.set_index("date")["net"]
        for a in as_ofs:
            nxt = s.loc[a + pd.Timedelta(days=1): a + pd.Timedelta(days=90)]
            fwd.append((eid, a, nxt.sum() if len(nxt) >= 60 else np.nan))
    fw = pd.DataFrame(fwd, columns=["enterprise_id", "as_of", "actual_net_next_90d"])
    F = F.drop(columns=["actual_net_next_90d"]).merge(fw, on=["enterprise_id", "as_of"], how="left")
    return F


def attach_labels(F, episodes, horizon_days=90):
    """y = a stress episode begins within `horizon_days` after as_of."""
    F = F.copy()
    F["stress_within_90d"] = 0
    F["days_to_onset"] = np.nan
    if not len(episodes):
        return F
    on = episodes.groupby("enterprise_id")["onset_date"].apply(list).to_dict()
    for i, (eid, a) in enumerate(zip(F["enterprise_id"].to_numpy(), F["as_of"].to_numpy())):
        for o in on.get(eid, []):
            d = (o - pd.Timestamp(a)).days
            if 0 < d <= horizon_days:
                F.iat[i, F.columns.get_loc("stress_within_90d")] = 1
                cur = F.iat[i, F.columns.get_loc("days_to_onset")]
                F.iat[i, F.columns.get_loc("days_to_onset")] = d if np.isnan(cur) else min(cur, d)
                break
    return F


# --------------------------------------------------------------------------
# 3. deterministic rule engine — 15 rules, each mapped to one mechanism
# --------------------------------------------------------------------------
# (key, mechanism, weight, predicate)
RULES = [
    # working capital erosion
    ("thin_buffer",            "working_capital_erosion", 0.10, lambda f: f["net_buffer_days"] < 21),
    ("critical_buffer",        "working_capital_erosion", 0.15, lambda f: f["net_buffer_days"] < 8),
    ("buffer_eroding",         "working_capital_erosion", 0.09, lambda f: f["buffer_days_delta_3m"] < -8),
    # margin squeeze
    ("input_cost_squeeze",     "margin_squeeze",          0.11, lambda f: f["margin_gap_90d"] > 0.04),
    ("severe_cost_squeeze",    "margin_squeeze",          0.15, lambda f: f["margin_gap_90d"] > 0.10),
    ("spend_exceeds_earnings", "margin_squeeze",          0.09, lambda f: f["outflow_inflow_30d"] > 1.05),
    # receivable stretch
    ("receivable_stretch",     "receivable_stretch",      0.12, lambda f: f["dso_days"] > 60),
    ("overdue_book",           "receivable_stretch",      0.11, lambda f: f["overdue_share"] > 0.35),
    ("aged_receivables",       "receivable_stretch",      0.10, lambda f: f["receivable_aged_90d_share"] > 0.25),
    # debt overhang
    ("repayment_stress",       "debt_overhang",           0.15, lambda f: f["missed_emis_90d"] >= 1),
    ("heavy_emi_burden",       "debt_overhang",           0.10, lambda f: f["emi_burden_365d"] > 0.16),
    ("informal_borrowing",     "debt_overhang",           0.11, lambda f: f["informal_debt"] > 0),
    # climate shock  (observable weather only — never the simulator's state)
    ("heat_anomaly",           "climate_shock",           0.11, lambda f: f["thi_anomaly_90d"] > 0.4),
    ("severe_heat_anomaly",    "climate_shock",           0.14, lambda f: f["thi_anomaly_90d"] > 1.2),
    ("rainfall_anomaly",       "climate_shock",           0.10, lambda f: f["rain_anomaly_pct_abs"] > 40),
    # demand trough  (calendar is known in advance — this is the cheap win)
    ("seasonal_trough_ahead",  "demand_trough",           0.12, lambda f: f["season_drop_3m"] < -0.10),
    ("deep_trough_ahead",      "demand_trough",           0.15, lambda f: f["season_drop_3m"] < -0.20),
    ("revenue_declining_yoy",  "demand_trough",           0.10, lambda f: f["sales_yoy"] < -0.12),
]

# Maximum contribution each mechanism can reach if all its rules fire. Used to
# normalise, so a mechanism is ranked by how much of ITS OWN evidence fired
# rather than by how many rules happen to be written for it. Without this,
# climate and demand could never outrank the mechanisms with more rules.
MECH_MAX = {}
for _k, _m, _w, _p in RULES:
    MECH_MAX[_m] = MECH_MAX.get(_m, 0.0) + _w


def run_rules(F):
    """Evaluate every rule at every as_of. Persisted with inputs so any past
    decision can be replayed."""
    F = F.copy()
    F["rain_anomaly_pct_abs"] = F["rain_anomaly_90d"].abs()
    ev_rows = []
    score = np.zeros(len(F))
    mech_contrib = {m: np.zeros(len(F)) for m in MECH}
    for key, mech, w, pred in RULES:
        fired = pred(F).fillna(False).to_numpy()
        score += w * fired
        mech_contrib[mech] += w * fired
        ev_rows.append(pd.DataFrame({
            "enterprise_id": F["enterprise_id"], "as_of": F["as_of"],
            "rule_key": key, "mechanism": mech, "weight": w, "fired": fired,
        }))
    rule_score = np.clip(score / 0.95, 0, 1)   # 0.95 ~ practical max co-firing
    # normalise per mechanism so mechanisms are comparable to each other
    mech_norm = {m: mech_contrib[m] / MECH_MAX[m] for m in mech_contrib}
    return rule_score, mech_norm, pd.concat(ev_rows, ignore_index=True)


# --------------------------------------------------------------------------
# 4. models + honest backtest
# --------------------------------------------------------------------------

FEATS = [
    "buffer_days", "net_buffer_days", "net_30d", "net_90d", "avg_daily_inflow_30d", "zero_inflow_days_30d",
    "inflow_cv_90d", "outflow_inflow_30d", "outflow_inflow_90d", "cost_index_chg_90d",
    "rev_index_chg_90d", "margin_gap_90d", "dso_days", "overdue_share",
    "receivable_aged_90d_share", "buyer_concentration", "loan_outstanding",
    "emi_burden_365d", "missed_emis_90d", "missed_emis_365d", "informal_debt",
    "season_index_now", "season_index_fwd3", "thi_90d", "digital_share",
    "data_completeness", "event_days_90d",
    "receivable_due_next_90d", "receivable_open_balance", "emi_scheduled_next_90d",
    "rain_anomaly_90d", "season_drop_3m", "inflow_trend_90d", "thi_anomaly_90d",
    "noc_365d",
]

SPLIT_DATE = pd.Timestamp("2025-07-31")   # train strictly before, test after


def backtest(F):
    from sklearn.ensemble import HistGradientBoostingClassifier, HistGradientBoostingRegressor
    from sklearn.metrics import roc_auc_score, average_precision_score

    F = F.copy()
    X = F[FEATS].astype(float).fillna(0.0)
    tr = F["as_of"] <= SPLIT_DATE
    te = ~tr
    out = {}

    # ---- stress classifier
    y = F["stress_within_90d"].to_numpy()
    clf = HistGradientBoostingClassifier(
        max_depth=4, learning_rate=0.06, max_iter=260,
        l2_regularization=1.0, random_state=7)
    clf.fit(X[tr], y[tr])
    p_te = clf.predict_proba(X[te])[:, 1]
    p_all = np.zeros(len(F))
    p_all[te.to_numpy()] = p_te
    p_all[tr.to_numpy()] = clf.predict_proba(X[tr])[:, 1]
    base_rate = y[te].mean()
    out["auc"] = roc_auc_score(y[te], p_te)
    out["ap"] = average_precision_score(y[te], p_te)
    out["base_rate"] = base_rate
    out["pr_lift"] = out["ap"] / base_rate if base_rate > 0 else np.nan
    out["n_train"] = int(tr.sum()); out["n_test"] = int(te.sum())
    out["pos_train"] = int(y[tr].sum()); out["pos_test"] = int(y[te].sum())
    F["model_prob"] = p_all

    # ---- quantile cash forecast (LightGBM unavailable offline; sklearn HGB
    #      supports the same pinball objective)
    m = F["actual_net_next_90d"].notna()
    yq = F["actual_net_next_90d"]
    preds = {}
    for q in (0.10, 0.50, 0.90):
        reg = HistGradientBoostingRegressor(
            loss="quantile", quantile=q, max_depth=4, learning_rate=0.06,
            max_iter=260, l2_regularization=1.0, random_state=7)
        reg.fit(X[tr & m], yq[tr & m])
        col = np.full(len(F), np.nan)
        col[(te & m).to_numpy()] = reg.predict(X[te & m])
        col[(tr & m).to_numpy()] = reg.predict(X[tr & m])
        preds[q] = col
        F[f"forecast_net_90d_p{int(q*100)}"] = col

    ev = te & m
    mae_model = np.abs(preds[0.50][ev.to_numpy()] - yq[ev]).mean()

    # seasonal-naive baseline: same 90-day window one year earlier
    sn = seasonal_naive(F)
    F["baseline_seasonal_naive"] = sn
    ok = ev & F["baseline_seasonal_naive"].notna()
    mae_naive = np.abs(F.loc[ok, "baseline_seasonal_naive"] - yq[ok]).mean()
    mae_model_ok = np.abs(preds[0.50][ok.to_numpy()] - yq[ok]).mean()
    out["mae_model"] = mae_model_ok
    out["mae_seasonal_naive"] = mae_naive
    out["forecast_improvement_pct"] = (1 - mae_model_ok / mae_naive) * 100 if mae_naive else np.nan

    # calibration: share of actuals inside p10-p90
    inside = ((yq[ev] >= preds[0.10][ev.to_numpy()]) &
              (yq[ev] <= preds[0.90][ev.to_numpy()])).mean()
    out["band_coverage_p10_p90"] = inside

    return F, out, clf


def seasonal_naive(F):
    """Same forward-90d net one year earlier — the baseline a credit officer
    would use by hand."""
    key = F.set_index(["enterprise_id", "as_of"])["actual_net_next_90d"]
    prev = []
    for eid, a in zip(F["enterprise_id"], F["as_of"]):
        target = (a - pd.DateOffset(years=1))
        target = target + pd.offsets.MonthEnd(0)
        prev.append(key.get((eid, target), np.nan))
    return np.array(prev, dtype=float)


def fuse_and_assess(F, rule_score, mech_contrib):
    """risk = 0.45 x model + 0.55 x rules — continuous, then tiered by published
    cutoffs. v1.1's score had 44% of values tied at exactly zero and could not
    be ranked."""
    F = F.copy()
    F["rule_score"] = np.round(rule_score, 4)
    F["fused_score"] = np.round(0.45 * F["model_prob"] + 0.55 * F["rule_score"], 4)
    cuts = (0.38, 0.58)
    F["risk_tier"] = np.where(F["fused_score"] >= cuts[1], "RED",
                       np.where(F["fused_score"] >= cuts[0], "AMBER", "GREEN"))
    F["tier_cutoffs"] = f"AMBER>={cuts[0]};RED>={cuts[1]}"

    # band width and honest low-visibility flag
    F["band_width"] = (F["forecast_net_90d_p90"] - F["forecast_net_90d_p10"]).round(0)
    F["low_visibility"] = F["data_completeness"] < 0.55

    # top-3 reason codes from mechanism contributions
    M = pd.DataFrame(mech_contrib, index=F.index)
    order = np.argsort(-M.to_numpy(), axis=1)
    names = np.array(M.columns)
    for k in range(3):
        idx = order[:, k]
        vals = M.to_numpy()[np.arange(len(M)), idx]
        F[f"reason_{k+1}"] = np.where(vals > 0, names[idx], None)
        F[f"reason_{k+1}_contrib"] = np.round(vals, 4)
    return F


def credit_headroom(F, ents):
    """Headroom from projected cash flow, uncertainty and existing debt service
    — explicitly NOT a function of the tier.

    v1.1 gave every AMBER and RED enterprise exactly zero, which made headroom a
    restatement of the tier and contradicted the product's own promise that a
    flagged enterprise should be offered a bridge loan rather than a rejection.
    """
    F = F.copy()
    p10 = F["forecast_net_90d_p10"].fillna(0)
    p50 = F["forecast_net_90d_p50"].fillna(0)
    # Base capacity on OBSERVED trailing net operating cash flow, then let the
    # forecast act as a forward-looking adjustment. Using a conformally-widened
    # p10 directly makes almost every enterprise unbankable, which is the
    # opposite failure to v1.1's "every GREEN gets a big number".
    noc = F["noc_365d"].fillna(0).clip(lower=0)
    fwd_adj = np.clip(1 + (p50 * 4) / noc.replace(0, np.nan), 0.35, 1.5).fillna(0.6)
    fcf_annual = noc * 0.55 * fwd_adj
    # a bridge facility is serviced from the downside case, not the median
    max_annual_service = np.clip(fcf_annual * 0.45, 0, None)
    # uncertainty haircut: a wide band means we do not know her yet
    rel_band = (F["band_width"] / F["avg_daily_inflow_30d"].replace(0, np.nan).abs()
                / 90).fillna(1.0).clip(0, 3)
    haircut = np.clip(1 - 0.28 * rel_band, 0.30, 1.0)
    # visibility haircut
    haircut = haircut * np.where(F["low_visibility"], 0.62, 1.0)
    # repayment-behaviour haircut, and it is behaviour — not the tier label
    haircut = haircut * np.where(F["missed_emis_365d"] >= 3, 0.45,
                          np.where(F["missed_emis_365d"] >= 1, 0.72, 1.0))
    # 24-month tenor at ~13% -> annuity factor
    r_m, n_m = 0.13 / 12, 24
    af = (1 - (1 + r_m) ** -n_m) / r_m
    headroom = (max_annual_service / 12.0) * af * haircut
    headroom = np.where(F["dscr_annual"].fillna(9).lt(1.0), headroom * 0.35, headroom)
    F["credit_headroom"] = np.round(np.clip(headroom, 0, None), -2)
    F["suggested_max_emi"] = np.round(F["credit_headroom"] / af, 0)
    # a short-tenor bridge is available even in distress when cash flow allows
    # A 30-60 day bridge is serviced out of observed receipts, so it remains
    # available to a distressed but operating enterprise. This is what makes the
    # flag actionable rather than a rejection.
    bridge = F["avg_daily_inflow_30d"].fillna(0).clip(lower=0) * 18 * np.clip(haircut, 0.35, 1.0)
    bridge = bridge * np.where(F["missed_emis_90d"] >= 2, 0.55, 1.0)
    F["bridge_headroom"] = np.round(np.clip(bridge, 0, None), -2)
    return F


# --------------------------------------------------------------------------
# 5. a genuinely independent label, lag features, calibrated bands, lead time
# --------------------------------------------------------------------------
# The buffer-based `stress_within_90d` label is mechanically close to the
# `buffer_days` feature, so a high AUC against it overstates difficulty. The
# missed-repayment label below is a separately observable event and is the
# honest headline metric.

def attach_default_label(F, panel, horizon_days=90):
    """y2 = the enterprise misses a scheduled repayment within the horizon."""
    F = F.copy()
    miss = panel[(panel["emi_due"]) & (~panel["emi_paid"])][["enterprise_id", "date"]]
    by = miss.groupby("enterprise_id")["date"].apply(list).to_dict()
    lab = np.zeros(len(F), dtype=int)
    d2o = np.full(len(F), np.nan)
    for i, (eid, a) in enumerate(zip(F["enterprise_id"], F["as_of"])):
        for m in by.get(eid, []):
            dd = (m - a).days
            if 0 < dd <= horizon_days:
                lab[i] = 1
                d2o[i] = dd if np.isnan(d2o[i]) else min(d2o[i], dd)
    F["missed_repayment_within_90d"] = lab
    F["days_to_missed_repayment"] = d2o
    return F


def add_lag_features(F):
    """Year-ago and quarter-ago context. Giving the model the seasonal-naive
    value as an input is how a forecaster earns the right to be compared to it."""
    F = F.sort_values(["enterprise_id", "as_of"]).copy()
    F["net_next90_lag365"] = seasonal_naive(F)
    g = F.groupby("enterprise_id", sort=False)
    F["buffer_days_lag3m"] = g["buffer_days"].shift(3)
    F["buffer_days_delta_3m"] = F["buffer_days"] - F["buffer_days_lag3m"]
    F["net90_lag12m"] = g["net_90d"].shift(12)
    F["sales_yoy"] = (F["avg_daily_inflow_30d"] /
                      g["avg_daily_inflow_30d"].shift(12).replace(0, np.nan) - 1)
    F["dso_delta_3m"] = F["dso_days"] - g["dso_days"].shift(3)
    return F


LAG_FEATS = ["net_next90_lag365", "buffer_days_lag3m", "buffer_days_delta_3m",
             "net90_lag12m", "sales_yoy", "dso_delta_3m"]


def backtest_v2(F):
    """Two classifiers (mechanical + independent label) and a conformalised
    quantile forecast, all on a strict time split."""
    from sklearn.ensemble import HistGradientBoostingClassifier, HistGradientBoostingRegressor
    from sklearn.metrics import roc_auc_score, average_precision_score

    F = F.copy()
    feats = FEATS + LAG_FEATS
    X = F[feats].astype(float).replace([np.inf, -np.inf], np.nan).fillna(0.0)
    tr = (F["as_of"] <= SPLIT_DATE).to_numpy()
    te = ~tr
    # inner split for conformal calibration, still strictly in the past
    cal_cut = SPLIT_DATE - pd.DateOffset(months=6)
    fit = (F["as_of"] <= cal_cut).to_numpy()
    cal = tr & ~fit

    out = {}
    for name, ycol in [("stress", "stress_within_90d"),
                       ("missed_repayment", "missed_repayment_within_90d")]:
        y = F[ycol].to_numpy()
        clf = HistGradientBoostingClassifier(
            max_depth=4, learning_rate=0.06, max_iter=280,
            l2_regularization=1.0, random_state=7)
        clf.fit(X[tr], y[tr])
        p = np.zeros(len(F))
        p[te] = clf.predict_proba(X[te])[:, 1]
        p[tr] = clf.predict_proba(X[tr])[:, 1]
        br = y[te].mean()
        out[name] = dict(
            auc=roc_auc_score(y[te], p[te]),
            ap=average_precision_score(y[te], p[te]),
            base_rate=br,
            pr_lift=average_precision_score(y[te], p[te]) / br if br > 0 else np.nan,
            n_pos_test=int(y[te].sum()), n_test=int(te.sum()),
        )
        F[f"prob_{name}"] = p
    F["model_prob"] = F["prob_stress"]           # liquidity stress, all borrowers
    F["model_prob_default"] = F["prob_missed_repayment"]  # formal default, lender view

    # ---- quantile forecast with conformal widening
    m = F["actual_net_next_90d"].notna().to_numpy()
    yq = F["actual_net_next_90d"].to_numpy()
    q_pred = {}
    for q in (0.10, 0.50, 0.90):
        reg = HistGradientBoostingRegressor(
            loss="quantile", quantile=q, max_depth=4, learning_rate=0.05,
            max_iter=300, l2_regularization=1.0, random_state=7)
        reg.fit(X[fit & m], yq[fit & m])
        col = np.full(len(F), np.nan)
        sel = m
        col[sel] = reg.predict(X[sel])
        q_pred[q] = col

    # conformal scaling: widen until the calibration slice hits 80% coverage
    cm = cal & m
    lo_err = (q_pred[0.50][cm] - yq[cm]) / np.maximum(
        q_pred[0.50][cm] - q_pred[0.10][cm], 1.0)
    hi_err = (yq[cm] - q_pred[0.50][cm]) / np.maximum(
        q_pred[0.90][cm] - q_pred[0.50][cm], 1.0)
    k_lo = float(np.nanquantile(lo_err, 0.90))
    k_hi = float(np.nanquantile(hi_err, 0.90))
    k_lo, k_hi = max(k_lo, 1.0), max(k_hi, 1.0)
    p10 = q_pred[0.50] - k_lo * (q_pred[0.50] - q_pred[0.10])
    p90 = q_pred[0.50] + k_hi * (q_pred[0.90] - q_pred[0.50])
    _st = np.sort(np.vstack([p10, q_pred[0.50], p90]), axis=0)
    p10, q_pred[0.50], p90 = _st[0], _st[1], _st[2]
    F["forecast_net_90d_p10"] = np.round(p10)
    F["forecast_net_90d_p50"] = np.round(q_pred[0.50])
    F["forecast_net_90d_p90"] = np.round(p90)
    out["conformal_k"] = (round(k_lo, 3), round(k_hi, 3))

    ev = te & m
    F["baseline_seasonal_naive"] = F["net_next90_lag365"]
    ok = ev & F["baseline_seasonal_naive"].notna().to_numpy()
    mae_model = float(np.abs(q_pred[0.50][ok] - yq[ok]).mean())
    mae_naive = float(np.abs(F["baseline_seasonal_naive"].to_numpy()[ok] - yq[ok]).mean())
    # Holt-Winters-style baseline: trailing 90d net scaled by seasonal ratio
    hw = F["net_90d"].to_numpy() * (F["season_index_fwd3"] / F["season_index_now"]).to_numpy()
    mae_hw = float(np.abs(hw[ok] - yq[ok]).mean())
    out["forecast"] = dict(
        mae_model=mae_model, mae_seasonal_naive=mae_naive, mae_holt_winters=mae_hw,
        improvement_vs_naive_pct=(1 - mae_model / mae_naive) * 100,
        improvement_vs_hw_pct=(1 - mae_model / mae_hw) * 100,
        coverage=float(((yq[ev] >= p10[ev]) & (yq[ev] <= p90[ev])).mean()),
        n_eval=int(ok.sum()),
    )
    return F, out


def lead_time(F, episodes, panel):
    """Days between the first AMBER-or-worse assessment and the first missed
    repayment. Measured, not asserted — and only on the out-of-time test period.
    """
    rows = []
    flagged = F[(F["risk_tier"] != "GREEN")][["enterprise_id", "as_of", "fused_score", "risk_tier"]]
    fl = {e: g.sort_values("as_of") for e, g in flagged.groupby("enterprise_id")}
    for _, ep in episodes.iterrows():
        fm = ep["first_missed_repayment"]
        if pd.isna(fm) or fm <= SPLIT_DATE:
            continue
        g = fl.get(ep["enterprise_id"])
        if g is None:
            rows.append(dict(episode_id=ep["episode_id"], enterprise_id=ep["enterprise_id"],
                             first_missed_repayment=fm, first_flag=pd.NaT,
                             lead_days=np.nan, caught=False))
            continue
        # earliest flag that precedes the miss, within a 12-month lookback
        cand = g[(g["as_of"] < fm) & (g["as_of"] >= fm - pd.DateOffset(months=12))]
        if not len(cand):
            rows.append(dict(episode_id=ep["episode_id"], enterprise_id=ep["enterprise_id"],
                             first_missed_repayment=fm, first_flag=pd.NaT,
                             lead_days=np.nan, caught=False))
            continue
        # walk back to the start of the contiguous flagged run
        runs = cand.sort_values("as_of")
        first = runs["as_of"].iloc[-1]
        for i in range(len(runs) - 1, 0, -1):
            gap = (runs["as_of"].iloc[i] - runs["as_of"].iloc[i - 1]).days
            if gap <= 40:
                first = runs["as_of"].iloc[i - 1]
            else:
                break
        rows.append(dict(episode_id=ep["episode_id"], enterprise_id=ep["enterprise_id"],
                         first_missed_repayment=fm, first_flag=first,
                         lead_days=int((fm - first).days), caught=True))
    return pd.DataFrame(rows)


def reason_code_accuracy(F, episodes):
    """Does the top reason code match the mechanism the simulator actually used?

    This is the metric the causal simulator exists to make possible, and no
    competitor working from real but unlabelled data can compute it.
    """
    rows = []
    for _, ep in episodes.iterrows():
        a_window = F[(F["enterprise_id"] == ep["enterprise_id"]) &
                     (F["as_of"] < ep["onset_date"]) &
                     (F["as_of"] >= ep["onset_date"] - pd.DateOffset(days=95))]
        if not len(a_window):
            continue
        row = a_window.sort_values("as_of").iloc[-1]
        top3 = [row.get("reason_1"), row.get("reason_2"), row.get("reason_3")]
        rows.append(dict(episode_id=ep["episode_id"], true_mechanism=ep["mechanism"],
                         predicted_1=top3[0], in_top1=(top3[0] == ep["mechanism"]),
                         in_top3=(ep["mechanism"] in [t for t in top3 if t])))
    return pd.DataFrame(rows)
