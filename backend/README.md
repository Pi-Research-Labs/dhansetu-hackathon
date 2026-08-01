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

`POST /api/v1/auth/login` (`phone_number` + `password`) authenticates a
merchant against `dhansetu.merchant_accounts` and returns a JWT. Demo
credentials for the 6 named personas are in `../database/README.md`. This is
a hackathon shortcut — phone + OTP is the right login for the actual target
users; see that README for why.

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
  services/       # business logic (auth.py talks to merchant_accounts)
tests/
```
