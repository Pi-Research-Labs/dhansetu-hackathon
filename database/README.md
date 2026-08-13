# DHANSETU database

Postgres schema and dataset for the DHANSETU rural cash-flow intelligence
prototype: 37 tables, 831,723 rows, 29 views, generated from the CSVs in
`data/dhansetu_v1_2/`. The DDL is generated from those CSVs (`gen_schema.py`),
so column names, order and types can't drift from the data.

**For a full table-by-table / view-by-view reference plus both sides'
demo login credentials, see [`SCHEMA.md`](SCHEMA.md).**

Already loaded and verified on the hackathon GCP VM (`dhansetu` database).
This folder is what you need to reproduce that locally, or reload it.

## Quick start

```bash
sudo apt install -y postgresql postgresql-client   # or brew install postgresql
sudo -u postgres createuser -s "$USER"              # once, if not already a superuser
./load.sh data/dhansetu_v1_2
psql -d dhansetu -f demo_queries.sql
```

Takes 2-4 minutes. Re-running is safe — `01_schema.sql` drops and recreates
tables in dependency order.

## Run order

| File | What it does |
|---|---|
| `01_schema.sql` | 37 tables, PKs, CHECK constraints, column comments. Generated. |
| `02_load.sql` | `\copy` for every table with explicit column lists. Generated. |
| `03_constraints_indexes.sql` | 42 foreign keys + 17 indexes. Separate on purpose — a single bad row can't abort the load. |
| `04_live_data.sql` | Real-data layer: district geo, Sarvam voice capture, Agmarknet, Open-Meteo. |
| `05_views.sql` | 23 views — the API surface. |
| `06_verify.sql` | Expected vs. loaded row counts. |
| `07_auth.sql` | `merchant_accounts` table + seed logins for the 6 named demo personas. Hand-written. |
| `08_officer_auth.sql` | `officer_accounts` table + seed logins for all 6 field officers. Hand-written. |
| `09_app_grants.sql` | Grants `dhansetu_user` the access it actually needs to run the API. Hand-written. |
| `10_dedupe_names.sql` | Renames the ~40 enterprises whose `proprietor_name` (and ~130 whose `business_name`) collided with another enterprise's. Hand-written. |
| `demo_queries.sql` | One query per screen / per deck claim. |

`load.sh` runs 01-05, 07, 08, 09 and 10, and prints row counts. Run
`06_verify.sql` yourself for the full 37-table comparison.

**Why `10_dedupe_names.sql` exists:** the name generator
(`data/dhansetu_v1_2/src/simulate.py`) draws first-name/surname pairs *with
replacement* from a small per-language pool, independently for each of the
~42 enterprises per district — collisions are near-guaranteed by simple
probability, not a generator bug. Before this file, 252 enterprises had
only 212 distinct `proprietor_name` values, including one of the 6 named
demo personas (Sunita Devi, `ENT0067`) colliding with an unrelated
enterprise (`ENT0213`) in the same district — exactly the kind of thing
that confuses a live demo. Replacement names are redrawn from the same
language/gender pool the generator uses, so they read as generated data,
not an inserted patch; the named personas always keep their original name.

## How the FastAPI backend should talk to this database

**The backend must only ever query views, never the raw tables.** For this
hackathon that boundary is enforced by convention/code review, not by Postgres
roles — `dhansetu_user` has full `SELECT` on the raw tables too (granted by
`09_app_grants.sql`). That's a deliberate simplification given the timeline;
see "What we skipped" below if that changes.

**Heads up:** before `09_app_grants.sql` existed, `dhansetu_user` had
database-level `CONNECT`/`CREATE` but *no* privileges inside the `dhansetu`
schema at all — not even on the safe views. Every query, including
`/auth/login`, failed with `permission denied for schema dhansetu`. If you
ever recreate this database from scratch without running `load.sh`
end-to-end (e.g. you only ran `01-05` by hand), you'll hit the same thing —
run `09_app_grants.sql` too.

