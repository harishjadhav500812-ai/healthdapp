@echo off
echo Killing process on port 5000...

FOR /F "tokens=5" %%P IN ('netstat -ano ^| findstr :5000 ^| findstr LISTENING') DO (
    echo Found process: %%P
    taskkill /PID %%P /F
)

echo Done! Port 5000 is now free.
pause
