
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """
    Cấu hình cho toàn bộ ứng dụng.
    Chứa các biến môi trường và cài đặt chung.
    """
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Translator ProMax Server"
    
    # Cấu hình Supabase
    SUPABASE_URL: str = "https://hzsltpisskypgbrltlod.supabase.co"
    SUPABASE_KEY: str = "sb_publishable_WGUaze-j9uGDslWMrLxrBg_A-9nIBJ2"
    
    class Config:
        case_sensitive = True

settings = Settings()
