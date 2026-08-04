# DHANSETU — KPIs, and where they come from

Every KPI below traces to a real column, table, or view — no metric here is
aspirational. Read alongside [`STORY.md`](STORY.md) (the narrative these
numbers serve) and [`database/SCHEMA.md`](database/SCHEMA.md) (the full
schema reference).

Two audiences, two different questions:
- **Merchant KPIs** answer *"where do I stand, and what can I do about it?"*
- **Officer KPIs** answer *"who do I see today, and is this tool worth my time?"*

**API column key:** ✅ = a live route returns this today (see `API.md`).
⛔ = the DB view/column exists but no route reads it yet.

---

## 1. Merchant-facing KPIs

| KPI | Definition | Source | API | What it tells the merchant |
|---|---|---|---|---|
| **Risk tier** | GREEN / AMBER / RED | `risk_assessments.risk_tier` (→ `v_enterprise_card`, `v_officer_worklist`) | ✅ `GET /enterprise/{id}` | One-glance status. Drives everything downstream — but see "Credit headroom" below for why tier ≠ verdict on credit. |
| **Net buffer days** | Gross buffer, netted against informal debt | `feature_snapshots.net_buffer_days` / `risk_assessments.net_buffer_days` | ✅ `GET /enterprise/{id}` | The honest runway number. Lakshmiben: 12 days gross, **−57 net** — the gap a bureau-based score can't see. |
| **Cash flow forecast band** | p10/p50/p90 forward cash path, 30–180 days | `v_live_forecast` | ✅ `GET /enterprise/{id}` | Not "will I have money" but "here's the range, and how wide it is" — `band_width` (`risk_assessments.band_width`) is itself a KPI: a wide band means low confidence, not good news. |
| **Projected shortfall** | Deepest point of the p10 downside path, and the week it lands | `v_projected_shortfall` (amount), `alerts.shortfall_week_of` / `deadline_date` | ✅ `GET /enterprise/{id}` (`latest_alert`) | The number with a deadline attached — turns a forecast into something actionable before the fact. |
| **Margin gap (90d)** | Cost index change − revenue index change | `feature_snapshots.margin_gap_90d`, `cost_index_chg_90d`, `rev_index_chg_90d` | ✅ `GET /enterprise/{id}` | The mechanism, quantified — Lakshmiben's 21.7pp gap is *why* she's AMBER, not just *that* she is. |
| **Credit headroom / bridge headroom** | Facility size the merchant can access right now — term vs. short-tenor | `risk_assessments.credit_headroom`, `bridge_headroom`, `suggested_max_emi` | ✅ `GET /enterprise/{id}`, `GET /risk/{id}/predict` | The KPI that makes this a lending product, not a warning system. Deliberately **not** derived from tier — variance explained by tier is only 7.7% (`v_headroom_by_tier`), so AMBER doesn't automatically mean "no headroom." |
| **DSCR (debt service coverage)** | Annualised ability to cover EMI from cash flow | `feature_snapshots.dscr_annual`, `risk_assessments.dscr_annual` | ✅ `GET /enterprise/{id}` | Repayment capacity, independent of whether a payment has actually been missed yet. |
| **Missed EMIs (90d / 365d)** | Count of missed scheduled installments | `feature_snapshots.missed_emis_90d`, `missed_emis_365d` | ✅ 90d via `/enterprise/{id}`, both via `GET /risk/{id}/predict`'s `features` | Lagging, but still shown — the forward-looking KPIs above exist precisely so the merchant sees trouble *before* this one moves. |
| **Receivables ageing (the udhaar book)** | Outstanding amount, write-off %, avg/worst days-to-cash, by counterparty | `v_receivables_ageing` | ✅ `GET /enterprise/{id}/receivables` | Basanti Pradhan's case: this can be bleeding money while the risk tier stays GREEN — it's a separate KPI because it's a separate failure mode. |
| **Digital payment mix** | UPI share / wallet share / cash share, full panel and trailing 90d | `v_merchant_payment_mix` | ✅ `GET /enterprise/{id}/payment-mix` | Both a literacy/formalization signal and a leading indicator: a rising cash share alongside a falling `digital_share_slope` (`enterprises.digital_share_slope`) often precedes reduced data visibility. |
| **Data completeness / low visibility** | Confidence flag on the merchant's own score | `feature_snapshots.data_completeness`, `risk_assessments.low_visibility` | ✅ `GET /enterprise/{id}` | Honesty as a KPI: Sunita Devi's `low_visibility = true` tells her (and Prakash) the system's confidence is lower than usual, instead of quietly guessing. |
| **Reason codes 1–3** | Top 3 named mechanisms behind the score, with contribution weight | `risk_assessments.reason_1/2/3` + `_contrib`, `v_fired_rules` | ✅ codes via `/enterprise/{id}`; ⛔ `v_fired_rules` (per-rule weight detail) has no route | Explainability as a KPI, not just a UI nicety — this is what makes reason codes independently scorable (see `v_reason_code_scorecard`, section 3, now also live). |
| **Alert status** | Raised date, deadline, expiry, dispute state, bureau-export flag | `alerts.raised_at/deadline_date/expires_at/disputed_at/exported_to_bureau` | ✅ `GET /enterprise/{id}` (`latest_alert`) | `exported_to_bureau` is `false` on every row, always — the "perishable, not permanent" promise as a checkable value. |
| **Consent & access transparency** | Who has accessed my data, under what grant, was I notified | `consent_artifacts`, `access_grants`, `audit_log.merchant_notified` | ⛔ no route at all | A trust KPI, not a risk KPI — "can I see who's looked at my data" matters as much as any financial number to the target user. |

