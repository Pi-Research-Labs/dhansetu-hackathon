# DhanSetu API

For the mobile app (`mobile/`) and website (`web/`) to consume the FastAPI backend.

## Base URL

**Production (live on the GCP VM):**
```
https://dhansetu-api.piresearchlabs.com/api/v1
```
Running as a systemd service (`dhansetu-backend`), auto-restarts on crash, starts
automatically when the VM boots (matches the 9AM–9PM daily schedule — the API is
only reachable during that window, same as the database).

**Local dev** (running the backend on your own machine, pointed at the same
database): `http://localhost:8000/api/v1` — see `backend/README.md` for setup.

Interactive docs (Swagger UI) are always available at `<base>/docs`, e.g.
https://dhansetu-api.piresearchlabs.com/docs — useful for trying requests by hand.

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

## Quick reference

| Method & path | Who can call it | Returns | Notes |
|---|---|---|---|
| `POST /auth/login` | anyone (merchant creds) | JWT + identity | |
| `POST /auth/officer-login` | anyone (officer creds) | JWT + identity | |
| `GET /auth/me` | either role | caller's own identity | |
| `GET /worklist` | officer only | array of JSON | officer's own ranked shortlist |
| `GET /enterprise/{id}` | officer any, merchant own | JSON | full risk/forecast/alert card |
| `GET /enterprise/{id}/map-tile` | officer any, merchant own | **raw `image/png` bytes**, not JSON | needs a fetch+blob dance, see below |
| `GET /enterprise/{id}/receivables` | officer any, merchant own | array of JSON | the "udhaar book" — outstanding/written-off by counterparty |
| `GET /enterprise/{id}/payment-mix` | officer any, merchant own | JSON | UPI/wallet/cash share, full-panel and trailing-90d |
| `GET /risk/{id}/predict` | officer any, merchant own | JSON | serving stub, not live ML yet |
| `POST /voice/entries` | merchant only | JSON | **multipart**, not JSON body — audio upload |
| `GET /voice/review-queue` | officer only | array of JSON | officer's own pending voice entries |
| `POST /voice/review/{extraction_id}` | officer only | JSON | confirms an amount → writes ledger |
| `POST /outcome` | officer only | JSON | closes a field-visit task |
| `GET /evidence/district-events` | officer only | array of JSON | shocks hitting ≥30% of a district×sector cohort |
| `GET /evidence/alert-precision` | officer only | array of JSON | confirmation rate by tier, book-wide |
| `GET /evidence/reason-code-scorecard` | officer only | array of JSON | predicted vs. true mechanism accuracy |
| `GET /evidence/lead-time` | officer only | JSON | early-warning lead time across stress episodes |
| `GET /evidence/forecast-accuracy` | officer only | array of JSON | MAE + band coverage by horizon |
| `GET /evidence/headroom-by-tier` | officer only | array of JSON | proof headroom isn't just the tier restated |
| `GET /evidence/data-provenance` | officer only | array of JSON | real vs. simulated data share per enterprise |

The two rows in **bold** are the ones that don't behave like a normal JSON
`fetch()` call — jump to their sections below for exact client code.

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

## `GET /enterprise/{enterprise_id}/receivables` — officer (any) or merchant (own only)

The "udhaar book" — one row per counterparty type the enterprise deals
with, backed by `v_receivables_ageing`. Empty array (not `404`) if the
enterprise has no receivables at all — that's a legitimate state, not an
error.

```json
// Response 200
[
  {
    "enterprise_id": "ENT0224",
    "proprietor_name": "Basanti Pradhan",
    "sector": "RETAIL",
    "counterparty_type": "village_credit",
    "invoices": 157,
    "total": 1637039.00,
    "outstanding": null,
    "written_off": 214085.00,
    "avg_days_to_cash": 48.2,
    "worst_days_to_cash": 84,
    "write_off_pct": 13.1
  }
]
```
This is the view that catches the case a risk tier alone misses — Basanti
can be **GREEN** on `risk_tier` while quietly bleeding money to bad udhaar
(13.1% written off here). Show this alongside the tier, not instead of it.

