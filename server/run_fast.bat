@echo off
REM Translartor ProMax Backend - Quick Run Script
REM This script runs the backend and cleans up cache on exit.

echo [INFO] Starting Translartor ProMax Backend...

REM Navigate to the script directory first
cd /d "%~dp0"
REM Navigate to the backend directory
cd backend

REM Run the application
python main.py

REM Cleanup Step (Runs after the application exits)
echo.
echo [INFO] Server stopped. Cleaning up cache...
FOR /d /r . %%d IN (__pycache__) DO @IF EXIST "%%d" rd /s /q "%%d"

echo [INFO] Cleanup complete.
pause
