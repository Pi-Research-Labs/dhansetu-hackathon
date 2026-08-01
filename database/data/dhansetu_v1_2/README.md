# DHANSETU prototype dataset v1.2

Synthetic panel for the DHANSETU rural cash-flow intelligence prototype.
Regenerated from v1.1 to fix four logical bugs, add the three missing domains
(receivables, labels, forecast vintages), and put each industry in a district
where it actually exists.

**252 enterprises · 6 districts / 6 states / 6 languages · 5 sectors · 9 sub-types ·
1096 days (2023-08-01 → 2026-07-31) · seed 20260731**

Reproduce with `python src/run_all.py`. Same seed gives byte-identical output.

---

## Loading

Large tables are gzipped CSV; pandas reads them directly.

```python
import pandas as pd
led = pd.read_csv("daily_ledger.csv.gz", parse_dates=["event_date"])
ents = pd.read_csv("enterprises.csv")
F = pd.read_csv("feature_snapshots.csv.gz", parse_dates=["as_of"])
```

`_manifest.csv` lists every table with row count, byte size and a SHA-256 prefix.
`_validation_checks.csv` is the assertion suite (33 checks) that the bundle passes.
`dhansetu-prototype-dataset_v1_2.xlsx` holds the dimension tables and the small
fact tables for eyeballing — the 276k-row ledger deliberately stays out of it.

## Two rules for using this data

**1. Never train on a `sim_*` or `drv_*` column.**
`enterprises.sim_health_latent`, `enterprises.sim_stress_script` and the
`daily_ledger.drv_*` columns are the simulator's hidden state. They exist so that
reason codes can be scored against the true cause. Using them as features is
label leakage and would invalidate every metric in `SLIDE_CORRECTIONS.md`.

**2. Respect `as_of`.**
`feature_snapshots` is point-in-time: every row uses only data at or before its
`as_of`. A backtest is therefore a filter (`as_of <= '2025-07-31'`), which makes
leakage structurally hard rather than a matter of discipline. `forecasts` is the
same idea for predictions — each row carries the `origin_date` it was issued from.

## Table map

**Dimensions** — `districts`, `sectors`, `sub_types`, `sector_seasonality`,
`commodities`, `officers`, `schemes`, `mechanisms`, `actions`, `rules`,
`market_risk_cards`

**Entities & ledger** — `enterprises` (252), `daily_ledger` (276,192),
`receivables` (26,447), `receivable_settlements` (25,508), `poultry_batches` (630),
`loans` (232), `repayment_schedule` (4,439), `merchant_entries` (102,360)

**Context** — `mandi_prices` (65,760, keyed commodity × district × date),
`weather_daily` (6,576, includes THI), `shock_events` (25), `shock_event_scope` (440)

**Intelligence** — `feature_snapshots` (8,316 × 76), `stress_episodes` (202,
ground truth), `rule_evaluations` (149,688), `risk_assessments` (8,316),
`forecasts` (149,688 = 33 origins × 6 horizons × 3 quantiles)

**Action loop** — `alerts` (955), `recommendations` (2,770), `officer_tasks` (955),
`visit_outcomes` (697)

**Governance** — `consent_artifacts` (252), `access_grants` (334), `audit_log` (334)

**Evaluation** — `eval_lead_time`, `eval_reason_code_accuracy`

## What changed from v1.1

### Logical bugs fixed

| v1.1 | v1.2 |
|---|---|
| `loan_outstanding` constant for all 48 enterprises despite ~14 EMIs each | Reducing-balance amortisation. 4,099 balance decreases, 175 mid-panel disbursements, `closing_balance` monotonically decreasing per loan |
| `credit_headroom` exactly ₹0 for **every** AMBER and RED row — a pure step function of tier | Driven by cash flow, uncertainty, visibility and repayment behaviour. Tier explains **7.7%** of variance; distributions overlap. Separate `bridge_headroom` stays positive in distress |
| Event EV02 declared but silently applied to zero enterprises (empty district × sector scope) | Scope materialised in `shock_event_scope` and **asserted non-empty at build time** — an unapplicable event now raises |
| Subsidies declared but barely applied (dairy EMI relief landed as 0.7%, not 20%) | Applied through `repayment_schedule.subvention`; 650 installments carry relief |

