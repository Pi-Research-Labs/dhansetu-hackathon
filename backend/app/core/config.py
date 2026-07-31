from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "DhanSetu API"
    api_v1_prefix: str = "/api/v1"
    cors_origins: list[str] = ["*"]

    class Config:
        env_file = ".env"


settings = Settings()
