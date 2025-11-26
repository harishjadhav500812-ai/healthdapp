@echo off
echo ========================================
echo   Starting HealthChain Frontend
echo ========================================
echo.

echo Checking if node_modules exists...
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
    echo.
)

echo Starting frontend development server...
echo Frontend will be available at: http://localhost:5173
echo.
call npm run dev

pause
