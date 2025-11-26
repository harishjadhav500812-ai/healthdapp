@echo off
title HealthChain Backend Server - Auto Restart
color 0A

:start
cls
echo ========================================
echo    HealthChain Backend Server
echo    Auto-Restart Enabled
echo ========================================
echo.
echo Starting backend on port 5000...
echo.
echo If backend crashes, it will auto-restart
echo Press Ctrl+C twice to stop permanently
echo.
echo ========================================
echo.

REM Navigate to backend directory if not already there
if exist "package.json" (
    echo Already in backend directory
) else if exist "backend\package.json" (
    cd backend
) else (
    echo ERROR: Cannot find backend directory!
    pause
    exit /b 1
)

REM Kill any existing process on port 5000
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5000" ^| find "LISTENING"') do (
    echo Freeing port 5000...
    taskkill /F /PID %%a >nul 2>&1
)
timeout /t 2 /nobreak >nul

REM Start the backend server
echo [%date% %time%] Starting backend server...
call npm run dev

REM If server stops, wait and restart
echo.
echo ========================================
echo  Server stopped! Restarting in 5 seconds...
echo  Press Ctrl+C twice to cancel
echo ========================================
timeout /t 5
goto start
