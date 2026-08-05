# DHANSETU — users, tables, views

One reference doc for "who can log in as what" and "what does each table/view
actually hold." See [`README.md`](README.md) for setup/run instructions —
this file is descriptive, not instructional.

## 1. Users & credentials

Two independent login surfaces, two tables, two JWT roles. A merchant token
and an officer token are never interchangeable — the JWT's `role` claim
(`merchant` / `officer`) is checked by `backend/app/core/deps.py`
(`require_merchant` / `require_officer`), and each login endpoint only
accepts credentials from its own table.

This is a **hackathon shortcut**: phone number + password, no OTP, no SMS
gateway. Real production users for this product (shared devices, low
digital literacy, IVR-preferring — see personas in
`data/dhansetu_v1_2/SLIDE_CORRECTIONS.md`) should get phone + OTP instead.
All passwords below are demo-only, seeded into a synthetic dataset — not
real people, intentionally documented in plaintext here.

### Merchant side — `merchant_accounts` (`database/07_auth.sql`)

| Column | Holds |
|---|---|
| `account_id` | Surrogate PK |
| `enterprise_id` | FK → `enterprises` — which business this login belongs to |
| `phone_number` | Login identifier, unique |
| `password_hash` | bcrypt hash |
| `created_at` / `last_login_at` | Bookkeeping |

Endpoint: `POST /api/v1/auth/login` → JWT with `sub = enterprise_id`, `role = merchant`.

Seed accounts (the 6 named demo personas, `enterprises.is_named_persona`):

| Enterprise | Persona | Phone | Password |
|---|---|---|---|
| ENT0031 | Lakshmiben Patel | `9000000031` | `Lakshmi@0031` |
| ENT0104 | Suresh Reddy | `9000000104` | `Suresh@0104` |
| ENT0067 | Sunita Devi | `9000000067` | `Sunita@0067` |
| ENT0152 | Anita Patil | `9000000152` | `Anita@0152` |
| ENT0188 | Nilima Bora | `9000000188` | `Nilima@0188` |
| ENT0224 | Basanti Pradhan | `9000000224` | `Basanti@0224` |

### Officer side — `officer_accounts` (`database/08_officer_auth.sql`)

| Column | Holds |
|---|---|
| `account_id` | Surrogate PK |
| `officer_id` | FK → `officers` — which field officer this login belongs to |
| `phone_number` | Login identifier, unique |
| `password_hash` | bcrypt hash |
| `created_at` / `last_login_at` | Bookkeeping |

Endpoint: `POST /api/v1/auth/officer-login` → JWT with `sub = officer_id`, `role = officer`.

Seed accounts (all 6 field officers, `officers` table):

| Officer | District | Phone | Password |
|---|---|---|---|
| FO1 Prakash Nair | Anand | `8000000001` | `Prakash@FO1` |
| FO2 Meena Choudhary | Bhilwara | `8000000002` | `Meena@FO2` |
| FO3 K. Ramesh | Nizamabad | `8000000003` | `Ramesh@FO3` |
| FO4 Sujata Kulkarni | Kolhapur | `8000000004` | `Sujata@FO4` |
| FO5 Dhruba Saikia | Nagaon | `8000000005` | `Dhruba@FO5` |
| FO6 Sanjay Behera | Ganjam | `8000000006` | `Sanjay@FO6` |

`GET /api/v1/auth/me` works with either token type and returns the caller's
own identity (used to restore a session from a stored token on app start).

---

## 2. Tables

### Reference / lookup (small, static)

| Table | Holds |
|---|---|
| `districts` | 1 row per district: name, state, language, agro-zone, rainfall, cyclone exposure |
| `sectors` | Business sector catalogue (label + typical failure mode) |
| `sub_types` | Finer-grained business sub-type within a sector, with typical daily turnover |
| `sector_seasonality` | Expected inflow/outflow seasonal index by sector × month |
| `commodities` | Commodity catalogue with base price, trend, seasonal peak/amplitude |
| `officers` | Field officer roster: name, age, district, language, base town, caseload |
| `schemes` | Government schemes affecting cash flow (subsidy/rate deltas by sector) |
| `mechanisms` | Catalogue of stress mechanisms (the "why" behind a risk call) |
| `actions` | Catalogue of recommendable actions (templates for officer/merchant guidance) |
| `rules` | Rule-engine definitions: which mechanism each rule detects, its weight |
| `market_risk_cards` | Static risk notes per sector × risk type, with severity |

