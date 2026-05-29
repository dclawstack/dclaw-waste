from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    app_name: str = "DClaw Waste"
    app_env: str = "dev"
    debug: bool = True

    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/dclaw_waste"

    # JWT
    secret_key: str = "change-me-in-production-use-openssl-rand-hex-32"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24  # 24 hours

    # AI
    openrouter_api_key: str = ""
    openrouter_model: str = "mistralai/mistral-7b-instruct"

    # Stripe (optional — invoices work without it)
    stripe_api_key: str = ""
    stripe_success_url: str = "http://localhost:3056/invoices?paid=1"
    stripe_cancel_url: str = "http://localhost:3056/invoices"

    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
