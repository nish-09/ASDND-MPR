# scripts/start-all.ps1
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "  QueueLess — MPR / ASD & DevOps Practical Demo Launcher" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/4] Running automated unit tests..." -ForegroundColor Yellow
Push-Location backend
npm test
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Tests failed!" -ForegroundColor Red
    Pop-Location
    exit $LASTEXITCODE
}
Write-Host "[OK] All 24 unit tests passed." -ForegroundColor Green
Pop-Location

Write-Host ""
Write-Host "[2/4] Launching Backend API (port 3000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev"

Write-Host ""
Write-Host "[3/4] Launching Frontend Web Client (port 5173)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host ""
Write-Host "[4/4] Opening browser at http://localhost:5173..." -ForegroundColor Yellow
Start-Sleep -Seconds 3
Start-Process "http://localhost:5173"

Write-Host ""
Write-Host "================================================================" -ForegroundColor Green
Write-Host "  QueueLess is READY FOR DEMO!" -ForegroundColor Green
Write-Host "  - Frontend:           http://localhost:5173" -ForegroundColor Cyan
Write-Host "  - Backend API:        http://localhost:3000" -ForegroundColor Cyan
Write-Host "  - Health Check:       http://localhost:3000/health" -ForegroundColor Cyan
Write-Host "  - Metrics:            http://localhost:3000/metrics" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Demo Credentials (password: password123):" -ForegroundColor White
Write-Host "  - Customer: customer1@example.com" -ForegroundColor White
Write-Host "  - Staff:    staff1@smithclinic.com" -ForegroundColor White
Write-Host "  - Admin:    admin@queueless.com" -ForegroundColor White
Write-Host "================================================================" -ForegroundColor Green
