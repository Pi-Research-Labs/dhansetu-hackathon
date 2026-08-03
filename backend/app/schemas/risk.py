from datetime import date
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel


class RiskFeatureVector(BaseModel):
    """The inputs a scoring model would consume. Field set mirrors
    `feature_snapshots` — this is the contract a real trained model would be
    handed; today it's filled from the stored snapshot, not recomputed."""

    net_buffer_days: Decimal | None
    dscr_annual: Decimal | None
    margin_gap_90d: Decimal | None
    cost_index_chg_90d: Decimal | None
    rev_index_chg_90d: Decimal | None
    dso_days: Decimal | None
    overdue_share: Decimal | None
    buyer_concentration: Decimal | None
    digital_share: Decimal | None
    informal_debt: int | None
    missed_emis_90d: int | None
    missed_emis_365d: int | None
    emi_burden_365d: Decimal | None
    inflow_cv_90d: Decimal | None
    outflow_inflow_90d: Decimal | None
    zero_inflow_days_30d: int | None
    thi_anomaly_90d: Decimal | None
    season_drop_3m: Decimal | None
    data_completeness: Decimal | None
    event_days_90d: int | None


class RiskPrediction(BaseModel):
    enterprise_id: str
    as_of: date
    risk_tier: str
    prob_stress: Decimal | None
    prob_missed_repayment: Decimal | None
    fused_score: Decimal | None
    forecast_net_90d_p10: Decimal | None
    forecast_net_90d_p50: Decimal | None
    forecast_net_90d_p90: Decimal | None
    reason_1: str | None
    reason_2: str | None
    reason_3: str | None
    model_id: str | None
    rule_version: str | None
    features: RiskFeatureVector
    source: Literal["precomputed_snapshot"]
    """Always "precomputed_snapshot" today: the score is read from the
    dataset's stored risk_assessments/feature_snapshots row, not produced by
    a live model. This field exists so callers can tell the difference the
    day a trained model actually starts serving — see
    app/services/risk_model.py."""
