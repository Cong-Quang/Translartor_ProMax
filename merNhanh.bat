@echo off
title Git Merge: web -> main
echo ===========================================
echo DANG HOP NHAT NHANH 'WEB' VAO 'MAIN'
echo ===========================================

:: 1. Chuyen sang nhanh main
echo [*] Dang chuyen sang nhanh main...
git checkout main
if %ERRORLEVEL% NEQ 0 (
    echo [!] Loi: Khong the chuyen sang nhanh main. Hay kiem tra lai!
    pause
    exit /b
)

:: 2. Lay code moi nhat tu server
echo [*] Dang lay code moi nhat tu origin/main...
git pull origin main

:: 3. Thuc hien merge
echo [*] Dang hop nhat 'web' vao 'main'...
git merge web

:: 4. Kiem tra xung dot (conflict)
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [!!!] CO XUNG DOT (CONFLICT) XAY RA!
    echo [!!!] Hay mo VS Code de fix conflict thu cong, sau do moi Push.
    pause
    exit /b
)

:: 5. Hoi truoc khi Push
echo.
set /p choice="Merge thanh cong! Ban co muon Push len server luon khong? (y/n): "
if /i "%choice%"=="y" (
    echo [*] Dang Push code len main...
    git push origin main
    echo [OK] Da xong moi thu!
) else (
    echo [OK] Da merge xong o Local, chua Push.
)

pause