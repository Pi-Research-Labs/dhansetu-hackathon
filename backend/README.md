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

## Structure

```
app/
  main.py         # FastAPI app entrypoint
  core/           # config, settings
  api/
    router.py     # aggregates route modules
    routes/       # individual route modules
  models/         # ORM / DB models
  schemas/        # Pydantic request/response schemas
  services/       # business logic
tests/
```
