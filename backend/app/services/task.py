from app.core.db import get_pool


async def get_officer_tasks(
    officer_id: str, status: str | None = "open", enterprise_id: str | None = None
) -> list[dict]:
    """Tasks assigned to this officer.

    Oldest first: a visit task that has been open longest is the one most
    overdue, and it is also the deterministic pick when an enterprise has
    several open tasks (see the route). priority_score breaks ties so the
    order is stable rather than whatever the planner returns.
    """
    pool = get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT task_id, alert_id, enterprise_id, officer_id,
                   assigned_on, priority_score, status
            FROM dhansetu.officer_tasks
            WHERE officer_id = $1
              AND ($2::text IS NULL OR status = $2)
              AND ($3::text IS NULL OR enterprise_id = $3)
            ORDER BY assigned_on ASC, priority_score DESC NULLS LAST, task_id ASC
            """,
            officer_id,
            status,
            enterprise_id,
        )
        return [dict(row) for row in rows]
