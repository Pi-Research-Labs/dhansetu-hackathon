# DhanSetu Backend (FastAPI)

## Setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

## Run

```bash
fastapi dev app/main.py
```

API will be available at http://127.0.0.1:8000, docs at http://127.0.0.1:8000/docs.

## Database

Schema, dataset and load scripts live in [`../database`](../database). Set
`DATABASE_URL` in `.env` to point at the shared hackathon Postgres instance
(ask a teammate for the password — it's not in this repo).

**Only query views** (`v_enterprises_safe`, `v_officer_worklist`,
`v_enterprise_card`, etc.), never the raw `enterprises` / `daily_ledger`
tables — see `../database/README.md` for why. This is enforced by convention
for the hackathon, not by Postgres roles, so it's on code review to catch.

## Auth

- `POST /api/v1/auth/login` (`phone_number` + `password`) authenticates a
  merchant against `dhansetu.merchant_accounts` and returns a JWT.
- `POST /api/v1/auth/officer-login` — same shape, authenticates a field
  officer against `dhansetu.officer_accounts`.

Both JWTs carry a `role` claim (`merchant` / `officer`) so they can't be used
interchangeably. Demo credentials for the 6 named personas and 6 officers are
in `../database/README.md`. This is a hackathon shortcut — phone + OTP is the
right login for the actual target users; see that README for why.

- `GET /api/v1/auth/me` — works with either token type, returns the caller's
  own identity. Use this on app start to restore a session from a stored
  token without re-prompting for a password.

## API

All routes below require `Authorization: Bearer <token>` from one of the
login endpoints above.

| Route | Access | Backed by |
|---|---|---|
| `GET /api/v1/worklist` | officer only | `v_officer_worklist`, filtered to the caller's own `officer_id` |
| `GET /api/v1/enterprise/{enterprise_id}` | officer (any), merchant (own enterprise only) | `v_enterprise_card` + `v_live_forecast` + latest `v_alert_actions` |
| `GET /api/v1/enterprise/{enterprise_id}/receivables` | officer (any), merchant (own only) | `v_receivables_ageing` — the udhaar book by counterparty |
| `GET /api/v1/enterprise/{enterprise_id}/payment-mix` | officer (any), merchant (own only) | `v_merchant_payment_mix` — UPI/wallet/cash share |
| `POST /api/v1/outcome` | officer only | `dhansetu.record_outcome()` — closes the task and writes a `visit_outcomes` row |
| `GET /api/v1/risk/{enterprise_id}/predict` | officer (any), merchant (own only) | `app/services/risk_model.py` — serving stub, reads `risk_assessments`/`feature_snapshots`, not live inference |
| `GET /api/v1/enterprise/{enterprise_id}/map-tile` | officer (any), merchant (own only) | Google Maps Static API (`app/services/maps.py`), proxied server-side — returns `image/png` bytes, key never reaches the frontend |
| `POST /api/v1/voice/entries` | merchant only | Sarvam speech-to-text (`app/services/voice.py`) → `voice_entries` + `voice_extractions` |
| `GET /api/v1/voice/review-queue` | officer only | `v_voice_review_queue`, filtered to the caller's own `officer_id` |
| `POST /api/v1/voice/review/{extraction_id}` | officer only | Confirms the amount → writes `ledger_entries_live` (`source='voice'`) |
| `GET /api/v1/evidence/*` (7 routes) | officer only, book-wide | Evaluation views — district events, alert precision, reason-code accuracy, lead time, forecast accuracy, headroom-by-tier, data provenance. See `API.md` for the full list. |

A merchant token requesting another enterprise's detail gets `403`; an
officer token can view any enterprise (needed for cross-district visibility
during shock events — see `v_district_event_watch` in `../database/README.md`).

**The risk endpoint is a serving stub, not a trained model.** There is no
model artifact anywhere in this repo — `predict_risk()` reads the
enterprise's latest precomputed `risk_assessments` row and returns it in
the shape a real model's output would take (`"source":
"precomputed_snapshot"` in the response says so explicitly). The interface
(auth, request/response shape) is meant to be stable so a trained model can
replace the body of `score()` later without any caller changing.

**The voice endpoints are a real integration, not a stub** — audio is
actually sent to Sarvam AI and transcribed. What's *not* real yet is amount
extraction: it's a plain regex heuristic capped at `confidence = 0.5`,
always below the DB's 0.70 auto-accept threshold, so every voice entry
lands in an officer's review queue rather than silently becoming a ledger
fact. See `API.md` for the full request/response shapes.

**Found and fixed while wiring this up:** `record_outcome()` referenced bare
table names that only resolved via `search_path`, which doesn't carry into a
function body from a fresh connection — every call failed with
`relation "officer_tasks" does not exist` until the function was altered to
`SET search_path = dhansetu, public` (see `../database/05_views.sql` and
`../database/09_app_grants.sql`, which also had to grant `INSERT` on
`visit_outcomes` and `UPDATE (status)` on `officer_tasks` — neither was
covered by the original grants).

## Deployment

Running live on the GCP VM (`instance-20260801-123322`) as a systemd service
— see [`../API.md`](../API.md) for the base URL and full endpoint docs
consumed by `mobile`/`web`.

```bash
# on the VM
sudo systemctl status dhansetu-backend    # check it's up
sudo systemctl restart dhansetu-backend   # after redeploying code
journalctl -u dhansetu-backend -f         # tail logs
```

`Restart=always` + `WantedBy=multi-user.target`, so it survives crashes and
the VM's 9AM/9PM auto stop-start schedule. `DATABASE_URL` on the VM points at
`localhost` (backend and Postgres are colocated there), not the public IP —
faster and one less thing exposed over the public interface.

**HTTPS via nginx + Let's Encrypt**: the backend is only reachable directly
on `localhost:8000` now — port 8000 is *not* open to the internet anymore
(`dhansetu-backend-firewall` was deleted once this was in place). nginx
terminates TLS for `dhansetu-api.piresearchlabs.com` (cert via `certbot`,
auto-renews, DNS is an A record in Route53 pointing at the static IP) and
reverse-proxies to `127.0.0.1:8000`; HTTP requests get a 301 to HTTPS. Config
is at `/etc/nginx/sites-available/dhansetu-api` on the VM. Only ports 80/443
are open now (`dhansetu-web-firewall`) instead of 8000 directly.

**Domain moved from `dhansetu-api.payintelli.com` to
`dhansetu-api.piresearchlabs.com`** — the DNS A record now lives in
`piresearchlabs.com`'s Route53 hosted zone (`Z08495342XBYXFL04BQ1O`), not
`payintelli.com`'s. The old record was deleted, not just left stale — don't
go looking for it. The TLS cert (`certbot certificates` on the VM, cert
name `dhansetu-api.payintelli.com`) still carries **both** hostnames as
SANs — it was expanded to cover the new domain during a zero-downtime
cutover and was never narrowed back down. Harmless (nothing resolves the
old hostname anymore, so nobody can complete a handshake against that SAN
regardless), but if you want it fully clean, reissue with `certbot --nginx
-d dhansetu-api.piresearchlabs.com --cert-name dhansetu-api.piresearchlabs.com`
and delete the old cert name afterward.

The external IP (`34.47.227.201`) is reserved as a **static** address
(`dhansetu-static-ip`) — it doesn't change across stop/start cycles. It
wasn't static originally, and did in fact change on the first restart after
this doc was written (`34.100.152.235` → `34.47.227.201`), breaking every
reference to it at the time. If you ever see a different IP than what's in
this repo, check `gcloud compute addresses describe dhansetu-static-ip`
before assuming docs are wrong — though now that DNS points at
`dhansetu-api.piresearchlabs.com` rather than the raw IP, this matters less.

To redeploy after code changes: copy the updated `backend/` to
`~/dhansetu-backend` on the VM (excluding `.venv`/`.env`), reinstall
requirements if `requirements.txt` changed, then `sudo systemctl restart
dhansetu-backend`.

## Structure

```
app/
  main.py         # FastAPI app entrypoint, DB pool lifespan
  core/           # config, settings, db pool (db.py), password/JWT (security.py)
  api/
    router.py     # aggregates route modules
    routes/       # individual route modules (health, auth, ...)
  models/         # ORM / DB models
  schemas/        # Pydantic request/response schemas
  services/       # business logic (auth.py talks to merchant_accounts / officer_accounts)
tests/
```
