#!/bin/bash

# سكريبت اختبار تسجيل الدخول
# Usage: ./test-login.sh [backend-url]

# القيم الافتراضية
EMAIL="bacuratec2030@gmail.com"
PASSWORD="BACURA2030@@440"

# إذا تم تمرير URL كمعامل، استخدمه. وإلا استخدم القيمة الافتراضية
BACKEND_URL="${1:-https://investor-bacura.netlify.app}"

echo "=========================================="
echo "اختبار تسجيل الدخول"
echo "=========================================="
echo "البريد الإلكتروني: $EMAIL"
echo "URL السيرفر: $BACKEND_URL"
echo "=========================================="
echo ""

# تنفيذ طلب تسجيل الدخول
curl -X POST "$BACKEND_URL/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\"
  }" \
  -w "\n\nHTTP Status: %{http_code}\n" \
  -v

echo ""
echo "=========================================="
echo "انتهى الاختبار"
echo "=========================================="

