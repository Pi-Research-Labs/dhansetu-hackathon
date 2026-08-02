# DhanSetu API

For the mobile app (`mobile/`) and website (`web/`) to consume the FastAPI backend.

## Base URL

**Production (live on the GCP VM):**
```
https://dhansetu-api.payintelli.com/api/v1
```
Running as a systemd service (`dhansetu-backend`), auto-restarts on crash, starts
automatically when the VM boots (matches the 9AM–9PM daily schedule — the API is
only reachable during that window, same as the database).

**Local dev** (running the backend on your own machine, pointed at the same
database): `http://localhost:8000/api/v1` — see `backend/README.md` for setup.

Interactive docs (Swagger UI) are always available at `<base>/docs`, e.g.
https://dhansetu-api.payintelli.com/docs — useful for trying requests by hand.

## Auth

Two login endpoints depending on who's logging in. Both return a JWT
(`Bearer` token) valid for 24 hours, carrying a `role` claim
(`merchant`/`officer`) so one type of token can't be used where the other is
required.

### `POST /auth/login` — merchant

```json
// Request
{ "phone_number": "9000000031", "password": "Lakshmi@0031" }

// Response 200
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer",
  "enterprise_id": "ENT0031",
  "proprietor_name": "Lakshmiben Patel"
}
```
`401` if the phone number/password don't match.

### `POST /auth/officer-login` — field officer

Same request shape (`phone_number` + `password`).

```json
// Response 200
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer",
  "officer_id": "FO1",
  "officer_name": "Prakash Nair",
  "district_id": 1
}
```

Demo credentials for all 6 merchant personas and 6 officers are in
[`database/README.md`](database/README.md) — not repeated here.

### `GET /auth/me` — either role

Send `Authorization: Bearer <token>`. Returns the caller's own identity —
use this on app start to restore a session from a stored token instead of
re-prompting for a password.

```json
// merchant token
{ "role": "merchant", "enterprise_id": "ENT0031", "proprietor_name": "Lakshmiben Patel" }

// officer token
{ "role": "officer", "officer_id": "FO1", "officer_name": "Prakash Nair", "district_id": 1 }
```

## Authenticated requests

Every route below (except the two login endpoints) requires:
```
Authorization: Bearer <access_token>
```
Missing token → `403`. Invalid/expired token → `401`.

## `GET /worklist` — officer only

Returns the calling officer's own ranked shortlist (AMBER/RED enterprises
only, sorted by risk score descending). No query params — the officer is
identified from the token, not a request parameter.

```json
// Response 200 — array of:
{
  "officer_id": "FO1",
  "officer_name": "Prakash Nair",
  "officer_lang": "gu",
  "enterprise_id": "ENT0031",
  "proprietor_name": "Lakshmiben Patel",
  "sub_type": "Dairy Producer",
  "block": "Anand Rural",
  "preferred_lang": "gu",
  "preferred_channel": "app",
  "as_of": "2026-07-31",
  "risk_tier": "AMBER",
  "score": 0.415,
  "net_buffer_days": -12,
  "reason_1": "margin_squeeze",
  "reason_2": "working_capital_erosion",
  "reason_3": "debt_overhang",
  "low_visibility": false,
  "credit_headroom": 0.00,
  "bridge_headroom": 21600.00,
  "alert_id": "AL00116",
  "projected_shortfall": 31000.00,
  "shortfall_week_of": "2026-08-29",
  "deadline_date": "2026-08-29",
  "rupees_at_risk": 31000,
  "km_from_centre": 4.2
}
```
A merchant token on this route → `403`.

## `GET /enterprise/{enterprise_id}` — officer (any) or merchant (own only)

A merchant token may only request their own `enterprise_id` (from their
login/`/me` response) — any other ID → `403`. An officer token can request
any enterprise (needed for cross-district visibility during shock events).
Unknown `enterprise_id` → `404`.

```json
// Response 200
{
  "card": {
    "enterprise_id": "ENT0031",
    "proprietor_name": "Lakshmiben Patel",
    "business_name": "Lakshmiben Gopal Dairy",
    "risk_tier": "AMBER",
    "score": 0.415,
    "model_prob_stress": 0.62,
    "rule_score": 0.31,
    "buffer_days": 12,
    "net_buffer_days": -12,
    "credit_headroom": 0.00,
    "bridge_headroom": 21600.00,
    "forecast_net_90d_p10": -46739.00,
    "forecast_net_90d_p50": 5200.00,
    "forecast_net_90d_p90": 61000.00,
    "reason_1": "margin_squeeze",
    "margin_gap_90d": 21.7,
    "...": "see backend/app/schemas/enterprise.py for the full field list"
  },
  "live_forecast": [
    { "enterprise_id": "ENT0031", "origin_date": "2026-07-31", "horizon_days": 30,
      "p10": -8200.00, "p50": 3100.00, "p90": 14500.00, "horizon_end_date": "2026-08-30" }
    // ...one row per horizon (30/60/90/120/150/180 days)
  ],
  "latest_alert": {
    "alert_id": "AL00116",
    "raised_at": "2026-06-30",
    "projected_shortfall": 31000.00,
    "shortfall_week_of": "2026-08-29",
    "actions": [
      { "rank": 1, "mechanism": "margin_squeeze", "action_key": "prebook_input", "audience": "merchant", "lang": "gu", "params": {} }
    ]
  }
}
```
`latest_alert` is `null` if the enterprise currently has no active alert.

## `POST /outcome` — officer only

Closes a task after a field visit and writes the outcome back (this becomes
a training label — see `database/README.md`).

```json
// Request
{
  "task_id": "TK00002",
  "outcome": "stress_confirmed",   // or "false_positive" | "unreachable"
  "intervention": "request_bridge_loan",  // optional
  "note_lang": "gu"                       // optional, defaults to the merchant's preferred_lang
}

// Response 200
{ "outcome_id": "OC00698" }
```
Unknown `task_id` → `400`. Invalid `outcome` value → `422` (only the three
values above are accepted).

## Error shape

FastAPI's default: `{"detail": "<message>"}` for 4xx/5xx, or for `422`
validation errors, a list of `{"type", "loc", "msg", "input"}` objects.

## CORS

Currently wide open (`allow_origins=["*"]`) — fine for hackathon dev from
any frontend origin, not something to keep if this goes past the hackathon.
