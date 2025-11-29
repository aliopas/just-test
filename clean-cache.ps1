# Script to clean all cache and build files
Write-Host "Cleaning cache and build files..." -ForegroundColor Yellow

# Clean backend
if (Test-Path "backend/dist") {
    Remove-Item -Recurse -Force "backend/dist"
    Write-Host "✓ Cleaned backend/dist" -ForegroundColor Green
}

if (Test-Path "backend/.tsbuildinfo") {
    Remove-Item -Force "backend/.tsbuildinfo"
    Write-Host "✓ Cleaned backend/.tsbuildinfo" -ForegroundColor Green
}

# Clean frontend
if (Test-Path "frontend/dist") {
    Remove-Item -Recurse -Force "frontend/dist"
    Write-Host "✓ Cleaned frontend/dist" -ForegroundColor Green
}

if (Test-Path "frontend/node_modules/.vite") {
    Remove-Item -Recurse -Force "frontend/node_modules/.vite"
    Write-Host "✓ Cleaned frontend/node_modules/.vite" -ForegroundColor Green
}

if (Test-Path "frontend/.vite") {
    Remove-Item -Recurse -Force "frontend/.vite"
    Write-Host "✓ Cleaned frontend/.vite" -ForegroundColor Green
}

# Clean root cache
if (Test-Path "node_modules/.cache") {
    Remove-Item -Recurse -Force "node_modules/.cache"
    Write-Host "✓ Cleaned node_modules/.cache" -ForegroundColor Green
}

if (Test-Path ".vite") {
    Remove-Item -Recurse -Force ".vite"
    Write-Host "✓ Cleaned .vite" -ForegroundColor Green
}

Write-Host "`nCache cleaning completed!" -ForegroundColor Green

