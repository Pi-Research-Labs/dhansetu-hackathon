from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "DhanSetu API"
    api_v1_prefix: str = "/api/v1"
    cors_origins: list[str] = ["*"]

    database_url: str = "postgresql://localhost/dhansetu"
    jwt_secret: str = "dev-only-change-me"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24

    class Config:
        env_file = ".env"


settings = Settings()
