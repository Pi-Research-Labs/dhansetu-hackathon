from typing import Literal

from pydantic import BaseModel

Outcome = Literal["stress_confirmed", "false_positive", "unreachable"]


class OutcomeRequest(BaseModel):
    task_id: str
    outcome: Outcome
    intervention: str | None = None
    note_lang: str | None = None


class OutcomeResponse(BaseModel):
    outcome_id: str
