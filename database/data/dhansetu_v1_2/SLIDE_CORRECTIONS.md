# DHANSETU — slide corrections against dataset v1.2

Every number below is computed from the shipped bundle. The "verify" column is
the table you query to reproduce it, so any claim on stage can be checked live.

Panel: **252 enterprises · 6 districts / 6 states / 6 languages · 5 sectors ·
9 sub-types · 1096 days (2023-08-01 → 2026-07-31) · seed 20260731**

---

## The headline count changes

| Old | New | Why |
|---|---|---|
| 210 enterprises | **252** | 6 districts × 42, and 6 officers × 42 — so the "42 units" caseload is now exact and no officer spans two states |
| 5 sectors *or* 8 personas (inconsistent) | **5 sectors × 9 sub-types**, explicitly nested | Slide 9's five failure modes are the model; the sub-type is the UI label. Both are now real columns |
| 36 months | **36 months** (1096 days) | unchanged, now actually true |
| 6 districts, all Telugu-belt | **6 districts across 6 states** | see below |

## Slide 1 — cover

- `61-day median warning lead` → **121-day median** (p25 = 111). Measured on
  out-of-time episodes only. **Caveat: n = 9.** I would write "median 121 days
  across 9 out-of-time episodes" rather than a bare number — the honesty is
  more persuasive than the figure, and a judge who asks "on how many?" gets a
  straight answer instead of a stumble.
- `in six languages` → now literally true: gu, hi, te, mr, as, or, one per district.

## Slides 3, 6, 9, 10, 11 — the geography

Six districts, each a genuine centre for the industries assigned to it, and
collectively covering exactly the six claimed languages:

| District | State | Lang | Anchor industries | Verify |
|---|---|---|---|---|
| Anand | Gujarat | gu | Dairy (Amul belt), rural retail, food processing | `districts`, `enterprises` |
| Bhilwara | Rajasthan | hi | Handloom + pottery, retail, dairy | " |
| Nizamabad | Telangana | te | Poultry, FPO / agri-aggregation | " |
| Kolhapur | Maharashtra | mr | Dairy, jaggery processing | " |
| Nagaon | Assam | as | Food processing, weaving (flood-exposed) | " |
| Ganjam | Odisha | or | Handicrafts, retail, poultry (cyclone-exposed) | " |

**Slide 8 needs one change:** it says the officer dictates outcomes *in
Marathi*. Prakash Nair is now the Anand (Gujarati) officer so that the whole
demo chains through one person — Lakshmiben → alert → Prakash's queue → visit →
outcome → training label. Either change the slide to Gujarati, or hand that line
to Sujata Kulkarni (FO4, Kolhapur), who is the Marathi officer.

## Slide 3 — the founding insight

> "A dairy unit in Anand is profitable across the year and still collapses every
> April–September, when heat cuts milk yield at the same moment fodder costs peak."

**Now true in the data.** Dairy monthly index (100 = own mean):

```
Jan 117  Feb 113  Mar 100  Apr  84  May  71  Jun  79
Jul  90  Aug  82  Sep  99  Oct 115  Nov 126  Dec 124
```

Apr–Sep revenue index **84** against cost index **116** — the two curves move in
opposite directions, which is the whole mechanism. In v1.1 April was *above*
average and dairy was the flattest of all sectors.

Verify: `sector_seasonality` (separate inflow and outflow curves per sector), or
group `daily_ledger` by month.

## Slide 6 — the four personas

All six are now real rows on pinned IDs:

| ID | Persona | Sub-type | District | Lang | Channel | Notes |
|---|---|---|---|---|---|---|
| **ENT0031** | Lakshmiben Patel, 38 | Dairy Producer | Anand, GJ | gu | app | shared device = true; co-op settles every ~14 days |
| **ENT0104** | Suresh Reddy, 34 | Poultry (broiler) | Nizamabad, TS | te | app | 21 batches, 42-day grow-out, feed on dealer credit |
| **ENT0067** | Sunita Devi, 52 | Pottery / Terracotta | Bhilwara, RJ | hi | **ivr** | digital_share 0.06 → 0.09, `low_visibility = true` |
| ENT0152 | Anita Patil, 41 | SHG Food Processing | Kolhapur, MH | mr | app | 45-day retailer receivables |
| ENT0188 | Nilima Bora, 36 | Handloom Weaver | Nagaon, AS | as | app | single export agent, flood-exposed |
| ENT0224 | Basanti Pradhan, 47 | Kirana Store | Ganjam, OD | or | assisted | heavy udhaar book, cash-dominant |

Suresh's real numbers: **21 batches, mean realisation ₹134,156, mean feed on
dealer credit ₹58,683 per batch.** Verify: `poultry_batches`.

Prakash Nair (FO1, Anand) has exactly **42** enterprises. Verify: `officers`.

## Slide 9 — five sectors, five failure modes

All five are now present as distinct physics. Monthly index (100 = own mean):

