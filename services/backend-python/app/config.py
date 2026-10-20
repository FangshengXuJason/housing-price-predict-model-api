from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    ML_API_URL: str = "http://localhost:8000"
    DATABASE_URL: str = "sqlite+aiosqlite:///./predictions.db"

    model_config = {
        "env_prefix": "",
        "case_sensitive": True,
    }


settings = Settings()
