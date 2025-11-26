@echo off
echo ========================================
echo   Starting HealthChain Backend Server
echo ========================================
echo.

cd backend

echo Checking if node_modules exists...
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
    echo.
)

echo Starting backend server on port 5000...
echo.
call npm start

pause
