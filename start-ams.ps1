Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "       Academy Management System (AMS) Launcher     " -ForegroundColor Yellow
Write-Host "       Excel-Powered Local Management Engine        " -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan

$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "`n[1/3] Starting Express Backend (Port 5000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$rootDir\backend'; npm start"

Start-Sleep -Seconds 3

Write-Host "[2/3] Starting Vite + React Frontend (Port 3000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$rootDir\frontend'; npm run dev"

Start-Sleep -Seconds 3

Write-Host "[3/3] Opening Browser..." -ForegroundColor Green
Start-Process "http://localhost:3000"

Write-Host "`n✅ AMS System is active!" -ForegroundColor Green
Write-Host "Primary Excel Database: $rootDir\database\Academy_Database.xlsx" -ForegroundColor White
Write-Host "Default Login:" -ForegroundColor White
Write-Host "  Email:    admin@ams.local" -ForegroundColor Yellow
Write-Host "  Password: admin123" -ForegroundColor Yellow

