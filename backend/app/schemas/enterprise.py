from datetime import date, datetime
from decimal import Decimal
from typing import Any
from uuid import UUID

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
    savings_runway_days: Decimal | None
    dscr_proj_180d: Decimal | None
    forecast_net_180d_p10: Decimal | None
    forecast_net_180d_p50: Decimal | None
    forecast_net_180d_p90: Decimal | None


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


class DigitalVisibilityDay(BaseModel):
    enterprise_id: str
    event_date: date
    digital_share_pct: Decimal | None
    cash_share_pct: Decimal | None
    is_zero_txn_day: bool | None


class WeeklyCashflow(BaseModel):
    enterprise_id: str
    week_start: date
    week_end: date
    inflow: Decimal | None
    outflow: Decimal | None
    net: Decimal | None
    zero_txn_days: int | None


class ForecastConfidencePoint(BaseModel):
    enterprise_id: str
    origin_date: date
    horizon_days: int
    horizon_label: str | None
    horizon_end_date: date | None
    p10: Decimal | None
    p50: Decimal | None
    p90: Decimal | None
    confidence_score: Decimal | None
    confidence_label: str | None


class NetInflowHeatmapWeek(BaseModel):
    enterprise_id: str
    week_start: date
    week_end: date
    net_inflow: Decimal | None


class LedgerTransaction(BaseModel):
    """One real, itemised ledger entry (v_enterprise_transactions).

    Distinct from the daily aggregates elsewhere in this module: those blend
    the synthetic panel with live entries, this is live entries only, because
    the panel has no itemised transactions to show.
    """

    entry_id: UUID
    enterprise_id: str
    event_date: date
    recorded_at: datetime
    direction: str
    amount: Decimal
    category: str | None
    tender: str | None
    is_household: bool
    source: str
    confidence: Decimal | None
    voice_id: UUID | None
    # present only for voice/IVR entries — lets the app show what was said
    transcript: str | None
    detected_lang: str | None
    channel: str | None


class TransactionPage(BaseModel):
    enterprise_id: str
    total: int
    limit: int
    offset: int
    transactions: list[LedgerTransaction]


class DailyTotals(BaseModel):
    """Merchant home-screen figures for a single day.

    Totals are the synthetic panel plus live entries (see
    v_ledger_daily_effective); the live_* fields break out the merchant's own
    recorded share of that total.
    """

    enterprise_id: str
    event_date: date
    total_inflow: Decimal
    total_expenses: Decimal
    net: Decimal
    txn_count: int
    live_inflow: Decimal
    live_outflow: Decimal
    live_txn_count: int
    has_live_entries: bool
    # How many in vs out. Live entries only -- the synthetic panel has one
    # txn_count per day with no direction behind it. For any date after the
    # panel ends (2026-07-31), including today, everything is live and these
    # are the true counts.
    inflow_count: int
    outflow_count: int


class LedgerEntryCreate(BaseModel):
    """A transaction the merchant (or an officer sitting with them) typed in.

    No voice_id and no extraction: a typed amount was never guessed at, so it
    carries confidence 1.0 and skips the review queue entirely.
    """

    direction: str
    amount: Decimal
    category: str
    # defaults to today in the route -- a merchant recording a sale means
    # today unless they say otherwise
    event_date: date | None = None
    tender: str | None = None
    is_household: bool = False
