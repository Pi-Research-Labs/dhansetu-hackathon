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
| `POST /api/v1/outcome` | officer only | `dhansetu.record_outcome()` — closes the task and writes a `visit_outcomes` row |

A merchant token requesting another enterprise's detail gets `403`; an
officer token can view any enterprise (needed for cross-district visibility
during shock events — see `v_district_event_watch` in `../database/README.md`).

**Found and fixed while wiring this up:** `record_outcome()` referenced bare
table names that only resolved via `search_path`, which doesn't carry into a
function body from a fresh connection — every call failed with
`relation "officer_tasks" does not exist` until the function was altered to
`SET search_path = dhansetu, public` (see `../database/05_views.sql` and
`../database/09_app_grants.sql`, which also had to grant `INSERT` on
`visit_outcomes` and `UPDATE (status)` on `officer_tasks` — neither was
covered by the original grants).

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
