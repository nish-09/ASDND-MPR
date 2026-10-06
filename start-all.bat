@echo off
TITLE QueueLess MPR Demo Runner
echo ================================================================
echo   QueueLess — MPR / ASD & DevOps Practical Demo Launcher
echo ================================================================
echo.

echo [1/4] Running automated unit tests (Quality Gate)...
cd backend
call npm test
if %errorlevel% neq 0 (
    echo [ERROR] Unit tests failed!
    pause
    exit /b %errorlevel%
)
echo [OK] 24 Unit tests passed cleanly.
cd ..

echo.
echo [2/4] Starting Backend API Server (port 3000)...
start "QueueLess Backend API" cmd /k "cd backend && npm run dev"

echo.
echo [3/4] Starting Frontend Web Client (port 5173)...
start "QueueLess Frontend Web" cmd /k "cd frontend && npm run dev"

echo.
echo [4/4] Opening QueueLess in your default browser...
timeout /t 3 >nul
start http://localhost:5173

echo.
echo ================================================================
echo   QueueLess Services are LIVE!
echo   - Frontend: http://localhost:5173
echo   - Backend API: http://localhost:3000
echo   - Health Check: http://localhost:3000/health
echo   - Prometheus Metrics: http://localhost:3000/metrics
echo.
echo   Demo Logins (Password: password123):
echo   - Customer: customer1@example.com (Book & Check-In)
echo   - Staff:    staff1@smithclinic.com (Call Next & Serve)
echo   - Admin:    admin@queueless.com
echo ================================================================
echo.
pause
