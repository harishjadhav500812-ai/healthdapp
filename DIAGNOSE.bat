@echo off
cls
color 0F
echo ========================================
echo   HealthChain System Diagnostics
echo ========================================
echo.
echo Running complete system check...
echo This will diagnose all issues.
echo.
pause

cls
echo ========================================
echo   STEP 1: Checking Project Structure
echo ========================================
echo.

if not exist "backend\package.json" (
    echo [X] FAIL - Backend folder not found!
    echo     Location: %CD%\backend
    echo     Action: Make sure you're in the project root
    set /a errors+=1
) else (
    echo [OK] Backend folder found
)

if not exist "frontend\package.json" (
    echo [X] FAIL - Frontend folder not found!
    echo     Location: %CD%\frontend
    set /a errors+=1
) else (
    echo [OK] Frontend folder found
)

echo.
pause

cls
echo ========================================
echo   STEP 2: Checking Node.js
echo ========================================
echo.

where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [X] FAIL - Node.js is NOT installed!
    echo     Download from: https://nodejs.org/
    set /a errors+=1
) else (
    echo [OK] Node.js is installed
    node --version
)

where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo [X] FAIL - npm is NOT installed!
    set /a errors+=1
) else (
    echo [OK] npm is installed
    npm --version
)

echo.
pause

cls
echo ========================================
echo   STEP 3: Checking Backend Dependencies
echo ========================================
echo.

if not exist "backend\node_modules" (
    echo [!] WARNING - Backend dependencies not installed
    echo     Attempting to install now...
    cd backend
    call npm install
    if %errorlevel% neq 0 (
        echo [X] FAIL - Could not install backend dependencies
        set /a errors+=1
    ) else (
        echo [OK] Backend dependencies installed successfully
    )
    cd ..
) else (
    echo [OK] Backend dependencies already installed
)

echo.
pause

cls
echo ========================================
echo   STEP 4: Checking Frontend Dependencies
echo ========================================
echo.

if not exist "frontend\node_modules" (
    echo [!] WARNING - Frontend dependencies not installed
    echo     Attempting to install now...
    cd frontend
    call npm install
    if %errorlevel% neq 0 (
        echo [X] FAIL - Could not install frontend dependencies
        set /a errors+=1
    ) else (
        echo [OK] Frontend dependencies installed successfully
    )
    cd ..
) else (
    echo [OK] Frontend dependencies already installed
)

echo.
pause

cls
echo ========================================
echo   STEP 5: Checking Ports
echo ========================================
echo.

echo Checking port 5000 (Backend)...
netstat -ano | findstr :5000 | findstr LISTENING >nul 2>&1
if %errorlevel% equ 0 (
    echo [!] WARNING - Port 5000 is already in use
    echo     Attempting to free it...
    for /f "tokens=5" %%a in ('netstat -aon ^| find ":5000" ^| find "LISTENING"') do (
        taskkill /F /PID %%a >nul 2>&1
    )
    timeout /t 2 /nobreak >nul
    echo [OK] Port 5000 freed
) else (
    echo [OK] Port 5000 is available
)

echo.
echo Checking port 5173 (Frontend)...
netstat -ano | findstr :5173 | findstr LISTENING >nul 2>&1
if %errorlevel% equ 0 (
    echo [!] WARNING - Port 5173 is already in use
    echo     Attempting to free it...
    for /f "tokens=5" %%a in ('netstat -aon ^| find ":5173" ^| find "LISTENING"') do (
        taskkill /F /PID %%a >nul 2>&1
    )
    timeout /t 2 /nobreak >nul
    echo [OK] Port 5173 freed
) else (
    echo [OK] Port 5173 is available
)

echo.
pause

cls
echo ========================================
echo   STEP 6: Testing Backend Startup
echo ========================================
echo.

echo Starting backend server...
echo (This window will close if successful)
echo.

cd backend
start /B npm run dev
cd ..

echo Waiting 10 seconds for backend to start...
timeout /t 10 /nobreak

