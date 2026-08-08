from typing import Any
from pydantic import BaseModel


class MarketCategory(BaseModel):
    sub_type_id: str
    sub_type: str
    sector: str
    typical_daily_turnover: int | None = None
    is_merchant_primary: bool | None = False


class MarketRiskCard(BaseModel):
    risk_type: str
    detail: str
    severity: str


class MarketChartPoint(BaseModel):
    month: str
    price_index: float
    rainfall_mm: float


class MarketIntelligenceDetail(BaseModel):
    sub_type_id: str
    sub_type: str
    sector: str
    enterprise_id: str | None = None
    district: str | None = None
    tracked_commodity: str
    price_trend_12m_pct: float
    productivity_outlook: str
    seasonal_pattern: str
    chart_data: list[MarketChartPoint]
    risks: list[MarketRiskCard]

