from app.core.db import get_pool


async def get_worklist(officer_id: str) -> list[dict]:
    pool = get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            "SELECT * FROM dhansetu.v_officer_worklist WHERE officer_id = $1",
            officer_id,
        )
        return [dict(row) for row in rows]
