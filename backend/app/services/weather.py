from app.core.db import get_pool

# Above roughly this, dairy yield measurably declines. Defined once, here, and
# applied in SQL so the API and any future consumer cannot disagree about it.
THI_DAIRY_STRESS = 78

# One row per calendar day, best source first. v_weather_series is a plain
# UNION ALL of three overlapping things, so without DISTINCT ON a single date can
# arrive up to three times:
#
#   1. a real observation                (weather_live,  is_forecast = false)
#   2. a synthetic panel row             (weather_daily, is_forecast = false)
#   3. a real forecast made days earlier (weather_live,  is_forecast = true)
#
# The synthetic panel runs to 2026-07-31 and the live pull reaches ~30 days back,
# so (1) and (2) genuinely collide today -- a 30-day window returned 46 rows
# before this. The ORDER BY encodes the preference: an observation beats a
# forecast, and a real reading beats a generated one. Nothing is deleted from
# weather_live to achieve it, so a superseded forecast is still on record as
# what was predicted.
_SERIES = """
SELECT DISTINCT ON (w.obs_date)
       w.district_id,
       d.district,
       d.state,
       w.obs_date,
       w.rainfall_mm,
       w.temp_max_c,
       w.humidity_pct,
       w.thi,
       (w.thi >= $2)  AS thi_dairy_stress,
       w.is_forecast,
       w.provenance
FROM dhansetu.v_weather_series w
JOIN dhansetu.districts d USING (district_id)
WHERE w.district_id = $1
  AND w.obs_date > CURRENT_DATE - $3::int
  AND ($4 OR NOT w.is_forecast)
ORDER BY w.obs_date,
         w.is_forecast,                        -- false (observed) wins
         (w.provenance = 'open_meteo') DESC    -- real wins over synthetic
"""


async def get_district_weather(
    district_id: int, days: int, include_forecast: bool
) -> list[dict]:
    """Daily weather for one district: exactly one row per day, best source first.

    Real Open-Meteo observations supersede the synthetic panel where both cover a
    date, so a caller can chart the result directly without deduplicating or
    double-counting rainfall. `provenance` says which source each day came from.

    Forecast rows are excluded by default -- `days` looks backwards, and mixing
    predictions into a history series is the kind of thing that quietly becomes a
    wrong number on a slide.
    """
    pool = get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            _SERIES, district_id, THI_DAIRY_STRESS, days, include_forecast
        )
    return [dict(row) for row in rows]


async def district_exists(district_id: int) -> bool:
    pool = get_pool()
    async with pool.acquire() as conn:
        return bool(
            await conn.fetchval(
                "SELECT 1 FROM dhansetu.districts WHERE district_id = $1", district_id
            )
        )
