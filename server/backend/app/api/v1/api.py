from fastapi import APIRouter
from app.api.v1.endpoints import auth, rooms, stream, colab

api_router = APIRouter()

# Đăng ký các router con
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(rooms.router, prefix="/rooms", tags=["Rooms"])
api_router.include_router(stream.router, prefix="/stream", tags=["Streaming"])
api_router.include_router(colab.router, prefix="/colab", tags=["Colab Integration"])
