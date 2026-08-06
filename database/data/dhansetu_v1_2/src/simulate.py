"""
DHANSETU synthetic panel — causal simulator.

Every rupee in the output traces to a named driver. The driver decomposition is
retained per enterprise-day so that a reason code can be checked against the
mechanism that actually produced the stress, rather than merely looking
plausible.

Cash-flow physics implemented per sector:
  DAIRY       daily production, co-operative settles every 10 days.
              Yield falls with heat (THI); fodder cost peaks Apr-Jun.
              -> margin squeeze from two curves moving in opposite directions.
  POULTRY     42-day grow-out + 7-day cleanout. Near-zero inflow for ~42 days,
              then a single lump-sum realisation. Feed bought on dealer credit,
              which is the real lender and is repaid at realisation.
  HANDICRAFT  order-book revenue, 55-95 day terms, one dominant buyer.
  FOODPROC    weekly consignments to retailers on 42-62 day credit.
  RETAIL      mixed cash + informal village udhaar, 12-75 days, real bad debt.
"""
import numpy as np
import pandas as pd
from datetime import date, timedelta
import refdata as R


# --------------------------------------------------------------------------
# helpers
# --------------------------------------------------------------------------

def calendar():
    d = pd.date_range(R.PANEL_START, R.PANEL_END, freq="D")
    return pd.DataFrame({
        "date": d,
        "t": np.arange(len(d)),
        "month": d.month,
        "year": d.year,
        "dom": d.day,
        "dow": d.dayofweek,
    })


def ar1(n, rho, sigma, rng):
    """Stationary AR(1) with unit mean, used for demand/price noise."""
    e = rng.normal(0, sigma, n)
    x = np.zeros(n)
    for i in range(1, n):
        x[i] = rho * x[i - 1] + e[i]
    return 1.0 + x


def festival_index(cal, rng):
    """Diwali / Navratri / Onam-Bihu style demand bumps, date-shifted per year."""
    ix = np.zeros(len(cal))
    peaks = {2023: "2023-11-12", 2024: "2024-10-31", 2025: "2025-10-20", 2026: "2026-11-08"}
    for y, p in peaks.items():
        p = pd.Timestamp(p)
        delta = (cal["date"] - p).dt.days.to_numpy()
        ix += 0.55 * np.exp(-(delta ** 2) / (2 * 11.0 ** 2))
    # Shrawan / Sawan meat-abstinence window depresses poultry
    return ix


def shrawan_mask(cal):
    """Approximate Shrawan window per year — poultry demand collapse."""
    m = np.zeros(len(cal), dtype=bool)
    for a, b in [("2023-08-17", "2023-09-15"), ("2024-08-05", "2024-09-03"),
                 ("2025-07-25", "2025-08-23"), ("2026-08-13", "2026-09-11")]:
        m |= ((cal["date"] >= a) & (cal["date"] <= b)).to_numpy()
    return m


# --------------------------------------------------------------------------
# 1. weather
# --------------------------------------------------------------------------

def build_weather(cal, rng):
    rows = []
    for did, dname, state, lang, zone, rain_yr, cyc in R.DISTRICTS:
        rain_c = np.array(R.RAIN_CLIMATOLOGY[did], dtype=float)
        temp_c = np.array(R.TEMP_CLIMATOLOGY[did], dtype=float)
        m = cal["month"].to_numpy() - 1
        # daily rainfall: gamma draws scaled so monthly totals match climatology
        exp_daily = rain_c[m] / 30.0
        wet = rng.random(len(cal)) < np.clip(exp_daily / 12.0 + 0.05, 0.03, 0.75)
        rain = np.where(wet, rng.gamma(1.6, np.maximum(exp_daily, 0.2) / 1.6 * 3.2), 0.0)
        tmax = temp_c[m] + rng.normal(0, 1.9, len(cal))
        rh = np.clip(38 + 0.055 * rain_c[m] + rng.normal(0, 6, len(cal)), 20, 96)
        # Temperature-humidity index: the physiologically correct heat-stress
        # measure for dairy cattle. Above ~78 milk yield declines measurably.
        thi = 0.8 * tmax + rh / 100.0 * (tmax - 14.4) + 46.4
        rows.append(pd.DataFrame({
            "district_id": did, "obs_date": cal["date"], "rainfall_mm": rain.round(2),
            "temp_max_c": tmax.round(1), "humidity_pct": rh.round(1), "thi": thi.round(2),
        }))
    w = pd.concat(rows, ignore_index=True)
    # 30-day rainfall anomaly vs the district's own climatology
    w["rain_30d"] = w.groupby("district_id")["rainfall_mm"].transform(
        lambda s: s.rolling(30, min_periods=1).sum())
    norm = w.groupby(["district_id", w["obs_date"].dt.month])["rain_30d"].transform("mean")
    w["rain_anomaly_pct"] = ((w["rain_30d"] / norm.replace(0, np.nan) - 1) * 100).fillna(0).round(1)
    w["source"] = "open_meteo_era5_synthetic"
    return w


