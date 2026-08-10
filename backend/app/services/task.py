from app.core.db import get_pool


async def get_officer_tasks(
    officer_id: str, status: str | None = "open", enterprise_id: str | None = None
) -> list[dict]:
    """Tasks assigned to this officer, most actionable first.

    Ordering is "live alert first, then oldest" rather than plain oldest-first.
    Oldest-first sounds right -- longest open is most overdue -- but it is wrong
    for this data: 50 of FO1's 59 open tasks hang off alerts that already
    expired, so the oldest open task is an abandoned one, not an urgent one.
    For ENT0031 it picked TK00112 (alert expired 2025-12-14) while the
    dashboard's risk panel displayed AL00116, still live until 2026-09-13 --
    an officer would have closed a stale visit believing they had logged the
    one on screen.

    So: tasks whose alert is still live come first, then tasks with no alert,
    then expired ones; oldest first within each group. priority_score and
    task_id break remaining ties so the first element is deterministic rather
    than whatever the planner returned.
    """
    pool = get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT t.task_id, t.alert_id, t.enterprise_id, t.officer_id,
                   t.assigned_on, t.priority_score, t.status,
                   a.expires_at    AS alert_expires_at,
                   (a.expires_at >= CURRENT_DATE) AS alert_live
            FROM dhansetu.officer_tasks t
            LEFT JOIN dhansetu.alerts a ON a.alert_id = t.alert_id
            WHERE t.officer_id = $1
              AND ($2::text IS NULL OR t.status = $2)
              AND ($3::text IS NULL OR t.enterprise_id = $3)
            ORDER BY CASE
                       WHEN a.expires_at >= CURRENT_DATE THEN 0  -- alert still live
                       WHEN a.expires_at IS NULL         THEN 1  -- no alert attached
                       ELSE 2                                    -- alert expired
                     END,
                     t.assigned_on ASC,
                     t.priority_score DESC NULLS LAST,
                     t.task_id ASC
            """,
            officer_id,
            status,
            enterprise_id,
        )
        return [dict(row) for row in rows]