## `GET /enterprise/{enterprise_id}/payment-mix` — officer (any) or merchant (own only)

One row: average UPI/wallet/cash share over the full panel, plus the same
three over just the trailing 90 days (`recent_90d_*`) so a shift in
progress is visible. Backed by `v_merchant_payment_mix`. `404` if the
enterprise has no ledger data at all.

```json
// Response 200
{
  "enterprise_id": "ENT0031",
  "proprietor_name": "Lakshmiben Patel",
  "sector": "DAIRY",
  "district": "Anand",
  "preferred_channel": "app",
  "avg_upi_share": 0.490,
  "avg_wallet_share": 0.033,
  "avg_digital_share": 0.524,
  "avg_cash_share": 0.476,
  "recent_90d_digital_share": 0.671,
  "recent_90d_cash_share": 0.329
}
```

## `GET /enterprise/{enterprise_id}/map-tile` — officer (any) or merchant (own only)

Same access rule as `GET /enterprise/{id}`. Returns a static map PNG
(`image/png`, raw bytes — not JSON) centered on the enterprise's shop
location, via the Google Maps Static API. The API key is never sent to the
frontend — the backend calls Google server-side and streams the image
bytes back; the key is also IP-restricted (GCP `payintelli` project) to
this backend's VM, so it wouldn't work from anywhere else even if it leaked.

