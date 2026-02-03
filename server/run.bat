REM Translartor ProMax Backend - Quick Run Script
REM This script runs the backend using Uvicorn
 
echo [INFO] Starting Translartor ProMax Backend...

REM ========================================================
REM Cấu hình NGROK KEY (Để trống nếu chạy Localhost thường)
REM Bỏ comment dòng dưới và điền key để tự động tạo tunnel
REM set NGROK_TOKEN=247k2KNesA9nMYxt77eLc9Wo1Fn_5bP5MGVmKH2W81rk4wgcw
REM ========================================================

REM Navigate to the script directory first
cd /d "%~dp0"
REM Navigate to the backend directory
cd backend

REM Check if venv exists, if not, creating it (Optional, but good practice)
IF NOT EXIST "venv" (
    echo [INFO] Creating virtual environment...
    python -m venv venv
)

REM Activate venv (Optional, windows usually finds global python if not activated, but better safe)
call venv\Scripts\activate

REM Install dependencies if needed
IF EXIST "requirements.txt" (
    echo [INFO] Installing requirements...
    pip install -r requirements.txt
)

REM Run the application using Uvicorn
echo [INFO] Lauching Server at http://0.0.0.0:3001
uvicorn app.main:app --host 0.0.0.0 --port 3001 --reload

REM Cleanup Step (Runs after the application exits)
echo.
echo [INFO] Server stopped.
pause