The three API endpoints are already views:

```
GET  /worklist          -> v_officer_worklist    (filter officer_id)
GET  /enterprise/{id}   -> v_enterprise_card + v_live_forecast + v_alert_actions
POST /outcome           -> SELECT record_outcome(task_id, outcome, intervention)
```

So the FastAPI layer is `SELECT * FROM <view> WHERE ...` and one function
call. No ORM, no query building required.

### Never query these directly

`enterprises.sim_health_latent`, `enterprises.sim_stress_script` and
`daily_ledger.drv_*` are **simulator ground truth**. They exist so reason
codes can be scored against the true cause — using them as a feature or
exposing them via the API is label leakage and invalidates every metric in
`data/dhansetu_v1_2/SLIDE_CORRECTIONS.md`.

**Always read `v_enterprises_safe` and `v_ledger_safe` instead of
`enterprises` / `daily_ledger`.** They expose the same rows minus the
leakage columns. The columns are also flagged in Postgres via
`COMMENT ON COLUMN`, visible with `\d+ enterprises`.

## Connecting from the backend

Set `DATABASE_URL` in `backend/.env` (gitignored, never commit it):

```
DATABASE_URL=postgresql://dhansetu_user:<password>@<VM_EXTERNAL_IP>:5432/dhansetu
```

Ask a teammate for the current password out-of-band (Slack DM, not email/a
group chat) — it's intentionally not in this repo. The VM's Postgres also
currently accepts connections from any IP (`0.0.0.0/0`), a deliberate
hackathon-only tradeoff — see the infra notes your team has for the VM.

## The live-data layer (`04_live_data.sql`)

Empty tables ready for real inputs, designed to sit alongside the synthetic
panel rather than replace it:

- **`voice_entries`** — one row per Sarvam call: `sarvam_model`, `sarvam_mode`
  (`codemix` etc.), `detected_lang`, `language_probability`, `transcript`,
  `diarised_speaker`, `audio_sample_rate` (8000 for IVR, 16000 for app),
  `api_latency_ms`.
- **`voice_extractions`** — parsing is a *separate* table so you can re-run
  extraction against a better prompt without paying to re-transcribe.
  `needs_review` is a generated column that fires when the amount is missing
  or confidence < 0.70.
- **`ledger_entries_live`** — append-only, UUID PKs, corrections are new rows
  referencing the original. `v_ledger_live_effective` resolves them.
- **`v_daily_from_voice`** rolls real entries into the same shape as
  `daily_ledger`, so the existing pipeline consumes real data unchanged.
- **`mandi_prices_live`** / **`weather_live`** — Agmarknet and Open-Meteo,
  unified with the synthetic series by `v_price_series` and `v_weather_series`
  (both carry a `provenance` column).
- **`ingestion_runs`** — log every API pull.

## Pulling real weather (`backend/scripts/ingest_open_meteo.py`)

`04_live_data.sql` creates the tables; this script fills them. It lives under
`backend/` rather than here because it has to run on the VM on a schedule, and
`deploy.yml` only copies `backend/` there.

```bash
backend/.venv/bin/python backend/scripts/ingest_open_meteo.py                    # 30d back + 7d forecast
backend/.venv/bin/python backend/scripts/ingest_open_meteo.py --dry-run          # fetch, write nothing
backend/.venv/bin/python backend/scripts/ingest_open_meteo.py --past-days 90
```

Needs `DATABASE_URL` (environment, or read from `backend/.env`). Uses `asyncpg`
and `httpx`, both already backend dependencies — hence the backend venv rather
than a bare `python3`. Open-Meteo needs no API key.

Idempotent: upserts on `(district_id, obs_date, is_forecast)`, so re-running
refreshes rows instead of duplicating them. Every run writes an
`ingestion_runs` row with the HTTP status and counts, including failed runs.

