import json

from app.core.db import get_pool


async def get_worklist(officer_id: str) -> list[dict]:
    pool = get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            "SELECT * FROM dhansetu.v_officer_worklist WHERE officer_id = $1",
            officer_id,
        )
        results = []
        for row in rows:
            item = dict(row)
            trend = item.get("weekly_trend")
            if isinstance(trend, str):
                item["weekly_trend"] = json.loads(trend)
            results.append(item)
        return results
