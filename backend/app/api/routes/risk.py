from fastapi import APIRouter, Depends, HTTPException

from app.core.deps import get_token_claims
from app.schemas.risk import RiskPrediction
from app.services.risk_model import predict_risk

router = APIRouter(tags=["risk"])


@router.get("/risk/{enterprise_id}/predict", response_model=RiskPrediction)
async def risk_predict(enterprise_id: str, claims: dict = Depends(get_token_claims)) -> dict:
    if claims.get("role") == "merchant" and claims["sub"] != enterprise_id:
        raise HTTPException(status_code=403, detail="Cannot view another enterprise")

    prediction = await predict_risk(enterprise_id)
    if prediction is None:
        raise HTTPException(status_code=404, detail="Enterprise not found")
    return prediction
