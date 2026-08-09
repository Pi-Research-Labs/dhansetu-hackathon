from datetime import date
from decimal import Decimal

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


async def get_transactions(
    enterprise_id: str,
    limit: int = 50,
    offset: int = 0,
    date_from: date | None = None,
    date_to: date | None = None,
    tender: str | None = None,
) -> dict:
    """Itemised real ledger entries, newest first.

    Returns the page plus the unpaged total so the client can drive
    infinite scroll without a second round trip.
    """
    pool = get_pool()
    async with pool.acquire() as conn:
        # Every filter is NULL-tolerant: an absent one means unbounded, rather
        # than the caller building a different statement per combination.
        # tender in particular has to filter server-side -- doing it in the
        # client would only filter the page in hand and leave `total` and the
        # paging describing the unfiltered set.
        where = """
            WHERE enterprise_id = $1
              AND ($2::date IS NULL OR event_date >= $2)
              AND ($3::date IS NULL OR event_date <= $3)
              AND ($4::text IS NULL OR tender = $4)
        """
        total = await conn.fetchval(
            f"SELECT COUNT(*) FROM dhansetu.v_enterprise_transactions {where}",
            enterprise_id,
            date_from,
            date_to,
            tender,
        )
        rows = await conn.fetch(
            f"""
            SELECT * FROM dhansetu.v_enterprise_transactions
            {where}
            ORDER BY event_date DESC, recorded_at DESC
            LIMIT $5 OFFSET $6
            """,
            enterprise_id,
            date_from,
            date_to,
            tender,
            limit,
            offset,
        )
        return {
            "enterprise_id": enterprise_id,
            "total": total or 0,
            "limit": limit,
            "offset": offset,
            "transactions": [dict(row) for row in rows],
        }


async def get_daily_totals(enterprise_id: str, on: date) -> dict:
    """One day's inflow/expense totals for the merchant home screen.

    A day with no activity has no row in the view; that is a quiet day, not a
    missing enterprise, so it is returned as zeros rather than a 404. The
    route still 404s if the enterprise itself does not exist.
    """
    pool = get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            SELECT * FROM dhansetu.v_enterprise_daily_totals
            WHERE enterprise_id = $1 AND event_date = $2
            """,
            enterprise_id,
            on,
        )
        if row is not None:
            return dict(row)
        return {
            "enterprise_id": enterprise_id,
            "event_date": on,
            "total_inflow": Decimal("0"),
            "total_expenses": Decimal("0"),
            "net": Decimal("0"),
            "txn_count": 0,
            "live_inflow": Decimal("0"),
            "live_outflow": Decimal("0"),
            "live_txn_count": 0,
            "has_live_entries": False,
            "inflow_count": 0,
            "outflow_count": 0,
        }


async def enterprise_exists(enterprise_id: str) -> bool:
    pool = get_pool()
    async with pool.acquire() as conn:
        return bool(
            await conn.fetchval(
                "SELECT 1 FROM dhansetu.enterprises WHERE enterprise_id = $1",
                enterprise_id,
            )
        )
