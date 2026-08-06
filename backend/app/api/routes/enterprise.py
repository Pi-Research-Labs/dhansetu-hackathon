from fastapi import APIRouter, Depends, HTTPException, Query

from app.core.deps import get_token_claims
from app.schemas.enterprise import (
    DigitalVisibilityDay,
    EnterpriseDetail,
    ForecastConfidencePoint,
    NetInflowHeatmapWeek,
    PaymentMix,
    ReceivablesAgeing,
    WeeklyCashflow,
)
from app.services.enterprise import (
    get_cashflow_forecast,
    get_digital_heatmap,
    get_enterprise_card,
    get_latest_alert,
    get_live_forecast,
    get_net_inflow_heatmap,
    get_payment_mix,
    get_receivables_ageing,
    get_weekly_cashflow,
)

router = APIRouter(tags=["enterprise"])


def _check_access(claims: dict, enterprise_id: str) -> None:
    if claims.get("role") == "merchant" and claims["sub"] != enterprise_id:
        raise HTTPException(status_code=403, detail="Cannot view another enterprise")


@router.get("/enterprise/{enterprise_id}", response_model=EnterpriseDetail)
async def enterprise_detail(
    enterprise_id: str, claims: dict = Depends(get_token_claims)
) -> dict:
    _check_access(claims, enterprise_id)

    card = await get_enterprise_card(enterprise_id)
    if card is None:
        raise HTTPException(status_code=404, detail="Enterprise not found")

    live_forecast = await get_live_forecast(enterprise_id)
    latest_alert = await get_latest_alert(enterprise_id)
    return {"card": card, "live_forecast": live_forecast, "latest_alert": latest_alert}


@router.get("/enterprise/{enterprise_id}/receivables", response_model=list[ReceivablesAgeing])
async def enterprise_receivables(
    enterprise_id: str, claims: dict = Depends(get_token_claims)
) -> list[dict]:
    _check_access(claims, enterprise_id)
    return await get_receivables_ageing(enterprise_id)


@router.get("/enterprise/{enterprise_id}/payment-mix", response_model=PaymentMix)
async def enterprise_payment_mix(
    enterprise_id: str, claims: dict = Depends(get_token_claims)
) -> dict:
    _check_access(claims, enterprise_id)
    mix = await get_payment_mix(enterprise_id)
    if mix is None:
        raise HTTPException(status_code=404, detail="No ledger data for this enterprise")
    return mix


@router.get(
    "/enterprise/{enterprise_id}/digital-heatmap",
    response_model=list[DigitalVisibilityDay],
)
async def enterprise_digital_heatmap(
    enterprise_id: str, claims: dict = Depends(get_token_claims)
) -> list[dict]:
    _check_access(claims, enterprise_id)
    return await get_digital_heatmap(enterprise_id)


@router.get(
    "/enterprise/{enterprise_id}/weekly-cashflow",
    response_model=list[WeeklyCashflow],
)
async def enterprise_weekly_cashflow(
    enterprise_id: str,
    weeks: int = Query(26, ge=1, le=156),
    claims: dict = Depends(get_token_claims),
) -> list[dict]:
    _check_access(claims, enterprise_id)
    return await get_weekly_cashflow(enterprise_id, weeks)


@router.get(
    "/enterprise/{enterprise_id}/cashflow-forecast",
    response_model=list[ForecastConfidencePoint],
)
async def enterprise_cashflow_forecast(
    enterprise_id: str, claims: dict = Depends(get_token_claims)
) -> list[dict]:
    _check_access(claims, enterprise_id)
    rows = await get_cashflow_forecast(enterprise_id)
    if not rows:
        raise HTTPException(status_code=404, detail="No live forecast for this enterprise")
    return rows


@router.get(
    "/enterprise/{enterprise_id}/net-inflow-heatmap",
    response_model=list[NetInflowHeatmapWeek],
)
async def enterprise_net_inflow_heatmap(
    enterprise_id: str,
    weeks: int = Query(14),
    claims: dict = Depends(get_token_claims),
) -> list[dict]:
    # Literal[7, 14] as the Query type looked right but doesn't work: FastAPI
    # passes the raw query string straight to Pydantic's Literal validator
    # without str->int coercion here, so "7"/"14" fail against literal ints
    # 7/14 even though they're the only two intended values. Validating by
    # hand avoids relying on that coercion.
    if weeks not in (7, 14):
        raise HTTPException(status_code=422, detail="weeks must be 7 or 14")
    return await get_net_inflow_heatmap(enterprise_id, weeks)
