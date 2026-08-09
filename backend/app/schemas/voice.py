from datetime import date, datetime
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
    # Set when the regex parsed both an amount and a direction and the entry
    # went straight to the ledger. A partial parse leaves these null/false and
    # only the officer queue can post it.
    entry_id: UUID | None
    posted_to_ledger: bool


class VoiceReviewItem(BaseModel):
    voice_id: UUID
    enterprise_id: str
    proprietor_name: str | None
    preferred_lang: str | None
    officer_id: str | None
    spoken_at: datetime
    channel: str
    detected_lang: str | None
    language_probability: Decimal | None
    transcript: str | None
    extraction_id: int
    extractor: str
    amount: Decimal | None
    direction: str | None
    category: str | None
    confidence: Decimal | None


class VoiceReviewRequest(BaseModel):
    reviewed_amount: Decimal
    direction: str
    category: str | None = None
    is_household: bool = False
    tender: str | None = None


class LedgerEntryResponse(BaseModel):
    entry_id: UUID
    enterprise_id: str
    event_date: date
    direction: str
    amount: Decimal
