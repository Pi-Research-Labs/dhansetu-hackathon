from datetime import date
from decimal import Decimal

from pydantic import BaseModel


class WorklistItem(BaseModel):
    officer_id: str
    officer_name: str
    officer_lang: str | None
    enterprise_id: str
    proprietor_name: str | None
    sub_type: str | None
    block: str | None
    preferred_lang: str | None
    preferred_channel: str | None
    as_of: date
    risk_tier: str
    score: Decimal
    net_buffer_days: Decimal | None
    reason_1: str | None
    reason_2: str | None
    reason_3: str | None
    low_visibility: bool | None
    credit_headroom: Decimal | None
    bridge_headroom: Decimal | None
    alert_id: str | None
    projected_shortfall: Decimal | None
    shortfall_week_of: str | None
    deadline_date: date | None
    rupees_at_risk: Decimal
    km_from_centre: Decimal | None
