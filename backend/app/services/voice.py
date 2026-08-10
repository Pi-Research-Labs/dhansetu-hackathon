"""Sarvam speech-to-text integration for the voice ledger.

Sarvam's sync REST contract (verified against docs.sarvam.ai, not guessed):
  POST https://api.sarvam.ai/speech-to-text
  header: api-subscription-key: <key>
  multipart fields: model, mode, file
  response: {"request_id", "transcript", "language_code"}
  max 30s audio per request; 8kHz (IVR) and 16kHz (app) both supported as-is.

Two things the sync API does NOT return, despite voice_entries having
columns for them: `language_probability` and `diarised_speaker` (diarization
is batch-API-only, for calls >30s with multiple speakers). Both are stored
NULL here rather than faked — see database/04_live_data.sql's comment on
why low-confidence rows must go to a human, not be silently trusted.

Amount/direction extraction below is a plain regex heuristic, not a model
call — Sarvam's structured-extraction path is its chat-completions API,
which this integration deliberately does not call yet (its exact endpoint
shape wasn't verified against raw docs, and guessing API shapes has bitten
this project before — see the Mappls thread).

This module transcribes and parses; it does NOT write to the ledger. The
regex reads an amount and a direction out of the transcript and returns them,
and the client shows that back to the merchant to confirm or correct before
anything is recorded. The confirmed entry is written by
POST /enterprise/{id}/transactions, which takes the voice_id so the ledger
row stays linked to the utterance that produced it.

That keeps a single write path into ledger_entries_live rather than two, and
means a regex guess is never recorded until a human agrees to it — which
matters when the guess is an amount of money and nobody may notice that
"panchaas" came back as 500.
"""

import json
import re
import time
from decimal import Decimal, InvalidOperation

import httpx

from app.core.config import settings
from app.core.db import get_pool

SARVAM_BASE_URL = "https://api.sarvam.ai"
SARVAM_MODEL = "saaras:v3"

# Same reason as the direction lists below: codemix transcripts spell the
# currency however the speaker said it, so "750 rupaye" has to count as
# money. A bare number with no currency marker still does not -- "aaj 15
# litre doodh becha" is a quantity, and reading it as Rs 15 would post a
# fabricated amount.
_CURRENCY = r"(?:₹|rs\.?|rupees?|rupay[ae]?|rupiya|rupaiya)"
_AMOUNT_RE = re.compile(
    rf"{_CURRENCY}\s*([\d,]+(?:\.\d{{1,2}})?)"
    rf"|([\d,]+(?:\.\d{{1,2}})?)\s*{_CURRENCY}",
    re.IGNORECASE,
)

# Direction now decides whether an utterance posts at all, so the romanised
# forms matter as much as the Devanagari ones: Sarvam's 'codemix' mode
# routinely returns Latin script for Hindi/Gujarati speech ("aaj 500 ka
# doodh becha"), and the Devanagari-only list missed every one of those --
# they parsed an amount, no direction, and fell through to the queue.
#
# English + romanised Hindi/Gujarati only. Native-script Gujarati is
# deliberately absent rather than guessed at; that, and the substring
# matching below (no word boundaries, so "aaya" hits inside longer words),
# are why this stays a stopgap until the LLM extractor replaces regex_v1.
_INFLOW_WORDS = (
    "received", "sold", "sale",
    "मिला", "मिले", "बिका", "बिक्री", "आया",
    "becha", "becha", "bechi", "bikri", "mila", "mile", "aaya", "jama",
    "vechyu", "vecha", "malya",
)
_OUTFLOW_WORDS = (
    "paid", "bought", "spent",
    "दिया", "ख़रीदा", "खरीदा", "भरा", "खर्च",
    "kharida", "kharidi", "kharcha", "diya", "diye", "bhara", "chukaya",
    "kharidyu", "apya", "chukavya",
)

class SarvamError(Exception):
    pass


async def transcribe(audio_bytes: bytes, filename: str, mode: str = "codemix") -> dict:
    started = time.monotonic()
    async with httpx.AsyncClient(timeout=35.0) as client:
        try:
            response = await client.post(
                f"{SARVAM_BASE_URL}/speech-to-text",
                headers={"api-subscription-key": settings.sarvam_api_key},
                data={"model": SARVAM_MODEL, "mode": mode},
                files={"file": (filename, audio_bytes)},
            )
        except httpx.HTTPError as exc:
            raise SarvamError(f"Sarvam request failed: {exc}") from exc
    latency_ms = int((time.monotonic() - started) * 1000)

    if response.status_code != 200:
        detail = response.text
        try:
            detail = response.json().get("error", {}).get("message", detail)
        except ValueError:
            pass
        raise SarvamError(f"Sarvam returned {response.status_code}: {detail}")

    body = response.json()
    return {
        "request_id": body.get("request_id"),
        "transcript": body.get("transcript"),
        "language_code": body.get("language_code"),
        "api_latency_ms": latency_ms,
    }


