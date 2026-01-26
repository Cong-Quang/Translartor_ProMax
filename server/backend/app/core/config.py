
from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    PROJECT_NAME: str = "Translartor ProMax Backend"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # CORS Configuration
    BACKEND_CORS_ORIGINS: list[str] = ["*"]  # In production, specific origins should be allowed

    # AI Worker Configuration
    AI_WORKER_KEY: str = "change_this_to_a_secure_key"

    class Config:
        case_sensitive = True

@lru_cache()
def get_settings():
    return Settings()
