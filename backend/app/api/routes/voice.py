from datetime import UTC, datetime

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile

from app.core.deps import require_merchant
from app.schemas.voice import VoiceEntryResponse
from app.services.voice import create_voice_entry

router = APIRouter(tags=["voice"])

_DEFAULT_SAMPLE_RATE = {"ivr": 8000, "app": 16000, "assisted": 16000}


@router.post("/voice/entries", response_model=VoiceEntryResponse)
async def submit_voice_entry(
    file: UploadFile = File(...),
    channel: str = Form("app"),
    device_id: str | None = Form(None),
    spoken_at: datetime | None = Form(None),
    audio_sample_rate: int | None = Form(None),
    claims: dict = Depends(require_merchant),
) -> dict:
    if channel not in _DEFAULT_SAMPLE_RATE:
        raise HTTPException(status_code=422, detail="channel must be app, ivr, or assisted")

    audio_bytes = await file.read()
    result = await create_voice_entry(
        enterprise_id=claims["sub"],
        audio_bytes=audio_bytes,
        filename=file.filename or "audio.wav",
        channel=channel,
        device_id=device_id,
        spoken_at=spoken_at or datetime.now(UTC),
        audio_sample_rate=audio_sample_rate or _DEFAULT_SAMPLE_RATE[channel],
    )
    if result.get("error"):
        raise HTTPException(status_code=502, detail=f"Sarvam transcription failed: {result['error']}")
    return result