## 2. Officer-facing KPIs

| KPI | Definition | Source | API | What it tells the officer (or their supervisor) |
|---|---|---|---|---|
| **Worklist size vs. caseload** | Count of AMBER/RED enterprises ÷ total assigned | `v_officer_worklist` count vs. `officers.caseload` (see `demo_queries.sql` §1b, `pct_reviewed`) | ⛔ the worklist itself is returned; the coverage % is not computed by any route | Attention triage, quantified — proof the tool narrows 42 names to a short list rather than asking him to review everyone. |
| **Rupees at risk** | Latest alert's projected shortfall, per worklist row | `v_officer_worklist.rupees_at_risk` (from `alerts.projected_shortfall`) | ✅ `GET /worklist` | The sort key that matters when many names share one cause — money at risk, not an abstract score. |
| **Fused score** | Model + rule-engine blended risk score | `risk_assessments.fused_score` / `v_officer_worklist.score` | ✅ `GET /worklist` | Secondary ranking signal — used together with rupees-at-risk, not instead of it. |
| **Route distance** | Straight-line km from district centroid | `v_officer_worklist.km_from_centre` (via `district_geo`) | ✅ `GET /worklist` | Turns a list into a rough day plan. |
| **District event flag** | Whether ≥30% of a district×sector cohort is flagged under one mechanism | `v_district_event_watch.is_district_event`, `pct_of_cohort` | ✅ `GET /evidence/district-events` | Tells the officer "this is one shock, not 14 separate problems" — and hands him the 3 worst-off (`worst_first[1:3]`) to visit first. |
| **Task turnaround** | Time from `officer_tasks.assigned_on` to `visit_outcomes.visited_on` | `officer_tasks`, `visit_outcomes` | ⛔ no view, no route | Operational SLA — how fast alerts actually get worked, not just raised. *(Still an open gap, see below.)* |
| **Outcome mix** | Share of visits that are `stress_confirmed` / `false_positive` / `unreachable` | `visit_outcomes.outcome` | ⛔ `POST /outcome` writes it, nothing reads the aggregate back | Is he finding real problems, or chasing noise, or unable to reach people at all (a different problem — access, not risk). |
| **Alert precision by tier** | % of visited AMBER/RED alerts confirmed as real stress | `v_alert_precision.confirm_pct` | ✅ `GET /evidence/alert-precision` (book-wide, not per-officer — see gaps) | The self-honesty KPI: "is AMBER worth the officer's petrol?" If confirmation rate is weak, that's a signal to retune the model, not a fact to hide from him. |
| **Reason-code accuracy** | % of episodes where the predicted top-1 / top-3 reason code matches the true mechanism | `v_reason_code_scorecard.top1_pct/top3_pct` | ✅ `GET /evidence/reason-code-scorecard` | Whether he can trust the *explanation* he's about to repeat to the merchant, not just the tier. |
| **Early-warning lead time** | Days between first flag and first missed repayment, and % of episodes caught at all | `v_lead_time_summary.median_lead_days`, `caught` | ✅ `GET /evidence/lead-time` | Whether the whole system gives him enough runway to act — median 121 days, but **n = 9 out-of-time episodes**, an honest caveat worth keeping attached to this KPI rather than quoting it bare. |
| **Training-label contribution** | Count of visit outcomes marked `becomes_training_label = TRUE` | `visit_outcomes.becomes_training_label` | ⛔ no route | Filing an outcome isn't just paperwork — it's a measurable contribution to next month's model. |
| **Language/channel match rate** | Officer's language vs. merchant's `preferred_lang`/`preferred_channel` | `officers.language` vs. `enterprises.preferred_lang/preferred_channel` | ⛔ no view, no route | Quality-of-visit signal, not just logistics — a mismatch predicts a worse conversation before it happens. |

## 3. Shared / evidence-layer KPIs (both sides benefit, judges/lenders watch these too)

These are less "your daily number" and more "why should anyone trust this
system's other numbers" — already the backbone of the evidence views in
`database/SCHEMA.md`, and now their own endpoint group:

| KPI | Source | API |
|---|---|---|
| Forecast accuracy (MAE, p10–p90 coverage) by horizon | `v_forecast_accuracy` | ✅ `GET /evidence/forecast-accuracy` |
| Headroom independence from tier (proves headroom ≠ tier restated) | `v_headroom_by_tier` | ✅ `GET /evidence/headroom-by-tier` |
| Observed vs. hand-authored seasonality | `v_sector_seasonality_observed` | ⛔ no route |
| Data provenance (real vs. simulated share, per enterprise) | `v_data_provenance` | ✅ `GET /evidence/data-provenance` |

---

## Gaps worth naming, not hiding

- **No dedicated task-turnaround view.** `officer_tasks.assigned_on` →
  `visit_outcomes.visited_on` is currently a join a caller has to write
  themselves, not a rollup like `v_alert_precision`. Same shape of fix as
  `v_merchant_payment_mix` was for payment mix, if this becomes a KPI worth
  showing in the app.
- **No link from a recommendation to an actual disbursed loan.**
  `recommendations.action_key` (e.g. `request_bridge_loan`) records what was
  *suggested*; there's no FK from a recommendation or outcome to a `loans`
  row, so "did the bridge loan actually get disbursed" isn't queryable yet —
  it lives only as `visit_outcomes.intervention` (free text), not a
  structured conversion KPI.
- **`v_alert_precision` is book-wide, not per-officer.** It answers "is
  AMBER worth the petrol" in aggregate; a per-officer breakdown would need a
  `GROUP BY officer_id` added via `officer_tasks`, which the current view
  doesn't join to.