| Sector | Jan | Feb | Mar | Apr | May | Jun | Jul | Aug | Sep | Oct | Nov | Dec |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Dairy | 117 | 113 | 100 | 84 | **71** | 79 | 90 | 82 | 99 | 115 | 126 | 124 |
| Poultry | 102 | 140 | 112 | 67 | 122 | 59 | 76 | **37** | 85 | 116 | 104 | 182 |
| Handicrafts | 95 | 86 | 78 | **67** | 68 | 77 | 92 | 99 | 121 | **163** | 151 | 104 |
| Food processing | 93 | 106 | 134 | **141** | 113 | 89 | 80 | **66** | 77 | 99 | 108 | 95 |
| Rural retail | 103 | 91 | 89 | 87 | 86 | 86 | 87 | 80 | 101 | **149** | 138 | 100 |

- **Poultry's 40-day gap is real:** median maximum consecutive zero-inflow run is
  **50 days** (42-day grow-out + cleanout). It was 1–2 days in v1.1. August at 37
  is the Shrawan demand collapse; December at 182 is winter demand.
- **Receivables now exist** (26,447 invoices), so the three receivables-driven
  failure modes can actually fire. Mean days-to-cash by counterparty:

  | Counterparty | Days |
  |---|---|
  | Co-operative (dairy) | 14 |
  | Trader (poultry) | 8 |
  | Village credit / udhaar (retail) | 46 |
  | Retailer (food processing) | 54 |
  | Exporter (handicrafts) | **76** |

  939 invoices written off. Verify: `receivables`, `receivable_settlements`.

Note the poultry row is lumpy because 30 units × ~21 batches means monthly means
are dominated by which batches happened to realise. That is honest, but for the
chart I would show a single unit's cycle rather than a sector mean — the cycle is
the story, and averaging across units hides it.

## Slide 10 — cash flow prediction

> "We forecast a band, never a number."

Now genuinely a **vintage** table: 33 monthly origins × 6 horizons (M1–M6) ×
p10/p50/p90 = 149,688 rows, each tagged with `origin_date` and
`is_out_of_time`. Quantiles are explicit columns, and 100% of bands satisfy
p10 ≤ p50 ≤ p90 (independently fitted quantile models cross; monotonicity is
enforced).

Measured out-of-time performance:

| Horizon | MAE | p10–p90 coverage |
|---|---|---|
| 30d | ₹20,613 | 82.9% |
| 60d | ₹30,498 | 82.3% |
| 90d | ₹39,104 | 77.6% |
| 180d | ₹60,028 | 74.3% |

- `+20.3% vs naive` → **+8.6% vs seasonal-naive** (₹41,086 vs ₹44,966) and
  **+52.6% vs Holt-Winters**. Quote both. The seasonal-naive baseline is strong
  here precisely because the seasonality is real, so beating it by 8.6% is a
  more credible claim than beating a strawman by 20%.
- Where the improvement actually comes from is worth saying out loud: the model
  gets **contractually-known forward cash** — receivable invoices already raised
  with due dates inside the horizon, and EMIs already scheduled. A seasonal-naive
  baseline structurally cannot use either. That is a better answer to "why is
  your model better" than "we used gradient boosting".
- `every actual falls inside the band` → **do not say this.** Coverage is 74–83%
  by design, for an 80% nominal band. Bands are conformally calibrated on a
  held-back slice. "Roughly four in five actuals land inside our 80% band, and we
  publish the miss rate" is the stronger line.
- `balance drains ₹81,221 → ₹4,167 in ten months` → for ENT0031 the real figures
  are **peak ₹76,658 (10 Feb 2025) → ₹20,377 (31 Jul 2026)**. Use those.

## Slide 11 — early warning

The worked example is now a real, traceable row. **ENT0031, alert `AL00116`,
raised 2026-06-30:**

- Projected shortfall **₹31,000 in the week of 29 August 2026** (deepest point of
  the downside p10 cumulative cash path; the 90-day p10 trough is −₹46,739 at
  29 September)
- Ranked reason codes: **margin_squeeze → working_capital_erosion → debt_overhang**
- Driving numbers: cost index **+21.5%** over 3 months while the procurement
  price moved **−0.2%** — a **21.7pp** margin gap. This is the deck's "feed index
  up 14% while milk price stayed flat", now with real figures
- Buffer **12 days gross, −57 days net of informal borrowing**
- Recommended actions: `prebook_input`, `request_bridge_loan`, `collect_udhaar`
- Tier history: RED at 2026-04-30, AMBER since

Two changes to the slide:

1. `risk = 0.45 × model + 0.55 × rule engine` is retained, **but the model input
   is now stress probability, not default probability.** This matters: an
   enterprise with no bank loan cannot miss a repayment, so a default-probability
   model scores ~0 for exactly the informally-indebted borrowers the product
   exists to see. Lakshmiben scored GREEN under the old fusion despite owing 57
   days of outflow to moneylenders.