### Core entities & activity

| Table | Holds |
|---|---|
| `enterprises` | One row per merchant/business: proprietor, location, sector/sub-type, preferred language/channel, literacy, assigned officer, onboarding date, baseline turnover — plus `sim_health_latent`/`sim_stress_script` (**simulator ground truth, never expose via API** — label leakage) |
| `daily_ledger` | Daily cash ledger per enterprise: inflow/outflow/net/balance, EMI due/paid, loan & dealer-credit outstanding, digital-payment shares, price/weather/festival indices — plus `drv_*` columns (**simulator internals, never expose**) |
| `receivables` | Outstanding "udhaar" (credit given to customers): invoice/due dates, amount, settlement, write-off flag |
| `receivable_settlements` | Cash-in events against a receivable |
| `poultry_batches` | Sector-specific batch economics (poultry): placement cost, feed-on-credit, realisation |
| `loans` | Formal loans: principal, rate, tenor, disbursement date, linked scheme |
| `repayment_schedule` | Per-installment EMI schedule per loan: scheduled/payable EMI, interest/principal split, closing balance |
| `mandi_prices` | Historical commodity prices by district × date (synthetic panel) |
| `weather_daily` | Historical weather by district × date: rainfall, temp, humidity, THI (thermal-humidity index), rain anomaly |
| `shock_events` | Discrete shock events (e.g. cyclone, price crash): type, district, date range, sector multiplier effects |
| `shock_event_scope` | Which enterprises a given shock event actually touched |
| `merchant_entries` | Voice/IVR/assisted cash-entry log: ASR confidence, sync lag, duplicate/correction flags |

### Modeling pipeline (features → risk → forecast → alert → task → outcome)

| Table | Holds |
|---|---|
| `feature_snapshots` | Point-in-time feature store, one row per enterprise × monthly `as_of` cutoff — buffer days, DSCR, margin gap, receivable ageing, EMI burden, model probabilities, forecast quantiles, risk tier, top-3 reason codes, credit/bridge headroom. Every column uses only data at or before `as_of`. |
| `stress_episodes` | **Ground-truth labels**: true onset/resolution date, true mechanism, causal driver scores — what makes reason codes scorable |
| `rule_evaluations` | Which rules fired for which enterprise at which `as_of`, and their weight |
| `risk_assessments` | The scored output per enterprise × `as_of`: probabilities, fused score, risk tier (GREEN/AMBER/RED), reason codes, headroom figures, forecast bands, model/rule versioning |
| `forecasts` | Vintage quantile cash-flow forecasts: origin date × horizon (30–180d) × quantile (p10/p50/p90), with actual (once known) and an `is_live_forecast` flag for the current forward call |
| `alerts` | AMBER/RED risk assessments promoted to an actionable alert: projected shortfall, deadline, merchant visibility, dispute state (bureau export hardcoded false) |
| `recommendations` | Up to 3 ranked action recommendations per alert, per audience, in the merchant's language |
| `officer_tasks` | Work items assigned to a field officer from an alert: priority score, status (open/closed) |
| `visit_outcomes` | What happened when the officer visited: outcome (`stress_confirmed`/`false_positive`/`unreachable`), intervention taken — feeds back into training labels |

### Governance / privacy

| Table | Holds |
|---|---|
| `consent_artifacts` | Merchant consent grants: purpose, tier (0–3), validity window, revocation, legal basis, channel |
| `access_grants` | Who (which grantee) can see which enterprise's data at which tier, under which consent |
| `audit_log` | Append-only: who viewed what, when, under which grant — merchant-notification flag |

### Evaluation (offline metrics, not served live)

