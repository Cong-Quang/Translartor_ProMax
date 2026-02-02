from pydantic import BaseModel

class UserLogin(BaseModel):
    """
    Schema dữ liệu đầu vào cho API đăng nhập.
    """
    email: str
    password: str

class UserRegister(BaseModel):
    """
    Schema dữ liệu đầu vào cho API đăng ký.
    """
    email: str
    password: str
    full_name: str | None = None

class Token(BaseModel):
    """
    Schema trả về token sau khi đăng nhập thành công.
    """
    access_token: str
    token_type: str
