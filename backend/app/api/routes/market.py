from fastapi import APIRouter, Query

from app.schemas.market import MarketCategory, MarketIntelligenceDetail
from app.services.market import get_market_categories, get_market_intelligence

router = APIRouter(tags=["market-intelligence"])


@router.get("/market-intelligence/categories", response_model=list[MarketCategory])
async def market_categories(
    enterprise_id: str | None = Query(None, description="Optional merchant / enterprise ID to flag merchant's primary category")
) -> list[dict]:
    return await get_market_categories(enterprise_id)


@router.get("/market-intelligence", response_model=MarketIntelligenceDetail)
async def market_intelligence(
    sub_type: str | None = Query(None, description="Sub-type category name or ID"),
    enterprise_id: str | None = Query(None, description="Optional merchant / enterprise ID for merchant-scoped intelligence")
) -> dict:
    return await get_market_intelligence(sub_type, enterprise_id)

