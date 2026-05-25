from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "Alternative Credit Intelligence Platform"
    ENVIRONMENT: str = "development"
    API_PREFIX: str = "/api"

    DATABASE_URL: str = (
        "postgresql+psycopg://postgres:postgres@localhost:5432/alternative_credit"
    )

    JWT_SECRET_KEY: str = "change-this-development-secret"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    BACKEND_CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"
    AUTO_CREATE_TABLES: bool = True

    ML_MODEL_DIR: str = "app/ml/artifacts"
    ML_MODEL_VERSION: str = "sprint2-credit-score-v1"
    ML_SYNTHETIC_TRAINING_ROWS: int = 1200
    ML_RANDOM_SEED: int = 42

    FRAUD_MODEL_DIR: str = "app/ml/fraud_artifacts"
    FRAUD_SCORE_THRESHOLD_MEDIUM: float = 0.35
    FRAUD_SCORE_THRESHOLD_HIGH: float = 0.60
    FRAUD_SCORE_THRESHOLD_CRITICAL: float = 0.80

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    @property
    def cors_origins(self) -> list[str]:
        return [
            origin.strip()
            for origin in self.BACKEND_CORS_ORIGINS.split(",")
            if origin.strip()
        ]


@lru_cache
def get_settings() -> Settings:
    return Settings()