```
GET /api/v1/enterprise/ENT0031/map-tile?zoom=15&size=400x400
```
`zoom` (1–20, default 15) and `size` (`WxH`, default `400x400`, clamped to
640×640 — Google's free-tier cap) are optional query params. Sample output
for ENT0031: [`backend/sample_map_tile.png`](backend/sample_map_tile.png).

**`enterprises.lat`/`lon` are not absolute coordinates** — they're small
degree offsets from the enterprise's district centroid (`district_geo`),
the same convention `v_officer_worklist.km_from_centre` already relies on.
`app/services/maps.py` adds the offset to the centroid before calling
Google — using the raw column value directly points at the Gulf of Guinea,
not Gujarat, which is exactly what happened while building this endpoint.
`404` if the enterprise is unknown or has no recorded location.

**Displaying this image is the one non-obvious part of this whole API.**
This route needs an `Authorization` header, and neither a plain HTML
`<img src="...">` nor React Native's `<Image source={{uri: "..."}}>` can
attach a custom header to the underlying request — you have to `fetch()`
the bytes yourself and hand the *result* to the image element, not the URL.

Web (React):
```ts
const res = await fetch(`${BASE_URL}/enterprise/${enterpriseId}/map-tile`, {
  headers: { Authorization: `Bearer ${token}` },
});
const blob = await res.blob();
const imageUrl = URL.createObjectURL(blob);
// <img src={imageUrl} /> — call URL.revokeObjectURL(imageUrl) on unmount
```

Mobile (Expo / React Native) — `Image` can't take a blob URL either, and
there's no `Buffer` by default, so download to a local file instead
(`expo-file-system`'s `downloadAsync` does support a `headers` option):
```ts
import * as FileSystem from 'expo-file-system';

const { uri } = await FileSystem.downloadAsync(
  `${BASE_URL}/enterprise/${enterpriseId}/map-tile`,
  FileSystem.cacheDirectory + `map-${enterpriseId}.png`,
  { headers: { Authorization: `Bearer ${token}` } }
);
// <Image source={{ uri }} />
```

## `GET /risk/{enterprise_id}/predict` — officer (any) or merchant (own only)

Same access rule as `GET /enterprise/{id}`: a merchant token may only
request their own `enterprise_id`; an officer token can request any.
Unknown `enterprise_id` → `404`.

This is a **serving stub**, not live model inference — see
`backend/app/services/risk_model.py`. It reads the enterprise's latest
`risk_assessments`/`feature_snapshots` row and returns it in the shape a
trained model's output would take, so the endpoint contract (auth, request
shape, response shape) is stable and ready for a real model to be dropped in
behind `score()` later without any caller having to change. `"source":
"precomputed_snapshot"` is the tell — it becomes `"live_model"` the day
that swap happens.

```json
// Response 200
{
  "enterprise_id": "ENT0031",
  "as_of": "2026-07-31",
  "risk_tier": "AMBER",
  "prob_stress": 0.1242,
  "prob_missed_repayment": 0.0004,
  "fused_score": 0.4148,
  "forecast_net_90d_p10": null,
  "forecast_net_90d_p50": null,
  "forecast_net_90d_p90": null,
  "reason_1": "margin_squeeze",
  "reason_2": "working_capital_erosion",
  "reason_3": "debt_overhang",
  "model_id": "hgb_stress_v1.2",
  "rule_version": "rules_v1.2_18rules",
  "features": {
    "net_buffer_days": -57.4,
    "dscr_annual": null,
    "margin_gap_90d": 0.2171,
    "...": "see backend/app/schemas/risk.py for the full field list"
  },
  "source": "precomputed_snapshot"
}
```
The `forecast_net_90d_*` fields are `null` on the most recent `as_of` for
many enterprises — the forward forecast for the current month end hasn't
been populated yet in the dataset; earlier months carry real values. This
is a data characteristic, not a bug in this endpoint.

## `POST /voice/entries` — merchant only

Multipart upload: a merchant records a voice note (app), an IVR call is
captured, or an assisted-channel worker records on the merchant's behalf.
Backend forwards the audio to Sarvam AI's speech-to-text, stores the
transcript, and runs a best-effort regex amount/direction extraction —
**never auto-posted to the ledger**; every entry lands in the officer's
review queue below until a human confirms it (see
`database/04_live_data.sql`'s comment on why: spoken Indian-language
amounts are the top failure mode).

```
Content-Type: multipart/form-data
file: <audio blob, wav/mp3/aac/flac/ogg, ≤30s, 8kHz or 16kHz mono>
channel: "app" | "ivr" | "assisted"   (default "app")
device_id: string, optional
spoken_at: ISO datetime, optional (defaults to now)
audio_sample_rate: int, optional (defaults 8000 for ivr, 16000 otherwise)
```

```json
// Response 200
{
  "voice_id": "f6f20f15-f0bf-4b3b-b6e8-7cc9f9bd5976",
  "enterprise_id": "ENT0031",
  "channel": "app",
  "detected_lang": "gu-IN",
  "transcript": "aaje doodh vechine ek hajar rupiya malya",
  "request_id": "20260803_...",
  "api_latency_ms": 538,
  "error": null,
  "spoken_at": "2026-08-03T08:04:27Z",
  "amount": 1000.00,
  "direction": "inflow",
  "confidence": 0.5,
  "needs_review": true
}
```
`error` is non-null (and the route returns `502`) if the Sarvam call itself
fails — the row is still written so there's a trace of the attempt.
`confidence` is always `0.5` when an amount is found by the regex
heuristic (never higher) — it is not a trained extractor, so it can never
clear `voice_extractions`'s 0.70 auto-accept threshold; `needs_review` is
therefore always `true` today. `language_probability` and
`diarised_speaker` are always `null` — Sarvam's synchronous API (the one
used here) doesn't return either; both require the batch API, not wired up
yet.

**Uploading the recording** — this is a normal multipart form, not JSON;
don't set `Content-Type` yourself, let the browser/RN runtime add the
`boundary=...` parameter for you (setting it manually is the most common
way this kind of upload silently breaks).