# --------------------------------------------------------------------------
# 2. commodity prices  (commodity x district x date  — never keyed by persona)
# --------------------------------------------------------------------------

def build_prices(cal, rng, events):
    n = len(cal)
    t = cal["t"].to_numpy()
    m = cal["month"].to_numpy()
    rows = []
    for cid, cname, unit, base, trend, peak, amp in R.COMMODITIES:
        for did, dname, *_ in R.DISTRICTS:
            seas = 1 + amp * np.cos(2 * np.pi * (m - peak) / 12.0)
            drift = 1 + (trend / 100.0) * (t / 365.25)
            noise = ar1(n, 0.985, 0.0045, rng)
            local = 1 + rng.normal(0, 0.03)          # district basis
            p = base * seas * drift * noise * local

            # Sticky administered price: a co-operative revises the milk
            # procurement rate in steps, not continuously. This is precisely
            # why the margin squeeze happens — cost drifts daily, revenue
            # only moves twice a year.
            if cid == "CM01":
                steps = np.zeros(n)
                for k in range(0, n, 183):
                    steps[k:] = p[k]
                p = steps

            # apply cost-push events
            for ev in events:
                if ev["district_id"] == did and cid in ev.get("price_commodities", []):
                    sl = (cal["date"] >= ev["start_date"]) & (cal["date"] <= ev["end_date"])
                    ramp = np.linspace(1.0, ev["price_mult"], sl.sum())
                    p = p.copy()
                    p[sl.to_numpy()] *= ramp
                    p[cal["date"].to_numpy() > np.datetime64(ev["end_date"])] *= ev["price_mult"] * 0.55 + 0.45

            rows.append(pd.DataFrame({
                "commodity_id": cid, "district_id": did, "price_date": cal["date"],
                "modal_price": p.round(2), "unit": unit,
                "source": "agmarknet_synthetic",
            }))
    return pd.concat(rows, ignore_index=True)


# --------------------------------------------------------------------------
# 3. shock events, with scope validated to be non-empty
# --------------------------------------------------------------------------

def build_events(enterprises):
    """Expand declared events into per-district rows and per-enterprise scope.

    v1.1 bug fixed here: an event whose (district x sector) scope matched zero
    enterprises was silently dropped. Now the scope is materialised and an
    empty scope raises.
    """
    ev_rows, scope_rows = [], []
    price_map = {
        "heatwave": (["CM02", "CM04"], 1.12),
        "feed_price_shock": (["CM04"], 1.18),
        "fuel_spike": (["CM09", "CM07", "CM08"], 1.09),
        "milk_price_freeze": ([], 1.0),
        "mandi_strike": (["CM06", "CM07"], 1.06),
        "flood": (["CM07"], 1.14),
        "cyclone": (["CM07"], 1.10),
        "avian_influenza": (["CM03"], 0.78),
        "export_order_cancellation": ([], 1.0),
    }
    for code, etype, start, days, dists, sectors, im, om, sev, desc in R.SHOCK_EVENTS:
        start_d = pd.Timestamp(start)
        end_d = start_d + pd.Timedelta(days=days - 1)
        pc, pm = price_map.get(etype, ([], 1.0))
        for did in dists:
            ev_rows.append(dict(
                event_id=f"{code}-D{did}", event_code=code, event_type=etype,
                district_id=did, start_date=start_d, end_date=end_d,
                duration_days=days, sectors="|".join(sectors),
                inflow_mult=im, outflow_mult=om, price_commodities=pc, price_mult=pm,
                severity=sev, description=desc,
            ))
        scope = enterprises[
            enterprises["district_id"].isin(dists) & enterprises["sector"].isin(sectors)
        ]
        if scope.empty:
            raise AssertionError(
                f"event {code} ({etype}) matches zero enterprises: "
                f"districts={dists} sectors={sectors}"
            )
        for eid in scope["enterprise_id"]:
            scope_rows.append(dict(event_code=code, enterprise_id=eid))
    return pd.DataFrame(ev_rows), pd.DataFrame(scope_rows)


# --------------------------------------------------------------------------
# 4. enterprise roster
# --------------------------------------------------------------------------

