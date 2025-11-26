@echo off
cls
color 0B
echo ========================================
echo    Starting HealthChain Frontend
echo ========================================
echo.

REM Check if we're in the right location
if exist "frontend\package.json" (
    echo Found frontend folder, navigating...
    cd frontend
) else if exist "package.json" (
    echo Already in frontend directory
) else (
    echo ERROR: Cannot find frontend folder!
    echo Please run this from the project root directory.
    echo.
    pause
    exit /b 1
)

echo.
echo Checking backend status...
curl -s http://localhost:5000/health >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ========================================
    echo   WARNING: Backend is NOT running!
    echo ========================================
    echo.
    echo The frontend needs the backend to work.
    echo.
    echo Please start the backend first:
    echo   1. Open another terminal window
    echo   2. Navigate to: backend folder
    echo   3. Run: npm run dev
    echo   4. Wait for "Server running on port: 5000"
    echo   5. Then run this script again
    echo.
    pause
    exit /b 1
)

echo Backend is running! [OK]
echo.
echo ========================================
echo   Starting Frontend Server...
echo ========================================
echo.
echo Frontend will be available at:
echo   http://localhost:5173
echo.
echo IMPORTANT: Keep this window OPEN!
echo Close this window to stop the frontend.
echo.
echo Press Ctrl+C to stop the server.
echo.
echo ========================================
echo.

REM Start the frontend server
call npm run dev

REM If it stops, pause to show errors
if errorlevel 1 (
    echo.
    echo ========================================
    echo   Frontend stopped with errors!
    echo ========================================
    echo.
    pause
)
