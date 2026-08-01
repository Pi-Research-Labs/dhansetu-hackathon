import asyncpg

from app.core.db import get_pool


async def record_outcome(
    task_id: str, outcome: str, intervention: str | None, note_lang: str | None
) -> str:
    pool = get_pool()
    async with pool.acquire() as conn:
        try:
            return await conn.fetchval(
                "SELECT dhansetu.record_outcome($1, $2, $3, $4)",
                task_id,
                outcome,
                intervention,
                note_lang,
            )
        except asyncpg.PostgresError as exc:
            raise ValueError(str(exc)) from exc