FIRST_F = {
    "gu": ["Lakshmiben", "Hansaben", "Jyotiben", "Rekhaben", "Nirmalaben", "Bhavnaben", "Kokilaben", "Dakshaben"],
    "hi": ["Sunita", "Kamla", "Pushpa", "Rekha", "Savitri", "Meera", "Radha", "Sarita"],
    "te": ["Lakshmi", "Padma", "Sujatha", "Vijaya", "Anitha", "Swaroopa", "Jyothi", "Sarala"],
    "mr": ["Shubhangi", "Manisha", "Anita", "Kalpana", "Sushma", "Rohini", "Archana"],
    "as": ["Nilima", "Rupali", "Bornali", "Junmoni", "Anjali", "Mridula", "Purabi", "Dipali"],
    "or": ["Basanti", "Sasmita", "Pramila", "Anjali", "Sarojini", "Namita", "Kuni", "Sabita"],
}
FIRST_M = {
    "gu": ["Rameshbhai", "Dineshbhai", "Kiritbhai", "Mahendrabhai", "Jayantibhai", "Ashokbhai"],
    "hi": ["Ram Lal", "Shyam", "Mohan", "Banwari", "Kailash", "Girdhari"],
    "te": ["Suresh", "Venkatesh", "Srinivas", "Narayana", "Ramulu", "Anjaneyulu"],
    "mr": ["Sandeep", "Vitthal", "Bhausaheb", "Nitin", "Dattatray", "Popat"],
    "as": ["Dhruba", "Bhupen", "Jiten", "Pranab", "Hemanta", "Nabin"],
    "or": ["Sanjay", "Bipin", "Trilochan", "Jagabandhu", "Prafulla", "Niranjan"],
}
SUR = {
    "gu": ["Patel", "Desai", "Rathod", "Solanki", "Chaudhari", "Vaghela"],
    "hi": ["Devi", "Kumhar", "Jat", "Meena", "Sharma", "Regar"],
    "te": ["Reddy", "Goud", "Yadav", "Rao", "Naidu", "Mudiraj"],
    "mr": ["Patil", "Kulkarni", "Jadhav", "Shinde", "More", "Kadam"],
    "as": ["Bora", "Saikia", "Das", "Hazarika", "Nath", "Kalita"],
    "or": ["Pradhan", "Behera", "Sahu", "Patra", "Nayak", "Mohanty"],
}
BIZ = {
    "ST01": ["Dairy", "Gopal Dairy", "Dudh Utpadak"],
    "ST02": ["Poultry Farm", "Broiler Unit", "Murgi Palan"],
    "ST03": ["Handloom", "Weavers Unit", "Taant Ghar"],
    "ST04": ["Pottery Works", "Terracotta Unit", "Kumhar Kala"],
    "ST05": ["Tailors", "Silai Kendra", "Boutique"],
    "ST06": ["Farmer Producer Co", "Krishi FPO", "Agri Producer Co"],
    "ST07": ["Mahila SHG Foods", "Swasahayata Foods", "Annapurna Unit"],
    "ST08": ["Kirana Store", "General Stores", "Provision Store"],
    "ST09": ["Vegetable Cart", "Sabzi Stall", "Fresh Greens"],
}


