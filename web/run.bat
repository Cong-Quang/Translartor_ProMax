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

:: 2. Check Python 3.12
echo.
echo [2/4] Checking Python 3.12...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in PATH.
    echo Please install Python 3.12 from https://www.python.org/
    echo Opening download page...
    start https://www.python.org/downloads/
    pause
    exit /b 1
)
for /f "tokens=2 delims= " %%I in ('python --version') do set PYTHON_VER=%%I
echo Python version identified: %PYTHON_VER%
:: Simple check if starts with 3.12 (optional, strict check can be complex in batch)
echo %PYTHON_VER% | findstr /b "3.12" >nul
if %errorlevel% neq 0 (
    echo [WARNING] Python version is %PYTHON_VER%, but 3.12 was recommended.
    echo Proceeding anyway...
)

:: 3. Setup Backend
echo.
echo [3/4] Setting up Backend...
if not exist "backend\venv" (
    echo Creating Python virtual environment...
    python -m venv backend\venv
)

echo Activate venv and install requirements...
call backend\venv\Scripts\activate.bat
pip install -r backend\requirements.txt
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install backend requirements.
    pause
    exit /b 1
)

:: 4. Setup Frontend
echo.
echo [4/4] Setting up Frontend...
if not exist "frontend\node_modules" (
    echo Installing Frontend dependencies...
    cd frontend
    call npm install
    cd ..
)

echo.
echo ==================================================
echo      All checks passed. Starting Services...
echo ==================================================
echo.

:: Start Services
echo Starting services in a single window...
cd frontend
call npx concurrently --kill-others --names "BACKEND,FRONTEND" --prefix-colors "blue,magenta" "cd ../backend && venv\Scripts\activate && uvicorn main:app --reload --port 8000" "npm run dev -- --open"

echo.
echo Services stopped.
pause
