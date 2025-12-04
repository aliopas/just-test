# Test Login Script - PowerShell
# Usage: .\test-login.ps1 [backend-url]

param(
    [string]$BackendUrl = "https://investor-bacura.netlify.app"
)

$email = "bacuratec2030@gmail.com"
$password = "BACURA2030@@440"

$body = @{
    email = $email
    password = $password
} | ConvertTo-Json

$uri = "$BackendUrl/api/v1/auth/login"

Write-Host "=========================================="
Write-Host "Testing Login"
Write-Host "=========================================="
Write-Host "Email: $email"
Write-Host "Backend URL: $BackendUrl"
Write-Host "Full URL: $uri"
Write-Host "=========================================="
Write-Host ""

try {
    $response = Invoke-WebRequest -Uri $uri -Method POST -Body $body -ContentType "application/json" -UseBasicParsing
    
    Write-Host "Status Code: $($response.StatusCode)" -ForegroundColor Green
    Write-Host ""
    Write-Host "Response Body:"
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
    Write-Host ""
    Write-Host "=========================================="
    Write-Host "Test Passed!" -ForegroundColor Green
    Write-Host "=========================================="
} catch {
    Write-Host "Error occurred:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host ""
        Write-Host "Response Body:" -ForegroundColor Red
        Write-Host $responseBody -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "=========================================="
    Write-Host "Test Failed" -ForegroundColor Red
    Write-Host "=========================================="
}

