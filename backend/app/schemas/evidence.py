from datetime import date
from decimal import Decimal

from pydantic import BaseModel


class DistrictEvent(BaseModel):
    as_of: date | None
    district: str | None
    sector: str | None
    mechanism: str | None
    flagged: int
    total_in_cohort: int
    pct_of_cohort: Decimal | None
    no_buffer: int
    visit_these_three: list[str] | None
    is_district_event: bool


class AlertPrecision(BaseModel):
    risk_tier: str
    visits: int
    confirmed: int
    confirm_pct: Decimal | None


class ReasonCodeScorecard(BaseModel):
    true_mechanism: str
    episodes: int
    top1_pct: Decimal | None
    top3_pct: Decimal | None


class LeadTimeSummary(BaseModel):
    episodes: int
    caught: int
    median_lead_days: Decimal | None
    min_lead_days: int | None
    max_lead_days: int | None


class ForecastAccuracy(BaseModel):
    horizon_days: int
    n: int
    mae: Decimal | None
    coverage_pct: Decimal | None


class HeadroomByTier(BaseModel):
    risk_tier: str
    n: int
    headroom_p25: Decimal | None
    headroom_p50: Decimal | None
    headroom_p75: Decimal | None
    bridge_p50: Decimal | None
    pct_with_headroom: Decimal | None


class DataProvenance(BaseModel):
    enterprise_id: str
    proprietor_name: str | None
    preferred_channel: str | None
    synthetic_ledger_days: int
    real_ledger_days: int
    voice_captures: int
    mean_asr_confidence: Decimal | None
