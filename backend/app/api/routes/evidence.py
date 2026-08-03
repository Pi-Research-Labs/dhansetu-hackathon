from fastapi import APIRouter, Depends, HTTPException

from app.core.deps import require_officer
from app.schemas.evidence import (
    AlertPrecision,
    DataProvenance,
    DistrictEvent,
    ForecastAccuracy,
    HeadroomByTier,
    LeadTimeSummary,
    ReasonCodeScorecard,
)
from app.services.evidence import (
    get_alert_precision,
    get_data_provenance,
    get_district_events,
    get_forecast_accuracy,
    get_headroom_by_tier,
    get_lead_time_summary,
    get_reason_code_scorecard,
)

router = APIRouter(prefix="/evidence", tags=["evidence"])


@router.get("/district-events", response_model=list[DistrictEvent])
async def district_events(claims: dict = Depends(require_officer)) -> list[dict]:
    return await get_district_events()


@router.get("/alert-precision", response_model=list[AlertPrecision])
async def alert_precision(claims: dict = Depends(require_officer)) -> list[dict]:
    return await get_alert_precision()


@router.get("/reason-code-scorecard", response_model=list[ReasonCodeScorecard])
async def reason_code_scorecard(claims: dict = Depends(require_officer)) -> list[dict]:
    return await get_reason_code_scorecard()


@router.get("/lead-time", response_model=LeadTimeSummary)
async def lead_time_summary(claims: dict = Depends(require_officer)) -> dict:
    summary = await get_lead_time_summary()
    if summary is None:
        raise HTTPException(status_code=404, detail="No lead-time data available")
    return summary


@router.get("/forecast-accuracy", response_model=list[ForecastAccuracy])
async def forecast_accuracy(claims: dict = Depends(require_officer)) -> list[dict]:
    return await get_forecast_accuracy()


@router.get("/headroom-by-tier", response_model=list[HeadroomByTier])
async def headroom_by_tier(claims: dict = Depends(require_officer)) -> list[dict]:
    return await get_headroom_by_tier()


@router.get("/data-provenance", response_model=list[DataProvenance])
async def data_provenance(claims: dict = Depends(require_officer)) -> list[dict]:
    return await get_data_provenance()
