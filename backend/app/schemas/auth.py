from pydantic import BaseModel


class LoginRequest(BaseModel):
    phone_number: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    enterprise_id: str
    proprietor_name: str


class OfficerTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    officer_id: str
    officer_name: str
    district_id: int
