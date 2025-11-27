@echo off
echo ========================================
echo اختبار Story 3.4: رفع الملفات
echo ========================================
echo.

echo تشغيل اختبارات Backend...
npm test -- request.controller.test.ts --testNamePattern="presignAttachment"

echo.
echo ========================================
echo انتهى الاختبار
echo ========================================
pause

