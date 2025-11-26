@echo off
cls
echo ========================================
echo    HealthChain Backend Server
echo ========================================
echo.
echo Checking environment...
echo.

REM Check if we're in the right directory
if not exist "backend\package.json" (
    echo ERROR: backend folder not found!
    echo Please run this script from the project root directory.
    echo.
    pause
    exit /b 1
)

REM Navigate to backend directory
cd backend

REM Check if .env file exists
if not exist ".env" (
    echo WARNING: .env file not found!
    echo Creating .env file with default configuration...
    echo.
    (
        echo # MongoDB Configuration
        echo MONGO_URI=mongodb+srv://harishjadhav27:sauYTlQjWIhpQGXp@kycv.orfjrga.mongodb.net/?appName=kycv
        echo.
        echo # Server Configuration
        echo PORT=5000
        echo NODE_ENV=development
        echo.
        echo # JWT Configuration
        echo JWT_SECRET=healthchain_super_secret_key_change_in_production_2024
        echo JWT_EXPIRE=7d
        echo.
        echo # CORS Configuration
        echo CORS_ORIGIN=http://localhost:5173
    ) > .env
    echo .env file created successfully!
    echo.
)

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing backend dependencies...
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

REM Kill any process using port 5000
echo Checking if port 5000 is in use...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5000" ^| find "LISTENING"') do (
    echo Port 5000 is in use. Attempting to free it...
    taskkill /F /PID %%a >nul 2>&1
    timeout /t 2 >nul
)

echo.
echo ========================================
echo  Starting Backend Server...
echo ========================================
echo.
echo Backend will run on: http://localhost:5000
echo Health Check: http://localhost:5000/health
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