def build_enterprises(rng):
    sub_meta = {s[0]: dict(label=s[1], sector=s[2], turnover=s[3]) for s in R.SUB_TYPES}
    dist_meta = {d[0]: dict(name=d[1], state=d[2], lang=d[3], zone=d[4]) for d in R.DISTRICTS}
    named = {p["enterprise_id"]: p for p in R.NAMED_PERSONAS}

    slots = []
    for did, mix in R.DISTRICT_MIX.items():
        for st, k in mix.items():
            slots += [(did, st)] * k
    assert len(slots) == 252, len(slots)

    # place named personas on the right (district, sub_type) slot
    rows = []
    used_ids = set()
    for p in R.NAMED_PERSONAS:
        key = (p["district_id"], p["sub_type"])
        slots.remove(key)
        rows.append(key + (p["enterprise_id"],))
        used_ids.add(p["enterprise_id"])
    rng.shuffle(slots)
    free_ids = [f"ENT{i:04d}" for i in range(1, 253) if f"ENT{i:04d}" not in used_ids]
    for (did, st), eid in zip(slots, free_ids):
        rows.append((did, st, eid))

    officer_by_district = {o[3]: o[0] for o in R.OFFICERS}

    out = []
    for did, st, eid in sorted(rows, key=lambda r: r[2]):
        meta = sub_meta[st]
        dm = dist_meta[did]
        lang = dm["lang"]
        np_ = named.get(eid)

        if np_:
            name = np_["name"]
            biz = f"{np_['name'].split()[0]} {rng.choice(BIZ[st])}"
            turnover = np_["daily_turnover"]
            dig0, digs = np_["digital_start"], np_["digital_slope"]
            channel, shared, lit = np_["channel"], np_["shared_device"], np_["literacy"]
            age = np_["age"]
            script = np_["stress_script"]
        else:
            female = rng.random() < (0.78 if st in ("ST01", "ST03", "ST04", "ST05", "ST07") else 0.42)
            first = rng.choice(FIRST_F[lang] if female else FIRST_M[lang])
            name = f"{first} {rng.choice(SUR[lang])}"
            biz = f"{rng.choice(['Shree', 'Jai', 'Maa', 'Sri', 'Nav'])} {rng.choice(BIZ[st])}"
            turnover = float(meta["turnover"] * np.exp(rng.normal(0, 0.42)))
            # ~14% of the panel is deliberately cash-dominant so that the
            # low-visibility path has demo cases.
            cash_heavy = rng.random() < 0.14
            dig0 = rng.uniform(0.02, 0.14) if cash_heavy else rng.uniform(0.28, 0.72)
            digs = rng.uniform(0.005, 0.03) if cash_heavy else rng.uniform(0.04, 0.14)
            channel = ("ivr" if cash_heavy and rng.random() < 0.45
                       else "assisted" if cash_heavy else "app")
            shared = bool(rng.random() < (0.42 if female else 0.11))
            lit = rng.choice(["low", "medium", "numerate"], p=[0.34, 0.44, 0.22])
            age = int(rng.integers(24, 61))
            script = None

        out.append(dict(
            enterprise_id=eid,
            proprietor_name=name,
            business_name=biz,
            age=age,
            sub_type_id=st,
            sub_type=meta["label"],
            sector=meta["sector"],
            district_id=did,
            district=dm["name"],
            state=dm["state"],
            agro_zone=dm["zone"],
            block=f"{dm['name']} {rng.choice(['North', 'South', 'East', 'West', 'Rural'])}",
            # Offset from district centroid, kept small (~2km) so the enterprise
            # still falls inside the district HQ town's built-up area rather
            # than out in open countryside — district_geo's centroid is the
            # town itself, not just an arbitrary point in the district.
            lat=round(float(rng.uniform(-0.02, 0.02)), 5),
            lon=round(float(rng.uniform(-0.02, 0.02)), 5),
            preferred_lang=dm["lang"],
            preferred_channel=channel,
            literacy=lit,
            shared_device=shared,
            officer_id=officer_by_district[did],
            shg_id=f"SHG{did:02d}{int(rng.integers(1, 40)):03d}" if rng.random() < 0.72 else None,
            onboarded_on=pd.Timestamp(R.PANEL_START) + pd.Timedelta(days=int(rng.integers(0, 21))),
            baseline_turnover=round(turnover, 0),
            _health=(str(rng.choice(["robust", "marginal", "fragile"], p=[0.57, 0.26, 0.17]))
                     if script is None else
                     {"dairy_margin_squeeze": "marginal",
                      "poultry_feed_shock": "marginal",
                      "handicraft_buyer_default": "fragile",
                      "foodproc_receivable_stretch": "marginal",
                      "retail_udhaar_spiral": "fragile"}[script]),
            digital_share_start=round(dig0, 3),
            digital_share_slope=round(digs, 4),
            _stress_script=script,
            _seed=int(rng.integers(0, 2 ** 31)),
        ))
    df = pd.DataFrame(out)
    assert len(df) == 252 and df["enterprise_id"].is_unique
    return df


# --------------------------------------------------------------------------
# 5. loans — real reducing-balance amortisation
# --------------------------------------------------------------------------

def build_loans(ents, rng):
    """v1.1 bug fixed: loan_outstanding now actually amortises, and mid-panel
    disbursements exist so that rising leverage is detectable."""
    loans, sched = [], []
    start, end = pd.Timestamp(R.PANEL_START), pd.Timestamp(R.PANEL_END)
    lenders = ["Anand DCCB", "Bhilwara SFB", "Nizamabad RRB", "Kolhapur DCCB",
               "Assam Gramin VB", "Odisha Gramya Bank", "Bharat MFI", "Sanchay NBFC"]
    scheme_by_sector = {}
    for sid, nm, secs, dt, dv, ef, desc in R.SCHEMES:
        if dt == "emi_relief_pct":
            for s in secs:
                scheme_by_sector[s] = (sid, dv, pd.Timestamp(ef))

    for _, e in ents.iterrows():
        r = np.random.default_rng(e["_seed"])
        n_loans = r.choice([0, 1, 1, 1, 2], p=[0.22, 0.30, 0.24, 0.14, 0.10])
        for k in range(n_loans):
            principal = float(np.round(e["baseline_turnover"] * r.uniform(28, 145), -3))
            principal = max(15000.0, min(principal, 900000.0))
            tenor = int(r.choice([12, 18, 24, 30, 36, 48, 60]))
            rate_bps = int(r.choice([950, 1050, 1150, 1250, 1400, 1650, 2100]))
            # first loan may pre-date the panel; second is always mid-panel
            if k == 0:
                disb = start - pd.Timedelta(days=int(r.integers(0, 500)))
            else:
                disb = start + pd.Timedelta(days=int(r.integers(200, 900)))
            loan_id = f"LN{e['enterprise_id'][3:]}{k+1}"
            sc = scheme_by_sector.get(e["sector"])
            loans.append(dict(
                loan_id=loan_id, enterprise_id=e["enterprise_id"],
                lender=str(r.choice(lenders)), principal=principal,
                annual_rate_bps=rate_bps, tenor_months=tenor,
                disbursed_on=disb, scheme_id=sc[0] if sc else None,
            ))
            i = rate_bps / 10000.0 / 12.0
            emi = principal * i * (1 + i) ** tenor / ((1 + i) ** tenor - 1)
            bal = principal
            for inst in range(1, tenor + 1):
                due = (disb + pd.DateOffset(months=inst)).normalize()
                interest = bal * i
                subv = 0.0
                emi_eff = emi
                if sc and due >= sc[2]:
                    subv = emi * sc[1]
                    emi_eff = emi - subv
                principal_part = min(emi - interest, bal)
                bal = max(0.0, bal - principal_part)
                sched.append(dict(
                    loan_id=loan_id, enterprise_id=e["enterprise_id"],
                    installment_no=inst, due_date=due,
                    emi_scheduled=round(emi, 2), subvention=round(subv, 2),
                    emi_payable=round(emi_eff, 2),
                    interest_component=round(interest, 2),
                    principal_component=round(principal_part, 2),
                    closing_balance=round(bal, 2),
                ))
    L = pd.DataFrame(loans)
    S = pd.DataFrame(sched)
    S = S[(S["due_date"] >= start) & (S["due_date"] <= end)].reset_index(drop=True)
    return L, S


