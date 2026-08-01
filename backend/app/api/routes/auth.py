from fastapi import APIRouter, HTTPException

from app.core.security import create_access_token
from app.schemas.auth import LoginRequest, OfficerTokenResponse, TokenResponse
from app.services.auth import authenticate_merchant, authenticate_officer

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest) -> TokenResponse:
    merchant = await authenticate_merchant(payload.phone_number, payload.password)
    if merchant is None:
        raise HTTPException(status_code=401, detail="Invalid phone number or password")

    token = create_access_token(subject=merchant["enterprise_id"], role="merchant")
    return TokenResponse(
        access_token=token,
        enterprise_id=merchant["enterprise_id"],
        proprietor_name=merchant["proprietor_name"],
    )


@router.post("/officer-login", response_model=OfficerTokenResponse)
async def officer_login(payload: LoginRequest) -> OfficerTokenResponse:
    officer = await authenticate_officer(payload.phone_number, payload.password)
    if officer is None:
        raise HTTPException(status_code=401, detail="Invalid phone number or password")

    token = create_access_token(subject=officer["officer_id"], role="officer")
    return OfficerTokenResponse(
        access_token=token,
        officer_id=officer["officer_id"],
        officer_name=officer["officer_name"],
        district_id=officer["district_id"],
    )
