from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.api import api_router

# Khởi tạo ứng dụng FastAPI
app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    description="Backend Server Skeleton cho Translator ProMax. Bao gồm Auth, Rooms, Streaming."
)

# Cấu hình CORS (Cho phép frontend truy cập)
# Trong môi trường dev, có thể để ["*"]
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include các router API
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def read_root():
    """
    Endpoint mặc định để kiểm tra server sống hay chết.
    """
    return {"status": "online", "message": "Server is running correctly!"}