# --------------------------------------------------------------------------
# 6. the daily panel
# --------------------------------------------------------------------------

INVOICE_CADENCE = {"DAIRY": 10, "POULTRY": None, "HANDICRAFT": 30, "FOODPROC": 7, "RETAIL": 7}


def simulate_panel(ents, cal, weather, prices, events_df, loans, sched, rng):
    n = len(cal)
    dates = cal["date"].to_numpy()
    month = cal["month"].to_numpy()
    fest = festival_index(cal, rng)
    shrawan = shrawan_mask(cal)

    wx = {d: g.reset_index(drop=True) for d, g in weather.groupby("district_id")}
    px = {(c, d): g["modal_price"].to_numpy()
          for (c, d), g in prices.groupby(["commodity_id", "district_id"])}
    ev_by_dist = {d: g for d, g in events_df.groupby("district_id")}
    sched_by_ent = {e: g.sort_values("due_date") for e, g in sched.groupby("enterprise_id")}
    loans_by_ent = {e: g for e, g in loans.groupby("enterprise_id")}

    subs_inflow, subs_outflow = [], []
    for sid, nm, secs, dt, dv, ef, desc in R.SCHEMES:
        if dt == "inflow_mult":
            subs_inflow.append((secs, dv, pd.Timestamp(ef)))
        elif dt == "outflow_mult":
            subs_outflow.append((secs, dv, pd.Timestamp(ef)))

    panel_rows, recv_rows, settle_rows, batch_rows, episode_rows = [], [], [], [], []

    for _, e in ents.iterrows():
        r = np.random.default_rng(e["_seed"] + 7)
        eid, sec, did = e["enterprise_id"], e["sector"], e["district_id"]
        W = wx[did]
        rev_c = R.SECTOR_COMMODITIES[sec]["revenue"]
        cost_c = R.SECTOR_COMMODITIES[sec]["cost"]
        p_rev = px[(rev_c, did)] / px[(rev_c, did)][:60].mean()
        p_cost = px[(cost_c, did)] / px[(cost_c, did)][:60].mean()

        seas_in = np.array(R.SEASONALITY_INFLOW[sec])[month - 1]
        seas_out = np.array(R.SEASONALITY_OUTFLOW[sec])[month - 1]

        # ---------------- climate stress, sector-specific ----------------
        thi = W["thi"].to_numpy()
        rain_an = W["rain_anomaly_pct"].to_numpy()
        if sec == "DAIRY":
            # THI above 78 depresses yield; this is the physiological mechanism
            climate = 1.0 - 0.011 * np.clip(thi - 78, 0, None)
        elif sec == "POULTRY":
            climate = 1.0 - 0.008 * np.clip(thi - 80, 0, None)
        elif sec in ("FOODPROC", "RETAIL"):
            climate = 1.0 - 0.0016 * np.clip(np.abs(rain_an) - 35, 0, None)
        else:
            climate = 1.0 - 0.0010 * np.clip(np.abs(rain_an) - 45, 0, None)
        climate = np.clip(climate, 0.55, 1.10)

        demand = ar1(n, 0.94, 0.028, r)
        if sec in ("RETAIL", "HANDICRAFT"):
            demand = demand * (1 + 0.9 * fest)
        if sec == "POULTRY":
            demand = demand * np.where(shrawan, 0.62, 1.0)

        # ---------------- event overlays ----------------
        ev_in = np.ones(n); ev_out = np.ones(n)
        ev_tag = np.array([None] * n, dtype=object)
        recv_delay_shock = np.zeros(n)
        if did in ev_by_dist:
            for _, ev in ev_by_dist[did].iterrows():
                if sec not in ev["sectors"].split("|"):
                    continue
                sl = (dates >= np.datetime64(ev["start_date"])) & (dates <= np.datetime64(ev["end_date"]))
                ev_in[sl] *= ev["inflow_mult"]
                ev_out[sl] *= ev["outflow_mult"]
                ev_tag[sl] = ev["event_code"]
                if ev["event_type"] == "export_order_cancellation":
                    recv_delay_shock[sl] += 55
                if ev["event_type"] in ("flood", "cyclone", "mandi_strike"):
                    recv_delay_shock[sl] += 18

        # ---------------- named-persona stress scripts ----------------
        script = e["_stress_script"]
        script_boost = np.ones(n)
        if script == "dairy_margin_squeeze":
            # Cost curve steepens through to the panel end while the procurement
            # price stays sticky, so the squeeze is still active on the last day
            # and the forward 90-day projection shows the September shortfall.
            ramp = np.clip((cal["t"].to_numpy() - (n - 500)) / 500.0, 0, 1) ** 0.8
            p_cost = p_cost * (1 + 0.34 * ramp)
            script_boost = 1 - 0.11 * ramp
        elif script == "poultry_feed_shock":
            ramp = np.clip((cal["t"].to_numpy() - (n - 300)) / 300.0, 0, 1)
            p_cost = p_cost * (1 + 0.22 * ramp)
        elif script == "handicraft_buyer_default":
            recv_delay_shock = recv_delay_shock + np.where(
                cal["t"].to_numpy() > n - 260, 42, 0)
        elif script == "foodproc_receivable_stretch":
            recv_delay_shock = recv_delay_shock + np.where(
                cal["t"].to_numpy() > n - 220, 34, 0)
        elif script == "retail_udhaar_spiral":
            script_boost = 1 - 0.10 * np.clip((cal["t"].to_numpy() - (n - 340)) / 340.0, 0, 1)

        # ---------------- subsidy multipliers ----------------
        sub_in = np.ones(n); sub_out = np.ones(n)
        for secs, dv, ef in subs_inflow:
            if sec in secs:
                sub_in[dates >= np.datetime64(ef)] *= dv
        for secs, dv, ef in subs_outflow:
            if sec in secs:
                sub_out[dates >= np.datetime64(ef)] *= dv

        # ---------------- accrued sales ----------------
        base = e["baseline_turnover"]
        sales = base * seas_in * climate * demand * p_rev * ev_in * sub_in * script_boost
        onb = np.datetime64(e["onboarded_on"])

        # Health latent: controls the input-cost ratio, and therefore how much
        # headroom the enterprise has before a shock becomes distress. This is
        # what sets the stress base rate rather than leaving it to emerge.
        health = e["_health"]
        cost_ratio = {"robust": (0.46, 0.58), "marginal": (0.60, 0.71),
                      "fragile": (0.67, 0.77)}[health]
        cost_base = base * r.uniform(*cost_ratio)
        costs = cost_base * seas_out * p_cost * ev_out * sub_out * ar1(n, 0.9, 0.02, r)

        # ---------------- POULTRY: real 42-day batch cycle ----------------
        batch_id = np.zeros(n, dtype=int)
        batch_day = np.full(n, -1)
        if sec == "POULTRY":
            sales_batch = np.zeros(n)
            costs_batch = np.zeros(n)
            dealer_credit = np.zeros(n)
            dc = 0.0
            i, b = int(r.integers(0, 14)), 0
            while i < n:
                grow = 42
                clean = int(r.integers(6, 10))
                b += 1
                # placement: chicks + first feed lot, part on dealer credit
                hf = {'robust': 0.86, 'marginal': 1.0, 'fragile': 1.14}[health]
                place_cost = base * r.uniform(5.4, 7.4) * p_cost[i] * hf
                costs_batch[i] += place_cost * 0.45
                dc += place_cost * 0.55
                for j in range(grow):
                    k = i + j
                    if k >= n:
                        break
                    batch_id[k] = b
                    batch_day[k] = j
                    feed = base * r.uniform(0.32, 0.44) * (0.4 + 1.9 * j / grow) * p_cost[k] * hf
                    dc += feed * 0.72                 # feed dealer is the real lender
                    costs_batch[k] += feed * 0.28
                    dealer_credit[k] = dc
                k = i + grow
                if k < n:
                    # single lump-sum realisation, then dealer credit is cleared
                    live_wt = base * r.uniform(34, 46)
                    realisation = live_wt * p_rev[k] * seas_in[k] * climate[k] * demand[k] * ev_in[k]
                    sales_batch[k] = realisation
                    costs_batch[k] += dc
                    batch_rows.append(dict(
                        batch_id=f"{eid}-B{b:02d}", enterprise_id=eid,
                        placed_on=pd.Timestamp(dates[i]), realised_on=pd.Timestamp(dates[k]),
                        grow_days=grow, chicks_placed=int(live_wt / r.uniform(1.6, 2.1)),
                        placement_cost=round(place_cost, 0),
                        feed_on_dealer_credit=round(dc - place_cost * 0.55, 0),
                        realisation=round(realisation, 0),
                        realisation_price=round(float(p_rev[k] * 92), 2),
                    ))
                    dc = 0.0
                    batch_id[k] = b
                    batch_day[k] = grow
                for j in range(clean):
                    kk = k + 1 + j
                    if kk < n:
                        batch_day[kk] = -1
                        costs_batch[kk] += base * 0.06
                i = k + 1 + clean
            sales = sales_batch
            costs = costs_batch
        else:
            dealer_credit = np.zeros(n)

        sales[dates < onb] = 0.0
        sales = np.maximum(sales, 0.0)
        costs = np.maximum(costs, 0.0)

        # ---------------- receivables & settlement ----------------
        rt = R.RECEIVABLE_TERMS[sec]
        credit_share = r.uniform(*rt["credit_share"])
        cash_in = np.zeros(n)
        pending = 0.0
        cadence = INVOICE_CADENCE[sec]
        buyers = ([f"{eid}-BUY1"] if rt["concentration"] > 0.7 else
                  [f"{eid}-BUY{i}" for i in range(1, 4)])
        inv_k = 0

        def cut_invoice(idx, amount):
            nonlocal inv_k
            if amount <= 0:
                return
            inv_k += 1
            terms = int(r.integers(*rt["terms"])) if rt["terms"][0] < rt["terms"][1] else rt["terms"][0]
            due_i = min(n - 1, idx + terms)
            delay = int(max(0, r.normal(4, 6) + recv_delay_shock[idx]))
            bad = r.random() < rt["bad_debt"]
            settle_i = None if bad else min(n - 1, due_i + delay)
            rid = f"{eid}-R{inv_k:04d}"
            recv_rows.append(dict(
                receivable_id=rid, enterprise_id=eid,
                counterparty_ref=str(r.choice(buyers)),
                counterparty_type=("cooperative" if sec == "DAIRY" else
                                   "trader" if sec == "POULTRY" else
                                   "exporter" if sec == "HANDICRAFT" else
                                   "retailer" if sec == "FOODPROC" else "village_credit"),
                invoice_date=pd.Timestamp(dates[idx]),
                due_date=pd.Timestamp(dates[due_i]),
                amount=round(amount, 0),
                is_informal=(sec == "RETAIL"),
                settled_on=None if settle_i is None else pd.Timestamp(dates[settle_i]),
                write_off=bool(bad),
            ))
            if settle_i is not None:
                cash_in[settle_i] += amount
                settle_rows.append(dict(receivable_id=rid, enterprise_id=eid,
                                        settled_on=pd.Timestamp(dates[settle_i]),
                                        amount=round(amount, 0)))

        for i in range(n):
            s = sales[i]
            if s <= 0:
                continue
            cash_in[i] += s * (1 - credit_share)
            pending += s * credit_share
            if sec == "POULTRY":
                if pending > 0:
                    cut_invoice(i, pending); pending = 0.0
            elif cadence and ((i + 1) % cadence == 0):
                cut_invoice(i, pending); pending = 0.0
        if pending > 0:
            cut_invoice(n - 1, pending)

        # ---------------- household drawings, EMI, balance ----------------
        draw_ratio = {'robust': (0.07, 0.12), 'marginal': (0.09, 0.14),
                      'fragile': (0.11, 0.17)}[health]
        drawings = base * r.uniform(*draw_ratio) * (1 + 0.25 * fest) * ar1(n, 0.8, 0.05, r)
        drawings[dates < onb] = 0

        emi_due = np.zeros(n, dtype=bool)
        emi_amt = np.zeros(n)
        emi_paid = np.zeros(n, dtype=bool)
        loan_bal = np.zeros(n)
        sc = sched_by_ent.get(eid)
        if sc is not None:
            idx = {pd.Timestamp(d): i for i, d in enumerate(dates)}
            for _, s in sc.iterrows():
                i = idx.get(pd.Timestamp(s["due_date"]))
                if i is not None:
                    emi_due[i] = True
                    emi_amt[i] = s["emi_payable"]
            # outstanding balance steps down at each installment
            bal_series = np.full(n, np.nan)
            for _, s in sc.iterrows():
                i = idx.get(pd.Timestamp(s["due_date"]))
                if i is not None:
                    bal_series[i] = s["closing_balance"]
            # carry disbursement amounts forward from disbursement date
            lo = loans_by_ent.get(eid)
            if lo is not None:
                for _, l in lo.iterrows():
                    di = idx.get(pd.Timestamp(l["disbursed_on"]))
                    if di is not None:
                        bal_series[di] = np.nansum([
                            bal_series[di] if not np.isnan(bal_series[di]) else 0.0,
                            l["principal"]])
                        cash_in[di] += l["principal"]
            loan_bal = pd.Series(bal_series).ffill().bfill().fillna(0).to_numpy()

        # sequential balance: EMI is missed when there is genuinely no cash
        savings = np.zeros(n)
        informal = np.zeros(n)
        bal = float(e["baseline_turnover"]) * r.uniform(11, 46)
        outflow = np.zeros(n)
        draw_actual = drawings.copy()
        inf_debt = 0.0
        monthly_out = float(np.mean(costs[:90]) + np.mean(drawings[:90])) * 30 + 1.0
        deployed = np.zeros(n)
        # Poultry and handicrafts must hold more cash: a 42-day batch cycle and a
        # 90-day receivable cycle both require a bigger working-cash cushion.
        buffer_target = {"POULTRY": 3.4, "HANDICRAFT": 3.0, "FOODPROC": 2.6,
                         "DAIRY": 2.1, "RETAIL": 2.3}[sec] * r.uniform(0.8, 1.25)

        for i in range(n):
            # Household adaptation: when the buffer thins, drawings are cut
            # first. This is what actually happens, and it is why a naive
            # model reading only outflow misses the distress.
            stress_ratio = bal / monthly_out
            if stress_ratio < 0.25:
                draw_actual[i] = drawings[i] * 0.45
            elif stress_ratio < 0.6:
                draw_actual[i] = drawings[i] * 0.72
            out_i = costs[i] + draw_actual[i]

            pay = 0.0
            if emi_due[i]:
                # paid if the buffer plus today's receipts can absorb it, with a
                # small tolerance for informal top-up
                if bal + cash_in[i] - out_i > -0.30 * emi_amt[i]:
                    pay = emi_amt[i]
                    emi_paid[i] = True
                else:
                    emi_paid[i] = False

            outflow[i] = out_i + pay
            bal = bal + cash_in[i] - outflow[i]

            # Informal borrowing: a moneylender/relative bridges a deep hole,
            # which is itself a distress signal rather than a rescue.
            if bal < -0.20 * monthly_out:
                topup = min(-bal + 0.05 * monthly_out, 0.45 * monthly_out)
                bal += topup
                inf_debt += topup
            elif bal > 0.9 * monthly_out and inf_debt > 0:
                repay = min(inf_debt, 0.10 * monthly_out)
                bal -= repay
                inf_debt -= repay

            # Surplus deployment: comfortable buffers are spent on consumption,
            # stock and assets rather than accumulated as bank balance. Without
            # this the panel drifts to ~9 months of cash held, which no rural
            # micro enterprise does, and it destroys the realism of buffer_days.
            target = buffer_target * monthly_out
            if bal > target:
                excess = bal - target
                deploy = excess * 0.055
                bal -= deploy
                deployed[i] = deploy

            informal[i] = inf_debt
            savings[i] = bal
        drawings = draw_actual

        # ---------------- digital adoption drift (v1.1 had none) ----------------
        yrs = cal["t"].to_numpy() / 365.25
        upi = np.clip(e["digital_share_start"] + e["digital_share_slope"] * yrs
                      + rng.normal(0, 0.006, n), 0.01, 0.93)
        wallet = np.clip(upi * rng.uniform(0.06, 0.18), 0, 0.2)
        txn = np.maximum(0, np.round(
            (sales > 0) * (base / 260.0) * r.uniform(0.7, 1.5) * (1 + 0.4 * fest)
            + r.normal(0, 1.1, n))).astype(int)

        panel_rows.append(pd.DataFrame({
            "date": dates, "enterprise_id": eid, "sector": sec,
            "sub_type": e["sub_type"], "district_id": did, "district": e["district"],
            "sales_accrued": sales.round(0),
            "cash_inflow": cash_in.round(0),
            "outflow": outflow.round(0),
            "input_cost": costs.round(0),
            "household_drawings": drawings.round(0),
            "net": (cash_in - outflow).round(0),
            "balance": savings.round(0),
            "informal_debt": informal.round(0),
            "surplus_deployed": deployed.round(0),
            "txn_count": txn,
            "emi_due": emi_due, "emi_amount": emi_amt.round(0), "emi_paid": emi_paid,
            "loan_outstanding": loan_bal.round(0),
            "dealer_credit_outstanding": dealer_credit.round(0),
            "batch_id": np.where(batch_id > 0, [f"{eid}-B{b:02d}" if b else "" for b in batch_id], None),
            "batch_day": batch_day,
            "upi_share": upi.round(3), "wallet_share": wallet.round(3),
            "digital_share": (upi + wallet).round(3),
            "rev_price_index": (p_rev * 100).round(2),
            "cost_price_index": (p_cost * 100).round(2),
            "thi": thi.round(2), "rain_anomaly_pct": rain_an,
            "festival_index": fest.round(3),
            "event_code": ev_tag,
            # driver decomposition retained so reason codes are checkable
            "drv_seasonality": seas_in.round(3),
            "drv_climate": climate.round(3),
            "drv_price_revenue": p_rev.round(3),
            "drv_price_cost": p_cost.round(3),
            "drv_demand": demand.round(3),
            "drv_event": ev_in.round(3),
        }))

    panel = pd.concat(panel_rows, ignore_index=True)
    return (panel, pd.DataFrame(recv_rows), pd.DataFrame(settle_rows),
            pd.DataFrame(batch_rows))
