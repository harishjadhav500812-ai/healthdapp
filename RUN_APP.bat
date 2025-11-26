@echo off
cls
color 0A
echo.
echo ========================================
echo    HEALTHCHAIN DAPP - SIMPLE STARTER
echo ========================================
echo.
echo This script will:
echo   1. Kill any processes on ports 5000 and 5173
echo   2. Start the Backend server
echo   3. Start the Frontend server
echo   4. Open your browser
echo.
echo Press any key to continue...
pause > nul
cls

echo.
echo ========================================
echo  STEP 1: Cleaning up ports...
echo ========================================
echo.

echo Checking port 5000 (Backend)...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5000" ^| find "LISTENING"') do (
    echo   Killing process %%a on port 5000...
    taskkill /F /PID %%a >nul 2>&1
)

echo Checking port 5173 (Frontend)...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5173" ^| find "LISTENING"') do (
    echo   Killing process %%a on port 5173...
    taskkill /F /PID %%a >nul 2>&1
)

timeout /t 2 /nobreak >nul
echo   Ports cleared!
echo.

echo ========================================
echo  STEP 2: Starting Backend Server...
echo ========================================
echo.

if not exist "backend\package.json" (
    echo ERROR: backend folder not found!
    echo Are you in the correct directory?
    pause
    exit /b 1
)

cd backend

if not exist "node_modules" (
    echo Installing backend dependencies...
    call npm install
)

echo Starting backend in new window...
start "HEALTHCHAIN BACKEND - http://localhost:5000" cmd /k "npm run dev"

cd ..

echo Backend starting... waiting 8 seconds...
timeout /t 8 /nobreak >nul

echo Testing backend connection...
curl -s http://localhost:5000/health > nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo WARNING: Backend might still be starting...
    echo Check the backend window for any errors.
    echo.
    timeout /t 5 /nobreak >nul
) else (
    echo   Backend is running! ✓
)

echo.
echo ========================================
echo  STEP 3: Starting Frontend Server...
echo ========================================
echo.

if not exist "frontend\package.json" (
    echo ERROR: frontend folder not found!
    pause
    exit /b 1
)

cd frontend

if not exist "node_modules" (
    echo Installing frontend dependencies...
    call npm install
)

echo Starting frontend in new window...
start "HEALTHCHAIN FRONTEND - http://localhost:5173" cmd /k "npm run dev"

cd ..

echo Frontend starting... waiting 8 seconds...
timeout /t 8 /nobreak >nul

echo.
echo ========================================
echo  STEP 4: Opening Browser...
echo ========================================
echo.

echo Opening http://localhost:5173 in your browser...
timeout /t 3 /nobreak >nul
start http://localhost:5173

echo.
echo ========================================
echo           STARTUP COMPLETE!
echo ========================================
echo.
echo Two windows are now running:
echo.
echo   [WINDOW 1] Backend:  http://localhost:5000
echo   [WINDOW 2] Frontend: http://localhost:5173
echo.
echo Your browser should open automatically.
echo If not, manually open: http://localhost:5173
echo.
echo ========================================
echo  HOW TO USE:
echo ========================================
echo.
echo 1. Wait for the browser to load
echo 2. Click "Patient Portal" or "Doctor Portal"
echo 3. Click "Mint Identity" to create account
echo 4. Fill in the form and click "Generate Block"
echo.
echo Test Accounts:
echo   Patient: patient@test.com / password123
echo   Doctor:  doctor@test.com / password123
echo.
echo ========================================
echo  TO STOP THE SERVERS:
echo ========================================
echo.
echo   - Close the backend window
echo   - Close the frontend window
echo   - Or press Ctrl+C in each window
echo.
echo ========================================
echo.
echo This window can now be closed.
echo.
pause
