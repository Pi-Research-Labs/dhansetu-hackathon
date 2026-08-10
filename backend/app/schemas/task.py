from datetime import date
from decimal import Decimal

from pydantic import BaseModel


class OfficerTask(BaseModel):
    """A field-visit task assigned to an officer.

    task_id is what POST /outcome needs. It cannot be derived from the
    enterprise or the alert -- ids are sequential (TK00004), so the only way to
    get a valid one is to read it from here.
    """

    task_id: str
    alert_id: str | None
    enterprise_id: str | None
    officer_id: str | None
    assigned_on: date | None
    priority_score: float | None
    status: str | None
    # Whether the alert behind this task is still open. Surfaced because most
    # open tasks in the panel hang off long-expired alerts, and a client
    # choosing a task needs to be able to tell the difference.
    alert_expires_at: date | None
    alert_live: bool | None
    # The alert that caused this task. A task is never raised on its own, so
    # these fields are what let a client say WHY the visit is on the list
    # instead of showing a bare task id.
    alert_raised_at: date | None
    alert_risk_tier: str | None
    alert_reason_1: str | None
    alert_reason_2: str | None
    alert_reason_3: str | None
    projected_shortfall: Decimal | None
    shortfall_week_of: str | None
    deadline_date: date | None
