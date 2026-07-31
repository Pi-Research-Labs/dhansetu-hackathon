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
