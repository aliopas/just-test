# Start Next.js dev server
Set-Location $PSScriptRoot
Write-Host "Starting Next.js dev server on port 3002..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; npm run dev" -WindowStyle Minimized
Write-Host "Dev server starting in background..." -ForegroundColor Yellow
Write-Host "Waiting 10 seconds for server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 10
Write-Host "Server should be running now. Check http://localhost:3002" -ForegroundColor Green

