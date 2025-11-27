Write-Host "========================================" -ForegroundColor Cyan
Write-Host "اختبار Story 3.4: رفع الملفات" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "تشغيل اختبارات Backend..." -ForegroundColor Yellow
npm test -- request.controller.test.ts --testNamePattern="presignAttachment"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "انتهى الاختبار" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