2. `Six named stress mechanisms` — now enforced as a closed vocabulary shared by
   the rules, the reason codes and the episode labels. **`15 rules` → 18 rules,
   three per mechanism.** The old distribution gave climate and demand one rule
   each, so they could never rank first no matter what the data said.

**Add the "buffer net of informal debt" point somewhere.** It is a genuinely good
idea and it is now in the data: a buffer made of moneylender money is not a
recovery, and a monitoring system that reads it as one loses the officer's trust
the first time it happens.

## Slide 14 — trust by design

T0–T3 are now rows, not a diagram: `consent_artifacts` (252, including
revocations), `access_grants` (334 time-boxed T2 grants), `audit_log` (334
accesses, each tied to a grant, each with `merchant_notified = true`).
`daily_ledger` and `merchant_entries` carry `is_household` so the T3 boundary is
enforceable at row level rather than in application code.

`alerts.exported_to_bureau` is `false` on every row — the "perishable, never
exported" promise is now a checkable column.

## Slide 15 — technology

One change: **LightGBM → sklearn HistGradientBoosting** for this bundle, because
the build environment had no network access. Same pinball/quantile objective;
swap back for the real build. Say "gradient-boosted quantile regression" on the
slide and it stays true either way.

## Slide 16 — evidence

Replace the four numbers with these, all out-of-time (train ≤ 2025-07-31):

| Old claim | Measured | Note |
|---|---|---|
| ROC-AUC 0.861 (stress, 3m) | **0.959** | AP 0.617, base rate 4.73%, **PR lift 13.0×**, 143 positives |
| — | **0.984** | separate missed-repayment model; base 0.50%, lift 69.6×, but only **15 positives** |
| 61-day median lead | **121 days** | p25 = 111, **n = 9** |
| +20.3% vs naive | **+8.6%** vs seasonal-naive, **+52.6%** vs Holt-Winters | |
| 4.2× PR lift over 3.8% base | **13.0× over 4.73%** | |
| 210 enterprises, 36 months | 252 enterprises, 36 months | |

**Two caveats you should put on the slide rather than wait to be asked:**

1. The stress label is defined on a buffer threshold, and `buffer_days` is also a
   feature — so AUC 0.959 partly reflects a mechanically easy target. The
   missed-repayment model is the honest independent test, and its 15 positives are
   too few for a stable estimate. Both facts are in the bundle; owning them is
   cheaper than being caught by them.
2. Scaling to ~600 enterprises or extending the panel would give the positive
   class enough mass to quote a confidence interval. That is the single highest-value
   remaining improvement.

**And the claim I would actually lead with**, which is new and which no
competitor working from real-but-unlabelled data can make:

> Because every stress episode has a known cause, we can score our reason codes
> for **correctness**, not plausibility. The true mechanism is the top-ranked
> reason code **35.9%** of the time and appears in the top three **72.9%** of the
> time, across **192** episodes.

One honest note on that: `climate_shock` and `margin_squeeze` are physically
coupled for dairy *by design* — heat cuts yield at the same moment fodder costs
peak, which is Slide 3's entire insight. So the two are genuinely hard to
separate, and top-3 is the fairer metric to quote than top-1.

Verify: `stress_episodes` (202 episodes, 104 enterprises, all six mechanisms),
`eval_reason_code_accuracy`, `eval_lead_time`.

## Slide 5 / 17 — headroom and origination

> "Risk monitoring becomes origination." / "Its intended action is a bridge loan
> — not a rejection."

This now holds in the data. Headroom is driven by projected cash flow,
uncertainty, visibility and repayment behaviour — **not by the tier**:

| Tier | Headroom p25 | p75 | Bridge headroom (median) |
|---|---|---|---|
| GREEN | ₹49,900 | ₹285,500 | ₹37,800 |
| AMBER | ₹6,100 | ₹65,800 | ₹15,600 |
| RED | ₹500 | ₹18,425 | ₹10,500 |

The distributions **overlap** (AMBER p75 > GREEN p25), and the tier explains only
**7.7%** of the variance in headroom. In v1.1 it explained 100% — every AMBER and
RED row had headroom of exactly zero, which meant the system's answer to distress
was a rejection.

Lakshmiben is the demo case: term headroom **₹0**, bridge headroom **₹21,600**.
That is the slide's promise, as a queryable number.

---

## What I would still fix before you present

1. **Scale the positive class.** 9 out-of-time lead-time episodes and 15
   missed-repayment positives are the weakest part of the evidence slide.
2. **Show one poultry unit's cycle, not the sector mean** on Slide 9.
3. **Decide the Slide 8 language** (Prakash is Gujarati now).
4. Consider whether `climate_shock` and `margin_squeeze` should be reported as
   one combined "seasonal margin squeeze" mechanism for dairy, since they are
   physically inseparable there. It would raise top-1 accuracy honestly rather
   than cosmetically.
