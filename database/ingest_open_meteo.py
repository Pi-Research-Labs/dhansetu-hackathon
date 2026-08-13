#!/usr/bin/env python3
"""Pull real daily weather for the six districts from Open-Meteo into weather_live.

    backend/.venv/bin/python database/ingest_open_meteo.py
    backend/.venv/bin/python database/ingest_open_meteo.py --past-days 60 --dry-run

Needs DATABASE_URL (read from the environment, or from backend/.env if present).
Uses asyncpg + httpx, both already backend dependencies -- run it with the
backend venv rather than a bare python3.

WHY OPEN-METEO
No API key, no quota registration, and it serves recent past and forecast from
one endpoint. 04_live_data.sql was written against it: weather_live carries
`is_forecast` and a GENERATED `thi` column, and v_weather_series already unions
weather_live with the synthetic weather_daily panel behind a `provenance`
column. So this script is the missing half of an integration that was already
designed -- it does not invent any schema.

WHY THI IS THE POINT
thi is a generated column: 0.8*temp_max + (humidity/100)*(temp_max - 14.4) + 46.4.
Above roughly 78, dairy yield measurably declines -- that is the founding
insight of this product, and with this script it stops being a hand-authored
seasonality curve and becomes a real observation for a real district today.
Which is why humidity is fetched rather than temperature alone: without it the
generated column is NULL and the row is decorative.

WHAT THIS DELIBERATELY DOES NOT DO
It does not touch feature_snapshots or risk_assessments. Every published
evidence number -- forecast accuracy, reason-code correctness, lead time -- is
computed out-of-time against the synthetic panel. Feeding live observations into
scoring would mean those numbers no longer describe the system being
demonstrated. Live weather is additive here, and v_weather_series marks its
provenance so a reader can always tell which rows are real.

THE FORECAST / OBSERVATION OVERLAP
weather_live's primary key is (district_id, obs_date, is_forecast), so the same
date can hold both a forecast written days ago and the observation that later
replaced it. That is intentional and nothing is deleted -- readers filter on
is_forecast, and GET /weather/{district_id} returns observations only unless
asked otherwise. Do not aggregate v_weather_series without that filter or
rainfall gets counted twice for the overlap days.
"""

import argparse
import asyncio
import json
import os
import sys
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

import asyncpg
import httpx

FORECAST_URL = "https://api.open-meteo.com/v1/forecast"

# Open-Meteo's documented ceilings for this endpoint.
MAX_PAST_DAYS = 92
MAX_FORECAST_DAYS = 16

# Dates are requested in IST, so "is this date still in the future" has to be
# asked in IST too -- asking in UTC mislabels the current Indian day as a
# forecast for five and a half hours every night.
IST = ZoneInfo("Asia/Kolkata")

_DAILY_VARS = (
    "precipitation_sum",
    "temperature_2m_max",
    "temperature_2m_min",
    "relative_humidity_2m_mean",
)

_TIMEOUT = httpx.Timeout(30.0)


def _load_database_url() -> str:
    """Environment first, then backend/.env, which is gitignored and holds the real one."""
    url = os.environ.get("DATABASE_URL")
    if url:
        return url

    env_path = Path(__file__).resolve().parent.parent / "backend" / ".env"
    if env_path.exists():
        for line in env_path.read_text().splitlines():
            line = line.strip()
            if line.startswith("DATABASE_URL="):
                return line.split("=", 1)[1].strip().strip("'\"")

    sys.exit("DATABASE_URL not set and not found in backend/.env")


async def _fetch_district(
    client: httpx.AsyncClient, lat: float, lon: float, past_days: int, forecast_days: int
) -> tuple[int, dict]:
    response = await client.get(
        FORECAST_URL,
        params={
            "latitude": lat,
            "longitude": lon,
            "daily": ",".join(_DAILY_VARS),
            "timezone": "Asia/Kolkata",
            "past_days": past_days,
            "forecast_days": forecast_days,
        },
    )
    response.raise_for_status()
    return response.status_code, response.json()


def _rows_for_district(district_id: int, payload: dict, today) -> list[tuple]:
    """Flatten one Open-Meteo response into weather_live tuples.

    thi is omitted on purpose -- it is GENERATED ALWAYS, so naming it in the
    INSERT is an error, not an optimisation.
    """
    daily = payload.get("daily") or {}
    dates = daily.get("time") or []

    def series(name: str) -> list:
        values = daily.get(name) or []
        return values + [None] * (len(dates) - len(values))

    rain = series("precipitation_sum")
    tmax = series("temperature_2m_max")
    tmin = series("temperature_2m_min")
    rh = series("relative_humidity_2m_mean")

    rows = []
    for i, day in enumerate(dates):
        obs_date = datetime.strptime(day, "%Y-%m-%d").date()
        # Today is still accumulating, so it is a forecast until it is over.
        is_forecast = obs_date >= today
        rows.append((district_id, obs_date, rain[i], tmax[i], tmin[i], rh[i], is_forecast))
    return rows


