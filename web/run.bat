@echo off
setlocal
title Translartor ProMax Launcher

echo ==================================================
echo      Translartor ProMax - Auto Launcher
echo ==================================================
echo.

:: 1. Check Node.js
echo [1/4] Checking Node.js...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH.
    echo Please install Node.js LTS from https://nodejs.org/
    pause
    exit /b 1
)
node -v
echo Node.js found.

:: 2. Check Python 3.12 (Skipped - Backend Remote)

:: 4. Setup Frontend
echo.
echo [3/4] Setting up Frontend...
if not exist "frontend\node_modules" (
    echo Installing Frontend dependencies...
    cd frontend
    call npm install
    cd ..
)

echo.
echo ==================================================
echo      All checks passed. Starting Frontend...
echo ==================================================
echo.

:: Start Services
echo Starting frontend...
cd frontend
call npm run dev -- --open --port 3000

echo.
echo Services stopped.
pause
