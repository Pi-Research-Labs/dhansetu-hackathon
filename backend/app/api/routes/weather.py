from fastapi import APIRouter, Depends, HTTPException, Query

from app.core.deps import get_token_claims
from app.schemas.weather import WeatherDay
from app.services.weather import district_exists, get_district_weather

router = APIRouter(tags=["weather"])


@router.get("/weather/{district_id}", response_model=list[WeatherDay])
async def district_weather(
    district_id: int,
    days: int = Query(30, ge=1, le=400, description="trailing window in days"),
    include_forecast: bool = Query(False, description="also return forecast rows"),
    claims: dict = Depends(get_token_claims),
) -> list[dict]:
    """Daily weather for one of the six districts, real where we have it.

    Reads v_weather_series, which unions the real Open-Meteo observations in
    weather_live with the synthetic weather_daily panel and labels every row with
    a `provenance`. This is the read path for
    database/ingest_open_meteo.py -- before it, nothing in the API touched
    weather at all and the live weather tables had no consumer.

    Open to either role and not scoped to an enterprise: weather over a district
    is a public fact, not merchant data, and both the officer dashboard and the
    merchant app want it for the same district.

    `thi` is the temperature-humidity index, computed in the database from
    observed temperature and humidity. `thi_dairy_stress` marks the >= 78 days
    where dairy yield measurably declines -- the mechanism behind the dairy
    margin squeeze, as an observation rather than an assertion.
    """
    if not await district_exists(district_id):
        raise HTTPException(status_code=404, detail=f"No district {district_id}")
    return await get_district_weather(district_id, days, include_forecast)