_UPSERT = """
INSERT INTO dhansetu.weather_live
    (district_id, obs_date, rainfall_mm, temp_max_c, temp_min_c, humidity_pct, is_forecast)
VALUES ($1, $2, $3, $4, $5, $6, $7)
ON CONFLICT (district_id, obs_date, is_forecast) DO UPDATE
    SET rainfall_mm  = EXCLUDED.rainfall_mm,
        temp_max_c   = EXCLUDED.temp_max_c,
        temp_min_c   = EXCLUDED.temp_min_c,
        humidity_pct = EXCLUDED.humidity_pct,
        fetched_at   = now()
"""


async def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--past-days", type=int, default=30, help=f"1-{MAX_PAST_DAYS}, default 30")
    parser.add_argument(
        "--forecast-days", type=int, default=7, help=f"0-{MAX_FORECAST_DAYS}, default 7"
    )
    parser.add_argument(
        "--dry-run", action="store_true", help="fetch and report, write nothing to the database"
    )
    args = parser.parse_args()

    if not 1 <= args.past_days <= MAX_PAST_DAYS:
        sys.exit(f"--past-days must be between 1 and {MAX_PAST_DAYS}")
    if not 0 <= args.forecast_days <= MAX_FORECAST_DAYS:
        sys.exit(f"--forecast-days must be between 0 and {MAX_FORECAST_DAYS}")

    today = datetime.now(IST).date()
    conn = await asyncpg.connect(_load_database_url())

    try:
        districts = await conn.fetch(
            """
            SELECT g.district_id, g.lat, g.lon, d.district, d.state
            FROM dhansetu.district_geo g
            JOIN dhansetu.districts d USING (district_id)
            ORDER BY g.district_id
            """
        )
        if not districts:
            sys.exit("district_geo is empty -- run database/04_live_data.sql first")

        params = {
            "past_days": args.past_days,
            "forecast_days": args.forecast_days,
            "districts": [r["district_id"] for r in districts],
            "daily": list(_DAILY_VARS),
        }

        # The run is logged before the fetch so a crash mid-pull still leaves a
        # row saying it was attempted, rather than no evidence at all.
        run_id = None
        if not args.dry_run:
            run_id = await conn.fetchval(
                """
                INSERT INTO dhansetu.ingestion_runs (source, params)
                VALUES ('open_meteo', $1::jsonb) RETURNING run_id
                """,
                json.dumps(params),
            )

        rows: list[tuple] = []
        status = None
        error = None

        try:
            async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
                results = await asyncio.gather(
                    *(
                        _fetch_district(
                            client, r["lat"], r["lon"], args.past_days, args.forecast_days
                        )
                        for r in districts
                    )
                )
            for district, (code, payload) in zip(districts, results):
                status = code
                rows.extend(_rows_for_district(district["district_id"], payload, today))
        except httpx.HTTPStatusError as exc:
            status, error = exc.response.status_code, str(exc)
        except (httpx.HTTPError, ValueError, KeyError) as exc:
            error = f"{type(exc).__name__}: {exc}"

        upserted = 0
        if rows and not args.dry_run:
            async with conn.transaction():
                await conn.executemany(_UPSERT, rows)
            upserted = len(rows)

        if run_id is not None:
            await conn.execute(
                """
                UPDATE dhansetu.ingestion_runs
                   SET finished_at = now(), rows_fetched = $2, rows_upserted = $3,
                       http_status = $4, ok = $5, error = $6
                 WHERE run_id = $1
                """,
                run_id,
                len(rows),
                upserted,
                status,
                error is None and bool(rows),
                error,
            )

        observed = sum(1 for r in rows if not r[6])
        print(f"districts      {len(districts)}")
        print(f"rows fetched   {len(rows)}  ({observed} observed, {len(rows) - observed} forecast)")
        print(f"rows upserted  {upserted}{'  (dry run)' if args.dry_run else ''}")
        if error:
            print(f"ERROR          {error}", file=sys.stderr)
            return 1

        # Read back through the view rather than the table, so the output proves
        # the thing the API will actually see.
        latest = await conn.fetch(
            """
            SELECT w.district_id, d.district, w.obs_date, w.rainfall_mm, w.temp_max_c,
                   w.humidity_pct, w.thi, w.provenance
            FROM dhansetu.v_weather_series w
            JOIN dhansetu.districts d USING (district_id)
            WHERE w.provenance = 'open_meteo' AND NOT w.is_forecast
              AND w.obs_date = (
                  SELECT MAX(obs_date) FROM dhansetu.weather_live WHERE NOT is_forecast
              )
            ORDER BY w.district_id
            """
        )
        if latest:
            print(f"\nlatest observed day ({latest[0]['obs_date']}), via v_weather_series:")
            for r in latest:
                thi = f"{r['thi']:.1f}" if r["thi"] is not None else "-"
                flag = " THI>78, dairy yield at risk" if r["thi"] and r["thi"] >= 78 else ""
                print(
                    f"  {r['district']:<11} rain {r['rainfall_mm']:>6} mm   "
                    f"max {r['temp_max_c']:>5}C   rh {r['humidity_pct']:>5}%   THI {thi:>5}{flag}"
                )
        return 0
    finally:
        await conn.close()


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
