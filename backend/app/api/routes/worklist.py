from fastapi import APIRouter, Depends

from app.core.deps import require_officer
from app.schemas.worklist import WorklistItem
from app.services.worklist import get_worklist

router = APIRouter(tags=["worklist"])


@router.get("/worklist", response_model=list[WorklistItem])
async def worklist(claims: dict = Depends(require_officer)) -> list[dict]:
    return await get_worklist(officer_id=claims["sub"])
