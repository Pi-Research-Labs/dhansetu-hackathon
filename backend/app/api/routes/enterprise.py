from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query

from app.core.deps import get_token_claims
from app.schemas.enterprise import (
    DailyTotals,
    DigitalVisibilityDay,
    EnterpriseDetail,
    ForecastConfidencePoint,
    LedgerEntryCreate,
    LedgerTransaction,
    NetInflowHeatmapWeek,
    PaymentMix,
    ReceivablesAgeing,
    TransactionPage,
    WeeklyCashflow,
)
from app.services.enterprise import (
    create_transaction,
    enterprise_exists,
    get_cashflow_forecast,
    get_daily_totals,
    get_digital_heatmap,
    get_enterprise_card,
    get_latest_alert,
    get_live_forecast,
    get_net_inflow_heatmap,
    get_payment_mix,
    get_receivables_ageing,
    get_transactions,
    get_weekly_cashflow,
)

router = APIRouter(tags=["enterprise"])


# Mirrors ledger_entries_live.tender's CHECK constraint. Validated here so a
# typo comes back as a 422 rather than an empty page that looks like "this
# merchant has no UPI transactions".
_TENDERS = {"cash", "upi", "wallet", "bank", "credit"}


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


@router.get(
    "/enterprise/{enterprise_id}/transactions",
    response_model=TransactionPage,
)
async def enterprise_transactions(
    enterprise_id: str,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    date_from: date | None = Query(None, description="inclusive lower bound on event_date"),
    date_to: date | None = Query(None, description="inclusive upper bound on event_date"),
    tender: str | None = Query(None, description="cash | upi | wallet | bank | credit"),
    claims: dict = Depends(get_token_claims),
) -> dict:
    _check_access(claims, enterprise_id)
    if date_from and date_to and date_from > date_to:
        raise HTTPException(status_code=422, detail="date_from must be on or before date_to")
    if tender is not None and tender not in _TENDERS:
        raise HTTPException(status_code=422, detail=f"tender must be one of {', '.join(sorted(_TENDERS))}")
    return await get_transactions(enterprise_id, limit, offset, date_from, date_to, tender)


@router.get(
    "/enterprise/{enterprise_id}/daily-totals",
    response_model=DailyTotals,
)
async def enterprise_daily_totals(
    enterprise_id: str,
    on: date | None = Query(None, description="day to total, defaults to today"),
    claims: dict = Depends(get_token_claims),
) -> dict:
    _check_access(claims, enterprise_id)
    # 404 on an unknown enterprise, but a real enterprise with a quiet day
    # gets zeros -- "you took nothing today" is a legitimate answer for a
    # home screen, and the panel ends before today in any case.
    if not await enterprise_exists(enterprise_id):
        raise HTTPException(status_code=404, detail="Enterprise not found")
    return await get_daily_totals(enterprise_id, on or date.today())


@router.post(
    "/enterprise/{enterprise_id}/transactions",
    response_model=LedgerTransaction,
    status_code=201,
)
async def create_enterprise_transaction(
    enterprise_id: str,
    payload: LedgerEntryCreate,
    claims: dict = Depends(get_token_claims),
) -> dict:
    """Record a transaction the merchant typed rather than spoke.

    Until now the only way into the ledger was to say it out loud: a merchant
    with a noisy shop, no confidence speaking to a phone, or simply a
    correction to make had nowhere to go. The schema always allowed for this
    ('manual'/'assisted' are in ledger_entries_live.source's CHECK, and the
    INSERT grant exists) -- only the route was missing.
    """
    _check_access(claims, enterprise_id)
    if not await enterprise_exists(enterprise_id):
        raise HTTPException(status_code=404, detail="Enterprise not found")

    if payload.direction not in ("inflow", "outflow"):
        raise HTTPException(status_code=422, detail="direction must be inflow or outflow")
    if payload.amount <= 0:
        raise HTTPException(status_code=422, detail="amount must be greater than 0")
    if not payload.category.strip():
        raise HTTPException(status_code=422, detail="category is required")
    if payload.tender is not None and payload.tender not in _TENDERS:
        raise HTTPException(status_code=422, detail=f"tender must be one of {', '.join(sorted(_TENDERS))}")

    event_date = payload.event_date or date.today()
    if event_date > date.today():
        raise HTTPException(status_code=422, detail="event_date cannot be in the future")

    # Who typed it, in the schema's own vocabulary: a merchant entering their
    # own book is 'manual'; an officer entering it sitting beside them is
    # 'assisted'. Taken from the token, never from the request body, so a
    # client cannot claim to be something it isn't.
    source = "assisted" if claims.get("role") == "officer" else "manual"

    return await create_transaction(
        enterprise_id=enterprise_id,
        direction=payload.direction,
        amount=payload.amount,
        category=payload.category.strip(),
        event_date=event_date,
        tender=payload.tender,
        is_household=payload.is_household,
        source=source,
    )
