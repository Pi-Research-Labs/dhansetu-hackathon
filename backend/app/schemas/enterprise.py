from datetime import date
from decimal import Decimal
from typing import Any

from pydantic import BaseModel


class EnterpriseCard(BaseModel):
    enterprise_id: str
    proprietor_name: str | None
    business_name: str | None
    age: int | None
    sub_type: str | None
    sector: str | None
    district: str | None
    state: str | None
    block: str | None
    preferred_lang: str | None
    preferred_channel: str | None
    shared_device: bool | None
    literacy: str | None
    officer_id: str | None
    baseline_turnover: Decimal | None
    is_named_persona: bool | None
    as_of: date
    risk_tier: str
    score: Decimal
    model_prob_stress: Decimal | None
    rule_score: Decimal | None
    buffer_days: Decimal | None
    net_buffer_days: Decimal | None
    dscr_annual: Decimal | None
    credit_headroom: Decimal | None
    suggested_max_emi: Decimal | None
    bridge_headroom: Decimal | None
    band_width: Decimal | None
    low_visibility: bool | None
    data_completeness: Decimal | None
    forecast_net_90d_p10: Decimal | None
    forecast_net_90d_p50: Decimal | None
    forecast_net_90d_p90: Decimal | None
    reason_1: str | None
    reason_2: str | None
    reason_3: str | None
    tier_cutoffs: str | None
    fusion_weights: str | None
    model_id: str | None
    rule_version: str | None
    margin_gap_90d: Decimal | None
    cost_index_chg_90d: Decimal | None
    rev_index_chg_90d: Decimal | None
    dso_days: Decimal | None
    overdue_share: Decimal | None
    buyer_concentration: Decimal | None
    zero_inflow_days_30d: int | None
    digital_share: Decimal | None
    informal_debt: int | None
    missed_emis_90d: int | None
    thi_anomaly_90d: Decimal | None
    season_drop_3m: Decimal | None


class ForecastPoint(BaseModel):
    enterprise_id: str
    origin_date: date
    horizon_days: int
    horizon_label: str | None
    p10: Decimal | None
    p50: Decimal | None
    p90: Decimal | None
    actual_net: Decimal | None
    is_out_of_time: bool | None
    is_live_forecast: bool | None
    horizon_end_date: date | None


class AlertActions(BaseModel):
    alert_id: str
    enterprise_id: str
    proprietor_name: str | None
    preferred_lang: str | None
    raised_at: date | None
    risk_tier: str | None
    projected_shortfall: Decimal | None
    shortfall_week_of: str | None
    deadline_date: date | None
    expires_at: date | None
    merchant_visible: bool | None
    exported_to_bureau: bool | None
    disputed_at: date | None
    reason_1: str | None
    reason_2: str | None
    reason_3: str | None
    credit_headroom: Decimal | None
    bridge_headroom: Decimal | None
    actions: list[dict[str, Any]] | None


class EnterpriseDetail(BaseModel):
    card: EnterpriseCard
    live_forecast: list[ForecastPoint]
    latest_alert: AlertActions | None


class ReceivablesAgeing(BaseModel):
    enterprise_id: str
    proprietor_name: str | None
    sector: str | None
    counterparty_type: str | None
    invoices: int
    total: Decimal | None
    outstanding: Decimal | None
    written_off: Decimal | None
    avg_days_to_cash: Decimal | None
    worst_days_to_cash: int | None
    write_off_pct: Decimal | None


class PaymentMix(BaseModel):
    enterprise_id: str
    proprietor_name: str | None
    sector: str | None
    district: str | None
    preferred_channel: str | None
    avg_upi_share: Decimal | None
    avg_wallet_share: Decimal | None
    avg_digital_share: Decimal | None
    avg_cash_share: Decimal | None
    recent_90d_digital_share: Decimal | None
    recent_90d_cash_share: Decimal | None
