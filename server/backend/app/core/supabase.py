
from supabase import create_client, Client
from app.core.config import settings

class SupabaseManager:
    """
    Quản lý kết nối đến Supabase.
    Dùng để xác thực người dùng (Login/Register).
    """
    def __init__(self):
        pass

    def get_client(self) -> Client:
        """
        Tạo và trả về một instance client mới của Supabase.
        Điều này đảm bảo thread-safety và tránh leak session giữa các request.
        """
        try:
            return create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
        except Exception as e:
            print(f"Lỗi khi khởi tạo Supabase client: {e}")
            return None

supabase_manager = SupabaseManager()
