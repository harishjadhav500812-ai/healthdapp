@echo off
cls
echo ========================================
echo    HealthChain Frontend Server
echo ========================================
echo.
echo Checking environment...
echo.

REM Check if we're in the frontend directory or root
if exist "frontend\package.json" (
    echo Detected root directory, navigating to frontend...
    cd frontend
) else if not exist "package.json" (
    echo ERROR: package.json not found!
    echo Please run this script from the project root or frontend directory.
    echo.
    pause
    exit /b 1
)

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing frontend dependencies...
    echo This may take a few minutes...
    echo.
    call npm install
    if errorlevel 1 (
        echo.
        echo ERROR: Failed to install dependencies!
        echo Please check your internet connection and try again.
        pause
        exit /b 1
    )
    echo.
    echo Dependencies installed successfully!
    echo.
)

REM Kill any process using port 5173
echo Checking if port 5173 is in use...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5173" ^| find "LISTENING"') do (
    echo Port 5173 is in use. Attempting to free it...
    taskkill /F /PID %%a >nul 2>&1
    timeout /t 2 >nul
)

echo.
echo ========================================
echo  Starting Frontend Server...
echo ========================================
echo.
echo Frontend will run on: http://localhost:5173
echo.
echo IMPORTANT: Make sure backend is running!
echo Backend should be on: http://localhost:5000
echo.
echo Press Ctrl+C to stop the server
echo.
echo ========================================
echo.

REM Start the server
call npm run dev

REM If server stops, pause to see any error messages
if errorlevel 1 (
    echo.
    echo ========================================
    echo  Server stopped with errors!
    echo ========================================
    echo.
    pause
)