| Table | Holds |
|---|---|
| `eval_lead_time` | Per stress episode: first missed repayment date, first flag date, lead time, whether it was caught at all |
| `eval_reason_code_accuracy` | Per stress episode: true mechanism vs. predicted top-1, whether it landed in top-1/top-3 |

### Live-data layer (`04_live_data.sql` — real inputs alongside the synthetic panel)

| Table | Holds |
|---|---|
| `district_geo` | Real district HQ lat/lon — needed for weather API calls and route ordering |
| `commodity_map` | Maps internal commodity IDs to real Agmarknet commodity names (some commodities, e.g. milk, have no Agmarknet equivalent — a deliberate gap, see `data/dhansetu_v1_2/README.md`) |
| `mandi_prices_live` | Real commodity prices pulled from Agmarknet (data.gov.in) |
| `weather_live` | Real weather pulled from Open-Meteo, with THI recomputed from real observations |
| `voice_entries` | One row per Sarvam voice call: model, mode (codemix etc.), detected language + confidence, transcript, diarised speaker, sample rate, API latency |
| `voice_extractions` | Structured amount/note parsed out of a `voice_entries` transcript, kept separate so extraction can be re-run without re-transcribing; `needs_review` auto-flags low-confidence/missing-amount rows |
| `ledger_entries_live` | Real, append-only merchant ledger entries (UUID PK); corrections are new rows referencing the original, never UPDATEs |
| `ingestion_runs` | Log of every external API pull (Sarvam/Agmarknet/Open-Meteo), for debugging when a demo integration breaks |

### Auth (`07_auth.sql`, `08_officer_auth.sql`)

See section 1 above — `merchant_accounts`, `officer_accounts`.

---

## 3. Views

**Rule: the backend only ever queries views, never raw tables** (enforced by
convention/code review for the hackathon, not by Postgres roles — see
`README.md` → "What we skipped"). The two leakage guards below are the most
important reason why.

### Leakage guards

| View | Purpose |
|---|---|
| `v_enterprises_safe` | `enterprises` minus `sim_health_latent`/`sim_stress_script` |
| `v_ledger_safe` | `daily_ledger` minus the `drv_*` simulator-internal columns |

### Officer worklist (`GET /worklist`)

| View | Purpose |
|---|---|
| `v_latest_assessment` | Each enterprise's most recent `risk_assessments` row (dedupes the `as_of` history down to "current") |
| `v_officer_worklist` | The ranked shortlist an officer sees: non-GREEN enterprises assigned to them, joined to officer info, latest alert, rupees-at-risk, and straight-line distance from the district centroid for route ordering |

### Enterprise detail card (`GET /enterprise/{id}`)

| View | Purpose |
|---|---|
| `v_enterprise_card` | One enterprise's full risk picture: latest assessment + matching `feature_snapshots` row (margin gap, DSO, buyer concentration, digital share, `savings_runway_days`, `dscr_proj_180d`, etc.) |
| `v_fired_rules` | Which rules actually fired for an enterprise at a given `as_of`, in plain (rule/mechanism) terms, heaviest first |
| `v_enterprise_digital_heatmap` | Daily digital/cash share **percentage** (0-100, `digital_share_pct`/`cash_share_pct`) for one enterprise, trailing 90 days — a flat `{date, value}` series for a calendar-heatmap UI, no grid math done server-side |
| `v_enterprise_weekly_cashflow` | Historical inflow/outflow/net rolled up by ISO week, unbounded (the API layer windows it, default trailing 26 weeks) |
| `v_enterprise_net_inflow_heatmap` | Net cash flow per week, built on `v_enterprise_weekly_cashflow` but hardcoded to a fixed trailing 7 weeks (not caller-configurable) — a purpose-built heatmap data point, not a general series |

### Forecast

