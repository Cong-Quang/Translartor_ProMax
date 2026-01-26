@echo off
setlocal
title Translartor ProMax - Unified Launcher

echo ==================================================
echo      Translartor ProMax - Environment Check
echo ==================================================
echo.

:: 1. Kiem tra Node.js
echo [1/3] Dang kiem tra Node.js...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [LOI] Khong tim thay Node.js! 
    echo Vui long tai va cai dat tai: https://nodejs.org/
    pause
    exit /b 1
)
node -v
echo [OK] Node.js da san sang.

:: 2. Kiem tra Python
echo.
echo [2/3] Dang kiem tra Python...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [LOI] Khong tim thay Python!
    echo Vui long cai dat Python va tick vao "Add Python to PATH".
    pause
    exit /b 1
)
python --version
echo [OK] Python da san sang.

:: 3. Don dep cong
echo.
echo [3/3] Dang don dep cong 3000, 3001...
powershell -Command "Get-NetTCPConnection -LocalPort 3000, 3001 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }"
echo [OK] Cac cong da duoc giai phong.

echo.
echo ==================================================
echo      Moi truong hop le. Dang khoi chay...
echo ==================================================
echo.

:: Chay launcher bang Node.js
node launcher.js

echo.
echo [INFO] He thong da dung.
pause