def extract_amount_direction(transcript: str | None) -> tuple[Decimal | None, str | None]:
    if not transcript:
        return None, None

    amount = None
    match = _AMOUNT_RE.search(transcript)
    if match:
        raw = (match.group(1) or match.group(2)).replace(",", "")
        try:
            amount = Decimal(raw)
        except InvalidOperation:
            amount = None

    lowered = transcript.lower()
    direction = None
    if any(word in transcript or word in lowered for word in _INFLOW_WORDS):
        direction = "inflow"
    elif any(word in transcript or word in lowered for word in _OUTFLOW_WORDS):
        direction = "outflow"

    return amount, direction


async def create_voice_entry(
    enterprise_id: str,
    audio_bytes: bytes,
    filename: str,
    channel: str,
    device_id: str | None,
    spoken_at,
    audio_sample_rate: int | None,
    mode: str = "codemix",
) -> dict:
    pool = get_pool()

    try:
        result = await transcribe(audio_bytes, filename, mode)
        error = None
    except SarvamError as exc:
        result = {"request_id": None, "transcript": None, "language_code": None, "api_latency_ms": None}
        error = str(exc)

    async with pool.acquire() as conn, conn.transaction():
        voice_row = await conn.fetchrow(
            """
            INSERT INTO dhansetu.voice_entries
                (enterprise_id, device_id, spoken_at, audio_sample_rate, channel,
                 sarvam_model, sarvam_mode, detected_lang, transcript, request_id,
                 api_latency_ms, error)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING voice_id, enterprise_id, channel, detected_lang, transcript,
                      request_id, api_latency_ms, error, spoken_at
            """,
            enterprise_id,
            device_id,
            spoken_at,
            audio_sample_rate,
            channel,
            SARVAM_MODEL,
            mode,
            result["language_code"],
            result["transcript"],
            result["request_id"],
            result["api_latency_ms"],
            error,
        )

        if error is not None:
            return {
                **dict(voice_row),
                "amount": None,
                "direction": None,
                "confidence": None,
                "needs_review": True,
            }

        amount, direction = extract_amount_direction(result["transcript"])
        confidence = Decimal("0.5") if amount is not None else None

        extraction_row = await conn.fetchrow(
            """
            INSERT INTO dhansetu.voice_extractions
                (voice_id, extractor, amount, direction, confidence, raw_response)
            VALUES ($1, 'regex_v1', $2, $3, $4, $5)
            RETURNING amount, direction, confidence, needs_review
            """,
            voice_row["voice_id"],
            amount,
            direction,
            confidence,
            json.dumps({"transcript": result["transcript"], "language_code": result["language_code"]}),
        )

    return {**dict(voice_row), **dict(extraction_row)}


async def get_review_queue(officer_id: str) -> list[dict]:
    pool = get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            "SELECT * FROM dhansetu.v_voice_review_queue WHERE officer_id = $1",
            officer_id,
        )
        return [dict(row) for row in rows]


async def submit_review(
    extraction_id: int,
    reviewed_by: str,
    reviewed_amount: Decimal,
    direction: str,
    category: str | None,
    is_household: bool,
    tender: str | None,
) -> dict | None:
    pool = get_pool()
    async with pool.acquire() as conn:
        async with conn.transaction():
            extraction = await conn.fetchrow(
                """
                UPDATE dhansetu.voice_extractions
                SET reviewed_by = $2, reviewed_amount = $3
                WHERE extraction_id = $1
                RETURNING voice_id
                """,
                extraction_id,
                reviewed_by,
                reviewed_amount,
            )
            if extraction is None:
                return None

            voice_entry = await conn.fetchrow(
                "SELECT enterprise_id, spoken_at FROM dhansetu.voice_entries WHERE voice_id = $1",
                extraction["voice_id"],
            )

            # The utterance may already be in the ledger: a full regex parse
            # posts immediately now, and review is verification after the
            # fact. Link to that row via corrects_entry instead of inserting
            # a second one, or confirming an entry would double-count it.
            # v_ledger_live_effective already excludes superseded and voided
            # rows, so this finds the currently-effective entry and chained
            # corrections keep working.
            corrects_entry = await conn.fetchval(
                "SELECT entry_id FROM dhansetu.v_ledger_live_effective WHERE voice_id = $1",
                extraction["voice_id"],
            )

            ledger_row = await conn.fetchrow(
                """
                INSERT INTO dhansetu.ledger_entries_live
                    (enterprise_id, event_date, recorded_at, direction, amount,
                     category, tender, is_household, source, voice_id, confidence,
                     corrects_entry)
                VALUES ($1, $2::timestamptz::date, now(), $3, $4, $5, $6, $7, 'voice', $8, 1.0, $9)
                RETURNING entry_id, enterprise_id, event_date, direction, amount
                """,
                voice_entry["enterprise_id"],
                voice_entry["spoken_at"],
                direction,
                reviewed_amount,
                category,
                tender,
                is_household,
                extraction["voice_id"],
                corrects_entry,
            )
    return dict(ledger_row)