| View | Purpose |
|---|---|
| `v_forecast_band` | Pivots `forecasts` from long (one row per quantile) to wide (p10/p50/p90 columns) for charting |
| `v_live_forecast` | The current forward-looking call per enterprise — latest origin date, no actual yet — what the officer acts on |
| `v_projected_shortfall` | Deepest negative point of an enterprise's downside (p10) path, and which week it lands, when the enterprise ever dips below zero |
| `v_enterprise_cashflow_forecast` | `v_live_forecast` plus a heuristic `confidence_score`/`confidence_label` per horizon (weighted from data completeness, zero-inflow days, digital-share steadiness) — explains *why* the p10/p90 band is wide, not just that it is |

### Alerts

| View | Purpose |
|---|---|
| `v_alert_actions` | One alert + its up-to-3 ranked recommendations bundled as a JSON array — backs `POST /outcome`'s context and the enterprise detail response |
| `v_district_event_watch` | Collapses many enterprises flagged by the same shock into one district-level finding (percent of cohort affected, whether it crosses the 30% "district event" threshold, which 3 to visit first) instead of showing N duplicate alerts |

### Receivables

| View | Purpose |
|---|---|
| `v_receivables_ageing` | Per enterprise × counterparty type: invoice count/total, outstanding, written-off, average and worst days-to-cash, write-off % — the "udhaar book" summary |

### Payment mix

| View | Purpose |
|---|---|
| `v_merchant_payment_mix` | One row per enterprise: average UPI share, wallet share, and derived cash share (`1 - digital_share`) over the full panel, plus the same three over just the trailing 90 days (`recent_90d_*`) to see a shift in progress. Built from `daily_ledger.upi_share`/`wallet_share`/`digital_share` — there was no per-merchant rollup of this before. |

### Evidence / evaluation (deck numbers as live queries)

| View | Purpose |
|---|---|
| `v_reason_code_scorecard` | Per true mechanism (+ an ALL row): how often the predicted top-1/top-3 reason code matched the ground truth |
| `v_lead_time_summary` | Across all stress episodes: how many were caught at all, median/min/max lead time between first flag and first missed repayment |
| `v_forecast_accuracy` | Per forecast horizon: mean absolute error and % of actuals falling inside the p10–p90 band, out-of-time only |
| `v_headroom_by_tier` | Credit/bridge headroom distribution (p25/p50/p75) by risk tier — proof headroom isn't just a restatement of the tier |
| `v_sector_seasonality_observed` | Observed monthly sales index by sector from actual ledger data, indexed to 100 — the empirical counterpart to the hand-authored `sector_seasonality` table |
| `v_alert_precision` | Confirmation rate by risk tier: of officer visits, what % confirmed real stress — is chasing AMBER worth the petrol |

### Write-back (`POST /outcome`)

| Object | Purpose |
|---|---|
| `record_outcome()` (function, not a view) | Validates the outcome value, inserts a `visit_outcomes` row (defaulting note language to the enterprise's preferred language), closes the `officer_tasks` row. Needs `SET search_path = dhansetu, public` on the function itself — see `README.md` → "Gotchas already handled." |

### Live-data layer (`04_live_data.sql`)

| View | Purpose |
|---|---|
| `v_price_series` | One commodity price series regardless of source (synthetic `mandi_prices` or real `mandi_prices_live`) |
| `v_weather_series` | Same idea for weather: unifies `weather_daily` and `weather_live` |
| `v_ledger_live_effective` | Resolves `ledger_entries_live` corrections (latest correction wins, voids excluded) into one effective row per entry |
| `v_daily_from_voice` | Rolls real voice-captured entries up into daily totals shaped exactly like `daily_ledger`, so the existing pipeline can consume real data with no code change |
| `v_voice_review_queue` | Voice extractions a human still needs to check (`needs_review = true`) |
| `v_data_provenance` | Per enterprise, how much of the panel is real (`voice`/API-sourced) vs. simulated — an observability check on rollout progress |

---

## Cross-reference

- Full API request/response shapes for the endpoints above: [`../API.md`](../API.md)
- Setup, run order, load script, "what we skipped": [`README.md`](README.md)
- Dataset provenance and generation scripts: [`../data/dhansetu_v1_2/README.md`](../data/dhansetu_v1_2/README.md)
