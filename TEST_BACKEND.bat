@echo off
cls
echo ========================================
echo  HealthChain Backend Test Script
echo ========================================
echo.

echo Test 1: Checking if backend is running...
echo ------------------------------------------
curl -s http://localhost:5000/health > nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ FAILED - Backend is NOT running on port 5000
    echo.
    echo Please start the backend first:
    echo   1. Open a new terminal
    echo   2. Run: START_BACKEND.bat
    echo   3. Wait for "Server running" message
    echo   4. Then run this test again
    echo.
    pause
    exit /b 1
)
echo ✅ PASSED - Backend is running!
echo.

echo Test 2: Health Check Endpoint...
echo ----------------------------------
curl -s http://localhost:5000/health
echo.
echo.

echo Test 3: Creating a test patient account...
echo --------------------------------------------
curl -X POST http://localhost:5000/api/auth/signup ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Test Patient\",\"email\":\"patient_%RANDOM%@test.com\",\"password\":\"password123\",\"role\":\"PATIENT\",\"age\":30}"
echo.
echo.

echo Test 4: Creating a test doctor account...
echo -------------------------------------------
curl -X POST http://localhost:5000/api/auth/signup ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Dr Test\",\"email\":\"doctor_%RANDOM%@test.com\",\"password\":\"password123\",\"role\":\"DOCTOR\",\"licenseId\":\"MD-12345\",\"specialization\":\"General Practitioner\"}"
echo.
echo.

echo ========================================
echo  Test Complete!
echo ========================================
echo.
echo If you see "success": true in the responses above,
echo then your backend is working correctly!
echo.
echo You can now:
echo   1. Start the frontend: START_FRONTEND.bat
echo   2. Open browser: http://localhost:5173
echo   3. Try logging in with the test accounts
echo.
pause
