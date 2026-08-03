"""Risk-scoring serving layer.

This is the seam where a real trained model plugs in later. `score(...)`
is the function to replace — everything above it (feature lookup, response
shape, auth in the route) is the permanent interface. Today `score(...)`
doesn't run a model at all: it reads the dataset's precomputed
`risk_assessments`/`feature_snapshots` row for the enterprise's latest
`as_of` and returns it in the shape a model's output would take. There is
no trained model artifact in this repo yet.
"""

from app.core.db import get_pool

FEATURE_COLUMNS = [
    "net_buffer_days",
    "dscr_annual",
    "margin_gap_90d",
    "cost_index_chg_90d",
    "rev_index_chg_90d",
    "dso_days",
    "overdue_share",
    "buyer_concentration",
    "digital_share",
    "informal_debt",
    "missed_emis_90d",
    "missed_emis_365d",
    "emi_burden_365d",
    "inflow_cv_90d",
    "outflow_inflow_90d",
    "zero_inflow_days_30d",
    "thi_anomaly_90d",
    "season_drop_3m",
    "data_completeness",
    "event_days_90d",
]


async def get_latest_snapshot(enterprise_id: str) -> dict | None:
    pool = get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            SELECT ra.enterprise_id, ra.as_of, ra.risk_tier, ra.prob_stress,
                   ra.prob_missed_repayment, ra.fused_score,
                   ra.forecast_net_90d_p10, ra.forecast_net_90d_p50,
                   ra.forecast_net_90d_p90, ra.reason_1, ra.reason_2,
                   ra.reason_3, ra.model_id, ra.rule_version,
                   fs.net_buffer_days, fs.dscr_annual, fs.margin_gap_90d,
                   fs.cost_index_chg_90d, fs.rev_index_chg_90d, fs.dso_days,
                   fs.overdue_share, fs.buyer_concentration, fs.digital_share,
                   fs.informal_debt, fs.missed_emis_90d, fs.missed_emis_365d,
                   fs.emi_burden_365d, fs.inflow_cv_90d, fs.outflow_inflow_90d,
                   fs.zero_inflow_days_30d, fs.thi_anomaly_90d,
                   fs.season_drop_3m, fs.data_completeness, fs.event_days_90d
            FROM dhansetu.v_latest_assessment ra
            LEFT JOIN dhansetu.feature_snapshots fs
                   ON fs.enterprise_id = ra.enterprise_id AND fs.as_of = ra.as_of
            WHERE ra.enterprise_id = $1
            """,
            enterprise_id,
        )
        return dict(row) if row else None


def score(snapshot: dict) -> dict:
    """The model boundary. Today: pass the stored score straight through.
    Swap this function's body for `model.predict_proba(features)` (or
    similar) once a trained artifact exists — callers don't need to change."""
    return {
        "prob_stress": snapshot["prob_stress"],
        "prob_missed_repayment": snapshot["prob_missed_repayment"],
        "fused_score": snapshot["fused_score"],
        "risk_tier": snapshot["risk_tier"],
    }


async def predict_risk(enterprise_id: str) -> dict | None:
    snapshot = await get_latest_snapshot(enterprise_id)
    if snapshot is None:
        return None

    scored = score(snapshot)
    features = {col: snapshot[col] for col in FEATURE_COLUMNS}

    return {
        "enterprise_id": snapshot["enterprise_id"],
        "as_of": snapshot["as_of"],
        "risk_tier": scored["risk_tier"],
        "prob_stress": scored["prob_stress"],
        "prob_missed_repayment": scored["prob_missed_repayment"],
        "fused_score": scored["fused_score"],
        "forecast_net_90d_p10": snapshot["forecast_net_90d_p10"],
        "forecast_net_90d_p50": snapshot["forecast_net_90d_p50"],
        "forecast_net_90d_p90": snapshot["forecast_net_90d_p90"],
        "reason_1": snapshot["reason_1"],
        "reason_2": snapshot["reason_2"],
        "reason_3": snapshot["reason_3"],
        "model_id": snapshot["model_id"],
        "rule_version": snapshot["rule_version"],
        "features": features,
        "source": "precomputed_snapshot",
    }
