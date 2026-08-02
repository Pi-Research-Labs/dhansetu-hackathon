from fastapi import APIRouter, Depends, HTTPException

from app.core.deps import require_officer
from app.schemas.outcome import OutcomeRequest, OutcomeResponse
from app.services.outcome import record_outcome

router = APIRouter(tags=["outcome"])


@router.post("/outcome", response_model=OutcomeResponse)
async def outcome(
    payload: OutcomeRequest, claims: dict = Depends(require_officer)
) -> dict:
    try:
        outcome_id = await record_outcome(
            payload.task_id, payload.outcome, payload.intervention, payload.note_lang
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return {"outcome_id": outcome_id}