echo.
echo Testing backend connection...
curl -s http://localhost:5000/health >nul 2>&1
if %errorlevel% neq 0 (
    echo [X] FAIL - Backend is NOT responding on port 5000
    echo.
    echo Possible issues:
    echo   1. MongoDB connection failed
    echo   2. Environment variables missing
    echo   3. Port 5000 blocked by firewall
    echo   4. Backend crashed on startup
    echo.
    echo Check the backend terminal window for errors.
    set /a errors+=1
) else (
    echo [OK] Backend is responding!
    curl -s http://localhost:5000/health
)

echo.
pause

cls
echo ========================================
echo   STEP 7: Testing Backend API
echo ========================================
echo.

echo Testing signup endpoint...
curl -X POST http://localhost:5000/api/auth/signup -H "Content-Type: application/json" -d "{\"name\":\"Diagnostic Test\",\"email\":\"diagnostic_%RANDOM%@test.com\",\"password\":\"test123\",\"role\":\"PATIENT\",\"age\":25}" 2>nul
if %errorlevel% neq 0 (
    echo.
    echo [X] FAIL - Signup endpoint not working
    set /a errors+=1
) else (
    echo.
    echo [OK] Signup endpoint working!
)

echo.
pause

cls
echo ========================================
echo   STEP 8: Checking Frontend Files
echo ========================================
echo.

if not exist "frontend\api.ts" (
    echo [X] FAIL - frontend\api.ts not found
    set /a errors+=1
) else (
    echo [OK] frontend\api.ts exists
    echo     Checking API_URL configuration...
    findstr /C:"localhost:5000" "frontend\api.ts" >nul 2>&1
    if %errorlevel% neq 0 (
        echo [X] FAIL - api.ts is NOT pointing to port 5000
        echo     Please update API_URL to: http://localhost:5000/api
        set /a errors+=1
    ) else (
        echo [OK] api.ts correctly points to port 5000
    )
)

if not exist "frontend\index.tsx" (
    echo [X] FAIL - frontend\index.tsx not found
    set /a errors+=1
) else (
    echo [OK] frontend\index.tsx exists
)

if not exist "frontend\vite.config.ts" (
    echo [X] FAIL - frontend\vite.config.ts not found
    set /a errors+=1
) else (
    echo [OK] frontend\vite.config.ts exists
)

echo.
pause

cls
echo ========================================
echo   DIAGNOSTIC SUMMARY
echo ========================================
echo.

if defined errors (
    if %errors% gtr 0 (
        echo [!] ERRORS FOUND: %errors%
        echo.
        echo Please review the errors above and fix them.
        echo.
        goto :troubleshooting
    )
)

echo [OK] All checks passed!
echo.
echo ========================================
echo   NEXT STEPS:
echo ========================================
echo.
echo 1. Backend is running on port 5000
echo 2. Now start the frontend:
echo.
echo    Option A: Double-click START_FRONTEND.bat
echo    Option B: Run manually:
echo              cd frontend
echo              npm run dev
echo.
echo 3. Open browser to: http://localhost:5173
echo.
echo 4. Test connection with: test-connection.html
echo.
echo ========================================
pause
exit /b 0

:troubleshooting
echo ========================================
echo   TROUBLESHOOTING GUIDE
echo ========================================
echo.
echo ISSUE: Backend won't start
echo FIX:
echo   1. Check backend\.env file exists
echo   2. Verify MongoDB connection string
echo   3. Check firewall settings
echo   4. Try: cd backend ^&^& npm run dev
echo.
echo ISSUE: Frontend won't connect
echo FIX:
echo   1. Make sure backend is running first
echo   2. Verify frontend\api.ts has correct URL
echo   3. Check browser console for errors
echo   4. Try: cd frontend ^&^& npm run dev
echo.
echo ISSUE: "Access Denied" error
echo FIX:
echo   1. Backend must be running on port 5000
echo   2. Frontend must be running on port 5173
echo   3. Both servers must run simultaneously
echo   4. Use RUN_APP.bat to start both together
echo.
echo ISSUE: MongoDB connection failed
echo FIX:
echo   1. Check internet connection
echo   2. Verify MongoDB Atlas credentials
echo   3. Whitelist your IP in MongoDB Atlas
echo   4. Check backend\.env MONGO_URI
echo.
echo ========================================
echo.
echo Need more help?
echo 1. Open test-connection.html in browser
echo 2. Read QUICK_START.md
echo 3. Read TROUBLESHOOTING.md
echo.
pause
exit /b 1