Web (`MediaRecorder`):
```ts
// after recording: const blob = new Blob(chunks, { type: 'audio/webm' })
const form = new FormData();
form.append('file', blob, 'note.webm');
form.append('channel', 'app');

const res = await fetch(`${BASE_URL}/voice/entries`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` }, // no Content-Type — fetch sets it
  body: form,
});
```

Mobile (Expo `expo-av`):
```ts
// after Audio.Recording finishes: const uri = recording.getURI()
const form = new FormData();
form.append('file', { uri, name: 'note.m4a', type: 'audio/m4a' } as any);
form.append('channel', 'app');

const res = await fetch(`${BASE_URL}/voice/entries`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` },
  body: form,
});
```
Sarvam accepts WAV/MP3/AAC/FLAC/OGG, so `expo-av`'s default `.m4a` (AAC)
output works as-is — no client-side transcoding needed. Keep recordings
**under 30 seconds**; that's Sarvam's sync-API hard limit, not a
choice made here — anything longer needs the batch API (not wired up).

## `GET /voice/review-queue` — officer only

The calling officer's own pending voice entries (their enterprises only),
backed by `v_voice_review_queue`. Same array-of-rows shape as `/worklist`.

## `POST /voice/review/{extraction_id}` — officer only

Officer confirms (or corrects) the amount, closing the loop into a real
ledger row.

```json
// Request
{ "reviewed_amount": 1500.00, "direction": "inflow", "category": "milk_sale", "is_household": false, "tender": "cash" }

// Response 200
{ "entry_id": "bad5a37c-...", "enterprise_id": "ENT0031", "event_date": "2026-08-03", "direction": "inflow", "amount": 1500.00 }
```
Writes `voice_extractions.reviewed_by`/`reviewed_amount` and a new
`ledger_entries_live` row (`source = 'voice'`, `confidence = 1.0` since a
human just confirmed it) — this is what feeds `v_daily_from_voice` and,
from there, the same pipeline `daily_ledger` already feeds. Unknown
`extraction_id` → `404`.

## `/evidence/*` — officer only, book-wide (not scoped to the caller)

Seven read-only endpoints, each a thin wrapper around one evaluation view —
see [`database/SCHEMA.md`](database/SCHEMA.md) for what each view computes.
These answer "is this system any good," not "what should I do about this
merchant" — expect a dashboard/ops screen to use these, not a per-merchant
detail screen. None of them take path/query params; they return the whole
book every time (small enough tables that this is fine at hackathon scale).

```
GET /evidence/district-events        → array, only currently-active district events
GET /evidence/alert-precision        → array, one row per risk tier
GET /evidence/reason-code-scorecard  → array, one row per mechanism + an "ALL" row
GET /evidence/lead-time              → single object
GET /evidence/forecast-accuracy      → array, one row per forecast horizon
GET /evidence/headroom-by-tier       → array, one row per risk tier
GET /evidence/data-provenance        → array, one row per enterprise
```

```json
// GET /evidence/district-events — response 200 (one element)
{
  "as_of": "2026-07-31",
  "district": "Ganjam",
  "sector": "POULTRY",
  "mechanism": "margin_squeeze",
  "flagged": 4,
  "total_in_cohort": 6,
  "pct_of_cohort": 67,
  "no_buffer": 2,
  "visit_these_three": ["ENT0203", "ENT0085", "ENT0033"],
  "is_district_event": true
}
```
```json
// GET /evidence/lead-time — response 200
{ "episodes": 9, "caught": 9, "median_lead_days": 121, "min_lead_days": 111, "max_lead_days": 355 }
```
Small n's are real, not a display bug — e.g. `lead-time` is measured on
only 9 out-of-time episodes. Show the n alongside the number; don't quote
`median_lead_days` bare.

`alert-precision` is **book-wide across all officers**, not scoped to the
calling officer — there's no `officer_id` on the underlying view yet, so a
per-officer breakdown isn't available without extending it first (see
`KPIS.md`'s "Gaps worth naming").

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