`dhansetu_user` already has the grants it needs (`09_app_grants.sql` lines
23–24 cover `INSERT, UPDATE` on `weather_live` and `ingestion_runs`, and
sequence usage) — no extra grant step.

**Already installed on the VM** as a daily cron for `tarunmenon`:

```cron
# Open-Meteo weather pull. Times are UTC (this VM is Etc/UTC); 03:40 UTC = 09:10 IST,
# ten minutes after the dhansetu-daily-schedule policy starts the VM at 09:00 IST.
40 3 * * *  cd ~/dhansetu-backend && .venv/bin/python scripts/ingest_open_meteo.py >> ~/open-meteo.log 2>&1
```

**The VM's clock is `Etc/UTC`, but the start/stop resource policy
(`dhansetu-daily-schedule`) is expressed in `Asia/Kolkata`** — so a cron
schedule and the VM's uptime window are written in different timezones. `30 9`
looks like "half past nine, just after boot" and actually fires at 15:00 IST,
six hours into the window. Convert to UTC and check the result lands inside
03:30–15:30 UTC, which is what 09:00–21:00 IST is.

Verified to run under cron's environment rather than just an interactive shell:

```bash
env -i HOME=/home/tarunmenon SHELL=/bin/sh PATH=/usr/bin:/bin /bin/sh -c \
  "cd ~/dhansetu-backend && .venv/bin/python scripts/ingest_open_meteo.py"
```

Output goes to `~/open-meteo.log`, and every run also leaves an
`ingestion_runs` row, so a silent failure is still visible in the database.

Read it back via `GET /weather/{district_id}` (see [`API.md`](../API.md)) or
`v_weather_series`, which unions these rows with the synthetic panel behind a
`provenance` column. **Aggregating `v_weather_series` directly needs care** — it
is a plain `UNION ALL`, so a date can carry a real observation, a synthetic row
and an earlier forecast at once. The endpoint resolves that to one row per day
(observation over forecast, real over synthetic); a hand-written query has to do
the same or it double-counts rainfall.

See `data/dhansetu_v1_2/README.md` for the full commodity-mapping notes
(`commodity_map` — which of the ten commodities aren't on Agmarknet, and why
that gap is itself part of the pitch).

## Merchant app login (`07_auth.sql`)

`merchant_accounts` (phone number + bcrypt password hash) backs the mobile
app's `POST /auth/login`, wired up in `backend/app/api/routes/auth.py`. It
returns a JWT (`sub` = `enterprise_id`) plus the merchant's name.

**This is a hackathon shortcut, not the right long-term design.** The target
users are exactly the people the persona notes describe as low-digital-
literacy / shared-device / IVR-preferring (see `data/dhansetu_v1_2/
SLIDE_CORRECTIONS.md` — Sunita Devi uses IVR precisely because typing isn't
realistic for her). Phone number + OTP is the right login for production;
password auth was chosen here only because it needs no SMS gateway to demo.

Seed accounts (the 6 named personas, `enterprises.is_named_persona`) —
**synthetic demo data, not real people, passwords intentionally documented
here**:

| Enterprise | Persona | Phone | Password |
|---|---|---|---|
| ENT0031 | Lakshmiben Patel | `9000000031` | `Lakshmi@0031` |
| ENT0104 | Suresh Reddy | `9000000104` | `Suresh@0104` |
| ENT0067 | Sunita Devi | `9000000067` | `Sunita@0067` |
| ENT0152 | Anita Patil | `9000000152` | `Anita@0152` |
| ENT0188 | Nilima Bora | `9000000188` | `Nilima@0188` |
| ENT0224 | Basanti Pradhan | `9000000224` | `Basanti@0224` |

```bash
curl -X POST http://<VM_IP>:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone_number":"9000000031","password":"Lakshmi@0031"}'
```

## Field officer login (`08_officer_auth.sql`)

Same pattern as merchant login, separate table (`officer_accounts`) and
endpoint (`POST /auth/officer-login`), so tokens carry a `role` claim
(`merchant` vs `officer`) — merchant credentials are rejected on the officer
endpoint and vice versa. Same OTP-vs-password caveat as above applies.

