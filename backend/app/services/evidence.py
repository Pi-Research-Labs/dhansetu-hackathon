from app.core.db import get_pool


async def _fetch_all(query: str) -> list[dict]:
    pool = get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(query)
        return [dict(row) for row in rows]


async def get_district_events() -> list[dict]:
    return await _fetch_all(
        """
        SELECT * FROM dhansetu.v_district_event_watch
        WHERE is_district_event
        ORDER BY as_of DESC, pct_of_cohort DESC
        """
    )


async def get_alert_precision() -> list[dict]:
    return await _fetch_all("SELECT * FROM dhansetu.v_alert_precision")


async def get_reason_code_scorecard() -> list[dict]:
    return await _fetch_all(
        "SELECT * FROM dhansetu.v_reason_code_scorecard ORDER BY episodes DESC"
    )


async def get_lead_time_summary() -> dict | None:
    pool = get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow("SELECT * FROM dhansetu.v_lead_time_summary")
        return dict(row) if row else None


async def get_forecast_accuracy() -> list[dict]:
    return await _fetch_all(
        "SELECT * FROM dhansetu.v_forecast_accuracy ORDER BY horizon_days"
    )


async def get_headroom_by_tier() -> list[dict]:
    return await _fetch_all(
        """
        SELECT * FROM dhansetu.v_headroom_by_tier
        ORDER BY CASE risk_tier WHEN 'GREEN' THEN 1 WHEN 'AMBER' THEN 2 ELSE 3 END
        """
    )


async def get_data_provenance() -> list[dict]:
    return await _fetch_all(
        "SELECT * FROM dhansetu.v_data_provenance ORDER BY voice_captures DESC"
    )
