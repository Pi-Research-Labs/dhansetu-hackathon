from datetime import date
from decimal import Decimal

from pydantic import BaseModel


class WeatherDay(BaseModel):
    """One district-day of weather, real or synthetic.

    `provenance` is the point of this shape: 'open_meteo' rows are real
    observations pulled by backend/scripts/ingest_open_meteo.py, 'synthetic' rows come
    from the generated panel. A caller can always tell which it is looking at
    rather than having to trust that everything is real.
    """

    district_id: int
    district: str | None
    state: str | None
    obs_date: date
    rainfall_mm: Decimal | None
    temp_max_c: Decimal | None
    humidity_pct: Decimal | None
    # Temperature-humidity index, computed in the database from observed
    # temperature and humidity rather than asserted.
    thi: Decimal | None
    # Above ~78 dairy yield measurably declines -- the mechanism behind the
    # dairy margin squeeze. Derived in SQL so the threshold has one definition.
    thi_dairy_stress: bool | None
    is_forecast: bool
    provenance: str
