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

@app.on_event("startup")
async def startup_event():
    """
    Hook chạy khi server khởi động.
    Kiểm tra biến môi trường NGROK_TOKEN để mở tunnel nếu cần.
    """
    import os
    import sys
    import logging

    # Configure logging to ensure output appears in Uvicorn logs
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger("uvicorn.error")

    # Kiểm tra Key Grok (Ngrok Token)
    ngrok_token = os.getenv("NGROK_TOKEN")
    
    if ngrok_token:
        logger.info("[INFO] Detected NGROK_TOKEN. Initializing Tunnel...")
        try:
            from pyngrok import ngrok, conf
            
            # Cấu hình auth token
            conf.get_default().auth_token = ngrok_token
            
            # Mở tunnel HTTP port 3001
            public_url = ngrok.connect(3001).public_url
            
            logger.info(f"[SUCCESS] Ngrok Tunnel Created: {public_url}")
            logger.info(f"[INFO] API Docs at: {public_url}/docs")
            
        except Exception as e:
            logger.error(f"[ERROR] Failed to create Ngrok tunnel: {e}")
    else:
        logger.info("[INFO] No NGROK_TOKEN found. Running in Localhost mode only.")

@app.get("/")
def read_root():
    """
    Endpoint mặc định để kiểm tra server sống hay chết.
    """
    return {"status": "online", "message": "Server is running correctly!"}
