from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel


class VoiceEntryResponse(BaseModel):
    voice_id: UUID
    enterprise_id: str
    channel: str
    detected_lang: str | None
    transcript: str | None
    request_id: str | None
    api_latency_ms: int | None
    error: str | None
    spoken_at: datetime
    amount: Decimal | None
    direction: str | None
    confidence: Decimal | None
    needs_review: bool
