@echo off
chcp 65001 >nul
title CyberNet Lab - Start
echo ========================================
echo   CyberNet Lab v4.0 - Starting...
echo ========================================
echo.

cd /d "%~dp0"

echo [1/4] Checking dependencies...
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
) else (
    echo Dependencies already installed.
)

echo.
echo [2/4] Building frontend...
call npm run build

echo.
echo [3/4] Starting backend...
echo Backend:  http://localhost:3000/
start "CyberNet Lab Backend" cmd /c "npm run backend"

echo.
echo [4/4] Waiting for backend to become available...
:wait_backend
timeout /t 2 /nobreak >nul
curl -s -o nul -w "%%{http_code}" http://localhost:3000/api/labs >nul 2>&1
if errorlevel 1 goto wait_backend

echo.
echo Starting frontend...
echo Frontend: http://localhost:5173/
echo.
echo Press Ctrl+C to stop
echo.

call npm run frontend

pause