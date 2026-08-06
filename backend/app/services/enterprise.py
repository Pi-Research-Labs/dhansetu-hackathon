from app.core.db import get_pool


async def get_enterprise_card(enterprise_id: str) -> dict | None:
    pool = get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            "SELECT * FROM dhansetu.v_enterprise_card WHERE enterprise_id = $1",
            enterprise_id,
        )
        return dict(row) if row else None


async def get_live_forecast(enterprise_id: str) -> list[dict]:
    pool = get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            "SELECT * FROM dhansetu.v_live_forecast WHERE enterprise_id = $1",
            enterprise_id,
        )
        return [dict(row) for row in rows]


async def get_receivables_ageing(enterprise_id: str) -> list[dict]:
    pool = get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            "SELECT * FROM dhansetu.v_receivables_ageing WHERE enterprise_id = $1",
            enterprise_id,
        )
        return [dict(row) for row in rows]


async def get_payment_mix(enterprise_id: str) -> dict | None:
    pool = get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            "SELECT * FROM dhansetu.v_merchant_payment_mix WHERE enterprise_id = $1",
            enterprise_id,
        )
        return dict(row) if row else None


async def get_digital_heatmap(enterprise_id: str) -> list[dict]:
    pool = get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            "SELECT * FROM dhansetu.v_enterprise_digital_heatmap WHERE enterprise_id = $1",
            enterprise_id,
        )
        return [dict(row) for row in rows]


async def get_weekly_cashflow(enterprise_id: str, weeks: int = 26) -> list[dict]:
    pool = get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT * FROM (
                SELECT * FROM dhansetu.v_enterprise_weekly_cashflow
                WHERE enterprise_id = $1
                ORDER BY week_start DESC
                LIMIT $2
            ) recent
            ORDER BY week_start ASC
            """,
            enterprise_id,
            weeks,
        )
        return [dict(row) for row in rows]


async def get_cashflow_forecast(enterprise_id: str) -> list[dict]:
    pool = get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            "SELECT * FROM dhansetu.v_enterprise_cashflow_forecast WHERE enterprise_id = $1",
            enterprise_id,
        )
        return [dict(row) for row in rows]


async def get_net_inflow_heatmap(enterprise_id: str, weeks: int = 14) -> list[dict]:
    pool = get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT * FROM (
                SELECT * FROM dhansetu.v_enterprise_net_inflow_heatmap
                WHERE enterprise_id = $1
                ORDER BY week_start DESC
                LIMIT $2
            ) recent
            ORDER BY week_start ASC
            """,
            enterprise_id,
            weeks,
        )
        return [dict(row) for row in rows]


async def get_latest_alert(enterprise_id: str) -> dict | None:
    pool = get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            SELECT * FROM dhansetu.v_alert_actions
            WHERE enterprise_id = $1
            ORDER BY raised_at DESC LIMIT 1
            """,
            enterprise_id,
        )
        if row is None:
            return None
        result = dict(row)
        actions = result.get("actions")
        if isinstance(actions, str):
            import json

            result["actions"] = json.loads(actions)
        return result
