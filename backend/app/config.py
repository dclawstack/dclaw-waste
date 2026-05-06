from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str = "postgresql+psycopg2://user:pass@localhost/dclaw_waste"
    debug: bool = False

    class Config:
        env_prefix = "DCLAW_WASTE_"

settings = Settings()
