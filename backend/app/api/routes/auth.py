from fastapi import APIRouter, HTTPException

from app.core.security import create_access_token
from app.schemas.auth import LoginRequest, TokenResponse
from app.services.auth import authenticate_merchant

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest) -> TokenResponse:
    merchant = await authenticate_merchant(payload.phone_number, payload.password)
    if merchant is None:
        raise HTTPException(status_code=401, detail="Invalid phone number or password")

    token = create_access_token(subject=merchant["enterprise_id"])
    return TokenResponse(
        access_token=token,
        enterprise_id=merchant["enterprise_id"],
        proprietor_name=merchant["proprietor_name"],
    )
