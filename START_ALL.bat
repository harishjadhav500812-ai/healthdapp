@echo off
cls
echo ========================================
echo    HealthChain DApp - Complete Startup
echo ========================================
echo.
echo This will start both Backend and Frontend servers
echo.

REM Check if we're in the right directory
if not exist "backend\package.json" (
    echo ERROR: backend folder not found!
    echo Please run this script from the project root directory.
    echo.
    pause
    exit /b 1
)

if not exist "frontend\package.json" (
    echo ERROR: frontend folder not found!
    echo Please run this script from the project root directory.
    echo.
    pause
    exit /b 1
)

echo ========================================
echo  Step 1: Starting Backend Server
echo ========================================
echo.

REM Start backend in a new window
start "HealthChain Backend" cmd /k "cd backend && npm run dev"

echo Backend server is starting in a new window...
echo Waiting 5 seconds for backend to initialize...
echo.

REM Wait for backend to start
timeout /t 5 /nobreak >nul

echo Testing backend connection...
curl -s http://localhost:5000/health >nul 2>&1
if errorlevel 1 (
    echo WARNING: Backend may still be starting...
    echo Please check the Backend window for status.
    timeout /t 3 /nobreak >nul
) else (
    echo Backend is running successfully!
)

echo.
echo ========================================
echo  Step 2: Starting Frontend Server
echo ========================================
echo.

REM Start frontend in a new window
start "HealthChain Frontend" cmd /k "cd frontend && npm run dev"

echo Frontend server is starting in a new window...
echo.

echo ========================================
echo  Startup Complete!
echo ========================================
echo.
echo Two new windows have been opened:
echo   1. Backend Server  - http://localhost:5000
echo   2. Frontend Server - http://localhost:5173
echo.
echo Wait a few seconds, then open your browser to:
echo   http://localhost:5173
echo.
echo To stop the servers:
echo   - Close both command windows
echo   - Or press Ctrl+C in each window
echo.
echo ========================================
echo.

REM Wait a bit then try to open browser
timeout /t 8 /nobreak >nul

echo Opening browser...
start http://localhost:5173

echo.
echo Browser should open automatically.
echo If not, manually open: http://localhost:5173
echo.
echo This window can now be closed.
echo.
pause