Seed accounts for all 6 field officers:

| Officer | District | Phone | Password |
|---|---|---|---|
| FO1 Prakash Nair | Anand | `8000000001` | `Prakash@FO1` |
| FO2 Meena Choudhary | Bhilwara | `8000000002` | `Meena@FO2` |
| FO3 K. Ramesh | Nizamabad | `8000000003` | `Ramesh@FO3` |
| FO4 Sujata Kulkarni | Kolhapur | `8000000004` | `Sujata@FO4` |
| FO5 Dhruba Saikia | Nagaon | `8000000005` | `Dhruba@FO5` |
| FO6 Sanjay Behera | Ganjam | `8000000006` | `Sanjay@FO6` |

```bash
curl -X POST http://<VM_IP>:8000/api/v1/auth/officer-login \
  -H "Content-Type: application/json" \
  -d '{"phone_number":"8000000001","password":"Prakash@FO1"}'
```

## Gotchas already handled

- **`daily_ledger.batch_id` has no FK.** 30 rows reference batches still in
  progress at panel end, which have no realisation row yet. That's correct
  behaviour.
- **`daily_ledger.batch_id` is `TEXT`, not numeric** — the first few thousand
  rows are all NULL, so naive type inference makes it a float and the load
  fails.
- **Booleans are Python-style `True`/`False`** — Postgres accepts these
  case-insensitively.
- **Empty strings are NULL** — every `\copy` uses `NULL ''`.
- **Gzipped tables are decompressed to a temp dir first**, so `\copy` runs
  client-side and needs no superuser.
- **`quantile` is a column name** — every identifier is double-quoted
  throughout.
- **`record_outcome()` needs `SET search_path` on the function itself**, not
  just at the top of the file that creates it. Its body references bare
  table names (`officer_tasks`, `visit_outcomes`); those only resolved via
  `search_path`, which doesn't carry into a plpgsql function body from a
  fresh connection — every call failed with `relation "officer_tasks" does
  not exist` until fixed in `05_views.sql` (`LANGUAGE plpgsql SET search_path
  = dhansetu, public AS $$...`). Also needed `GRANT INSERT` on
  `visit_outcomes` and `GRANT UPDATE (status)` on `officer_tasks` for
  `dhansetu_user` — neither was in the original `09_app_grants.sql`.

## What we skipped (on purpose, for now)

- **Postgres-level role restriction.** A stricter setup would grant
  `dhansetu_user` (or per-teammate roles) `SELECT` on `v_enterprises_safe` /
  `v_ledger_safe` only, with no access to the raw `enterprises` /
  `daily_ledger` tables — so leakage is structurally impossible rather than a
  matter of code review. We're relying on "the backend only queries views"
  as a convention instead, since the hackathon timeline doesn't justify the
  extra setup. Revisit this if the project continues past the hackathon.
- **IP-restricted firewall / VPN-only access to Postgres.** Same tradeoff —
  fine for a demo window, not for anything long-lived.

## Regenerating

If you rebuild the dataset, regenerate the DDL rather than editing it:

```bash
python3 gen_schema.py     # rewrites 01_schema.sql, 02_load.sql, 03_*.sql, 06_verify.sql
```

`04_live_data.sql`, `05_views.sql` and `demo_queries.sql` are hand-written and
are not overwritten.

The dataset itself (`data/dhansetu_v1_2/`) was generated by the scripts in
`data/dhansetu_v1_2/src/` (`refdata.py`, `simulate.py`, `analyse.py`,
`export.py`, `run_export.py`) — included for provenance, not as a
one-command regenerator: `run_export.py` reads intermediate pickled state
(`stage1.pkl`-`stage4.pkl`) from hardcoded paths that aren't part of this
bundle. See `data/dhansetu_v1_2/README.md` for what the dataset guarantees
(seed, row counts, validation checks).
