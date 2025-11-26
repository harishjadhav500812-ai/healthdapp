@echo off
echo ========================================
echo  Starting HealthChain Frontend
echo ========================================
echo.

echo Checking if package.json exists...
if not exist "package.json" (
    echo ERROR: package.json not found!
    echo Please make sure you are in the frontend directory.
    pause
    exit /b 1
)

echo Installing dependencies if needed...
if not exist "node_modules" (
    echo Installing npm packages...
    call npm install
)

echo.
echo Starting frontend development server...
echo Frontend will run on: http://localhost:5173
echo Make sure backend is running on: http://localhost:5000
echo Press Ctrl+C to stop the server
echo.

call npm run dev

pause
