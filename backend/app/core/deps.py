from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt import PyJWTError

from app.core.security import decode_access_token

bearer_scheme = HTTPBearer()


def get_token_claims(credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)) -> dict:
    try:
        return decode_access_token(credentials.credentials)
    except PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


def require_merchant(claims: dict = Depends(get_token_claims)) -> dict:
    if claims.get("role") != "merchant":
        raise HTTPException(status_code=403, detail="Merchant token required")
    return claims


def require_officer(claims: dict = Depends(get_token_claims)) -> dict:
    if claims.get("role") != "officer":
        raise HTTPException(status_code=403, detail="Officer token required")
    return claims
