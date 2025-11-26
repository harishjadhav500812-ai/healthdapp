@echo off
cls
color 0B
title HealthChain Frontend Server
echo ========================================
echo    HealthChain Frontend Server
echo ========================================
echo.
echo Starting frontend on port 5173...
echo.

REM Navigate to frontend folder
if exist "frontend\package.json" (
    cd frontend
) else if not exist "package.json" (
    echo ERROR: Cannot find frontend folder!
    pause
    exit /b 1
)

echo Backend should be running on: http://localhost:5000
echo Frontend will run on: http://localhost:5173
echo.
echo KEEP THIS WINDOW OPEN!
echo.
echo ========================================
echo.

REM Start frontend server
npm run dev

pause