### Missing phenomena added

- **Poultry batch cycle.** Median maximum consecutive zero-inflow run **50 days**
  (was 1–2). 42-day grow-out, lump-sum realisation, feed financed on dealer
  credit and cleared at realisation (`dealer_credit_outstanding`).
- **Dairy lean season.** Apr–Sep revenue index 84 vs cost index 116. Separate
  inflow and outflow seasonal curves per sector — a single shared curve cannot
  express a squeeze. Driven by THI (the physiologically correct heat-stress
  measure for cattle), not a hand-drawn multiplier.
- **Receivables.** 26,447 invoices with terms, ageing, buyer concentration and
  939 write-offs. Days-to-cash 8 (trader) → 76 (exporter). Three of the five
  sector failure modes depend on this and could not fire before.
- **Ground-truth labels.** `stress_episodes`: 202 causal episodes across 104
  enterprises, each with a true onset date, a true mechanism from the six-name
  vocabulary, and the driver decomposition that produced it.
- **Forecast vintages.** 33 monthly origins × 6 horizons × p10/p50/p90, with
  `is_live_forecast` marking forward calls that have no actual yet.
- **Digital adoption drift.** Mean digital share 0.49 → 0.75 over the panel, with
  **29 enterprises staying cash-dominant** so the low-visibility path has demo
  cases. v1.1 had exactly one `upi_share` value per enterprise across 720 days.
- **Distress that is visible.** Balances go negative, informal borrowing is
  tracked (`informal_debt`), and `net_buffer_days` reports buffer net of it.
  v1.1 clipped savings at zero, masking the signal.
- **Messy capture.** 102,360 merchant entries with ASR confidence, 0–21 day sync
  lag, duplicates and corrections — the offline-sync conflict cases the
  architecture claims to handle.

### Modelling corrections

- **Score is continuous.** 2,760 distinct fused-score values, 3.2% at zero. v1.1
  had 13 distinct values with 44% tied at exactly zero, which cannot be ranked.
- **18 rules, three per mechanism.** v1.1's distribution gave climate and demand
  one rule each, so they could never rank first regardless of the evidence.
  Contributions are normalised per mechanism so mechanisms are comparable.
- **Fusion input is stress probability, not default probability.** An enterprise
  with no bank loan cannot miss a repayment, so a default model scores ~0 for
  precisely the informally-indebted borrowers the product exists to see.
- **Climate rules use anomaly, not level.** THI above 80 is chronic in Anand and
  Nizamabad; an absolute threshold fires constantly and discriminates nothing.
- **Actions are distinct from mechanisms.** v1.1's `advice_key` was a rename of
  `flag_key`, so "advice" restated the problem. There are now 12 action keys
  mapped many-to-many from the 6 mechanisms.

## Known limitations

1. **Positive class is small out-of-time.** 143 stress positives but only 15
   missed-repayment positives and 9 lead-time episodes in the test window. Scaling
   to ~600 enterprises or extending the panel is the highest-value next step.
2. **The stress label is mechanically close to a feature.** It is defined on a
   buffer threshold and `buffer_days` is in the feature set, so AUC 0.959
   overstates difficulty. `missed_repayment_within_90d` is the independent test.
3. **`climate_shock` and `margin_squeeze` are entangled for dairy by design** —
   heat cuts yield while fodder peaks. Report top-3 reason-code accuracy (72.9%)
   rather than top-1 (35.9%).
4. **Poultry sector-mean seasonality is lumpy** because 30 units × ~21 batches
   means monthly means depend on which batches realised. Chart a single unit.
5. **LightGBM replaced with sklearn HistGradientBoosting** (no network in the
   build environment). Same quantile objective; swap back for the real build.
6. Financials are synthetic throughout. Weather and price series are synthetic
   but built on real climatology and real commodity behaviour — wire Agmarknet
   and Open-Meteo in for the live build. The schema is unchanged by that swap.

## Source layout

```
src/refdata.py    districts, sectors, commodities, climatology, personas, events, schemes
src/simulate.py   weather, prices, roster, loans, receivables, the daily panel
src/analyse.py    causal labels, point-in-time features, 18 rules, backtest, headroom
src/export.py     vintage forecasts, alerts, action loop, consent, merchant entries
src/run_all.py    end-to-end
```
