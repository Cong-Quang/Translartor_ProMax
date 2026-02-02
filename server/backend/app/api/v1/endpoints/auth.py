from fastapi import APIRouter, HTTPException, status
from app.schemas.auth import UserLogin, UserRegister, Token
from app.core.supabase import supabase_manager
from supabase_auth.errors import AuthApiError

router = APIRouter()

@router.post("/login", response_model=Token)
async def login(user_data: UserLogin):
    """
    API Đăng nhập.
    """
    client = supabase_manager.get_client()
    if not client:
        raise HTTPException(status_code=500, detail="Lỗi kết nối database")

    try:
        # Đăng nhập bằng email/password
        response = client.auth.sign_in_with_password({
            "email": user_data.email, 
            "password": user_data.password
        })
        
        session = response.session
        if not session:
             raise HTTPException(status_code=401, detail="Đăng nhập thất bại")

        return {
            "access_token": session.access_token,
            "token_type": "bearer"
        }
    except AuthApiError as e:
        raise HTTPException(status_code=400, detail=f"Lỗi xác thực: {e.message}")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/register", response_model=Token)
async def register(user_data: UserRegister):
    """
    API Đăng ký.
    Tại user auth và record trong bảng `profiles`.
    """
    client = supabase_manager.get_client()
    if not client:
         raise HTTPException(status_code=500, detail="Lỗi kết nối database")

    try:
        # 1. Đăng ký user mới bên Auth
        auth_response = client.auth.sign_up({
            "email": user_data.email,
            "password": user_data.password,
            "options": {
                "data": {
                    "full_name": user_data.full_name or user_data.email.split("@")[0]
                }
            }
        })
        
        user = auth_response.user
        if not user or not user.id:
             raise HTTPException(status_code=400, detail="Không thể tạo tài khoản")

        # 2. Tạo record trong bảng profiles (nếu chưa dùng trigger bên Supabase)
        # Lưu ý: Nếu bạn đã dùng Trigger DB để tự tạo profile khi insert auth.users thì bước này có thể bỏ qua.
        # Tuy nhiên, user yêu cầu "Tạo bảng người dùng" nên mình sẽ insert rõ ràng để đảm bảo.
        
        profile_data = {
            "id": user.id,
            "email": user_data.email,
            "username": user_data.email.split("@")[0], # Tạm lấy username từ email
            "full_name": user_data.full_name,
            "created_at": "now()"
        }

        # Supabase RLS policies cho phép insert nếu auth.uid() = id.
        # Nhưng khi sign_up xong, session có thể chưa active ngay hoặc client server đang dùng anon key.
        # Nếu dùng admin key thì bypass được RLS.
        # Với anon key, sau khi sign_up, ta thường tự động được log in (nếu email confirm tắt).
        # Nếu email confirm bật, ta không thể insert ngay nếu policy yêu cầu auth.uid().
        
        # Hãy thử insert. Nếu lỗi RLS thì cần handle. 
        # Cách an toàn nhất cho flow này là dùng Trigger Postgres phía DB.
        # NHƯNG, ở đây ta sẽ thử insert từ backend.
        
        try:
             client.table("profiles").insert(profile_data).execute()
        except Exception as insert_error:
            # Nếu lỗi insert profile (ví dụ duplicate), có thể warning thôi chứ không fail cả flow
            print(f"Warning inserting profile: {insert_error}")

        # Trả về token nếu có session (Login luôn sau khi Reg)
        session = auth_response.session
        if session:
            return {
                "access_token": session.access_token,
                "token_type": "bearer"
            }
        else:
             # Trường hợp cần confirm email
             raise HTTPException(status_code=201, detail="Đăng ký thành công. Vui lòng kiểm tra email để xác nhận.")
             
    except AuthApiError as e:
        raise HTTPException(status_code=400, detail=f"Lỗi đăng ký: {e.message}")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
