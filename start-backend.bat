@echo off
echo ========================================
echo  Starting HealthChain Backend Server
echo ========================================
echo.

cd backend

echo Checking if backend directory exists...
if not exist "package.json" (
    echo ERROR: backend/package.json not found!
    echo Please make sure you are in the correct directory.
    pause
    exit /b 1
)

echo Installing dependencies if needed...
if not exist "node_modules" (
    echo Installing npm packages...
    call npm install
)

echo.
echo Starting backend server...
echo Backend will run on: http://localhost:5000
echo Press Ctrl+C to stop the server
echo.

call npm run dev

pause
