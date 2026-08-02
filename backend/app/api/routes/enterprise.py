from fastapi import APIRouter, Depends, HTTPException

from app.core.deps import get_token_claims
from app.schemas.enterprise import EnterpriseDetail
from app.services.enterprise import get_enterprise_card, get_latest_alert, get_live_forecast

router = APIRouter(tags=["enterprise"])


@router.get("/enterprise/{enterprise_id}", response_model=EnterpriseDetail)
async def enterprise_detail(
    enterprise_id: str, claims: dict = Depends(get_token_claims)
) -> dict:
    if claims.get("role") == "merchant" and claims["sub"] != enterprise_id:
        raise HTTPException(status_code=403, detail="Cannot view another enterprise")

    card = await get_enterprise_card(enterprise_id)
    if card is None:
        raise HTTPException(status_code=404, detail="Enterprise not found")

    live_forecast = await get_live_forecast(enterprise_id)
    latest_alert = await get_latest_alert(enterprise_id)
    return {"card": card, "live_forecast": live_forecast, "latest_alert": latest_alert}
