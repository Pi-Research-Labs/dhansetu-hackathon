from fastapi import APIRouter, Depends, HTTPException, Query

from app.core.deps import require_officer
from app.schemas.task import OfficerTask
from app.services.task import get_officer_tasks

router = APIRouter(tags=["tasks"])

_STATUSES = {"open", "closed"}


@router.get("/tasks", response_model=list[OfficerTask])
async def officer_tasks(
    status: str | None = Query("open", description="open | closed | all"),
    enterprise_id: str | None = Query(None, description="only tasks for this enterprise"),
    claims: dict = Depends(require_officer),
) -> list[dict]:
    """The calling officer's field-visit tasks, oldest first.

    Exists because POST /outcome needs a real task_id and nothing served one.
    Task ids are sequential (TK00004), so a client cannot construct one from
    the enterprise or alert id -- the dashboard was building "TK-{alert_id}",
    which never matched a row and made every outcome submission a 400.

    Scoped to the caller's own tasks from the token, never a request param, so
    one officer cannot close another's visits.
    """
    if status is not None and status != "all" and status not in _STATUSES:
        raise HTTPException(
            status_code=422, detail=f"status must be one of {', '.join(sorted(_STATUSES))}, or all"
        )
    return await get_officer_tasks(
        officer_id=claims["sub"],
        status=None if status == "all" else status,
        enterprise_id=enterprise_id,
    )
